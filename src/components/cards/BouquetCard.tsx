/**
 * Bouquet Card Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import { withRouter, WithRouterProps } from "../../utils/withRouter";
import "../../styles/BouquetCardComponent.css";
import { API_BASE } from "../../config/api";
import { formatIDR } from "../../utils/money";
import {
  formatBouquetName,
  formatBouquetType,
  formatBouquetSize,
  formatCollectionName,
} from "../../utils/text-formatter";
import { buildWhatsAppLink } from "../../utils/whatsapp";
import { STORE_PROFILE } from "../../config/store-profile";
import { isFavorite, toggleFavorite } from "../../utils/favorites";
import { addToCart } from "../../utils/cart";
import { addToRecentlyViewed } from "../../utils/recently-viewed";
import { toast } from "../../utils/toast";
import BouquetCardMedia from "./bouquet/BouquetCardMedia";
import BouquetCardBadges from "./bouquet/BouquetCardBadges";
import BouquetCardActions from "./bouquet/BouquetCardActions";
import BouquetCardBody from "./bouquet/BouquetCardBody";

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
  private intersectionObserver: IntersectionObserver | null = null;

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
    this.setupLazyImageLoading();
    this.checkFavoriteStatus();
  }

  componentDidUpdate(prevProps: BouquetCardProps & Partial<WithRouterProps>): void {
    if (prevProps.image !== this.props.image || prevProps._id !== this.props._id) {
      this.setupLazyImageLoading();
      this.checkFavoriteStatus();
    }
  }

  componentWillUnmount(): void {
    this.cleanupIntersectionObserver();
  }

  /**
   * Prevent unnecessary re-renders when props haven't changed
   * Optimized: check primitive values first (cheaper), then reference equality
   */
  shouldComponentUpdate(nextProps: BouquetCardProps & Partial<WithRouterProps>, nextState: BouquetCardState): boolean {
    const { _id, image, name, price, status, collectionName, type, size, description } = this.props;
    const { imageLoaded, imageError, isFavorited, showQuickActions } = this.state;

    // Fast path: check primitive values first (cheaper operations)
    if (
      nextProps._id !== _id ||
      nextProps.price !== price ||
      nextState.imageLoaded !== imageLoaded ||
      nextState.imageError !== imageError ||
      nextState.isFavorited !== isFavorited ||
      nextState.showQuickActions !== showQuickActions
    ) {
      return true;
    }

    // Then check strings (more expensive but still relatively cheap)
    if (
      nextProps.image !== image ||
      nextProps.name !== name ||
      nextProps.status !== status
    ) {
      return true;
    }

    // Optional props - only check if they exist (avoid unnecessary checks)
    if (
      (nextProps.collectionName ?? "") !== (collectionName ?? "") ||
      (nextProps.type ?? "") !== (type ?? "") ||
      (nextProps.size ?? "") !== (size ?? "") ||
      (nextProps.description ?? "") !== (description ?? "")
    ) {
      return true;
    }

    return false;
  }

  /**
   * Setup lazy image loading with Intersection Observer
   */
  /**
   * Setup lazy image loading with Intersection Observer
   * Only loads image when it's about to be visible
   */
  private setupLazyImageLoading(): void {
    this.cleanupIntersectionObserver();

    // If image is already loaded, skip observer
    if (this.state.imageLoaded) {
      return;
    }

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      const imageElement = this.imageRef.current || 
        (document.querySelector(`[data-bouquet-id="${this.props._id}"]`) as HTMLImageElement);
      
      if (!imageElement) {
        // If element not found, load immediately as fallback
        this.checkImageLoad();
        return;
      }

      // Only setup observer if image has data-src (not loaded yet)
      if (imageElement.dataset.src) {
        this.intersectionObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                // Load the image
                const img = entry.target as HTMLImageElement;
                if (img.dataset.src) {
                  img.src = img.dataset.src;
                  img.removeAttribute("data-src");
                  this.checkImageLoad();
                }
                this.cleanupIntersectionObserver();
              }
            });
          },
          {
            // Optimized rootMargin: larger on desktop for better perceived performance
            // Smaller on mobile to save bandwidth
            rootMargin: window.innerWidth >= 768 ? "100px" : "50px",
            threshold: 0.01,
          }
        );

        this.intersectionObserver.observe(imageElement);
      } else {
        // Image src already set, just check load
        this.checkImageLoad();
      }
    });
  }

  private cleanupIntersectionObserver(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
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
    const { _id, name, price, status, customPenanda = [], isNewEdition = false, isFeatured = false } =
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
        {/* Media Section - Using reusable BouquetCardMedia component */}
        <div className={`${this.baseClass}__media`}>
          <BouquetCardMedia
            imageUrl={imageUrl}
            imageAlt={formatBouquetName(name)}
            detailHref={detailHref}
            imageLoaded={imageLoaded}
            imageError={imageError}
            onImageLoad={this.handleImageLoad}
            onImageError={this.handleImageError}
            imageRef={this.imageRef}
            bouquetId={_id}
          />

          {/* Badges - Using reusable BouquetCardBadges component */}
          <BouquetCardBadges
            isFeatured={isFeatured}
            isNewEdition={isNewEdition}
            status={status}
            statusLabel={statusLabel}
          />

          {/* Quick Actions - Using reusable BouquetCardActions component */}
          <BouquetCardActions
            isFavorited={isFavorited}
            showQuickActions={showQuickActions}
            onFavoriteToggle={this.handleFavoriteToggle}
            onAddToCart={this.handleAddToCart}
            onQuickOrder={this.handleQuickOrder}
            onMouseEnter={() => this.setState({ showQuickActions: true })}
            onMouseLeave={() => this.setState({ showQuickActions: false })}
          />
        </div>

        {/* Body Section - Using reusable BouquetCardBody component */}
        <BouquetCardBody
          name={name}
          price={price}
          detailHref={detailHref}
          tags={tags}
          customPenanda={customPenanda}
        />
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
