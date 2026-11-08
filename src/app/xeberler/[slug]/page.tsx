import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Newspaper } from "lucide-react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  type Timestamp,
} from "firebase/firestore";
import { cache } from "react";
import sanitizeHtml from "sanitize-html";
import { db } from "@/lib/firebase";
import type { NewsCategory, NewsItem } from "@/lib/types";
import { SITE_URL } from "@/lib/site";

const monthNames = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "İyun",
  "İyul",
  "Avqust",
  "Sentyabr",
  "Oktyabr",
  "Noyabr",
  "Dekabr",
];

function formatDate(createdAt: NewsItem["createdAt"]): string {
  return `${createdAt.getDate()} ${monthNames[createdAt.getMonth()]} ${createdAt.getFullYear()}`;
}

// Wrapped in React's cache() so generateMetadata and the page component
// (both invoked per-request) share a single Firestore read instead of two.
const getNewsItem = cache(async (slug: string): Promise<NewsItem | null> => {
  const snapshot = await getDoc(doc(db, "news", slug));
  if (!snapshot.exists()) return null;

  const data = snapshot.data() as Omit<NewsItem, "id" | "createdAt"> & {
    createdAt: Timestamp;
  };

  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt.toDate(),
  };
});

async function getNewsCategories(): Promise<NewsCategory[]> {
  const snapshot = await getDocs(collection(db, "newsCategories"));
  return snapshot.docs.map((doc) => doc.data() as NewsCategory);
}

async function getAllNewsSorted(): Promise<NewsItem[]> {
  const newsQuery = query(
    collection(db, "news"),
    orderBy("createdAt", "asc"),
  );
  const snapshot = await getDocs(newsQuery);

  const news = snapshot.docs.map((doc) => {
    const data = doc.data() as Omit<NewsItem, "id" | "createdAt"> & {
      createdAt: Timestamp;
    };

    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
    };
  });

  return news.filter((item) => item.status !== "draft");
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsItem(slug);

  if (!item) return {};

  const title = `${item.title} | Murad Akifsoy`;
  const image = item.coverImage || "/murad-a.png";

  return {
    title,
    description: item.excerpt,
    openGraph: {
      title,
      description: item.excerpt,
      url: `${SITE_URL}/xeberler/${item.slug}`,
      images: [image],
    },
  };
}

export default async function NewsItemPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getNewsItem(slug);

  if (!item || item.status === "draft") notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    datePublished: item.createdAt.toISOString(),
    image: item.coverImage || `${SITE_URL}/murad-a.png`,
    description: item.excerpt,
    author: {
      "@type": "Person",
      name: "Murad Akif oğlu Heydərov (Akifsoy)",
    },
  };

  const categories = await getNewsCategories();
  const categoryName =
    categories.find((category) => category.slug === item.category)?.name ??
    item.category;

  const allNews = await getAllNewsSorted();
  const currentIndex = allNews.findIndex((n) => n.id === item.id);
  const prevItem = currentIndex > 0 ? allNews[currentIndex - 1] : null;
  const nextItem =
    currentIndex >= 0 && currentIndex < allNews.length - 1
      ? allNews[currentIndex + 1]
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <main className="flex flex-1 flex-col bg-background">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 md:px-8 md:py-24">
          <Link
            href="/xeberler"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft size={16} />
            Bütün xəbərlər
          </Link>

          <h1 className="mt-6 font-serif text-3xl font-bold text-foreground md:text-4xl">
            {item.title}
          </h1>

          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-[var(--radius)] bg-accent">
            {item.coverImage ? (
              <Image
                src={item.coverImage}
                alt={item.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Newspaper className="text-primary" size={56} />
              </div>
            )}
            <span className="absolute bottom-3 left-3 z-10 w-fit rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
              {categoryName}
            </span>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            {formatDate(item.createdAt)}
          </p>

          <div
            className="blog-content mt-8"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(item.content, {
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

          <div className="mt-12 flex justify-center">
            <Link
              href="/xeberler"
              className="rounded-[var(--radius)] border border-border bg-card px-6 py-3 text-foreground transition-colors hover:bg-accent"
            >
              Bütün Xəbərlərə Qayıt
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 border-t border-border pt-8 md:grid-cols-2">
            {prevItem ? (
              <Link
                href={`/xeberler/${prevItem.slug}`}
                className="flex flex-col gap-2 rounded-[var(--radius)] border border-border bg-card p-6 transition-opacity hover:opacity-80"
              >
                <span className="text-xs font-semibold tracking-wide text-muted-foreground">
                  ÖNCƏKİ
                </span>
                <span className="line-clamp-2 font-serif text-lg text-foreground md:text-xl">
                  {prevItem.title}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {nextItem ? (
              <Link
                href={`/xeberler/${nextItem.slug}`}
                className="flex flex-col gap-2 rounded-[var(--radius)] border border-border bg-card p-6 text-right transition-opacity hover:opacity-80"
              >
                <span className="text-xs font-semibold tracking-wide text-muted-foreground">
                  SONRAKİ
                </span>
                <span className="line-clamp-2 font-serif text-lg text-foreground md:text-xl">
                  {nextItem.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
