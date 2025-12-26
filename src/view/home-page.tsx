// src/components/HomePage.tsx
import React, { useEffect, useState } from "react";
import "../styles/HomePage.css";

import type { Collection } from "../models/domain/collection";
import { getCollections } from "../services/collection.service";
import HeroCollectionSlider from "../components/sections/hero-collection-slider";
import OurCollectionSection from "../components/sections/our-collection-section";
import StoreLocationSection from "../components/sections/store-location-section";

import { API_BASE } from "../config/api";
import { STORE_PROFILE } from "../config/store-profile";
import { setSeo } from "../utils/seo";

type LoadState = "idle" | "loading" | "success" | "error";

type HeroSlide = {
  id: string;
  badge?: string;
  title: string;
  subtitle?: string;
  image: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

type HeroSliderContent = {
  heading?: string;
  slides: HeroSlide[];
}; // adjust path depending on folder depth

const HomePage: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [state, setState] = useState<LoadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // ✅ Hero slider content from API (optional)
  const [heroContent, setHeroContent] = useState<HeroSliderContent | null>(
    null
  );

  useEffect(() => {
    const controller = new AbortController();

    setSeo({
      title: `Florist Cirebon | Bouquet, Gift Box & Stand Acrylic Terbaik di Jawa Barat`,
      description:
        "Florist terpercaya di Cirebon, Jawa Barat. Menyediakan bouquet bunga segar, gift box, stand acrylic, artificial bouquet, dan berbagai produk gift lainnya. Pesan mudah via WhatsApp. Pengiriman cepat ke seluruh Cirebon dan sekitarnya.",
      keywords:
        "florist cirebon, bouquet cirebon, gift box cirebon, stand acrylic cirebon, florist jawa barat, toko bunga cirebon, artificial bouquet cirebon, hadiah cirebon, kado cirebon, florist mundu, florist pamengkang, gift shop cirebon, bunga cirebon, karangan bunga cirebon",
      path: "/",
    });

    const load = async () => {
      try {
        setState("loading");
        setErrorMessage("");

        // 1) fetch hero content (do not block page if it fails)
        fetch(`${API_BASE}/api/hero-slider/home`, { signal: controller.signal })
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            const hasSlides =
              data &&
              typeof data === "object" &&
              Array.isArray((data as any).slides) &&
              (data as any).slides.length > 0;
            setHeroContent(hasSlides ? (data as HeroSliderContent) : null);
          })
          .catch((err: unknown) => {
            if (err instanceof DOMException && err.name === "AbortError") return;
            setHeroContent(null);
          });

        // 2) fetch collections
        const data = await getCollections(controller.signal);
        setCollections(data);
        setState("success");
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState("error");
        setErrorMessage(err instanceof Error ? err.message : "Unknown error");
      }
    };

    load();
    return () => controller.abort();
  }, []);

  return (
    <main className="Home-page-container">
      {/* ✅ Big hero slider (DB content if exists, otherwise component uses defaultContent) */}
      <HeroCollectionSlider content={heroContent ?? undefined} />

      <OurCollectionSection
        items={collections}
        loading={state === "loading"}
        errorMessage={state === "error" ? errorMessage : ""}
      />

      <StoreLocationSection />
    </main>
  );
};

export default HomePage;
