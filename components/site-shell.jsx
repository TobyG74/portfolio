"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye, Menu, Swords, Trophy, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useGame } from "@/components/game-provider";
import AmbientEffects from "@/components/ambient-effects";

const navItems = [
  { href: "/", label: "HOME" },
  { href: "/projects", label: "PROJECTS" },
  { href: "/skills", label: "SKILLS" },
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
    const endpoint = alreadyCounted
      ? "/api/visitors"
      : "/api/visitors?action=hit";

    const controller = new AbortController();

    const loadVisitorCount = async () => {
      try {
        const response = await fetch(endpoint, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("counter request failed");

        const payload = await response.json();
        if (typeof payload?.value === "number") {
          setVisitorCount(payload.value);
        }

        if (!alreadyCounted && payload?.persisted !== false) {
          localStorage.setItem(localMark, "1");
        }
      } catch {
        // Keep UI stable when the public counter service is unavailable.
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
    <div className="grid-bg scanline min-h-screen bg-quest-bg">
      <AmbientEffects />
      <header className="sticky top-0 z-30 border-b-2 border-quest-glow/60 bg-quest-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-3 text-quest-glow">
            <Swords className="h-6 w-6 animate-floaty" />
            <span className="font-pixel text-xs md:text-sm">TOBI SAPUTRA</span>
          </div>

          <button
            type="button"
            className="rounded-md border border-quest-line bg-quest-bg p-2 text-slate-100 md:hidden"
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
                  className={`rounded-md border px-3 py-2 font-pixel text-[10px] transition duration-300 hover:-translate-y-0.5 ${
                    active
                      ? "border-quest-glow bg-quest-glow text-slate-900"
                      : "border-quest-line bg-quest-bg text-slate-200 hover:border-quest-accent hover:text-quest-accent"
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
          <nav className="space-y-2 border-t border-quest-line px-4 py-3 md:hidden">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-md border px-3 py-2 text-center font-pixel text-[10px] ${
                    active
                      ? "border-quest-glow bg-quest-glow text-slate-900"
                      : "border-quest-line bg-quest-bg text-slate-200"
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

      <div className="border-b border-quest-line bg-quest-bg/80">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 py-3 text-base md:grid-cols-4 md:px-6 md:text-lg">
          <div className="hover-panel flex items-center gap-2 rounded-md border border-quest-line bg-quest-card px-3 py-2">
            <User className="h-4 w-4 text-quest-accent" />
            <span>PLAYER: {playerName}</span>
          </div>
          <div className="hover-panel flex items-center gap-2 rounded-md border border-quest-line bg-quest-card px-3 py-2">
            <Trophy className="h-4 w-4 text-quest-glow" />
            <span>XP: {xpInLevel}</span>
          </div>
          <div className="hover-panel rounded-md border border-quest-line bg-quest-card px-3 py-2">LEVEL: {level}</div>
          <div className="hover-panel flex items-center rounded-md border border-quest-line bg-quest-card px-2 py-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900">
              <div
                className="h-full bg-gradient-to-r from-quest-accent via-sky-300 to-quest-glow transition-all duration-700"
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
              <p className="font-pixel text-[10px] text-quest-glow">LEVEL UP</p>
              <p className="mt-1 text-2xl text-white md:text-3xl">You reached Level {levelUpNotice}</p>
              <p className="mt-1 text-lg text-quest-accent">+ New power unlocked</p>
            </div>
          </div>
        ) : null}
        {children}
      </main>

      <div
        className="pointer-events-none fixed bottom-5 right-4 z-50 md:bottom-6 md:right-6"
        role="status"
        aria-live="polite"
      >
        <p className="inline-flex items-center gap-2 rounded-md border border-quest-line bg-quest-card/95 px-3 py-2 text-sm text-quest-accent shadow-xl shadow-slate-950/40 backdrop-blur">
          <Eye className="h-4 w-4" />
          {visitorCount !== null ? `Total visitors: ${visitorCount.toLocaleString("id-ID")}` : "Total visitors: ..."}
        </p>
      </div>

      <footer className="border-t border-quest-line bg-quest-card/90 px-4 py-6 text-center">
        <p className="font-pixel text-[10px] text-quest-glow">COPYRIGHT 2026 TOBI SAPUTRA - CODE QUEST</p>
      </footer>
    </div>
  );
}
