import type { Metadata } from "next";
import Link from "next/link";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import {
  ArrowRight,
  Baby,
  GraduationCap,
  Home,
  Sparkles,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { db } from "@/lib/firebase";
import type { Service } from "@/lib/types";

export const metadata: Metadata = {
  title: "Xidmətlər | Murad Akifsoy",
  description:
    "Uşaqların və yeniyetmələrin inkişafına dəstək olmaq üçün təklif etdiyim peşəkar psixoloji xidmətlər.",
};

const iconMap: Record<string, LucideIcon> = {
  child: Baby,
  teen: UserRound,
  parent: Users,
  family: Home,
  school: GraduationCap,
};

async function getServices(): Promise<Service[]> {
  const servicesQuery = query(
    collection(db, "services"),
    orderBy("order", "asc"),
  );
  const snapshot = await getDocs(servicesQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Service, "id">),
  }));
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <main className="flex flex-1 flex-col bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Xidmətlər
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
            Sizə Necə Kömək Edə Bilərəm
          </h1>
          <p className="mt-4 text-muted-foreground">
            Uşaqların və yeniyetmələrin inkişafına dəstək olmaq üçün müxtəlif
            sahələrdə peşəkar xidmətlər təklif edirəm.
          </p>
        </div>

        {/* Mobile: bordered card list */}
        <div className="mt-8 flex flex-col gap-4 md:hidden">
          {services.map((service) => {
            const Icon = iconMap[service.icon] ?? Sparkles;

            return (
              <div
                key={service.id}
                className="flex flex-col gap-3 rounded-[var(--radius)] border border-border bg-card p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent">
                    <Icon className="text-primary" size={22} />
                  </div>
                  <h2 className="font-serif text-xl text-foreground">
                    {service.title}
                  </h2>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>

                <Link
                  href={`/xidmetler/${service.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  Ətraflı öyrən
                  <ArrowRight size={16} />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Desktop: alternating rows with decorative order number */}
        <div className="mt-8 hidden md:block">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] ?? Sparkles;
            const isReversed = index % 2 === 1;

            return (
              <div
                key={service.id}
                className={`flex items-center gap-12 border-b border-border py-12 last:border-b-0 md:py-16 ${
                  isReversed ? "flex-row-reverse" : ""
                }`}
              >
                <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
                  <span className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-serif text-[11rem] text-muted-foreground/20">
                    {String(service.order).padStart(2, "0")}
                  </span>
                  <div className="relative z-10 flex h-32 w-32 items-center justify-center rounded-full bg-accent">
                    <Icon className="text-primary" size={40} />
                  </div>
                </div>

                <div className="flex flex-1 flex-col items-start gap-4 text-left">
                  <h2 className="font-serif text-3xl font-bold text-foreground">
                    {service.title}
                  </h2>
                  <p className="leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                  <Link
                    href={`/xidmetler/${service.slug}`}
                    className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
                  >
                    Ətraflı öyrən
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
