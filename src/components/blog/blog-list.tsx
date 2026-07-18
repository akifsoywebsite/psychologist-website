"use client";

import { useState } from "react";
import type { Blog, Category } from "@/lib/types";
import BlogCard from "./blog-card";

const PAGE_SIZE = 6;

export default function BlogList({
  blogs,
  categories,
}: {
  blogs: Blog[];
  categories: Category[];
}) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const selectCategory = (slug: string | null) => {
    setSelectedSlug(slug);
    setVisibleCount(PAGE_SIZE);
  };

  const filteredBlogs = selectedSlug
    ? blogs.filter((blog) => blog.category === selectedSlug)
    : blogs;

  const visibleBlogs = filteredBlogs.slice(0, visibleCount);
  const hasMore = visibleCount < filteredBlogs.length;

  return (
    <div>
      <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto whitespace-nowrap pb-1">
        <button
          type="button"
          onClick={() => selectCategory(null)}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${
            selectedSlug === null
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-foreground hover:bg-accent"
          }`}
        >
          Hamısı
        </button>
        {categories.map((category) => (
          <button
            key={category.slug}
            type="button"
            onClick={() => selectCategory(category.slug)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${
              selectedSlug === category.slug
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-accent"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {filteredBlogs.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          Bu kateqoriyada hələ məqalə yoxdur.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} className="w-full" />
            ))}
          </div>

          {hasMore && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                className="rounded-[var(--radius)] border border-border bg-card px-6 py-3 text-foreground transition-colors hover:bg-accent"
              >
                Daha Çox Göstər
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
