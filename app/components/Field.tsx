"use client";

import { useId, useState } from "react";

interface FieldProps {
  label: string;
  type?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  hint?: string;
  disabled?: boolean;
}

export default function Field({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
  hint,
  disabled,
}: FieldProps) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink-500"
      >
        {label}
      </label>

      <div className="relative mt-2">
        <input
          id={id}
          name={name}
          type={isPassword && revealed ? "text" : type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          className={`w-full rounded-2xl border border-ink-200 bg-white px-4 py-3.5 text-sm text-ink-900 outline-none transition-all duration-300 placeholder:text-ink-300 focus:border-carrot-400 focus:ring-4 focus:ring-carrot-500/10 disabled:bg-ink-50 disabled:text-ink-400 ${
            isPassword ? "pr-12" : ""
          }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((open) => !open)}
            aria-label={revealed ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-700"
          >
            {revealed ? (
              <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
                <path
                  d="M3 10s2.8-4.5 7-4.5S17 10 17 10s-2.8 4.5-7 4.5S3 10 3 10Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle
                  cx="10"
                  cy="10"
                  r="2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="m4 16 12-12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
                <path
                  d="M3 10s2.8-4.5 7-4.5S17 10 17 10s-2.8 4.5-7 4.5S3 10 3 10Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle
                  cx="10"
                  cy="10"
                  r="2.2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            )}
          </button>
        )}
      </div>

      {hint && <p className="mt-1.5 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}
