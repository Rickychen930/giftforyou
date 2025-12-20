// src/controllers/home-sections.controllers.tsx
import React, { Component } from "react";

import HeroCollectionSlider from "../components/sections/hero-collection-slider";
import AboutUsSection from "../components/sections/about-us-section";
import StoreLocationSection from "../components/sections/store-location-section";
import OurCollectionSection from "../components/sections/our-collection-section";

import { storeData } from "../models/store-model";
import { aboutUsContent } from "../models/about-us-model";

import type { Collection } from "../models/domain/collection";
import { getCollections } from "../services/collection.service";

/** ✅ Hero Controller (uses default slides OR pass content from parent if needed) */
export class HeroController extends Component {
  render(): React.ReactNode {
    return <HeroCollectionSlider />;
  }
}

/** ✅ About Us Controller */
export class AboutUsController extends Component {
  render(): React.ReactNode {
    return <AboutUsSection content={aboutUsContent} />;
  }
}

/** ✅ Store Location Controller */
export class StoreLocationController extends Component {
  render(): React.ReactNode {
    return <StoreLocationSection data={storeData} />;
  }
}

/** ✅ Our Collection Controller (fetches data) */
interface OurCollectionControllerState {
  collections: Collection[];
  loading: boolean;
  errorMessage: string;
}

export class OurCollectionController extends Component<
  {},
  OurCollectionControllerState
> {
  private abortController = new AbortController();

  state: OurCollectionControllerState = {
    collections: [],
    loading: true,
    errorMessage: "",
  };

  async componentDidMount(): Promise<void> {
    try {
      const data = await getCollections(this.abortController.signal);
      this.setState({ collections: data, loading: false, errorMessage: "" });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      const message = err instanceof Error ? err.message : "Unknown error";
      this.setState({ loading: false, errorMessage: message });
    }
  }

  componentWillUnmount(): void {
    this.abortController.abort();
  }

  render(): React.ReactNode {
    const { collections, loading, errorMessage } = this.state;

    if (loading) {
      return (
        <section className="home-state" aria-live="polite">
          Loading collections...
        </section>
      );
    }

    if (errorMessage) {
      return (
        <section className="home-state home-state--error" role="alert">
          <p>Failed to load collections.</p>
          <small>{errorMessage}</small>
        </section>
      );
    }

    return <OurCollectionSection items={collections} />;
  }
}
