import React from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Autoplay,
  Navigation,
  Pagination,
  EffectFade,
  A11y,
} from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "../../styles/HeroCollectionSlider.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

type HeroSlide = {
  id: string;
  badge?: string;
  title: string;
  subtitle?: string;
  image: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

type HeroSliderContent = {
  heading?: string;
  slides: HeroSlide[];
};

interface HeroCollectionSliderProps {
  content?: HeroSliderContent;
}

const defaultContent: HeroSliderContent = {
  heading: "New Collections",
  slides: [
    {
      id: "orchid-luxe",
      badge: "NEW ARRIVAL",
      title: "Orchid Luxe Collection",
      subtitle: "Premium orchids with elegant wrapping—perfect for gifting.",
      image: "/images/hero/orchid-luxe.jpg",
      primaryCta: { label: "Shop Collection", href: "/collection" },
      secondaryCta: {
        label: "Order via WhatsApp",
        href: "https://wa.me/6285161428911",
      },
    },
    {
      id: "seasonal-blooms",
      badge: "SEASONAL",
      title: "Seasonal Blooms",
      subtitle: "Fresh picks curated weekly by our florist.",
      image: "/images/hero/seasonal.jpg",
      primaryCta: { label: "Explore Bouquets", href: "/collection" },
      secondaryCta: {
        label: "Custom Request",
        href: "https://wa.me/6285161428911",
      },
    },
    {
      id: "special-gifts",
      badge: "BEST SELLER",
      title: "Flowers & Gifts",
      subtitle: "Make it special with add-ons: cards, chocolates, and more.",
      image: "/images/hero/gifts.jpg",
      primaryCta: { label: "Browse Collection", href: "/collection" },
      secondaryCta: {
        label: "Contact Us",
        href: "https://wa.me/6285161428911",
      },
    },
  ],
};

const isExternal = (href: string) => /^https?:\/\//i.test(href);

/**
 * ✅ Fix for uploaded images:
 * - if image is "/uploads/..." -> serve from backend API_BASE
 * - if image is "/images/..."  -> serve from frontend public folder (keep as-is)
 * - if image is "http..."      -> keep as-is
 */
const resolveImageSrc = (image: string) => {
  const v = (image ?? "").trim();
  if (!v) return "/images/placeholder-bouquet.jpg";
  if (isExternal(v)) return v;

  if (v.startsWith("/uploads/")) {
    return `${API_BASE}${v}`;
  }

  // Default: assume it's a normal public asset (/images/...)
  return v;
};

const Cta: React.FC<{
  href: string;
  className: string;
  children: React.ReactNode;
}> = ({ href, className, children }) => {
  if (isExternal(href)) {
    return (
      <a
        className={className}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }
  return (
    <Link className={className} to={href}>
      {children}
    </Link>
  );
};

const HeroCollectionSlider: React.FC<HeroCollectionSliderProps> = ({
  content,
}) => {
  const data = content ?? defaultContent;

  return (
    <section className="hero" aria-label="Featured collections">
      {data.heading && <p className="hero__kicker">{data.heading}</p>}

      <Swiper
        modules={[Autoplay, Navigation, Pagination, EffectFade, A11y]}
        effect="fade"
        slidesPerView={1}
        loop
        speed={900}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 4800,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        a11y={{ enabled: true }}
        className="hero__swiper"
        aria-roledescription="carousel"
        aria-label="Hero collections slider"
      >
        {data.slides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <article className="heroSlide" aria-label={slide.title}>
              <img
                className="heroSlide__img"
                src={resolveImageSrc(slide.image)} // ✅ FIXED
                alt={slide.title}
                loading={index === 0 ? "eager" : "lazy"}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/placeholder-bouquet.jpg";
                }}
              />

              <div className="heroSlide__overlay" />
              <div className="heroSlide__glow" aria-hidden="true" />
              <div className="heroSlide__grain" aria-hidden="true" />

              <div className="heroSlide__content">
                {slide.badge && (
                  <div className="heroSlide__badge">{slide.badge}</div>
                )}
                <h1 className="heroSlide__title">{slide.title}</h1>
                {slide.subtitle && (
                  <p className="heroSlide__subtitle">{slide.subtitle}</p>
                )}

                <div className="heroSlide__actions">
                  <Cta
                    href={slide.primaryCta.href}
                    className="heroSlide__btn heroSlide__btn--primary"
                  >
                    {slide.primaryCta.label}
                  </Cta>

                  {slide.secondaryCta && (
                    <Cta
                      href={slide.secondaryCta.href}
                      className="heroSlide__btn heroSlide__btn--secondary"
                    >
                      {slide.secondaryCta.label}
                    </Cta>
                  )}
                </div>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HeroCollectionSlider;
