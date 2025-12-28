import jsPDF from "jspdf";
import { formatIDR } from "./money";
import { API_BASE } from "../config/api";

/**
 * Generate PDF for a collection with optional watermark
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
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;

  // Helper function to add new page if needed
  const checkNewPage = (requiredHeight: number): void => {
    if (yPos + requiredHeight > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
  };

  // Cover page
  doc.setFillColor(212, 140, 156); // Brand rose color
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Title on cover
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  const titleText = collectionName;
  const titleWidth = doc.getTextWidth(titleText);
  doc.text(titleText, (pageWidth - titleWidth) / 2, pageHeight / 2 - 20);

  // Subtitle
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  const subtitleText = "Collection Catalog";
  const subtitleWidth = doc.getTextWidth(subtitleText);
  doc.text(subtitleText, (pageWidth - subtitleWidth) / 2, pageHeight / 2);

  // Date
  doc.setFontSize(12);
  const dateText = new Date().toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dateWidth = doc.getTextWidth(dateText);
  doc.text(dateText, (pageWidth - dateWidth) / 2, pageHeight / 2 + 15);

  // Brand watermark on cover
  if (withWatermark) {
    doc.setTextColor(255, 255, 255, 0.1);
    doc.setFontSize(60);
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

  // Add new page for bouquets
  doc.addPage();
  yPos = margin;
  doc.setTextColor(0, 0, 0);

  // Process each bouquet
  for (let i = 0; i < bouquets.length; i++) {
    const bouquet = bouquets[i];

    // Check if we need a new page
    checkNewPage(80); // Approximate height for one bouquet

    // Load and add image
    try {
      const imageUrl = bouquet.image
        ? bouquet.image.startsWith("http")
          ? bouquet.image
          : `${API_BASE}${bouquet.image}`
        : null;

      if (imageUrl) {
        // Create a temporary image element to load the image
        const img = new Image();
        img.crossOrigin = "anonymous";

        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Image load timeout"));
          }, 10000); // 10 second timeout for image loading
          
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

        // Calculate image dimensions to fit in content width
        const maxImageWidth = contentWidth;
        const maxImageHeight = 60; // mm
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

        // Convert image to data URL using canvas
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = canvas.toDataURL("image/jpeg", 0.8);

          // Add image to PDF
          doc.addImage(imageData, "JPEG", margin, yPos, imgWidth, imgHeight);

          // Add watermark overlay on image if enabled
          if (withWatermark) {
            doc.setTextColor(255, 255, 255, 0.7);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            const watermarkText = "giftforyou.idn";
            doc.text(watermarkText, margin + 2, yPos + imgHeight - 2);
            
            // Add price watermark
            doc.setFontSize(9);
            const priceText = formatIDR(bouquet.price);
            const priceWidth = doc.getTextWidth(priceText);
            doc.text(priceText, margin + imgWidth - priceWidth - 2, yPos + imgHeight - 2);
          }

          yPos += imgHeight + 5;
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Failed to load image for bouquet:", bouquet.name, err);
      // Continue without image
    }

    // Add bouquet name
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const nameText = bouquet.name;
    doc.text(nameText, margin, yPos);

    yPos += 7;

    // Add badges if applicable
    if (bouquet.isFeatured || bouquet.isNewEdition) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const badges: string[] = [];
      if (bouquet.isFeatured) badges.push("Featured");
      if (bouquet.isNewEdition) badges.push("New");
      doc.text(badges.join(" • "), margin, yPos);
      yPos += 5;
    }

    // Add price
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const priceText = formatIDR(bouquet.price);
    doc.text(priceText, margin, yPos);

    yPos += 10; // Space between bouquets

    // Add page break if we're near the bottom
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = margin;
    }
  }

  // Save PDF
  const filename = `${collectionName.replace(/[^a-z0-9]/gi, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}

/**
 * Generate PDF for a single bouquet with optional watermark
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
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;

  // Helper function to add new page if needed
  const checkNewPage = (requiredHeight: number): void => {
    if (yPos + requiredHeight > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
  };

  // Load and add main image
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
        }, 10000); // 10 second timeout for image loading
        
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

      // Calculate image dimensions to fit in content width
      const maxImageWidth = contentWidth;
      const maxImageHeight = 120; // mm
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

      // Convert image to data URL using canvas
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg", 0.8);

        // Add image to PDF
        doc.addImage(imageData, "JPEG", margin, yPos, imgWidth, imgHeight);

        // Add watermark overlay on image if enabled
        if (withWatermark) {
          doc.setTextColor(255, 255, 255, 0.7);
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          const watermarkText = "giftforyou.idn";
          doc.text(watermarkText, margin + 2, yPos + imgHeight - 2);

          // Add price watermark
          doc.setFontSize(10);
          const priceText = formatIDR(bouquet.price);
          doc.text(priceText, margin + imgWidth - doc.getTextWidth(priceText) - 2, yPos + imgHeight - 2);
        }

        yPos += imgHeight + 10;
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Failed to load image for bouquet:", bouquet.name, err);
  }

  // Add bouquet name
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const nameText = bouquet.name;
  doc.text(nameText, margin, yPos);

  yPos += 8;

  // Add badges if applicable
  if (bouquet.isFeatured || bouquet.isNewEdition) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const badges: string[] = [];
    if (bouquet.isFeatured) badges.push("Featured");
    if (bouquet.isNewEdition) badges.push("New");
    doc.text(badges.join(" • "), margin, yPos);
    yPos += 6;
  }

  // Add price
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  const priceText = formatIDR(bouquet.price);
  doc.text(priceText, margin, yPos);

  yPos += 10;

  // Add details
  if (bouquet.description) {
    checkNewPage(20);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const descriptionLines = doc.splitTextToSize(bouquet.description, contentWidth);
    doc.text(descriptionLines, margin, yPos);
    yPos += descriptionLines.length * 5 + 5;
  }

  // Add metadata
  const metadata: string[] = [];
  if (bouquet.type) metadata.push(`Type: ${bouquet.type}`);
  if (bouquet.size) metadata.push(`Size: ${bouquet.size}`);
  if (bouquet.status) metadata.push(`Status: ${bouquet.status}`);

  if (metadata.length > 0) {
    checkNewPage(15);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(metadata.join(" • "), margin, yPos);
    yPos += 8;
  }

  // Add occasions
  if (bouquet.occasions && bouquet.occasions.length > 0) {
    checkNewPage(15);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Occasions:", margin, yPos);
    yPos += 5;
    doc.setFont("helvetica", "normal");
    doc.text(bouquet.occasions.join(", "), margin, yPos);
    yPos += 8;
  }

  // Add flowers
  if (bouquet.flowers && bouquet.flowers.length > 0) {
    checkNewPage(15);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Flowers:", margin, yPos);
    yPos += 5;
    doc.setFont("helvetica", "normal");
    doc.text(bouquet.flowers.join(", "), margin, yPos);
    yPos += 8;
  }

  // Add brand watermark at bottom if enabled
  if (withWatermark) {
    doc.setTextColor(200, 200, 200, 0.3);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const watermarkText = "giftforyou.idn";
    doc.text(watermarkText, margin, pageHeight - margin);
  }

  // Save PDF
  const filename = `${bouquet.name.replace(/[^a-z0-9]/gi, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}

