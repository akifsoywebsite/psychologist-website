import Link from "next/link";
import { Camera, Mail, Phone, ThumbsUp, type LucideIcon } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ContactContent } from "@/lib/types";

interface ContactMethod {
  icon: LucideIcon;
  label: string;
  value: string;
  href: string;
  external?: boolean;
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

export default async function ContactSection() {
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
      icon: Camera,
      label: "Instagram",
      value: "@murad.akifsoy",
      href: contact.instagramUrl,
      external: true,
    },
    {
      icon: ThumbsUp,
      label: "Facebook",
      value: "Murad Akifsoy",
      href: contact.facebookUrl,
      external: true,
    },
  ];

  return (
    <section className="border-t border-border bg-card px-4 py-16 md:py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
          Mənimlə Əlaqə Saxlayın
        </h2>
        <p className="max-w-xl text-muted-foreground">
          Suallarınız var və ya görüş təyin etmək istəyirsiniz? Aşağıdakı
          vasitələrlə mənimlə əlaqə saxlaya bilərsiniz.
        </p>

        <div className="mt-4 grid w-full grid-cols-1 gap-4 md:grid-cols-2">
          {contactMethods.map(({ icon: Icon, label, value, href, external }) => (
            <a
              key={label}
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="flex items-center gap-3 rounded-[var(--radius)] border border-border bg-background p-5 text-left transition-colors hover:border-primary"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent">
                <Icon className="text-primary" size={20} />
              </span>
              <span className="flex flex-col">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="font-medium text-foreground">{value}</span>
              </span>
            </a>
          ))}
        </div>

        <Link
          href="/elaqe"
          className="mt-4 inline-flex items-center justify-center rounded-[var(--radius)] bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Əlaqə Səhifəsinə Keç
        </Link>
      </div>
    </section>
  );
}
