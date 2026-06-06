"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

const MAX_MESSAGE = 280;

// entries may carry `createdAt` (ISO string, legacy) or `ts` (number)
function entryTime(e) {
  if (typeof e.ts === "number") return e.ts;
  const parsed = Date.parse(e.createdAt);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function relativeTime(ts) {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return "baru saja";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} hari lalu`;
  return new Date(ts).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function initials(name) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "A";
}

export default function Guestbook() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // {type, text}

  useEffect(() => {
    fetch("/api/guestbook")
      .then((r) => r.json())
      .then((d) => setEntries(Array.isArray(d.entries) ? d.entries : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (!message.trim() || submitting) return;
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });
      const data = await res.json();
      if (res.ok && data.entry) {
        setEntries((prev) => [data.entry, ...prev]);
        setName("");
        setMessage("");
        setStatus({ type: "ok", text: "Pesan terkirim... makasih! ✨" });
      } else {
        setStatus({ type: "err", text: data.error || "Gagal mengirim pesan." });
      }
    } catch {
      setStatus({ type: "err", text: "Koneksi bermasalah, coba lagi." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="relative mx-auto max-w-5xl px-5 pb-28 pt-32 sm:px-8">
      <SectionHeading
        index="✦"
        eyebrow="Guestbook"
        title="Tinggalkan jejak."
        sub="Sapa, kasih masukan, atau sekadar say hi. Satu pesan per pengunjung biar tetap rapi."
      />

      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        {/* ---- form ---- */}
        <Reveal>
          <form
            onSubmit={submit}
            className="glass-strong hairline relative overflow-hidden rounded-2xl p-6 sm:p-7"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet/15 blur-2xl" />

            <label className="mb-2 block font-mono text-[0.66rem] uppercase tracking-wider text-ghost/60">
              Nama <span className="text-ghost/40">(opsional)</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              placeholder="Anonymous"
              className="mb-5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-ghost/40 focus:border-aqua/50"
            />

            <div className="mb-2 flex items-center justify-between">
              <label className="block font-mono text-[0.66rem] uppercase tracking-wider text-ghost/60">
                Pesan
              </label>
              <span className="font-mono text-[0.66rem] text-ghost/40">
                {message.length}/{MAX_MESSAGE}
              </span>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
              rows={4}
              required
              placeholder="Tulis sesuatu yang keren…"
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-ghost/40 focus:border-aqua/50"
            />

            <button
              type="submit"
              disabled={submitting || !message.trim()}
              className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-aqua px-6 py-3.5 font-mono text-sm font-medium uppercase tracking-wider text-void transition-all hover:glow-aqua disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
              {submitting ? "Mengirim…" : "Kirim pesan"}
            </button>

            <AnimatePresence>
              {status && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-4 text-center text-sm ${
                    status.type === "ok" ? "text-aqua" : "text-rose-300"
                  }`}
                >
                  {status.text}
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </Reveal>

        {/* ---- feed ---- */}
        <Reveal delay={0.1}>
          <div className="space-y-3">
            <div className="mb-1 flex items-center justify-between font-mono text-[0.66rem] uppercase tracking-wider text-ghost/50">
              <span>Recent messages</span>
              <span className="text-aqua">{entries.length}</span>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 rounded-2xl glass-strong hairline p-6 text-sm text-ghost/60">
                <Loader2 size={16} className="animate-spin" /> Memuat pesan…
              </div>
            ) : entries.length === 0 ? (
              <div className="rounded-2xl glass-strong hairline p-6 text-sm text-ghost/60">
                Belum ada pesan. Jadilah yang pertama! 👋
              </div>
            ) : (
              <div className="max-h-[34rem] space-y-3 overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {[...entries]
                    .sort((a, b) => entryTime(b) - entryTime(a))
                    .map((e, i) => (
                    <motion.div
                      key={e.id ?? `${e.createdAt ?? ""}-${i}`}
                      layout
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="group flex gap-3 rounded-2xl glass-strong hairline p-4 transition-colors hover:border-aqua/30"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-aqua/80 to-violet/80 font-display text-sm font-bold text-void">
                        {initials(e.name)}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="truncate font-medium text-white">{e.name}</span>
                          <span className="shrink-0 font-mono text-[0.64rem] text-ghost/40">
                            {relativeTime(entryTime(e))}
                          </span>
                        </div>
                        <p className="mt-1 break-words text-sm leading-relaxed text-ghost">
                          {e.message}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
