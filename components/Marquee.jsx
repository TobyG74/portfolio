export default function Marquee() {
  return (
    <div className="principles-band" aria-label="Fokus pengembangan">
      {["BOT & AUTOMATION", "WEB DEVELOPMENT", "MOBILE APPS", "REVERSE ENGINEERING"].map((value) => (
        <span key={value}><span aria-hidden="true">/</span>{value}</span>
      ))}
    </div>
  );
}
