// src/components/sections/our-collection-section.tsx
import React, { useMemo } from "react";
import "../../styles/OurCollectionSection.css";
import CollectionCard, { BouquetCardProps } from "../collection-card-component";

import type { Collection } from "../../models/domain/collection";
import type { Bouquet } from "../../models/domain/bouquet";

interface OurCollectionViewProps {
  items: Collection[];
}

const isBouquetObject = (v: unknown): v is Bouquet =>
  typeof v === "object" &&
  v !== null &&
  "_id" in (v as any) &&
  "name" in (v as any);

const toBouquetProps = (collection: Collection): BouquetCardProps[] => {
  const list = collection.bouquets;

  if (!Array.isArray(list) || list.length === 0) return [];
  if (typeof list[0] === "string") return [];
  if (!isBouquetObject(list[0])) return [];

  return (list as Bouquet[]).map((b) => ({
    _id: String(b._id),
    name: b.name,
    description: b.description ?? "",
    price: b.price,
    type: b.type ?? "",
    size: b.size ?? "",
    image: b.image ?? "",
    status: b.status,
    collectionName: b.collectionName ?? collection.name,
  }));
};

const OurCollectionSection: React.FC<OurCollectionViewProps> = ({ items }) => {
  const prepared = useMemo(() => {
    return (items ?? []).map((c) => ({
      id: c._id,
      name: c.name,
      description: c.description ?? "",
      bouquets: toBouquetProps(c),
    }));
  }, [items]);

  return (
    <section
      className="ourCollection"
      id="OurCollection"
      aria-labelledby="ourCollection-title"
    >
      <div className="ourCollection__container">
        <header className="ourCollection__header">
          <p className="ourCollection__eyebrow">Curated for every moment</p>

          <h2 id="ourCollection-title" className="ourCollection__title">
            Our Collections
          </h2>

          <p className="ourCollection__subtitle">
            Curated orchid arrangements for gifts, celebrations, and everyday
            elegance.
          </p>
        </header>

        {!prepared.length ? (
          <div
            className="ourCollection__empty"
            role="status"
            aria-live="polite"
          >
            <div className="ourCollection__emptyIcon" aria-hidden="true" />
            <h3 className="ourCollection__emptyTitle">No collections yet</h3>
            <p className="ourCollection__emptyText">
              Please check back soon — new orchid collections are added
              regularly.
            </p>
          </div>
        ) : (
          <div className="ourCollection__grid">
            {prepared.map((c) => (
              <CollectionCard
                key={c.id}
                id={c.id}
                name={c.name}
                description={c.description}
                bouquets={c.bouquets}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default OurCollectionSection;
