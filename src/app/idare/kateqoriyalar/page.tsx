"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { slugify } from "@/lib/slugify";
import type { Category } from "@/lib/types";

type CategoryForm = {
  name: string;
  slug: string;
};

const emptyForm: CategoryForm = {
  name: "",
  slug: "",
};

async function fetchCategories(): Promise<Category[]> {
  const snapshot = await getDocs(collection(db, "categories"));
  return snapshot.docs.map((docSnap) => docSnap.data() as Category);
}

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [isSlugTouched, setIsSlugTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState("");

  async function loadCategories() {
    const data = await fetchCategories();
    setCategories(data);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchCategories().then((data) => {
      setCategories(data);
      setIsLoading(false);
    });
  }, []);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }

  function openAddModal() {
    setIsEditing(false);
    setForm(emptyForm);
    setIsSlugTouched(false);
    setIsModalOpen(true);
  }

  function openEditModal(category: Category) {
    setIsEditing(true);
    setForm({ name: category.name, slug: category.slug });
    setIsSlugTouched(true);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  function handleNameChange(value: string) {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: isSlugTouched ? prev.slug : slugify(value),
    }));
  }

  function handleSlugChange(value: string) {
    setIsSlugTouched(true);
    setForm((prev) => ({ ...prev, slug: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const slug = form.slug.trim();
    if (!form.name.trim() || !slug) return;

    setIsSaving(true);
    try {
      const data: Category = {
        name: form.name.trim(),
        slug,
      };

      await setDoc(doc(db, "categories", slug), data);
      await loadCategories();
      setIsModalOpen(false);
      showToast("Yadda saxlanıldı");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(category: Category) {
    const blogsQuery = query(
      collection(db, "blogs"),
      where("category", "==", category.slug),
    );
    const blogsSnapshot = await getDocs(blogsQuery);

    if (!blogsSnapshot.empty) {
      alert(
        "Bu kateqoriyadan istifadə edən bloq yazıları var. Əvvəlcə həmin yazıların kateqoriyasını dəyişin.",
      );
      return;
    }

    const confirmed = window.confirm(
      "Bu kateqoriyani silmək istədiyinizə əminsiniz?",
    );
    if (!confirmed) return;

    await deleteDoc(doc(db, "categories", category.slug));
    setCategories((prev) => prev.filter((item) => item.slug !== category.slug));
  }

  return (
    <div>
      {toast && (
        <div className="mb-4 rounded-[var(--radius)] bg-primary/10 p-3 text-sm text-primary">
          {toast}
        </div>
      )}

      <Link
        href="/idare/bloqlar"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Bloqlara qayıt
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Kateqoriyalar
          </h1>
          <p className="mt-1 text-muted-foreground">
            Bloq yazıları üçün kateqoriyaları idarə edin.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="rounded-[var(--radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          + Yeni Kateqoriya
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {isLoading ? (
          <p className="text-muted-foreground">Yüklənir...</p>
        ) : categories.length === 0 ? (
          <p className="text-muted-foreground">Hələ heç bir kateqoriya yoxdur.</p>
        ) : (
          categories.map((category) => (
            <div
              key={category.slug}
              className="flex items-center justify-between gap-4 rounded-[var(--radius)] border border-border bg-card p-4"
            >
              <p className="font-medium text-foreground">{category.name}</p>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(category)}
                  aria-label="Redaktə et"
                  className="rounded-[var(--radius)] p-2 text-muted-foreground transition-colors hover:bg-accent"
                >
                  <Pencil size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(category)}
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
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[var(--radius)] bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-foreground">
                {isEditing ? "Kateqoriyanı Redaktə Et" : "Yeni Kateqoriya"}
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

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Ad
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => handleNameChange(event.target.value)}
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

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
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
