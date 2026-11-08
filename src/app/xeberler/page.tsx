import type { Metadata } from "next";
import {
  collection,
  getDocs,
  orderBy,
  query,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { NewsCategory, NewsItem } from "@/lib/types";
import { SITE_URL } from "@/lib/site";
import BlogList from "@/components/blog/blog-list";

const title = "Xəbərlər | Murad Akifsoy";
const description =
  "Murad Akifsoyun fəaliyyəti, tədbirləri və yenilikləri haqqında son xəbərlər.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/xeberler`,
    images: ["/murad-a.png"],
  },
};

async function getNews(): Promise<NewsItem[]> {
  const newsQuery = query(collection(db, "news"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(newsQuery);

  const news = snapshot.docs.map((doc) => {
    const data = doc.data() as Omit<NewsItem, "id" | "createdAt"> & {
      createdAt: Timestamp;
    };

    // Convert Firestore Timestamp to a plain Date so it survives the
    // server -> client component boundary.
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
    };
  });

  return news.filter((item) => item.status !== "draft");
}

async function getNewsCategories(): Promise<NewsCategory[]> {
  const snapshot = await getDocs(collection(db, "newsCategories"));
  return snapshot.docs.map((doc) => doc.data() as NewsCategory);
}

export default async function NewsPage() {
  const [news, categories] = await Promise.all([
    getNews(),
    getNewsCategories(),
  ]);

  return (
    <main className="flex flex-1 flex-col bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Xəbərlər
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
            Bütün Xəbərlər
          </h1>
        </div>

        <BlogList
          blogs={news}
          categories={categories}
          basePath="/xeberler"
          emptyMessage="Bu kateqoriyada hələ xəbər yoxdur."
        />
      </div>
    </main>
  );
}
