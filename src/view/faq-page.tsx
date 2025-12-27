import React, { useState, useEffect } from "react";
import { setSeo } from "../utils/seo";
import { setFaqSeo } from "../utils/seo";
import "../styles/FAQPage.css";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_CATEGORIES = [
  "Semua",
  "Pemesanan",
  "Pengiriman",
  "Pembayaran",
  "Produk",
  "Lainnya",
];

const FAQ_DATA: FAQItem[] = [
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

const FAQPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    setSeo({
      title: "FAQ - Pertanyaan yang Sering Diajukan | Giftforyou.idn",
      description:
        "Temukan jawaban untuk pertanyaan yang sering diajukan tentang pemesanan, pengiriman, pembayaran, dan produk bouquet kami. Hubungi kami jika pertanyaan Anda belum terjawab.",
      keywords:
        "FAQ giftforyou, pertanyaan bouquet, cara pesan bouquet, pengiriman bouquet cirebon, pembayaran bouquet",
      path: "/faq",
    });

    // Set FAQ structured data for SEO
    setFaqSeo(
      FAQ_DATA.map((item) => ({
        question: item.question,
        answer: item.answer,
      }))
    );
  }, []);

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const filteredFAQs = FAQ_DATA.filter((faq) => {
    const matchesCategory =
      selectedCategory === "Semua" || faq.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="faq-page">
      <div className="faq-container">
        <header className="faq-header reveal-on-scroll">
          <h1 className="faq-title gradient-text">Pertanyaan yang Sering Diajukan</h1>
          <p className="faq-subtitle">
            Temukan jawaban untuk pertanyaan Anda tentang produk dan layanan kami
          </p>
        </header>

        <div className="faq-controls reveal-on-scroll">
          <div className="faq-search">
            <input
              type="text"
              placeholder="Cari pertanyaan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="faq-search-input"
            />
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="faq-search-icon"
            >
              <path
                d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="faq-categories">
            {FAQ_CATEGORIES.map((category) => (
              <button
                key={category}
                className={`faq-category-btn ${
                  selectedCategory === category ? "is-active" : ""
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="faq-list">
          {filteredFAQs.length === 0 ? (
            <div className="faq-empty">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p>Tidak ada pertanyaan yang ditemukan</p>
              <p className="faq-empty-subtitle">
                Coba gunakan kata kunci lain atau pilih kategori berbeda
              </p>
            </div>
          ) : (
            filteredFAQs.map((faq, index) => {
              const originalIndex = FAQ_DATA.indexOf(faq);
              const isOpen = openItems.has(originalIndex);

              return (
                <div
                  key={originalIndex}
                  className={`faq-item fade-in ${isOpen ? "is-open" : ""}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <button
                    className="faq-question"
                    onClick={() => toggleItem(originalIndex)}
                    aria-expanded={isOpen}
                  >
                    <span className="faq-question-text">{faq.question}</span>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`faq-chevron ${isOpen ? "is-open" : ""}`}
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <div className={`faq-answer ${isOpen ? "is-open" : ""}`}>
                    <div className="faq-answer-content">
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="faq-contact reveal-on-scroll">
          <div className="faq-contact-card">
            <h3 className="faq-contact-title">Masih Ada Pertanyaan?</h3>
            <p className="faq-contact-text">
              Jika pertanyaan Anda belum terjawab, jangan ragu untuk menghubungi kami.
              Tim kami siap membantu Anda.
            </p>
            <div className="faq-contact-buttons">
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="faq-contact-btn faq-contact-btn--primary"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Chat via WhatsApp
              </a>
              <a
                href="/contact"
                className="faq-contact-btn faq-contact-btn--secondary"
              >
                Halaman Kontak
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default FAQPage;

