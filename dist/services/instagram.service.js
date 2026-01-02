"use strict";
// src/services/instagram.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstagramProfile = exports.getInstagramPosts = void 0;
const api_1 = require("../config/api");
/**
 * Fetch Instagram posts from backend API
 * Backend will handle Instagram API integration securely
 */
async function getInstagramPosts(limit = 10, signal) {
    try {
        const url = `${api_1.API_BASE}/api/instagram/posts?limit=${limit}`;
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
        const data = (await res.json());
        if (data.error) {
            console.warn("Instagram API error:", data.error);
            return [];
        }
        return Array.isArray(data.posts) ? data.posts : [];
    }
    catch (err) {
        // Graceful degradation - don't break the page if Instagram API fails
        if (err instanceof Error && err.name === "AbortError") {
            return [];
        }
        console.warn("Error fetching Instagram posts:", err);
        return [];
    }
}
exports.getInstagramPosts = getInstagramPosts;
/**
 * Get Instagram username/profile info
 */
async function getInstagramProfile(signal) {
    try {
        const url = `${api_1.API_BASE}/api/instagram/profile`;
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
    }
    catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
            return null;
        }
        return null;
    }
}
exports.getInstagramProfile = getInstagramProfile;
//# sourceMappingURL=instagram.service.js.map