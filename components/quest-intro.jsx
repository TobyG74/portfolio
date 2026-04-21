"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import projectsData from "@/public/data/projects.json";
import {
  Zap,
  Rocket,
  ShieldCheck,
  Mail,
  ChevronRight,
  Globe,
  Terminal,
  Smartphone,
  ExternalLink,
  Star,
} from "lucide-react";

/* typing hook */
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

/* Scene wrapper */
function SceneWrapper({ children }) {
  return (
    <div className="nb-scene">
      {children}
    </div>
  );
}

/* Scene 1 - Enter Name */
function SceneEnterName({ onSubmit }) {
  const [name, setName] = useState("");
  const [shaking, setShaking] = useState(false);
  const { displayed: label, done: labelDone } = useTyping("ENTER YOUR NAME...", {
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
      <div className="nb-scene-card w-full max-w-lg">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center border-4 border-nb-dark bg-nb-yellow shadow-brutal">
            <Zap className="h-8 w-8 text-nb-dark" />
          </div>
          <h1 className="text-3xl font-black uppercase text-nb-dark md:text-4xl">TOBI SAPUTRA</h1>
          <div className="border-2 border-nb-dark bg-nb-dark px-4 py-1">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-nb-yellow">PORTFOLIO</p>
          </div>
        </div>

        <p className="mb-6 min-h-[28px] text-center font-bold text-nb-dark/70">
          {label}
          {!labelDone && <span className="animate-pulse text-nb-yellow">_</span>}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={`nb-input-wrap ${shaking ? "nb-shake" : ""}`}>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="Your name..."
              className="nb-input"
              autoComplete="off"
            />
          </div>
          <button type="submit" className="nb-btn-primary w-full">
            <span>START</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-nb-dark/50">
          Press <kbd className="border-2 border-nb-dark bg-nb-gray px-1.5 py-0.5 text-xs font-bold">Enter</kbd> to begin
        </p>
      </div>
    </SceneWrapper>
  );
}

/* Scene 2 - Meet Tobi */
function SceneMeetTobi({ playerName, onNext }) {
  const greeting = `Hey ${playerName}! Selamat datang di portfolio gue.`;
  const bio1 = "Gue Tobi, atau biasa dipanggil Tobz — mahasiswa Teknik Informatika di UNINDRA, Jakarta.";
  const bio2 = "Gue punya passion besar di dunia web development & software engineering. Selain coding, gue juga suka main game dan nonton anime.";
  const bio3 = "Gue excited banget buat terus belajar dan berkembang. Yuk, explore portfolio gue!";

  const { displayed: g, done: gDone } = useTyping(greeting, { speed: 38, startDelay: 300 });
  const { displayed: b1, done: b1Done } = useTyping(bio1, { speed: 28, startDelay: 0, enabled: gDone });
  const { displayed: b2, done: b2Done } = useTyping(bio2, { speed: 22, startDelay: 0, enabled: b1Done });
  const { displayed: b3, done: b3Done } = useTyping(bio3, { speed: 28, startDelay: 200, enabled: b2Done });

  const allDone = b3Done;

  return (
    <SceneWrapper>
      <div className="nb-scene-card w-full max-w-2xl">
        <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
          <div className="shrink-0 border-4 border-nb-dark shadow-brutal">
            <Image
              src="/images/profile.jpg"
              alt="Tobi Saputra"
              width={110}
              height={110}
              className="h-[110px] w-[110px] object-cover block"
              priority
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="inline-block border-2 border-nb-dark bg-nb-green px-3 py-1 mb-2">
              <p className="text-xs font-black uppercase text-nb-dark tracking-widest">PLAYER MET</p>
            </div>
            <h2 className="text-2xl font-black uppercase text-nb-dark md:text-3xl">TOBI SAPUTRA</h2>
            <p className="mt-1 text-sm font-medium text-nb-dark/60">Full Stack Developer · Jakarta, Indonesia</p>
          </div>
        </div>

        <div className="space-y-4 text-base leading-relaxed">
          <p className="min-h-[24px] font-bold text-nb-dark">
            {g}
            {!gDone && <span className="animate-pulse text-nb-yellow">|</span>}
          </p>

          {gDone && (
            <p className="min-h-[24px] text-nb-dark/80">
              {b1}
              {!b1Done && <span className="animate-pulse text-nb-yellow">|</span>}
            </p>
          )}

          {b1Done && (
            <p className="min-h-[24px] text-nb-dark/80">
              {b2}
              {!b2Done && <span className="animate-pulse text-nb-yellow">|</span>}
            </p>
          )}

          {b2Done && (
            <p className="min-h-[24px] font-bold text-nb-dark">
              {b3}
              {!b3Done && <span className="animate-pulse text-nb-yellow">|</span>}
            </p>
          )}
        </div>

        <div className={`mt-8 flex justify-end transition-opacity duration-700 ${allDone ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <button type="button" onClick={onNext} className="nb-btn-primary">
            <span>Explore Projects</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </SceneWrapper>
  );
}

/* Scene 3 - Projects */
const PROJECT_COLORS = [
  "bg-nb-blue",
  "bg-nb-pink",
  "bg-nb-green",
  "bg-nb-yellow",
  "bg-nb-gray",
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
      <div className="nb-scene-card w-full max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center border-2 border-nb-dark bg-nb-yellow">
            <Rocket className="h-5 w-5 text-nb-dark" />
          </div>
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-nb-dark/50">CHAPTER 2</p>
            <h2 className="text-xl font-black uppercase text-nb-dark md:text-2xl">PROJECTS</h2>
          </div>
        </div>

        <p className="mb-5 text-base text-nb-dark/70">
          Beberapa project yang sudah gue selesaikan:
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          {FEATURED_PROJECTS.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`border-2 border-nb-dark px-3 py-1.5 text-xs font-black uppercase transition ${
                i === activeIndex
                  ? "bg-nb-dark text-nb-yellow"
                  : "bg-nb-gray text-nb-dark shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
            </button>
          ))}
        </div>

        <div key={project.id} className={`border-3 border-2 border-nb-dark ${project.color} p-5 shadow-brutal`}>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-black uppercase text-nb-dark md:text-lg">{project.title}</h3>
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 border-2 border-nb-dark bg-white p-1.5 text-nb-dark shadow-brutal-sm transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-nb-dark/80">{project.desc}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span key={tag} className="border-2 border-nb-dark bg-white px-2 py-0.5 text-xs font-bold text-nb-dark">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-3 text-right font-mono text-xs font-bold text-nb-dark/50">
          {activeIndex + 1} / {FEATURED_PROJECTS.length}
        </p>

        <div className="mt-6 flex items-center justify-between">
          <a
            href="/projects"
            className="flex items-center gap-1.5 text-sm font-bold text-nb-dark underline underline-offset-2 hover:no-underline"
          >
            <Star className="h-4 w-4" />
            Lihat semua project
          </a>
          <button type="button" onClick={onNext} className="nb-btn-primary">
            <span>Explore Skills</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </SceneWrapper>
  );
}

/* Scene 4 - Skills */
const SKILL_GROUPS = [
  {
    id: "languages",
    label: "Languages",
    icon: <Terminal className="h-4 w-4" />,
    color: "bg-nb-blue",
    items: ["JavaScript", "TypeScript", "Python", "Go", "Dart", "C++", "Java"],
  },
  {
    id: "web",
    label: "Web Dev",
    icon: <Globe className="h-4 w-4" />,
    color: "bg-nb-green",
    items: ["React", "Next.js", "Node.js", "Tailwind CSS", "HTML5", "CSS3"],
  },
  {
    id: "mobile",
    label: "Mobile",
    icon: <Smartphone className="h-4 w-4" />,
    color: "bg-nb-pink",
    items: ["Flutter", "React Native"],
  },
  {
    id: "tools",
    label: "Tools",
    icon: <ShieldCheck className="h-4 w-4" />,
    color: "bg-nb-yellow",
    items: ["Git", "GitHub", "Docker", "MongoDB", "PostgreSQL", "MySQL"],
  },
];

function SceneSkills({ onNext }) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    const timers = SKILL_GROUPS.map((_, i) =>
      setTimeout(() => setRevealed((p) => Math.max(p, i + 1)), i * 280 + 100),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <SceneWrapper>
      <div className="nb-scene-card w-full max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center border-2 border-nb-dark bg-nb-blue">
            <ShieldCheck className="h-5 w-5 text-nb-dark" />
          </div>
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-nb-dark/50">CHAPTER 3</p>
            <h2 className="text-xl font-black uppercase text-nb-dark md:text-2xl">SKILLS</h2>
          </div>
        </div>

        <p className="mb-6 text-base text-nb-dark/70">Tech stack dan tools yang gue pake:</p>

        <div className="grid gap-4 sm:grid-cols-2">
          {SKILL_GROUPS.map((group, i) => (
            <div
              key={group.id}
              className={`nb-skill-group transition-all duration-500 ${
                i < revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className={`mb-3 flex items-center gap-2 border-2 border-nb-dark ${group.color} px-3 py-2`}>
                {group.icon}
                <span className="text-xs font-black uppercase text-nb-dark">{group.label}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.items.map((skill, si) => (
                  <span
                    key={skill}
                    className="nb-skill-badge"
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
            className="flex items-center gap-1.5 text-sm font-bold text-nb-dark underline underline-offset-2 hover:no-underline"
          >
            <Star className="h-4 w-4" />
            Lihat semua skills
          </a>
          <button type="button" onClick={onNext} className="nb-btn-primary">
            <span>Contact Me</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </SceneWrapper>
  );
}

/* Scene 5 - Contact Finale */
const SOCIALS = [
  { label: "GitHub", value: "@TobyG74", href: "https://github.com/TobyG74", color: "bg-nb-gray" },
  { label: "LinkedIn", value: "Tobi Saputra", href: "https://www.linkedin.com/in/tobi-saputra/", color: "bg-nb-blue" },
  { label: "Instagram", value: "@ini.tobz", href: "https://instagram.com/ini.tobz", color: "bg-nb-pink" },
  { label: "Email", value: "tobisaputra11@gmail.com", href: "mailto:tobisaputra11@gmail.com", color: "bg-nb-green" },
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
      <div className="nb-scene-card w-full max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center border-2 border-nb-dark bg-nb-pink">
            <Mail className="h-5 w-5 text-nb-dark" />
          </div>
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-nb-dark/50">FINAL</p>
            <h2 className="text-xl font-black uppercase text-nb-dark md:text-2xl">CONNECT</h2>
          </div>
        </div>

        <div className="space-y-4 text-base leading-relaxed">
          <p className="min-h-[24px] font-bold text-nb-dark">
            {line1}
            {!l1Done && <span className="animate-pulse text-nb-yellow">|</span>}
          </p>
          {l1Done && (
            <p className="min-h-[24px] text-nb-dark/80">
              {line2}
              {!l2Done && <span className="animate-pulse text-nb-yellow">|</span>}
            </p>
          )}
          {l2Done && (
            <p className="min-h-[24px] font-black uppercase text-nb-dark text-sm tracking-wider">{line3}</p>
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
                className={`nb-contact-item ${s.color}`}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <span className="text-xs font-black uppercase text-nb-dark">{s.label}</span>
                <span className="text-sm font-medium text-nb-dark">{s.value}</span>
              </a>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-4">
          <button type="button" onClick={onFinish} className="nb-btn-finish w-full max-w-xs">
            <Zap className="h-5 w-5" />
            <span>ENTER PORTFOLIO</span>
            <Zap className="h-5 w-5" />
          </button>
          <p className="font-mono text-xs font-bold text-nb-dark/40 uppercase tracking-widest">+50 XP · READY</p>
        </div>
      </div>
    </SceneWrapper>
  );
}

/* Progress Bar */
const STEPS = ["NAME", "MEET", "PROJECTS", "SKILLS", "CONTACT"];

function ProgressBar({ step }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-1 border-b-4 border-nb-dark bg-nb-yellow px-4 py-2">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-1">
          <div
            className={`flex h-6 w-6 items-center justify-center border-2 border-nb-dark text-xs font-black transition-all duration-500 ${
              i < step
                ? "bg-nb-dark text-nb-yellow"
                : i === step
                ? "bg-white text-nb-dark"
                : "bg-nb-gray text-nb-dark/50"
            }`}
          >
            {i < step ? "✓" : i + 1}
          </div>
          <span className={`hidden text-xs font-black uppercase sm:inline ${i <= step ? "text-nb-dark" : "text-nb-dark/40"}`}>
            {label}
          </span>
          {i < STEPS.length - 1 && (
            <div className={`mx-1 h-0.5 w-4 border-t-2 border-dashed sm:w-8 ${i < step ? "border-nb-dark" : "border-nb-dark/30"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* Scene transition */
function SceneTransition({ children, sceneKey }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [sceneKey]);

  return (
    <div className={`transition-all duration-500 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      {children}
    </div>
  );
}

/* Main export */
export default function QuestIntro({ onComplete }) {
  const [step, setStep] = useState(0);
  const [playerName, setPlayerName] = useState("");

  const handleName = useCallback((name) => {
    setPlayerName(name);
    setStep(1);
  }, []);

  const next = useCallback(() => setStep((p) => Math.min(p + 1, 4)), []);
  const finish = useCallback(() => onComplete(playerName), [playerName, onComplete]);

  return (
    <div className="nb-intro-root">
      <div className="nb-bg-dots" aria-hidden="true" />
      {step > 0 && <ProgressBar step={step} />}
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
