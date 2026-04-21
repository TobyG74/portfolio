import { Space_Grotesk, DM_Mono } from "next/font/google";
import "./globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { GameProvider } from "@/components/game-provider";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-grotesk",
});

const mono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
});

export const metadata = {
  title: "TOBI SAPUTRA — Portfolio",
  description: "Neo Brutalism portfolio built with Next.js and Tailwind CSS",
  icons: {
    icon: [{ url: "/favicon.ico?v=4", type: "image/x-icon" }],
    shortcut: [{ url: "/favicon.ico?v=4", type: "image/x-icon" }],
    apple: [{ url: "/favicon.ico?v=4" }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${grotesk.variable} ${mono.variable}`}>
      <body className="font-sans">
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}
