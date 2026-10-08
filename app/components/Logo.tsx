import Link from "next/link";

interface LogoProps {
  /** Inverts the wordmark for dark backgrounds (the footer). */
  light?: boolean;
  href?: string | null;
  className?: string;
  showWord?: boolean;
}

/**
 * Ricemania mark — a steaming rice bowl built from grains.
 * The grains drift on hover, the steam rises continuously.
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`group/mark relative grid size-10 shrink-0 place-items-center rounded-[14px] bg-carrot-500 text-white shadow-lg shadow-carrot-500/25 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 hover:rotate-[-6deg] ${className}`}
    >
      <svg viewBox="0 0 32 32" className="size-6" aria-hidden>
        {/* steam */}
        <g
          className="origin-center"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        >
          <path d="M12 8.4c1.6-1.1 0-2.4 0-3.4">
            <animate
              attributeName="opacity"
              values="0.15;0.9;0.15"
              dur="3s"
              repeatCount="indefinite"
            />
          </path>
          <path d="M16 7.8c1.6-1.1 0-2.6 0-3.8">
            <animate
              attributeName="opacity"
              values="0.9;0.2;0.9"
              dur="3s"
              begin="0.5s"
              repeatCount="indefinite"
            />
          </path>
          <path d="M20 8.4c1.6-1.1 0-2.4 0-3.4">
            <animate
              attributeName="opacity"
              values="0.3;1;0.3"
              dur="3s"
              begin="1s"
              repeatCount="indefinite"
            />
          </path>
        </g>

        {/* bowl */}
        <path
          d="M4.5 15.5h23c0 6.1-5.1 11-11.5 11S4.5 21.6 4.5 15.5Z"
          fill="currentColor"
        />
        {/* rice heap */}
        <g fill="currentColor" className="transition-transform duration-500 group-hover/mark:-translate-y-[1px]">
          <ellipse cx="11" cy="13.6" rx="3.1" ry="2.1" transform="rotate(-18 11 13.6)" />
          <ellipse cx="16" cy="12.4" rx="3.1" ry="2.1" transform="rotate(6 16 12.4)" />
          <ellipse cx="21" cy="13.6" rx="3.1" ry="2.1" transform="rotate(20 21 13.6)" />
        </g>
        {/* bowl foot */}
        <path
          d="M13 28.5h6"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export default function Logo({
  light = false,
  href = "/",
  className = "",
  showWord = true,
}: LogoProps) {
  const content = (
    <span className={`group flex items-center gap-2.5 ${className}`}>
      <LogoMark />
      {showWord && (
        <span className="flex flex-col leading-none">
          <span
            className={`font-display text-[1.35rem] font-semibold tracking-tight ${
              light ? "text-white" : "text-ink-900"
            }`}
          >
            Rice<span className="text-carrot-500">mania</span>
          </span>
          <span
            className={`mt-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.22em] ${
              light ? "text-white/50" : "text-ink-400"
            }`}
          >
            Ceylon Kitchen
          </span>
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label="Ricemania home">
      {content}
    </Link>
  );
}
