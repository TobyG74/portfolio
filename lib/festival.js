/**
 * Village festivals. Right now there is exactly one: the portfolio owner's
 * birthday on 30 July, which the whole village celebrates every year.
 *
 * Pure date logic, no THREE and no React, so scripts/check-festival.mjs can
 * pin the behaviour without waiting for the calendar.
 */

// relative, not the @/ alias: the check scripts run this file under plain Node
import { site } from "./config.js";

/** Configured in lib/config.js, since that is where dates are meant to live. */
export const BIRTHDAY = site.birthday;

/** True on 30 July of any year, read from the visitor's own clock. */
export function isBirthday(now = new Date()) {
  return now.getMonth() + 1 === BIRTHDAY.month && now.getDate() === BIRTHDAY.day;
}

/** Years elapsed since a given birth year, or null when we do not know one. */
export function ageOn(now = new Date(), birthYear = null) {
  if (!birthYear) return null;
  return now.getFullYear() - birthYear;
}

export const FESTIVAL_TITLE = "Selamat Ulang Tahun!";

/**
 * A line every NPC says before their usual script on the day. Keyed loosely so
 * each villager sounds like themselves rather than reading the same card.
 */
export const BIRTHDAY_LINES = {
  sage: "Berhenti sejenak, pengembara. Hari ini tanah ini berpesta, sebab hari ini Beliau dilahirkan.",
  archivist:
    "Arsip ditutup hari ini. Bahkan penjaga catatan pun ikut merayakan hari lahir Beliau.",
  botsmith:
    "Kzzt, protokol perayaan aktif. Seluruh mesin buatan Beliau berhenti sejenak untuk hari lahirnya.",
  smith: "Tempa saya dingin hari ini. Hari lahir Beliau lebih pantas ditemani nyanyian.",
  pathfinder:
    "Aku catat satu tahun lagi pada jarak tempuh Beliau. Hari ini tepat hari lahirnya.",
  bard: "Sudah kusiapkan lagu paling panjang. Hari ini hari lahir Beliau, dan aku tidak akan berhemat bait.",
  questgiver:
    "Papan misi tutup sehari. Perintah dari saya sendiri, sebab hari ini Beliau berulang tahun.",
  messenger:
    "Surat ucapan menumpuk sampai ke pinggir meja. Semuanya untuk hari lahir Beliau.",
  keeper: "Halaman pertama buku besar hari ini saya kosongkan, khusus untuk ucapan bagi Beliau.",
  warden: "Gerbang dibuka lebar hari ini. Siapa pun boleh masuk merayakan hari lahir Beliau.",
  cook: "Panci saya penuh sejak subuh. Hari lahir Beliau tidak boleh lewat tanpa jamuan.",
  gardener: "Bunga terbaik sudah saya petik pagi ini, untuk hari lahir Beliau.",
  minstrel: "Genderang sudah ditegakkan di lapangan. Hari ini kita menari untuk Beliau.",
  herbalist: "Ramuan perayaan saya bagikan gratis hari ini. Hari lahir Beliau, siapa yang menolak?",
  scribe: "Saya sedang menyalin ucapan dari seluruh penjuru. Hari lahir Beliau ramai sekali.",
  child: "Katanya hari ini ada kue sebesar rumah! Untuk yang punya tanah ini, katanya.",
};

/** Fallback for any villager without a line of their own. */
export const BIRTHDAY_FALLBACK =
  "Selamat hari lahir untuk Beliau. Hari ini seluruh desa ikut bersukacita.";

export const birthdayLineFor = (id) => BIRTHDAY_LINES[id] || BIRTHDAY_FALLBACK;

/**
 * Fallback cheers only. Each villager carries its own `shout` in lib/npcs.js,
 * because hashing 16 villagers into a pool of 8 lines guaranteed duplicates by
 * the pigeonhole principle, and two neighbours saying the same thing is
 * exactly what it looked like.
 */
export const BIRTHDAY_SHOUTS = [
  "Selamat hari lahir, Beliau!",
  "Panjang umur untuk Beliau!",
  "Hari ini milik Beliau!",
  "Sehat selalu, Beliau!",
  "Bersukacitalah, Beliau berulang tahun!",
  "Untuk Beliau, hormat kami!",
  "Semoga terus berkarya, Beliau!",
  "Selamat, penjaga tanah ini!",
];

/** Stable per villager, so each one keeps saying the same thing all day. */
export function birthdayShoutFor(id = "") {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return BIRTHDAY_SHOUTS[sum % BIRTHDAY_SHOUTS.length];
}

/** What the gossiping pairs murmur about instead of their usual talk. */
export const BIRTHDAY_GOSSIP = [
  ["Sudah kau lihat lapangan? Dihias sejak semalam.", "Sudah. Untuk hari lahir Beliau, katanya."],
  ["Kue itu tingginya melewati kepalaku.", "Dan lilinnya, aku berhenti menghitung."],
  ["Aku menitipkan ucapan pada Kurir Rin.", "Semua orang menitipkan. Tasnya hampir jebol."],
];
