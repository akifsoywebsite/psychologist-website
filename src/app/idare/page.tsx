"use client";

import { useEffect, useState, type FormEvent } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { HeroContent } from "@/lib/types";

type HeroTextForm = Pick<HeroContent, "eyebrow" | "fullName" | "bio">;

const emptyForm: HeroTextForm = {
  eyebrow: "",
  fullName: "",
  bio: "",
};

export default function IdareHomePage() {
  const [form, setForm] = useState<HeroTextForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    getDoc(doc(db, "siteContent", "hero")).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as HeroContent;
        setForm({
          eyebrow: data.eyebrow,
          fullName: data.fullName,
          bio: data.bio,
        });
      }
      setIsLoading(false);
    });
  }, []);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSaving(true);
    try {
      await setDoc(
        doc(db, "siteContent", "hero"),
        {
          eyebrow: form.eyebrow.trim(),
          fullName: form.fullName.trim(),
          bio: form.bio.trim(),
        },
        { merge: true },
      );
      showToast("Yadda saxlanıldı");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-foreground">
        Xoş gəlmisiniz
      </h1>
      <p className="mt-2 text-muted-foreground">
        Saytınızı buradan idarə edə bilərsiniz.
      </p>

      {toast && (
        <div className="mt-6 rounded-[var(--radius)] bg-primary/10 p-3 text-sm text-primary">
          {toast}
        </div>
      )}

      <div className="mt-6 rounded-[var(--radius)] border border-border bg-card p-6">
        <h2 className="font-serif text-xl text-foreground">
          Əsas Səhifə Mətnləri
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ana səhifədəki hero bölməsinin mətnlərini buradan redaktə edin.
        </p>

        {isLoading ? (
          <p className="mt-6 text-muted-foreground">Yüklənir...</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Kiçik Başlıq (məs: Uşaq və Yeniyetmə Psixoloqu)
              </label>
              <input
                type="text"
                value={form.eyebrow}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, eyebrow: event.target.value }))
                }
                className="w-full rounded-[var(--radius)] border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Ad Soyad
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    fullName: event.target.value,
                  }))
                }
                className="w-full rounded-[var(--radius)] border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Qısa Məlumat (bio mətni)
              </label>
              <textarea
                value={form.bio}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, bio: event.target.value }))
                }
                rows={4}
                className="w-full rounded-[var(--radius)] border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-fit rounded-[var(--radius)] bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Yadda Saxla
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
