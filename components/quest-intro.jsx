"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import projectsData from "@/public/data/projects.json";
import {
  Swords,
  Rocket,
  ShieldCheck,
  Mail,
  ChevronRight,
  Github,
  Code2,
  Globe,
  Terminal,
  Smartphone,
  ExternalLink,
  Star,
} from "lucide-react";

/* ─────────────────────────── typing hook ─────────────────────────── */
function useTyping(text, { speed = 35, startDelay = 0, enabled = true } = {}) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enabled || !text) return;
    setDisplayed("");
    setDone(false);

    let i = 0;
    const startTimer = setTimeout(() => {
      const tick = setInterval(() => {
        i += 1;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(tick);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(tick);
    }, startDelay);

    return () => clearTimeout(startTimer);
  }, [text, speed, startDelay, enabled]);

  return { displayed, done };
}

/* ─────────────────────────── scene components ───────────────────── */

function SceneWrapper({ children, className = "" }) {
  return (
    <div className={`quest-scene flex min-h-screen w-full items-center justify-center p-4 ${className}`}>
      {children}
    </div>
  );
}

/* Scene 1 – Enter Name */
function SceneEnterName({ onSubmit }) {
  const [name, setName] = useState("");
  const [shaking, setShaking] = useState(false);
  const { displayed: label, done: labelDone } = useTyping("ENTER YOUR NAME, ADVENTURER...", {
    speed: 55,
    startDelay: 400,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
      return;
    }
    onSubmit(name.trim());
  };

  return (
    <SceneWrapper>
      <div className="quest-scene-card w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="quest-logo-ring">
            <Swords className="h-10 w-10 text-quest-glow" />
          </div>
          <h1 className="font-pixel text-xl text-quest-glow md:text-3xl quest-glow-text">CODE QUEST</h1>
          <p className="font-pixel text-[10px] text-quest-accent tracking-[0.25em]">TOBI SAPUTRA · PORTFOLIO</p>
        </div>

        {/* Typewriter prompt */}
        <p className="mb-6 min-h-[28px] text-center font-pixel text-[11px] text-slate-400">
          {label}
          {!labelDone && <span className="animate-pulse text-quest-accent">_</span>}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={`quest-input-wrap ${shaking ? "quest-shake" : ""}`}>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="Your name..."
              className="quest-input"
              autoComplete="off"
            />
            <div className="quest-input-glow" />
          </div>
          <button type="submit" className="quest-btn-primary w-full">
            <span>START QUEST</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-slate-500">
          Press <kbd className="rounded border border-slate-600 px-1.5 py-0.5 text-[11px] text-slate-400">Enter</kbd> to begin
        </p>
      </div>
    </SceneWrapper>
  );
}

/* Scene 2 – Meet Tobi */
function SceneMeetTobi({ playerName, onNext }) {
  const greeting = `Hey ${playerName}! Selamat datang di portfolio gue.`;
  const bio1 = "Gue Tobi, atau biasa dipanggil Tobz — mahasiswa Teknik Informatika di UNINDRA, Jakarta.";
  const bio2 =
    "Gue punya passion besar di dunia web development & software engineering. Selain coding, gue juga suka main game dan nonton anime yang kadang ngasih inspirasi buat project baru.";
  const bio3 = "Gue excited banget buat terus belajar dan berkembang. Yuk, explore portfolio gue!";

  const { displayed: g, done: gDone } = useTyping(greeting, { speed: 38, startDelay: 300 });
  const { displayed: b1, done: b1Done } = useTyping(bio1, { speed: 28, startDelay: 0, enabled: gDone });
  const { displayed: b2, done: b2Done } = useTyping(bio2, { speed: 22, startDelay: 0, enabled: b1Done });
  const { displayed: b3, done: b3Done } = useTyping(bio3, { speed: 28, startDelay: 200, enabled: b2Done });

  const allDone = b3Done;

  return (
    <SceneWrapper>
      <div className="quest-scene-card w-full max-w-2xl">
        <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
          {/* Avatar */}
          <div className="quest-avatar-ring shrink-0">
            <Image
              src="/images/profile.jpg"
              alt="Tobi Saputra"
              width={110}
              height={110}
              className="h-[110px] w-[110px] rounded-full object-cover"
              priority
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <p className="font-pixel text-[10px] text-quest-accent mb-1">[ PLAYER MET ]</p>
            <h2 className="font-pixel text-lg text-quest-glow md:text-2xl">TOBI SAPUTRA</h2>
            <p className="mt-1 text-sm text-slate-400">Full Stack Developer · Jakarta, Indonesia</p>
          </div>
        </div>

        <div className="space-y-4 text-lg leading-relaxed">
          <p className="min-h-[28px] text-quest-glow font-medium">
            {g}
            {!gDone && <span className="animate-pulse text-quest-accent">|</span>}
          </p>

          {gDone && (
            <p className="min-h-[28px] text-slate-200">
              {b1}
              {!b1Done && <span className="animate-pulse text-quest-accent">|</span>}
            </p>
          )}

          {b1Done && (
            <p className="min-h-[28px] text-slate-300">
              {b2}
              {!b2Done && <span className="animate-pulse text-quest-accent">|</span>}
            </p>
          )}

          {b2Done && (
            <p className="min-h-[28px] text-quest-accent">
              {b3}
              {!b3Done && <span className="animate-pulse">|</span>}
            </p>
          )}
        </div>

        <div
          className={`mt-8 flex justify-end transition-opacity duration-700 ${allDone ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <button type="button" onClick={onNext} className="quest-btn-primary">
            <span>Explore Projects</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </SceneWrapper>
  );
}

/* Scene 3 – Projects */
const PROJECT_COLORS = [
  "from-blue-500/20 to-cyan-500/10",
  "from-pink-500/20 to-purple-500/10",
  "from-green-500/20 to-emerald-500/10",
  "from-yellow-500/20 to-orange-500/10",
  "from-violet-500/20 to-blue-500/10",
  "from-amber-500/20 to-yellow-500/10",
  "from-rose-500/20 to-pink-500/10",
  "from-teal-500/20 to-cyan-500/10",
  "from-indigo-500/20 to-violet-500/10",
  "from-lime-500/20 to-green-500/10",
];

const FEATURED_PROJECTS = projectsData.map((p, i) => ({
  id: p.id,
  title: p.title,
  desc: p.description,
  tags: p.tags,
  link: p.link,
  color: PROJECT_COLORS[i % PROJECT_COLORS.length],
}));

function SceneProjects({ onNext }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const project = FEATURED_PROJECTS[activeIndex];

  return (
    <SceneWrapper>
      <div className="quest-scene-card w-full max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-md bg-quest-bg p-2 text-quest-accent">
            <Rocket className="h-5 w-5" />
          </div>
          <div>
            <p className="font-pixel text-[9px] text-quest-accent tracking-widest">CHAPTER 2</p>
            <h2 className="font-pixel text-base text-quest-glow md:text-xl">COMPLETED QUESTS</h2>
          </div>
        </div>

        <p className="mb-5 text-base text-slate-400">
          Beberapa project yang sudah gue selesaikan di coding adventure ini:
        </p>

        {/* Project tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          {FEATURED_PROJECTS.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`rounded-md border px-3 py-1.5 font-pixel text-[9px] transition-all duration-300 ${
                i === activeIndex
                  ? "border-quest-glow bg-quest-glow text-slate-900 shadow-lg shadow-quest-glow/30"
                  : "border-quest-line bg-quest-bg text-slate-300 hover:border-quest-accent hover:text-quest-accent"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
            </button>
          ))}
        </div>

        {/* Project card */}
        <div
          key={project.id}
          className={`quest-project-card bg-gradient-to-br ${project.color} rounded-xl border border-quest-line p-5 transition-all duration-300`}
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-pixel text-sm text-quest-glow md:text-base">{project.title}</h3>
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-md border border-quest-line bg-quest-bg/50 p-1.5 text-slate-400 transition hover:text-quest-glow"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <p className="mt-2 text-lg leading-relaxed text-slate-300">{project.desc}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-quest-bg/70 px-2 py-0.5 font-pixel text-[9px] text-quest-accent"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-3 text-right font-pixel text-[9px] text-slate-500">
          {activeIndex + 1} / {FEATURED_PROJECTS.length} PROJECTS
        </p>

        <div className="mt-6 flex items-center justify-between">
          <a
            href="/projects"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-slate-400 underline-offset-2 hover:text-quest-accent hover:underline"
          >
            <Github className="h-4 w-4" />
            Lihat semua project
          </a>
          <button type="button" onClick={onNext} className="quest-btn-primary">
            <span>Explore Skills</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </SceneWrapper>
  );
}

/* Scene 4 – Skills */
const SKILL_GROUPS = [
  {
    id: "languages",
    label: "Programming Languages",
    icon: <Terminal className="h-4 w-4" />,
    color: "text-sky-400",
    items: ["JavaScript", "TypeScript", "Python", "Go", "Dart", "C++", "Java"],
  },
  {
    id: "web",
    label: "Web Development",
    icon: <Globe className="h-4 w-4" />,
    color: "text-emerald-400",
    items: ["React", "Next.js", "Node.js", "Tailwind CSS", "HTML5", "CSS3"],
  },
  {
    id: "mobile",
    label: "Mobile",
    icon: <Smartphone className="h-4 w-4" />,
    color: "text-purple-400",
    items: ["Flutter", "React Native"],
  },
  {
    id: "tools",
    label: "Tools & Platforms",
    icon: <ShieldCheck className="h-4 w-4" />,
    color: "text-amber-400",
    items: ["Git", "GitHub", "Docker", "MongoDB", "PostgreSQL", "MySQL"],
  },
];

function SceneSkills({ onNext }) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    const timers = SKILL_GROUPS.map((_, i) => setTimeout(() => setRevealed((p) => Math.max(p, i + 1)), i * 280 + 100));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <SceneWrapper>
      <div className="quest-scene-card w-full max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-md bg-quest-bg p-2 text-quest-accent">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="font-pixel text-[9px] text-quest-accent tracking-widest">CHAPTER 3</p>
            <h2 className="font-pixel text-base text-quest-glow md:text-xl">WEAPON ARSENAL</h2>
          </div>
        </div>

        <p className="mb-6 text-base text-slate-400">
          Tech stack dan tools yang gue customize selama perjalanan coding:
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {SKILL_GROUPS.map((group, i) => (
            <div
              key={group.id}
              className={`quest-skill-group transition-all duration-500 ${
                i < revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className={`mb-3 flex items-center gap-2 ${group.color}`}>
                {group.icon}
                <span className="font-pixel text-[10px]">{group.label.toUpperCase()}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.items.map((skill, si) => (
                  <span
                    key={skill}
                    className="quest-skill-badge"
                    style={{ animationDelay: `${i * 280 + si * 60}ms` }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <a
            href="/skills"
            className="flex items-center gap-1.5 text-sm text-slate-400 underline-offset-2 hover:text-quest-accent hover:underline"
          >
            <Star className="h-4 w-4" />
            Lihat semua skills
          </a>
          <button type="button" onClick={onNext} className="quest-btn-primary">
            <span>Contact Me</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </SceneWrapper>
  );
}

/* Scene 5 – Contact Finale */
const SOCIALS = [
  { label: "GitHub", value: "@TobyG74", href: "https://github.com/TobyG74", color: "hover:border-slate-400" },
  {
    label: "LinkedIn",
    value: "Tobi Saputra",
    href: "https://www.linkedin.com/in/tobi-saputra/",
    color: "hover:border-blue-400",
  },
  {
    label: "Instagram",
    value: "@ini.tobz",
    href: "https://instagram.com/ini.tobz",
    color: "hover:border-pink-400",
  },
  {
    label: "Email",
    value: "tobisaputra11@gmail.com",
    href: "mailto:tobisaputra11@gmail.com",
    color: "hover:border-quest-accent",
  },
];

function SceneContact({ playerName, onFinish }) {
  const { displayed: line1, done: l1Done } = useTyping(
    `${playerName}, terima kasih udah explore portfolio gue!`,
    { speed: 38, startDelay: 300 },
  );
  const { displayed: line2, done: l2Done } = useTyping(
    "Kalau butuh bantuan, kolaborasi, atau sekedar ngobrol soal tech — gue siap!",
    { speed: 28, enabled: l1Done },
  );
  const { displayed: line3 } = useTyping("Reach me through:", { speed: 50, startDelay: 200, enabled: l2Done });

  return (
    <SceneWrapper>
      <div className="quest-scene-card w-full max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-md bg-quest-bg p-2 text-quest-accent">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <p className="font-pixel text-[9px] text-quest-accent tracking-widest">FINAL CHAPTER</p>
            <h2 className="font-pixel text-base text-quest-glow md:text-xl">START NEW QUEST</h2>
          </div>
        </div>

        <div className="space-y-4 text-lg leading-relaxed">
          <p className="min-h-[28px] text-quest-glow font-medium">
            {line1}
            {!l1Done && <span className="animate-pulse text-quest-accent">|</span>}
          </p>
          {l1Done && (
            <p className="min-h-[28px] text-slate-300">
              {line2}
              {!l2Done && <span className="animate-pulse text-quest-accent">|</span>}
            </p>
          )}
          {l2Done && (
            <p className="min-h-[28px] font-pixel text-[11px] text-quest-accent">{line3}</p>
          )}
        </div>

        {l2Done && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {SOCIALS.map((s, i) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`quest-contact-item ${s.color}`}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <span className="font-pixel text-[10px] text-slate-400">{s.label}</span>
                <span className="text-base text-slate-200">{s.value}</span>
              </a>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={onFinish}
            className="quest-btn-finish w-full max-w-xs"
          >
            <Swords className="h-5 w-5" />
            <span>ENTER PORTFOLIO</span>
            <Swords className="h-5 w-5 scale-x-[-1]" />
          </button>
          <p className="font-pixel text-[9px] text-slate-500">+50 XP · QUEST READY</p>
        </div>
      </div>
    </SceneWrapper>
  );
}

/* ─────────────────────────── Progress Bar ─────────────────────────── */
const STEPS = ["NAME", "MEET", "PROJECTS", "SKILLS", "CONTACT"];

function ProgressBar({ step }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-1 bg-quest-bg/90 px-4 py-2 backdrop-blur border-b border-quest-line">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-1">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full border font-pixel text-[8px] transition-all duration-500 ${
              i < step
                ? "border-quest-glow bg-quest-glow text-slate-900"
                : i === step
                ? "border-quest-accent text-quest-accent shadow-sm shadow-quest-accent/30 animate-pulse"
                : "border-quest-line text-slate-600"
            }`}
          >
            {i < step ? "✓" : i + 1}
          </div>
          <span
            className={`hidden font-pixel text-[8px] sm:inline ${
              i <= step ? "text-quest-accent" : "text-slate-600"
            }`}
          >
            {label}
          </span>
          {i < STEPS.length - 1 && (
            <div
              className={`mx-1 h-px w-4 transition-all duration-700 sm:w-8 ${
                i < step ? "bg-quest-glow" : "bg-quest-line"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────── Scene transition wrapper ─────────────── */
function SceneTransition({ children, sceneKey }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [sceneKey]);

  return (
    <div
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-[0.98]"
      }`}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────── Main export ─────────────────────────── */
export default function QuestIntro({ onComplete }) {
  const [step, setStep] = useState(0); // 0=name, 1=meet, 2=projects, 3=skills, 4=contact
  const [playerName, setPlayerName] = useState("");

  const handleName = useCallback(
    (name) => {
      setPlayerName(name);
      setStep(1);
    },
    [],
  );

  const next = useCallback(() => setStep((p) => Math.min(p + 1, 4)), []);
  const finish = useCallback(() => onComplete(playerName), [playerName, onComplete]);

  return (
    <div className="quest-intro-root">
      {/* Animated background particles */}
      <div className="quest-bg-particles" aria-hidden="true">
        {Array.from({ length: 18 }, (_, i) => (
          <div
            key={i}
            className="quest-particle"
            style={{
              left: `${(i * 34 + 7) % 100}%`,
              top: `${(i * 53 + 11) % 100}%`,
              animationDelay: `${(i % 7) * 0.6}s`,
              animationDuration: `${4 + (i % 5) * 0.8}s`,
            }}
          />
        ))}
      </div>

      {/* Step progress */}
      {step > 0 && <ProgressBar step={step} />}

      {/* Scenes */}
      <SceneTransition sceneKey={step}>
        {step === 0 && <SceneEnterName onSubmit={handleName} />}
        {step === 1 && <SceneMeetTobi playerName={playerName} onNext={next} />}
        {step === 2 && <SceneProjects onNext={next} />}
        {step === 3 && <SceneSkills onNext={next} />}
        {step === 4 && <SceneContact playerName={playerName} onFinish={finish} />}
      </SceneTransition>
    </div>
  );
}
