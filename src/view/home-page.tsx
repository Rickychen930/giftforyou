/**
 * Home Page View
 * Pure presentation component - no business logic or data fetching
 * OOP-based class component following SOLID principles
 * Enhanced with Container & Section components for consistent layout
 * Luxury, elegant, responsive, and reusable
 */

import React, { Component } from "react";
import "../styles/HomePage.css";
import type { Collection } from "../models/domain/collection";
import type { HeroSliderContent } from "../components/hero/HeroSlider";
import HeroCollectionSlider from "./sections/HeroCollectionSlider";
import OurCollectionSection from "./sections/OurCollectionSection";
import StoreLocationSection from "./sections/StoreLocationSection";
import GoogleMapsReviewsSection from "./sections/GoogleMapsReviewsSection";
import Section from "../components/layout/Section";

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
 * Uses Container & Section components for consistent, luxury layout
 */
class HomePageView extends Component<HomePageViewProps> {
  /**
   * Render method - Single Responsibility: render UI only
   */
  render(): React.ReactNode {
    const { collections, heroContent, loading, errorMessage } = this.props;

    return (
      <main 
        className="Home-page-container"
        role="main"
        aria-label="Homepage content"
        data-page="home"
      >
        {/* Hero slider section - Full width, no container */}
        <Section 
          variant="default" 
          padding="none" 
          className="Home-page__hero"
          id="hero-section"
        >
          <HeroCollectionSlider 
            content={heroContent ?? undefined} 
            loading={loading} 
          />
        </Section>

        {/* Collections section - Gradient background */}
        <Section 
          variant="gradient" 
          padding="lg" 
          className="Home-page__collections"
          id="collections-section"
        >
          <OurCollectionSection
            items={collections}
            loading={loading}
            errorMessage={errorMessage}
          />
        </Section>

        {/* Store location section - Default background */}
        <Section 
          variant="default" 
          padding="lg" 
          className="Home-page__location"
          id="location-section"
        >
          <StoreLocationSection />
        </Section>

        {/* Google Maps reviews section - Glass morphism */}
        <Section 
          variant="glass" 
          padding="lg" 
          className="Home-page__reviews"
          id="reviews-section"
        >
          <GoogleMapsReviewsSection placeName="GiftForYou.idn" />
        </Section>
      </main>
    );
  }
}

export default HomePageView;
