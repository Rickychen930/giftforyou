import { STORE_PROFILE } from "../config/store-profile";

type SeoInput = {
  title: string;
  description?: string;
  path?: string; // used for canonical when provided
  noIndex?: boolean;
  ogImagePath?: string; // e.g. "/images/logo.png"
};

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

  const robots = input.noIndex ? "noindex, nofollow" : "index, follow";
  ensureMetaByName("robots").setAttribute("content", robots);

  // Canonical
  const canonical = input.path ? new URL(input.path, origin).toString() : origin;
  setCanonical(canonical);

  // OpenGraph + Twitter
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
    STORE_PROFILE.brand.name
  );
  ensureMetaByProperty("og:locale").setAttribute("content", "id_ID");
  ensureMetaByProperty("og:url").setAttribute("content", canonical);
  ensureMetaByProperty("og:type").setAttribute("content", "website");

  const ogImage = input.ogImagePath
    ? new URL(input.ogImagePath, origin).toString()
    : new URL(STORE_PROFILE.brand.logoPath, origin).toString();
  ensureMetaByProperty("og:image").setAttribute("content", ogImage);

  ensureMetaByName("twitter:card").setAttribute("content", "summary_large_image");
  ensureMetaByName("twitter:title").setAttribute(
    "content",
    title || `${STORE_PROFILE.brand.name} | ${STORE_PROFILE.brand.tagline}`
  );
  ensureMetaByName("twitter:description").setAttribute(
    "content",
    description || STORE_PROFILE.brand.description
  );
  ensureMetaByName("twitter:image").setAttribute("content", ogImage);

  // JSON-LD (runtime; best-effort on SPA)
  // Includes WebSite + LocalBusiness to help local SEO.
  setJsonLd({
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
  });
}
