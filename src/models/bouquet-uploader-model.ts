// src/models/bouquet-uploader-model.ts
// Business logic model for bouquet uploader form
// Reuses code from bouquet-editor-model and adds upload-specific logic

import {
  validateField,
  validatePenandaInput,
  isAcceptableImage,
  compressImage,
  formatBytes,
  formatPricePreview,
  getCharacterCountClass,
  DEFAULT_COLLECTIONS,
  DEFAULT_TYPES,
  DEFAULT_STOCK_LEVELS,
  FALLBACK_IMAGE,
  type BouquetStatus,
} from "./bouquet-editor-model";

export const DRAFT_STORAGE_KEY = "bouquet_uploader_draft";
export const AUTO_SAVE_INTERVAL = 2000; // 2 seconds

export interface UploadFormState {
  name: string;
  description: string;
  price: number;
  type: string;
  size: string;
  status: BouquetStatus;
  collectionName: string;
  quantity: number;
  occasionsText: string;
  occasions: string[];
  flowersText: string;
  flowers: string[];
  isNewEdition: boolean;
  isFeatured: boolean;
  customPenanda: string[];
  newPenandaInput: string;
  careInstructions: string;
}

export interface DraftData extends UploadFormState {
  timestamp: number;
}

export type MessageType = "success" | "error" | "";

/**
 * Initialize empty form state
 */
export function initializeEmptyFormState(): UploadFormState {
  return {
    name: "",
    description: "",
    price: 0,
    type: "bouquet",
    size: "Medium",
    status: "ready",
    collectionName: "",
    quantity: 0,
    occasionsText: "",
    occasions: [],
    flowersText: "",
    flowers: [],
    isNewEdition: false,
    isFeatured: false,
    customPenanda: [],
    newPenandaInput: "",
    careInstructions: "",
  };
}

/**
 * Validate entire upload form
 */
export function validateUploadForm(form: UploadFormState, hasFile: boolean): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // Required fields
  const nameErr = validateField("name", form.name);
  if (nameErr) errors.name = nameErr;

  const priceErr = validateField("price", form.price);
  if (priceErr) errors.price = priceErr;

  const sizeErr = validateField("size", form.size);
  if (sizeErr) errors.size = sizeErr;

  // Optional but validated fields
  const descErr = validateField("description", form.description);
  if (descErr) errors.description = descErr;

  const collectionErr = validateField("collectionName", form.collectionName);
  if (collectionErr) errors.collectionName = collectionErr;

  const careErr = validateField("careInstructions", form.careInstructions);
  if (careErr) errors.careInstructions = careErr;

  const occasionsErr = validateField("occasionsText", form.occasionsText);
  if (occasionsErr) errors.occasionsText = occasionsErr;

  const flowersErr = validateField("flowersText", form.flowersText);
  if (flowersErr) errors.flowersText = flowersErr;

  const quantityErr = validateField("quantity", form.quantity);
  if (quantityErr) errors.quantity = quantityErr;

  // Custom penanda validation
  if (form.customPenanda.length > 10) {
    errors.customPenanda = "Maksimal 10 penanda kustom.";
  }

  // Image validation
  if (!hasFile) {
    errors.image = "Gambar wajib diunggah.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Build FormData from upload form state
 */
export function buildUploadFormData(
  form: UploadFormState,
  file: File | null
): FormData {
  const fd = new FormData();

  // Image (required for upload)
  if (file) {
    const maxSize = 8 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error("Ukuran file maksimal 8MB. Silakan pilih file yang lebih kecil.");
    }
    if (!isAcceptableImage(file)) {
      throw new Error("File harus berupa gambar (JPG/PNG/WEBP/HEIC).");
    }
    fd.append("image", file);
  } else {
    throw new Error("Gambar wajib diunggah.");
  }

  // Required fields
  fd.append("name", form.name.trim());
  fd.append("price", String(form.price));
  fd.append("size", form.size);
  fd.append("status", form.status);
  fd.append("collectionName", (form.collectionName || "").trim());

  // Optional fields
  fd.append("description", (form.description || "").trim());
  fd.append("type", (form.type || "").trim());
  fd.append("quantity", String(form.quantity || 0));
  fd.append("careInstructions", (form.careInstructions || "").trim());

  // Arrays - use array if available, otherwise fallback to text
  const occasionsValue =
    form.occasions.length > 0
      ? form.occasions.join(",")
      : (form.occasionsText || "").trim();
  const flowersValue =
    form.flowers.length > 0
      ? form.flowers.join(",")
      : (form.flowersText || "").trim();
  fd.append("occasions", occasionsValue);
  fd.append("flowers", flowersValue);

  // Boolean flags
  fd.append("isNewEdition", String(Boolean(form.isNewEdition)));
  fd.append("isFeatured", String(Boolean(form.isFeatured)));

  // Custom penanda
  fd.append("customPenanda", form.customPenanda.join(","));

  return fd;
}

/**
 * Save draft to localStorage
 */
export function saveDraft(form: UploadFormState): void {
  try {
    const draft: DraftData = {
      ...form,
      timestamp: Date.now(),
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error saving draft:", err);
    }
  }
}

/**
 * Load draft from localStorage
 */
export function loadDraft(): DraftData | null {
  try {
    const draftJson = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!draftJson) return null;

    const draft: DraftData = JSON.parse(draftJson);

    // Only return if draft is recent (less than 7 days old)
    if (draft.timestamp && Date.now() - draft.timestamp < 7 * 24 * 60 * 60 * 1000) {
      return draft;
    } else {
      // Clear old draft
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      return null;
    }
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error loading draft:", err);
    }
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    return null;
  }
}

/**
 * Check if draft exists
 */
export function checkDraftExists(): boolean {
  try {
    return !!localStorage.getItem(DRAFT_STORAGE_KEY);
  } catch {
    return false;
  }
}

/**
 * Clear draft from localStorage
 */
export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error clearing draft:", err);
    }
  }
}

/**
 * Process image file for upload (with compression)
 */
export async function processImageForUpload(
  file: File
): Promise<{
  file: File;
  previewUrl: string;
  dimensions: { width: number; height: number } | null;
}> {
  // Check file size (8MB limit)
  const maxSize = 8 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("Ukuran file maksimal 8MB. Silakan pilih file yang lebih kecil.");
  }

  if (!isAcceptableImage(file)) {
    throw new Error("File harus berupa gambar (JPG/PNG/WEBP/HEIC).");
  }

  let processedFile = file;
  let dimensions: { width: number; height: number } | null = null;

  // Compress image if it's large
  if (file.size > 2 * 1024 * 1024) {
    try {
      const result = await compressImage(file);
      processedFile = result.file;
      dimensions = result.dimensions;
    } catch (compressError) {
      // Image compression failed, using original file
      if (process.env.NODE_ENV === "development") {
        console.warn("Image compression failed, using original:", compressError);
      }
      // Continue with original file if compression fails
    }
  }

  // Create preview URL
  const previewUrl = URL.createObjectURL(processedFile);

  return {
    file: processedFile,
    previewUrl,
    dimensions,
  };
}

// Re-export utilities from bouquet-editor-model
export {
  validateField,
  validatePenandaInput,
  isAcceptableImage,
  compressImage,
  formatBytes,
  formatPricePreview,
  getCharacterCountClass,
  DEFAULT_COLLECTIONS,
  DEFAULT_TYPES,
  DEFAULT_STOCK_LEVELS,
  FALLBACK_IMAGE,
};

