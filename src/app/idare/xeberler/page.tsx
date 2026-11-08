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
import Link from "next/link";
import { Pencil, Tags, Trash2, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { slugify } from "@/lib/slugify";
import type { NewsCategory, NewsItem } from "@/lib/types";
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

type NewsForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage: string;
  date: string;
  status: "draft" | "published";
};

function makeEmptyForm(defaultCategory: string): NewsForm {
  return {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: defaultCategory,
    coverImage: "",
    date: toDateInputValue(new Date()),
    status: "draft",
  };
}

async function fetchNews(): Promise<NewsItem[]> {
  const newsQuery = query(collection(db, "news"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(newsQuery);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as Omit<NewsItem, "id" | "createdAt"> & {
      createdAt: Timestamp;
    };

    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt.toDate(),
    };
  });
}

async function fetchCategories(): Promise<NewsCategory[]> {
  const snapshot = await getDocs(collection(db, "newsCategories"));
  return snapshot.docs.map((docSnap) => docSnap.data() as NewsCategory);
}

export default function NewsAdminPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<NewsForm>(makeEmptyForm(""));
  const [isSlugTouched, setIsSlugTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [coverImageError, setCoverImageError] = useState("");

  async function loadNews() {
    const data = await fetchNews();
    setNews(data);
    setIsLoading(false);
  }

  useEffect(() => {
    Promise.all([fetchNews(), fetchCategories()]).then(
      ([newsData, categoriesData]) => {
        setNews(newsData);
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

  function openEditModal(item: NewsItem) {
    setIsEditing(true);
    setForm({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      content: item.content,
      category: item.category,
      coverImage: item.coverImage,
      date: toDateInputValue(item.createdAt),
      status: item.status ?? "published",
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
      const data: Omit<NewsItem, "id"> = {
        title: form.title.trim(),
        slug,
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        category: form.category,
        coverImage: form.coverImage.trim(),
        createdAt: fromDateInputValue(form.date),
        status: form.status,
      };

      await setDoc(doc(db, "news", slug), data);
      await loadNews();
      setIsModalOpen(false);
      showToast("Yadda saxlanıldı");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(item: NewsItem) {
    const confirmed = window.confirm(
      "Bu xəbəri silmək istədiyinizə əminsiniz?",
    );
    if (!confirmed) return;

    await deleteDoc(doc(db, "news", item.slug));
    setNews((prev) => prev.filter((n) => n.slug !== item.slug));
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
            Xəbərlər
          </h1>
          <p className="mt-1 text-muted-foreground">
            Bütün xəbərləri idarə edin.
          </p>
          <Link
            href="/idare/xeber-kateqoriyalari"
            className="mt-2 inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Tags size={16} />
            Kateqoriyaları idarə et
          </Link>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="rounded-[var(--radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          + Yeni Xəbər
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {isLoading ? (
          <p className="text-muted-foreground">Yüklənir...</p>
        ) : news.length === 0 ? (
          <p className="text-muted-foreground">Hələ heç bir xəbər yoxdur.</p>
        ) : (
          news.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-[var(--radius)] border border-border bg-card p-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{item.title}</p>
                  {item.status === "draft" ? (
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      Qaralama
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      Dərc edilib
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                    {categoryName(item.category)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  aria-label="Redaktə et"
                  className="rounded-[var(--radius)] p-2 text-muted-foreground transition-colors hover:bg-accent"
                >
                  <Pencil size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
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
                {isEditing ? "Xəbəri Redaktə Et" : "Yeni Xəbər"}
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
                  storagePath="news-covers"
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

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      status: event.target.value as "draft" | "published",
                    }))
                  }
                  className="w-full rounded-[var(--radius)] border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="draft">Qaralama</option>
                  <option value="published">Dərc edilmiş</option>
                </select>
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
