/**
 * Home Page View
 * Pure presentation component - no business logic or data fetching
 * OOP-based class component following SOLID principles
 */

import React, { Component } from "react";
import "../styles/HomePage.css";
import type { Collection } from "../models/domain/collection";
import type { HeroSliderContent } from "../components/hero/HeroSlider";
import HeroCollectionSlider from "./sections/hero-collection-slider";
import OurCollectionSection from "./sections/our-collection-section";
import StoreLocationSection from "./sections/store-location-section";
import GoogleMapsReviewsSection from "./sections/google-maps-reviews-section";

interface HomePageViewProps {
  collections: Collection[];
  heroContent: HeroSliderContent | null;
  loading: boolean;
  errorMessage: string;
}

/**
 * Home Page View Component
 * Pure presentation class component - receives all data via props
 * Follows Single Responsibility Principle: only handles UI rendering
 */
class HomePageView extends Component<HomePageViewProps> {
  /**
   * Render method - Single Responsibility: render UI only
   */
  render(): React.ReactNode {
    const { collections, heroContent, loading, errorMessage } = this.props;

    return (
      <main className="Home-page-container">
        {/* Hero slider section */}
        <HeroCollectionSlider content={heroContent ?? undefined} loading={loading} />

        {/* Collections section */}
        <OurCollectionSection
          items={collections}
          loading={loading}
          errorMessage={errorMessage}
        />

        {/* Store location section */}
        <StoreLocationSection />

        {/* Google Maps reviews section */}
        <GoogleMapsReviewsSection placeName="GiftForYou.idn" />
      </main>
    );
  }
}

export default HomePageView;
