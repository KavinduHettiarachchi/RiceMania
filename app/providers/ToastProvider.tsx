"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type ToastTone = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_STYLE: Record<ToastTone, string> = {
  success: "bg-ink-900 text-white",
  error: "bg-rose-600 text-white",
  info: "bg-carrot-500 text-white",
};

const ICON: Record<ToastTone, React.ReactNode> = {
  success: (
    <path
      d="M4 8.5 6.8 11.2 12 5.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  error: (
    <path
      d="M8 4.5v4.2M8 11.3v.2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  ),
  info: (
    <path
      d="M8 7.2v4.3M8 4.6v.2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  ),
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const toast = useCallback((message: string, tone: ToastTone = "success") => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message, tone }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3600);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext value={value}>
      {children}

      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex w-[min(92vw,26rem)] -translate-x-1/2 flex-col gap-2 sm:bottom-8"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`animate-bounce-in pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium shadow-xl shadow-ink-900/15 ${TONE_STYLE[item.tone]}`}
          >
            <svg viewBox="0 0 16 16" className="size-4 shrink-0" aria-hidden>
              <circle
                cx="8"
                cy="8"
                r="7"
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.45"
                strokeWidth="1.4"
              />
              {ICON[item.tone]}
            </svg>
            <span className="leading-snug">{item.message}</span>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return context.toast;
}
