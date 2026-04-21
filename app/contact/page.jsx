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

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-black uppercase text-nb-dark">{label}</label>
      {children}
    </div>
  );
}

export default function ContactPage() {
  const { addXp } = useGame();
  const [form, setForm] = useState({ name: "", email: "", type: "", details: "" });

  return (
    <SiteShell>
      <Reveal>
        <section className="mb-8 border-4 border-nb-dark bg-nb-pink p-6 shadow-brutal-lg">
          <h1 className="text-3xl font-black uppercase text-nb-dark md:text-4xl">CONTACT</h1>
          <div className="mt-1 h-1.5 w-16 bg-nb-dark" />
          <p className="mt-2 text-lg font-bold text-nb-dark/80">Send me a message and let&apos;s collaborate!</p>
        </section>
      </Reveal>

      <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Reveal>
          <form
            className="border-4 border-nb-dark bg-white p-5 shadow-brutal-lg"
            onSubmit={(event) => {
              event.preventDefault();
              addXp(50);
              alert("Message sent! I will get back to you soon.");
              setForm({ name: "", email: "", type: "", details: "" });
            }}
          >
            <h2 className="text-xl font-black uppercase text-nb-dark">SEND A MESSAGE</h2>
            <div className="mt-1 h-1 w-12 bg-nb-yellow" />
            <div className="mt-4 space-y-4">
              <Field label="YOUR NAME">
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full border-2 border-nb-dark bg-nb-bg px-3 py-2 text-base font-medium text-nb-dark focus:shadow-brutal-sm focus:outline-none"
                />
              </Field>
              <Field label="EMAIL ADDRESS">
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full border-2 border-nb-dark bg-nb-bg px-3 py-2 text-base font-medium text-nb-dark focus:shadow-brutal-sm focus:outline-none"
                />
              </Field>
              <Field label="MESSAGE TYPE">
                <select
                  required
                  value={form.type}
                  onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                  className="w-full border-2 border-nb-dark bg-nb-bg px-3 py-2 text-base font-medium text-nb-dark focus:shadow-brutal-sm focus:outline-none"
                >
                  <option value="">Select type...</option>
                  <option value="collaboration">Collaboration</option>
                  <option value="project">Project Inquiry</option>
                  <option value="job">Job Opportunity</option>
                  <option value="question">Question / Support</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label="MESSAGE">
                <textarea
                  rows={6}
                  required
                  value={form.details}
                  onChange={(event) => setForm((prev) => ({ ...prev, details: event.target.value }))}
                  className="w-full border-2 border-nb-dark bg-nb-bg px-3 py-2 text-base font-medium text-nb-dark focus:shadow-brutal-sm focus:outline-none"
                />
              </Field>
              <button
                type="submit"
                className="w-full border-2 border-nb-dark bg-nb-yellow px-4 py-3 font-black uppercase text-nb-dark shadow-brutal transition hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none"
              >
                SEND MESSAGE →
              </button>
            </div>
          </form>
        </Reveal>

        <aside className="space-y-4">
          <Reveal delay={120}>
            <div className="border-4 border-nb-dark bg-nb-blue p-5 shadow-brutal">
              <h2 className="text-xl font-black uppercase text-nb-dark">SOCIALS</h2>
              <div className="mt-1 h-1 w-12 bg-nb-dark" />
              <div className="mt-3 space-y-2">
                {socials.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between border-2 border-nb-dark bg-white px-3 py-3 font-medium text-nb-dark shadow-brutal-sm transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-nb-yellow"
                  >
                    <span className="text-xs font-black uppercase">{item.title}</span>
                    <span className="text-sm">{item.value}</span>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="border-4 border-nb-dark bg-nb-green p-5 shadow-brutal">
              <h2 className="text-xl font-black uppercase text-nb-dark">INFO</h2>
              <div className="mt-1 h-1 w-12 bg-nb-dark" />
              <ul className="mt-3 space-y-2 text-base text-nb-dark">
                <li className="border-2 border-nb-dark bg-white px-3 py-2 font-medium">
                  Response Time: Within 24 hours
                </li>
                <li className="border-2 border-nb-dark bg-white px-3 py-2 font-medium">
                  Location: Jakarta, Indonesia
                </li>
                <li className="border-2 border-nb-dark bg-white px-3 py-2 font-medium">
                  Status: Open for projects
                </li>
              </ul>
            </div>
          </Reveal>
        </aside>
      </section>
    </SiteShell>
  );
}
