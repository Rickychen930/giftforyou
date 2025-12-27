// src/services/instagram.service.ts

import { API_BASE } from "../config/api";

export interface InstagramPost {
  id: string;
  imageUrl: string;
  caption?: string;
  link: string;
  timestamp?: string;
  permalink?: string;
  mediaType?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
}

export interface InstagramFeedResponse {
  posts: InstagramPost[];
  username?: string;
  error?: string;
}

/**
 * Fetch Instagram posts from backend API
 * Backend will handle Instagram API integration securely
 */
export async function getInstagramPosts(
  limit: number = 10,
  signal?: AbortSignal
): Promise<InstagramPost[]> {
  try {
    const url = `${API_BASE}/api/instagram/posts?limit=${limit}`;
    
    const res = await fetch(url, { 
      signal,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      // If endpoint doesn't exist or fails, return empty array (graceful degradation)
      if (res.status === 404) {
        console.warn("Instagram API endpoint not available, using fallback");
        return [];
      }
      const text = await res.text();
      console.warn(`Failed to fetch Instagram posts (${res.status}): ${text}`);
      return [];
    }

    const data = (await res.json()) as InstagramFeedResponse;
    
    if (data.error) {
      console.warn("Instagram API error:", data.error);
      return [];
    }

    return Array.isArray(data.posts) ? data.posts : [];
  } catch (err) {
    // Graceful degradation - don't break the page if Instagram API fails
    if (err instanceof Error && err.name === "AbortError") {
      return [];
    }
    console.warn("Error fetching Instagram posts:", err);
    return [];
  }
}

/**
 * Get Instagram username/profile info
 */
export async function getInstagramProfile(
  signal?: AbortSignal
): Promise<{ username?: string; profilePicture?: string } | null> {
  try {
    const url = `${API_BASE}/api/instagram/profile`;
    
    const res = await fetch(url, { 
      signal,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return null;
    }
    return null;
  }
}

