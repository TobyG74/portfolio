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

const CATEGORY_COLORS = [
  "bg-nb-blue",
  "bg-nb-yellow",
  "bg-nb-pink",
  "bg-nb-green",
  "bg-nb-gray",
];

function getCategoryIcon(category) {
  if (category?.icon) return category.icon;
  return "fa-solid fa-cubes";
}

export default async function SkillsPage() {
  const skillsData = await getSkills();
  const categories = Array.isArray(skillsData)
    ? [{ id: "all-skills", label: "Tech Stack & Tools", items: skillsData }]
    : skillsData.categories || [];
  const title = Array.isArray(skillsData) ? "WEAPON ARSENAL" : skillsData.title || "WEAPON ARSENAL";

  return (
    <SiteShell>
      <Reveal>
        <section className="mb-8 border-4 border-nb-dark bg-nb-blue p-6 shadow-brutal-lg">
          <h1 className="text-3xl font-black uppercase text-nb-dark md:text-4xl">{title.toUpperCase()}</h1>
          <div className="mt-1 h-1.5 w-16 bg-nb-dark" />
          <p className="mt-2 text-lg font-bold text-nb-dark/80">My programming powers and tech stack</p>
        </section>
      </Reveal>

      <section className="grid gap-5">
        {categories.map((category, index) => {
          const bgColor = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
          return (
            <Reveal key={category.id || category.label} delay={index * 70}>
              <div className={`border-4 border-nb-dark ${bgColor} p-5 shadow-brutal`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center border-2 border-nb-dark bg-white">
                    <i className={`${getCategoryIcon(category)} text-lg text-nb-dark`} aria-hidden="true" />
                  </div>
                  <h2 className="text-lg font-black uppercase text-nb-dark">{category.label}</h2>
                </div>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10">
                  {(category.items || []).map((item) => (
                    <div
                      key={`${category.id}-${item.name}`}
                      className="group aspect-square border-2 border-nb-dark bg-white p-1.5 shadow-brutal-sm transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-nb-yellow"
                    >
                      <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
                        <i className={`${item.icon || getFaIcon(item.name)} text-sm text-nb-dark`} aria-hidden="true" />
                        <span className="block text-[10px] font-bold leading-tight text-nb-dark">{item.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          );
        })}
      </section>
    </SiteShell>
  );
}
