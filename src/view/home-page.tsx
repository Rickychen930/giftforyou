/**
 * Home Page View
 * Pure presentation component - no business logic or data fetching
 * OOP-based class component following SOLID principles
 * Enhanced with Container & Section components for consistent layout
 * Luxury, elegant, responsive, and reusable
 */

import React, { Component, lazy } from "react";
import "../styles/HomePage.css";
import type { Collection } from "../models/domain/collection";
import type { HeroSliderContent } from "../components/hero/HeroSlider";
import HeroCollectionSlider from "./sections/HeroCollectionSlider";
import OurCollectionSection from "./sections/OurCollectionSection";
import Section from "../components/layout/Section";
import SectionWrapper from "../components/layout/SectionWrapper";
import NetworkStatus from "../components/common/NetworkStatus";
import FloatingWhatsAppButton from "../components/common/FloatingWhatsAppButton";
import QuickNavigation from "../components/common/QuickNavigation";

// Lazy load below-the-fold sections for better initial performance
const WhyChooseUsSection = lazy(() => import("./sections/WhyChooseUsSection"));
const StoreLocationSection = lazy(() => import("./sections/StoreLocationSection"));
const GoogleMapsReviewsSection = lazy(() => import("./sections/GoogleMapsReviewsSection"));

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
 * Optimized with shouldComponentUpdate to prevent unnecessary re-renders
 */
class HomePageView extends Component<HomePageViewProps> {
  /**
   * Prevent unnecessary re-renders when props haven't changed
   * Optimizes performance by avoiding re-renders when data is the same
   */
  shouldComponentUpdate(nextProps: HomePageViewProps): boolean {
    const { collections, heroContent, loading, errorMessage } = this.props;
    
    // Only re-render if props actually changed
    return (
      nextProps.loading !== loading ||
      nextProps.errorMessage !== errorMessage ||
      nextProps.collections.length !== collections.length ||
      nextProps.collections !== collections ||
      nextProps.heroContent !== heroContent ||
      (nextProps.heroContent?.slides?.length ?? 0) !== (heroContent?.slides?.length ?? 0)
    );
  }

  /**
   * Render method - Single Responsibility: render UI only
   */
  render(): React.ReactNode {
    const { collections, heroContent, loading, errorMessage } = this.props;

    return (
      <main 
        className="Home-page-container"
        role="main"
        aria-label="Halaman utama - Koleksi bouquet dan informasi toko"
        data-page="home"
      >
        {/* Network Status Indicator */}
        <NetworkStatus />
        
        {/* Floating WhatsApp Button - Always accessible */}
        <FloatingWhatsAppButton />
        
        {/* Quick Navigation - Sticky section navigation */}
        <QuickNavigation
          items={[
            { id: "collections-section", label: "Koleksi" },
            { id: "why-choose-us-section", label: "Keunggulan" },
            { id: "location-section", label: "Lokasi" },
            { id: "reviews-section", label: "Ulasan" },
          ]}
          threshold={400}
        />
        
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

        {/* Collections section - Main content with gradient background */}
        <SectionWrapper
          variant="gradient"
          padding="lg"
          id="collections-section"
          titleId="collections-section-title"
          className="Home-page__collections"
          lazy={false}
          errorMessage="Gagal memuat koleksi. Silakan coba lagi."
          showRetry={true}
        >
          <OurCollectionSection
            items={collections}
            loading={loading}
            errorMessage={errorMessage}
          />
        </SectionWrapper>

        {/* Why Choose Us section - Trust indicators */}
        <SectionWrapper
          variant="default"
          padding="lg"
          id="why-choose-us-section"
          titleId="why-choose-us-title"
          className="Home-page__whyChooseUs"
          lazy={true}
          errorMessage="Gagal memuat informasi."
          showRetry={false}
        >
          <WhyChooseUsSection />
        </SectionWrapper>

        {/* Store location section - Contact information */}
        <SectionWrapper
          variant="default"
          padding="lg"
          id="location-section"
          titleId="location-section-title"
          className="Home-page__location"
          lazy={true}
          errorMessage="Gagal memuat informasi lokasi toko. Silakan coba lagi."
          showRetry={true}
        >
          <StoreLocationSection />
        </SectionWrapper>

        {/* Google Maps reviews section - Social proof */}
        <SectionWrapper
          variant="glass"
          padding="lg"
          id="reviews-section"
          titleId="reviews-section-title"
          className="Home-page__reviews"
          lazy={true}
          errorMessage="Gagal memuat ulasan. Silakan coba lagi."
          showRetry={true}
        >
          <GoogleMapsReviewsSection placeName="GiftForYou.idn" />
        </SectionWrapper>
      </main>
    );
  }
}

export default HomePageView;
