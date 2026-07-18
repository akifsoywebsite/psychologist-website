import Image from "next/image";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { HeroContent } from "@/lib/types";

const defaultHero: HeroContent = {
  eyebrow: "Uşaq və Yeniyetmə Psixoloqu",
  fullName: "Murad Akif oğlu Heydərov (Akifsoy)",
  bio: "Zaqatala Rayonunun Suvagil kəndində anadan olmuşam. 2010-2014-cü illərdə sosial-psixoloji xidmət üzrə bakalavr dərəcəmi Gəncə Dövlət Universitetində almışam.",
  ctaPrimaryText: "Xidmətlərə Bax",
  ctaSecondaryText: "Əlaqə",
  marqueeItems: [
    "Uşaq psixologiyası",
    "Psixoloji xidmət və etik prinsiplər",
    "Səyahət",
    "Oxuduğum kitablar",
  ],
  imageUrl: "/murad-a.png",
};

async function getHeroContent(): Promise<HeroContent> {
  const snapshot = await getDoc(doc(db, "siteContent", "hero"));
  if (!snapshot.exists()) return defaultHero;
  return snapshot.data() as HeroContent;
}

export default async function Hero() {
  const hero = await getHeroContent();

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <div className="flex flex-col items-center gap-10 md:flex-row md:items-center md:gap-16">
          <div className="relative isolate w-full max-w-[260px] shrink-0 sm:max-w-xs md:w-[320px] md:max-w-none lg:w-[380px]">
            <div className="absolute -inset-[12%] -z-10 rounded-full bg-secondary blur-2xl" />
            <Image
              src={hero.imageUrl}
              alt={hero.fullName}
              width={707}
              height={1061}
              priority
              className="relative z-10 h-auto w-full"
            />
          </div>

          <div className="flex flex-1 flex-col items-center gap-5 text-center md:items-start md:text-left">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">
              {hero.eyebrow}
            </p>
            <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
              {hero.fullName}
            </h1>
            <p className="max-w-xl text-base text-muted-foreground md:text-lg">
              {hero.bio}
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/xidmetler"
                className="inline-flex items-center justify-center rounded-[var(--radius)] bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {hero.ctaPrimaryText}
              </Link>
              <Link
                href="/elaqe"
                className="inline-flex items-center justify-center rounded-[var(--radius)] border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
              >
                {hero.ctaSecondaryText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
