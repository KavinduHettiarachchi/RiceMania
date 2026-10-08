"use client";

import { useState } from "react";

import Field from "@/app/components/Field";
import { useToast } from "@/app/providers/ToastProvider";

/**
 * There is no reservations endpoint yet, so this hands the booking to the
 * kitchen the way the restaurant already takes them — over the phone or
 * WhatsApp — with the details pre-filled instead of silently dropping them.
 */
export default function ReservationForm() {
  const toast = useToast();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("19:00");
  const [guests, setGuests] = useState("2");
  const [notes, setNotes] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const message = [
      `Table request for ${name}`,
      `${guests} guest${guests === "1" ? "" : "s"}`,
      `${date} at ${time}`,
      `Contact: ${phone}`,
      notes && `Notes: ${notes}`,
    ]
      .filter(Boolean)
      .join("\n");

    // Opens WhatsApp with the booking written out, ready to send.
    window.open(
      `https://wa.me/94771234567?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );

    setSent(true);
    toast("Booking details ready to send");
  };

  if (sent) {
    return (
      <div className="animate-scale-in flex h-full min-h-80 flex-col items-center justify-center rounded-3xl border border-emerald-200 bg-emerald-50/50 px-8 py-16 text-center">
        <div className="grid size-16 place-items-center rounded-full bg-emerald-500 text-white">
          <svg viewBox="0 0 24 24" className="size-8" aria-hidden>
            <path
              d="m6 12.5 4 4 8-8.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 className="mt-6 font-display text-2xl font-semibold text-ink-900">
          Nearly booked
        </h2>
        <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-ink-500">
          Your details opened in WhatsApp — send the message and the kitchen
          will confirm your table shortly. You can also call{" "}
          <a
            href="tel:+94112345678"
            className="font-semibold text-carrot-600 hover:underline"
          >
            +94 11 234 5678
          </a>
          .
        </p>

        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-7 rounded-full border border-ink-900/15 bg-white px-6 py-3 text-sm font-semibold text-ink-800 transition-colors hover:border-carrot-300 hover:text-carrot-600"
        >
          Book another table
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-ink-900/[0.07] bg-white p-7 sm:p-9"
    >
      <h2 className="font-display text-2xl font-semibold text-ink-900">
        Request a table
      </h2>
      <p className="mt-2 text-sm text-ink-500">
        We hold bookings for 15 minutes past the hour.
      </p>

      <div className="mt-7 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Your name"
            name="name"
            value={name}
            onChange={setName}
            placeholder="Nimal Perera"
            autoComplete="name"
            required
          />
          <Field
            label="Phone"
            type="tel"
            name="phone"
            value={phone}
            onChange={setPhone}
            placeholder="+94 77 123 4567"
            autoComplete="tel"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Date"
            type="date"
            name="date"
            value={date}
            onChange={setDate}
            required
          />
          <Field
            label="Time"
            type="time"
            name="time"
            value={time}
            onChange={setTime}
            required
          />

          <div>
            <label
              htmlFor="guests"
              className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink-500"
            >
              Guests
            </label>
            <select
              id="guests"
              value={guests}
              onChange={(event) => setGuests(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3.5 text-sm text-ink-900 outline-none transition-all duration-300 focus:border-carrot-400 focus:ring-4 focus:ring-carrot-500/10"
            >
              {["1", "2", "3", "4", "5", "6", "8", "10+"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink-500"
          >
            Anything we should know?
          </label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Birthday, high chair needed, quiet corner…"
            className="mt-2 w-full resize-none rounded-2xl border border-ink-200 px-4 py-3.5 text-sm outline-none transition-all duration-300 placeholder:text-ink-300 focus:border-carrot-400 focus:ring-4 focus:ring-carrot-500/10"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!name || !phone || !date}
        className="group relative mt-7 w-full overflow-hidden rounded-full bg-carrot-500 py-4 text-sm font-semibold text-white shadow-xl shadow-carrot-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
      >
        Request table
      </button>
    </form>
  );
}
