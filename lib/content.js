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

/* Roadmap — the years, in order. Edit here, the section renders itself. */
export const roadmap = [
  {
    year: "2016",
    title: "Lua & GameGuardian",
    body: "Gue sempat belajar Lua buat bikin script cheat game menggunakan GameGuardian. Dari sini gue mulai kenal pemrograman.",
    tech: ["Lua", "GameGuardian"],
  },
  {
    year: "2017-2018",
    title: "Mulai dari LINE BOT",
    body: "Gue mulai belajar Python karena tertarik bikin LINE BOT. Repositorinya sekarang gue namai BotToby. Waktu itu laptop gue masih berspesifikasi rendah, jadi gue pakai Sublime Text sebagai editor pertama buat belajar coding.",
    tech: ["Python", "LINE BOT", "Sublime Text"],
  },
  {
    year: "2019",
    title: "Belajar web",
    body: "Mulai belajar HTML, CSS, dan JavaScript, lalu eksplorasi library dan framework seperti React, Next.js, Bootstrap, dan lainnya.",
    tech: ["HTML", "CSS", "JavaScript", "React", "Next.js", "Bootstrap"],
  },
  {
    year: "2020",
    title: "WhatsApp BOT & database",
    body: "Mulai tertarik dengan TypeScript dan database. Gue mengembangkan WhatsApp BOT pakai OpenWA, menamai repositorinya ElainaBOT, lalu mencoba mengintegrasikannya dengan database NoSQL MongoDB.",
    tech: ["TypeScript", "OpenWA", "MongoDB"],
  },
  {
    year: "2021",
    title: "Proyek kecil TypeScript",
    body: "Lanjut mendalami TypeScript dengan mencoba bikin proyek-proyek kecil berbasis TypeScript.",
    tech: ["TypeScript"],
  },
  {
    year: "2022",
    title: "Kuliah & logika pemrograman",
    body: "Di perjalanan kuliah, gue belajar Pascal dan mendalami logika pemrogramannya.",
    tech: ["Pascal"],
  },
  {
    year: "2023",
    title: "Bikin library sendiri",
    body: "Tertarik bikin library berbasis TypeScript. Gue mengembangkan twitter-downloader dan tiktok-api-dl.",
    tech: ["TypeScript"],
  },
  {
    year: "2024",
    title: "Belajar Java & Kotlin",
    body: "Mulai belajar Java dan Kotlin, bikin proyek-proyek kecil, dan memahami logika pemrogramannya. Di tahun ini gue sudah mendapat pekerjaan dan bisa mewujudkan keinginan membeli laptop baru. Gue pun mulai pakai Android Studio dan Visual Studio Code.",
    tech: ["Java", "Kotlin", "Android Studio", "Visual Studio Code"],
  },
  {
    year: "2025",
    title: "Dart & LMSUnindraMobile",
    body: "Gue mulai belajar Dart dan bikin LMSUnindraMobile, proyek berbasis Dart.",
    tech: ["Dart"],
  },
  {
    year: "2026",
    title: "RE:KBBI & Torikomi",
    body: "Mulai belajar Nim dan berkolaborasi dengan teman bikin RE:KBBI. Gue juga bikin Torikomi, aplikasi downloader all-in-one berbasis Kotlin hasil kolaborasi bareng teman-teman.",
    tech: ["Nim", "Kotlin"],
  },
];
