# Portfolio Tobi Saputra

Portfolio pribadi dengan daftar proyek, skill, roadmap belajar, guestbook, dan 3D World yang bisa dijelajahi. Di dalam world ada NPC, papan misi, monster, senjata, dan leaderboard.

Website: [itztobz.me](https://itztobz.me). GitHub: [TobyG74](https://github.com/TobyG74).

## Menjalankan project

```bash
npm ci
npm run dev
```

Buka `http://localhost:3000`. Server dev menyimpan output di `.next-dev`, sedangkan build produksi memakai `.next`, sehingga build tidak menimpa bundle server dev yang sedang berjalan.

Untuk menjalankan build produksi:

```bash
npm run build
npm start
```

## Struktur

```text
app/                     Halaman utama, guestbook, world, dan API
components/              Komponen portfolio dan 3D World
lib/content.js           Profil, sosial, dan roadmap
lib/config.js            Konfigurasi world, kontrol, dan kualitas render
lib/game.js              Level, combat, senjata, dan monster
lib/npcs.js              Data NPC dan desa
lib/kv.js                Penyimpanan Cloudflare KV
public/data/             Data proyek dan skill
public/images/           Gambar profil dan proyek
public/models/           Model dan tekstur yang digunakan world
scripts/check-*.mjs      Pemeriksaan konfigurasi, aset, dan logika game
```

Project memakai Next.js 15, React 19, Tailwind CSS, Three.js, React Three Fiber, Drei, Framer Motion, dan Lucide.

## Environment

Salin `.env.example` ke `.env.local`, lalu isi nilai yang diperlukan:

| Variabel | Fungsi |
|----------|--------|
| `CLOUDFLARE_ACCOUNT_ID` | ID akun Cloudflare |
| `CLOUDFLARE_KV_NAMESPACE_ID` | ID namespace KV |
| `CLOUDFLARE_API_TOKEN` | Token dengan izin mengakses Workers KV |
| `VISITOR_COUNTER_KEY` | Nama key counter; default `site_visitors` |

Tanpa kredensial KV, project memakai penyimpanan dalam memori yang akan hilang ketika proses dimulai ulang.

Untuk preview Cloudflare Workers, salin `.dev.vars.example` ke `.dev.vars`. Next.js membaca file `.env`, sedangkan Wrangler membaca `.dev.vars`.

File environment lokal, `node_modules`, cache, dan output build sudah masuk `.gitignore`. Hanya template `.env.example` dan `.dev.vars.example` yang disertakan dalam repository. Simpan `package-lock.json` agar versi dependency konsisten saat `npm ci`.

## Pemeriksaan

```bash
npm run lint
node scripts/check-next-config.mjs
node scripts/check-assets.mjs
node scripts/check-config.mjs
node scripts/check-game.mjs
node scripts/check-collision.mjs
node scripts/check-festival.mjs
node scripts/check-rig.mjs
npm run build
```

## Deploy

Untuk hosting Node, gunakan `npm run build` dan `npm start`, lalu pasang environment di hosting tersebut. Repository ini memakai route API, sehingga memerlukan hosting yang menjalankan Next.js.

Adapter Cloudflare Workers tersedia melalui `open-next.config.ts`. Sebelum memakai `npm run preview` atau `npm run deploy`, buat konfigurasi Wrangler untuk worker, entry `.open-next/worker.js`, assets `.open-next/assets`, dan kompatibilitas Node. Konfigurasi `wrangler.jsonc` belum tersedia dalam project ini.

Pasang kredensial KV sebagai secret Workers sebelum deploy. Jangan menulis token asli di file konfigurasi yang akan diunggah ke GitHub.

Project pribadi Tobi Saputra.
