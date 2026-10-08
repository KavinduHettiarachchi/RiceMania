/**
 * Deterministic plated-dish illustration used wherever a Food has no photo.
 * The seed comes from the dish name, so the same dish always draws the same
 * plate — it reads as art direction rather than a random placeholder.
 */

const PALETTES = [
  { rice: "#f6e4c3", accent: "#e8622a", herb: "#7ba05b", plate: "#fff1df" },
  { rice: "#fbe9cd", accent: "#c8471c", herb: "#8fae63", plate: "#ffeede" },
  { rice: "#f3ddb7", accent: "#f0932b", herb: "#6f9350", plate: "#fdf3e4" },
  { rice: "#f8e7cb", accent: "#b9421f", herb: "#94b06a", plate: "#fff0e2" },
  { rice: "#f5e2bd", accent: "#e07b1f", herb: "#7d9c58", plate: "#fef2e6" },
];

function seedOf(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

interface DishArtProps {
  name: string;
  className?: string;
  /** Adds rising steam wisps — used on larger hero-style renders. */
  steam?: boolean;
}

export default function DishArt({
  name,
  className = "",
  steam = false,
}: DishArtProps) {
  const seed = seedOf(name || "rice");
  const palette = PALETTES[seed % PALETTES.length];
  const rotation = (seed % 24) - 12;

  // Garnish positions vary per dish but stay inside the rice mound.
  const garnish = Array.from({ length: 7 }, (_, i) => {
    const angle = ((seed >> (i * 2)) % 360) * (Math.PI / 180);
    const radius = 12 + ((seed >> (i + 3)) % 16);
    return {
      cx: 50 + Math.cos(angle) * radius,
      cy: 48 + Math.sin(angle) * radius * 0.62,
      r: 2 + ((seed >> i) % 3),
      herb: i % 3 === 0,
    };
  });

  return (
    <div
      className={`relative grid place-items-center overflow-hidden ${className}`}
      style={{ background: palette.plate }}
      aria-hidden
    >
      {steam && (
        <>
          <span
            className="steam left-[42%]"
            style={{ animationDelay: "0s", bottom: "62%" }}
          />
          <span
            className="steam left-[50%]"
            style={{ animationDelay: "1.1s", bottom: "66%" }}
          />
          <span
            className="steam left-[58%]"
            style={{ animationDelay: "2.2s", bottom: "62%" }}
          />
        </>
      )}

      <svg
        viewBox="0 0 100 100"
        className="size-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
        style={{ transform: `rotate(${rotation * 0.15}deg)` }}
      >
        <defs>
          <radialGradient id={`plate-${seed}`} cx="50%" cy="42%" r="58%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor={palette.plate} />
          </radialGradient>
          <radialGradient id={`rice-${seed}`} cx="42%" cy="34%" r="70%">
            <stop offset="0%" stopColor="#fffdf8" />
            <stop offset="100%" stopColor={palette.rice} />
          </radialGradient>
        </defs>

        {/* plate */}
        <circle cx="50" cy="50" r="38" fill={`url(#plate-${seed})`} />
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke={palette.accent}
          strokeOpacity="0.16"
          strokeWidth="1"
        />
        <circle
          cx="50"
          cy="50"
          r="31"
          fill="none"
          stroke={palette.accent}
          strokeOpacity="0.1"
          strokeWidth="0.8"
        />

        {/* curry pool */}
        <ellipse
          cx="50"
          cy="52"
          rx="27"
          ry="24"
          fill={palette.accent}
          fillOpacity="0.18"
        />

        {/* rice mound */}
        <ellipse cx="50" cy="48" rx="23" ry="20" fill={`url(#rice-${seed})`} />
        <ellipse
          cx="44"
          cy="42"
          rx="9"
          ry="7"
          fill="#ffffff"
          fillOpacity="0.5"
        />

        {/* rice grain texture */}
        <g fill={palette.accent} fillOpacity="0.22">
          {Array.from({ length: 14 }, (_, i) => {
            const a = ((seed >> i) % 360) * (Math.PI / 180);
            const r = 4 + ((seed >> (i + 1)) % 17);
            return (
              <ellipse
                key={i}
                cx={50 + Math.cos(a) * r}
                cy={48 + Math.sin(a) * r * 0.7}
                rx="2.4"
                ry="1.1"
                transform={`rotate(${(a * 180) / Math.PI} ${50 + Math.cos(a) * r} ${48 + Math.sin(a) * r * 0.7})`}
              />
            );
          })}
        </g>

        {/* garnish — herbs and spice */}
        {garnish.map((g, i) => (
          <circle
            key={i}
            cx={g.cx}
            cy={g.cy}
            r={g.r}
            fill={g.herb ? palette.herb : palette.accent}
            fillOpacity={g.herb ? 0.85 : 0.7}
          />
        ))}

        {/* chilli slice accent */}
        <path
          d={`M${34 + (seed % 8)} ${62} q6 -5 13 -1`}
          fill="none"
          stroke={palette.accent}
          strokeWidth="2.6"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* coriander sprig */}
        <g
          stroke={palette.herb}
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        >
          <path d={`M${58 + (seed % 5)} 38 q4 -4 7 -3`} />
          <path d={`M${58 + (seed % 5)} 38 q1 -5 4 -7`} />
        </g>
      </svg>
    </div>
  );
}
