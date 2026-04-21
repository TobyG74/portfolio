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
        <div className="fixed inset-0 z-40 overflow-y-auto bg-nb-bg">
          <QuestIntro onComplete={handleIntroComplete} />
        </div>
      )}

      <SiteShell>
        <Reveal>
          <section className="border-4 border-nb-dark bg-white p-6 shadow-brutal-lg md:p-8">
            <div className="grid items-center gap-8 md:grid-cols-[220px_1fr]">
              <div className="relative mx-auto">
                <Link
                  href="/contact"
                  className="absolute -bottom-3 right-0 z-10 -rotate-6 border-2 border-nb-dark bg-nb-green px-2 py-1 text-xs font-black text-nb-dark shadow-brutal-sm transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none md:-bottom-4 md:right-[-8px] md:px-3 md:py-1.5"
                >
                  <span className="inline-flex items-center gap-1">
                    <BriefcaseBusiness className="h-3 w-3" />
                    OPEN FOR PROJECTS
                  </span>
                </Link>
                <div className="border-4 border-nb-dark shadow-brutal-lg transition duration-200 hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none">
                  <Image
                    src="/images/profile.jpg"
                    alt="Tobi Saputra"
                    width={220}
                    height={220}
                    className="h-[220px] w-[220px] object-cover block"
                    priority
                  />
                </div>
              </div>

              <div>
                <p className="font-mono text-sm font-medium text-nb-dark/60 uppercase tracking-wider">
                  [ WELCOME {playerName.toUpperCase()} ]
                </p>
                <h1 className="mt-2 text-4xl font-black uppercase text-nb-dark md:text-5xl leading-none">
                  TOBI SAPUTRA
                </h1>
                <div className="mt-3 border-l-4 border-nb-yellow pl-3">
                  <TypedRoles />
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/projects"
                    className="border-2 border-nb-dark bg-nb-yellow px-4 py-2 font-black text-nb-dark shadow-brutal-sm transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                    onClick={() => addXp(10)}
                  >
                    START QUEST
                  </Link>
                  <Link
                    href="/contact"
                    className="border-2 border-nb-dark bg-white px-4 py-2 font-black text-nb-dark shadow-brutal-sm transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                    onClick={() => addXp(10)}
                  >
                    CONTACT
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        <section className="mt-8 grid items-stretch gap-4 md:grid-cols-3">
          <QuestCard
            icon={<Rocket className="h-6 w-6" />}
            title="PROJECTS"
            description="Explore coding adventures and completed quests"
            href="/projects"
          />
          <QuestCard
            icon={<ShieldCheck className="h-6 w-6" />}
            title="SKILLS"
            description="See all programming weapons and abilities"
            href="/skills"
          />
          <QuestCard
            icon={<Mail className="h-6 w-6" />}
            title="CONTACT"
            description="Start a new collaboration quest"
            href="/contact"
          />
        </section>

        <Reveal delay={120}>
          <section className="mt-8 border-4 border-nb-dark bg-nb-pink p-6 shadow-brutal-lg">
            <h2 className="text-2xl font-black uppercase text-nb-dark">ABOUT PLAYER</h2>
            <div className="mt-1 h-1.5 w-16 bg-nb-dark" />
            <p className="mt-4 text-lg leading-relaxed text-nb-dark md:text-xl">
              Halo guys, gue Tobi. Gue mahasiswa yang masih terus belajar dunia programming, tapi selalu punya energi besar buat ngembangin skill. Fokus utama gue ada di web development dan software engineering. Selain ngoding, gue suka main game dan nonton anime. Gue excited buat terus berkembang dan kolaborasi bareng orang-orang yang punya passion yang sama.
            </p>
            <div className="mt-5 flex items-center gap-2 text-nb-dark">
              <Code2 className="h-5 w-5" />
              <span className="text-base font-bold md:text-lg">Jakarta, Indonesia - Student & Developer</span>
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
        className="group flex h-full min-h-[210px] flex-col border-4 border-nb-dark bg-white p-5 shadow-brutal-lg transition duration-300 hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none"
      >
        <div className="mb-3 inline-flex w-fit border-2 border-nb-dark bg-nb-yellow p-2 text-nb-dark">{icon}</div>
        <h3 className="text-lg font-black uppercase text-nb-dark">{title}</h3>
        <p className="mt-2 text-base leading-snug text-nb-dark/80">{description}</p>
        <p className="mt-auto pt-6 text-sm font-black uppercase text-nb-dark/70 transition group-hover:text-nb-dark">
          ENTER
        </p>
      </Link>
    </Reveal>
  );
}
