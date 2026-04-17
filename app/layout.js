import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { GameProvider } from "@/components/game-provider";

const pixel = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
});

const retro = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-retro",
});

export const metadata = {
  title: "TOBI SAPUTRA - Code Quest",
  description: "Game-themed portfolio built with Next.js and Tailwind CSS",
  icons: {
    icon: [{ url: "/favicon.ico?v=4", type: "image/x-icon" }],
    shortcut: [{ url: "/favicon.ico?v=4", type: "image/x-icon" }],
    apple: [{ url: "/favicon.ico?v=4" }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${pixel.variable} ${retro.variable}`}>
      <body className="font-retro">
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}
