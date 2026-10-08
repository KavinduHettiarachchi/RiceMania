import Link from "next/link";

interface SectionHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  action?: { href: string; label: string };
  align?: "left" | "center";
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={`flex flex-col gap-6 sm:flex-row sm:items-end ${
        centered ? "sm:justify-center" : "sm:justify-between"
      }`}
    >
      <div className={`max-w-xl ${centered ? "mx-auto text-center" : ""}`}>
        <p
          className={`flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-carrot-600 ${
            centered ? "justify-center" : ""
          }`}
        >
          <span className="h-px w-8 bg-carrot-400" />
          {eyebrow}
          {centered && <span className="h-px w-8 bg-carrot-400" />}
        </p>

        <h2 className="text-balance mt-4 font-display text-[2rem] font-normal leading-[1.1] tracking-[-0.02em] text-ink-900 sm:text-[2.6rem]">
          {title}
        </h2>

        {description && (
          <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-500">
            {description}
          </p>
        )}
      </div>

      {action && !centered && (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-ink-900 transition-colors hover:text-carrot-600"
        >
          {action.label}
          <span className="grid size-8 place-items-center rounded-full border border-ink-900/15 transition-all duration-300 group-hover:translate-x-1 group-hover:border-carrot-500 group-hover:bg-carrot-500 group-hover:text-white">
            <svg viewBox="0 0 14 14" className="size-3.5" aria-hidden>
              <path
                d="M2.5 7h9M8 3.5 11.5 7 8 10.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </Link>
      )}
    </div>
  );
}
