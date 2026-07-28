import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ContactContent } from "@/lib/types";
import SocialLinks from "@/components/shared/social-links";

const navLinks = [
  { href: "/", label: "Ana Səhifə" },
  { href: "/haqqimda", label: "Haqqımda" },
  { href: "/xidmetler", label: "Xidmətlər" },
  { href: "/bloq", label: "Bloq" },
  { href: "/elaqe", label: "Əlaqə" },
];

const defaultContact: ContactContent = {
  phone: "+994 50 123 45 67",
  email: "info@muradakifsoy.az",
  address: "Bakı, Azərbaycan",
  workingHours: "Bazar ertəsi - Cümə, 09:00 - 18:00",
  instagramUrl: "#",
  facebookUrl: "#",
};

async function getContactContent(): Promise<ContactContent> {
  const snapshot = await getDoc(doc(db, "siteContent", "contact"));
  if (!snapshot.exists()) return defaultContact;
  return snapshot.data() as ContactContent;
}

export default async function Footer() {
  const contact = await getContactContent();

  return (
    <footer className="border-t border-border bg-card text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 md:flex-row md:items-start md:justify-between md:gap-4 md:px-8">
        <div>
          <p className="font-serif font-semibold text-foreground">
            Murad Akifsoy
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Uşaq və Yeniyetmə Psixoloqu
          </p>
        </div>

        <nav className="flex flex-col gap-3 text-sm md:flex-row md:items-center md:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <SocialLinks contact={contact} />
      </div>

      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground md:px-8">
        © 2026 Murad Akifsoy. Bütün hüquqlar qorunur.
      </div>
    </footer>
  );
}
