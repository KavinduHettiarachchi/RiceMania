"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import AuthShell from "@/app/components/AuthShell";
import Field from "@/app/components/Field";
import { useAuth } from "@/app/providers/AuthProvider";
import { useToast } from "@/app/providers/ToastProvider";

/** Four levels of visual feedback — nudges people past a 4-character password. */
function strengthOf(password: string): { score: number; label: string } {
  if (!password) return { score: 0, label: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password) || /[^\w\s]/.test(password)) score++;

  const labels = ["Too short", "Weak", "Fair", "Good", "Strong"];
  return { score, label: labels[score] };
}

const BAR_COLOR = [
  "bg-ink-200",
  "bg-rose-400",
  "bg-amber-400",
  "bg-lime-500",
  "bg-emerald-500",
];

export default function RegisterForm() {
  const router = useRouter();
  const { register, login } = useAuth();
  const toast = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const strength = strengthOf(password);
  const mismatch = confirm.length > 0 && confirm !== password;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }

    if (password.length < 6) {
      setError("Use at least 6 characters for your password.");
      return;
    }

    setSubmitting(true);

    try {
      await register(name.trim(), email.trim(), password);
      // Registration doesn't return a token, so sign in straight after
      // to save the customer typing it all again.
      await login(email.trim(), password);
      toast(`Welcome to Ricemania, ${name.trim().split(" ")[0]}`);
      router.push("/menu");
    } catch (caught) {
      setError((caught as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Join the table."
      subtitle="Create an account to order, save your cart and follow every dish out of the kitchen."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-carrot-600 transition-colors hover:text-carrot-700"
          >
            Sign in
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
          label="Full name"
          name="name"
          value={name}
          onChange={setName}
          placeholder="Nimal Perera"
          autoComplete="name"
          required
          disabled={submitting}
        />

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

        <div>
          <Field
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={setPassword}
            placeholder="At least 6 characters"
            autoComplete="new-password"
            required
            disabled={submitting}
          />

          {password && (
            <div className="mt-2.5 flex items-center gap-3">
              <div className="flex flex-1 gap-1">
                {[0, 1, 2, 3].map((index) => (
                  <span
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-colors duration-400 ${
                      index < strength.score
                        ? BAR_COLOR[strength.score]
                        : "bg-ink-100"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-ink-400">
                {strength.label}
              </span>
            </div>
          )}
        </div>

        <Field
          label="Confirm password"
          type="password"
          name="confirm"
          value={confirm}
          onChange={setConfirm}
          placeholder="Type it once more"
          autoComplete="new-password"
          required
          disabled={submitting}
          hint={mismatch ? "These don't match yet." : undefined}
        />

        <button
          type="submit"
          disabled={submitting || !name || !email || !password || mismatch}
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
            {submitting ? "Setting your table" : "Create account"}
          </span>
          <span className="absolute inset-0 origin-left scale-x-0 bg-carrot-500 transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 group-disabled:scale-x-0" />
        </button>

        <p className="text-center text-xs leading-relaxed text-ink-400">
          By creating an account you agree to our terms and privacy policy.
        </p>
      </form>
    </AuthShell>
  );
}
