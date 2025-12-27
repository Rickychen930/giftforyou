/**
 * SEO Analysis utilities
 * Analyzes current page SEO and provides recommendations
 */

export interface SeoAnalysis {
  score: number;
  grade: "excellent" | "good" | "needs-improvement" | "poor";
  checks: SeoCheck[];
  recommendations: string[];
}

export interface SeoCheck {
  name: string;
  status: "pass" | "warning" | "fail";
  message: string;
  value?: string;
  recommendation?: string;
}

/**
 * Analyze current page SEO
 */
export function analyzeSeo(): SeoAnalysis {
  if (typeof document === "undefined") {
    return {
      score: 0,
      grade: "poor",
      checks: [],
      recommendations: [],
    };
  }

  const checks: SeoCheck[] = [];
  let passCount = 0;
  let warningCount = 0;
  let failCount = 0;

  // Title check
  const title = document.title || "";
  if (title.length === 0) {
    checks.push({
      name: "Title Tag",
      status: "fail",
      message: "Title tag is missing",
      recommendation: "Add a descriptive title tag (50-60 characters)",
    });
    failCount++;
  } else if (title.length < 30) {
    checks.push({
      name: "Title Tag",
      status: "warning",
      message: `Title is too short (${title.length} chars)`,
      value: title,
      recommendation: "Title should be 50-60 characters for optimal SEO",
    });
    warningCount++;
  } else if (title.length > 60) {
    checks.push({
      name: "Title Tag",
      status: "warning",
      message: `Title is too long (${title.length} chars)`,
      value: title.substring(0, 60) + "...",
      recommendation: "Title should be 50-60 characters",
    });
    warningCount++;
  } else {
    checks.push({
      name: "Title Tag",
      status: "pass",
      message: `Title is optimal (${title.length} chars)`,
      value: title,
    });
    passCount++;
  }

  // Meta description check
  const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute("content") || "";
  if (metaDesc.length === 0) {
    checks.push({
      name: "Meta Description",
      status: "fail",
      message: "Meta description is missing",
      recommendation: "Add a compelling meta description (150-160 characters)",
    });
    failCount++;
  } else if (metaDesc.length < 120) {
    checks.push({
      name: "Meta Description",
      status: "warning",
      message: `Description is too short (${metaDesc.length} chars)`,
      value: metaDesc,
      recommendation: "Description should be 150-160 characters",
    });
    warningCount++;
  } else if (metaDesc.length > 160) {
    checks.push({
      name: "Meta Description",
      status: "warning",
      message: `Description is too long (${metaDesc.length} chars)`,
      value: metaDesc.substring(0, 160) + "...",
      recommendation: "Description should be 150-160 characters",
    });
    warningCount++;
  } else {
    checks.push({
      name: "Meta Description",
      status: "pass",
      message: `Description is optimal (${metaDesc.length} chars)`,
      value: metaDesc,
    });
    passCount++;
  }

  // Keywords check
  const keywords = document.querySelector('meta[name="keywords"]')?.getAttribute("content") || "";
  if (keywords.length === 0) {
    checks.push({
      name: "Keywords",
      status: "warning",
      message: "Keywords meta tag is missing",
      recommendation: "Add relevant keywords (comma-separated)",
    });
    warningCount++;
  } else {
    const keywordCount = keywords.split(",").length;
    checks.push({
      name: "Keywords",
      status: "pass",
      message: `${keywordCount} keywords found`,
      value: keywords.substring(0, 100) + (keywords.length > 100 ? "..." : ""),
    });
    passCount++;
  }

  // Canonical URL check
  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "";
  if (canonical.length === 0) {
    checks.push({
      name: "Canonical URL",
      status: "warning",
      message: "Canonical URL is missing",
      recommendation: "Add canonical URL to prevent duplicate content",
    });
    warningCount++;
  } else {
    checks.push({
      name: "Canonical URL",
      status: "pass",
      message: "Canonical URL is set",
      value: canonical,
    });
    passCount++;
  }

  // Open Graph check
  const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute("content") || "";
  const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute("content") || "";
  const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute("content") || "";
  
  if (ogTitle && ogDesc && ogImage) {
    checks.push({
      name: "Open Graph Tags",
      status: "pass",
      message: "All Open Graph tags are present",
    });
    passCount++;
  } else {
    const missing = [];
    if (!ogTitle) missing.push("og:title");
    if (!ogDesc) missing.push("og:description");
    if (!ogImage) missing.push("og:image");
    checks.push({
      name: "Open Graph Tags",
      status: "warning",
      message: `Missing: ${missing.join(", ")}`,
      recommendation: "Add all Open Graph tags for better social sharing",
    });
    warningCount++;
  }

  // Structured Data (JSON-LD) check
  const jsonLd = document.querySelector('script[type="application/ld+json"]');
  if (jsonLd) {
    try {
      const data = JSON.parse(jsonLd.textContent || "{}");
      if (data["@context"] === "https://schema.org") {
        checks.push({
          name: "Structured Data",
          status: "pass",
          message: "Schema.org structured data found",
        });
        passCount++;
      } else {
        checks.push({
          name: "Structured Data",
          status: "warning",
          message: "Structured data format may be incorrect",
          recommendation: "Use Schema.org format",
        });
        warningCount++;
      }
    } catch {
      checks.push({
        name: "Structured Data",
        status: "fail",
        message: "Structured data JSON is invalid",
        recommendation: "Fix JSON-LD syntax",
      });
      failCount++;
    }
  } else {
    checks.push({
      name: "Structured Data",
      status: "warning",
      message: "Structured data is missing",
      recommendation: "Add Schema.org structured data (JSON-LD)",
    });
    warningCount++;
  }

  // Robots meta check
  const robots = document.querySelector('meta[name="robots"]')?.getAttribute("content") || "";
  if (robots.includes("noindex")) {
    checks.push({
      name: "Robots Meta",
      status: "warning",
      message: "Page is set to noindex",
      value: robots,
      recommendation: "Remove noindex if you want the page indexed",
    });
    warningCount++;
  } else if (robots) {
    checks.push({
      name: "Robots Meta",
      status: "pass",
      message: "Robots meta is configured",
      value: robots,
    });
    passCount++;
  } else {
    checks.push({
      name: "Robots Meta",
      status: "pass",
      message: "Using default indexing (index, follow)",
    });
    passCount++;
  }

  // Geo-location tags check
  const geoRegion = document.querySelector('meta[name="geo.region"]')?.getAttribute("content") || "";
  const geoPlacename = document.querySelector('meta[name="geo.placename"]')?.getAttribute("content") || "";
  if (geoRegion && geoPlacename) {
    checks.push({
      name: "Geo-location Tags",
      status: "pass",
      message: "Geo-location tags are set",
      value: `${geoPlacename}, ${geoRegion}`,
    });
    passCount++;
  } else {
    checks.push({
      name: "Geo-location Tags",
      status: "warning",
      message: "Geo-location tags are missing",
      recommendation: "Add geo.region and geo.placename for local SEO",
    });
    warningCount++;
  }

  // H1 check
  const h1Count = document.querySelectorAll("h1").length;
  if (h1Count === 0) {
    checks.push({
      name: "H1 Tag",
      status: "fail",
      message: "No H1 tag found",
      recommendation: "Add one H1 tag per page",
    });
    failCount++;
  } else if (h1Count > 1) {
    checks.push({
      name: "H1 Tag",
      status: "warning",
      message: `Multiple H1 tags found (${h1Count})`,
      recommendation: "Use only one H1 tag per page",
    });
    warningCount++;
  } else {
    checks.push({
      name: "H1 Tag",
      status: "pass",
      message: "One H1 tag found",
    });
    passCount++;
  }

  // Image alt text check
  const images = document.querySelectorAll("img");
  const imagesWithoutAlt = Array.from(images).filter((img) => !img.alt);
  if (imagesWithoutAlt.length > 0) {
    checks.push({
      name: "Image Alt Text",
      status: "warning",
      message: `${imagesWithoutAlt.length} images without alt text`,
      recommendation: "Add descriptive alt text to all images",
    });
    warningCount++;
  } else if (images.length > 0) {
    checks.push({
      name: "Image Alt Text",
      status: "pass",
      message: "All images have alt text",
    });
    passCount++;
  }

  // Calculate score (fail counts as 0, warning as 50, pass as 100)
  const totalChecks = checks.length;
  const score = totalChecks > 0
    ? Math.round(((passCount * 100 + warningCount * 50 + failCount * 0) / (totalChecks * 100)) * 100)
    : 0;

  let grade: "excellent" | "good" | "needs-improvement" | "poor";
  if (score >= 90) grade = "excellent";
  else if (score >= 75) grade = "good";
  else if (score >= 50) grade = "needs-improvement";
  else grade = "poor";

  // Generate recommendations
  const recommendations: string[] = [];
  checks.forEach((check) => {
    if (check.status === "fail" || check.status === "warning") {
      if (check.recommendation) {
        recommendations.push(check.recommendation);
      }
    }
  });

  return { score, grade, checks, recommendations };
}

