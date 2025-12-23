export const BOUQUET_SIZES = [
  "Extra-Small",
  "Small",
  "Medium",
  "Large",
  "Extra-Large",
  "Jumbo",
] as const;

export type BouquetSize = (typeof BOUQUET_SIZES)[number];

export const BOUQUET_SIZE_OPTIONS: ReadonlyArray<{
  label: string;
  value: BouquetSize;
}> = [
  { label: "Extra small", value: "Extra-Small" },
  { label: "Small", value: "Small" },
  { label: "Medium", value: "Medium" },
  { label: "Large", value: "Large" },
  { label: "Extra large", value: "Extra-Large" },
  { label: "Jumbo", value: "Jumbo" },
] as const;

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

/**
 * Returns a stable, UI-friendly size list:
 * - Always includes all known sizes (so Filter matches Uploader/Editor)
 * - Appends any unknown sizes found in data (future-proof)
 */
export const getBouquetSizeFilterOptions = (
  sizesFromData: Array<string | null | undefined>
): string[] => {
  const known = [...BOUQUET_SIZES];

  const extrasSeen = new Set<string>();
  const extras: string[] = [];

  for (const s of sizesFromData) {
    if (!isNonEmptyString(s)) continue;
    if ((known as readonly string[]).includes(s)) continue;
    if (extrasSeen.has(s)) continue;
    extrasSeen.add(s);
    extras.push(s);
  }

  return [...known, ...extras];
};
