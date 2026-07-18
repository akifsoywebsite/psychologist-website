"use client";

import { useEffect, useRef } from "react";
import type { Blog } from "@/lib/types";
import BlogCard from "@/components/blog/blog-card";

const AUTO_SCROLL_SPEED = 0.5;
const TOUCH_RESUME_DELAY = 3000;

export default function BlogsCarousel({ blogs }: { blogs: Blog[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // scroll-snap-type: mandatory rejects any JS scrollLeft write that isn't
    // snap-aligned, snapping straight back to the nearest card. Auto-scroll
    // has to disable snapping while it's driving, and restore it whenever
    // the user takes over so manual swipes still snap.
    let frameId: number;
    let wasPaused = isPausedRef.current;
    el.style.scrollSnapType = wasPaused ? "" : "none";

    const step = () => {
      const paused = isPausedRef.current;
      if (paused !== wasPaused) {
        el.style.scrollSnapType = paused ? "" : "none";
        wasPaused = paused;
      }

      if (!paused) {
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll > 0) {
          if (el.scrollLeft >= maxScroll - 1) {
            el.scrollLeft = 0;
          } else {
            el.scrollLeft += AUTO_SCROLL_SPEED;
          }
        }
      }
      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frameId);
      el.style.scrollSnapType = "";
    };
  }, []);

  const pause = () => {
    isPausedRef.current = true;
  };

  const resume = () => {
    isPausedRef.current = false;
  };

  const handleTouchEnd = () => {
    if (resumeTimeoutRef.current !== null) {
      clearTimeout(resumeTimeoutRef.current);
    }
    resumeTimeoutRef.current = setTimeout(resume, TOUCH_RESUME_DELAY);
  };

  return (
    <div
      ref={scrollRef}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={pause}
      onTouchEnd={handleTouchEnd}
      className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
    >
      {blogs.map((blog) => (
        <BlogCard
          key={blog.id}
          blog={blog}
          className="w-[280px] shrink-0 snap-start md:w-[320px]"
        />
      ))}
    </div>
  );
}
