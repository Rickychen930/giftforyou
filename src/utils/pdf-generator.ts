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
  
  // Add decorative dots
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
 * Generate PDF for a collection with optional watermark - LUXURY VERSION
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
  let yPos = margin;
  let currentPage = 1;
  const totalPages = Math.ceil(bouquets.length / 3) + 1; // Approximate, will be updated

  // Helper function to add new page if needed
  const checkNewPage = (requiredHeight: number): void => {
    if (yPos + requiredHeight > pageHeight - margin - 15) {
      addPageFooter(doc, pageWidth, pageHeight, margin);
      doc.addPage();
      currentPage++;
      yPos = addPageHeader(doc, pageWidth, margin, currentPage, totalPages);
    }
  };

  // ============================================================
  // LUXURY COVER PAGE
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

  // Decorative overlay pattern
  doc.setFillColor(255, 255, 255, 0.05);
  for (let i = 0; i < 20; i++) {
    const x = (pageWidth / 20) * i;
    const y = (pageHeight / 20) * (i % 2 === 0 ? 0 : 1);
    doc.circle(x, y, 2, "F");
  }

  // Main title with elegant styling
  doc.setFontSize(42);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  const titleText = collectionName;
  const titleWidth = doc.getTextWidth(titleText);
  const titleX = (pageWidth - titleWidth) / 2;
  const titleY = pageHeight / 2 - 25;
  
  // Text shadow effect (draw multiple times with slight offset)
  doc.setTextColor(0, 0, 0, 0.2);
  doc.text(titleText, titleX + 0.5, titleY + 0.5);
  doc.setTextColor(255, 255, 255);
  doc.text(titleText, titleX, titleY);

  // Elegant subtitle
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(255, 255, 255, 0.9);
  const subtitleText = "Luxury Collection Catalog";
  const subtitleWidth = doc.getTextWidth(subtitleText);
  doc.text(subtitleText, (pageWidth - subtitleWidth) / 2, titleY + 12);

  // Date with elegant formatting
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255, 0.8);
  const dateText = new Date().toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dateWidth = doc.getTextWidth(dateText);
  doc.text(dateText, (pageWidth - dateWidth) / 2, titleY + 20);

  // Brand watermark on cover (subtle)
  if (withWatermark) {
    doc.setTextColor(255, 255, 255, 0.08);
    doc.setFontSize(72);
    doc.setFont("helvetica", "bold");
    const watermarkText = "giftforyou.idn";
    const watermarkWidth = doc.getTextWidth(watermarkText);
    doc.text(
      watermarkText,
      (pageWidth - watermarkWidth) / 2,
      pageHeight / 2 + 35,
      { angle: 45 }
    );
  }

  // Decorative border
  doc.setDrawColor(255, 255, 255, 0.3);
  doc.setLineWidth(1);
  doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin, "S");

  // ============================================================
  // CONTENT PAGES
  // ============================================================
  
  doc.addPage();
  currentPage++;
  yPos = addPageHeader(doc, pageWidth, margin, currentPage, totalPages);

  // Process each bouquet with luxury styling
  for (let i = 0; i < bouquets.length; i++) {
    const bouquet = bouquets[i];

    // Check if we need a new page
    checkNewPage(85);

    // ============================================================
    // BOUQUET IMAGE WITH ELEGANT FRAME
    // ============================================================
    
    try {
      const imageUrl = bouquet.image
        ? bouquet.image.startsWith("http")
          ? bouquet.image
          : `${API_BASE}${bouquet.image}`
        : null;

      if (imageUrl) {
        const img = new Image();
        img.crossOrigin = "anonymous";

        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Image load timeout"));
          }, 10000);
          
          img.onload = () => {
            clearTimeout(timeout);
            resolve();
          };
          img.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("Failed to load image"));
          };
          img.src = imageUrl;
        });

        // Calculate image dimensions with elegant aspect ratio
        const maxImageWidth = contentWidth;
        const maxImageHeight = 65;
        let imgWidth = img.width;
        let imgHeight = img.height;
        const aspectRatio = imgWidth / imgHeight;

        if (imgWidth > maxImageWidth) {
          imgWidth = maxImageWidth;
          imgHeight = imgWidth / aspectRatio;
        }
        if (imgHeight > maxImageHeight) {
          imgHeight = maxImageHeight;
          imgWidth = imgHeight * aspectRatio;
        }

        // Convert image to data URL
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = canvas.toDataURL("image/jpeg", 0.85);

          // Elegant frame around image
          const framePadding = 2;
          const frameX = margin - framePadding;
          const frameY = yPos - framePadding;
          const frameWidth = imgWidth + framePadding * 2;
          const frameHeight = imgHeight + framePadding * 2;
          
          // Frame shadow
          doc.setFillColor(0, 0, 0, 0.1);
          if (typeof (doc as any).roundedRect === "function") {
            (doc as any).roundedRect(frameX + 1, frameY + 1, frameWidth, frameHeight, 2, 2, "F");
          } else {
            doc.rect(frameX + 1, frameY + 1, frameWidth, frameHeight, "F");
          }
          
          // Frame border
          doc.setDrawColor(BRAND_COLORS.rose300[0], BRAND_COLORS.rose300[1], BRAND_COLORS.rose300[2]);
          doc.setLineWidth(0.5);
          if (typeof (doc as any).roundedRect === "function") {
            (doc as any).roundedRect(frameX, frameY, frameWidth, frameHeight, 2, 2, "S");
          } else {
            doc.rect(frameX, frameY, frameWidth, frameHeight, "S");
          }

          // Add image
          doc.addImage(imageData, "JPEG", margin, yPos, imgWidth, imgHeight);

          // Watermark overlay on image if enabled
          if (withWatermark) {
            // Semi-transparent overlay
            doc.setFillColor(0, 0, 0, 0.3);
            doc.rect(margin, yPos + imgHeight - 8, imgWidth, 8, "F");
            
            // Brand watermark
            doc.setTextColor(255, 255, 255, 0.9);
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            const watermarkText = "giftforyou.idn";
            doc.text(watermarkText, margin + 3, yPos + imgHeight - 2);
            
            // Price watermark
            const priceText = formatIDR(bouquet.price);
            const priceWidth = doc.getTextWidth(priceText);
            doc.text(priceText, margin + imgWidth - priceWidth - 3, yPos + imgHeight - 2);
          }

          yPos += imgHeight + 8;
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Failed to load image for bouquet:", bouquet.name, err);
    }

    // ============================================================
    // BOUQUET NAME WITH ELEGANT TYPOGRAPHY
    // ============================================================
    
    doc.setTextColor(BRAND_COLORS.ink900[0], BRAND_COLORS.ink900[1], BRAND_COLORS.ink900[2]);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    const nameText = bouquet.name;
    doc.text(nameText, margin, yPos);

    yPos += 8;

    // ============================================================
    // BADGES WITH LUXURY STYLING
    // ============================================================
    
    if (bouquet.isFeatured || bouquet.isNewEdition) {
      let badgeX = margin;
      if (bouquet.isFeatured) {
        const featuredBadge = drawBadge(doc, badgeX, yPos, "⭐ FEATURED", true);
        badgeX += featuredBadge.width + 3;
      }
      if (bouquet.isNewEdition) {
        drawBadge(doc, badgeX, yPos, "✨ NEW", false);
      }
      yPos += 7;
    }

    // ============================================================
    // PRICE WITH ELEGANT STYLING
    // ============================================================
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(BRAND_COLORS.rose700[0], BRAND_COLORS.rose700[1], BRAND_COLORS.rose700[2]);
    const priceText = formatIDR(bouquet.price);
    doc.text(priceText, margin, yPos);

    yPos += 12;

    // Elegant divider between bouquets
    if (i < bouquets.length - 1) {
      drawDivider(doc, margin, yPos, contentWidth);
      yPos += 8;
    }
  }

  // Add footer to last page
  addPageFooter(doc, pageWidth, pageHeight, margin);

  // Save PDF with elegant filename
  const dateStr = new Date().toISOString().split("T")[0];
  const filename = `${collectionName.replace(/[^a-z0-9]/gi, "_")}_Collection_${dateStr}.pdf`;
  doc.save(filename);
}

/**
 * Generate PDF for a single bouquet with optional watermark - LUXURY VERSION
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

  // Helper function to add new page if needed
  const checkNewPage = (requiredHeight: number): void => {
    if (yPos + requiredHeight > pageHeight - margin - 15) {
      addPageFooter(doc, pageWidth, pageHeight, margin);
      doc.addPage();
      currentPage++;
      yPos = addPageHeader(doc, pageWidth, margin, currentPage, totalPages);
    }
  };

  // Page header
  yPos = addPageHeader(doc, pageWidth, margin, currentPage, totalPages);

  // ============================================================
  // MAIN IMAGE WITH LUXURY PRESENTATION
  // ============================================================
  
  try {
    const imageUrl = bouquet.image
      ? bouquet.image.startsWith("http")
        ? bouquet.image
        : `${API_BASE}${bouquet.image}`
      : null;

    if (imageUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Image load timeout"));
        }, 10000);
        
        img.onload = () => {
          clearTimeout(timeout);
          resolve();
        };
        img.onerror = () => {
          clearTimeout(timeout);
          reject(new Error("Failed to load image"));
        };
        img.src = imageUrl;
      });

      // Calculate image dimensions
      const maxImageWidth = contentWidth;
      const maxImageHeight = 130;
      let imgWidth = img.width;
      let imgHeight = img.height;
      const aspectRatio = imgWidth / imgHeight;

      if (imgWidth > maxImageWidth) {
        imgWidth = maxImageWidth;
        imgHeight = imgWidth / aspectRatio;
      }
      if (imgHeight > maxImageHeight) {
        imgHeight = maxImageHeight;
        imgWidth = imgHeight * aspectRatio;
      }

      // Convert image to data URL
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg", 0.85);

        // Luxury frame
        const framePadding = 3;
        const frameX = margin - framePadding;
        const frameY = yPos - framePadding;
        const frameWidth = imgWidth + framePadding * 2;
        const frameHeight = imgHeight + framePadding * 2;
        
        // Frame shadow
        doc.setFillColor(0, 0, 0, 0.12);
        if (typeof (doc as any).roundedRect === "function") {
          (doc as any).roundedRect(frameX + 1.5, frameY + 1.5, frameWidth, frameHeight, 3, 3, "F");
        } else {
          doc.rect(frameX + 1.5, frameY + 1.5, frameWidth, frameHeight, "F");
        }
        
        // Frame border (double border effect)
        doc.setDrawColor(BRAND_COLORS.rose400[0], BRAND_COLORS.rose400[1], BRAND_COLORS.rose400[2]);
        doc.setLineWidth(0.8);
        if (typeof (doc as any).roundedRect === "function") {
          (doc as any).roundedRect(frameX, frameY, frameWidth, frameHeight, 3, 3, "S");
        } else {
          doc.rect(frameX, frameY, frameWidth, frameHeight, "S");
        }
        
        doc.setDrawColor(BRAND_COLORS.rose600[0], BRAND_COLORS.rose600[1], BRAND_COLORS.rose600[2]);
        doc.setLineWidth(0.3);
        if (typeof (doc as any).roundedRect === "function") {
          (doc as any).roundedRect(frameX + 0.5, frameY + 0.5, frameWidth - 1, frameHeight - 1, 2.5, 2.5, "S");
        } else {
          doc.rect(frameX + 0.5, frameY + 0.5, frameWidth - 1, frameHeight - 1, "S");
        }

        // Add image
        doc.addImage(imageData, "JPEG", margin, yPos, imgWidth, imgHeight);

        // Watermark overlay if enabled
        if (withWatermark) {
          // Elegant overlay
          doc.setFillColor(0, 0, 0, 0.35);
          doc.rect(margin, yPos + imgHeight - 10, imgWidth, 10, "F");
          
          // Brand watermark
          doc.setTextColor(255, 255, 255, 0.95);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          const watermarkText = "giftforyou.idn";
          doc.text(watermarkText, margin + 4, yPos + imgHeight - 3);
          
          // Price watermark
          doc.setFontSize(10);
          const priceText = formatIDR(bouquet.price);
          const priceWidth = doc.getTextWidth(priceText);
          doc.text(priceText, margin + imgWidth - priceWidth - 4, yPos + imgHeight - 3);
        }

        yPos += imgHeight + 12;
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Failed to load image for bouquet:", bouquet.name, err);
  }

  // ============================================================
  // BOUQUET NAME - LUXURY TYPOGRAPHY
  // ============================================================
  
  doc.setTextColor(BRAND_COLORS.ink900[0], BRAND_COLORS.ink900[1], BRAND_COLORS.ink900[2]);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  const nameText = bouquet.name;
  doc.text(nameText, margin, yPos);

  yPos += 10;

  // ============================================================
  // BADGES
  // ============================================================
  
  if (bouquet.isFeatured || bouquet.isNewEdition) {
    let badgeX = margin;
    if (bouquet.isFeatured) {
      const featuredBadge = drawBadge(doc, badgeX, yPos, "⭐ FEATURED", true);
      badgeX += featuredBadge.width + 4;
    }
    if (bouquet.isNewEdition) {
      drawBadge(doc, badgeX, yPos, "✨ NEW EDITION", false);
    }
    yPos += 8;
  }

  // ============================================================
  // PRICE - ELEGANT DISPLAY
  // ============================================================
  
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(BRAND_COLORS.rose700[0], BRAND_COLORS.rose700[1], BRAND_COLORS.rose700[2]);
  const priceText = formatIDR(bouquet.price);
  doc.text(priceText, margin, yPos);

  yPos += 12;

  // Elegant divider
  drawDivider(doc, margin, yPos, contentWidth);
  yPos += 10;

  // ============================================================
  // DESCRIPTION
  // ============================================================
  
  if (bouquet.description) {
    checkNewPage(25);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(BRAND_COLORS.ink700[0], BRAND_COLORS.ink700[1], BRAND_COLORS.ink700[2]);
    const descriptionLines = doc.splitTextToSize(bouquet.description, contentWidth);
    doc.text(descriptionLines, margin, yPos);
    yPos += descriptionLines.length * 5 + 8;
  }

  // ============================================================
  // METADATA SECTION - ELEGANT LAYOUT
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
    checkNewPage(20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(BRAND_COLORS.ink900[0], BRAND_COLORS.ink900[1], BRAND_COLORS.ink900[2]);
    doc.text("Detail Produk", margin, yPos);
    yPos += 6;
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(BRAND_COLORS.ink700[0], BRAND_COLORS.ink700[1], BRAND_COLORS.ink700[2]);
    metadata.forEach((item) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${item.label}:`, margin, yPos);
      const labelWidth = doc.getTextWidth(`${item.label}:`);
      doc.setFont("helvetica", "normal");
      doc.text(item.value, margin + labelWidth + 3, yPos);
      yPos += 6;
    });
    yPos += 4;
  }

  // ============================================================
  // OCCASIONS - ELEGANT PRESENTATION
  // ============================================================
  
  if (bouquet.occasions && bouquet.occasions.length > 0) {
    checkNewPage(20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(BRAND_COLORS.ink900[0], BRAND_COLORS.ink900[1], BRAND_COLORS.ink900[2]);
    doc.text("Sesuai Untuk", margin, yPos);
    yPos += 6;
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(BRAND_COLORS.ink700[0], BRAND_COLORS.ink700[1], BRAND_COLORS.ink700[2]);
    const occasionsText = bouquet.occasions.join(" • ");
    const occasionsLines = doc.splitTextToSize(occasionsText, contentWidth);
    doc.text(occasionsLines, margin, yPos);
    yPos += occasionsLines.length * 5 + 8;
  }

  // ============================================================
  // FLOWERS - ELEGANT PRESENTATION
  // ============================================================
  
  if (bouquet.flowers && bouquet.flowers.length > 0) {
    checkNewPage(20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(BRAND_COLORS.ink900[0], BRAND_COLORS.ink900[1], BRAND_COLORS.ink900[2]);
    doc.text("Komposisi Bunga", margin, yPos);
    yPos += 6;
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(BRAND_COLORS.ink700[0], BRAND_COLORS.ink700[1], BRAND_COLORS.ink700[2]);
    const flowersText = bouquet.flowers.join(" • ");
    const flowersLines = doc.splitTextToSize(flowersText, contentWidth);
    doc.text(flowersLines, margin, yPos);
    yPos += flowersLines.length * 5 + 8;
  }

  // ============================================================
  // BRAND FOOTER
  // ============================================================
  
  if (withWatermark) {
    checkNewPage(15);
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
