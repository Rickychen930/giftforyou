/**
 * Bouquet Card Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import { Link } from "react-router-dom";
import { withRouter, WithRouterProps } from "../../utils/withRouter";
import "../../styles/BouquetCardComponent.css";
import { API_BASE } from "../../config/api";
import { formatIDR } from "../../utils/money";
import {
  formatBouquetName,
  formatBouquetType,
  formatBouquetSize,
  formatCollectionName,
  formatTag,
} from "../../utils/text-formatter";
import { buildWhatsAppLink } from "../../utils/whatsapp";
import { STORE_PROFILE } from "../../config/store-profile";
import { isFavorite, toggleFavorite } from "../../utils/favorites";
import { addToCart } from "../../utils/cart";
import { addToRecentlyViewed } from "../../utils/recently-viewed";
import { toast } from "../../utils/toast";

const FALLBACK_IMAGE = "/images/placeholder-bouquet.jpg";

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

interface BouquetCardState {
  imageLoaded: boolean;
  imageError: boolean;
  isFavorited: boolean;
  showQuickActions: boolean;
}

/**
 * Bouquet Card Component (Internal - can work with or without router)
 * Class-based component for bouquet card display
 */
class BouquetCardInternal extends Component<BouquetCardProps & Partial<WithRouterProps>, BouquetCardState> {
  private baseClass: string = "bouquetCard";
  private imageRef: React.RefObject<HTMLImageElement>;

  constructor(props: BouquetCardProps & Partial<WithRouterProps>) {
    super(props);
    this.state = {
      imageLoaded: false,
      imageError: false,
      isFavorited: false,
      showQuickActions: false,
    };
    this.imageRef = React.createRef();
  }

  componentDidMount(): void {
    this.checkImageLoad();
    this.checkFavoriteStatus();
  }

  componentDidUpdate(prevProps: BouquetCardProps & Partial<WithRouterProps>): void {
    if (prevProps.image !== this.props.image || prevProps._id !== this.props._id) {
      this.checkImageLoad();
      this.checkFavoriteStatus();
    }
  }

  private checkImageLoad(): void {
    const imageUrl = this.getImageUrl();

    if (imageUrl && imageUrl !== FALLBACK_IMAGE) {
      const img = new Image();
      img.onload = () => {
        this.setState({ imageLoaded: true, imageError: false });
      };
      img.onerror = () => {
        this.setState({ imageError: true, imageLoaded: true });
      };
      img.src = imageUrl;
    } else {
      this.setState({ imageLoaded: true });
    }
  }

  private checkFavoriteStatus(): void {
    const { _id } = this.props;
    this.setState({ isFavorited: isFavorite(_id) });
  }

  private getImageUrl(): string {
    const { image } = this.props;
    if (!image) return FALLBACK_IMAGE;
    if (image.startsWith("http")) return image;
    return `${API_BASE}${image}`;
  }

  private getDetailHref(): string {
    return `/bouquet/${this.props._id}`;
  }

  private handleCardNavigate = (): void => {
    const { _id, name, price, image, navigate } = this.props;
    addToRecentlyViewed(_id, name, price, image);
    if (navigate) {
      navigate(this.getDetailHref());
    } else {
      window.location.href = this.getDetailHref();
    }
  };

  private handleCardClick = (e: React.MouseEvent<HTMLElement>): void => {
    if (e.defaultPrevented) return;
    const target = e.target as HTMLElement | null;
    if (!target) return;

    if (target.closest("a,button,[role='button'],input,select,textarea,label")) {
      return;
    }

    this.handleCardNavigate();
  };

  private handleCardKeyDown = (e: React.KeyboardEvent<HTMLElement>): void => {
    if (e.defaultPrevented) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.handleCardNavigate();
    }
  };

  private handleImageLoad = (): void => {
    this.setState({ imageLoaded: true, imageError: false });
  };

  private handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = FALLBACK_IMAGE;
    this.setState({ imageError: true, imageLoaded: true });
  };

  private buildQuickOrderMessage(): string {
    const { _id, name, price, status } = this.props;
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
  }

  private handleFavoriteToggle = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    const { _id, name, price, image } = this.props;
    const newStatus = toggleFavorite(_id, name, price, image);
    this.setState({ isFavorited: newStatus });
  };

  private handleQuickOrder = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    const message = this.buildQuickOrderMessage();
    const waLink = buildWhatsAppLink(message);
    window.open(waLink, "_blank", "noopener,noreferrer");
  };

  private handleAddToCart = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    const { _id, name, price, image } = this.props;
    addToCart({
      bouquetId: _id,
      bouquetName: name,
      bouquetPrice: price,
      quantity: 1,
      image: image,
    });
    toast.success(`${formatBouquetName(name)} ditambahkan ke keranjang`);
  };

  private getTags(): string[] {
    const { collectionName, type, size } = this.props;
    return [
      formatCollectionName(collectionName),
      formatBouquetType(type),
      formatBouquetSize(size),
    ].filter(Boolean) as string[];
  }

  private getStatusLabel(): string {
    return this.props.status === "ready" ? "Siap" : "Preorder";
  }

  render(): React.ReactNode {
    const { name, price, status, customPenanda = [], isNewEdition = false, isFeatured = false } =
      this.props;
    const { imageLoaded, imageError, isFavorited, showQuickActions } = this.state;
    const imageUrl = this.getImageUrl();
    const detailHref = this.getDetailHref();
    const tags = this.getTags();
    const statusLabel = this.getStatusLabel();

    return (
      <article
        className={this.baseClass}
        role="listitem"
        aria-label={`Bouquet ${name}, harga ${formatIDR(price)}`}
        tabIndex={0}
        onClick={this.handleCardClick}
        onKeyDown={this.handleCardKeyDown}
      >
        {/* Media Section */}
        <div className={`${this.baseClass}__media`}>
          <Link
            to={detailHref}
            className={`${this.baseClass}__mediaLink`}
            aria-label={`Lihat detail ${name}`}
          >
            {!imageLoaded && (
              <div className={`${this.baseClass}__skeleton`} aria-hidden="true">
                <div className={`${this.baseClass}__skeletonShimmer`} />
              </div>
            )}
            <img
              ref={this.imageRef}
              src={imageUrl}
              alt={formatBouquetName(name)}
              className={`${this.baseClass}__image ${imageLoaded ? "is-loaded" : ""} ${imageError ? "is-error" : ""}`}
              loading="lazy"
              decoding="async"
              onLoad={this.handleImageLoad}
              onError={this.handleImageError}
            />
            <div className={`${this.baseClass}__overlay`}>
              {/* Top Left - Featured/New Badges */}
              {(isFeatured || isNewEdition) && (
                <div className={`${this.baseClass}__badgeTopLeft`}>
                  {isFeatured && (
                    <span
                      className={`${this.baseClass}__badge ${this.baseClass}__badge--featured`}
                      aria-label="Bouquet featured"
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                          fill="currentColor"
                        />
                      </svg>
                      Featured
                    </span>
                  )}
                  {isNewEdition && !isFeatured && (
                    <span
                      className={`${this.baseClass}__badge ${this.baseClass}__badge--new`}
                      aria-label="Bouquet baru"
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Baru
                    </span>
                  )}
                </div>
              )}

              {/* Top Right - Status Badge */}
              <span
                className={`${this.baseClass}__badge ${this.baseClass}__badge--status ${
                  status === "ready" ? "is-ready" : "is-preorder"
                }`}
                aria-label={`Status: ${statusLabel}`}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  {status === "ready" ? (
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : (
                    <path
                      d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>
                {statusLabel}
              </span>

              {/* Quick Actions Overlay */}
              <div
                className={`${this.baseClass}__quickActions ${showQuickActions ? "is-visible" : ""}`}
                onMouseEnter={() => this.setState({ showQuickActions: true })}
                onMouseLeave={() => this.setState({ showQuickActions: false })}
              >
                <button
                  type="button"
                  className={`${this.baseClass}__quickAction ${this.baseClass}__quickAction--favorite ${isFavorited ? "is-active" : ""}`}
                  onClick={this.handleFavoriteToggle}
                  aria-label={isFavorited ? "Hapus dari favorit" : "Tambahkan ke favorit"}
                  title={isFavorited ? "Hapus dari favorit" : "Tambahkan ke favorit"}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill={isFavorited ? "currentColor" : "none"}
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`${this.baseClass}__quickAction ${this.baseClass}__quickAction--cart`}
                  onClick={this.handleAddToCart}
                  aria-label="Tambahkan ke keranjang"
                  title="Tambahkan ke keranjang"
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
                      d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 9v6M9 12h6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <a
                  href={buildWhatsAppLink(this.buildQuickOrderMessage())}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${this.baseClass}__quickAction ${this.baseClass}__quickAction--order`}
                  onClick={this.handleQuickOrder}
                  aria-label="Order cepat via WhatsApp"
                  title="Order cepat via WhatsApp"
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
                </a>
              </div>
            </div>
          </Link>
        </div>

        {/* Body Section */}
        <div className={`${this.baseClass}__body`}>
          <h3 className={`${this.baseClass}__name`}>
            <Link
              to={detailHref}
              className={`${this.baseClass}__nameLink`}
              aria-label={`Buka detail ${formatBouquetName(name)}`}
            >
              {formatBouquetName(name)}
            </Link>
          </h3>

          <div className={`${this.baseClass}__priceWrapper`}>
            <p className={`${this.baseClass}__price`} aria-label={`Harga ${formatIDR(price)}`}>
              {formatIDR(price)}
            </p>
          </div>

          {(tags.length > 0 || customPenanda.length > 0) && (
            <div className={`${this.baseClass}__meta`} aria-label="Bouquet details">
              {tags.slice(0, 2).map((t) => (
                <span key={t} className={`${this.baseClass}__chip`} title={t}>
                  {formatTag(t)}
                </span>
              ))}
              {customPenanda.slice(0, Math.max(0, 2 - tags.length)).map((p, idx) => (
                <span
                  key={`penanda-${idx}-${p}`}
                  className={`${this.baseClass}__chip`}
                  title={p}
                >
                  {formatTag(p)}
                </span>
              ))}
              {tags.length + customPenanda.length > 2 && (
                <span
                  className={`${this.baseClass}__chip ${this.baseClass}__chip--more`}
                  title={[...tags, ...customPenanda].slice(2).join(", ")}
                >
                  +{tags.length + customPenanda.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </article>
    );
  }
}

/**
 * Bouquet Card Component (Exported with router)
 * Wraps BouquetCardInternal with router props
 */
class BouquetCardWithRouter extends Component<BouquetCardProps & WithRouterProps, BouquetCardState> {
  render(): React.ReactNode {
    return <BouquetCardInternal {...this.props} />;
  }
}

const BouquetCard = withRouter(BouquetCardWithRouter);

export default BouquetCard;
export { BouquetCardInternal };
