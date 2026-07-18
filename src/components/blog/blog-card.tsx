import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import type { Blog } from "@/lib/types";

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

export default function BlogCard({
  blog,
  className = "",
}: {
  blog: Blog;
  className?: string;
}) {
  return (
    <Link
      href={`/bloq/${blog.slug}`}
      className={`flex flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      <div className="relative aspect-[16/10] w-full bg-accent">
        {blog.coverImage ? (
          <Image
            src={blog.coverImage}
            alt={blog.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Newspaper className="text-primary" size={32} />
          </div>
        )}
        <span className="absolute bottom-3 left-3 z-10 w-fit rounded-full bg-secondary/95 px-3 py-1 text-xs text-secondary-foreground shadow-sm">
          {blog.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-2 font-semibold text-foreground">
          {blog.title}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {blog.excerpt}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">
            {formatDate(blog.createdAt)}
          </span>
          <ArrowRight className="text-primary" size={18} />
        </div>
      </div>
    </Link>
  );
}
