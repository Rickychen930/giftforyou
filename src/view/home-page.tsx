// src/components/HomePage.tsx

import React, { useEffect, useState } from "react";
import "../styles/HomePage.css";

import type { Collection } from "../models/domain/collection";
import { getCollections } from "../services/collection.service";
import OurCollectionSection from "../components/sections/our-collection-section";
import HeroCollectionSlider from "../components/sections/hero-collection-slider";
import StoreLocationSection from "../components/sections/store-location-section";

type LoadState = "idle" | "loading" | "success" | "error";

const HomePage: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [state, setState] = useState<LoadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setState("loading");
        setErrorMessage("");

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
      {/* Big hero advertising slider */}
      <HeroCollectionSlider />

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
