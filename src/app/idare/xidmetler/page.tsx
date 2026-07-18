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
} from "firebase/firestore";
import { Pencil, Trash2, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { slugify } from "@/lib/slugify";
import type { Service } from "@/lib/types";

const iconOptions = ["child", "teen", "parent", "family", "school"];

type ServiceForm = {
  title: string;
  slug: string;
  summary: string;
  description: string;
  icon: string;
  order: number;
};

const emptyForm: ServiceForm = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  icon: iconOptions[0],
  order: 1,
};

async function fetchServices(): Promise<Service[]> {
  const servicesQuery = query(
    collection(db, "services"),
    orderBy("order", "asc"),
  );
  const snapshot = await getDocs(servicesQuery);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<Service, "id">),
  }));
}

export default function ServicesAdminPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [isSlugTouched, setIsSlugTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState("");

  async function loadServices() {
    const data = await fetchServices();
    setServices(data);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchServices().then((data) => {
      setServices(data);
      setIsLoading(false);
    });
  }, []);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }

  function openAddModal() {
    setIsEditing(false);
    setForm({ ...emptyForm, order: services.length + 1 });
    setIsSlugTouched(false);
    setIsModalOpen(true);
  }

  function openEditModal(service: Service) {
    setIsEditing(true);
    setForm({
      title: service.title,
      slug: service.slug,
      summary: service.summary,
      description: service.description,
      icon: service.icon,
      order: service.order,
    });
    setIsSlugTouched(true);
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const slug = form.slug.trim();
    if (!form.title.trim() || !slug) return;

    setIsSaving(true);
    try {
      const data: Omit<Service, "id"> = {
        title: form.title.trim(),
        slug,
        summary: form.summary.trim(),
        description: form.description.trim(),
        icon: form.icon,
        order: form.order,
      };

      await setDoc(doc(db, "services", slug), data);
      await loadServices();
      setIsModalOpen(false);
      showToast("Yadda saxlanıldı");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(service: Service) {
    const confirmed = window.confirm(
      "Bu xidməti silmək istədiyinizə əminsiniz?",
    );
    if (!confirmed) return;

    await deleteDoc(doc(db, "services", service.slug));
    setServices((prev) => prev.filter((item) => item.slug !== service.slug));
  }

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
            Xidmətlər
          </h1>
          <p className="mt-1 text-muted-foreground">
            Saytda göstərilən xidmətləri idarə edin.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="rounded-[var(--radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          + Yeni Xidmət
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {isLoading ? (
          <p className="text-muted-foreground">Yüklənir...</p>
        ) : services.length === 0 ? (
          <p className="text-muted-foreground">Hələ heç bir xidmət yoxdur.</p>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between gap-4 rounded-[var(--radius)] border border-border bg-card p-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">{service.title}</p>
                <p className="line-clamp-1 text-sm text-muted-foreground">
                  {service.summary}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(service)}
                  aria-label="Redaktə et"
                  className="rounded-[var(--radius)] p-2 text-muted-foreground transition-colors hover:bg-accent"
                >
                  <Pencil size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(service)}
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
                {isEditing ? "Xidməti Redaktə Et" : "Yeni Xidmət"}
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
                  value={form.summary}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      summary: event.target.value,
                    }))
                  }
                  rows={2}
                  required
                  className="w-full rounded-[var(--radius)] border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Ətraflı Təsvir
                </label>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  rows={4}
                  required
                  className="w-full rounded-[var(--radius)] border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  İkon
                </label>
                <select
                  value={form.icon}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, icon: event.target.value }))
                  }
                  className="w-full rounded-[var(--radius)] border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {iconOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Sıra
                </label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      order: Number(event.target.value),
                    }))
                  }
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
