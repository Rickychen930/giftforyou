// src/models/domain/collection.ts
// Shared domain type (NO mongoose). Matches your Collection schema fields.

import type { Bouquet } from "./bouquet";

export interface Collection {
  _id: string;
  name: string;
  description?: string;

  // If your API populates bouquets -> Bouquet[]
  // If not populated -> string[] (ObjectId strings)
  bouquets: Bouquet[] | string[];

  createdAt?: string;
  updatedAt?: string;
}
