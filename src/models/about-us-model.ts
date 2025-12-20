// src/models/about-us-model.ts
export interface AboutUsContent {
  title: string;
  description: string;
  buttonLabel: string;
  closing?: string;
}

export const aboutUsContent: AboutUsContent = {
  title: "About Giftforyou.idn",
  description:
    "At Giftforyou.idn, we celebrate the timeless elegance of orchids and the joy they bring. Each bouquet is thoughtfully designed to craft unforgettable moments of beauty and love.",
  buttonLabel: "Discover More",
  closing:
    "Together, let’s grow a community that cherishes beauty, kindness, and connection. 🌸",
};
