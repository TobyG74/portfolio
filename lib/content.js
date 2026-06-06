import projectsRaw from "@/public/data/projects.json";
import skillsRaw from "@/public/data/skills.json";

/** Normalize a stored image path ("public/images/x.png") to a public URL ("/images/x.png"). */
function toPublicUrl(p) {
  if (!p) return "";
  return "/" + p.replace(/^public\//, "").replace(/^\/+/, "");
}

export const projects = projectsRaw.map((p) => ({
  ...p,
  image: toPublicUrl(p.image),
}));

export const skills = skillsRaw;

export const profile = {
  name: "Tobi Saputra",
  handle: "TobyG74",
  alias: "ini.tobz",
  roles: ["Software Engineer", "Bot & API Builder", "Full-Stack Developer", "Reverse Engineer"],
  location: "Jakarta, Indonesia",
  avatar: "/images/profile.jpg",
  bio: "Mahasiswa Teknik Informatika di UNINDRA yang suka ngoprek. Dari bikin bot WhatsApp & LINE, API downloader yang dipakai banyak developer, sampai aplikasi mobile. Gue bangun hal-hal yang bener-bener dipakai orang.",
};

export const socials = [
  { title: "GitHub", value: "@TobyG74", href: "https://github.com/TobyG74", icon: "github" },
  { title: "LinkedIn", value: "Tobi Saputra", href: "https://www.linkedin.com/in/tobi-saputra/", icon: "linkedin" },
  { title: "Instagram", value: "@ini.tobz", href: "https://instagram.com/ini.tobz", icon: "instagram" },
  { title: "Email", value: "tobisaputra11@gmail.com", href: "mailto:tobisaputra11@gmail.com", icon: "mail" },
];

export const stats = [
  { label: "Projects Shipped", value: "10+" },
  { label: "Languages", value: "9" },
  { label: "GitHub Repos", value: "40+" },
  { label: "Years Coding", value: "5+" },
];
