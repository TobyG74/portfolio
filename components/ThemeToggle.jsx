"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/* The class is already on <html> before paint (see layout.js); this only
   reflects and flips it. ponytail: no context/provider, one consumer. */
export default function ThemeToggle({ className = "" }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("tobz-theme", next ? "dark" : "light");
    } catch {}
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Aktifkan tema terang" : "Aktifkan tema gelap"}
      aria-pressed={dark}
      className={`icon-button ${className}`}
    >
      {dark ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
    </button>
  );
}
