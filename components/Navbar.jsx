"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X, Gamepad2 } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
  { label: "About", href: "/#about" },
  { label: "Stack", href: "/#stack" },
  { label: "Projects", href: "/#work" },
  { label: "Roadmap", href: "/#roadmap" },
  { label: "Guestbook", href: "/guestbook" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const menuButton = useRef(null);
  const header = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (event) => {
      if (event.type === "keydown" && event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
      if (event.type === "pointerdown" && !header.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", close);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", close);
    };
  }, [open]);

  return (
    <header ref={header} className="site-header">
      <nav className="site-container nav-inner" aria-label="Navigasi utama">
        <Link href="/#home" className="brand" onClick={() => setOpen(false)} aria-label="Tobz, kembali ke beranda">
          <span className="brand-mark">t.</span><span>tobz<span className="brand-period">.</span></span>
        </Link>
        <ul className="desktop-nav">
          {LINKS.map((link) => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}
        </ul>
        <div className="nav-actions">
          <Link href="/world" className="nav-world" onClick={() => setOpen(false)} aria-label="Main di Tobiverse">
            <Gamepad2 size={18} aria-hidden="true" /><span>World</span>
          </Link>
          <ThemeToggle />
          <button ref={menuButton} aria-label={open ? "Tutup menu" : "Buka menu"} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)} className="icon-button menu-toggle">
            {open ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
          </button>
        </div>
      </nav>
      {open && (
        <nav id="mobile-menu" className="mobile-menu site-container" aria-label="Navigasi mobile">
          {LINKS.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
        </nav>
      )}
    </header>
  );
}
