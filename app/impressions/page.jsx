"use client";

import { useState, useEffect, useRef } from "react";
import SiteShell from "@/components/site-shell";
import Reveal from "@/components/reveal";
import { useGame } from "@/components/game-provider";
import { MessageSquareHeart, Send, Clock, User } from "lucide-react";

const MAX_NAME = 60;
const MAX_MSG = 500;

function normalizeImpressionsPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.entries)) return payload.entries;
  if (payload && Array.isArray(payload.messages)) return payload.messages;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

function ImpressionCard({ entry, index }) {
  const colors = ["bg-nb-yellow", "bg-nb-pink", "bg-nb-blue", "bg-nb-green", "bg-white"];
  const color = colors[index % colors.length];
  return (
    <div className={`${color} border-4 border-nb-dark p-4 shadow-brutal`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-nb-dark bg-nb-dark">
            <User className="h-4 w-4 text-nb-yellow" />
          </div>
          <span className="font-black uppercase text-nb-dark text-sm truncate max-w-[160px]">
            {entry.name}
          </span>
        </div>
        <span className="flex items-center gap-1 text-xs font-bold text-nb-dark/60 shrink-0">
          <Clock className="h-3 w-3" />
          {timeAgo(entry.createdAt)}
        </span>
      </div>
      <p className="mt-3 text-sm font-medium text-nb-dark leading-relaxed whitespace-pre-wrap break-words">
        {entry.message}
      </p>
    </div>
  );
}

export default function ImpressionsPage() {
  const { addXp } = useGame();
  const [impressions, setImpressions] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState(null);
  const [form, setForm] = useState({ name: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const SUBMITTED_KEY = "impression-submitted-v1";
  const formRef = useRef(null);

  useEffect(() => {
    if (localStorage.getItem(SUBMITTED_KEY) === "1") {
      setAlreadySubmitted(true);
    }
    fetchImpressions();
  }, []);

  async function fetchImpressions() {
    setLoadingList(true);
    setListError(null);
    try {
      const res = await fetch("/api/impressions", { cache: "no-store" });
      if (!res.ok) {
        setListError("Guestbook service is unavailable right now.");
        return;
      }
      const data = await res.json();
      setImpressions(normalizeImpressionsPayload(data));
    } catch {
      setListError("Unable to connect to guestbook service.");
    } finally {
      setLoadingList(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/impressions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), message: form.message.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setAlreadySubmitted(true);
          localStorage.setItem(SUBMITTED_KEY, "1");
        }
        setSubmitError(data.error ?? "Failed to send message.");
        return;
      }

      localStorage.setItem(SUBMITTED_KEY, "1");
      setAlreadySubmitted(true);
      setSubmitted(true);
      setForm({ name: "", message: "" });
      addXp(30);
      if (data.entry) {
        setImpressions((prev) => [data.entry, ...prev]);
      }
    } catch {
      setSubmitError("A network error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteShell>
      <Reveal>
        <section className="mb-8 border-4 border-nb-dark bg-nb-green p-6 shadow-brutal-lg">
          <div className="flex items-center gap-3">
            <MessageSquareHeart className="h-8 w-8 text-nb-dark shrink-0" />
            <div>
              <h1 className="text-3xl font-black uppercase text-nb-dark md:text-4xl">GUESTBOOK</h1>
              <div className="mt-1 h-1.5 w-16 bg-nb-dark" />
            </div>
          </div>
          <p className="mt-3 text-lg font-bold text-nb-dark/80">
            Leave your thoughts and impressions for me. Every voice matters!
          </p>
        </section>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Form */}
        <Reveal>
          <div className="border-4 border-nb-dark bg-white p-5 shadow-brutal-lg">
            <h2 className="text-xl font-black uppercase text-nb-dark">LEAVE A MESSAGE</h2>
            <div className="mt-1 h-1 w-12 bg-nb-green" />

            {submitted && (
              <div className="mt-4 border-2 border-nb-dark bg-nb-green p-3">
                <p className="font-black uppercase text-nb-dark text-sm">
                  Thank you! Your message has been saved. ✓
                </p>
              </div>
            )}

            {alreadySubmitted && !submitted && (
              <div className="mt-4 border-2 border-nb-dark bg-nb-yellow p-3">
                <p className="font-bold text-nb-dark text-sm">
                  You have already submitted a message. Only one message per visitor is allowed.
                </p>
              </div>
            )}

            {!alreadySubmitted && (
              <form ref={formRef} onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-black uppercase text-nb-dark">
                    NAME{" "}
                    <span className="text-xs font-bold text-nb-dark/50 normal-case">
                      (feel free to stay anonymous)
                    </span>
                  </label>
                  <input
                    type="text"
                    maxLength={MAX_NAME}
                    placeholder="Anonymous"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full border-2 border-nb-dark bg-nb-bg px-3 py-2 text-base font-medium text-nb-dark placeholder:text-nb-dark/30 focus:shadow-brutal-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 flex items-center justify-between text-sm font-black uppercase text-nb-dark">
                    <span>MESSAGE</span>
                    <span className="text-xs font-bold text-nb-dark/50 normal-case">
                      {form.message.length}/{MAX_MSG}
                    </span>
                  </label>
                  <textarea
                    required
                    maxLength={MAX_MSG}
                    rows={5}
                    placeholder="Write your thoughts and impressions here..."
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    className="w-full resize-none border-2 border-nb-dark bg-nb-bg px-3 py-2 text-base font-medium text-nb-dark placeholder:text-nb-dark/30 focus:shadow-brutal-sm focus:outline-none"
                  />
                </div>

                {submitError && (
                  <div className="border-2 border-nb-dark bg-nb-pink p-2">
                    <p className="text-sm font-bold text-nb-dark">{submitError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !form.message.trim()}
                  className="flex w-full items-center justify-center gap-2 border-2 border-nb-dark bg-nb-dark px-4 py-3 font-black uppercase text-nb-yellow shadow-brutal-sm transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-brutal-sm"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? "SENDING..." : "SEND MESSAGE"}
                </button>
              </form>
            )}
          </div>
        </Reveal>

        {/* Messages list */}
        <Reveal>
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black uppercase text-nb-dark">
                MESSAGES{" "}
                <span className="text-nb-dark/50">({listError ? "-" : impressions.length})</span>
              </h2>
            </div>

            {loadingList ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 animate-pulse border-4 border-nb-dark bg-nb-gray" />
                ))}
              </div>
            ) : listError ? (
              <div className="border-4 border-nb-dark bg-nb-pink p-6 text-center shadow-brutal">
                <MessageSquareHeart className="mx-auto h-10 w-10 text-nb-dark/40" />
                <p className="mt-3 font-bold uppercase text-nb-dark text-sm">{listError}</p>
              </div>
            ) : impressions.length === 0 ? (
              <div className="border-4 border-nb-dark bg-white p-8 text-center shadow-brutal">
                <MessageSquareHeart className="mx-auto h-10 w-10 text-nb-dark/30" />
                <p className="mt-3 font-bold uppercase text-nb-dark/50 text-sm">
                  No messages yet. Be the first!
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {impressions.map((entry, i) => (
                  <ImpressionCard key={`${entry.createdAt}-${i}`} entry={entry} index={i} />
                ))}
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </SiteShell>
  );
}
