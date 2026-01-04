/**
 * Review Controller
 * Handles review creation and retrieval
 */

import type { Request, Response } from "express";
import { ReviewModel } from "../models/review-model";
import { normalizeString, parseNonNegativeInt } from "../utils/validation";
import { authenticate } from "../middleware/auth-middleware";

/**
 * Get reviews for a bouquet
 */
export async function getReviews(req: Request, res: Response): Promise<void> {
  try {
    const bouquetId = normalizeString(req.query?.bouquetId as string, "", 64);
    
    if (!bouquetId) {
      res.status(400).json({ message: "bouquetId is required" });
      return;
    }

    const pageRaw = parseNonNegativeInt(req.query?.page as string);
    const page = pageRaw > 0 ? pageRaw : 1;
    const limitRaw = parseNonNegativeInt(req.query?.limit as string);
    const limit = Math.min(limitRaw > 0 ? limitRaw : 20, 100);
    const skip = (page - 1) * limit;

    const reviews = await ReviewModel.find({ bouquetId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const total = await ReviewModel.countDocuments({ bouquetId });

    res.status(200).json({
      reviews,
      total,
      page,
      limit,
      hasMore: skip + reviews.length < total,
    });
  } catch (err) {
    console.error("getReviews failed:", err);
    res.status(500).json({ message: "Failed to get reviews", error: err instanceof Error ? err.message : "Unknown error" });
  }
}

/**
 * Create a new review
 */
export async function createReview(req: Request, res: Response): Promise<void> {
  try {
    // Validate request body exists
    if (!req.body || typeof req.body !== "object") {
      res.status(400).json({ message: "Request body is required" });
      return;
    }

    const bouquetId = normalizeString(req.body?.bouquetId, "", 64);
    const customerName = normalizeString(req.body?.customerName, "", 120);
    const comment = normalizeString(req.body?.comment, "", 500);
    const ratingRaw = parseFloat(String(req.body?.rating || 5));
    const rating = Math.max(1, Math.min(5, Math.round(Number.isFinite(ratingRaw) ? ratingRaw : 5)));

    // Validate required fields
    if (!bouquetId || bouquetId.trim() === "") {
      res.status(400).json({ message: "bouquetId is required" });
      return;
    }

    if (!customerName || customerName.trim() === "") {
      res.status(400).json({ message: "customerName is required" });
      return;
    }

    if (!comment || comment.trim() === "") {
      res.status(400).json({ message: "comment is required" });
      return;
    }

    // Validate rating is within valid range
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ message: "rating must be between 1 and 5" });
      return;
    }

    // Get customer ID if authenticated
    let customerId: string | undefined;
    // authenticate middleware sets (req as any).user if authenticated
    // We'll check it directly without calling authenticate since it's a middleware
    // In routes, authenticate would be called before this controller
    if ((req as any).user && (req as any).user.id && typeof (req as any).user.id === "string") {
      customerId = String((req as any).user.id).trim();
      if (customerId === "") {
        customerId = undefined;
      }
    }

    // Check for duplicate review from same customer (if authenticated)
    if (customerId) {
      const existingReview = await ReviewModel.findOne({
        bouquetId,
        customerId,
      }).lean().exec();
      
      if (existingReview) {
        res.status(409).json({ message: "You have already reviewed this bouquet" });
        return;
      }
    }

    const review = new ReviewModel({
      bouquetId: bouquetId.trim(),
      customerId,
      customerName: customerName.trim(),
      rating,
      comment: comment.trim(),
      verified: !!customerId, // Verified if customer is authenticated
    });

    await review.save();

    res.status(201).json(review);
  } catch (err) {
    console.error("createReview failed:", err);
    
    // Handle specific MongoDB errors
    if (err && typeof err === "object" && "code" in err) {
      if ((err as any).code === 11000) {
        res.status(409).json({ message: "Duplicate review detected" });
        return;
      }
    }
    
    res.status(500).json({ 
      message: "Failed to create review", 
      error: err instanceof Error ? err.message : "Unknown error" 
    });
  }
}

