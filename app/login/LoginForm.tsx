"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import AuthShell from "@/app/components/AuthShell";
import Field from "@/app/components/Field";
import { useAuth } from "@/app/providers/AuthProvider";
import { useToast } from "@/app/providers/ToastProvider";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, user, loading: authLoading } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const next = params.get("next");

  // Already signed in — bounce to where they belong.
  useEffect(() => {
    if (authLoading || !user) return;
    router.replace(next || (user.role === "admin" ? "/admin" : "/menu"));
  }, [user, authLoading, next, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const signedIn = await login(email.trim(), password);

      // One form, two destinations: admins land in the dashboard,
      // customers go back to whatever they were doing.
      if (signedIn.role === "admin") {
        toast(`Welcome back, ${signedIn.name.split(" ")[0]} — admin access`);
        router.push(next || "/admin");
      } else {
        toast(`Welcome back, ${signedIn.name.split(" ")[0]}`);
        router.push(next || "/menu");
      }
    } catch (caught) {
      const message = (caught as Error).message;
      setError(message);
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back."
      subtitle="Sign in with your email and password to order, track and reorder."
      footer={
        <>
          New to Ricemania?{" "}
          <Link
            href="/register"
            className="font-semibold text-carrot-600 transition-colors hover:text-carrot-700"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div
            role="alert"
            className="animate-slide-left flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            <svg viewBox="0 0 16 16" className="mt-0.5 size-4 shrink-0" aria-hidden>
              <circle
                cx="8"
                cy="8"
                r="6.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path
                d="M8 4.8v3.6M8 10.8v.2"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            {error}
          </div>
        )}

        <Field
          label="Email address"
          type="email"
          name="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
          required
          disabled={submitting}
        />

        <Field
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="current-password"
          required
          disabled={submitting}
        />

        <button
          type="submit"
          disabled={submitting || !email || !password}
          className="group relative w-full overflow-hidden rounded-2xl bg-ink-900 py-4 text-sm font-semibold text-white shadow-lg shadow-ink-900/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {submitting && (
              <svg viewBox="0 0 16 16" className="size-4 animate-spin" aria-hidden>
                <circle
                  cx="8"
                  cy="8"
                  r="6"
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.3"
                  strokeWidth="2"
                />
                <path
                  d="M8 2a6 6 0 0 1 6 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
            {submitting ? "Signing you in" : "Sign in"}
          </span>
          <span className="absolute inset-0 origin-left scale-x-0 bg-carrot-500 transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 group-disabled:scale-x-0" />
        </button>
      </form>
    </AuthShell>
  );
}
