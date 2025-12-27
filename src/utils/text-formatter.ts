/**
 * Text formatting utilities for consistent text display
 */

/**
 * Convert string to Title Case (Every Word Capitalized)
 * Handles special cases like "and", "or", "the" (can be lowercase in middle)
 * 
 * @param text - The text to convert
 * @param options - Formatting options
 * @returns Title cased string
 */
export function toTitleCase(
  text: string | null | undefined,
  options: {
    keepLowercaseWords?: string[]; // Words to keep lowercase (e.g., "and", "or", "the")
    forceUpperCase?: string[]; // Words to always uppercase (e.g., "ID", "API")
  } = {}
): string {
  if (!text || typeof text !== "string") return "";

  const {
    keepLowercaseWords = ["and", "or", "the", "a", "an", "in", "on", "at", "to", "for", "of", "with", "by"],
    forceUpperCase = ["id", "api", "url", "http", "https", "www"],
  } = options;

  // Split by spaces, hyphens, and other separators
  const words = text
    .trim()
    .split(/\s+|[-_]/)
    .filter((word) => word.length > 0);

  return words
    .map((word, index) => {
      const lowerWord = word.toLowerCase();
      const upperWord = word.toUpperCase();

      // First word is always capitalized
      if (index === 0) {
        if (forceUpperCase.includes(lowerWord)) {
          return upperWord;
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }

      // Check if should be forced uppercase
      if (forceUpperCase.includes(lowerWord)) {
        return upperWord;
      }

      // Check if should be kept lowercase (but not first word)
      if (keepLowercaseWords.includes(lowerWord)) {
        return lowerWord;
      }

      // Default: capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

/**
 * Format bouquet name to Title Case
 */
export function formatBouquetName(name: string | null | undefined): string {
  return toTitleCase(name, {
    keepLowercaseWords: ["and", "or", "the", "of"],
    forceUpperCase: [],
  });
}

/**
 * Format collection name to Title Case
 */
export function formatCollectionName(name: string | null | undefined): string {
  return toTitleCase(name);
}

/**
 * Format bouquet type to Title Case
 */
export function formatBouquetType(type: string | null | undefined): string {
  return toTitleCase(type);
}

/**
 * Format bouquet size to Title Case
 */
export function formatBouquetSize(size: string | null | undefined): string {
  if (!size) return "";
  // Handle sizes like "Extra-Small" -> "Extra Small"
  return toTitleCase(size.replace(/-/g, " "));
}

/**
 * Format tag/category to Title Case
 */
export function formatTag(tag: string | null | undefined): string {
  return toTitleCase(tag);
}

/**
 * Format occasion to Title Case
 */
export function formatOccasion(occasion: string | null | undefined): string {
  return toTitleCase(occasion);
}

/**
 * Format flower name to Title Case
 */
export function formatFlowerName(flower: string | null | undefined): string {
  return toTitleCase(flower);
}

/**
 * Format description - capitalize first letter only
 */
export function formatDescription(description: string | null | undefined): string {
  if (!description) return "";
  return description.charAt(0).toUpperCase() + description.slice(1);
}

/**
 * Format all bouquet data consistently
 */
export function formatBouquetData(data: {
  name?: string | null;
  type?: string | null;
  size?: string | null;
  collectionName?: string | null;
  description?: string | null;
  occasions?: string[];
  flowers?: string[];
  customPenanda?: string[];
}): {
  name: string;
  type: string;
  size: string;
  collectionName: string;
  description: string;
  occasions: string[];
  flowers: string[];
  customPenanda: string[];
} {
  return {
    name: formatBouquetName(data.name) || "",
    type: formatBouquetType(data.type) || "",
    size: formatBouquetSize(data.size) || "",
    collectionName: formatCollectionName(data.collectionName) || "",
    description: formatDescription(data.description) || "",
    occasions: (data.occasions || []).map(formatOccasion).filter(Boolean),
    flowers: (data.flowers || []).map(formatFlowerName).filter(Boolean),
    customPenanda: (data.customPenanda || []).map(formatTag).filter(Boolean),
  };
}

