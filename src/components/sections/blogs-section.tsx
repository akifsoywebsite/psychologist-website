import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Blog } from "@/lib/types";
import BlogsCarousel from "./blogs-carousel";

async function getBlogs(): Promise<Blog[]> {
  const blogsQuery = query(
    collection(db, "blogs"),
    orderBy("createdAt", "desc"),
    limit(7),
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

export default async function BlogsSection() {
  const blogs = await getBlogs();

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="font-serif text-2xl text-foreground md:text-3xl">
            Bloqlarım
          </h2>

          <Link
            href="/bloq"
            className="inline-flex items-center gap-2 text-primary transition-colors hover:text-foreground"
          >
            Hamısına bax
            <ArrowRight size={18} />
          </Link>
        </div>

        <BlogsCarousel blogs={blogs} />
      </div>
    </section>
  );
}
