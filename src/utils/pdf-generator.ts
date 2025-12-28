import jsPDF from "jspdf";
import { formatIDR } from "./money";
import { API_BASE } from "../config/api";
import { STORE_PROFILE } from "../config/store-profile";

// Brand colors (RGB values for jsPDF)
const BRAND_COLORS = {
  rose300: [243, 182, 195],
  rose400: [220, 160, 175],
  rose500: [212, 140, 156],
  rose600: [192, 120, 136],
  rose700: [128, 61, 77],
  wine700: [160, 76, 92],
  sage400: [168, 213, 186],
  neutral0: [255, 255, 255],
  ink900: [47, 47, 47],
  ink700: [70, 70, 70],
  ink600: [100, 100, 100],
  ink500: [128, 128, 128],
};

/**
 * Helper function to load image and convert to data URL
 */
const loadImageAsDataURL = async (imageUrl: string, timeout: number = 10000): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    const timeoutId = setTimeout(() => {
      reject(new Error("Image load timeout"));
    }, timeout);

    img.onload = () => {
      clearTimeout(timeoutId);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      } else {
        reject(new Error("Could not get canvas context"));
      }
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error("Failed to load image"));
    };

    img.src = imageUrl;
  });
};

/**
 * Helper function to draw gradient background
 */
const drawGradientBackground = (
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  color1: number[],
  color2: number[]
): void => {
  // Draw multiple rectangles with varying opacity for gradient effect
  const steps = 20;
  for (let i = 0; i < steps; i++) {
    const ratio = i / steps;
    const r = Math.round(color1[0] + (color2[0] - color1[0]) * ratio);
    const g = Math.round(color1[1] + (color2[1] - color1[1]) * ratio);
    const b = Math.round(color1[2] + (color2[2] - color1[2]) * ratio);
    doc.setFillColor(r, g, b);
    doc.rect(x, y + (height / steps) * i, width, height / steps, "F");
  }
};

/**
 * Helper function to draw elegant divider
 */
const drawDivider = (doc: jsPDF, x: number, y: number, width: number): void => {
  doc.setDrawColor(BRAND_COLORS.rose300[0], BRAND_COLORS.rose300[1], BRAND_COLORS.rose300[2]);
  doc.setLineWidth(0.5);
  doc.line(x, y, x + width, y);
  
  // Add decorative dots using small circles
  doc.setFillColor(BRAND_COLORS.rose500[0], BRAND_COLORS.rose500[1], BRAND_COLORS.rose500[2]);
  const dotSize = 1;
  const spacing = width / 8;
  for (let i = 1; i < 8; i++) {
    doc.circle(x + spacing * i, y, dotSize, "F");
  }
};

/**
 * Helper function to add page header
 */
const addPageHeader = (doc: jsPDF, pageWidth: number, margin: number, pageNum: number, totalPages: number): number => {
  let yPos = margin;
  
  // Brand name with elegant styling
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(BRAND_COLORS.rose700[0], BRAND_COLORS.rose700[1], BRAND_COLORS.rose700[2]);
  const brandText = STORE_PROFILE.brand.name;
  doc.text(brandText, margin, yPos);
  
  // Page number
  const pageText = `${pageNum} / ${totalPages}`;
  const pageTextWidth = doc.getTextWidth(pageText);
  doc.setTextColor(BRAND_COLORS.ink600[0], BRAND_COLORS.ink600[1], BRAND_COLORS.ink600[2]);
  doc.setFont("helvetica", "normal");
  doc.text(pageText, pageWidth - margin - pageTextWidth, yPos);
  
  // Elegant divider
  yPos += 4;
  drawDivider(doc, margin, yPos, pageWidth - 2 * margin);
  
  return yPos + 6;
};

/**
 * Helper function to add page footer
 */
const addPageFooter = (doc: jsPDF, pageWidth: number, pageHeight: number, margin: number): void => {
  const yPos = pageHeight - margin;
  
  // Divider
  drawDivider(doc, margin, yPos - 8, pageWidth - 2 * margin);
  
  // Footer text
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(BRAND_COLORS.ink500[0], BRAND_COLORS.ink500[1], BRAND_COLORS.ink500[2]);
  const footerText = `${STORE_PROFILE.brand.domain} | ${STORE_PROFILE.contact.phoneDisplay}`;
  const footerWidth = doc.getTextWidth(footerText);
  doc.text(footerText, (pageWidth - footerWidth) / 2, yPos - 2);
};

/**
 * Helper function to draw badge
 */
const drawBadge = (
  doc: jsPDF,
  x: number,
  y: number,
  text: string,
  isFeatured: boolean
): { width: number; height: number } => {
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  
  const padding = 2;
  const textWidth = doc.getTextWidth(text);
  const badgeWidth = textWidth + padding * 2;
  const badgeHeight = 5;
  
  // Badge background
  if (isFeatured) {
    doc.setFillColor(255, 215, 0); // Gold for featured
    doc.setTextColor(47, 47, 47);
  } else {
    doc.setFillColor(16, 185, 129); // Green for new
    doc.setTextColor(255, 255, 255);
  }
  
  // Use roundedRect if available, otherwise use regular rect
  if (typeof (doc as any).roundedRect === "function") {
    (doc as any).roundedRect(x, y - badgeHeight + 1, badgeWidth, badgeHeight, 1.5, 1.5, "F");
  } else {
    doc.rect(x, y - badgeHeight + 1, badgeWidth, badgeHeight, "F");
  }
  
  // Badge text
  doc.text(text, x + padding, y - 1);
  
  return { width: badgeWidth, height: badgeHeight };
};

/**
 * Helper function to draw rounded rectangle (fallback if roundedRect not available)
 */
const drawRoundedRect = (
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  mode: "F" | "S" | "FD" | "DF"
): void => {
  // Use regular rectangle if roundedRect is not available
  if (typeof (doc as any).roundedRect === "function") {
    (doc as any).roundedRect(x, y, width, height, radius, radius, mode);
  } else {
    doc.rect(x, y, width, height, mode);
  }
};

/**
 * Generate PDF for a collection with optional watermark - ULTRA LUXURY VERSION
 * Each bouquet gets its own full page with large image and complete information
 */
export async function generateCollectionPDF(
  collectionName: string,
  bouquets: Array<{
    _id: string;
    name: string;
    price: number;
    image?: string;
    isFeatured?: boolean;
    isNewEdition?: boolean;
  }>,
  options: {
    withWatermark?: boolean;
  } = {}
): Promise<void> {
  const { withWatermark = false } = options;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let currentPage = 1;
  const totalPages = bouquets.length + 1; // Cover + one page per bouquet

  // ============================================================
  // ULTRA LUXURY COVER PAGE WITH LOGO
  // ============================================================
  
  // Gradient background
  drawGradientBackground(
    doc,
    0,
    0,
    pageWidth,
    pageHeight,
    BRAND_COLORS.rose500,
    BRAND_COLORS.rose700
  );

  // Decorative overlay pattern (more elegant)
  doc.setFillColor(255, 255, 255, 0.06);
  for (let i = 0; i < 30; i++) {
    const x = (pageWidth / 30) * i;
    const y = (pageHeight / 30) * (i % 3 === 0 ? 0 : i % 3 === 1 ? pageHeight / 2 : pageHeight);
    doc.circle(x, y, 1.5, "F");
  }

  // ============================================================
  // LOGO AT TOP CENTER
  // ============================================================
  
  try {
    const logoUrl = STORE_PROFILE.brand.logoPath.startsWith("http")
      ? STORE_PROFILE.brand.logoPath
      : `${window.location.origin}${STORE_PROFILE.brand.logoPath}`;
    
    try {
      const logoData = await loadImageAsDataURL(logoUrl, 8000);
      const logoSize = 35; // mm
      const logoX = (pageWidth - logoSize) / 2;
      const logoY = margin + 15;
      
      // Logo frame with elegant shadow
      doc.setFillColor(255, 255, 255, 0.2);
      if (typeof (doc as any).roundedRect === "function") {
        (doc as any).roundedRect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4, 8, 8, "F");
      } else {
        doc.rect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4, "F");
      }
      
      // Logo border
      doc.setDrawColor(255, 255, 255, 0.5);
      doc.setLineWidth(1);
      if (typeof (doc as any).roundedRect === "function") {
        (doc as any).roundedRect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4, 8, 8, "S");
      } else {
        doc.rect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4, "S");
      }
      
      // Add logo
      doc.addImage(logoData, "JPEG", logoX, logoY, logoSize, logoSize);
    } catch (logoErr) {
      // Logo failed to load, continue without it
      // eslint-disable-next-line no-console
      console.warn("Logo failed to load for PDF cover:", logoErr);
    }
  } catch (err) {
    // Logo URL construction failed, continue without logo
  }

  // Main title with elegant styling
  doc.setFontSize(44);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  const titleText = collectionName;
  const titleWidth = doc.getTextWidth(titleText);
  const titleX = (pageWidth - titleWidth) / 2;
  const titleY = pageHeight / 2 - 20;
  
  // Text shadow effect (draw multiple times with slight offset for depth)
  doc.setTextColor(0, 0, 0, 0.25);
  doc.text(titleText, titleX + 0.8, titleY + 0.8);
  doc.setTextColor(0, 0, 0, 0.15);
  doc.text(titleText, titleX + 0.4, titleY + 0.4);
  doc.setTextColor(255, 255, 255);
  doc.text(titleText, titleX, titleY);

  // Elegant subtitle with decorative line
  doc.setFontSize(15);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(255, 255, 255, 0.95);
  const subtitleText = "Luxury Collection Catalog";
  const subtitleWidth = doc.getTextWidth(subtitleText);
  const subtitleX = (pageWidth - subtitleWidth) / 2;
  const subtitleY = titleY + 15;
  
  // Decorative line above subtitle
  doc.setDrawColor(255, 255, 255, 0.4);
  doc.setLineWidth(0.5);
  const lineWidth = 40;
  doc.line((pageWidth - lineWidth) / 2, subtitleY - 4, (pageWidth + lineWidth) / 2, subtitleY - 4);
  
  doc.text(subtitleText, subtitleX, subtitleY);

  // Date with elegant formatting
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255, 0.85);
  const dateText = new Date().toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dateWidth = doc.getTextWidth(dateText);
  doc.text(dateText, (pageWidth - dateWidth) / 2, subtitleY + 10);

  // Brand tagline
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255, 0.75);
  const taglineText = STORE_PROFILE.brand.tagline;
  const taglineWidth = doc.getTextWidth(taglineText);
  doc.text(taglineText, (pageWidth - taglineWidth) / 2, subtitleY + 18);

  // Brand watermark on cover (subtle, elegant)
  if (withWatermark) {
    doc.setTextColor(255, 255, 255, 0.06);
    doc.setFontSize(80);
    doc.setFont("helvetica", "bold");
    const watermarkText = "giftforyou.idn";
    const watermarkWidth = doc.getTextWidth(watermarkText);
    doc.text(
      watermarkText,
      (pageWidth - watermarkWidth) / 2,
      pageHeight / 2 + 40,
      { angle: 45 }
    );
  }

  // Elegant decorative border (double border)
  doc.setDrawColor(255, 255, 255, 0.4);
  doc.setLineWidth(1.5);
  doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin, "S");
  
  doc.setDrawColor(255, 255, 255, 0.2);
  doc.setLineWidth(0.5);
  doc.rect(margin + 2, margin + 2, pageWidth - 2 * margin - 4, pageHeight - 2 * margin - 4, "S");

  // ============================================================
  // CONTENT PAGES - ONE BOUQUET PER PAGE (ULTRA LUXURY)
  // ============================================================
  
  // Process each bouquet with luxury styling - each gets full page
  for (let i = 0; i < bouquets.length; i++) {
    const bouquet = bouquets[i];
    
    // Add new page for each bouquet
    if (i > 0) {
      addPageFooter(doc, pageWidth, pageHeight, margin);
      doc.addPage();
    }
    currentPage++;
    let yPos = addPageHeader(doc, pageWidth, margin, currentPage, totalPages);

    // ============================================================
    // BOUQUET IMAGE - LARGE & ELEGANT (CENTERED)
    // ============================================================
    
    try {
      const imageUrl = bouquet.image
        ? bouquet.image.startsWith("http")
          ? bouquet.image
          : `${API_BASE}${bouquet.image}`
        : null;

      if (imageUrl) {
        const imageData = await loadImageAsDataURL(imageUrl, 10000);

        // Calculate image dimensions - larger for single page layout
        const maxImageWidth = contentWidth;
        const maxImageHeight = 145; // Large for luxury presentation
        const img = new Image();
        img.src = imageData;
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Continue even if image fails
        });

        let imgWidth = img.width || maxImageWidth;
        let imgHeight = img.height || maxImageHeight;
        const aspectRatio = imgWidth / imgHeight;

        if (imgWidth > maxImageWidth) {
          imgWidth = maxImageWidth;
          imgHeight = imgWidth / aspectRatio;
        }
        if (imgHeight > maxImageHeight) {
          imgHeight = maxImageHeight;
          imgWidth = imgHeight * aspectRatio;
        }

        // Center image horizontally
        const imageX = (pageWidth - imgWidth) / 2;

        // Luxury frame around image with enhanced shadow
        const framePadding = 5;
        const frameX = imageX - framePadding;
        const frameY = yPos - framePadding;
        const frameWidth = imgWidth + framePadding * 2;
        const frameHeight = imgHeight + framePadding * 2;
        
        // Multiple shadow layers for depth
        doc.setFillColor(0, 0, 0, 0.08);
        drawRoundedRect(doc, frameX + 3, frameY + 3, frameWidth, frameHeight, 4, "F");
        doc.setFillColor(0, 0, 0, 0.12);
        drawRoundedRect(doc, frameX + 2, frameY + 2, frameWidth, frameHeight, 4, "F");
        doc.setFillColor(0, 0, 0, 0.15);
        drawRoundedRect(doc, frameX + 1, frameY + 1, frameWidth, frameHeight, 4, "F");
        
        // Frame border (triple border effect for luxury)
        doc.setDrawColor(BRAND_COLORS.rose300[0], BRAND_COLORS.rose300[1], BRAND_COLORS.rose300[2]);
        doc.setLineWidth(1.2);
        drawRoundedRect(doc, frameX, frameY, frameWidth, frameHeight, 4, "S");
        
        doc.setDrawColor(BRAND_COLORS.rose500[0], BRAND_COLORS.rose500[1], BRAND_COLORS.rose500[2]);
        doc.setLineWidth(0.8);
        drawRoundedRect(doc, frameX + 1, frameY + 1, frameWidth - 2, frameHeight - 2, 3, "S");
        
        doc.setDrawColor(BRAND_COLORS.rose600[0], BRAND_COLORS.rose600[1], BRAND_COLORS.rose600[2]);
        doc.setLineWidth(0.4);
        drawRoundedRect(doc, frameX + 2, frameY + 2, frameWidth - 4, frameHeight - 4, 2, "S");

        // Add image
        doc.addImage(imageData, "JPEG", imageX, yPos, imgWidth, imgHeight);

        // Watermark overlay on image if enabled
        if (withWatermark) {
          // Elegant gradient overlay
          doc.setFillColor(0, 0, 0, 0.4);
          doc.rect(imageX, yPos + imgHeight - 14, imgWidth, 14, "F");
          
          // Brand watermark
          doc.setTextColor(255, 255, 255, 0.98);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          const watermarkText = "giftforyou.idn";
          doc.text(watermarkText, imageX + 5, yPos + imgHeight - 4);
          
          // Price watermark
          doc.setFontSize(10);
          const priceText = formatIDR(bouquet.price);
          const priceWidth = doc.getTextWidth(priceText);
          doc.text(priceText, imageX + imgWidth - priceWidth - 5, yPos + imgHeight - 4);
        }

        yPos += imgHeight + 18;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Failed to load image for bouquet:", bouquet.name, err);
      // Continue with text only
    }

    // ============================================================
    // BOUQUET NAME - LUXURY TYPOGRAPHY (CENTERED)
    // ============================================================
    
    doc.setTextColor(BRAND_COLORS.ink900[0], BRAND_COLORS.ink900[1], BRAND_COLORS.ink900[2]);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    const nameText = bouquet.name;
    const nameWidth = doc.getTextWidth(nameText);
    doc.text(nameText, (pageWidth - nameWidth) / 2, yPos);

    yPos += 12;

    // ============================================================
    // BADGES - CENTERED
    // ============================================================
    
    if (bouquet.isFeatured || bouquet.isNewEdition) {
      let totalBadgeWidth = 0;
      const badges: Array<{ text: string; isFeatured: boolean; width: number }> = [];
      
      if (bouquet.isFeatured) {
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        const badgeText = "⭐ FEATURED";
        const badgeWidth = doc.getTextWidth(badgeText) + 4;
        badges.push({ text: badgeText, isFeatured: true, width: badgeWidth });
        totalBadgeWidth += badgeWidth;
      }
      if (bouquet.isNewEdition) {
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        const badgeText = "✨ NEW";
        const badgeWidth = doc.getTextWidth(badgeText) + 4;
        badges.push({ text: badgeText, isFeatured: false, width: badgeWidth });
        totalBadgeWidth += badgeWidth + 4;
      }
      
      // Center badges
      let badgeX = (pageWidth - totalBadgeWidth) / 2;
      badges.forEach((badge) => {
        const badgeObj = drawBadge(doc, badgeX, yPos, badge.text, badge.isFeatured);
        badgeX += badgeObj.width + 4;
      });
      yPos += 9;
    }

    // ============================================================
    // PRICE - ELEGANT DISPLAY (CENTERED)
    // ============================================================
    
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(BRAND_COLORS.rose700[0], BRAND_COLORS.rose700[1], BRAND_COLORS.rose700[2]);
    const priceText = formatIDR(bouquet.price);
    const priceWidth = doc.getTextWidth(priceText);
    doc.text(priceText, (pageWidth - priceWidth) / 2, yPos);

    yPos += 15;

    // Elegant divider
    drawDivider(doc, margin, yPos, contentWidth);
    yPos += 12;

    // Collection name at bottom (elegant)
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(BRAND_COLORS.ink600[0], BRAND_COLORS.ink600[1], BRAND_COLORS.ink600[2]);
    const collectionText = `Collection: ${collectionName}`;
    const collectionWidth = doc.getTextWidth(collectionText);
    doc.text(collectionText, (pageWidth - collectionWidth) / 2, pageHeight - margin - 15);
  }

  // Add footer to last page
  addPageFooter(doc, pageWidth, pageHeight, margin);

  // Save PDF with elegant filename
  const dateStr = new Date().toISOString().split("T")[0];
  const filename = `${collectionName.replace(/[^a-z0-9]/gi, "_")}_Collection_${dateStr}.pdf`;
  doc.save(filename);
}

/**
 * Generate PDF for a single bouquet with optional watermark - ULTRA LUXURY VERSION
 */
export async function generateBouquetPDF(
  bouquet: {
    _id: string;
    name: string;
    price: number;
    image?: string;
    description?: string;
    type?: string;
    size?: string;
    status?: string;
    isFeatured?: boolean;
    isNewEdition?: boolean;
    occasions?: string[];
    flowers?: string[];
  },
  options: {
    withWatermark?: boolean;
  } = {}
): Promise<void> {
  const { withWatermark = false } = options;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;
  let currentPage = 1;
  const totalPages = 1; // Will be updated if multiple pages needed

  // Page header
  yPos = addPageHeader(doc, pageWidth, margin, currentPage, totalPages);

  // ============================================================
  // MAIN IMAGE - ULTRA LUXURY PRESENTATION (LARGER, CENTERED)
  // ============================================================
  
  try {
    const imageUrl = bouquet.image
      ? bouquet.image.startsWith("http")
        ? bouquet.image
        : `${API_BASE}${bouquet.image}`
      : null;

    if (imageUrl) {
      const imageData = await loadImageAsDataURL(imageUrl, 10000);

      // Calculate image dimensions - larger for luxury presentation
      const maxImageWidth = contentWidth;
      const maxImageHeight = 155; // Larger for single bouquet
      const img = new Image();
      img.src = imageData;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });

      let imgWidth = img.width || maxImageWidth;
      let imgHeight = img.height || maxImageHeight;
      const aspectRatio = imgWidth / imgHeight;

      if (imgWidth > maxImageWidth) {
        imgWidth = maxImageWidth;
        imgHeight = imgWidth / aspectRatio;
      }
      if (imgHeight > maxImageHeight) {
        imgHeight = maxImageHeight;
        imgWidth = imgHeight * aspectRatio;
      }

      // Center image horizontally
      const imageX = (pageWidth - imgWidth) / 2;

      // Ultra luxury frame
      const framePadding = 5;
      const frameX = imageX - framePadding;
      const frameY = yPos - framePadding;
      const frameWidth = imgWidth + framePadding * 2;
      const frameHeight = imgHeight + framePadding * 2;
      
      // Multiple shadow layers for ultra depth
      doc.setFillColor(0, 0, 0, 0.08);
      drawRoundedRect(doc, frameX + 3, frameY + 3, frameWidth, frameHeight, 5, "F");
      doc.setFillColor(0, 0, 0, 0.12);
      drawRoundedRect(doc, frameX + 2, frameY + 2, frameWidth, frameHeight, 5, "F");
      doc.setFillColor(0, 0, 0, 0.18);
      drawRoundedRect(doc, frameX + 1, frameY + 1, frameWidth, frameHeight, 5, "F");
      
      // Frame border (triple border effect)
      doc.setDrawColor(BRAND_COLORS.rose300[0], BRAND_COLORS.rose300[1], BRAND_COLORS.rose300[2]);
      doc.setLineWidth(1.5);
      drawRoundedRect(doc, frameX, frameY, frameWidth, frameHeight, 5, "S");
      
      doc.setDrawColor(BRAND_COLORS.rose500[0], BRAND_COLORS.rose500[1], BRAND_COLORS.rose500[2]);
      doc.setLineWidth(1);
      drawRoundedRect(doc, frameX + 1.5, frameY + 1.5, frameWidth - 3, frameHeight - 3, 4, "S");
      
      doc.setDrawColor(BRAND_COLORS.rose600[0], BRAND_COLORS.rose600[1], BRAND_COLORS.rose600[2]);
      doc.setLineWidth(0.5);
      drawRoundedRect(doc, frameX + 2.5, frameY + 2.5, frameWidth - 5, frameHeight - 5, 3, "S");

      // Add image
      doc.addImage(imageData, "JPEG", imageX, yPos, imgWidth, imgHeight);

      // Watermark overlay if enabled
      if (withWatermark) {
        // Elegant gradient overlay
        doc.setFillColor(0, 0, 0, 0.45);
        doc.rect(imageX, yPos + imgHeight - 14, imgWidth, 14, "F");
        
        // Brand watermark
        doc.setTextColor(255, 255, 255, 0.98);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        const watermarkText = "giftforyou.idn";
        doc.text(watermarkText, imageX + 6, yPos + imgHeight - 4);
        
        // Price watermark
        doc.setFontSize(11);
        const priceText = formatIDR(bouquet.price);
        const priceWidth = doc.getTextWidth(priceText);
        doc.text(priceText, imageX + imgWidth - priceWidth - 6, yPos + imgHeight - 4);
      }

      yPos += imgHeight + 18;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Failed to load image for bouquet:", bouquet.name, err);
  }

  // ============================================================
  // BOUQUET NAME - ULTRA LUXURY TYPOGRAPHY (CENTERED)
  // ============================================================
  
  doc.setTextColor(BRAND_COLORS.ink900[0], BRAND_COLORS.ink900[1], BRAND_COLORS.ink900[2]);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  const nameText = bouquet.name;
  const nameWidth = doc.getTextWidth(nameText);
  doc.text(nameText, (pageWidth - nameWidth) / 2, yPos);

  yPos += 14;

  // ============================================================
  // BADGES - CENTERED
  // ============================================================
  
  if (bouquet.isFeatured || bouquet.isNewEdition) {
    let totalBadgeWidth = 0;
    const badges: Array<{ text: string; isFeatured: boolean; width: number }> = [];
    
    if (bouquet.isFeatured) {
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      const badgeText = "⭐ FEATURED";
      const badgeWidth = doc.getTextWidth(badgeText) + 4;
      badges.push({ text: badgeText, isFeatured: true, width: badgeWidth });
      totalBadgeWidth += badgeWidth;
    }
    if (bouquet.isNewEdition) {
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      const badgeText = "✨ NEW EDITION";
      const badgeWidth = doc.getTextWidth(badgeText) + 4;
      badges.push({ text: badgeText, isFeatured: false, width: badgeWidth });
      totalBadgeWidth += badgeWidth + 5;
    }
    
    // Center badges
    let badgeX = (pageWidth - totalBadgeWidth) / 2;
    badges.forEach((badge) => {
      const badgeObj = drawBadge(doc, badgeX, yPos, badge.text, badge.isFeatured);
      badgeX += badgeObj.width + 5;
    });
    yPos += 11;
  }

  // ============================================================
  // PRICE - ELEGANT DISPLAY (CENTERED)
  // ============================================================
  
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(BRAND_COLORS.rose700[0], BRAND_COLORS.rose700[1], BRAND_COLORS.rose700[2]);
  const priceText = formatIDR(bouquet.price);
  const priceWidth = doc.getTextWidth(priceText);
  doc.text(priceText, (pageWidth - priceWidth) / 2, yPos);

  yPos += 18;

  // Elegant divider
  drawDivider(doc, margin, yPos, contentWidth);
  yPos += 14;

  // ============================================================
  // DESCRIPTION (CENTERED)
  // ============================================================
  
  if (bouquet.description) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(BRAND_COLORS.ink700[0], BRAND_COLORS.ink700[1], BRAND_COLORS.ink700[2]);
    const descriptionLines = doc.splitTextToSize(bouquet.description, contentWidth);
    // Center description
    descriptionLines.forEach((line: string) => {
      const lineWidth = doc.getTextWidth(line);
      doc.text(line, (pageWidth - lineWidth) / 2, yPos);
      yPos += 6.5;
    });
    yPos += 10;
  }

  // ============================================================
  // METADATA SECTION - ELEGANT LAYOUT (CENTERED)
  // ============================================================
  
  const metadata: Array<{ label: string; value: string }> = [];
  if (bouquet.type) metadata.push({ label: "Type", value: bouquet.type });
  if (bouquet.size) metadata.push({ label: "Size", value: bouquet.size });
  if (bouquet.status) {
    metadata.push({
      label: "Status",
      value: bouquet.status === "ready" ? "Siap Dipesan" : "Preorder",
    });
  }

  if (metadata.length > 0) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(BRAND_COLORS.ink900[0], BRAND_COLORS.ink900[1], BRAND_COLORS.ink900[2]);
    const sectionTitle = "Detail Produk";
    const titleWidth = doc.getTextWidth(sectionTitle);
    doc.text(sectionTitle, (pageWidth - titleWidth) / 2, yPos);
    yPos += 9;
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(BRAND_COLORS.ink700[0], BRAND_COLORS.ink700[1], BRAND_COLORS.ink700[2]);
    metadata.forEach((item) => {
      doc.setFont("helvetica", "bold");
      const labelText = `${item.label}:`;
      const labelWidth = doc.getTextWidth(labelText);
      doc.text(labelText, (pageWidth - labelWidth) / 2 - 20, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(item.value, (pageWidth - labelWidth) / 2 + labelWidth - 20 + 6, yPos);
      yPos += 8;
    });
    yPos += 8;
  }

  // ============================================================
  // OCCASIONS - ELEGANT PRESENTATION (CENTERED)
  // ============================================================
  
  if (bouquet.occasions && bouquet.occasions.length > 0) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(BRAND_COLORS.ink900[0], BRAND_COLORS.ink900[1], BRAND_COLORS.ink900[2]);
    const sectionTitle = "Sesuai Untuk";
    const titleWidth = doc.getTextWidth(sectionTitle);
    doc.text(sectionTitle, (pageWidth - titleWidth) / 2, yPos);
    yPos += 9;
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(BRAND_COLORS.ink700[0], BRAND_COLORS.ink700[1], BRAND_COLORS.ink700[2]);
    const occasionsText = bouquet.occasions.join(" • ");
    const occasionsLines = doc.splitTextToSize(occasionsText, contentWidth);
    occasionsLines.forEach((line: string) => {
      const lineWidth = doc.getTextWidth(line);
      doc.text(line, (pageWidth - lineWidth) / 2, yPos);
      yPos += 6.5;
    });
    yPos += 10;
  }

  // ============================================================
  // FLOWERS - ELEGANT PRESENTATION (CENTERED)
  // ============================================================
  
  if (bouquet.flowers && bouquet.flowers.length > 0) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(BRAND_COLORS.ink900[0], BRAND_COLORS.ink900[1], BRAND_COLORS.ink900[2]);
    const sectionTitle = "Komposisi Bunga";
    const titleWidth = doc.getTextWidth(sectionTitle);
    doc.text(sectionTitle, (pageWidth - titleWidth) / 2, yPos);
    yPos += 9;
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(BRAND_COLORS.ink700[0], BRAND_COLORS.ink700[1], BRAND_COLORS.ink700[2]);
    const flowersText = bouquet.flowers.join(" • ");
    const flowersLines = doc.splitTextToSize(flowersText, contentWidth);
    flowersLines.forEach((line: string) => {
      const lineWidth = doc.getTextWidth(line);
      doc.text(line, (pageWidth - lineWidth) / 2, yPos);
      yPos += 6.5;
    });
    yPos += 10;
  }

  // ============================================================
  // BRAND FOOTER
  // ============================================================
  
  if (withWatermark) {
    doc.setTextColor(BRAND_COLORS.ink500[0], BRAND_COLORS.ink500[1], BRAND_COLORS.ink500[2], 0.4);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const brandText = `${STORE_PROFILE.brand.name} - ${STORE_PROFILE.brand.tagline}`;
    const brandWidth = doc.getTextWidth(brandText);
    doc.text(brandText, (pageWidth - brandWidth) / 2, yPos);
  }

  // Add footer
  addPageFooter(doc, pageWidth, pageHeight, margin);

  // Save PDF with elegant filename
  const dateStr = new Date().toISOString().split("T")[0];
  const filename = `${bouquet.name.replace(/[^a-z0-9]/gi, "_")}_${dateStr}.pdf`;
  doc.save(filename);
}
