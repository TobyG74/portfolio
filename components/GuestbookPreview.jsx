"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/guestbook")
      .then((r) => {
        if (!r.ok) throw new Error("Guestbook unavailable");
        return r.json();
      })
      .then((d) => {
        const list = Array.isArray(d.entries) ? d.entries : [];
        setTotal(list.length);
        setEntries([...list].sort((a, b) => entryTime(b) - entryTime(a)).slice(0, PREVIEW_COUNT));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SectionHeading
        index={5}
        eyebrow="Guestbook"
        title="Udah mampir? Tinggalin jejak."
        sub="Sapaan, masukan, atau cerita dari orang-orang yang singgah di sini."
      />

      <div className="guestbook-cards" aria-live="polite">
        {loading ? (
          <div className="guestbook-state">Memuat pesan guestbook...</div>
        ) : error ? (
          <div className="guestbook-state">Pesan belum bisa dimuat. Buka guestbook untuk mencoba lagi.</div>
        ) : entries.length === 0 ? (
          <div className="guestbook-state">
            Belum ada pesan. Jadilah yang pertama.
          </div>
        ) : (
          entries.map((e, i) => (
            <Reveal key={`${e.createdAt ?? ""}-${i}`} delay={i * 0.07} className="h-full">
              <figure className="card flex h-full flex-col p-6">
                <span aria-hidden="true" className="font-display text-2xl leading-none text-dim">&ldquo;</span>
                <blockquote className="mt-3 flex-1 break-words text-sm leading-relaxed text-dim line-clamp-5">
                  {e.message}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-fg/10 pt-5">
                  <span className="guestbook-avatar">
                    {initials(e.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{e.name}</span>
                    <span className="block font-mono text-xs text-dim">
                      {relativeTime(entryTime(e))}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))
        )}
      </div>

      <div className="mt-10">
        <Link href="/guestbook" className="btn-ghost group">
          {total > PREVIEW_COUNT ? `Lihat ${total} pesan` : "Tulis pesan"}
          <ArrowUpRight
            size={15}
            className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </>
  );
}
