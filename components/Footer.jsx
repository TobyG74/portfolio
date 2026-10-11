import Link from "next/link";
import { ArrowUp } from "lucide-react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-inner">
        <Link href="/#home" className="footer-brand">tobz.</Link>
        <p>© 2026 Tobi Saputra <span>Dibangun sambil ngoprek.</span></p>
        <Link href="/#home" className="footer-top">Balik ke atas <ArrowUp size={17} aria-hidden="true" /></Link>
      </div>
    </footer>
  );
}
