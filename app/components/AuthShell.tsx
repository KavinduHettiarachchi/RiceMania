import Link from "next/link";

import DishArt from "./DishArt";
import Logo from "./Logo";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

/** Split layout shared by sign in and sign up. */
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.05fr]">
      {/* form side */}
      <div className="flex flex-col px-5 py-8 sm:px-10 lg:px-16">
        <Logo />

        <div className="animate-rise mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="font-display text-[2.1rem] font-normal leading-tight tracking-[-0.02em] text-ink-900">
            {title}
          </h1>
          <p className="mt-2.5 text-sm leading-relaxed text-ink-500">
            {subtitle}
          </p>

          <div className="mt-8">{children}</div>

          <div className="mt-7 text-center text-sm text-ink-500">{footer}</div>
        </div>

        <Link
          href="/"
          className="mx-auto inline-flex items-center gap-1.5 text-xs font-medium text-ink-400 transition-colors hover:text-carrot-600"
        >
          <svg viewBox="0 0 14 14" className="size-3" aria-hidden>
            <path
              d="M8.5 3 5 7l3.5 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Ricemania
        </Link>
      </div>

      {/* art side */}
      <aside className="relative hidden overflow-hidden bg-linear-to-br from-lime-glow via-[#f4f8d4] to-carrot-100 lg:block">
        <div
          aria-hidden
          className="animate-float-slow absolute -right-20 top-10 size-72 rounded-full bg-carrot-300/25 blur-3xl"
        />
        <div
          aria-hidden
          className="animate-float absolute -bottom-20 -left-10 size-80 rounded-full bg-carrot-400/20 blur-3xl"
        />

        <div className="relative flex h-full flex-col justify-center px-14 xl:px-20">
          <div className="animate-scale-in relative mx-auto aspect-square w-full max-w-md">
            <div
              aria-hidden
              className="animate-spin-slow absolute inset-[6%] rounded-full border border-dashed border-carrot-500/25"
            />
            <div className="animate-float size-full">
              <DishArt
                name="Ricemania welcome plate"
                steam
                className="size-full rounded-full bg-transparent!"
              />
            </div>
          </div>

          <blockquote className="animate-rise delay-3 mt-10 text-center">
            <p className="font-display text-2xl font-normal leading-snug tracking-[-0.01em] text-ink-900">
              “Rice cooked slow, curry ground fresh, served the way Colombo has
              always eaten.”
            </p>
            <footer className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
              Ricemania · Galle Road
            </footer>
          </blockquote>
        </div>
      </aside>
    </div>
  );
}
