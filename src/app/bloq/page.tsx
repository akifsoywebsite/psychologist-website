import type { Metadata } from "next";
import {
  collection,
  getDocs,
  orderBy,
  query,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Blog, Category } from "@/lib/types";
import BlogList from "@/components/blog/blog-list";

export const metadata: Metadata = {
  title: "Bloq | Murad Akifsoy",
  description:
    "Uşaq və yeniyetmə psixologiyası mövzusunda faydalı məqalələr və tövsiyələr.",
};

async function getBlogs(): Promise<Blog[]> {
  const blogsQuery = query(
    collection(db, "blogs"),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(blogsQuery);

  const blogs = snapshot.docs.map((doc) => {
    const data = doc.data() as Omit<Blog, "id" | "createdAt"> & {
      createdAt: Timestamp;
    };

    // Firestore Timestamp instances don't survive the server -> client
    // component boundary (React Flight strips methods from custom class
    // instances), so convert to a plain Date before it's ever passed down.
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
    };
  });

  return blogs.filter((blog) => blog.status !== "draft");
}

async function getCategories(): Promise<Category[]> {
  const snapshot = await getDocs(collection(db, "categories"));
  return snapshot.docs.map((doc) => doc.data() as Category);
}

export default async function BlogPage() {
  const [blogs, categories] = await Promise.all([
    getBlogs(),
    getCategories(),
  ]);

  return (
    <main className="flex flex-1 flex-col bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Bloq
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
            Bütün Məqalələr
          </h1>
        </div>

        <BlogList blogs={blogs} categories={categories} />
      </div>
    </main>
  );
}
