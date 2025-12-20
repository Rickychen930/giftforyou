// src/components/HomePage.tsx
import React, { useEffect, useState } from "react";
import "../styles/HomePage.css";

import type { Collection } from "../models/domain/collection";
import { getCollections } from "../services/collection.service";
import HeroCollectionSlider from "../components/sections/hero-collection-slider";
import OurCollectionSection from "../components/sections/our-collection-section";
import StoreLocationSection from "../components/sections/store-location-section";

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
};

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

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

    const load = async () => {
      try {
        setState("loading");
        setErrorMessage("");

        // 1) fetch hero content (do not block page if it fails)
        fetch(`${API_BASE}/api/hero-slider/home`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => setHeroContent(data))
          .catch(() => setHeroContent(null));

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

      {/* Collections section */}
      {state === "loading" && (
        <section className="home-state" aria-live="polite">
          Loading collections...
        </section>
      )}

      {state === "error" && (
        <section className="home-state home-state--error" role="alert">
          <p>Failed to load collections.</p>
          <small>{errorMessage}</small>
        </section>
      )}

      {state === "success" && <OurCollectionSection items={collections} />}

      <StoreLocationSection />
    </main>
  );
};

export default HomePage;
