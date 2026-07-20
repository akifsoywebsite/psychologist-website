import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import {
  ArrowLeft,
  Baby,
  GraduationCap,
  Home,
  Sparkles,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import sanitizeHtml from "sanitize-html";
import { db } from "@/lib/firebase";
import type { Service } from "@/lib/types";

const iconMap: Record<string, LucideIcon> = {
  child: Baby,
  teen: UserRound,
  parent: Users,
  family: Home,
  school: GraduationCap,
};

// Wrapped in React's cache() so generateMetadata and the page component
// (both invoked per-request) share a single Firestore read instead of two.
const getService = cache(async (slug: string): Promise<Service | null> => {
  const snapshot = await getDoc(doc(db, "services", slug));
  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<Service, "id">),
  };
});

async function getOtherServices(currentId: string): Promise<Service[]> {
  const servicesQuery = query(
    collection(db, "services"),
    orderBy("order", "asc"),
  );
  const snapshot = await getDocs(servicesQuery);

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Service, "id">),
    }))
    .filter((service) => service.id !== currentId);
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);

  if (!service) return {};

  return {
    title: `${service.title} | Murad Akifsoy`,
    description: service.summary,
  };
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;
  const service = await getService(slug);

  if (!service) notFound();

  const otherServices = await getOtherServices(service.id);

  return (
    <main className="flex flex-1 flex-col bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 py-16 md:px-8 md:py-24">
        <Link
          href="/xidmetler"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft size={16} />
          Bütün xidmətlər
        </Link>

        <h1 className="mt-6 font-serif text-3xl font-bold text-foreground md:text-4xl">
          {service.title}
        </h1>

        {service.imageUrl && (
          <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-[var(--radius)]">
            <Image
              src={service.imageUrl}
              alt={service.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div
          className="blog-content mt-4"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(service.description, {
              allowedTags: sanitizeHtml.defaults.allowedTags.concat([
                "img",
                "h2",
                "h3",
              ]),
              allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                img: ["src", "alt", "width", "height"],
              },
            }),
          }}
        />

        <div className="mt-10 rounded-[var(--radius)] border border-border bg-card p-8 text-center">
          <h2 className="font-serif text-xl font-bold text-foreground">
            Bu xidmətlə maraqlanırsınız?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Görüş təyin etmək üçün mənimlə əlaqə saxlayın.
          </p>
          <Link
            href="/elaqe"
            className="mt-6 inline-flex items-center justify-center rounded-[var(--radius)] bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Əlaqə Saxla
          </Link>
        </div>
      </div>

      {otherServices.length > 0 && (
        <div className="mx-auto w-full max-w-5xl px-4 pb-16 md:px-8 md:pb-24">
          <div className="border-t border-border pt-12 md:pt-16">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Digər Xidmətlər
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {otherServices.map((other) => {
                const OtherIcon = iconMap[other.icon] ?? Sparkles;

                return (
                  <Link
                    key={other.id}
                    href={`/xidmetler/${other.slug}`}
                    className="flex items-center gap-4 rounded-[var(--radius)] border border-border bg-card p-5 transition-colors hover:bg-accent"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent">
                      <OtherIcon className="text-primary" size={18} />
                    </div>
                    <span className="font-medium text-foreground">
                      {other.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
