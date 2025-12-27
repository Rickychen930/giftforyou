// src/controllers/instagram-controller.ts

import { Request, Response } from "express";
import type { InstagramPost } from "../services/instagram.service";

/**
 * Get Instagram posts
 * This will integrate with Instagram Basic Display API or Graph API
 * For now, returns placeholder data until Instagram API credentials are configured
 */
export async function getInstagramPosts(req: Request, res: Response): Promise<void> {
  try {
    const limitRaw = typeof req.query.limit === "string" ? req.query.limit : "10";
    const limit = Math.min(Math.max(Number.parseInt(limitRaw, 10) || 10, 1), 20);

    // Check if Instagram API credentials are configured
    const hasInstagramConfig = 
      process.env.INSTAGRAM_ACCESS_TOKEN || 
      process.env.INSTAGRAM_APP_ID ||
      process.env.INSTAGRAM_APP_SECRET;

    if (!hasInstagramConfig) {
      // Return empty array with message - frontend will use fallback
      res.status(200).json({
        posts: [],
        message: "Instagram API not configured. Using placeholder posts.",
      });
      return;
    }

    // Instagram Graph API Integration
    // Requires: INSTAGRAM_ACCESS_TOKEN (Long-lived token from Facebook App)
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    
    if (!accessToken) {
      res.status(200).json({
        posts: [],
        message: "Instagram API not configured. Using placeholder posts.",
      });
      return;
    }

    try {
      // Fetch media from Instagram Graph API
      const apiUrl = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${accessToken}&limit=${limit}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Instagram API error:", response.status, errorText);
        
        // Return empty array - frontend will use fallback
        res.status(200).json({
          posts: [],
          message: "Instagram API returned an error. Using placeholder posts.",
        });
        return;
      }

      const data = await response.json() as {
        data?: Array<{
          id: string;
          caption?: string;
          media_type?: string;
          media_url?: string;
          thumbnail_url?: string;
          permalink?: string;
        }>;
      };

      if (!data.data || !Array.isArray(data.data)) {
        res.status(200).json({
          posts: [],
          message: "Instagram API returned invalid data. Using placeholder posts.",
        });
        return;
      }

      // Transform Instagram API response to our format
      const posts: InstagramPost[] = data.data.map((item: any) => {
        // Extract caption (first 100 chars for preview)
        const caption = item.caption ? item.caption.substring(0, 200) : "";
        
        // Use thumbnail for videos, media_url for images
        const imageUrl = item.media_type === "VIDEO" 
          ? (item.thumbnail_url || item.media_url)
          : item.media_url;

        return {
          id: item.id,
          imageUrl: imageUrl,
          caption: caption,
          link: item.permalink,
          timestamp: item.timestamp,
          permalink: item.permalink,
          mediaType: item.media_type,
        };
      });

      res.status(200).json({
        posts: posts,
        username: process.env.INSTAGRAM_USERNAME,
      });
    } catch (apiErr) {
      console.error("Instagram API fetch error:", apiErr);
      // Return empty array on error - frontend will use fallback
      res.status(200).json({
        posts: [],
        message: "Failed to fetch from Instagram API. Using placeholder posts.",
      });
    }
  } catch (err) {
    console.error("getInstagramPosts failed:", err);
    res.status(500).json({
      posts: [],
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
}

/**
 * Get Instagram profile information
 */
export async function getInstagramProfile(req: Request, res: Response): Promise<void> {
  try {
    const hasInstagramConfig = 
      process.env.INSTAGRAM_ACCESS_TOKEN || 
      process.env.INSTAGRAM_APP_ID ||
      process.env.INSTAGRAM_APP_SECRET;

    if (!hasInstagramConfig) {
      res.status(200).json({
        username: process.env.INSTAGRAM_USERNAME || "giftforyou.idn",
        message: "Instagram API not configured. Using default username.",
      });
      return;
    }

    // Instagram Graph API - Get profile info
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    
    if (!accessToken) {
      res.status(200).json({
        username: process.env.INSTAGRAM_USERNAME || "giftforyou.idn",
        message: "Instagram API not configured. Using default username.",
      });
      return;
    }

    try {
      const apiUrl = `https://graph.instagram.com/me?fields=username,account_type&access_token=${accessToken}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        // Fallback to env var username
        res.status(200).json({
          username: process.env.INSTAGRAM_USERNAME || "giftforyou.idn",
        });
        return;
      }

      const data = await response.json() as {
        username?: string;
        account_type?: string;
      };
      
      res.status(200).json({
        username: data.username || process.env.INSTAGRAM_USERNAME || "giftforyou.idn",
        accountType: data.account_type,
      });
    } catch (apiErr) {
      console.error("Instagram profile API error:", apiErr);
      // Fallback to env var username
      res.status(200).json({
        username: process.env.INSTAGRAM_USERNAME || "giftforyou.idn",
      });
    }
  } catch (err) {
    console.error("getInstagramProfile failed:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
}

