import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VisitorCounter from "@/components/VisitorCounter";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    "Portfolio Tobi Saputra (TobyG74) — software engineer yang membangun bot, API, dan aplikasi multi-platform.",
  keywords: ["Tobi Saputra", "TobyG74", "Software Engineer", "Full Stack", "Portfolio"],
  authors: [{ name: "Tobi Saputra" }],
  openGraph: {
    title: "Tobi Saputra",
    description:
      "Portfolio Tobi Saputra (TobyG74) — software engineer yang membangun bot, API, dan aplikasi multi-platform.",
    url: SITE_URL,
    siteName: "Tobi Saputra",
    images: [{ url: "/images/profile.jpg", width: 1200, height: 1200, alt: "Tobi Saputra" }],
    type: "website",
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBFBF9" },
    { media: "(prefers-color-scheme: dark)", color: "#1C293C" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrains.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.classList.toggle("dark",localStorage.getItem("tobz-theme")==="dark")}catch(e){}`,
          }}
        />
      </head>
      <body className="bg-bg font-body text-fg antialiased selection:bg-fg selection:text-bg">
        <a href="#main-content" className="skip-link">Langsung ke konten</a>
        <Navbar />
        <main id="main-content" className="relative" tabIndex={-1}>{children}</main>
        <Footer />
        <VisitorCounter />
      </body>
    </html>
  );
}
