import Link from "next/link";
import { Camera, ThumbsUp, type LucideIcon } from "lucide-react";

const navLinks = [
  { href: "/", label: "Ana Səhifə" },
  { href: "/haqqimda", label: "Haqqımda" },
  { href: "/xidmetler", label: "Xidmətlər" },
  { href: "/bloq", label: "Bloq" },
  { href: "/elaqe", label: "Əlaqə" },
];

const socialLinks: { icon: LucideIcon; label: string; href: string }[] = [
  { icon: Camera, label: "Instagram", href: "#" },
  { icon: ThumbsUp, label: "Facebook", href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 md:flex-row md:items-start md:justify-between md:gap-4 md:px-8">
        <div>
          <p className="font-serif font-semibold text-foreground">
            Murad Akifsoy
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Uşaq və Yeniyetmə Psixoloqu
          </p>
        </div>

        <nav className="flex flex-col gap-3 text-sm md:flex-row md:items-center md:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {socialLinks.map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>

      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground md:px-8">
        © 2026 Murad Akifsoy. Bütün hüquqlar qorunur.
      </div>
    </footer>
  );
}
