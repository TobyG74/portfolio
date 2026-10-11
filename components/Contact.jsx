import { Github, Linkedin, Instagram, Mail, ArrowUpRight } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { socials } from "@/lib/content";

const ICONS = { github: Github, linkedin: Linkedin, instagram: Instagram, mail: Mail };

export default function Contact() {
  return (
    <div className="contact-panel">
      <SectionHeading index={6} eyebrow="Contact" title="Ide lo, kode gue. Ayo ngobrol." sub="Mau bikin proyek, kolaborasi open-source, atau nanya soal kode? Langsung sapa gue." />
      <a href="mailto:tobisaputra11@gmail.com" className="contact-email"><span>tobisaputra11@gmail.com</span><ArrowUpRight size={34} aria-hidden="true" /></a>
      <div className="contact-socials">
        {socials.map((social) => {
          const Icon = ICONS[social.icon] || Mail;
          return <a key={social.title} href={social.href} target={social.icon === "mail" ? undefined : "_blank"} rel={social.icon === "mail" ? undefined : "noreferrer"}><Icon size={19} aria-hidden="true" />{social.title}</a>;
        })}
      </div>
    </div>
  );
}
