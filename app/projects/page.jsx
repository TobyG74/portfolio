import Image from "next/image";
import Link from "next/link";
import SiteShell from "@/components/site-shell";
import { getProjects } from "@/lib/content";
import Reveal from "@/components/reveal";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <SiteShell>
      <Reveal>
        <section className="mb-8">
        <h1 className="font-pixel text-lg text-quest-glow md:text-2xl">COMPLETED QUESTS</h1>
        <p className="mt-2 text-xl text-quest-accent md:text-2xl">Explore my coding adventures and projects</p>
        </section>
      </Reveal>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => {
          const imagePath = project.image.replace("public", "");
          return (
            <Reveal key={project.id} delay={project.id * 60} className="h-full">
              <article className="hover-panel flex h-full flex-col overflow-hidden rounded-xl border border-quest-line bg-quest-card">
              <div className="relative h-48 shrink-0 overflow-hidden">
                <Image src={imagePath} alt={project.title} fill className="object-cover transition duration-700 hover:scale-110" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-quest-bg/60 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <h2 className="font-pixel text-[11px] text-quest-glow">{project.title}</h2>
                <p className="flex-1 text-lg leading-relaxed text-slate-200">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-quest-line bg-quest-bg px-3 py-1 text-sm text-quest-accent">
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  href={project.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-auto inline-block rounded-md border border-quest-glow bg-quest-glow px-4 py-2 font-pixel text-[10px] text-slate-900 shadow-lg shadow-quest-glow/25 hover:-translate-y-0.5 hover:brightness-110"
                >
                  VIEW QUEST
                </Link>
              </div>
              </article>
            </Reveal>
          );
        })}
      </section>
    </SiteShell>
  );
}
