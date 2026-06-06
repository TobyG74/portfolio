<div align="center">

# ⟡ Tobi Saputra — Portfolio

### A futuristic, interactive developer portfolio

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Three.js](https://img.shields.io/badge/Three.js-r174-000000?style=for-the-badge&logo=three.js)](https://threejs.org)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-KV-F6821F?style=for-the-badge&logo=cloudflare)](https://developers.cloudflare.com/kv/)

**[🌐 Live](https://itstobz.me)** · **[💻 GitHub](https://github.com/TobyG74)**

</div>

---

## ✨ Overview

A single-page portfolio with a **holographic void** aesthetic: an interactive 3D
constellation background that reacts to the cursor, a variable-font hero whose
letters respond to the mouse, a holographic project carousel, and a guestbook +
visitor counter backed by **Cloudflare KV**.

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS 3.4 |
| 3D | Three.js, @react-three/fiber, @react-three/drei |
| Motion | Framer Motion |
| Icons | lucide-react |
| Fonts | Unbounded · Sora · JetBrains Mono (`next/font`) |
| Persistence | Cloudflare KV (REST API) |

## 📁 Structure

```
app/
  layout.js              # fonts, metadata, global chrome (3D bg, nav, footer, HUD)
  page.jsx               # home: About -> Skills -> Projects -> Guestbook -> Contact
  guestbook/page.jsx     # full guestbook
  api/visitors/route.js  # visitor counter (KV)
  api/guestbook/route.js # guestbook list/post (KV + IP anti-spam)
components/              # Scene3D, CursorFX, Navbar, About, Skills, Projects, ...
lib/
  kv.js                  # Cloudflare KV REST helper + IP utilities
  content.js             # profile, socials, stats + project/skill loaders
public/                  # data/*.json + images
```

## 🧑‍💻 Getting Started

```bash
npm install
npm run dev        # http://localhost:3000
```

Without KV credentials the app falls back to an **in-memory store** (data resets
on restart) so you can develop offline.

## 🔑 Environment Variables

Copy `.env.example` -> `.env.local` and fill in:

| Variable | Required | Description |
|----------|----------|-------------|
| `CLOUDFLARE_ACCOUNT_ID` | for KV | Cloudflare account ID |
| `CLOUDFLARE_KV_NAMESPACE_ID` | for KV | KV namespace ID |
| `CLOUDFLARE_API_TOKEN` | for KV | Token with **Workers KV Storage: Edit** |
| `VISITOR_COUNTER_KEY` | optional | Counter key (default `site_visitors`) |

> ⚠️ `.env` and `.env*.local` are git-ignored. **Never commit real tokens.**

**Create the KV namespace + token:** Cloudflare dashboard -> *Storage & Databases
-> KV* -> create namespace (copy its ID). Then *My Profile -> API Tokens* -> create
a token with the *Workers KV Storage: Edit* permission.

## ☁️ Deployment

### Vercel (simplest)
1. Import the repo at [vercel.com/new](https://vercel.com/new).
2. Add the env vars (Project -> Settings -> Environment Variables).
3. Deploy. Build command `next build` is auto-detected.

### Cloudflare Workers (OpenNext)
Uses [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare). Config lives
in [`wrangler.jsonc`](./wrangler.jsonc) and [`open-next.config.ts`](./open-next.config.ts).

```bash
# one-time: log in
npx wrangler login

# set secrets (do NOT hardcode tokens in wrangler.jsonc)
npx wrangler secret put CLOUDFLARE_ACCOUNT_ID
npx wrangler secret put CLOUDFLARE_KV_NAMESPACE_ID
npx wrangler secret put CLOUDFLARE_API_TOKEN

npm run preview    # build + run locally on the Workers runtime
npm run deploy     # build + deploy to Cloudflare Workers
```

For local `npm run preview`, copy `.dev.vars.example` -> `.dev.vars`.

### Cloudflare Pages
Cloudflare now recommends **Workers** (above) for Next.js apps that use Node.js
runtime route handlers (this project does). If you prefer Pages, see the
[framework guide](https://developers.cloudflare.com/workers/frameworks/framework-guides/nextjs/);
note that `@cloudflare/next-on-pages` requires `export const runtime = "edge"` on
every route, which would need changes to the `app/api/*` handlers.

### Node / Docker / other hosts
Any Node host works with the standard output:

```bash
npm run build
npm run start      # serves on PORT (default 3000)
```

Set the same environment variables on the host.

## 📜 Scripts

| Script | Action |
|--------|--------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (Next.js) |
| `npm run start` | Serve the production build (Node) |
| `npm run lint` | ESLint |
| `npm run preview` | Build + preview on the Cloudflare Workers runtime |
| `npm run deploy` | Build + deploy to Cloudflare Workers |
| `npm run cf-typegen` | Generate Cloudflare env types |

## 📝 License

Personal project © Tobi Saputra ([@TobyG74](https://github.com/TobyG74)).
