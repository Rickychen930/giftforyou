import React, { useRef, useState, useEffect } from "react";
import "../styles/CollectionCardComponent.css";

import { API_BASE } from "../config/api";
import { formatIDR } from "../utils/money";
import { buildWhatsAppLinkEncoded } from "../utils/whatsapp";

export interface BouquetCardProps {
  _id: string;
  name: string;
  description?: string;
  price: number;
  type?: string;
  size?: string;
  image?: string;
  status: "ready" | "preorder";
  collectionName?: string;
}

export interface CollectionCardProps {
  id: string;
  name: string;
  description: string;
  bouquets: BouquetCardProps[];
  index?: number;
}

const FALLBACK_IMAGE = "/images/placeholder-bouquet.jpg";

const formatPrice = formatIDR;

const buildImageUrl = (image?: string) => {
  if (!image) return FALLBACK_IMAGE;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `${API_BASE}${image}`;
};

const CollectionCard: React.FC<CollectionCardProps> = ({
  id,
  name,
  description,
  bouquets,
  index = 0,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Check scroll position
  const checkScroll = () => {
    const element = scrollRef.current;
    if (!element) return;

    const { scrollLeft, scrollWidth, clientWidth } = element;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Calculate scroll progress (0-100)
    const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
    setScrollProgress(isNaN(progress) ? 0 : progress);
  };

  useEffect(() => {
    checkScroll();
    const element = scrollRef.current;
    if (element) {
      element.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (element) {
        element.removeEventListener("scroll", checkScroll);
      }
      window.removeEventListener("resize", checkScroll);
    };
  }, [bouquets]);

  // Smooth scroll function
  const scroll = (direction: "left" | "right") => {
    const element = scrollRef.current;
    if (!element) return;

    const scrollAmount = element.clientWidth * 0.8;
    const targetScroll =
      direction === "left"
        ? element.scrollLeft - scrollAmount
        : element.scrollLeft + scrollAmount;

    element.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  };

  // Keyboard navigation
  const handleKeyDown = (
    e: React.KeyboardEvent,
    direction: "left" | "right"
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      scroll(direction);
    }
  };

  // Validate bouquets array
  const validBouquets = Array.isArray(bouquets) ? bouquets : [];

  const renderBouquetCard = (b: BouquetCardProps) => {
    const waMessage = encodeURIComponent(
      `Halo, saya ingin order bouquet "${b.name}" (${formatPrice(b.price)})${
        b.size ? ` ukuran ${b.size}` : ""
      }.`
    );
    const waLink = buildWhatsAppLinkEncoded(waMessage);

    const imageUrl = buildImageUrl(b.image);
    const statusLabel = b.status === "ready" ? "Ready" : "Preorder";

    return (
      <article key={b._id} className="bouquetCard" role="listitem">
        <div className="bouquetCard__media">
          <img
            src={imageUrl}
            alt={b.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />

          <span
            className={`bouquetCard__badge ${
              b.status === "ready" ? "is-ready" : "is-preorder"
            }`}
            aria-label={`Status: ${statusLabel}`}
          >
            {statusLabel}
          </span>
        </div>

        <div className="bouquetCard__body">
          <h3 className="bouquetCard__name">{b.name}</h3>

          <p className="bouquetCard__price">{formatPrice(b.price)}</p>

          {(b.size || b.type) && (
            <div className="bouquetCard__meta" aria-label="Bouquet details">
              {b.size && (
                <span className="bouquetCard__chip">Size: {b.size}</span>
              )}
              {b.type && (
                <span className="bouquetCard__chip">Type: {b.type}</span>
              )}
            </div>
          )}

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bouquetCard__btn"
            aria-label={`Order ${b.name} via WhatsApp`}
            title="Order via WhatsApp"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
                fill="currentColor"
              />
            </svg>
            <span>Order via WhatsApp</span>
          </a>
        </div>
      </article>
    );
  };

  return (
    <section
      className="collectionCard"
      aria-label={`Collection ${name}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <header className="collectionCard__header">
        <div className="collectionCard__heading">
          <div className="collectionCard__titleRow">
            <h2 className="collectionCard__title">{name}</h2>
            {validBouquets && validBouquets.length > 0 && (
              <span
                className="collectionCard__count"
                aria-label={`${validBouquets.length} items`}
              >
                {validBouquets.length} {validBouquets.length === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <p className="collectionCard__description">{description}</p>
        </div>
      </header>

      {!validBouquets || validBouquets.length === 0 ? (
        <div className="collectionCard__empty" role="status" aria-live="polite">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="collectionCard__emptyIcon"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="collectionCard__emptyTitle">No bouquets yet</p>
          <p className="collectionCard__emptyText">
            New items will appear here when the collection is updated.
          </p>
        </div>
      ) : (
        <div className="collectionCard__scrollWrap">
          {/* Navigation Arrows */}
          {canScrollLeft && (
            <button
              className="collectionCard__navBtn collectionCard__navBtn--left"
              onClick={() => scroll("left")}
              onKeyDown={(e) => handleKeyDown(e, "left")}
              aria-label="Scroll left"
              type="button"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}

          {canScrollRight && (
            <button
              className="collectionCard__navBtn collectionCard__navBtn--right"
              onClick={() => scroll("right")}
              onKeyDown={(e) => handleKeyDown(e, "right")}
              aria-label="Scroll right"
              type="button"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}

          <div
            ref={scrollRef}
            className="collectionCard__scroll"
            role="list"
            aria-label={`${name} bouquets`}
          >
            {validBouquets.map(renderBouquetCard)}
          </div>

          {/* Scroll Progress Indicator - Show always when scrollable */}
          {validBouquets.length > 0 && (
            <div className="collectionCard__progress" aria-hidden="true">
              <div
                className="collectionCard__progressBar"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default CollectionCard;
