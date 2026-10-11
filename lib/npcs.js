import { profile, socials, stats, skills, projects } from "@/lib/content";

const stat = (label) => stats.find((s) => s.label === label)?.value ?? "?";

/**
 * NPC dialogue is derived from the same content the portfolio sections use,
 * so editing lib/content.js (or the JSON) updates the world too.
 *
 * pos    : [x, y, z] spawn point on the ground plane
 * patrol : optional waypoints [[x, z], ...] the NPC walks between
 * home   : optional house id this NPC lives in (see `houses` below)
 */
export const npcs = [
  {
    id: "sage",
    shout: "Panjang umur untuk Beliau!",
    model: "Wizard",
    name: "RESI ALDRIN",
    role: "Juru Kisah",
    face: "🧙",
    color: "#22e8ff",
    pos: [-9, 0, -5],
    home: "sage",
    lines: [
      `Selamat datang di Tobiverse, pengembara. Seluruh tanah ini milik Beliau, ${profile.name}.`,
      profile.bio,
      `Rakyat di sini memanggil Beliau @${profile.handle}. Kediaman utamanya berada di ${profile.location}.`,
      `Beliau tidak terikat pada satu gelar. ${profile.roles.join(", ")}, semuanya Beliau sandang.`,
      "Berkelilinglah dahulu. Setiap penduduk menyimpan kisah yang berbeda tentang Beliau.",
    ],
  },
  {
    id: "archivist",
    shout: "Hari lahir Beliau tercatat abadi!",
    model: "Shaman",
    name: "PENJAGA ARSIP NOVA",
    role: "Cendekia",
    face: "🎓",
    color: "#7c5cff",
    pos: [-6, 0, -12],
    lines: [
      "Aku penjaga arsip di wilayah ini. Izinkan aku menuturkan asal ilmu Beliau.",
      "Beliau menempuh pendidikan Teknik Informatika di UNINDRA. Separuh waktunya habis di antara tugas dan barisan kode.",
      "Bedanya, karya Beliau tidak pernah berhenti sebagai tugas semata. Sebagian dipakai satu kampus.",
      "Bila Anda ingin melihat buktinya, papan misi berdiri di sebelah utara.",
    ],
  },
  {
    id: "botsmith",
    shout: "Kzzt! Selamat hari lahir, Beliau!",
    model: "Assassin",
    name: "UNIT SIRKUIT",
    role: "Mesin Rakitan",
    face: "🤖",
    color: "#0eb6d4",
    pos: [6, 0, -12],
    patrol: [
      [6, -12],
      [11, -9],
      [7, -6],
    ],
    lines: [
      "Kzzt, salam hormat. Aku salah satu mesin yang Beliau rakit sendiri.",
      "Beliau memulai dari bot WhatsApp dan LINE. Ukurannya kecil, namun bekerja tanpa henti walau tidak diperintah.",
      "Setelah itu Beliau naik derajat: API downloader yang kini dipakai banyak pengembang lain.",
      "Bagi Beliau, otomasi bukan pameran teknologi, melainkan penolakan mengerjakan hal yang sama dua kali.",
    ],
  },
  {
    id: "smith",
    shout: "Tempa saya menyala untuk Beliau!",
    model: "Warrior",
    name: "EMPU TEMPA",
    role: "Pandai Besi",
    face: "⚒️",
    color: "#ffc93c",
    pos: [9, 0, -5],
    home: "smith",
    // an NPC with a menu asks first and talks second. `shop` opens the stall,
    // any other id plays that topic's lines.
    greeting: "Selamat datang di tempa saya, pengembara. Ada perlu apa?",
    menu: [
      { id: "shop", label: "TOKO", hint: "Tempa senjata dengan koin buruan" },
      { id: "arsenal", label: "LIHAT GUDANG SENJATA TOBZ", hint: "Perkakas yang Beliau kuasai" },
    ],
    topics: {
      arsenal: [
        "Anda ingin menengok gudang senjata Beliau? Semuanya ditempa dari medan nyata, bukan latihan.",
        ...skills.categories.map(
          (c) => `${c.label}, tingkat ${c.items.length}: ${c.items.map((i) => i.name).join(", ")}.`
        ),
        "Tidak ada satu pun yang sekadar pajangan. Semuanya pernah Beliau pakai bertempur.",
      ],
    },
  },
  {
    id: "pathfinder",
    shout: "Satu tahun lagi tertempuh, Beliau!",
    model: "Hunter",
    name: "PERINTIS IRA",
    role: "Pemandu",
    face: "🧭",
    color: "#a6ff3d",
    pos: [-13, 0, -1],
    patrol: [
      [-13, -1],
      [-8, 3],
      [-14, 5],
    ],
    lines: [
      "Aku mencatat jarak tempuh setiap pengembara. Milik Beliau termasuk yang terpanjang.",
      `${stat("Years Coding")} tahun menempa kode, ${stat("GitHub Repos")} pustaka di GitHub, dan ${stat("Projects Shipped")} karya yang benar benar dirilis.`,
      `Beliau juga fasih dalam ${stat("Languages")} bahasa pemrograman. Bukan untuk berbangga, melainkan karena tiap persoalan menuntut alat yang berbeda.`,
      "Yang membawa Beliau sejauh ini bukan lompatan besar, melainkan langkah yang tidak pernah berhenti.",
    ],
  },
  {
    id: "bard",
    shout: "Lagu terbaikku untuk Beliau!",
    model: "Wizard",
    name: "PUJANGGA GEMA",
    role: "Pencerita",
    face: "🎭",
    color: "#ff4fd8",
    pos: [13, 0, -1],
    home: "bard",
    patrol: [
      [13, -1],
      [10, 4],
      [14, 3],
    ],
    lines: [
      "Duduklah sejenak. Akan kunyanyikan sisi yang jarang ditanyakan orang.",
      "Bila Anda bertanya mengapa Beliau gemar mengoprek: Beliau senang membongkar cara kerja sesuatu, lalu menyusunnya kembali menjadi lebih baik.",
      "Itulah sebabnya salah satu gelar Beliau adalah Reverse Engineer. Rasa penasaran datang lebih dahulu, kode menyusul kemudian.",
      "Dan Beliau tidak membangun pajangan. Beliau membangun hal yang sungguh sungguh dipakai orang.",
    ],
  },
  {
    id: "questgiver",
    shout: "Papan misi tutup, Beliau berpesta!",
    model: "Paladin",
    name: "KEPALA SERIKAT",
    role: "Pemberi Misi",
    face: "📜",
    color: "#ff6b3d",
    pos: [0, 0, -14],
    patrol: [
      [5, -11],
      [5, -4],
      [0, 5],
    ],
    home: "guild",
    lines: [
      `Papan misi sedang penuh. Sudah ${projects.length} misi yang Beliau tuntaskan.`,
      ...projects.map((p) => `Gulungan "${p.title}". Catatan Beliau: ${p.description}`),
      "Bila Anda ingin menelaah kitab sumbernya, ambil salah satu gulungan di bawah ini.",
    ],
    links: projects.map((p) => ({ label: p.title, href: p.link })),
  },
  {
    id: "messenger",
    shout: "Surat ucapan membanjir untuk Beliau!",
    model: "Hunter",
    name: "KURIR RIN",
    role: "Kurir",
    face: "📡",
    color: "#5ffbc0",
    pos: [-13, 0, 7],
    home: "courier",
    patrol: [
      [-13, 7],
      [-13, 1],
      [-17, 4],
    ],
    lines: [
      "Akulah yang mengantar setiap surat kepada Beliau. Bila Anda hendak berkirim pesan, inilah jalurnya.",
      ...socials.map((s) => `${s.title}: ${s.value}`),
      "Pintu surat Beliau tidak pernah terkunci. Jangan sungkan.",
    ],
    links: socials.map((s) => ({ label: s.title, href: s.href })),
  },
  {
    id: "keeper",
    shout: "Nama Beliau kutulis paling depan!",
    model: "Shaman",
    name: "PENJAGA BUKU BESAR",
    role: "Titik Simpan",
    face: "✒️",
    color: "#ff3b6b",
    pos: [13, 0, 7],
    home: "keeper",
    lines: [
      "Setiap pengembara yang singgah meninggalkan catatan pada buku besar Beliau.",
      "Anda pun dipersilakan menulis. Sekaligus menjadi titik simpan Anda di tanah ini.",
    ],
    links: [{ label: "Buka Guestbook", href: "/guestbook" }],
  },
  {
    id: "warden",
    shout: "Gerbang terbuka lebar untuk Beliau!",
    model: "Paladin",
    name: "PENJAGA GERBANG",
    role: "Penuntun",
    face: "🛡️",
    color: "#c8c2e0",
    pos: [-5, 0, 12],
    home: "warden",
    patrol: [
      [-5, 12],
      [4, 12],
      [0, 15],
    ],
    lines: [
      "Tahan langkah Anda, pendatang. Akan kujelaskan tata cara di wilayah Beliau.",
      "Berjalanlah dengan analog di sudut kiri bawah, atau tombol WASD bila Anda memegang papan ketik.",
      "Dekati penduduk hingga namanya menyala keemasan, lalu tekan E atau tombol TALK untuk bercakap.",
      "Bila Anda sudah puas berkeliling, masuklah ke portal ungu di selatan. Itu jalan menuju laman resmi Beliau.",
    ],
  },
];

/**
 * Village houses, drawn from Buildings_RTS. `model` is the file under
 * /models/buildings, `h` the height every model is normalized to, and `owner`
 * the sign hung above the door.
 */
export const houses = [
  { id: "sage", model: "House_Level2_BlueTeam", h: 5.5, pos: [-17, 0, -9], rot: 0.6, owner: "RESI ALDRIN" },
  { id: "smith", model: "Blacksmith_BlueTeam", h: 5, pos: [17, 0, -9], rot: -0.6, owner: "EMPU TEMPA" },
  { id: "courier", model: "House_Level1_BlueTeam", h: 4.5, pos: [-19, 0, 6], rot: 1.2, owner: "KURIR RIN" },
  { id: "keeper", model: "Church_BlueTeam", h: 8, pos: [19, 0, 6], rot: -1.2, owner: "PENJAGA BUKU BESAR" },
  { id: "warden", model: "House_Level1_RedTeam", h: 4.5, pos: [-10, 0, 19], rot: 2.7, owner: "PENJAGA GERBANG" },
  { id: "bard", model: "House_Level2_RedTeam", h: 5.5, pos: [10, 0, 19], rot: -2.7, owner: "PUJANGGA GEMA" },
  { id: "guild", model: "GuardsBarracks_BlueTeam", h: 6.5, pos: [0, 0, -23], rot: Math.PI, owner: "BALAI SERIKAT" },
];

/** Extra villagers, added so the plaza feels inhabited rather than staffed. */
npcs.push(
  {
    id: "cook",
    shout: "Jamuan sudah siap untuk Beliau!",
    model: "Shaman",
    name: "JURU MASAK BALI",
    role: "Juru Masak",
    face: "🍲",
    color: "#ffa14f",
    pos: [4, 0, -7],
    patrol: [
      [4, -7],
      [8, -4],
      [3, -3],
    ],
    lines: [
      "Duduklah, panci saya masih panas. Saya memasak untuk seisi desa ini.",
      "Beliau pernah berkata, membangun sesuatu itu seperti memasak: bahan sederhana pun jadi bila urutannya benar.",
      "Karena itu saya percaya pada Beliau. Orang yang sabar pada urutan tidak akan menyajikan yang mentah.",
    ],
  },
  {
    id: "gardener",
    shout: "Bunga terbaik saya untuk Beliau!",
    model: "Hunter",
    name: "TUKANG TAMAN SEKAR",
    role: "Tukang Taman",
    face: "🌱",
    color: "#78d16a",
    pos: [-8, 0, 5],
    patrol: [
      [-8, 5],
      [-4, 8],
      [-11, 8],
    ],
    lines: [
      "Semua semak dan bunga di tanah ini saya yang rawat.",
      "Beliau menanam dengan cara yang sama: ditanam kecil, disabari, lalu dibiarkan tumbuh dipakai orang.",
      "Yang cepat besar biasanya cepat tumbang. Beliau tidak begitu.",
    ],
  },
  {
    id: "minstrel",
    shout: "Genderang ini untuk Beliau!",
    model: "Assassin",
    name: "PENABUH GENDANG",
    role: "Penabuh",
    face: "🥁",
    color: "#c86bff",
    pos: [7, 0, 6],
    lines: [
      "Dengar iramanya? Saya menabuh untuk siapa pun yang lewat.",
      "Pujangga Gema yang menyanyi, saya yang menjaga tempo. Beliau juga bekerja begitu, katanya.",
      "Satu bagian menjaga irama, bagian lain bebas berimprovisasi di atasnya.",
    ],
  },
  {
    id: "herbalist",
    shout: "Ramuan perayaan, gratis untuk Beliau!",
    model: "Wizard",
    name: "PERAMU DAUN",
    role: "Peramu",
    face: "🧪",
    color: "#4fd6b8",
    pos: [-11, 0, -8],
    lines: [
      "Ramuan saya menyembuhkan luka ringan. Untuk yang berat, sebaiknya Anda jangan berkelahi.",
      "Beliau juga peramu, dengan caranya sendiri. Ia mencampur alat yang berbeda sampai persoalannya larut.",
      "Kalau Anda pulang berdarah dari hutan, jangan sungkan mampir.",
    ],
  },
  {
    id: "scribe",
    shout: "Setiap ucapan untuk Beliau saya salin!",
    model: "Paladin",
    name: "PENYALIN TUA",
    role: "Penyalin",
    face: "📖",
    color: "#a9b4d6",
    pos: [11, 0, -9],
    lines: [
      "Saya menyalin apa pun yang layak diingat dari tanah ini.",
      "Tulisan Beliau rapi, jauh lebih rapi dari kebanyakan orang yang tergesa.",
      "Kata Beliau, kode yang tidak bisa dibaca ulang besok sama saja dengan kode yang hilang.",
    ],
  },
  {
    id: "child",
    shout: "Hore! Ada kue besar untuk Beliau!",
    model: "Assassin",
    name: "ANAK DESA",
    role: "Warga Desa",
    face: "🧒",
    color: "#ffd76b",
    pos: [-2, 0, 6],
    patrol: [
      [-2, 6],
      [3, 9],
      [-5, 9],
      [1, 4],
    ],
    lines: [
      "Kamu pendatang, ya? Aku hafal semua jalan di sini!",
      "Kata ayahku, yang punya tanah ini pintar sekali membuat benda bergerak sendiri.",
      "Aku juga mau begitu kalau besar. Tapi sekarang aku mau main dulu.",
    ],
  }
);

/**
 * Pairs of villagers standing face to face, trading remarks about Beliau while
 * you walk past. Ambient only: no nameplate, no quest marker, nothing to press.
 * Lines alternate between `a` and `b`, so keep them in call and response order.
 */
export const gossips = [
  {
    id: "well",
    pos: [-4.5, 0, 2],
    rot: 0.5,
    a: {
      model: "Hunter",
      lines: [
        "Kau lihat pendatang itu? Ia menuju kediaman Beliau.",
        "Katanya seluruh gerbang di tanah ini Beliau yang rancang.",
        "Aku dengar Beliau tidak pernah puas pada rancangan pertamanya.",
      ],
      // spoken only on the birthday; each pair has its own, so no two pairs
      // ever say the same thing at the same moment
      festive: [
        "Lapangan sudah dihias sejak semalam. Kau ikut memasang?",
        "Aku menyiapkan lentera yang di sisi timur. Tanganku sampai gemetar.",
        "Semoga Beliau panjang umur. Tanah ini butuh penjaganya.",
      ],
    },
    b: {
      model: "Shaman",
      lines: [
        "Sudah kuduga. Semua pengembara akhirnya ke sana.",
        "Bukan hanya gerbang. Mesin mesin kecil itu pun buatan Beliau.",
        "Karena itulah yang kedua selalu lebih baik dari yang pertama.",
      ],
      festive: [
        "Ikut, sampai larut. Untuk hari lahir Beliau, siapa yang menolak?",
        "Pantas menyala paling terang. Kerjamu tidak sia sia.",
        "Amin. Dan semoga karyanya terus dipakai orang.",
      ],
    },
  },
  {
    id: "market",
    pos: [5.5, 0, 1.5],
    rot: -0.8,
    a: {
      model: "Assassin",
      lines: [
        "Ada kabar dari utara. Papan misi Beliau penuh lagi.",
        "Konon Beliau membongkar sesuatu hanya untuk tahu isinya.",
      ],
      festive: [
        "Kue di tengah lapangan itu tingginya melewati kepalaku.",
        "Kudengar Kurir Rin kewalahan. Surat ucapan datang dari segala penjuru.",
      ],
    },
    b: {
      model: "Warrior",
      lines: [
        "Penuh? Baru pekan lalu papan itu kosong.",
        "Dan menyusunnya kembali menjadi lebih baik. Itu kebiasaan Beliau.",
      ],
      festive: [
        "Lilinnya pun aku berhenti menghitung. Biar Beliau sendiri yang meniup.",
        "Tasnya hampir jebol. Aku sempat menolongnya memikul.",
      ],
    },
  },
];

/** Unmanned props: windmills and the lumber mill, no sign, no dialogue. */
export const landmarks = [
  { id: "mill-w", model: "Wildmill_BlueTeam", h: 7.5, pos: [-30, 0, -24], rot: 0.9 },
  { id: "mill-e", model: "Wildmill_BlueTeam", h: 7, pos: [33, 0, -20], rot: -1.4 },
  { id: "mill-s", model: "Wildmill_BlueTeam", h: 6.5, pos: [-8, 0, 34], rot: 2.4 },
  { id: "lumber", model: "LumberMill_BlueTeam", h: 5, pos: [28, 0, 24], rot: -2.2 },
  { id: "lumber-n", model: "LumberMill_BlueTeam", h: 4.6, pos: [-26, 0, 20], rot: 1.7 },
  { id: "barracks-n", model: "GuardsBarracks_BlueTeam", h: 6, pos: [14, 0, -34], rot: 3.0 },
  { id: "house-far", model: "House_Level2_RedTeam", h: 5, pos: [-20, 0, -32], rot: 0.3 },

  // outer ring: something to walk toward now that the map reaches 72 m.
  // Only models already under public/models/buildings, the raw pack is gone.
  { id: "outpost-ne", model: "GuardsBarracks_BlueTeam", h: 7, pos: [52, 0, -46], rot: -0.8 },
  { id: "outpost-nw", model: "House_Level2_BlueTeam", h: 6, pos: [-54, 0, -40], rot: 0.7 },
  { id: "mill-far-e", model: "Wildmill_BlueTeam", h: 8.5, pos: [46, 0, 52], rot: -2.4 },
  { id: "church-far", model: "Church_BlueTeam", h: 10, pos: [-50, 0, 46], rot: 2.1 },
  { id: "mill-far-n", model: "Wildmill_BlueTeam", h: 8, pos: [4, 0, -58], rot: 3.1 },
  { id: "mill-far-w", model: "Wildmill_BlueTeam", h: 7.5, pos: [-62, 0, 4], rot: 1.4 },
  { id: "lumber-far", model: "LumberMill_BlueTeam", h: 5.5, pos: [60, 0, 12], rot: -1.6 },
  { id: "house-far-s", model: "House_Level1_BlueTeam", h: 4.8, pos: [-14, 0, 56], rot: 2.8 },
];

/**
 * Livestock wandering the village. Files live in /models/animals.
 * `r` is how far from `pos` it roams, `s` its walk speed, `hop` swaps the
 * trot for a rabbit bounce.
 */
export const animals = [
  { id: "cow-1", model: "Cow", h: 1.6, pos: [-7, 0, 4], r: 3.5, s: 0.55 },
  { id: "cow-2", model: "Cow", h: 1.5, pos: [-5, 0, 1], r: 3, s: 0.5 },
  { id: "dog", model: "Dog", h: 0.8, pos: [4, 0, 10], r: 6, s: 2.2 },
  { id: "cat", model: "Cat", h: 0.5, pos: [16, 0, 4], r: 4, s: 1.4 },
  { id: "fox", model: "Fox", h: 0.7, pos: [-18, 0, -14], r: 7, s: 2.6 },
  { id: "bunny-1", model: "Bunny", h: 0.4, pos: [8, 0, -8], r: 5, s: 2, hop: true },
  { id: "bunny-2", model: "Bunny", h: 0.4, pos: [9.5, 0, -7], r: 5, s: 2.2, hop: true },
];
