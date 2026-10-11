import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Github, Gamepad2 } from "lucide-react";
import { profile } from "@/lib/content";
import Marquee from "./Marquee";
import TypedRoles from "./TypedRoles";

export default function Hero() {
  return (
    <>
      <div className="hero-grid">
        <div className="hero-copy">
          <p className="hero-intro">Halo, gue Tobi. <span>Salam kenal!</span></p>
          <h1 className="hero-name">TOBI<br /><span>SAPUTRA.</span></h1>
          <p className="hero-role"><TypedRoles roles={profile.roles} /></p>
          <p className="hero-description">
            Dari bot WhatsApp, API downloader, sampai aplikasi mobile.
            Gue suka ngebongkar cara kerja sesuatu, lalu ngebangun hal yang bisa dipakai orang.
          </p>
          <div className="hero-actions">
            <a href="#work" className="btn">Lihat proyek <ArrowDown size={18} aria-hidden="true" /></a>
            <a href="#contact" className="btn-ghost">Ngobrol yuk</a>
          </div>
          <div className="hero-links">
            <a href={`https://github.com/${profile.handle}`} target="_blank" rel="noreferrer">
              <Github size={17} aria-hidden="true" /> {profile.handle} <ArrowUpRight size={14} aria-hidden="true" />
            </a>
            <span>{profile.location}</span>
          </div>
        </div>
        <div className="hero-visual">
          <figure className="portrait-card">
            <div className="portrait-top"><span>Kenalan dulu.</span><span className="font-mono">01 / TOBZ</span></div>
            <div className="portrait-image">
              <Image src={profile.avatar} alt="Tobi Saputra" fill priority sizes="(max-width: 767px) 85vw, 420px" className="object-cover" />
            </div>
            <figcaption className="portrait-caption"><span>{profile.alias}</span><span>Developer, Jakarta</span></figcaption>
          </figure>
          <span className="portrait-label">Full-Stack Developer</span>
          <Link href="/world" className="world-link">
            <span className="world-icon"><Gamepad2 size={26} strokeWidth={2.25} aria-hidden="true" /></span>
            <span><strong>Ada dunia lain di sini.</strong><span>Main di Tobiverse, dunia RPG 3D gue.</span></span>
            <ArrowUpRight size={22} className="shrink-0" aria-hidden="true" />
          </Link>
        </div>
      </div>
      <Marquee />
    </>
  );
}
