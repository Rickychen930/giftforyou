// Mock data for development when MongoDB is not connected

export const mockCollections = [
  {
    _id: "mock-collection-1",
    name: "Best Sellers",
    description: "Our most popular bouquets loved by customers",
    bouquets: [
      {
        _id: "mock-bouquet-1",
        name: "Rose Elegance",
        description: "Beautiful red roses arranged with care",
        price: 45.99,
        imageUrl: "/images/item-1.jpg",
        category: "Roses",
        inStock: true,
        featured: true,
      },
      {
        _id: "mock-bouquet-2",
        name: "Spring Garden",
        description: "Colorful mix of seasonal flowers",
        price: 39.99,
        imageUrl: "/images/item-2.jpg",
        category: "Mixed",
        inStock: true,
        featured: true,
      },
    ],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    _id: "mock-collection-2",
    name: "Wedding Collection",
    description: "Perfect arrangements for your special day",
    bouquets: [
      {
        _id: "mock-bouquet-3",
        name: "Bridal Bouquet",
        description: "Elegant white roses and lilies",
        price: 89.99,
        imageUrl: "/images/item-3.jpg",
        category: "Wedding",
        inStock: true,
        featured: false,
      },
    ],
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02"),
  },
  {
    _id: "mock-collection-3",
    name: "Sympathy Flowers",
    description: "Thoughtful arrangements to express condolences",
    bouquets: [
      {
        _id: "mock-bouquet-4",
        name: "Peace Lily",
        description: "Serene white lilies",
        price: 54.99,
        imageUrl: "/images/item-4.jpg",
        category: "Sympathy",
        inStock: true,
        featured: false,
      },
    ],
    createdAt: new Date("2024-01-03"),
    updatedAt: new Date("2024-01-03"),
  },
];

export const mockHeroSlider = {
  _id: "mock-hero-slider-1",
  page: "home",
  slides: [
    {
      title: "Premium Orchid Collection",
      subtitle: "Exotic orchids for the discerning flower lover",
      image: "/images/welcome-image.jpeg",
      primaryCta: {
        label: "Shop Collection",
        href: "/collection",
      },
      secondaryCta: null,
    },
    {
      title: "Seasonal Favorites",
      subtitle: "Fresh picks curated weekly by our florist",
      image: "/images/about-us-background.jpg",
      primaryCta: {
        label: "Explore Bouquets",
        href: "/collection",
      },
      secondaryCta: null,
    },
    {
      title: "Perfect Gifts",
      subtitle: "Make it special with add-ons: cards, chocolates, and more",
      image: "/images/our-collection-background.jpg",
      primaryCta: {
        label: "Browse Collection",
        href: "/collection",
      },
      secondaryCta: null,
    },
  ],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};
