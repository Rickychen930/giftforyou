// src/models/bouquet-editor-model.ts
// Business logic model for bouquet editor form
// Handles validation, image processing, form data building, and utility functions

/// <reference lib="dom" />

import { API_BASE } from "../config/api";
import { formatIDR } from "../utils/money";
import type { BouquetSize } from "../constants/bouquet-constants";
import type { Bouquet } from "./domain/bouquet";

export type BouquetStatus = "ready" | "preorder";

export interface FormState {
  _id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  size: BouquetSize;
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

export type SaveStatus = "idle" | "success" | "error";

// Default options for dropdowns
export const DEFAULT_COLLECTIONS = [
  "Best Sellers",
  "Wedding Collection",
  "Sympathy Flowers",
  "New Edition",
  "Featured",
  "Special Occasions",
];

export const DEFAULT_TYPES = [
  "bouquet",
  "gift box",
  "stand acrylic",
  "artificial bouquet",
  "fresh flowers",
  "custom arrangement",
];

export const DEFAULT_STOCK_LEVELS = [
  "0",
  "1",
  "5",
  "10",
  "20",
  "50",
  "100",
  "200",
  "500",
  "1000",
];

export const FALLBACK_IMAGE = "/images/placeholder-bouquet.jpg";

/**
 * Utility: Build preview URL from image path
 */
export function buildPreviewUrl(preview: string): string {
  if (!preview) return "";
  if (preview.startsWith("blob:")) return preview;
  if (preview.startsWith("http://") || preview.startsWith("https://"))
    return preview;

  const normalized = preview.startsWith("/") ? preview : `/${preview}`;

  // IMPORTANT:
  // API_BASE can be "" or "/api" in production -> not valid base for new URL().
  // Use current site origin as base when API_BASE is relative.
  if (!API_BASE || API_BASE.startsWith("/")) {
    return new URL(normalized, window.location.origin).toString();
  }

  // If API_BASE is absolute (e.g. https://api.example.com), this is valid.
  return new URL(normalized, API_BASE).toString();
}

/**
 * Utility: Format price using IDR format
 */
export const formatPrice = formatIDR;

/**
 * Utility: Join array or string to CSV format
 */
export function joinCsv(list: unknown): string {
  if (!Array.isArray(list)) return "";
  return list
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean)
    .join(", ");
}

/**
 * Utility: Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const idx = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const val = bytes / Math.pow(1024, idx);
  return `${val.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}

/**
 * Utility: Format price preview
 */
export function formatPricePreview(price: number): string {
  if (!Number.isFinite(price) || price <= 0) return "";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Utility: Get character count CSS class
 */
export function getCharacterCountClass(current: number, max: number): string {
  if (current >= max) return "becHint--error";
  if (current >= max * 0.9) return "becHint--warning";
  return "";
}

/**
 * Initialize form state from bouquet data
 */
export function initializeFormState(bouquet: Bouquet): FormState {
  return {
    _id: bouquet._id,
    name: bouquet.name ?? "",
    description: bouquet.description ?? "",
    price: Number.isFinite(bouquet.price) ? bouquet.price : 0,
    type: bouquet.type ?? "",
    size: (bouquet.size as BouquetSize) || "Medium",
    status: bouquet.status === "preorder" ? "preorder" : "ready",
    collectionName: bouquet.collectionName ?? "",
    quantity: typeof bouquet.quantity === "number" ? bouquet.quantity : 0,
    occasionsText: joinCsv(bouquet.occasions),
    occasions: Array.isArray(bouquet.occasions)
      ? bouquet.occasions
      : bouquet.occasions
        ? joinCsv(bouquet.occasions)
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
    flowersText: joinCsv(bouquet.flowers),
    flowers: Array.isArray(bouquet.flowers)
      ? bouquet.flowers
      : bouquet.flowers
        ? joinCsv(bouquet.flowers)
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
    isNewEdition: Boolean(bouquet.isNewEdition),
    isFeatured: Boolean(bouquet.isFeatured),
    customPenanda: Array.isArray(bouquet.customPenanda)
      ? bouquet.customPenanda
      : [],
    newPenandaInput: "",
    careInstructions: bouquet.careInstructions ?? "",
  };
}

/**
 * Validation: Validate a single field
 */
export function validateField(name: string, value: unknown): string | null {
  switch (name) {
    case "name": {
      const str = String(value).trim();
      if (str.length < 2) return "Nama minimal 2 karakter.";
      if (str.length > 100) return "Nama maksimal 100 karakter.";
      return null;
    }
    case "price": {
      const num = Number(value);
      if (!Number.isFinite(num) || num <= 0) return "Harga harus lebih dari 0.";
      if (num > 1000000000) return "Harga terlalu besar (maksimal 1 miliar).";
      return null;
    }
    case "size": {
      if (!value || String(value).trim() === "") return "Silakan pilih ukuran.";
      return null;
    }
    case "description": {
      const str = String(value).trim();
      if (str.length > 500) return "Deskripsi maksimal 500 karakter.";
      return null;
    }
    case "collectionName": {
      const str = String(value).trim();
      if (str.length > 100) return "Nama koleksi maksimal 100 karakter.";
      return null;
    }
    case "careInstructions": {
      const str = String(value).trim();
      if (str.length > 300) return "Instruksi perawatan maksimal 300 karakter.";
      return null;
    }
    case "occasionsText": {
      const str = String(value).trim();
      if (str) {
        const items = str.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
        if (items.length > 10) return "Maksimal 10 acara.";
      }
      return null;
    }
    case "flowersText": {
      const str = String(value).trim();
      if (str) {
        const items = str.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
        if (items.length > 20) return "Maksimal 20 jenis bunga.";
      }
      return null;
    }
    case "quantity": {
      const num = Number(value);
      if (!Number.isFinite(num) || num < 0) return "Stok tidak boleh negatif.";
      if (num > 100000) return "Stok terlalu besar (maksimal 100.000).";
      return null;
    }
    default:
      return null;
  }
}

/**
 * Validation: Validate entire form
 */
export function validateForm(form: FormState): string | null {
  const nameErr = validateField("name", form.name);
  if (nameErr) return nameErr;
  const priceErr = validateField("price", form.price);
  if (priceErr) return priceErr;
  const sizeErr = validateField("size", form.size);
  if (sizeErr) return sizeErr;
  if (form.status !== "ready" && form.status !== "preorder")
    return "Status tidak valid.";
  if (form.customPenanda.length > 10)
    return "Maksimal 10 penanda kustom.";
  return null;
}

/**
 * Check if form is dirty (has changes)
 */
export function isFormDirty(
  form: FormState,
  initialForm: FormState,
  hasFile: boolean
): boolean {
  if (hasFile) return true;
  return (
    form.name !== initialForm.name ||
    (form.description ?? "") !== (initialForm.description ?? "") ||
    form.price !== initialForm.price ||
    (form.type ?? "") !== (initialForm.type ?? "") ||
    form.size !== initialForm.size ||
    form.status !== initialForm.status ||
    (form.collectionName ?? "") !== (initialForm.collectionName ?? "") ||
    form.quantity !== initialForm.quantity ||
    (form.occasionsText ?? "") !== (initialForm.occasionsText ?? "") ||
    JSON.stringify(form.occasions) !== JSON.stringify(initialForm.occasions) ||
    (form.flowersText ?? "") !== (initialForm.flowersText ?? "") ||
    JSON.stringify(form.flowers) !== JSON.stringify(initialForm.flowers) ||
    Boolean(form.isNewEdition) !== Boolean(initialForm.isNewEdition) ||
    Boolean(form.isFeatured) !== Boolean(initialForm.isFeatured) ||
    JSON.stringify(form.customPenanda) !==
      JSON.stringify(initialForm.customPenanda) ||
    (form.careInstructions ?? "") !== (initialForm.careInstructions ?? "")
  );
}

/**
 * Image validation: Check if file is acceptable image format
 */
export function isAcceptableImage(file: File): boolean {
  const name = (file.name ?? "").toLowerCase();
  const type = (file.type ?? "").toLowerCase();

  if (type.startsWith("image/")) {
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ];
    if (validTypes.includes(type)) return true;
  }

  const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];
  return validExtensions.some((ext) => name.endsWith(ext));
}

/**
 * Image processing: Compress image file
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.85
): Promise<{ file: File; dimensions: { width: number; height: number } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob: Blob | null) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: file.type || "image/jpeg",
              lastModified: Date.now(),
            });
            resolve({
              file: compressedFile,
              dimensions: { width, height },
            });
          },
          file.type || "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Build FormData from form state and file
 */
export function buildFormData(form: FormState, file: File | null): FormData {
  const fd = new FormData();

  // ID for update
  fd.append("_id", form._id);

  // Image (only if new file is selected)
  if (file) {
    fd.append("image", file);
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
 * Validate penanda input
 */
export function validatePenandaInput(
  input: string,
  existingPenanda: string[]
): { valid: boolean; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, error: "Nama penanda tidak boleh kosong." };
  }

  if (existingPenanda.length >= 10) {
    return { valid: false, error: "Maksimal 10 penanda kustom." };
  }

  const lowerTrimmed = trimmed.toLowerCase();
  if (existingPenanda.some((p) => p.toLowerCase() === lowerTrimmed)) {
    return {
      valid: false,
      error: "Penanda ini sudah ada (tidak case-sensitive).",
    };
  }

  if (trimmed.length < 2) {
    return { valid: false, error: "Nama penanda minimal 2 karakter." };
  }

  if (trimmed.length > 30) {
    return { valid: false, error: "Nama penanda maksimal 30 karakter." };
  }

  const validPattern = /^[a-zA-Z0-9\s\-_.!?()]+$/;
  if (!validPattern.test(trimmed)) {
    return {
      valid: false,
      error:
        "Penanda hanya boleh mengandung huruf, angka, spasi, dan tanda baca umum (koma tidak diperbolehkan).",
    };
  }

  if (trimmed.includes(",")) {
    return { valid: false, error: "Koma (,) tidak diperbolehkan dalam penanda." };
  }

  return { valid: true };
}

/**
 * Format error message for user-friendly display
 */
export function formatErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Gagal menyimpan. Silakan coba lagi.";
  }

  const errorMessage = error.message;

  // Provide user-friendly error messages for common errors
  if (
    errorMessage.includes("EACCES") ||
    errorMessage.includes("EPERM") ||
    errorMessage.includes("PERMISSION_DENIED") ||
    errorMessage.includes("izin")
  ) {
    return "Tidak memiliki izin untuk menyimpan file. Silakan hubungi administrator untuk memperbaiki izin direktori uploads.";
  } else if (
    errorMessage.includes("ENOSPC") ||
    errorMessage.includes("INSUFFICIENT_STORAGE") ||
    errorMessage.includes("penuh")
  ) {
    return "Ruang penyimpanan penuh. Silakan hapus file lama atau hubungi administrator.";
  } else if (errorMessage.includes("timeout") || errorMessage.includes("Timeout")) {
    return "Save timeout. Silakan coba lagi.";
  } else if (
    errorMessage.includes("NetworkError") ||
    errorMessage.includes("Failed to fetch")
  ) {
    return "Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi.";
  } else if (errorMessage.includes("413") || errorMessage.includes("too large")) {
    return "File gambar terlalu besar. Maksimal 8MB. Silakan pilih file yang lebih kecil.";
  } else if (
    errorMessage.includes("415") ||
    errorMessage.includes("Unsupported Media Type")
  ) {
    return "Format file tidak didukung. Silakan gunakan JPG, PNG, WEBP, atau HEIC.";
  }

  return errorMessage || "Gagal menyimpan. Silakan coba lagi.";
}

