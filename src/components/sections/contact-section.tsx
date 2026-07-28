import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ContactContent } from "@/lib/types";

const defaultContact: ContactContent = {
  phone: "+994 50 123 45 67",
  email: "info@muradakifsoy.az",
  address: "Bakı, Azərbaycan",
  workingHours: "Bazar ertəsi - Cümə, 09:00 - 18:00",
};

const fallbackHeading = "Mənimlə Əlaqə Saxlayın";
const fallbackText =
  "Sual və təkliflərinizi gözləyirəm. Görüş təyin etmək üçün mənə müraciət edin.";
const fallbackButtonText = "Əlaqəyə Keç";

async function getContactContent(): Promise<ContactContent> {
  const snapshot = await getDoc(doc(db, "siteContent", "contact"));
  if (!snapshot.exists()) return defaultContact;
  return snapshot.data() as ContactContent;
}

export default async function ContactSection() {
  const contact = await getContactContent();

  return (
    <section className="border-t border-border bg-card px-4 py-16 md:py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
          {contact.homeCtaHeading || fallbackHeading}
        </h2>
        <p className="max-w-xl text-muted-foreground">
          {contact.homeCtaText || fallbackText}
        </p>

        <Link
          href="/elaqe"
          className="mt-4 inline-flex items-center justify-center rounded-[var(--radius)] bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {contact.homeCtaButtonText || fallbackButtonText}
        </Link>
      </div>
    </section>
  );
}
