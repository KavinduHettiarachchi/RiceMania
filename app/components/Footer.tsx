import Link from "next/link";

import Logo from "./Logo";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/menu", label: "Full menu" },
      { href: "/about", label: "Our story" },
      { href: "/contact", label: "Reservations" },
      { href: "/orders", label: "Track an order" },
    ],
  },
  {
    title: "Kitchen",
    links: [
      { href: "/menu?category=rice", label: "Rice & curry" },
      { href: "/menu?category=kottu", label: "Kottu" },
      { href: "/menu?category=biryani", label: "Biryani" },
      { href: "/menu", label: "Short eats" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-ink-950 text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/50">
              Slow-cooked Ceylon rice, clay-pot curries and street-side kottu —
              cooked to order and sent out hot.
            </p>

            <div className="mt-6 flex gap-2.5">
              {["Facebook", "Instagram", "WhatsApp"].map((platform) => (
                <a
                  key={platform}
                  href="#"
                  aria-label={platform}
                  className="grid size-10 place-items-center rounded-full border border-white/10 text-white/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-carrot-500 hover:bg-carrot-500 hover:text-white"
                >
                  <span className="text-[0.7rem] font-semibold">
                    {platform[0]}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
                {column.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-carrot-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
              Visit us
            </h3>
            <address className="mt-5 space-y-3 text-sm not-italic leading-relaxed text-white/60">
              <p>
                No. 42, Galle Road
                <br />
                Colombo 03, Sri Lanka
              </p>
              <p>
                <a
                  href="tel:+94112345678"
                  className="transition-colors hover:text-carrot-400"
                >
                  +94 11 234 5678
                </a>
              </p>
            </address>

            <div className="mt-5 rounded-2xl border border-white/10 p-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/35">
                We are open
              </p>
              <p className="mt-2 text-sm text-white/70">
                <span className="font-semibold text-white">Mon–Sat</span>{" "}
                09.00am – 10.00pm
              </p>
              <p className="text-sm text-white/70">
                <span className="font-semibold text-white">Sunday</span> 04.00pm
                – 10.00pm
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} Ricemania Ceylon Kitchen. All rights
            reserved.
          </p>
          <div className="flex gap-6 text-xs text-white/35">
            <Link href="/contact" className="transition-colors hover:text-white/70">
              Privacy
            </Link>
            <Link href="/contact" className="transition-colors hover:text-white/70">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
