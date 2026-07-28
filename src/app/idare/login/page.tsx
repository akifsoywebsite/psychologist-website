"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

const FAILED_ATTEMPTS_KEY = "idareLoginFailedAttempts";
const LOCKOUT_UNTIL_KEY = "idareLoginLockoutUntil";

function lockoutDurationMs(group: number): number {
  if (group === 1) return 30 * 1000;
  if (group === 2) return 2 * 60 * 1000;
  return 5 * 60 * 1000;
}

function readStoredAttempts(): number {
  if (typeof window === "undefined") return 0;
  const stored = sessionStorage.getItem(FAILED_ATTEMPTS_KEY);
  return stored ? Number(stored) : 0;
}

function readStoredLockout(): number | null {
  if (typeof window === "undefined") return null;
  const stored = sessionStorage.getItem(LOCKOUT_UNTIL_KEY);
  return stored ? Number(stored) : null;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [failedAttempts, setFailedAttempts] = useState<number>(readStoredAttempts);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(readStoredLockout);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    sessionStorage.setItem(FAILED_ATTEMPTS_KEY, String(failedAttempts));
    if (lockoutUntil === null) {
      sessionStorage.removeItem(LOCKOUT_UNTIL_KEY);
    } else {
      sessionStorage.setItem(LOCKOUT_UNTIL_KEY, String(lockoutUntil));
    }
  }, [failedAttempts, lockoutUntil]);

  // Updates the live countdown once a second while locked out, and clears
  // the lockout once time is up. The state updates only ever happen inside
  // the timer callbacks (never synchronously in the effect body itself).
  useEffect(() => {
    if (lockoutUntil === null) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining <= 0) setLockoutUntil(null);
    };
    const timeout = setTimeout(tick, 0);
    const interval = setInterval(tick, 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [lockoutUntil]);

  const isLockedOut = lockoutUntil !== null && secondsRemaining > 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLockedOut) return;

    setIsSubmitting(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setFailedAttempts(0);
      setLockoutUntil(null);
      router.push("/idare");
    } catch {
      setIsSubmitting(false);
      setFailedAttempts((prev) => {
        const next = prev + 1;
        if (next % 3 === 0) {
          setLockoutUntil(Date.now() + lockoutDurationMs(next / 3));
        } else {
          setError("E-poçt və ya şifrə yanlışdır.");
        }
        return next;
      });
    }
  };

  const isDisabled = isSubmitting || isLockedOut;

  return (
    <div className="dashboard-theme flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-[var(--radius)] border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="font-serif text-lg font-semibold text-foreground">
            Murad Akifsoy
          </p>
          <p className="text-sm text-muted-foreground">İdarəetmə Paneli</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              E-poçt
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={isDisabled}
              className="w-full rounded-[var(--radius)] border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Şifrə
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={isDisabled}
              className="w-full rounded-[var(--radius)] border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isDisabled}
            className="w-full rounded-[var(--radius)] bg-primary py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Daxil ol
          </button>

          {isLockedOut ? (
            <p className="text-sm text-destructive">
              Çox sayda uğursuz cəhd. Zəhmət olmasa {secondsRemaining} saniyə
              sonra yenidən cəhd edin.
            </p>
          ) : (
            error && <p className="text-sm text-destructive">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}
