"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye, Menu, User, Trophy, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useGame } from "@/components/game-provider";

const navItems = [
  { href: "/", label: "HOME" },
  { href: "/projects", label: "PROJECTS" },
  { href: "/skills", label: "SKILLS" },
  { href: "/impressions", label: "GUESTBOOK" },
  { href: "/contact", label: "CONTACT" },
];

export default function SiteShell({ children }) {
  const pathname = usePathname();
  const { playerName, level, xpInLevel, addXp, questStarted, levelUpEvent, consumeLevelUpEvent } = useGame();
  const [openMenu, setOpenMenu] = useState(false);
  const [levelUpNotice, setLevelUpNotice] = useState(null);
  const [visitorCount, setVisitorCount] = useState(null);

  useEffect(() => {
    const localMark = "visitor-counted-v1";
    const alreadyCounted = localStorage.getItem(localMark) === "1";
    const endpoint = alreadyCounted ? "/api/visitors" : "/api/visitors?action=hit";
    const controller = new AbortController();

    const loadVisitorCount = async () => {
      try {
        const response = await fetch(endpoint, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("counter request failed");
        const payload = await response.json();
        if (typeof payload?.value === "number") setVisitorCount(payload.value);
        if (!alreadyCounted && payload?.persisted !== false) localStorage.setItem(localMark, "1");
      } catch {
        // Keep UI stable when counter service is unavailable.
      }
    };

    loadVisitorCount();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!questStarted) return;
    const seenKey = `visited:${pathname}`;
    if (!sessionStorage.getItem(seenKey)) {
      addXp(15);
      sessionStorage.setItem(seenKey, "1");
    }
  }, [pathname, questStarted, addXp]);

  useEffect(() => {
    if (!questStarted || !levelUpEvent) return;
    setLevelUpNotice(levelUpEvent.level);
    const timeout = setTimeout(() => {
      setLevelUpNotice(null);
      consumeLevelUpEvent();
    }, 3200);
    return () => clearTimeout(timeout);
  }, [questStarted, levelUpEvent, consumeLevelUpEvent]);

  return (
    <div className="min-h-screen bg-nb-bg">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b-4 border-nb-dark bg-nb-yellow">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center border-2 border-nb-dark bg-nb-dark">
              <Zap className="h-4 w-4 text-nb-yellow" />
            </div>
            <span className="text-lg font-extrabold uppercase tracking-tight text-nb-dark">TOBI SAPUTRA</span>
          </Link>

          <button
            type="button"
            className="border-2 border-nb-dark bg-white p-2 text-nb-dark shadow-brutal-sm transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none md:hidden"
            onClick={() => setOpenMenu((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {openMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`border-2 border-nb-dark px-4 py-2 font-bold uppercase transition ${
                    active
                      ? "bg-nb-dark text-nb-yellow"
                      : "bg-white text-nb-dark shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                  }`}
                  onClick={() => addXp(5)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {openMenu && (
          <nav className="space-y-2 border-t-2 border-nb-dark px-4 py-3 md:hidden">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block border-2 border-nb-dark px-4 py-3 text-center font-bold uppercase ${
                    active ? "bg-nb-dark text-nb-yellow" : "bg-white text-nb-dark"
                  }`}
                  onClick={() => {
                    addXp(5);
                    setOpenMenu(false);
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      {/* Stats bar */}
      <div className="border-b-4 border-nb-dark bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 py-3 md:grid-cols-4 md:px-6">
          <div className="flex items-center gap-2 border-2 border-nb-dark bg-nb-pink px-3 py-2 font-bold text-nb-dark shadow-brutal-sm">
            <User className="h-4 w-4 shrink-0" />
            <span className="truncate text-sm">{playerName}</span>
          </div>
          <div className="flex items-center gap-2 border-2 border-nb-dark bg-nb-yellow px-3 py-2 font-bold text-nb-dark shadow-brutal-sm">
            <Trophy className="h-4 w-4 shrink-0" />
            <span className="text-sm">XP: {xpInLevel}</span>
          </div>
          <div className="flex items-center border-2 border-nb-dark bg-nb-blue px-3 py-2 font-bold text-nb-dark shadow-brutal-sm">
            <span className="text-sm">LVL {level}</span>
          </div>
          <div className="flex items-center border-2 border-nb-dark bg-nb-gray px-2 py-2 shadow-brutal-sm">
            <div className="h-3 w-full overflow-hidden border-2 border-nb-dark bg-white">
              <div
                className="h-full bg-nb-green transition-all duration-700"
                style={{ width: `${xpInLevel}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <main key={pathname} className="page-enter relative z-10 mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
        {levelUpNotice ? (
          <div className="level-up-toast" role="status" aria-live="polite">
            <div className="level-up-toast-inner">
              <p className="font-bold uppercase text-nb-dark tracking-widest text-sm">LEVEL UP!</p>
              <p className="mt-1 text-2xl font-black text-nb-dark md:text-3xl">You reached Level {levelUpNotice}</p>
              <p className="mt-1 font-bold text-nb-dark">+ New power unlocked</p>
            </div>
          </div>
        ) : null}
        {children}
      </main>

      {/* Visitor counter */}
      <div className="pointer-events-none fixed bottom-5 right-4 z-50 md:bottom-6 md:right-6" role="status" aria-live="polite">
        <p className="inline-flex items-center gap-2 border-2 border-nb-dark bg-white px-3 py-2 font-bold text-sm text-nb-dark shadow-brutal">
          <Eye className="h-4 w-4" />
          {visitorCount !== null ? `${visitorCount.toLocaleString("id-ID")} visitors` : "... visitors"}
        </p>
      </div>

      <footer className="border-t-4 border-nb-dark bg-nb-dark px-4 py-6 text-center">
        <p className="font-bold uppercase tracking-widest text-nb-yellow text-sm">© 2026 TOBI SAPUTRA — PORTFOLIO</p>
      </footer>
    </div>
  );
}
