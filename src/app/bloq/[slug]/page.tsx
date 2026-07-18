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
import DOMPurify from "isomorphic-dompurify";
import { db } from "@/lib/firebase";
import type { Blog, Category } from "@/lib/types";

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

function formatDate(createdAt: Blog["createdAt"]): string {
  return `${createdAt.getDate()} ${monthNames[createdAt.getMonth()]} ${createdAt.getFullYear()}`;
}

// Wrapped in React's cache() so generateMetadata and the page component
// (both invoked per-request) share a single Firestore read instead of two.
const getBlog = cache(async (slug: string): Promise<Blog | null> => {
  const snapshot = await getDoc(doc(db, "blogs", slug));
  if (!snapshot.exists()) return null;

  const data = snapshot.data() as Omit<Blog, "id" | "createdAt"> & {
    createdAt: Timestamp;
  };

  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt.toDate(),
  };
});

async function getCategories(): Promise<Category[]> {
  const snapshot = await getDocs(collection(db, "categories"));
  return snapshot.docs.map((doc) => doc.data() as Category);
}

async function getAllBlogsSorted(): Promise<Blog[]> {
  const blogsQuery = query(
    collection(db, "blogs"),
    orderBy("createdAt", "asc"),
  );
  const snapshot = await getDocs(blogsQuery);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as Omit<Blog, "id" | "createdAt"> & {
      createdAt: Timestamp;
    };

    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
    };
  });
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) return {};

  return {
    title: `${blog.title} | Murad Akifsoy`,
    description: blog.excerpt,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) notFound();

  const categories = await getCategories();
  const categoryName =
    categories.find((category) => category.slug === blog.category)?.name ??
    blog.category;

  const allBlogs = await getAllBlogsSorted();
  const currentIndex = allBlogs.findIndex((b) => b.id === blog.id);
  const prevBlog = currentIndex > 0 ? allBlogs[currentIndex - 1] : null;
  const nextBlog =
    currentIndex >= 0 && currentIndex < allBlogs.length - 1
      ? allBlogs[currentIndex + 1]
      : null;

  return (
    <main className="flex flex-1 flex-col bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 py-16 md:px-8 md:py-24">
        <Link
          href="/bloq"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft size={16} />
          Bütün məqalələr
        </Link>

        <h1 className="mt-6 font-serif text-3xl font-bold text-foreground md:text-4xl">
          {blog.title}
        </h1>

        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-[var(--radius)] bg-accent">
          {blog.coverImage ? (
            <Image
              src={blog.coverImage}
              alt={blog.title}
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
          {formatDate(blog.createdAt)}
        </p>

        <div
          className="blog-content mt-8"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(blog.content),
          }}
        />

        <div className="mt-12 flex justify-center">
          <Link
            href="/bloq"
            className="rounded-[var(--radius)] border border-border bg-card px-6 py-3 text-foreground transition-colors hover:bg-accent"
          >
            Bütün Məqalələrə Qayıt
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 border-t border-border pt-8 md:grid-cols-2">
          {prevBlog ? (
            <Link
              href={`/bloq/${prevBlog.slug}`}
              className="flex flex-col gap-2 rounded-[var(--radius)] border border-border bg-card p-6 transition-opacity hover:opacity-80"
            >
              <span className="text-xs font-semibold tracking-wide text-muted-foreground">
                ÖNCƏKİ
              </span>
              <span className="line-clamp-2 font-serif text-lg text-foreground md:text-xl">
                {prevBlog.title}
              </span>
            </Link>
          ) : (
            <div />
          )}

          {nextBlog ? (
            <Link
              href={`/bloq/${nextBlog.slug}`}
              className="flex flex-col gap-2 rounded-[var(--radius)] border border-border bg-card p-6 text-right transition-opacity hover:opacity-80"
            >
              <span className="text-xs font-semibold tracking-wide text-muted-foreground">
                SONRAKİ
              </span>
              <span className="line-clamp-2 font-serif text-lg text-foreground md:text-xl">
                {nextBlog.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </main>
  );
}
