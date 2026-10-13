import Image from "next/image";
import { Code2, FileCode2, Globe, Smartphone, Database, Wrench, SquareCode, MonitorCog } from "lucide-react";
import SectionHeading from "./SectionHeading";

const ICONS = {
  "programming-languages": Code2,
  "web-development": Globe,
  "mobile-development": Smartphone,
  databases: Database,
  "tools-platforms": Wrench,
  "editors-ides": SquareCode,
  "operating-systems": MonitorCog,
};

export default function Skills({ items, offset = 0, part, parts }) {
  return (
    <>
      <SectionHeading index={2} eyebrow="Tech stack" title="Di balik layar." sub="Bahasa, framework, dan tools yang gue pakai buat ngebangun." part={part} parts={parts} />
      <div className="skills-list">
        {items.map((category, index) => {
          const Icon = ICONS[category.id] || Code2;
          return (
            <div key={category.id} className="skill-row">
              <span className="skill-index">{String(offset + index + 1).padStart(2, "0")}</span>
              <h3><Icon size={21} strokeWidth={2.25} aria-hidden="true" />{category.label}</h3>
              <ul>{category.items.map((item) => (
                <li key={item.name} className="chip">
                  {item.icon?.startsWith("/") ? (
                    <Image src={item.icon} alt="" aria-hidden="true" width={20} height={20} className="skill-icon" unoptimized />
                  ) : item.icon === "file-code" ? (
                    <FileCode2 size={20} aria-hidden="true" />
                  ) : (
                    <Code2 size={20} aria-hidden="true" />
                  )}
                  {item.name}
                </li>
              ))}</ul>
            </div>
          );
        })}
      </div>
    </>
  );
}
