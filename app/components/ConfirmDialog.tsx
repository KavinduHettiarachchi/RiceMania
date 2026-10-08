"use client";

import { useEffect } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Delete",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center p-5">
      <div
        onClick={onCancel}
        aria-hidden
        className="animate-fade absolute inset-0 bg-ink-950/50 backdrop-blur-[2px]"
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="animate-scale-in relative w-full max-w-sm rounded-3xl bg-white p-7 shadow-2xl"
      >
        <div className="grid size-12 place-items-center rounded-full bg-rose-50 text-rose-500">
          <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
            <path
              d="M12 8.5v5M12 16.8v.2M10.3 4.2 2.9 17.5A1.5 1.5 0 0 0 4.2 19.8h15.6a1.5 1.5 0 0 0 1.3-2.3L13.7 4.2a1.5 1.5 0 0 0-2.6 0Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2
          id="confirm-title"
          className="mt-5 font-display text-xl font-semibold text-ink-900"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">{body}</p>

        <div className="mt-7 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 rounded-full border border-ink-200 py-3 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50 disabled:opacity-50"
          >
            Keep it
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 rounded-full bg-rose-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
