import type { Metadata } from "next";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { Clock, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import sanitizeHtml from "sanitize-html";
import { db } from "@/lib/firebase";
import type { AboutContent, ContactContent } from "@/lib/types";
import SocialLinks from "@/components/shared/social-links";

export const metadata: Metadata = {
  title: "Haqqımda | Murad Akifsoy",
  description:
    "Murad Akifsoy haqqında - təhsil, təcrübə və uşaq-yeniyetmə psixologiyası sahəsindəki bacarıqlar.",
};

const defaultAbout: AboutContent = {
  eyebrow: "Haqqımda",
  heading: "Murad Akifsoy ilə Tanış Olun",
  bio: "<p>Bura tezliklə ətraflı məlumat əlavə olunacaq.</p>",
  imageUrl: "/murad-a.png",
  skills: [],
};

const defaultContact: ContactContent = {
  phone: "+994 50 123 45 67",
  email: "info@muradakifsoy.az",
  address: "Bakı, Azərbaycan",
  workingHours: "Bazar ertəsi - Cümə, 09:00 - 18:00",
  instagramUrl: "#",
  facebookUrl: "#",
  linkedinUrl: "#",
};

async function getAboutContent(): Promise<AboutContent> {
  const snapshot = await getDoc(doc(db, "siteContent", "about"));
  if (!snapshot.exists()) return defaultAbout;
  return snapshot.data() as AboutContent;
}

async function getContactContent(): Promise<ContactContent> {
  const snapshot = await getDoc(doc(db, "siteContent", "contact"));
  if (!snapshot.exists()) return defaultContact;
  return snapshot.data() as ContactContent;
}

interface ContactMethod {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}

const cardClassName =
  "flex items-center gap-4 rounded-[var(--radius)] border border-border bg-card p-6";

export default async function AboutPage() {
  const [about, contact] = await Promise.all([
    getAboutContent(),
    getContactContent(),
  ]);

  const sanitizedBio = sanitizeHtml(about.bio, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h2", "h3"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height"],
    },
  });

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
            {about.eyebrow}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
            {about.heading}
          </h1>
        </div>

        <div className="mt-12 flex flex-col gap-8">
          <div className="mx-auto w-full max-w-[500px]">
            <Image
              src={about.imageUrl}
              alt={about.heading}
              width={500}
              height={625}
              sizes="(max-width: 768px) 100vw, 500px"
              className="h-auto w-full rounded-[var(--radius)]"
              priority
            />
          </div>

          <div className="flex flex-col">
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: sanitizedBio }}
            />
          </div>
        </div>

        {about.skills.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-xl font-bold text-foreground">
              Bacarıqlar
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {about.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-accent px-4 py-1.5 text-sm text-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-16 border-t border-border pt-16">
          <h2 className="font-serif text-xl font-bold text-foreground">
            Əlaqə
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
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

          <SocialLinks contact={contact} className="mt-6 flex flex-wrap gap-3" />
        </div>
      </div>
    </main>
  );
}
