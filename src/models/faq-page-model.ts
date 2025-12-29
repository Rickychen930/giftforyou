/**
 * FAQ Page Model
 * Defines data structures and types for the FAQ page
 */

/**
 * FAQ Item
 */
export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

/**
 * FAQ Categories
 */
export const FAQ_CATEGORIES = [
  "Semua",
  "Pemesanan",
  "Pengiriman",
  "Pembayaran",
  "Produk",
  "Lainnya",
] as const;

export type FAQCategory = typeof FAQ_CATEGORIES[number];

/**
 * FAQ Data
 */
export const FAQ_DATA: FAQItem[] = [
  {
    category: "Pemesanan",
    question: "Bagaimana cara memesan bouquet?",
    answer: "Anda dapat memesan bouquet dengan mudah melalui WhatsApp. Klik tombol 'Pesan via WhatsApp' pada produk yang Anda inginkan, atau hubungi kami langsung di nomor yang tertera. Kami akan membantu Anda memilih bouquet yang sesuai dengan kebutuhan dan budget Anda.",
  },
  {
    category: "Pemesanan",
    question: "Apakah bisa memesan bouquet custom?",
    answer: "Ya, tentu saja! Kami menerima pesanan custom sesuai dengan keinginan Anda. Silakan hubungi kami melalui WhatsApp untuk diskusi lebih lanjut mengenai desain, warna, ukuran, dan budget yang Anda inginkan.",
  },
  {
    category: "Pemesanan",
    question: "Berapa lama waktu pemesanan?",
    answer: "Untuk bouquet ready stock, pemesanan bisa dilakukan H-1 (sehari sebelum pengiriman). Untuk bouquet custom, kami membutuhkan waktu minimal 2-3 hari untuk persiapan. Untuk acara besar atau pesanan dalam jumlah banyak, silakan hubungi kami terlebih dahulu.",
  },
  {
    category: "Pengiriman",
    question: "Apakah tersedia layanan pengiriman?",
    answer: "Ya, kami menyediakan layanan pengiriman ke seluruh area Cirebon dan sekitarnya. Kami juga menyediakan layanan pickup di toko jika Anda ingin mengambil sendiri. Ongkos kirim bervariasi tergantung jarak dan ukuran bouquet.",
  },
  {
    category: "Pengiriman",
    question: "Berapa lama waktu pengiriman?",
    answer: "Waktu pengiriman biasanya 1-3 jam setelah bouquet selesai dibuat, tergantung lokasi tujuan. Untuk pesanan urgent, silakan hubungi kami untuk konfirmasi ketersediaan dan waktu pengiriman.",
  },
  {
    category: "Pengiriman",
    question: "Apakah bisa memilih waktu pengiriman?",
    answer: "Ya, Anda dapat memilih waktu pengiriman yang diinginkan. Silakan sebutkan waktu yang diinginkan saat melakukan pemesanan, dan kami akan berusaha mengakomodasi sesuai dengan jadwal kami.",
  },
  {
    category: "Pembayaran",
    question: "Metode pembayaran apa saja yang tersedia?",
    answer: "Kami menerima pembayaran melalui transfer bank, e-wallet (OVO, GoPay, DANA, LinkAja), dan cash on delivery (COD) untuk area tertentu. Pembayaran dapat dilakukan setelah konfirmasi pesanan atau saat pengiriman untuk COD.",
  },
  {
    category: "Pembayaran",
    question: "Kapan harus melakukan pembayaran?",
    answer: "Untuk pesanan regular, pembayaran dilakukan setelah konfirmasi pesanan atau saat pengiriman (untuk COD). Untuk pesanan custom atau acara besar, biasanya diperlukan DP (down payment) 50% dan pelunasan saat pengiriman.",
  },
  {
    category: "Produk",
    question: "Apakah bunga yang digunakan segar?",
    answer: "Ya, kami hanya menggunakan bunga segar berkualitas tinggi untuk semua bouquet kami. Bunga dipilih dengan teliti dan disusun dengan rapi untuk memastikan kualitas dan keindahan bouquet.",
  },
  {
    category: "Produk",
    question: "Berapa lama bouquet bisa bertahan?",
    answer: "Bouquet bunga segar biasanya dapat bertahan 3-7 hari tergantung jenis bunga dan perawatan. Kami menyertakan tips perawatan dengan setiap pesanan. Untuk memperpanjang umur bouquet, letakkan di tempat yang sejuk, ganti air setiap hari, dan potong sedikit batangnya.",
  },
  {
    category: "Produk",
    question: "Apakah tersedia artificial bouquet?",
    answer: "Ya, kami juga menyediakan artificial bouquet (bunga buatan) yang terlihat sangat natural dan dapat bertahan lebih lama. Artificial bouquet cocok untuk dekorasi permanen atau hadiah yang ingin disimpan dalam waktu lama.",
  },
  {
    category: "Lainnya",
    question: "Apakah menyediakan layanan untuk acara besar?",
    answer: "Ya, kami melayani berbagai acara seperti pernikahan, ulang tahun, grand opening, dan acara perusahaan. Silakan hubungi kami untuk konsultasi dan penawaran khusus untuk acara Anda.",
  },
  {
    category: "Lainnya",
    question: "Apakah bisa membatalkan pesanan?",
    answer: "Pembatalan pesanan dapat dilakukan sebelum proses pembuatan dimulai. Untuk pesanan yang sudah dalam proses, silakan hubungi kami untuk diskusi lebih lanjut. Kami akan berusaha mengakomodasi sesuai dengan kebijakan kami.",
  },
  {
    category: "Lainnya",
    question: "Bagaimana jika bouquet rusak saat pengiriman?",
    answer: "Jika bouquet rusak saat pengiriman karena kesalahan kami, kami akan menggantinya dengan yang baru tanpa biaya tambahan. Silakan hubungi kami segera dengan foto sebagai bukti, dan kami akan segera menindaklanjuti.",
  },
];

/**
 * FAQ Page State
 */
export interface FAQPageState {
  selectedCategory: FAQCategory;
  searchQuery: string;
  openItems: Set<number>;
}

/**
 * Initial FAQ Page State
 */
export const INITIAL_FAQ_PAGE_STATE: FAQPageState = {
  selectedCategory: "Semua",
  searchQuery: "",
  openItems: new Set(),
};

/**
 * FAQ Page SEO Data
 */
export interface FAQPageSeoData {
  title: string;
  description: string;
  keywords: string;
  path: string;
}

/**
 * Default SEO data for FAQ page
 */
export const DEFAULT_FAQ_PAGE_SEO: FAQPageSeoData = {
  title: "FAQ - Pertanyaan yang Sering Diajukan | Giftforyou.idn",
  description:
    "Temukan jawaban untuk pertanyaan yang sering diajukan tentang pemesanan, pengiriman, pembayaran, dan produk bouquet kami. Hubungi kami jika pertanyaan Anda belum terjawab.",
  keywords:
    "FAQ giftforyou, pertanyaan bouquet, cara pesan bouquet, pengiriman bouquet cirebon, pembayaran bouquet",
  path: "/faq",
};

