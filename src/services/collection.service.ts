// src/services/collection.service.ts

import { API_BASE } from "../config/api";
import type { Collection } from "../models/domain/collection";

export async function getCollections(
  signal?: AbortSignal
): Promise<Collection[]> {
  // If API_BASE="" => "/api/collections"
  const url = `${API_BASE}/api/collections`;

  const res = await fetch(url, { signal });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch collections (${res.status}): ${text}`);
  }

  const data = (await res.json()) as unknown;
  return Array.isArray(data) ? (data as Collection[]) : [];
}
