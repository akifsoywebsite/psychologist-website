import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { ArrowRight, Sparkles } from "lucide-react";
import { db } from "@/lib/firebase";
import type { Service } from "@/lib/types";
import { SITE_URL } from "@/lib/site";

const title = "Xidmətlər | Murad Akifsoy";
const description =
  "Uşaqların və yeniyetmələrin inkişafına dəstək olmaq üçün təklif etdiyim peşəkar psixoloji xidmətlər.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/xidmetler`,
    images: ["/murad-a.png"],
  },
};

async function getServices(): Promise<Service[]> {
  const servicesQuery = query(
    collection(db, "services"),
    orderBy("order", "asc"),
  );
  const snapshot = await getDocs(servicesQuery);

  const services = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Service, "id">),
  }));

  return services.filter((service) => service.status !== "draft");
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
          {services.map((service) => (
            <div
              key={service.id}
              className="flex flex-col gap-3 rounded-[var(--radius)] border border-border bg-card p-5"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[var(--radius)] bg-accent">
                {service.imageUrl ? (
                  <Image
                    src={service.imageUrl}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Sparkles className="text-primary" size={32} />
                  </div>
                )}
              </div>

              <h2 className="font-serif text-xl text-foreground">
                {service.title}
              </h2>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {service.summary}
              </p>

              <Link
                href={`/xidmetler/${service.slug}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                Ətraflı öyrən
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>

        {/* Desktop: alternating rows */}
        <div className="mt-8 hidden md:block">
          {services.map((service, index) => {
            const isReversed = index % 2 === 1;

            return (
              <div
                key={service.id}
                className={`flex items-center gap-12 border-b border-border py-12 last:border-b-0 md:py-16 ${
                  isReversed ? "flex-row-reverse" : ""
                }`}
              >
                <div className="relative aspect-[4/3] w-full max-w-sm shrink-0 overflow-hidden rounded-[var(--radius)] bg-accent">
                  {service.imageUrl ? (
                    <Image
                      src={service.imageUrl}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Sparkles className="text-primary" size={40} />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col items-start gap-4 text-left">
                  <h2 className="font-serif text-3xl font-bold text-foreground">
                    {service.title}
                  </h2>
                  <p className="leading-relaxed text-muted-foreground">
                    {service.summary}
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
