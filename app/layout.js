import { Unbounded, Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SceneMount from "@/components/SceneMount";
import CursorFX from "@/components/CursorFX";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VisitorCounter from "@/components/VisitorCounter";

// variable font (weight 200–900)
const display = Unbounded({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sora",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

const SITE_URL = "https://itztobz.me";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Tobi Saputra",
  description:
    "Portfolio futuristik Tobi Saputra (TobyG74) yang membangun bot, API, dan aplikasi multi-platform.",
  keywords: ["Tobi Saputra", "TobyG74", "Software Engineer", "Full Stack", "Portfolio"],
  authors: [{ name: "Tobi Saputra" }],
  openGraph: {
    title: "Tobi Saputra",
    description: "Portfolio futuristik Tobi Saputra (TobyG74) yang membangun bot, API, dan aplikasi multi-platform.",
    url: SITE_URL,
    siteName: "Tobi Saputra",
    images: [{ url: "/images/profile.jpg", width: 1200, height: 1200, alt: "Tobi Saputra" }],
    type: "website",
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport = {
  themeColor: "#04060a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${display.variable} ${sora.variable} ${jetbrains.variable}`}>
      <body className="bg-void font-body text-ghost antialiased selection:bg-aqua/30 selection:text-white">
        <SceneMount />
        <CursorFX />
        <Navbar />
        <main className="relative">{children}</main>
        <Footer />
        <VisitorCounter />
      </body>
    </html>
  );
}
