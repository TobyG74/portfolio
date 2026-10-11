export default function SectionHeading({ index, eyebrow, title, sub, part, parts }) {
  return (
    <div className="section-heading">
      <div className="section-rail">
        <span className="section-number">{String(index).padStart(2, "0")}</span>
        <span className="eyebrow">{eyebrow}</span>
        <span className="section-rule" />
        {parts > 1 && <span className="eyebrow">{part}/{parts}</span>}
      </div>
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
    </div>
  );
}
