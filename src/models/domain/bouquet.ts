// src/models/domain/bouquet.ts

export type BouquetStatus = "ready" | "preorder";

export interface Bouquet {
  _id: string;
  name: string;
  description?: string;

  price: number;

  type?: string;
  size?: string;

  occasions: string[];
  flowers: string[];

  image?: string;

  status: BouquetStatus;
  quantity?: number;

  collectionName?: string;

  isNewEdition: boolean;
  isFeatured: boolean;

  careInstructions?: string;

  createdAt?: string;
  updatedAt?: string;
}
