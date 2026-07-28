"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Service } from "@/lib/types";

const AUTO_SCROLL_SPEED = 0.5;
const TOUCH_RESUME_DELAY = 3000;

function ServiceCard({
  service,
  hidden = false,
}: {
  service: Service;
  hidden?: boolean;
}) {
  return (
    <Link
      href={`/xidmetler/${service.slug}`}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      className="flex w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-sm transition-shadow hover:shadow-md md:w-[300px]"
    >
      <div className="relative aspect-[16/10] w-full bg-accent">
        {service.imageUrl ? (
          <Image
            src={service.imageUrl}
            alt={service.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Sparkles className="text-primary" size={32} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="font-semibold text-foreground">{service.title}</h3>
        <p className="text-sm text-muted-foreground">{service.summary}</p>
        <div className="mt-auto flex justify-end">
          <ArrowRight className="text-primary" size={18} />
        </div>
      </div>
    </Link>
  );
}

export default function ServicesCarousel({ services }: { services: Service[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);
  const loopDistanceRef = useRef(0);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // The item list is rendered twice back-to-back below, so the container
    // holds two visually identical copies in a row. The loop distance is the
    // exact pixel offset from the start of the first copy to the start of
    // the second — measured from the DOM (not approximated as scrollWidth /
    // 2, which is off by half a gap) so the wrap-around lands on a
    // pixel-perfect match and produces no visible jump.
    const measureLoopDistance = () => {
      const marker = el.children[services.length] as HTMLElement | undefined;
      if (!marker) {
        loopDistanceRef.current = 0;
        return;
      }
      const containerRect = el.getBoundingClientRect();
      const markerRect = marker.getBoundingClientRect();
      loopDistanceRef.current =
        markerRect.left - containerRect.left + el.scrollLeft;
    };

    measureLoopDistance();

    const resizeObserver = new ResizeObserver(measureLoopDistance);
    resizeObserver.observe(el);

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
        const loopDistance = loopDistanceRef.current;
        if (loopDistance > 0) {
          el.scrollLeft += AUTO_SCROLL_SPEED;
          if (el.scrollLeft >= loopDistance) {
            el.scrollLeft -= loopDistance;
          }
        }
      }
      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      el.style.scrollSnapType = "";
    };
  }, [services.length]);

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
      className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
    >
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
      {services.map((service) => (
        <ServiceCard key={`${service.id}-duplicate`} service={service} hidden />
      ))}
    </div>
  );
}
