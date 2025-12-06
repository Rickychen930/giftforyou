import { Request, Response } from "express";
import { Collection } from "../models/collection-model";

export const createCollection = async (req: Request, res: Response) => {
  try {
    const collection = await Collection.create(req.body);
    res.status(201).json(collection);
  } catch (err) {
    res.status(400).json({ error: "Failed to create collection" });
  }
};

export const getCollections = async (_req: Request, res: Response) => {
  const collections = await Collection.find().populate("bouquets");
  res.json(collections);
};
