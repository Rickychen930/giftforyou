// src/components/HomePage.tsx
import React, { useEffect, useState, useCallback } from "react";
import "../styles/HomePage.css";

import type { Collection } from "../models/domain/collection";
import { getCollections } from "../services/collection.service";
import { heroSliderService } from "../services/hero-slider.service";
import HeroCollectionSlider from "../components/sections/hero-collection-slider";
import OurCollectionSection from "../components/sections/our-collection-section";
import StoreLocationSection from "../components/sections/store-location-section";
import GoogleMapsReviewsSection from "../components/sections/google-maps-reviews-section";

import type { HeroSliderContent } from "../components/sections/hero-collection-slider";
import { setSeo } from "../utils/seo";
import { observeFadeIn, revealOnScroll, lazyLoadImages } from "../utils/luxury-enhancements";

type LoadState = "idle" | "loading" | "success" | "error";

const HomePage: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [state, setState] = useState<LoadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Hero slider content from API (optional)
  const [heroContent, setHeroContent] = useState<HeroSliderContent | null>(
    null
  );
  const [heroLoading, setHeroLoading] = useState<boolean>(true);

  // Memoized load function for retry functionality
  const loadCollections = useCallback(async (signal: AbortSignal) => {
    try {
      setState("loading");
      setErrorMessage("");
      const data = await getCollections(signal);
      setCollections(data);
      setState("success");
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Unknown error");
    }
  }, []);

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
      // 1) Fetch hero content (non-blocking, uses service layer)
      setHeroLoading(true);
      heroSliderService
        .fetchHeroSlider(controller.signal)
        .then((data) => {
          setHeroContent(data);
        })
        .catch(() => {
          // Service handles errors gracefully, just set to null
          setHeroContent(null);
        })
        .finally(() => {
          setHeroLoading(false);
        });

      // 2) Fetch collections
      await loadCollections(controller.signal);
    };

    load();
    return () => controller.abort();
  }, [loadCollections]);

  // Retry function for error state
  const handleRetry = useCallback(() => {
    const controller = new AbortController();
    loadCollections(controller.signal);
    return () => controller.abort();
  }, [loadCollections]);

  useEffect(() => {
    // Initialize luxury enhancements
    const fadeObserver = observeFadeIn(".fade-in");
    const revealObserver = revealOnScroll();
    const imageObserver = lazyLoadImages();

    return () => {
      fadeObserver?.disconnect();
      revealObserver?.disconnect();
      imageObserver?.disconnect();
    };
  }, [collections, state]);

  return (
    <main className="Home-page-container">
      {/* Hero slider with loading state (DB content if exists, otherwise component uses defaultContent) */}
      <HeroCollectionSlider
        content={heroContent ?? undefined}
        loading={heroLoading}
      />

      {/* Main content anchor for skip link */}
      <div id="main-content" tabIndex={-1} style={{ position: "absolute", top: "-100px" }} aria-hidden="true" />
      
      <OurCollectionSection
        items={collections}
        loading={state === "loading"}
        errorMessage={state === "error" ? errorMessage : ""}
        onRetry={handleRetry}
      />

      <StoreLocationSection />

      <GoogleMapsReviewsSection placeName="GiftForYou.idn" />
    </main>
  );
};

export default HomePage;
