"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  type Timestamp,
} from "firebase/firestore";
import { Pencil, Trash2, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { slugify } from "@/lib/slugify";
import type { Blog, Category } from "@/lib/types";
import ImageUpload from "@/components/dashboard/image-upload";
import RichTextEditor from "@/components/dashboard/rich-text-editor";

const monthNames = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "İyun",
  "İyul",
  "Avqust",
  "Sentyabr",
  "Oktyabr",
  "Noyabr",
  "Dekabr",
];

function formatDate(date: Date): string {
  return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateInputValue(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

type BlogForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage: string;
  date: string;
};

function makeEmptyForm(defaultCategory: string): BlogForm {
  return {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: defaultCategory,
    coverImage: "",
    date: toDateInputValue(new Date()),
  };
}

async function fetchBlogs(): Promise<Blog[]> {
  const blogsQuery = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(blogsQuery);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as Omit<Blog, "id" | "createdAt"> & {
      createdAt: Timestamp;
    };

    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt.toDate(),
    };
  });
}

async function fetchCategories(): Promise<Category[]> {
  const snapshot = await getDocs(collection(db, "categories"));
  return snapshot.docs.map((docSnap) => docSnap.data() as Category);
}

export default function BlogsAdminPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<BlogForm>(makeEmptyForm(""));
  const [isSlugTouched, setIsSlugTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [coverImageError, setCoverImageError] = useState("");

  async function loadBlogs() {
    const data = await fetchBlogs();
    setBlogs(data);
    setIsLoading(false);
  }

  useEffect(() => {
    Promise.all([fetchBlogs(), fetchCategories()]).then(
      ([blogsData, categoriesData]) => {
        setBlogs(blogsData);
        setCategories(categoriesData);
        setIsLoading(false);
      },
    );
  }, []);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }

  function categoryName(slug: string): string {
    return categories.find((category) => category.slug === slug)?.name ?? slug;
  }

  function openAddModal() {
    setIsEditing(false);
    setForm(makeEmptyForm(categories[0]?.slug ?? ""));
    setIsSlugTouched(false);
    setCoverImageError("");
    setIsModalOpen(true);
  }

  function openEditModal(blog: Blog) {
    setIsEditing(true);
    setForm({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      category: blog.category,
      coverImage: blog.coverImage,
      date: toDateInputValue(blog.createdAt),
    });
    setIsSlugTouched(true);
    setCoverImageError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  function handleTitleChange(value: string) {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: isSlugTouched ? prev.slug : slugify(value),
    }));
  }

  function handleSlugChange(value: string) {
    setIsSlugTouched(true);
    setForm((prev) => ({ ...prev, slug: value }));
  }

  function handleCoverImageChange(url: string) {
    setForm((prev) => ({ ...prev, coverImage: url }));
    if (url) setCoverImageError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const slug = form.slug.trim();
    if (!form.title.trim() || !slug || !form.category) return;

    if (!form.coverImage.trim()) {
      setCoverImageError("Əsas şəkil mütləqdir.");
      return;
    }

    setIsSaving(true);
    try {
      const data: Omit<Blog, "id"> = {
        title: form.title.trim(),
        slug,
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        category: form.category,
        coverImage: form.coverImage.trim(),
        createdAt: fromDateInputValue(form.date),
      };

      await setDoc(doc(db, "blogs", slug), data);
      await loadBlogs();
      setIsModalOpen(false);
      showToast("Yadda saxlanıldı");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(blog: Blog) {
    const confirmed = window.confirm(
      "Bu yazını silmək istədiyinizə əminsiniz?",
    );
    if (!confirmed) return;

    await deleteDoc(doc(db, "blogs", blog.slug));
    setBlogs((prev) => prev.filter((item) => item.slug !== blog.slug));
  }

  const hasCategories = categories.length > 0;

  return (
    <div>
      {toast && (
        <div className="mb-4 rounded-[var(--radius)] bg-primary/10 p-3 text-sm text-primary">
          {toast}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Bloqlar
          </h1>
          <p className="mt-1 text-muted-foreground">
            Bütün bloq yazılarını idarə edin.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="rounded-[var(--radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          + Yeni Yazı
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {isLoading ? (
          <p className="text-muted-foreground">Yüklənir...</p>
        ) : blogs.length === 0 ? (
          <p className="text-muted-foreground">Hələ heç bir yazı yoxdur.</p>
        ) : (
          blogs.map((blog) => (
            <div
              key={blog.id}
              className="flex items-center justify-between gap-4 rounded-[var(--radius)] border border-border bg-card p-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">{blog.title}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                    {categoryName(blog.category)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(blog.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(blog)}
                  aria-label="Redaktə et"
                  className="rounded-[var(--radius)] p-2 text-muted-foreground transition-colors hover:bg-accent"
                >
                  <Pencil size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(blog)}
                  aria-label="Sil"
                  className="rounded-[var(--radius)] p-2 text-destructive transition-colors hover:bg-accent"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[var(--radius)] bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-foreground">
                {isEditing ? "Yazını Redaktə Et" : "Yeni Yazı"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Bağla"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            {!hasCategories && (
              <p className="mb-4 rounded-[var(--radius)] bg-destructive/10 p-3 text-sm text-destructive">
                Əvvəlcə kateqoriya əlavə edin.
              </p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Başlıq
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  required
                  className="w-full rounded-[var(--radius)] border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Slug
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(event) => handleSlugChange(event.target.value)}
                  required
                  className="w-full rounded-[var(--radius)] border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Qısa Təsvir
                </label>
                <textarea
                  value={form.excerpt}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      excerpt: event.target.value,
                    }))
                  }
                  rows={2}
                  required
                  className="w-full rounded-[var(--radius)] border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Əsas Şəkil (Featured Image){" "}
                  <span className="text-destructive">*</span>
                </label>
                <ImageUpload
                  value={form.coverImage}
                  onChange={handleCoverImageChange}
                  storagePath="blog-covers"
                />
                {coverImageError && (
                  <p className="mt-1 text-sm text-destructive">
                    {coverImageError}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Kateqoriya
                </label>
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      category: event.target.value,
                    }))
                  }
                  required
                  disabled={!hasCategories}
                  className="w-full rounded-[var(--radius)] border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {!hasCategories && <option value="">—</option>}
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Tarix
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, date: event.target.value }))
                  }
                  required
                  className="w-full rounded-[var(--radius)] border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Məzmun
                </label>
                <RichTextEditor
                  content={form.content}
                  onChange={(html) =>
                    setForm((prev) => ({ ...prev, content: html }))
                  }
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSaving || !hasCategories}
                  className="flex-1 rounded-[var(--radius)] bg-primary py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Yadda Saxla
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-[var(--radius)] border border-border py-2.5 font-medium text-foreground transition-colors hover:bg-accent"
                >
                  Ləğv et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
