"use client";

import Image from "next/image";
import Link from "next/link";
import { BriefcaseBusiness, Code2, Mail, Rocket, ShieldCheck } from "lucide-react";
import SiteShell from "@/components/site-shell";
import TypedRoles from "@/components/typed-roles";
import { useGame } from "@/components/game-provider";
import Reveal from "@/components/reveal";
import QuestIntro from "@/components/quest-intro";

export default function HomePage() {
  const { questStarted, startQuest, playerName, addXp } = useGame();

  const handleIntroComplete = (name) => {
    startQuest(name);
    addXp(50);
  };

  return (
    <>
      {!questStarted && (
        <div className="fixed inset-0 z-40 bg-quest-bg">
          <QuestIntro onComplete={handleIntroComplete} />
        </div>
      )}

      <SiteShell>
        <Reveal>
          <section className="neon-border rounded-xl border border-quest-line bg-quest-card/70 p-6 md:p-8">
          <div className="grid items-center gap-8 md:grid-cols-[220px_1fr]">
            <div className="relative mx-auto">
              <Link
                href="/contact"
                className="absolute -bottom-3 right-0 z-10 rotate-[-11deg] rounded-md border border-emerald-500 bg-emerald-500 px-2 py-1 font-pixel text-[9px] text-slate-950 shadow-lg shadow-emerald-600/40 transition hover:rotate-[-8deg] hover:scale-105 md:-bottom-4 md:right-[-8px] md:px-3 md:py-1.5"
              >
                <span className="inline-flex items-center gap-1">
                  <BriefcaseBusiness className="h-3 w-3" />
                  OPEN FOR PROJECTS
                </span>
              </Link>
              <div className="overflow-hidden rounded-xl border-2 border-quest-glow shadow-xl shadow-quest-glow/20 transition duration-500 hover:scale-[1.04]">
                <Image src="/images/profile.jpg" alt="Tobi Saputra" width={220} height={220} className="h-[220px] w-[220px] object-cover transition duration-700 hover:scale-110" priority />
              </div>
            </div>
            <div>
              <p className="font-pixel text-[10px] text-quest-accent">[ WELCOME {playerName.toUpperCase()} ]</p>
              <h1 className="mt-2 font-pixel text-xl text-quest-glow md:text-3xl">TOBI SAPUTRA</h1>
              <div className="mt-3">
                <TypedRoles />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/projects" className="rounded-md border border-quest-glow bg-quest-glow px-4 py-2 font-pixel text-[10px] text-slate-900 shadow-lg shadow-quest-glow/30 hover:-translate-y-0.5 hover:scale-[1.02]" onClick={() => addXp(10)}>
                  START QUEST
                </Link>
                <Link href="/contact" className="rounded-md border border-quest-line bg-quest-bg px-4 py-2 font-pixel text-[10px] text-slate-100 hover:-translate-y-0.5 hover:border-quest-accent" onClick={() => addXp(10)}>
                  CONTACT
                </Link>
              </div>
            </div>
          </div>
          </section>
        </Reveal>

        <section className="mt-8 grid items-stretch gap-4 md:grid-cols-3">
          <QuestCard icon={<Rocket className="h-6 w-6" />} title="PROJECTS" description="Explore coding adventures and completed quests" href="/projects" />
          <QuestCard icon={<ShieldCheck className="h-6 w-6" />} title="SKILLS" description="See all programming weapons and abilities" href="/skills" />
          <QuestCard icon={<Mail className="h-6 w-6" />} title="CONTACT" description="Start a new collaboration quest" href="/contact" />
        </section>

        <Reveal delay={120}>
          <section className="mt-8 rounded-xl border border-quest-line bg-quest-card/70 p-6 hover-panel">
          <h2 className="font-pixel text-sm text-quest-glow md:text-lg">ABOUT PLAYER</h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-200 md:text-2xl">
            Halo Guys !! Gue Tobi, biasa orang2 manggil gue Tobz. Gue masih seorang mahasiswa yang perlu banyak belajar dalam dunia programming, tapi gue punya passion yang besar buat coding dan selalu semangat buat ngembangin skill gue. Gue suka banget ngulik teknologi baru, terutama yang berhubungan sama web development dan software engineering. Hobby gue selain coding itu main game dan nonton anime, banyak yang bilang gue wibu, tapi yang jelas gue santai aja karena anime itu yang bikin gue relax dan kadang ngasih inspirasi buat project coding gue. Gue excited banget buat terus belajar dan berkembang di dunia programming, dan gue harap bisa kolaborasi sama temen-temen yang punya passion yang sama juga!
          </p>
          <div className="mt-5 flex items-center gap-2 text-quest-accent">
            <Code2 className="h-5 w-5" />
            <span className="text-lg md:text-xl">Jakarta, Indonesia - Student & Developer</span>
          </div>
          </section>
        </Reveal>
      </SiteShell>
    </>
  );
}

function QuestCard({ icon, title, description, href }) {
  return (
    <Reveal className="h-full">
      <Link
        href={href}
        className="hover-panel group flex h-full min-h-[210px] flex-col rounded-xl border border-quest-line bg-quest-card p-5 transition duration-300 hover:border-quest-accent"
      >
      <div className="mb-3 inline-flex w-fit rounded-md bg-quest-bg p-2 text-quest-accent">{icon}</div>
      <h3 className="font-pixel text-xs text-quest-glow">{title}</h3>
      <p className="mt-2 text-lg leading-snug text-slate-200">{description}</p>
      <p className="mt-auto pt-6 text-sm text-quest-accent transition group-hover:text-quest-glow">ENTER</p>
      </Link>
    </Reveal>
  );
}
