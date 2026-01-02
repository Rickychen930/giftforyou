import { STORE_PROFILE } from "../config/store-profile";

export type SeoData = {
  title: string;
  description?: string;
  keywords?: string; // comma-separated keywords
  path?: string; // used for canonical when provided
  noIndex?: boolean;
  ogImagePath?: string; // e.g. "/images/logo.png"
  structuredData?: unknown; // Additional structured data
};

type SeoInput = SeoData;

const ensureMetaByName = (name: string): HTMLMetaElement => {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  return el;
};

const ensureMetaByProperty = (property: string): HTMLMetaElement => {
  let el = document.querySelector(
    `meta[property="${property}"]`
  ) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  return el;
};

const setCanonical = (href: string) => {
  let link = document.querySelector(
    'link[rel="canonical"]'
  ) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
};

const setJsonLd = (json: unknown) => {
  const id = "seo-jsonld";
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.text = JSON.stringify(json);
};

export function setSeo(input: SeoInput): void {
  if (typeof document === "undefined") return;

  const origin = window.location.origin;
  const title = (input.title ?? "").trim();
  const description = (input.description ?? "").trim();

  if (title) document.title = title;

  if (description) {
    ensureMetaByName("description").setAttribute("content", description);
  }

  // Keywords meta tag
  if (input.keywords) {
    ensureMetaByName("keywords").setAttribute("content", input.keywords);
  }

  // Geo-location meta tags for local SEO
  ensureMetaByName("geo.region").setAttribute("content", "ID-JB"); // Jawa Barat
  ensureMetaByName("geo.placename").setAttribute("content", "Cirebon");
  ensureMetaByName("geo.position").setAttribute(
    "content",
    `${STORE_PROFILE.location.geo.latitude};${STORE_PROFILE.location.geo.longitude}`
  );
  ensureMetaByName("ICBM").setAttribute(
    "content",
    `${STORE_PROFILE.location.geo.latitude}, ${STORE_PROFILE.location.geo.longitude}`
  );

  const robots = input.noIndex ? "noindex, nofollow" : "index, follow";
  ensureMetaByName("robots").setAttribute("content", robots);

  // Canonical
  const canonical = input.path ? new URL(input.path, origin).toString() : origin;
  setCanonical(canonical);

  // OpenGraph (for social sharing - Facebook, LinkedIn, etc.)
  ensureMetaByProperty("og:title").setAttribute(
    "content",
    title || `${STORE_PROFILE.brand.name} | ${STORE_PROFILE.brand.tagline}`
  );
  ensureMetaByProperty("og:description").setAttribute(
    "content",
    description || STORE_PROFILE.brand.description
  );
  ensureMetaByProperty("og:site_name").setAttribute(
    "content",
    STORE_PROFILE.brand.displayName
  );
  ensureMetaByProperty("og:locale").setAttribute("content", "id_ID");
  ensureMetaByProperty("og:url").setAttribute("content", canonical);
  ensureMetaByProperty("og:type").setAttribute("content", "website");

  const ogImage = input.ogImagePath
    ? new URL(input.ogImagePath, origin).toString()
    : new URL(STORE_PROFILE.brand.logoPath, origin).toString();
  ensureMetaByProperty("og:image").setAttribute("content", ogImage);

  // JSON-LD (runtime; best-effort on SPA)
  // Includes WebSite + LocalBusiness to help local SEO.
  const baseStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: STORE_PROFILE.brand.name,
        url: origin,
        potentialAction: {
          "@type": "SearchAction",
          target: `${origin}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        name: STORE_PROFILE.brand.name,
        url: origin,
        logo: new URL(STORE_PROFILE.brand.logoPath, origin).toString(),
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: STORE_PROFILE.contact.phoneE164,
            contactType: "customer service",
            availableLanguage: ["id"],
          },
        ],
        sameAs: [
          STORE_PROFILE.whatsapp.url,
          STORE_PROFILE.location.maps.placeUrl,
          STORE_PROFILE.location.maps.shareUrl,
        ],
      },
      {
        "@type": "Florist",
        name: STORE_PROFILE.brand.name,
        url: origin,
        image: ogImage,
        description: STORE_PROFILE.brand.description,
        telephone: STORE_PROFILE.contact.phoneDisplay,
        hasMap: STORE_PROFILE.location.maps.placeUrl,
        geo: {
          "@type": "GeoCoordinates",
          latitude: STORE_PROFILE.location.geo.latitude,
          longitude: STORE_PROFILE.location.geo.longitude,
        },
        identifier: {
          "@type": "PropertyValue",
          propertyID: "plus_code",
          value: STORE_PROFILE.location.plusCode,
        },
        areaServed: {
          "@type": "City",
          name: "Cirebon",
        },
        address: {
          "@type": "PostalAddress",
          streetAddress: STORE_PROFILE.location.streetAddress,
          addressSubLocality: STORE_PROFILE.location.subLocality,
          addressLocality: STORE_PROFILE.location.locality,
          addressRegion: STORE_PROFILE.location.region,
          postalCode: STORE_PROFILE.location.postalCode,
          addressCountry: STORE_PROFILE.location.countryCode,
        },
        sameAs: [
          STORE_PROFILE.whatsapp.url,
          STORE_PROFILE.location.maps.placeUrl,
          STORE_PROFILE.location.maps.shareUrl,
        ],
      },
    ],
  };

  // Merge with additional structured data if provided
  if (input.structuredData) {
    if (Array.isArray(baseStructuredData["@graph"])) {
      baseStructuredData["@graph"].push(input.structuredData as any);
    }
  }

  setJsonLd(baseStructuredData);
}

/**
 * Enhanced SEO: Add breadcrumb structured data
 */
export function setBreadcrumbSeo(items: Array<{ name: string; url: string }>): void {
  if (typeof document === "undefined" || items.length === 0) return;

  const origin = window.location.origin;
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : new URL(item.url, origin).toString(),
    })),
  };

  const id = "seo-breadcrumb";
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.text = JSON.stringify(breadcrumbData);
}

/**
 * Enhanced SEO: Add FAQ structured data
 */
export function setFaqSeo(faqs: Array<{ question: string; answer: string }>): void {
  if (typeof document === "undefined" || faqs.length === 0) return;

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const id = "seo-faq";
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.text = JSON.stringify(faqData);
}

/**
 * Enhanced SEO: Add review/rating structured data
 */
export function setReviewSeo(reviews: Array<{
  author: string;
  rating: number;
  reviewBody?: string;
  datePublished?: string;
}>): void {
  if (typeof document === "undefined" || reviews.length === 0) return;

  const origin = window.location.origin;
  const aggregateRating = reviews.length > 0
    ? {
        "@type": "AggregateRating",
        ratingValue: (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1),
        reviewCount: reviews.length,
        bestRating: "5",
        worstRating: "1",
      }
    : undefined;

  const reviewData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": origin,
    aggregateRating,
    review: reviews.map((r) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: r.author,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating.toString(),
        bestRating: "5",
        worstRating: "1",
      },
      reviewBody: r.reviewBody || "",
      datePublished: r.datePublished || new Date().toISOString(),
    })),
  };

  const id = "seo-review";
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.text = JSON.stringify(reviewData);
}

/**
 * Enhanced SEO: Add video structured data
 */
export function setVideoSeo(video: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  contentUrl?: string;
  embedUrl?: string;
}): void {
  if (typeof document === "undefined") return;

  const origin = window.location.origin;
  const videoData = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl.startsWith("http")
      ? video.thumbnailUrl
      : new URL(video.thumbnailUrl, origin).toString(),
    uploadDate: video.uploadDate,
    ...(video.contentUrl && {
      contentUrl: video.contentUrl.startsWith("http")
        ? video.contentUrl
        : new URL(video.contentUrl, origin).toString(),
    }),
    ...(video.embedUrl && {
      embedUrl: video.embedUrl.startsWith("http")
        ? video.embedUrl
        : new URL(video.embedUrl, origin).toString(),
    }),
  };

  const id = "seo-video";
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.text = JSON.stringify(videoData);
}

/**
 * Enhanced SEO: Add article/blog post structured data
 */
export function setArticleSeo(article: {
  headline: string;
  description: string;
  image?: string;
  author?: string;
  datePublished: string;
  dateModified?: string;
}): void {
  if (typeof document === "undefined") return;

  const origin = window.location.origin;
  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.headline,
    description: article.description,
    ...(article.image && {
      image: article.image.startsWith("http")
        ? article.image
        : new URL(article.image, origin).toString(),
    }),
    ...(article.author && {
      author: {
        "@type": "Person",
        name: article.author,
      },
    }),
    publisher: {
      "@type": "Organization",
      name: STORE_PROFILE.brand.name,
      logo: {
        "@type": "ImageObject",
        url: new URL(STORE_PROFILE.brand.logoPath, origin).toString(),
      },
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
  };

  const id = "seo-article";
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.text = JSON.stringify(articleData);
}

/**
 * Enhanced SEO: Set hreflang tags for multilingual support
 */
export function setHreflangSeo(languages: Array<{ lang: string; url: string }>): void {
  if (typeof document === "undefined" || languages.length === 0) return;

  const origin = window.location.origin;
  languages.forEach((lang) => {
    const link = document.createElement("link");
    link.setAttribute("rel", "alternate");
    link.setAttribute("hreflang", lang.lang);
    link.setAttribute(
      "href",
      lang.url.startsWith("http") ? lang.url : new URL(lang.url, origin).toString()
    );
    document.head.appendChild(link);
  });
}

/**
 * Enhanced SEO: Add preconnect and dns-prefetch for performance
 */
export function setResourceHints(domains: string[]): void {
  if (typeof document === "undefined" || domains.length === 0) return;

  domains.forEach((domain) => {
    // Preconnect for critical resources
    const preconnect = document.createElement("link");
    preconnect.setAttribute("rel", "preconnect");
    preconnect.setAttribute("href", domain);
    preconnect.setAttribute("crossorigin", "anonymous");
    document.head.appendChild(preconnect);

    // DNS prefetch as fallback
    const dnsPrefetch = document.createElement("link");
    dnsPrefetch.setAttribute("rel", "dns-prefetch");
    dnsPrefetch.setAttribute("href", domain);
    document.head.appendChild(dnsPrefetch);
  });
}
