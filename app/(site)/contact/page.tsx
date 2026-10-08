import type { Metadata } from "next";

import Reveal from "@/app/components/Reveal";
import ReservationForm from "./ReservationForm";

export const metadata: Metadata = {
  title: "Contact & reservations",
  description:
    "Book a table at Ricemania on Galle Road, Colombo 03, or get in touch with the kitchen.",
};

const DETAILS = [
  {
    label: "Find us",
    lines: ["No. 42, Galle Road", "Colombo 03, Sri Lanka"],
  },
  {
    label: "Call the kitchen",
    lines: ["+94 11 234 5678", "+94 77 123 4567"],
  },
  {
    label: "Write to us",
    lines: ["hello@ricemania.lk", "orders@ricemania.lk"],
  },
  {
    label: "Open hours",
    lines: ["Mon–Sat · 09.00am–10.00pm", "Sunday · 04.00pm–10.00pm"],
  },
];

export default function ContactPage() {
  return (
    <>
      <header className="relative overflow-hidden border-b border-ink-900/[0.06] bg-linear-to-b from-lime-glow/60 to-cream px-5 pb-14 pt-14 sm:px-8 sm:pb-20 sm:pt-20">
        <div
          aria-hidden
          className="animate-float-slow pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-carrot-200/30 blur-3xl"
        />

        <div className="relative mx-auto max-w-3xl text-center">
          <p className="animate-rise flex items-center justify-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-carrot-600">
            <span className="h-px w-8 bg-carrot-400" />
            Reservations
            <span className="h-px w-8 bg-carrot-400" />
          </p>

          <h1 className="animate-rise delay-1 text-balance mt-5 font-display text-[2.4rem] font-normal leading-[1.06] tracking-[-0.02em] text-ink-900 sm:text-[3.4rem]">
            Save yourself a
            <span className="italic text-carrot-600"> seat.</span>
          </h1>

          <p className="animate-rise delay-2 mx-auto mt-5 max-w-lg text-[0.95rem] leading-relaxed text-ink-500">
            Tables go quickly on Friday and Saturday evenings. Tell us when
            you&apos;re coming and we&apos;ll hold one.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          {/* details */}
          <Reveal>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              {DETAILS.map((detail) => (
                <li
                  key={detail.label}
                  className="rounded-2xl border border-ink-900/[0.07] bg-white p-6 transition-all duration-400 hover:-translate-y-1 hover:border-carrot-200 hover:shadow-lg hover:shadow-ink-900/[0.05]"
                >
                  <h2 className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-carrot-600">
                    {detail.label}
                  </h2>
                  {detail.lines.map((line) => (
                    <p key={line} className="mt-2 text-sm text-ink-700">
                      {line}
                    </p>
                  ))}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* form */}
          <Reveal delay={120}>
            <ReservationForm />
          </Reveal>
        </div>
      </div>
    </>
  );
}
