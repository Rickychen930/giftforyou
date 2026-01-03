/**
 * Our Collection Section Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component, RefObject } from "react";
import "../../styles/OurCollectionSection.css";
import type { BouquetCardProps } from "../../components/cards/CollectionCard";
import type { Collection } from "../../models/domain/collection";
import type { Bouquet } from "../../models/domain/bouquet";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import EmptyState from "../../components/common/EmptyState";
import ErrorDisplay from "../../components/common/ErrorDisplay";
import SectionHeader from "../../components/common/SectionHeader";
import Container from "../../components/layout/Container";
import CollectionGrid from "../../components/collections/CollectionGrid";

interface OurCollectionViewProps {
  items: Collection[];
  loading?: boolean;
  errorMessage?: string;
}

interface OurCollectionSectionState {
  isVisible: boolean;
}

type RawBouquet = Bouquet & {
  imageUrl?: string;
  category?: string;
  inStock?: boolean;
};

/**
 * Our Collection Section Component
 * Class-based component for our collection section
 * Optimized with shouldComponentUpdate to prevent unnecessary re-renders
 */
class OurCollectionSection extends Component<OurCollectionViewProps, OurCollectionSectionState> {
  private baseClass: string = "ourCollection";
  private sectionRef: RefObject<HTMLElement>;
  private intersectionObserver: IntersectionObserver | null;
  // Cache for prepared collections to avoid recalculation
  private preparedCollectionsCache: {
    key: string;
    result: Array<{
      id: string;
      name: string;
      description: string;
      bouquets: BouquetCardProps[];
    }>;
  } | null = null;

  constructor(props: OurCollectionViewProps) {
    super(props);
    this.state = {
      isVisible: false,
    };
    this.sectionRef = React.createRef();
    this.intersectionObserver = null;
  }

  /**
   * Prevent unnecessary re-renders when props haven't changed
   * Optimizes performance by avoiding re-renders when data is the same
   */
  shouldComponentUpdate(nextProps: OurCollectionViewProps, nextState: OurCollectionSectionState): boolean {
    const { items, loading, errorMessage } = this.props;
    const { isVisible } = this.state;

    // Clear cache if items changed (reference or length)
    if (nextProps.items !== items || nextProps.items.length !== items.length) {
      this.preparedCollectionsCache = null;
    }

    // Only re-render if props or visibility state changed
    // Optimized: check length first (cheaper) before reference equality
    return (
      nextProps.loading !== loading ||
      nextProps.errorMessage !== errorMessage ||
      nextProps.items.length !== items.length ||
      nextProps.items !== items ||
      nextState.isVisible !== isVisible
    );
  }

  componentDidMount(): void {
    this.setupIntersectionObserver();
  }

  componentWillUnmount(): void {
    this.cleanupIntersectionObserver();
  }

  private setupIntersectionObserver(): void {
    if (!this.sectionRef.current) return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.setState({ isVisible: true });
            // Disconnect observer after visibility is set to improve performance
            this.cleanupIntersectionObserver();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      }
    );

    if (this.sectionRef.current) {
      this.intersectionObserver.observe(this.sectionRef.current);
    }
  }

  private cleanupIntersectionObserver(): void {
    try {
      if (this.intersectionObserver) {
        if (this.sectionRef.current) {
          this.intersectionObserver.unobserve(this.sectionRef.current);
        }
        this.intersectionObserver.disconnect();
        this.intersectionObserver = null;
      }
    } catch (error) {
      console.warn("Error during intersection observer cleanup:", error);
      // Ensure observer is null even if cleanup fails
      this.intersectionObserver = null;
    }
  }

  /**
   * Normalize bouquet data with comprehensive edge case handling
   * Handles null/undefined, malformed data, and type safety
   */
  private normalizeBouquet(raw: unknown, collectionName: string): BouquetCardProps | null {
    // Edge case: null or undefined
    if (raw == null || typeof raw !== "object") return null;

    const data = raw as Partial<RawBouquet> & { id?: string };

    // Edge case: missing required fields
    const id = data._id ?? data.id;
    const name = data.name;
    if (!id || !name || typeof name !== "string") return null;

    // Edge case: handle image with fallback
    const imageCandidate =
      (typeof data.image === "string" && data.image.trim()) ||
      (typeof data.imageUrl === "string" && data.imageUrl.trim()) ||
      "";

    // Edge case: handle type/category
    const typeCandidate =
      (typeof data.type === "string" && data.type.trim()) ||
      (typeof (data as any).category === "string" && String((data as any).category).trim()) ||
      "";

    // Edge case: handle status with validation
    const statusCandidate = data.status === "preorder" ? "preorder" : "ready";

    // Edge case: handle price with validation
    let priceValue = 0;
    if (typeof data.price === "number" && !isNaN(data.price) && isFinite(data.price)) {
      priceValue = Math.max(0, data.price);
    } else if (data.price != null) {
      const parsed = Number(data.price);
      if (!isNaN(parsed) && isFinite(parsed)) {
        priceValue = Math.max(0, parsed);
      }
    }

    return {
      _id: String(id),
      name: name.trim(),
      description: typeof data.description === "string" ? data.description.trim() : "",
      price: priceValue,
      type: typeCandidate,
      size: typeof data.size === "string" ? data.size.trim() : "",
      image: imageCandidate,
      status:
        statusCandidate === "ready" && data.inStock === false ? "preorder" : statusCandidate,
      collectionName: typeof data.collectionName === "string" && data.collectionName.trim()
        ? data.collectionName.trim()
        : (collectionName || ""),
      isNewEdition: typeof data.isNewEdition === "boolean" ? data.isNewEdition : false,
      isFeatured: typeof data.isFeatured === "boolean" ? data.isFeatured : false,
    };
  }

  /**
   * Convert collection bouquets to BouquetCardProps with edge case handling
   */
  private toBouquetProps(collection: Collection): BouquetCardProps[] {
    // Edge case: handle null/undefined collection
    if (!collection) return [];
    
    const list = collection.bouquets;
    // Edge case: handle non-array or empty array
    if (!Array.isArray(list) || list.length === 0) return [];

    const collectionName = typeof collection.name === "string" ? collection.name : "";
    
    return list
      .map((item) => this.normalizeBouquet(item, collectionName))
      .filter((b): b is BouquetCardProps => Boolean(b));
  }

  /**
   * Prepare collections with memoization for performance
   * Optimized cache key generation - uses faster string concatenation instead of JSON.stringify
   * Enhanced with comprehensive edge case handling
   */
  private prepareCollections(): Array<{
    id: string;
    name: string;
    description: string;
    bouquets: BouquetCardProps[];
  }> {
    const { items } = this.props;
    
    // Edge case: handle null/undefined items
    const safeItems = Array.isArray(items) ? items : [];
    
    // Optimized cache key generation - faster than JSON.stringify
    const cacheKey = safeItems.length + "|" + safeItems.map((c) => {
      if (!c) return "";
      const anyC = c as unknown as { _id?: string; id?: string; name?: string };
      return String(anyC?._id ?? anyC?.id ?? anyC?.name ?? "");
    }).join(",");

    // Return cached result if available
    if (this.preparedCollectionsCache?.key === cacheKey) {
      return this.preparedCollectionsCache.result;
    }

    // Prepare collections with edge case handling
    const result = safeItems
      .filter((c) => c != null) // Filter out null/undefined
      .map((c) => {
        const anyC = c as unknown as { _id?: string; id?: string; name?: string };
        const id = String(anyC?._id ?? anyC?.id ?? anyC?.name ?? "");
        const name = typeof anyC?.name === "string" ? anyC.name.trim() : "";

        // Edge case: skip collections without valid id and name
        if (!id || !name) return null;

        return {
          id,
          name,
          description: typeof c.description === "string" ? c.description.trim() : "",
          bouquets: this.toBouquetProps(c),
        };
      })
      .filter((c): c is NonNullable<typeof c> => c != null) // Type guard
      .filter((c) => Boolean(c.id) && Boolean(c.name))
      .filter((c) => Array.isArray(c.bouquets) && c.bouquets.length > 0); // Only collections with bouquets

    // Cache the result
    this.preparedCollectionsCache = { key: cacheKey, result };
    return result;
  }

  private renderCollectionSkeleton(): React.ReactNode {
    return (
      <div className="collectionCard collectionCard--skeleton" aria-hidden="true">
        <div className="collectionCard__header">
          <div className="collectionCard__heading">
            <SkeletonLoader variant="text" height={32} width="60%" />
            <SkeletonLoader variant="text" height={16} width="80%" />
          </div>
        </div>
        <div className="collectionCard__scrollWrap">
          <div className="collectionCard__scroll">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bouquetCard bouquetCard--skeleton">
                <SkeletonLoader variant="rectangular" height={200} />
                <div className="bouquetCard__body">
                  <SkeletonLoader variant="text" height={20} />
                  <SkeletonLoader variant="text" height={16} width="60%" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render error state with retry option
   * Uses reusable ErrorDisplay component following OOP/MVC principles
   */
  private renderErrorState(): React.ReactNode {
    const { errorMessage } = this.props;
    
    return (
      <ErrorDisplay
        severity="error"
        title="Gagal Memuat Koleksi"
        message={errorMessage || "Terjadi kesalahan saat memuat koleksi. Silakan coba lagi."}
        showRetry={true}
        onRetry={() => window.location.reload()}
        retryLabel="Coba Lagi"
        maxWidth="820px"
      />
    );
  }

  /**
   * Render empty state with better messaging and CTA
   */
  private renderEmptyState(): React.ReactNode {
    return (
      <EmptyState
        title="Koleksi Segera Hadir"
        description="Kami sedang mempersiapkan koleksi terbaik untuk Anda. Silakan hubungi kami untuk informasi lebih lanjut atau cek kembali nanti."
        actionLabel="Hubungi Kami"
        actionPath="/contact"
        icon={
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.3"
            />
            <path
              d="M16 7V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.3"
            />
            <path
              d="M12 12V12.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
        className={`${this.baseClass}__empty`}
      />
    );
  }

  render(): React.ReactNode {
    const { loading = false, errorMessage } = this.props;
    const { isVisible } = this.state;
    
    // Edge case: handle loading state - show skeleton
    if (loading) {
      return (
        <section
          ref={this.sectionRef}
          className={`${this.baseClass} ${isVisible ? `${this.baseClass}--visible` : ""}`}
          id="OurCollection"
          aria-labelledby="ourCollection-title"
        >
          <Container variant="default" padding="md" className={`${this.baseClass}__container`}>
            <SectionHeader
              eyebrow="Pilihan terbaik untuk setiap momen"
              title="Koleksi Kami"
              subtitle="Jelajahi berbagai bouquet dan gift arrangement premium kami. Setiap koleksi dirancang khusus untuk membuat momen Anda lebih berkesan dan berkesan."
              className={`${this.baseClass}__header`}
              titleId="ourCollection-title"
            />
            <div
              className={`${this.baseClass}__grid`}
              aria-busy="true"
              aria-live="polite"
            >
              {this.renderCollectionSkeleton()}
              {this.renderCollectionSkeleton()}
            </div>
          </Container>
        </section>
      );
    }

    // Edge case: handle error state - show error display
    if (errorMessage) {
      return (
        <section
          ref={this.sectionRef}
          className={`${this.baseClass} ${isVisible ? `${this.baseClass}--visible` : ""}`}
          id="OurCollection"
          aria-labelledby="ourCollection-title"
        >
          <Container variant="default" padding="md" className={`${this.baseClass}__container`}>
            <SectionHeader
              eyebrow="Pilihan terbaik untuk setiap momen"
              title="Koleksi Kami"
              subtitle="Jelajahi berbagai bouquet dan gift arrangement premium kami. Setiap koleksi dirancang khusus untuk membuat momen Anda lebih berkesan dan berkesan."
              className={`${this.baseClass}__header`}
              titleId="ourCollection-title"
            />
            {this.renderErrorState()}
          </Container>
        </section>
      );
    }

    // Prepare collections and handle edge cases
    const prepared = this.prepareCollections();

    // Edge case: handle empty state - show empty state component
    if (!prepared.length) {
      return (
        <section
          ref={this.sectionRef}
          className={`${this.baseClass} ${isVisible ? `${this.baseClass}--visible` : ""}`}
          id="OurCollection"
          aria-labelledby="ourCollection-title"
        >
          <Container variant="default" padding="md" className={`${this.baseClass}__container`}>
            <SectionHeader
              eyebrow="Pilihan terbaik untuk setiap momen"
              title="Koleksi Kami"
              subtitle="Jelajahi berbagai bouquet dan gift arrangement premium kami. Setiap koleksi dirancang khusus untuk membuat momen Anda lebih berkesan dan berkesan."
              className={`${this.baseClass}__header`}
              titleId="ourCollection-title"
            />
            {this.renderEmptyState()}
          </Container>
        </section>
      );
    }

    // Normal state: show collections grid
    return (
      <section
        ref={this.sectionRef}
        className={`${this.baseClass} ${isVisible ? `${this.baseClass}--visible` : ""}`}
        id="OurCollection"
        aria-labelledby="ourCollection-title"
      >
        <Container variant="default" padding="md" className={`${this.baseClass}__container`}>
          <SectionHeader
            eyebrow="Pilihan terbaik untuk setiap momen"
            title="Koleksi Kami"
            subtitle="Jelajahi berbagai bouquet dan gift arrangement premium kami. Setiap koleksi dirancang khusus untuk membuat momen Anda lebih berkesan dan berkesan."
            className={`${this.baseClass}__header`}
            titleId="ourCollection-title"
          />
          <CollectionGrid
            collections={prepared}
            loading={false}
            onCollectionClick={(collectionId) => {
              // Optional: Handle collection click - can be extended for analytics or navigation
              // Currently handled by CollectionCard's internal Link component
            }}
          />
        </Container>
      </section>
    );
  }
}

export default OurCollectionSection;
