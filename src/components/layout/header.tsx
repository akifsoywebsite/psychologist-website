"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Ana Səhifə" },
  { href: "/haqqimda", label: "Haqqımda" },
  { href: "/xidmetler", label: "Xidmətlər" },
  { href: "/xeberler", label: "Xəbərlər" },
  { href: "/bloq", label: "Bloq" },
  { href: "/elaqe", label: "Əlaqə" },
];

const emptySubscribe = () => () => {};

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 md:h-20 md:px-8">
        <Link
          href="/"
          className="font-serif text-lg font-bold text-foreground"
        >
          Murad Akifsoy
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground underline decoration-transparent underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Menyunu aç"
          aria-expanded={isMenuOpen}
          className="text-foreground md:hidden"
        >
          <Menu size={28} />
        </button>
      </div>

      {isMounted && isMenuOpen
        ? createPortal(
            <div className="fixed inset-0 z-50 flex flex-col bg-background md:hidden">
              <div className="flex h-16 items-center justify-between px-4">
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="font-serif text-lg font-bold text-foreground"
                >
                  Murad Akifsoy
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Menyunu bağla"
                  className="text-foreground"
                >
                  <X size={28} />
                </button>
              </div>

              <nav className="flex flex-1 flex-col items-start justify-center gap-6 px-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-2xl font-medium text-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>,
            document.body,
          )
        : null}
    </header>
  );
}
