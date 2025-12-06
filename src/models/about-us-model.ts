// src/models/about-us-model.ts

export interface AboutUsContent {
  intro: string;
  story: string;
  values: { title: string; items: string[] };
  closing: string;
}

export const aboutUsContent: AboutUsContent = {
  intro: `At Giftforyou.idn, we celebrate the timeless elegance of orchids and the joy they bring.`,
  story: `Our journey began with a deep passion for floral artistry and a vision to share serenity through nature’s most graceful bloom. Each bouquet is thoughtfully designed, blending tradition with modern creativity to craft unforgettable moments of beauty and love.`,
  values: {
    title: " Our Values",
    items: [
      " <strong>Elegance:</strong> Every arrangement reflects timeless beauty.",
      " <strong>Care:</strong> Crafted with love and attention to detail.",
      " <strong>Innovation:</strong> Blending tradition with modern design.",
      " <strong>Connection:</strong> Flowers that bring people closer together.",
    ],
  },
  closing: `Together, let’s grow a community that cherishes beauty, kindness, and connection. We believe every gift carries a story, and we’re honored to be part of yours. 🌸`,
};
