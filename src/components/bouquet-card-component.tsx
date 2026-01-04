import React, { useState, useCallback, useEffect, useMemo, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/BouquetCardComponent.css";

import { API_BASE } from "../config/api"; // adjust path depending on folder depth
import { formatIDR } from "../utils/money";
import { formatBouquetName, formatBouquetType, formatBouquetSize, formatCollectionName, formatTag } from "../utils/text-formatter";
import { buildWhatsAppLink } from "../utils/whatsapp";
import { STORE_PROFILE } from "../config/store-profile";
import { isFavorite, toggleFavorite } from "../utils/favorites";
import { addToCart } from "../utils/cart";
import { addToRecentlyViewed } from "../utils/recently-viewed";
import { toast } from "../utils/toast";
const FALLBACK_IMAGE = "/images/placeholder-bouquet.jpg";

// Plain props untuk komponen UI
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
  customPenanda?: string[];
  isNewEdition?: boolean;
  isFeatured?: boolean;
}

const BouquetCard: React.FC<BouquetCardProps> = ({
  _id,
  name,
  description,
  price,
  type,
  size,
  image,
  status,
  collectionName,
  customPenanda = [],
  isNewEdition = false,
  isFeatured = false,
}) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Memoize imageUrl to prevent recalculation on every render
  const imageUrl = useMemo(() => {
    if (!image) return FALLBACK_IMAGE;
    return image.startsWith("http") ? image : `${API_BASE}${image}`;
  }, [image]);

  // Memoize detailHref
  const detailHref = useMemo(() => `/bouquet/${_id}`, [_id]);

  const handleCardNavigate = useCallback(() => {
    // Track recently viewed
    addToRecentlyViewed(_id, name, price, image);
    navigate(detailHref);
  }, [navigate, detailHref, _id, name, price, image]);

  const handleCardClick: React.MouseEventHandler<HTMLElement> = useCallback((e) => {
    if (e.defaultPrevented) return;
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Don't hijack clicks on interactive elements.
    if (target.closest("a,button,[role='button'],input,select,textarea,label")) {
      return;
    }

    handleCardNavigate();
  }, [handleCardNavigate]);

  const handleCardKeyDown: React.KeyboardEventHandler<HTMLElement> = useCallback((e) => {
    if (e.defaultPrevented) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardNavigate();
    }
  }, [handleCardNavigate]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = FALLBACK_IMAGE;
    setImageError(true);
    setImageLoaded(true);
  }, []);

  // Ensure image is visible even if load handler doesn't fire
  useEffect(() => {
    if (imageUrl && imageUrl !== FALLBACK_IMAGE) {
      const img = new Image();
      img.onload = () => {
        setImageLoaded(true);
      };
      img.onerror = () => {
        setImageError(true);
        setImageLoaded(true);
      };
      img.src = imageUrl;
    } else {
      setImageLoaded(true);
    }
  }, [imageUrl]);

  // Check favorite status
  useEffect(() => {
    setIsFavorited(isFavorite(_id));
  }, [_id]);

  // Build quick order message - memoized with useMemo instead of useCallback for better performance
  const quickOrderMessage = useMemo(() => {
    const detailUrl = `${window.location.origin}/bouquet/${_id}`;
    const lines = [
      `Halo ${STORE_PROFILE.brand.displayName}, saya ingin pesan:`,
      ``,
      `✨ ${name}`,
      `💰 Harga: ${formatIDR(price)}`,
      status ? `📦 Status: ${status === "ready" ? "Siap" : "Preorder"}` : "",
      ``,
      `Mohon info lebih lanjut mengenai:`,
      `• Jumlah yang diinginkan`,
      `• Tipe pengiriman (diantar/ambil di toko)`,
      `• Tanggal pengiriman/pengambilan`,
      `• Alamat (jika diantar)`,
      ``,
      `🔗 Detail: ${detailUrl}`,
    ].filter(Boolean);
    return lines.join("\n");
  }, [_id, name, price, status]);

  const handleFavoriteToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newStatus = toggleFavorite(_id, name, price, image);
    setIsFavorited(newStatus);
  }, [_id, name, price, image]);

  const handleQuickOrder = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const waLink = buildWhatsAppLink(quickOrderMessage);
    window.open(waLink, "_blank", "noopener,noreferrer");
  }, [quickOrderMessage]);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      bouquetId: _id,
      bouquetName: name,
      bouquetPrice: price,
      quantity: 1,
      image: image,
    });
    toast.success(`${formatBouquetName(name)} ditambahkan ke keranjang`);
  }, [_id, name, price, image]);

  const tags = [
    formatCollectionName(collectionName),
    formatBouquetType(type),
    formatBouquetSize(size)
  ].filter(Boolean) as string[];

  const statusLabel = status === "ready" ? "Siap" : "Preorder";

  return (
    <article
      className="bouquetCard"
      role="listitem"
      aria-label={`Bouquet ${name}, harga ${formatIDR(price)}`}
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      {/* Media Section - Smaller, more informative */}
      <div className="bouquetCard__media">
        <Link
          to={detailHref}
          className="bouquetCard__mediaLink"
          aria-label={`Lihat detail ${name}`}
        >
          {!imageLoaded && (
            <div className="bouquetCard__skeleton" aria-hidden="true">
              <div className="bouquetCard__skeletonShimmer"></div>
            </div>
          )}
          <img
            src={imageUrl}
            alt={formatBouquetName(name)}
            className={`bouquetCard__image ${imageLoaded ? "is-loaded" : ""} ${imageError ? "is-error" : ""}`}
            loading="lazy"
            decoding="async"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          <div className="bouquetCard__overlay">
            {/* Top Left - Featured/New Badges */}
            {(isFeatured || isNewEdition) && (
              <div className="bouquetCard__badgeTopLeft">
                {isFeatured && (
                  <span className="bouquetCard__badge bouquetCard__badge--featured" aria-label="Bouquet featured">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                    </svg>
                    Featured
                  </span>
                )}
                {isNewEdition && !isFeatured && (
                  <span className="bouquetCard__badge bouquetCard__badge--new" aria-label="Bouquet baru">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Baru
                  </span>
                )}
              </div>
            )}

            {/* Top Right - Status Badge */}
            <span
              className={`bouquetCard__badge bouquetCard__badge--status ${
                status === "ready" ? "is-ready" : "is-preorder"
              }`}
              aria-label={`Status: ${statusLabel}`}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                {status === "ready" ? (
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                ) : (
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                )}
              </svg>
              {statusLabel}
            </span>

            {/* Quick Actions Overlay - Appears on Hover */}
            <div 
              className={`bouquetCard__quickActions ${showQuickActions ? "is-visible" : ""}`}
              onMouseEnter={() => setShowQuickActions(true)}
              onMouseLeave={() => setShowQuickActions(false)}
            >
              <button
                type="button"
                className={`bouquetCard__quickAction bouquetCard__quickAction--favorite ${isFavorited ? "is-active" : ""}`}
                onClick={handleFavoriteToggle}
                aria-label={isFavorited ? "Hapus dari favorit" : "Tambahkan ke favorit"}
                title={isFavorited ? "Hapus dari favorit" : "Tambahkan ke favorit"}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorited ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                type="button"
                className="bouquetCard__quickAction bouquetCard__quickAction--cart"
                onClick={handleAddToCart}
                aria-label="Tambahkan ke keranjang"
                title="Tambahkan ke keranjang"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 9v6M9 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <a
                href={buildWhatsAppLink(quickOrderMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="bouquetCard__quickAction bouquetCard__quickAction--order"
                onClick={handleQuickOrder}
                aria-label="Order cepat via WhatsApp"
                title="Order cepat via WhatsApp"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="currentColor"/>
                </svg>
              </a>
            </div>
          </div>
        </Link>
      </div>

      {/* Body Section - Name, Price, Badge */}
      <div className="bouquetCard__body">
        {/* Name */}
        <h3 className="bouquetCard__name">
          <Link
            to={detailHref}
            className="bouquetCard__nameLink"
            aria-label={`Buka detail ${formatBouquetName(name)}`}
          >
            {formatBouquetName(name)}
          </Link>
        </h3>

        {/* Price */}
        <div className="bouquetCard__priceWrapper">
          <p className="bouquetCard__price" aria-label={`Harga ${formatIDR(price)}`}>
            {formatIDR(price)}
          </p>
        </div>

        {/* Badge/Tags */}
        {(tags.length > 0 || customPenanda.length > 0) && (
          <div className="bouquetCard__meta" aria-label="Bouquet details">
            {tags.slice(0, 2).map((t) => (
              <span key={t} className="bouquetCard__chip" title={t}>
                {formatTag(t)}
              </span>
            ))}
            {customPenanda.slice(0, Math.max(0, 2 - tags.length)).map((p, idx) => (
              <span key={`penanda-${idx}-${p}`} className="bouquetCard__chip" title={p}>
                {formatTag(p)}
              </span>
            ))}
            {(tags.length + customPenanda.length) > 2 && (
              <span className="bouquetCard__chip bouquetCard__chip--more" title={[...tags, ...customPenanda].slice(2).join(", ")}>
                +{(tags.length + customPenanda.length) - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

// Custom comparison function for memo to prevent unnecessary re-renders
const areBouquetCardPropsEqual = (
  prevProps: BouquetCardProps,
  nextProps: BouquetCardProps
): boolean => {
  // Compare all props that affect rendering
  return (
    prevProps._id === nextProps._id &&
    prevProps.name === nextProps.name &&
    prevProps.description === nextProps.description &&
    prevProps.price === nextProps.price &&
    prevProps.type === nextProps.type &&
    prevProps.size === nextProps.size &&
    prevProps.image === nextProps.image &&
    prevProps.status === nextProps.status &&
    prevProps.collectionName === nextProps.collectionName &&
    prevProps.isNewEdition === nextProps.isNewEdition &&
    prevProps.isFeatured === nextProps.isFeatured &&
    JSON.stringify(prevProps.customPenanda ?? []) === JSON.stringify(nextProps.customPenanda ?? [])
  );
};

// Memoize component with custom comparison for optimal performance
export default memo(BouquetCard, areBouquetCardPropsEqual);
