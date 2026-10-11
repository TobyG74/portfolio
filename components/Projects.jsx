import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import SectionHeading from "./SectionHeading";

export default function Projects({ items, offset = 0, part, parts }) {
  return (
    <>
      <SectionHeading index={3} eyebrow="Projects" title="Dibikin. Dicoba. Dipakai." sub="Aplikasi, bot, dan eksperimen yang lahir dari kebutuhan dan rasa penasaran." part={part} parts={parts} />
      <div className="projects-grid">
        {items.map((project, index) => (
          <a key={project.id} href={project.link} target="_blank" rel="noreferrer" className={`project-card ${index === 0 ? "project-featured" : ""}`}>
            <div className="project-image">
              <Image src={project.image} alt={`Tampilan ${project.title}`} fill sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 600px" className="object-cover" />
              <span className="project-category">{project.tags[0]}</span>
            </div>
            <div className="project-body">
              <div className="project-title-row"><span className="project-index">{String(offset + index + 1).padStart(2, "0")}</span><h3>{project.title}</h3><ArrowUpRight size={23} aria-hidden="true" /></div>
              <p>{project.description}</p>
              <div className="project-tags">{project.tags.slice(1).map((tag) => <span key={tag} className="chip">{tag}</span>)}<span className="project-source">Lihat repository</span></div>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
