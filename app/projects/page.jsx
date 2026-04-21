import Image from "next/image";
import Link from "next/link";
import SiteShell from "@/components/site-shell";
import { getProjects } from "@/lib/content";
import Reveal from "@/components/reveal";

const PROJECT_COLORS = [
  "bg-nb-yellow",
  "bg-nb-pink",
  "bg-nb-blue",
  "bg-nb-green",
  "bg-nb-gray",
];

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <SiteShell>
      <Reveal>
        <section className="mb-8 border-4 border-nb-dark bg-nb-yellow p-6 shadow-brutal-lg">
          <h1 className="text-3xl font-black uppercase text-nb-dark md:text-4xl">PROJECTS</h1>
          <div className="mt-1 h-1.5 w-16 bg-nb-dark" />
          <p className="mt-2 text-lg font-bold text-nb-dark/80">Explore my coding adventures and projects</p>
        </section>
      </Reveal>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project, index) => {
          const imagePath = project.image.replace("public", "");
          const bgColor = PROJECT_COLORS[index % PROJECT_COLORS.length];
          return (
            <Reveal key={project.id} delay={project.id * 60} className="h-full">
              <article
                className={`flex h-full flex-col overflow-hidden border-4 border-nb-dark ${bgColor} shadow-brutal transition hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none`}
              >
                <div className="relative h-48 shrink-0 overflow-hidden border-b-4 border-nb-dark">
                  <Image src={imagePath} alt={project.title} fill className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <h2 className="text-lg font-black uppercase text-nb-dark">{project.title}</h2>
                  <p className="flex-1 text-base leading-relaxed text-nb-dark/80">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span key={tag} className="border-2 border-nb-dark bg-white px-2 py-0.5 text-xs font-bold text-nb-dark">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-auto inline-block border-2 border-nb-dark bg-nb-dark px-4 py-2 text-center text-sm font-black uppercase text-white shadow-brutal-sm transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                  >
                    VIEW PROJECT →
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
