"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Baby,
  GraduationCap,
  Home,
  Sparkles,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Service } from "@/lib/types";

const iconMap: Record<string, LucideIcon> = {
  child: Baby,
  teen: UserRound,
  parent: Users,
  family: Home,
  school: GraduationCap,
};

const AUTO_SCROLL_SPEED = 0.5;
const TOUCH_RESUME_DELAY = 3000;

export default function ServicesCarousel({ services }: { services: Service[] }) {
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
      {services.map((service) => {
        const Icon = iconMap[service.icon] ?? Sparkles;

        return (
          <Link
            key={service.id}
            href={`/xidmetler/${service.slug}`}
            className="flex w-[260px] shrink-0 snap-start flex-col gap-3 rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md md:w-[300px]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
              <Icon className="text-primary" size={22} />
            </div>
            <h3 className="font-semibold text-foreground">{service.title}</h3>
            <p className="text-sm text-muted-foreground">{service.summary}</p>
            <div className="mt-auto flex justify-end">
              <ArrowRight className="text-primary" size={18} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
