/**
 * Why Choose Us Model
 * Data structure for WhyChooseUs section
 * Following OOP and SOLID principles
 */

export interface Benefit {
  id: string;
  iconType: "premium" | "fast-delivery" | "friendly-service" | "satisfaction-guarantee";
  title: string;
  description: string;
}

export interface WhyChooseUsContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  benefits: Benefit[];
}

/**
 * Default WhyChooseUs content
 * Can be extended to fetch from API in the future
 */
export const DEFAULT_WHY_CHOOSE_US_CONTENT: WhyChooseUsContent = {
  eyebrow: "Mengapa Pilih Kami",
  title: "Keunggulan Giftforyou.idn",
  subtitle: "Kami tidak hanya menjual produk, tetapi juga memberikan pengalaman berbelanja yang istimewa. Setiap detail diperhatikan untuk memastikan kepuasan Anda.",
  benefits: [
    {
      id: "premium-quality",
      iconType: "premium",
      title: "Produk Premium",
      description: "Kualitas terbaik dengan bahan pilihan untuk setiap produk yang kami tawarkan",
    },
    {
      id: "fast-delivery",
      iconType: "fast-delivery",
      title: "Pengiriman Cepat",
      description: "Layanan pengiriman cepat dan tepat waktu ke seluruh wilayah Cirebon dan sekitarnya",
    },
    {
      id: "friendly-service",
      iconType: "friendly-service",
      title: "Pelayanan Ramah",
      description: "Tim customer service profesional siap membantu dengan pelayanan yang ramah dan responsif",
    },
    {
      id: "satisfaction-guarantee",
      iconType: "satisfaction-guarantee",
      title: "Garansi Kepuasan",
      description: "Kepuasan pelanggan adalah prioritas utama kami dengan jaminan kualitas produk",
    },
  ],
};

