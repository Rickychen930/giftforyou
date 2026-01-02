/**
 * Our Collection Section Component (OOP)
 * Class-based component following SOLID principles
 */

/**
 * Our Collection Section Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component, RefObject } from "react";
import "../../styles/OurCollectionSection.css";
import CollectionContainer, { type BouquetCardProps } from "../../components/cards/CollectionCard";
import type { Collection } from "../../models/domain/collection";
import type { Bouquet } from "../../models/domain/bouquet";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import EmptyState from "../../components/common/EmptyState";
import AlertMessage from "../../components/common/AlertMessage";
import SectionHeader from "../../components/common/SectionHeader";
import Container from "../../components/layout/Container";

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
 */
class OurCollectionSection extends Component<OurCollectionViewProps, OurCollectionSectionState> {
  private baseClass: string = "ourCollection";
  private sectionRef: RefObject<HTMLElement>;
  private intersectionObserver: IntersectionObserver | null;

  constructor(props: OurCollectionViewProps) {
    super(props);
    this.state = {
      isVisible: false,
    };
    this.sectionRef = React.createRef();
    this.intersectionObserver = null;
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

  private normalizeBouquet(raw: unknown, collectionName: string): BouquetCardProps | null {
    if (!raw || typeof raw !== "object") return null;

    const data = raw as Partial<RawBouquet> & { id?: string };

    const id = data._id ?? data.id;
    const name = data.name;

    if (!id || !name) return null;

    const imageCandidate =
      (typeof data.image === "string" && data.image) ||
      (typeof data.imageUrl === "string" && data.imageUrl) ||
      "";

    const typeCandidate =
      (typeof data.type === "string" && data.type) ||
      (typeof (data as any).category === "string" && (data as any).category) ||
      "";

    const statusCandidate = data.status === "preorder" ? "preorder" : "ready";

    return {
      _id: String(id),
      name,
      description: data.description ?? "",
      price: typeof data.price === "number" ? data.price : Number(data.price) || 0,
      type: typeCandidate,
      size: data.size ?? "",
      image: imageCandidate,
      status:
        statusCandidate === "ready" && data.inStock === false ? "preorder" : statusCandidate,
      collectionName: data.collectionName ?? collectionName,
      isNewEdition: typeof data.isNewEdition === "boolean" ? data.isNewEdition : false,
      isFeatured: typeof data.isFeatured === "boolean" ? data.isFeatured : false,
    };
  }

  private toBouquetProps(collection: Collection): BouquetCardProps[] {
    const list = collection.bouquets;
    if (!Array.isArray(list) || list.length === 0) return [];

    return list
      .map((item) => this.normalizeBouquet(item, collection.name))
      .filter((b): b is BouquetCardProps => Boolean(b));
  }

  private prepareCollections(): Array<{
    id: string;
    name: string;
    description: string;
    bouquets: BouquetCardProps[];
  }> {
    const { items } = this.props;
    return (items ?? [])
      .map((c) => {
        const anyC = c as unknown as { _id?: string; id?: string; name?: string };
        const id = anyC?._id ?? anyC?.id ?? anyC?.name ?? "";
        const name = typeof anyC?.name === "string" ? anyC.name.trim() : "";

        return {
          id,
          name,
          description: c.description ?? "",
          bouquets: this.toBouquetProps(c),
        };
      })
      .filter((c) => Boolean(c.id) && Boolean(c.name))
      .filter((c) => c.bouquets.length > 0);
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
   * Render error state
   */
  private renderErrorState(): React.ReactNode {
    const { errorMessage } = this.props;
    return (
      <AlertMessage
        variant="error"
        message={`Gagal memuat koleksi. ${errorMessage || "Silakan refresh halaman."}`}
        className={`${this.baseClass}__error`}
      />
    );
  }

  /**
   * Render empty state
   */
  private renderEmptyState(): React.ReactNode {
    return (
      <EmptyState
        title="Belum ada koleksi"
        description="Silakan cek kembali — koleksi baru akan ditambahkan secara berkala."
        icon={
          <svg
            width="48"
            height="48"
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
          </svg>
        }
        className={`${this.baseClass}__empty`}
      />
    );
  }

  render(): React.ReactNode {
    const { loading = false, errorMessage } = this.props;
    const { isVisible } = this.state;
    const prepared = this.prepareCollections();

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
            subtitle="Bouquet dan gift arrangement pilihan untuk perayaan, kejutan, dan keseharian yang lebih elegan."
            className={`${this.baseClass}__header`}
            titleId="ourCollection-title"
          />

          {loading ? (
            <div
              className={`${this.baseClass}__grid`}
              aria-busy="true"
              aria-live="polite"
            >
              {this.renderCollectionSkeleton()}
              {this.renderCollectionSkeleton()}
            </div>
          ) : errorMessage ? (
            this.renderErrorState()
          ) : !prepared.length ? (
            this.renderEmptyState()
          ) : (
            <div className={`${this.baseClass}__grid`}>
              {prepared.map((c, index) => (
                <CollectionContainer
                  key={c.id}
                  id={c.id}
                  name={c.name}
                  description={c.description}
                  bouquets={c.bouquets}
                  index={index}
                />
              ))}
            </div>
          )}
        </Container>
      </section>
    );
  }
}

export default OurCollectionSection;
