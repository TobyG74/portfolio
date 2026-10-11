import { ArrowUpRight } from "lucide-react";
import { profile, projects, skills } from "@/lib/content";
import SectionHeading from "./SectionHeading";

export default function About() {
  return (
    <div className="about-grid">
      <div>
        <SectionHeading index={1} eyebrow="Sedikit tentang gue" title="Rasa penasaran, jadi baris kode." />
        <a href={`https://github.com/${profile.handle}`} target="_blank" rel="noreferrer" className="text-link">
          Kenalan lewat GitHub <ArrowUpRight size={18} aria-hidden="true" />
        </a>
      </div>
      <div className="about-copy">
        <p className="about-lead">Gue Full-Stack Developer yang senang bikin sesuatu buat kebutuhan sehari-hari.</p>
        <p>{profile.bio}</p>
        <dl className="about-stats">
          <div><dd>{String(projects.length).padStart(2, "0")}</dd><dt>Proyek di portfolio</dt></div>
          <div><dd>{String(skills.categories.find((category) => category.id === "programming-languages").items.length).padStart(2, "0")}</dd><dt>Bahasa pemrograman</dt></div>
          <div><dd>2016</dd><dt>Mulai ngoding</dt></div>
        </dl>
      </div>
    </div>
  );
}
