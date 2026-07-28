"use client";

import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { X } from "lucide-react";
import { db } from "@/lib/firebase";
import ImageUpload from "@/components/dashboard/image-upload";
import RichTextEditor from "@/components/dashboard/rich-text-editor";
import type { AboutContent, ContactContent } from "@/lib/types";

const emptyAbout: AboutContent = {
  eyebrow: "",
  heading: "",
  bio: "",
  imageUrl: "",
  skills: [],
};

const emptyContact: ContactContent = {
  phone: "",
  email: "",
  address: "",
  workingHours: "",
  instagramUrl: "",
  facebookUrl: "",
  linkedinUrl: "",
  tiktokUrl: "",
  whatsappUrl: "",
  youtubeUrl: "",
  mapQuery: "",
  homeCtaHeading: "",
  homeCtaText: "",
  homeCtaButtonText: "",
};

const inputClassName =
  "w-full rounded-[var(--radius)] border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

const labelClassName = "mb-1 block text-sm font-medium text-foreground";

const cardClassName =
  "rounded-[var(--radius)] border border-border bg-card p-6";

const saveButtonClassName =
  "w-fit rounded-[var(--radius)] bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";

const toastClassName =
  "rounded-[var(--radius)] bg-primary/10 p-3 text-sm text-primary";

export default function SiteContentPage() {
  const [about, setAbout] = useState<AboutContent>(emptyAbout);
  const [contact, setContact] = useState<ContactContent>(emptyContact);
  const [skillInput, setSkillInput] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingAbout, setIsSavingAbout] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [aboutToast, setAboutToast] = useState("");
  const [contactToast, setContactToast] = useState("");

  useEffect(() => {
    Promise.all([
      getDoc(doc(db, "siteContent", "about")),
      getDoc(doc(db, "siteContent", "contact")),
    ]).then(([aboutSnapshot, contactSnapshot]) => {
      if (aboutSnapshot.exists()) {
        setAbout(aboutSnapshot.data() as AboutContent);
      }
      if (contactSnapshot.exists()) {
        setContact({
          ...emptyContact,
          ...(contactSnapshot.data() as ContactContent),
        });
      }
      setIsLoading(false);
    });
  }, []);

  function showAboutToast(message: string) {
    setAboutToast(message);
    setTimeout(() => setAboutToast(""), 2500);
  }

  function showContactToast(message: string) {
    setContactToast(message);
    setTimeout(() => setContactToast(""), 2500);
  }

  function addSkill() {
    const skill = skillInput.trim();
    if (!skill) return;
    setAbout((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
    setSkillInput("");
  }

  function removeSkill(index: number) {
    setAbout((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  }

  function handleSkillKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill();
    }
  }

  async function handleSaveAbout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSavingAbout(true);
    try {
      await setDoc(
        doc(db, "siteContent", "about"),
        {
          eyebrow: about.eyebrow.trim(),
          heading: about.heading.trim(),
          bio: about.bio,
          imageUrl: about.imageUrl,
          skills: about.skills,
        },
        { merge: true },
      );
      showAboutToast("Yadda saxlanıldı");
    } finally {
      setIsSavingAbout(false);
    }
  }

  async function handleSaveContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSavingContact(true);
    try {
      await setDoc(
        doc(db, "siteContent", "contact"),
        {
          phone: contact.phone.trim(),
          email: contact.email.trim(),
          address: contact.address.trim(),
          workingHours: contact.workingHours.trim(),
          instagramUrl: contact.instagramUrl?.trim() ?? "",
          facebookUrl: contact.facebookUrl?.trim() ?? "",
          linkedinUrl: contact.linkedinUrl?.trim() ?? "",
          tiktokUrl: contact.tiktokUrl?.trim() ?? "",
          whatsappUrl: contact.whatsappUrl?.trim() ?? "",
          youtubeUrl: contact.youtubeUrl?.trim() ?? "",
          mapQuery: contact.mapQuery?.trim() ?? "",
          homeCtaHeading: contact.homeCtaHeading?.trim() ?? "",
          homeCtaText: contact.homeCtaText?.trim() ?? "",
          homeCtaButtonText: contact.homeCtaButtonText?.trim() ?? "",
        },
        { merge: true },
      );
      showContactToast("Yadda saxlanıldı");
    } finally {
      setIsSavingContact(false);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-foreground">
        Sayt Məzmunu
      </h1>
      <p className="mt-2 text-muted-foreground">
        Haqqımda səhifəsi və əlaqə məlumatlarını idarə edin.
      </p>

      {isLoading ? (
        <p className="mt-6 text-muted-foreground">Yüklənir...</p>
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          <div className={cardClassName}>
            <h2 className="font-serif text-xl text-foreground">
              Haqqımda Səhifəsi
            </h2>

            {aboutToast && <div className={`mt-4 ${toastClassName}`}>{aboutToast}</div>}

            <form onSubmit={handleSaveAbout} className="mt-6 flex flex-col gap-4">
              <div>
                <label className={labelClassName}>Kiçik Başlıq</label>
                <input
                  type="text"
                  value={about.eyebrow}
                  onChange={(event) =>
                    setAbout((prev) => ({ ...prev, eyebrow: event.target.value }))
                  }
                  className={inputClassName}
                />
              </div>

              <div>
                <label className={labelClassName}>Başlıq</label>
                <input
                  type="text"
                  value={about.heading}
                  onChange={(event) =>
                    setAbout((prev) => ({ ...prev, heading: event.target.value }))
                  }
                  className={inputClassName}
                />
              </div>

              <div>
                <label className={labelClassName}>Şəkil</label>
                <ImageUpload
                  value={about.imageUrl}
                  onChange={(url) =>
                    setAbout((prev) => ({ ...prev, imageUrl: url }))
                  }
                  storagePath="about-images"
                />
              </div>

              <div>
                <label className={labelClassName}>Haqqımda Mətni</label>
                <RichTextEditor
                  content={about.bio}
                  onChange={(html) =>
                    setAbout((prev) => ({ ...prev, bio: html }))
                  }
                />
              </div>

              <div>
                <label className={labelClassName}>Bacarıqlar (Skills)</label>
                <div className="flex flex-wrap gap-2">
                  {about.skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-sm text-foreground"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={`${skill} sil`}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(event) => setSkillInput(event.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    placeholder="Yeni bacarıq"
                    className={inputClassName}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="w-fit shrink-0 rounded-[var(--radius)] border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    + Əlavə et
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingAbout}
                className={saveButtonClassName}
              >
                Yadda Saxla
              </button>
            </form>
          </div>

          <div className={cardClassName}>
            <h2 className="font-serif text-xl text-foreground">
              Əlaqə Məlumatları
            </h2>

            {contactToast && (
              <div className={`mt-4 ${toastClassName}`}>{contactToast}</div>
            )}

            <form onSubmit={handleSaveContact} className="mt-6 flex flex-col gap-4">
              <div className="rounded-[var(--radius)] border border-border p-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Ana Səhifə CTA
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ana səhifədəki &ldquo;Əlaqə&rdquo; bölməsinin mətnləri.
                </p>

                <div className="mt-4 flex flex-col gap-4">
                  <div>
                    <label className={labelClassName}>Ana Səhifə - Başlıq</label>
                    <input
                      type="text"
                      value={contact.homeCtaHeading}
                      onChange={(event) =>
                        setContact((prev) => ({
                          ...prev,
                          homeCtaHeading: event.target.value,
                        }))
                      }
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className={labelClassName}>Ana Səhifə - Mətn</label>
                    <textarea
                      rows={2}
                      value={contact.homeCtaText}
                      onChange={(event) =>
                        setContact((prev) => ({
                          ...prev,
                          homeCtaText: event.target.value,
                        }))
                      }
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className={labelClassName}>
                      Ana Səhifə - Düymə Mətni
                    </label>
                    <input
                      type="text"
                      value={contact.homeCtaButtonText}
                      onChange={(event) =>
                        setContact((prev) => ({
                          ...prev,
                          homeCtaButtonText: event.target.value,
                        }))
                      }
                      className={inputClassName}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClassName}>Telefon</label>
                <input
                  type="text"
                  value={contact.phone}
                  onChange={(event) =>
                    setContact((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  className={inputClassName}
                />
              </div>

              <div>
                <label className={labelClassName}>E-poçt</label>
                <input
                  type="text"
                  value={contact.email}
                  onChange={(event) =>
                    setContact((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className={inputClassName}
                />
              </div>

              <div>
                <label className={labelClassName}>Ünvan</label>
                <input
                  type="text"
                  value={contact.address}
                  onChange={(event) =>
                    setContact((prev) => ({ ...prev, address: event.target.value }))
                  }
                  className={inputClassName}
                />
              </div>

              <div>
                <label className={labelClassName}>İş Saatları</label>
                <input
                  type="text"
                  value={contact.workingHours}
                  onChange={(event) =>
                    setContact((prev) => ({
                      ...prev,
                      workingHours: event.target.value,
                    }))
                  }
                  className={inputClassName}
                />
              </div>

              <div>
                <label className={labelClassName}>Instagram Linki</label>
                <input
                  type="text"
                  value={contact.instagramUrl}
                  onChange={(event) =>
                    setContact((prev) => ({
                      ...prev,
                      instagramUrl: event.target.value,
                    }))
                  }
                  className={inputClassName}
                />
              </div>

              <div>
                <label className={labelClassName}>Facebook Linki</label>
                <input
                  type="text"
                  value={contact.facebookUrl}
                  onChange={(event) =>
                    setContact((prev) => ({
                      ...prev,
                      facebookUrl: event.target.value,
                    }))
                  }
                  className={inputClassName}
                />
              </div>

              <div>
                <label className={labelClassName}>LinkedIn Linki</label>
                <input
                  type="text"
                  value={contact.linkedinUrl}
                  onChange={(event) =>
                    setContact((prev) => ({
                      ...prev,
                      linkedinUrl: event.target.value,
                    }))
                  }
                  className={inputClassName}
                />
              </div>

              <div>
                <label className={labelClassName}>TikTok Linki</label>
                <input
                  type="text"
                  value={contact.tiktokUrl}
                  onChange={(event) =>
                    setContact((prev) => ({
                      ...prev,
                      tiktokUrl: event.target.value,
                    }))
                  }
                  className={inputClassName}
                />
              </div>

              <div>
                <label className={labelClassName}>WhatsApp Linki</label>
                <input
                  type="text"
                  value={contact.whatsappUrl}
                  onChange={(event) =>
                    setContact((prev) => ({
                      ...prev,
                      whatsappUrl: event.target.value,
                    }))
                  }
                  className={inputClassName}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  WhatsApp link formatı: https://wa.me/994501234567
                </p>
              </div>

              <div>
                <label className={labelClassName}>YouTube Linki</label>
                <input
                  type="text"
                  value={contact.youtubeUrl}
                  onChange={(event) =>
                    setContact((prev) => ({
                      ...prev,
                      youtubeUrl: event.target.value,
                    }))
                  }
                  className={inputClassName}
                />
              </div>

              <div>
                <label className={labelClassName}>
                  Xəritə Ünvanı (Google Maps üçün)
                </label>
                <input
                  type="text"
                  value={contact.mapQuery}
                  onChange={(event) =>
                    setContact((prev) => ({
                      ...prev,
                      mapQuery: event.target.value,
                    }))
                  }
                  className={inputClassName}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Xəritədə göstəriləcək ünvan və ya yer adı. Boş saxlasanız,
                  xəritə göstərilməyəcək.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSavingContact}
                className={saveButtonClassName}
              >
                Yadda Saxla
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
