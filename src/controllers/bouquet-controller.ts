import { Request, Response } from "express";
import { Bouquet } from "../models/bouquet-model-real";
import { Collection } from "../models/collection-model";

// Helper validasi
const validateBouquet = (name: string, price: number, status: string) => {
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return "Name must be at least 2 characters.";
  }
  if (price === undefined || Number(price) <= 0) {
    return "Price must be greater than 0.";
  }
  if (!["ready", "preorder"].includes(status)) {
    return "Invalid status.";
  }
  return null;
};

// Create bouquet
export const createBouquet = async (req: Request, res: Response) => {
  try {
    const {
      name,
      price,
      status = "ready",
      description = "",
      type = "",
      size = "",
      collectionName = "",
    } = req.body;

    const error = validateBouquet(name, Number(price), status);
    if (error) return res.status(400).json({ error });

    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const bouquet = await Bouquet.create({
      name: name.trim(),
      price: Number(price),
      status,
      description,
      type,
      size,
      image,
      collectionName,
    });

    if (collectionName) {
      await Collection.findOneAndUpdate(
        { name: collectionName },
        { $addToSet: { bouquets: bouquet._id } },
        { upsert: true, new: true }
      );
    }

    res.status(201).json({ bouquet });
  } catch (err) {
    console.error("❌ Failed to create bouquet:", err);
    res.status(500).json({ error: "Failed to create bouquet" });
  }
};

// Get all bouquets
export const getBouquets = async (_req: Request, res: Response) => {
  try {
    const bouquets = await Bouquet.find().lean();
    res.json(bouquets);
  } catch (err) {
    console.error("❌ Failed to fetch bouquets:", err);
    res.status(500).json({ error: "Failed to fetch bouquets" });
  }
};

// Update bouquet
export const updateBouquet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bouquet = await Bouquet.findById(id);
    if (!bouquet) return res.status(404).json({ error: "Bouquet not found" });

    const updatedData: any = { ...req.body };
    if (req.file) updatedData.image = `/uploads/${req.file.filename}`;

    // Validasi khusus
    if (updatedData.status && !["ready", "preorder"].includes(updatedData.status)) {
      return res.status(400).json({ error: "Invalid status." });
    }
    if (updatedData.price && Number(updatedData.price) <= 0) {
      return res.status(400).json({ error: "Price must be greater than 0." });
    }

    const allowedFields = [
      "name",
      "description",
      "price",
      "type",
      "size",
      "image",
      "status",
      "collectionName",
    ];

    allowedFields.forEach((f) => {
      if (updatedData[f] !== undefined) {
        (bouquet as any)[f] = updatedData[f];
      }
    });

    await bouquet.save();

    if (updatedData.collectionName) {
      await Collection.findOneAndUpdate(
        { name: updatedData.collectionName },
        { $addToSet: { bouquets: bouquet._id } },
        { upsert: true, new: true }
      );
    }

    res.json({ message: "Bouquet updated successfully", bouquet });
  } catch (err) {
    console.error("❌ Update bouquet failed:", err);
    res.status(500).json({ error: "Failed to update bouquet" });
  }
};

// Delete bouquet
export const deleteBouquet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bouquet = await Bouquet.findByIdAndDelete(id);
    if (!bouquet) return res.status(404).json({ error: "Bouquet not found" });

    if (bouquet.collectionName) {
      await Collection.updateOne(
        { name: bouquet.collectionName },
        { $pull: { bouquets: bouquet._id } }
      );
    }

    res.json({ message: "Bouquet deleted successfully", bouquet });
  } catch (err) {
    console.error("❌ Delete bouquet failed:", err);
    res.status(500).json({ error: "Failed to delete bouquet" });
  }
};
