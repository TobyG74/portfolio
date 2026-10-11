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
  const [loadError, setLoadError] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // {type, text}

  useEffect(() => {
    fetch("/api/guestbook")
      .then((r) => {
        if (!r.ok) throw new Error("Guestbook unavailable");
        return r.json();
      })
      .then((d) => setEntries(Array.isArray(d.entries) ? d.entries : []))
      .catch(() => setLoadError(true))
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
        setStatus({ type: "ok", text: "Pesan terkirim — makasih!" });
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
    <section className="guestbook-page relative mx-auto max-w-6xl px-5 pb-28 pt-36 sm:px-8">
      <SectionHeading
        index={1}
        eyebrow="Guestbook"
        title="Tinggalkan jejak."
        sub="Sapa, kasih masukan, atau sekadar say hi. Satu pesan per pengunjung biar tetap rapi."
      />

      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        {/* ---- form ---- */}
        <Reveal>
          <form
            onSubmit={submit}
            className="card relative overflow-hidden p-6 sm:p-8"
          >
            <label htmlFor="guest-name" className="eyebrow mb-2 block">
              Nama <span className="text-dim">(opsional)</span>
            </label>
            <input
              id="guest-name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              placeholder="Anonymous"
              className="mb-6 w-full bg-card px-4 py-3 text-sm"
            />

            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="guest-message" className="eyebrow block">Pesan</label>
              <span id="message-limit" className="font-mono text-xs text-dim">
                {message.length}/{MAX_MESSAGE}
              </span>
            </div>
            <textarea
              id="guest-message"
              aria-describedby="message-limit"
              maxLength={MAX_MESSAGE}
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
              rows={4}
              required
              placeholder="Tulis sapaan atau masukan lo di sini..."
              className="w-full resize-y bg-card px-4 py-3 text-sm"
            />

            <button
              type="submit"
              disabled={submitting || !message.trim()}
              className="btn mt-6 w-full justify-center"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={14} />}
              {submitting ? "Mengirim…" : "Kirim pesan"}
            </button>

            <AnimatePresence>
              {status && (
                <motion.p
                  role="status"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-4 text-center text-sm ${
                    status.type === "ok" ? "status-ok" : "status-error"
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
            <div className="mb-1 flex items-center justify-between">
              <span className="eyebrow">Recent messages</span>
              <span className="font-mono text-xs">{entries.length}</span>
            </div>

            {loading ? (
              <div className="card flex items-center gap-2 p-6 text-sm text-dim">
                <Loader2 size={16} className="animate-spin" /> Memuat pesan…
              </div>
            ) : loadError ? (
              <div className="card p-6 text-sm text-dim" role="status">
                Pesan belum bisa dimuat. <button type="button" onClick={() => window.location.reload()} className="underline underline-offset-4">Coba lagi</button>.
              </div>
            ) : entries.length === 0 ? (
              <div className="card p-6 text-sm text-dim">
                Belum ada pesan. Jadilah yang pertama.
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
                      className="card group flex gap-4 p-6"
                    >
                      <span className="guestbook-avatar">
                        {initials(e.name)}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="truncate font-medium">{e.name}</span>
                          <span className="shrink-0 font-mono text-xs text-dim">
                            {relativeTime(entryTime(e))}
                          </span>
                        </div>
                        <p className="mt-2 break-words text-sm leading-relaxed text-dim">
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
