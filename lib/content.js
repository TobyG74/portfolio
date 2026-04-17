import projects from "@/public/data/projects.json";
import skills from "@/public/data/skills.json";

export async function getProjects() {
  return projects;
}

export async function getSkills() {
  return skills;
}
