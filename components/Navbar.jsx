"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const LINKS = [
  { label: "Home", href: "/#home" },
  { label: "Skills", href: "/#skills" },
  { label: "Work", href: "/#work" },
  { label: "Guestbook", href: "/guestbook" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav
        className={`flex w-full max-w-5xl items-center justify-between rounded-2xl px-4 py-3 transition-all duration-500 sm:px-6 ${
          scrolled ? "glass hairline" : "border border-transparent"
        }`}
      >
        <Link href="/#home" className="group flex items-center gap-2.5">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-aqua to-violet font-display text-sm font-extrabold text-void">
            T
            <span className="absolute inset-0 rounded-md bg-aqua/40 blur-md transition-opacity group-hover:opacity-100 opacity-0" />
          </span>
          <span className="font-mono text-sm tracking-widest text-white">
            TOB<span className="text-aqua">Z</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="rounded-lg px-3.5 py-2 font-mono text-[0.78rem] uppercase tracking-wider text-ghost transition-colors hover:text-aqua"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/#contact"
          className="hidden rounded-xl border border-aqua/40 bg-aqua/10 px-4 py-2 font-mono text-[0.74rem] uppercase tracking-wider text-aqua transition-all hover:bg-aqua/20 hover:glow-aqua lg:inline-block"
        >
          Let&apos;s talk
        </Link>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="text-ghost transition-colors hover:text-aqua md:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass hairline absolute top-20 w-[calc(100%-2rem)] max-w-5xl space-y-1 rounded-2xl p-3 md:hidden"
          >
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-4 py-3 font-mono text-sm uppercase tracking-wider text-ghost transition-colors hover:bg-white/5 hover:text-aqua"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
