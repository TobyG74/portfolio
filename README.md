<div align="center">

```
 ██████╗ ██████╗ ██████╗ ███████╗     ██████╗ ██╗   ██╗███████╗███████╗████████╗
██╔════╝██╔═══██╗██╔══██╗██╔════╝    ██╔═══██╗██║   ██║██╔════╝██╔════╝╚══██╔══╝
██║     ██║   ██║██║  ██║█████╗      ██║   ██║██║   ██║█████╗  ███████╗   ██║   
██║     ██║   ██║██║  ██║██╔══╝      ██║▄▄ ██║██║   ██║██╔══╝  ╚════██║   ██║   
╚██████╗╚██████╔╝██████╔╝███████╗    ╚██████╔╝╚██████╔╝███████╗███████║   ██║   
 ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝     ╚══▀▀═╝  ╚═════╝ ╚══════╝╚══════╝   ╚═╝  
```

### ⚔️ A Gamified Developer Portfolio — Built on the Edge ⚔️

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-Edge-F6821F?style=for-the-badge&logo=cloudflare)](https://workers.cloudflare.com)
[![Wrangler](https://img.shields.io/badge/Wrangler-4.8-F6821F?style=for-the-badge&logo=cloudflare)](https://developers.cloudflare.com/workers/wrangler)

**[🌐 Live Demo](https://tobz-portfolio.tobisaputra11.workers.dev)** · **[📦 Source](https://github.com/TobyG74/tobyg74.github.io)** · **[📬 Contact](https://tobz-portfolio.tobisaputra11.workers.dev/contact)**

</div>

---

## 🗡️ What is Code Quest?

**Code Quest** is a fully gamified developer portfolio for **Tobi Saputra** — an RPG-themed, edge-deployed Next.js app where *visitors become players*. Instead of a plain "About Me" page, visitors enter their name, earn XP by exploring pages, and level up as they discover projects and skills.

> *"Turn your portfolio into an adventure."*

---

## ✨ Features

### 🎮 RPG Game System
- **Player onboarding** — visitors enter their name to "Start the Quest"
- **XP & Level system** — earn XP by visiting pages, hitting the API, and exploring content
- **Level-up notifications** — animated banner pops up when you reach a new level
- **Persistent state** — player name, XP, and quest progress saved to `localStorage`

### 🌐 Edge-Powered Visitor Counter
- Real-time visitor counter backed by **Cloudflare KV** (key-value store)
- Uses `getCloudflareContext()` from `@opennextjs/cloudflare` — no REST calls, no extra env vars
- Smart deduplication via `localStorage` — each unique visitor counted only once
- Graceful fallback when KV is unavailable (dev/preview mode)

### 🎨 Visual Design
- **Pixel & retro fonts** for that old-school RPG terminal feel
- **Custom color palette**: deep navy backgrounds (`#060816`), golden glow (`#f4c95d`), teal accent (`#5dd9c1`)
- **CRT scanline overlay** & grid background texture
- **Neon glow borders** and ambient floating particle effects
- **Scroll-triggered reveal animations** via IntersectionObserver

### 🖥️ Pages
| Page | Description |
|------|-------------|
| `/` | Hero section with profile photo, typed role animation, XP bar |
| `/projects` | Equal-height project cards grid with tags and live links |
| `/skills` | Categorized tech stack (languages, frameworks, tools, DBs) |
| `/contact` | Contact form + social links (GitHub, LinkedIn, Instagram, Email) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **UI** | React 19, Tailwind CSS 3.4 |
| **Icons** | Lucide React, Font Awesome 7 |
| **Deployment** | Cloudflare Workers (via `@opennextjs/cloudflare`) |
| **Persistence** | Cloudflare KV (visitor counter) |
| **CLI** | Wrangler 4.8 |
| **Language** | JavaScript (JSX) |

---

## 📁 Project Structure

```
tobyg74.github.io/
├── app/
│   ├── page.jsx              # Home / hero page (RPG intro screen)
│   ├── layout.js             # Root layout with GameProvider
│   ├── globals.css           # Global styles + CRT/scanline effects
│   ├── projects/page.jsx     # Projects grid
│   ├── skills/page.jsx       # Skills & tech stack
│   ├── contact/page.jsx      # Contact form + socials
│   └── api/visitors/
│       └── route.js          # Visitor counter API (Cloudflare KV)
├── components/
│   ├── site-shell.jsx        # Global layout: navbar, visitor counter, XP bar
│   ├── game-provider.jsx     # React context for RPG game state
│   ├── reveal.jsx            # IntersectionObserver scroll animation
│   ├── typed-roles.jsx       # Typewriter role animation
│   └── ambient-effects.jsx   # Floating particles background
├── lib/
│   └── content.js            # Data loaders (projects, skills)
├── public/
│   ├── data/
│   │   ├── projects.json     # Project list
│   │   └── skills.json       # Tech stack categories
│   └── images/               # Profile photo + project screenshots
├── wrangler.jsonc             # Cloudflare Workers config + KV binding
└── tailwind.config.js         # Custom quest color palette + pixel fonts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Cloudflare account](https://dash.cloudflare.com) (for deployment)
- Wrangler CLI authenticated (`npx wrangler login`)

### Local Development

```bash
# Clone the repo
git clone https://github.com/TobyG74/tobyg74.github.io.git
cd tobyg74.github.io

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and enter the quest.

> **Note:** The visitor counter will return `persisted: false` in local dev — this is expected. KV binding is only available in the Cloudflare Workers runtime.

### Preview on Cloudflare (local Workers simulation)

```bash
npm run preview
```

---

## ☁️ Deployment

This site deploys to **Cloudflare Workers** using [`@opennextjs/cloudflare`](https://github.com/opennextjs/opennextjs-cloudflare).

### One-Command Deploy

```bash
npm run deploy
```

This runs `opennextjs-cloudflare build && wrangler deploy` — builds the Next.js app, adapts it for the Workers runtime, and uploads to Cloudflare's edge network.

### Cloudflare KV Setup (for visitor counter)

1. Create a KV namespace in the [Cloudflare Dashboard](https://dash.cloudflare.com) or via CLI:
   ```bash
   npx wrangler kv namespace create "KV"
   ```
2. Copy the namespace ID into `wrangler.jsonc`:
   ```jsonc
   "kv_namespaces": [
     { "binding": "KV", "id": "YOUR_NAMESPACE_ID" }
   ]
   ```
3. Deploy — the counter will start persisting immediately.

---

## ⚙️ Configuration

### `wrangler.jsonc`

```jsonc
{
  "name": "tobz-portfolio",
  "main": ".open-next/worker.js",
  "compatibility_date": "2026-04-17",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },
  "kv_namespaces": [
    { "binding": "KV", "id": "<your-kv-namespace-id>" }
  ]
}
```

### Environment Variables (optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `VISITOR_COUNTER_KEY` | `site_visitors` | KV key used to store the visitor count |

---

## 🎯 How the Game Works

```
┌─────────────────────────────────────────────────┐
│  VISITOR ARRIVES                                │
│         ↓                                      │
│  Enter your name → START QUEST                  │
│         ↓                                      │
│  XP earned per action:                         │
│   • Starting quest    → +20 XP                 │
│   • Clicking nav link → +10 XP                 │
│   • Visiting new page → +15 XP                 │
│         ↓                                      │
│  Every 100 XP = Level Up 🏆                    │
│         ↓                                      │
│  Progress saved to localStorage (persists)     │
└─────────────────────────────────────────────────┘
```

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build for production |
| `npm run deploy` | Build & deploy to Cloudflare Workers |
| `npm run preview` | Local Cloudflare Workers simulation |
| `npm run lint` | Run ESLint |

---

## 👤 Author

<div align="center">

**Tobi Saputra**

[![GitHub](https://img.shields.io/badge/GitHub-TobyG74-181717?style=flat-square&logo=github)](https://github.com/TobyG74)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Tobi_Saputra-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/tobi-saputra/)
[![Instagram](https://img.shields.io/badge/Instagram-@ini.tobz-E4405F?style=flat-square&logo=instagram)](https://instagram.com/ini.tobz)
[![Email](https://img.shields.io/badge/Email-tobisaputra11@gmail.com-EA4335?style=flat-square&logo=gmail)](mailto:tobisaputra11@gmail.com)

</div>

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

*Built with ⚔️ and deployed on the edge.*

`[ QUEST COMPLETE ]`

</div>
