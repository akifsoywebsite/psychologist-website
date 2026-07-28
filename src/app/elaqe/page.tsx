import type { Metadata } from "next";
import { doc, getDoc } from "firebase/firestore";
import { Clock, Mail, Map, MapPin, Phone, type LucideIcon } from "lucide-react";
import { db } from "@/lib/firebase";
import type { ContactContent } from "@/lib/types";
import SocialLinks from "@/components/shared/social-links";

export const metadata: Metadata = {
  title: "Əlaqə | Murad Akifsoy",
  description:
    "Murad Akifsoy ilə əlaqə saxlamaq üçün telefon, e-poçt, ünvan və sosial media vasitələri.",
};

interface ContactMethod {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}

const defaultContact: ContactContent = {
  phone: "+994 50 123 45 67",
  email: "info@muradakifsoy.az",
  address: "Bakı, Azərbaycan",
  workingHours: "Bazar ertəsi - Cümə, 09:00 - 18:00",
  instagramUrl: "#",
  facebookUrl: "#",
  linkedinUrl: "#",
};

async function getContactContent(): Promise<ContactContent> {
  const snapshot = await getDoc(doc(db, "siteContent", "contact"));
  if (!snapshot.exists()) return defaultContact;
  return snapshot.data() as ContactContent;
}

const cardClassName =
  "flex items-center gap-4 rounded-[var(--radius)] border border-border bg-card p-6";

export default async function ContactPage() {
  const contact = await getContactContent();

  const contactMethods: ContactMethod[] = [
    {
      icon: Phone,
      label: "Telefon",
      value: contact.phone,
      href: `tel:${contact.phone.replace(/\s+/g, "")}`,
    },
    {
      icon: Mail,
      label: "E-poçt",
      value: contact.email,
      href: `mailto:${contact.email}`,
    },
    {
      icon: MapPin,
      label: "Ünvan",
      value: contact.address,
    },
    {
      icon: Clock,
      label: "İş saatları",
      value: contact.workingHours,
    },
  ];

  return (
    <main className="flex flex-1 flex-col bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Əlaqə
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
            Mənimlə Əlaqə Saxlayın
          </h1>
          <p className="mt-4 text-muted-foreground">
            Sual və təkliflərinizi gözləyirəm. Aşağıdakı əlaqə
            vasitələrindən istənilən biri ilə mənə müraciət edə bilərsiniz.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
          <div className="flex flex-col gap-4">
            {contactMethods.map(({ icon: Icon, label, value, href }) => {
              const content = (
                <>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent">
                    <Icon className="text-primary" size={22} />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      {label}
                    </span>
                    <span className="text-lg font-medium text-foreground">
                      {value}
                    </span>
                  </span>
                </>
              );

              return href ? (
                <a
                  key={label}
                  href={href}
                  className={`${cardClassName} transition-colors hover:border-primary`}
                >
                  {content}
                </a>
              ) : (
                <div key={label} className={cardClassName}>
                  {content}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="font-serif text-xl font-bold text-foreground">
              Sosial Media
            </h2>

            <SocialLinks contact={contact} className="flex flex-wrap gap-3" />

            {contact.mapQuery ? (
              <div className="aspect-video overflow-hidden rounded-[var(--radius)]">
                <iframe
                  src={`https://www.google.com/maps?q=${encodeURIComponent(contact.mapQuery)}&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-[var(--radius)] bg-accent">
                <Map className="text-primary" size={28} />
                <p className="text-sm text-muted-foreground">
                  Xəritə tezliklə əlavə olunacaq
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
