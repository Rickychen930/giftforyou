import { Router } from "express";
import { Collection } from "../models/collection-model";
import { Bouquet } from "../models/bouquet-model-real";

const router = Router();

// ✅ GET semua collection
router.get("/", async (req, res) => {
  try {
    const collections = await Collection.find().populate("bouquets");
    res.json(collections);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch collections" });
  }
});

// ✅ POST buat collection baru
router.post("/", async (req, res) => {
  try {
    const { name, image, bouquets } = req.body;

    // pastikan bouquets adalah array ObjectId valid
    const newCollection = new Collection({
      name,
      image,
      bouquets,
    });

    await newCollection.save();
    res.status(201).json(newCollection);
  } catch (err) {
    res.status(500).json({ error: "Failed to create collection" });
  }
});

// ✅ Tambahkan bouquet ke collection
router.post("/:id/add-bouquet", async (req, res) => {
  try {
    const { bouquetId } = req.body;
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    // pastikan bouquet ada
    const bouquet = await Bouquet.findById(bouquetId);
    if (!bouquet) {
      return res.status(404).json({ error: "Bouquet not found" });
    }

    collection.bouquets.push(bouquetId);
    await collection.save();

    res.json(await collection.populate("bouquets"));
  } catch (err) {
    res.status(500).json({ error: "Failed to add bouquet to collection" });
  }
});

export default router;
