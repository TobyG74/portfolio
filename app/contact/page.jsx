"use client";

import { useState } from "react";
import Link from "next/link";
import SiteShell from "@/components/site-shell";
import { useGame } from "@/components/game-provider";
import Reveal from "@/components/reveal";

const socials = [
  { title: "GitHub", value: "@TobyG74", href: "https://github.com/TobyG74" },
  { title: "LinkedIn", value: "Tobi Saputra", href: "https://www.linkedin.com/in/tobi-saputra/" },
  { title: "Instagram", value: "@ini.tobz", href: "https://instagram.com/ini.tobz" },
  { title: "Email", value: "tobisaputra11@gmail.com", href: "mailto:tobisaputra11@gmail.com" },
];

export default function ContactPage() {
  const { addXp } = useGame();
  const [form, setForm] = useState({ name: "", email: "", type: "", details: "" });

  return (
    <SiteShell>
      <Reveal>
        <section className="mb-8">
        <h1 className="font-pixel text-lg text-quest-glow md:text-2xl">START NEW QUEST</h1>
        <p className="mt-2 text-xl text-quest-accent md:text-2xl">Send me a message and let&apos;s collaborate!</p>
        </section>
      </Reveal>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Reveal>
        <form
          className="neon-border rounded-xl border border-quest-line bg-quest-card p-5"
          onSubmit={(event) => {
            event.preventDefault();
            addXp(50);
            alert("QUEST ACCEPTED! Your message has been sent successfully.");
            setForm({ name: "", email: "", type: "", details: "" });
          }}
        >
          <h2 className="font-pixel text-[11px] text-quest-glow">MESSAGE CONSOLE</h2>
          <div className="mt-4 space-y-3">
            <Field label="PLAYER NAME">
              <input
                required
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="w-full rounded-md border border-quest-line bg-quest-bg px-3 py-2 text-lg"
              />
            </Field>
            <Field label="EMAIL ADDRESS">
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                className="w-full rounded-md border border-quest-line bg-quest-bg px-3 py-2 text-lg"
              />
            </Field>
            <Field label="QUEST TYPE">
              <select
                required
                value={form.type}
                onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                className="w-full rounded-md border border-quest-line bg-quest-bg px-3 py-2 text-lg"
              >
                <option value="">Select quest type...</option>
                <option value="collaboration">Collaboration Quest</option>
                <option value="project">Project Inquiry</option>
                <option value="job">Job Opportunity</option>
                <option value="question">Question/Support</option>
                <option value="other">Other Quest</option>
              </select>
            </Field>
            <Field label="QUEST DETAILS">
              <textarea
                rows={6}
                required
                value={form.details}
                onChange={(event) => setForm((prev) => ({ ...prev, details: event.target.value }))}
                className="w-full rounded-md border border-quest-line bg-quest-bg px-3 py-2 text-lg"
              />
            </Field>
            <button className="w-full rounded-md border border-quest-glow bg-quest-glow px-4 py-3 font-pixel text-xs text-slate-900 shadow-lg shadow-quest-glow/20 hover:-translate-y-0.5 hover:brightness-110">SEND MESSAGE</button>
          </div>
        </form>
        </Reveal>

        <aside className="space-y-4">
          <Reveal delay={120}>
            <div className="hover-panel rounded-xl border border-quest-line bg-quest-card p-5">
            <h2 className="font-pixel text-[11px] text-quest-glow">SOCIAL CHANNELS</h2>
            <div className="mt-3 space-y-2">
              {socials.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-md border border-quest-line bg-quest-bg px-3 py-3 hover:-translate-y-0.5 hover:border-quest-accent"
                >
                  <p className="font-pixel text-[10px] text-quest-accent">{item.title}</p>
                  <p className="text-lg text-slate-200">{item.value}</p>
                </Link>
              ))}
            </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="hover-panel rounded-xl border border-quest-line bg-quest-card p-5">
            <h2 className="font-pixel text-[11px] text-quest-glow">QUEST INFO</h2>
            <ul className="mt-3 space-y-2 text-lg text-slate-200">
              <li>Response Time: Usually within 24 hours</li>
              <li>Location: Jakarta, Indonesia</li>
              <li>Availability: Open for projects and collaborations</li>
            </ul>
            </div>
          </Reveal>
        </aside>
      </section>
    </SiteShell>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="font-pixel text-[10px] text-quest-accent">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
