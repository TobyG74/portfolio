export default function Footer() {
  return (
    <footer className="relative mx-auto max-w-5xl px-5 pb-12 pt-4 sm:px-8">
      <div className="flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-8 sm:flex-row">
        <p className="font-mono text-xs text-ghost/60">
          © 2026 Tobi Saputra · Built with Next.js + Three.js
        </p>
        <p className="font-mono text-xs text-ghost/60">
          Designed in the <span className="text-aqua">void</span> ◇ Jakarta, ID
        </p>
      </div>
    </footer>
  );
}
