import SectionHeading from "./SectionHeading";

export default function Roadmap({ items, offset = 0, part, parts }) {
  return (
    <div className="roadmap-grid">
      <SectionHeading index={4} eyebrow="Roadmap" title="Masih terus belajar." sub="Mulai dari Lua dan GameGuardian di 2016, lanjut bikin LINE BOT, belajar web, dan mengembangkan aplikasi bareng teman. Ini perjalanan gue sejauh ini." part={part} parts={parts} />
      <ol className="roadmap-list">
        {items.map((item, index) => (
          <li key={item.year}>
            <span className={`roadmap-year ${index === items.length - 1 ? "is-current" : ""}`}>{item.year}</span>
            <div><span className="eyebrow">{String(offset + index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.body}</p><div className="roadmap-tech">{item.tech.map((tech) => <span key={tech}>{tech}</span>)}</div></div>
          </li>
        ))}
      </ol>
    </div>
  );
}
