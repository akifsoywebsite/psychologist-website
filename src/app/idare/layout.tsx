"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { createPortal } from "react-dom";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import {
  Briefcase,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  X,
  type LucideIcon,
} from "lucide-react";
import { auth } from "@/lib/firebase";

const navLinks: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/idare", label: "Ana Səhifə", icon: LayoutDashboard },
  { href: "/idare/xidmetler", label: "Xidmətlər", icon: Briefcase },
  { href: "/idare/bloqlar", label: "Bloqlar", icon: Newspaper },
  { href: "/idare/mezmun", label: "Sayt Məzmunu", icon: FileText },
];

const emptySubscribe = () => () => {};

function isLinkActive(pathname: string, href: string) {
  return href === "/idare" ? pathname === "/idare" : pathname.startsWith(href);
}

function SidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {navLinks.map(({ href, label, icon: Icon }) => {
        const active = isLinkActive(pathname, href);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-[var(--radius)] border-l-4 px-3 py-2 text-sm transition-colors ${
              active
                ? "border-primary bg-sidebar-accent text-sidebar-foreground"
                : "border-transparent text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function IdareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const isLoginRoute = pathname.startsWith("/idare/login");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isLoginRoute) return;
    if (!checkingAuth && !user) {
      router.push("/idare/login");
    }
  }, [isLoginRoute, checkingAuth, user, router]);

  if (isLoginRoute) {
    return <>{children}</>;
  }

  if (checkingAuth || !user) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <p className="text-muted-foreground">Yüklənir...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/idare/login");
  };

  return (
    <div className="dashboard-theme flex flex-1 bg-background">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar px-4 py-6 text-sidebar-foreground shadow-lg md:flex">
        <div className="mb-8">
          <p className="font-serif font-semibold text-sidebar-foreground">
            Murad Akifsoy
          </p>
          <p className="text-xs text-sidebar-foreground/70">
            İdarəetmə Paneli
          </p>
          <Link
            href="/"
            className="mt-3 flex items-center gap-2 rounded-[var(--radius)] px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <ExternalLink size={16} />
            Sayta Qayıt
          </Link>
        </div>

        <SidebarNav pathname={pathname} />

        <button
          type="button"
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 rounded-[var(--radius)] px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LogOut size={18} />
          Çıxış
        </button>
      </aside>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-4 md:hidden">
          <div>
            <p className="font-serif font-semibold text-foreground">
              Murad Akifsoy
            </p>
            <p className="text-xs text-muted-foreground">İdarəetmə Paneli</p>
          </div>
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Menyunu aç"
            aria-expanded={isMenuOpen}
            className="text-foreground"
          >
            <Menu size={24} />
          </button>
        </div>

        <main className="flex-1 bg-background p-6 md:p-8">{children}</main>
      </div>

      {isMounted && isMenuOpen
        ? createPortal(
            <div className="dashboard-theme fixed inset-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground md:hidden">
              <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-4">
                <div>
                  <p className="font-serif font-semibold text-sidebar-foreground">
                    Murad Akifsoy
                  </p>
                  <p className="text-xs text-sidebar-foreground/70">
                    İdarəetmə Paneli
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Menyunu bağla"
                  className="text-sidebar-foreground"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 px-4 py-6">
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="mb-4 flex items-center gap-2 rounded-[var(--radius)] px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                >
                  <ExternalLink size={16} />
                  Sayta Qayıt
                </Link>

                <SidebarNav
                  pathname={pathname}
                  onNavigate={() => setIsMenuOpen(false)}
                />
              </div>

              <div className="border-t border-sidebar-border px-4 py-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-3 rounded-[var(--radius)] px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                >
                  <LogOut size={18} />
                  Çıxış
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
