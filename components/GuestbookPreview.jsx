"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, MessageSquareText } from "lucide-react";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

const PREVIEW_COUNT = 3;

function entryTime(e) {
  if (typeof e.ts === "number") return e.ts;
  const parsed = Date.parse(e.createdAt);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function relativeTime(ts) {
  if (!ts) return "";
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "baru saja";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} hari lalu`;
  return new Date(ts).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function initials(name = "") {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "A";
}

export default function GuestbookPreview() {
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/guestbook")
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d.entries) ? d.entries : [];
        setTotal(list.length);
        setEntries([...list].sort((a, b) => entryTime(b) - entryTime(a)).slice(0, PREVIEW_COUNT));
      })
      .catch(() => {});
  }, []);

  return (
    <section id="guestbook" className="relative mx-auto max-w-5xl px-5 py-28 sm:px-8">
      <SectionHeading
        index="03"
        eyebrow="Guestbook"
        title="Kata mereka."
        sub="Sebagian sapaan dari pengunjung. Mau ninggalin jejak juga? Mampir ke halaman guestbook."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {entries.length === 0 ? (
          <Reveal className="sm:col-span-3">
            <div className="rounded-2xl glass-strong hairline p-6 text-sm text-ghost/60">
              Belum ada pesan. Jadilah yang pertama! 👋
            </div>
          </Reveal>
        ) : (
          entries.map((e, i) => (
            <Reveal key={`${e.createdAt ?? ""}-${i}`} delay={i * 0.08} className="h-full">
              <div className="flex h-full flex-col rounded-2xl glass-strong hairline p-5 transition-colors hover:border-aqua/30">
                <MessageSquareText size={18} className="mb-3 text-aqua/70" />
                <p className="flex-1 break-words text-sm leading-relaxed text-ghost line-clamp-5">
                  “{e.message}”
                </p>
                <div className="mt-4 flex items-center gap-3 border-t border-white/8 pt-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-aqua/80 to-violet/80 font-display text-xs font-bold text-void">
                    {initials(e.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{e.name}</p>
                    <p className="font-mono text-[0.62rem] text-ghost/40">{relativeTime(entryTime(e))}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))
        )}
      </div>

      <Reveal delay={0.2}>
        <div className="mt-8 flex justify-center">
          <Link
            href="/guestbook"
            className="group inline-flex items-center gap-2 rounded-xl border border-aqua/40 bg-aqua/10 px-6 py-3.5 font-mono text-sm uppercase tracking-wider text-aqua transition-all hover:bg-aqua/20 hover:glow-aqua"
          >
            {total > PREVIEW_COUNT ? `Lihat semua ${total} pesan` : "Lihat & tulis pesan"}
            <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
