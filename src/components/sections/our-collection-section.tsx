// src/components/sections/our-collection-section.tsx
import React, { useMemo, useEffect, useRef, useState } from "react";
import "../../styles/OurCollectionSection.css";
import CollectionCard from "../collection-card-component";
import type { BouquetCardProps } from "../collection-card-component";

import type { Collection } from "../../models/domain/collection";
import type { Bouquet } from "../../models/domain/bouquet";

interface OurCollectionViewProps {
  items: Collection[];
  loading?: boolean;
  errorMessage?: string;
}

type RawBouquet = Bouquet & {
  imageUrl?: string;
  category?: string;
  inStock?: boolean;
};

const normalizeBouquet = (
  raw: unknown,
  collectionName: string
): BouquetCardProps | null => {
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
    (typeof (data as any).category === "string" &&
      (data as any).category) ||
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
      statusCandidate === "ready" && data.inStock === false
        ? "preorder"
        : statusCandidate,
    collectionName: data.collectionName ?? collectionName,
    isNewEdition: typeof data.isNewEdition === "boolean" ? data.isNewEdition : false,
    isFeatured: typeof data.isFeatured === "boolean" ? data.isFeatured : false,
  };
};

const toBouquetProps = (collection: Collection): BouquetCardProps[] => {
  const list = collection.bouquets;
  if (!Array.isArray(list) || list.length === 0) return [];

  return list
    .map((item) => normalizeBouquet(item, collection.name))
    .filter((b): b is BouquetCardProps => Boolean(b));
};

// Loading skeleton component
const CollectionSkeleton: React.FC = () => (
  <div className="collectionCard collectionCard--skeleton" aria-hidden="true">
    <div className="collectionCard__header">
      <div className="collectionCard__heading">
        <div className="skeleton skeleton--title"></div>
        <div className="skeleton skeleton--description"></div>
      </div>
    </div>
    <div className="collectionCard__scrollWrap">
      <div className="collectionCard__scroll">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bouquetCard bouquetCard--skeleton">
            <div className="skeleton skeleton--image"></div>
            <div className="bouquetCard__body">
              <div className="skeleton skeleton--text"></div>
              <div className="skeleton skeleton--text skeleton--short"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const OurCollectionSection: React.FC<OurCollectionViewProps> = ({
  items,
  loading = false,
  errorMessage = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const prepared = useMemo(() => {
    return (items ?? [])
      .map((c) => {
        const anyC = c as unknown as { _id?: string; id?: string; name?: string };
        const id = anyC?._id ?? anyC?.id ?? anyC?.name ?? "";
        const name = typeof anyC?.name === "string" ? anyC.name.trim() : "";

        return {
          id,
          name,
          description: c.description ?? "",
          bouquets: toBouquetProps(c),
        };
      })
      .filter((c) => Boolean(c.id) && Boolean(c.name))
      .filter((c) => c.bouquets.length > 0);
  }, [items]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const currentSection = sectionRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      }
    );

    if (currentSection) {
      observer.observe(currentSection);
    }

    return () => {
      if (currentSection) {
        observer.unobserve(currentSection);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`ourCollection ${isVisible ? "ourCollection--visible" : ""}`}
      id="OurCollection"
      aria-labelledby="ourCollection-title"
    >
      <div className="ourCollection__container">
        <header className="ourCollection__header">
          <p className="ourCollection__eyebrow">Pilihan terbaik untuk setiap momen</p>

          <h2 id="ourCollection-title" className="ourCollection__title">
            Koleksi Kami
          </h2>

          <p className="ourCollection__subtitle">
            Bouquet dan gift arrangement pilihan untuk perayaan, kejutan, dan
            keseharian yang lebih elegan.
          </p>
        </header>

        {loading ? (
          <div
            className="ourCollection__grid"
            aria-busy="true"
            aria-live="polite"
          >
            <CollectionSkeleton />
            <CollectionSkeleton />
          </div>
        ) : errorMessage ? (
          <div className="ourCollection__error" role="alert" aria-live="polite">
            <div className="ourCollection__errorIcon" aria-hidden="true">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 9V13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 17H12.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="ourCollection__errorTitle">Gagal memuat koleksi</h3>
            <p className="ourCollection__errorText">{errorMessage}</p>
          </div>
        ) : !prepared.length ? (
          <div
            className="ourCollection__empty"
            role="status"
            aria-live="polite"
          >
            <div className="ourCollection__emptyIcon" aria-hidden="true">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 7V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="ourCollection__emptyTitle">Belum ada koleksi</h3>
            <p className="ourCollection__emptyText">
              Silakan cek kembali — koleksi baru akan ditambahkan secara
              berkala.
            </p>
          </div>
        ) : (
          <div className="ourCollection__grid">
            {prepared.map((c, index) => (
              <CollectionCard
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
      </div>
    </section>
  );
};

export default OurCollectionSection;
