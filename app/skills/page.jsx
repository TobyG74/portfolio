import SiteShell from "@/components/site-shell";
import { getSkills } from "@/lib/content";
import Reveal from "@/components/reveal";

function getFaIcon(name) {
  const map = {
    JavaScript: "fa-brands fa-js",
    TypeScript: "fa-solid fa-code",
    Python: "fa-brands fa-python",
    Go: "fa-solid fa-code",
    "C++": "fa-solid fa-code",
    Java: "fa-brands fa-java",
    Pascal: "fa-solid fa-code",
    Dart: "fa-solid fa-code",
    Nim: "fa-solid fa-code",
    HTML5: "fa-brands fa-html5",
    CSS3: "fa-brands fa-css3-alt",
    React: "fa-brands fa-react",
    "Next.js": "fa-solid fa-n",
    "Node.js": "fa-brands fa-node-js",
    Bootstrap: "fa-brands fa-bootstrap",
    "Tailwind CSS": "fa-solid fa-wind",
    Flutter: "fa-solid fa-mobile-screen-button",
    "React Native": "fa-brands fa-react",
    MongoDB: "fa-solid fa-database",
    SQLite: "fa-solid fa-database",
    MySQL: "fa-solid fa-database",
    PostgreSQL: "fa-solid fa-database",
    Git: "fa-brands fa-git-alt",
    GitHub: "fa-brands fa-github",
    NPM: "fa-brands fa-npm",
    Docker: "fa-brands fa-docker",
    Nodemon: "fa-solid fa-terminal",
    PM2: "fa-solid fa-server",
    Prisma: "fa-solid fa-cubes",
    JetBrains: "fa-solid fa-laptop-code",
    Sublime: "fa-solid fa-file-code",
    "VS Code": "fa-solid fa-code",
    "Android Studio": "fa-brands fa-android",
    Windows: "fa-brands fa-windows",
    "Arch Linux": "fa-brands fa-linux",
  };

  return map[name] || "fa-solid fa-code";
}

function getTone(label) {
  const palette = [
    "border-cyan-300/40 bg-cyan-500/10 text-cyan-300",
    "border-amber-300/40 bg-amber-500/10 text-amber-300",
    "border-emerald-300/40 bg-emerald-500/10 text-emerald-300",
    "border-fuchsia-300/40 bg-fuchsia-500/10 text-fuchsia-300",
  ];
  return palette[label.length % palette.length];
}

function getCategoryIcon(category) {
  if (category?.icon) return category.icon;
  return "fa-solid fa-cubes";
}

export default async function SkillsPage() {
  const skillsData = await getSkills();
  const categories = Array.isArray(skillsData)
    ? [
        {
          id: "all-skills",
          label: "Tech Stack & Tools",
          items: skillsData,
        },
      ]
    : skillsData.categories || [];
  const title = Array.isArray(skillsData) ? "WEAPON ARSENAL" : skillsData.title || "WEAPON ARSENAL";

  return (
    <SiteShell>
      <Reveal>
        <section className="mb-8">
        <h1 className="font-pixel text-lg text-quest-glow md:text-2xl">{title.toUpperCase()}</h1>
        <p className="mt-2 text-xl text-quest-accent md:text-2xl">My programming powers and tech stack</p>
        </section>
      </Reveal>

      <section className="grid gap-4">
        {categories.map((category, index) => (
          <Reveal key={category.id || category.label} delay={index * 70}>
            <div className={`hover-panel rounded-xl border p-5 backdrop-blur-sm ${getTone(category.label || String(index))}`}>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-black/20">
                  <i className={`${getCategoryIcon(category)} text-xl`} aria-hidden="true" />
                </span>
                <h2 className="font-pixel text-[11px] md:text-xs">{category.label}</h2>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10">
                {(category.items || []).map((item) => (
                  <div
                    key={`${category.id}-${item.name}`}
                    className="group aspect-square rounded-md border border-white/15 bg-black/20 p-1.5 lg:p-1"
                  >
                    <div className="flex h-full flex-col items-center justify-center gap-1.5 text-center">
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 transition group-hover:scale-105 group-hover:bg-white/15 lg:h-8 lg:w-8">
                        <i className={`${item.icon || getFaIcon(item.name)} text-sm lg:text-xs`} aria-hidden="true" />
                      </div>
                      <span className="block text-[16px] leading-tight text-slate-100 lg:text-[20px]">{item.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </section>
    </SiteShell>
  );
}
