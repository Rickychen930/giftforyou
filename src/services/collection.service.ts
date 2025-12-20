// src/services/collection.service.ts

import type { Collection } from "../models/domain/collection";

const API_BASE_URL = "http://localhost:4000";

export async function getCollections(
  signal?: AbortSignal
): Promise<Collection[]> {
  const res = await fetch(`${API_BASE_URL}/api/collections`, { signal });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch collections (${res.status}): ${text}`);
  }

  const data = (await res.json()) as Collection[];
  return Array.isArray(data) ? data : [];
}
