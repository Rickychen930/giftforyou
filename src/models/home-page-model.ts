// src/models/WelcomeModel.ts

export interface WelcomeContent {
  title: string;
  intro: string;
}

export const welcomeContent: WelcomeContent = {
  title: "Welcome to Giftforyou.idn",
  intro: `Step into a world where orchids bloom with timeless grace. Explore our curated collection of pure orchid bouquets, artfully infused arrangements, and sophisticated orchid plants — each designed to bring tranquility, beauty, and charm into your life. Let every petal tell a story of elegance.`,
};

// src/models/about-us-model.ts

export interface AboutUsContent {
  title: string;
  description: string;
  buttonLabel: string;
  closing: string;
}

export const aboutUsContent: AboutUsContent = {
  title: "About Giftforyou.idn",
  description: `At Giftforyou.idn, we celebrate the timeless elegance of orchids and the joy they bring. 
Our journey began with a deep passion for floral artistry and a vision to share serenity through nature’s most graceful bloom. 
Each bouquet is thoughtfully designed, blending tradition with modern creativity to craft unforgettable moments of beauty and love.`,
  buttonLabel: "Discover More",
  closing: `Together, let’s grow a community that cherishes beauty, kindness, and connection. 
We believe every gift carries a story, and we’re honored to be part of yours. 🌸`,
};

// src/models/store-model.ts

export interface StoreData {
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  mapEmbedUrl: string;
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
}

export const storeData: StoreData = {
  name: "giftforyou.idn",
  address: "Perum Mustika Blok C No 9",
  city: "Cirebon, West Java, Indonesia",
  phone: "+62 851 6142 8911",
  email: "giftforyou.idn01@gmail.com",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.100714098869!2d108.55960827524292!3d-6.7575718932390165!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6f1d0c68b89013%3A0x6349563c1a437106!2sGiftforyou.idn%20Florist%20%26%20Gift%20shop!5e0!3m2!1sen!2sau!4v1762314519420!5m2!1sen!2sau",
  hours: {
    weekdays: "Mon–Fri: 9am – 6pm",
    saturday: "Sat: 10am – 4pm",
    sunday: "Sun: Closed",
  },
};
