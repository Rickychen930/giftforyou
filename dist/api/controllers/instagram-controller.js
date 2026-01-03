"use strict";
/**
 * Instagram Controller
 * Backend API controller for managing Instagram integration
 * Extends BaseApiController for common functionality (SOLID, DRY)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstagramProfile = exports.getInstagramPosts = void 0;
const BaseApiController_1 = require("./base/BaseApiController");
/**
 * Instagram Controller Class
 * Manages all Instagram-related API endpoints
 * Extends BaseApiController to avoid code duplication
 */
const instagramController = new (class extends BaseApiController_1.BaseApiController {
    /**
     * Get Instagram posts
     * This will integrate with Instagram Basic Display API or Graph API
     * For now, returns placeholder data until Instagram API credentials are configured
     */
    async getInstagramPosts(req, res) {
        try {
            const limitRaw = typeof req.query.limit === "string" ? req.query.limit : "10";
            const limit = Math.min(Math.max(Number.parseInt(limitRaw, 10) || 10, 1), 20);
            // Check if Instagram API credentials are configured
            const hasInstagramConfig = process.env.INSTAGRAM_ACCESS_TOKEN ||
                process.env.INSTAGRAM_APP_ID ||
                process.env.INSTAGRAM_APP_SECRET;
            if (!hasInstagramConfig) {
                // Return empty array with message - frontend will use fallback
                this.sendSuccess(res, {
                    posts: [],
                    message: "Instagram API not configured. Using placeholder posts.",
                }, "Instagram posts retrieved");
                return;
            }
            // Instagram Graph API Integration
            // Requires: INSTAGRAM_ACCESS_TOKEN (Long-lived token from Facebook App)
            const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
            if (!accessToken) {
                this.sendSuccess(res, {
                    posts: [],
                    message: "Instagram API not configured. Using placeholder posts.",
                }, "Instagram posts retrieved");
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
                    this.sendSuccess(res, {
                        posts: [],
                        message: "Instagram API returned an error. Using placeholder posts.",
                    }, "Instagram posts retrieved");
                    return;
                }
                const data = await response.json();
                if (!data.data || !Array.isArray(data.data)) {
                    this.sendSuccess(res, {
                        posts: [],
                        message: "Instagram API returned invalid data. Using placeholder posts.",
                    }, "Instagram posts retrieved");
                    return;
                }
                // Transform Instagram API response to our format
                const posts = data.data.map((item) => {
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
                this.sendSuccess(res, {
                    posts: posts,
                    username: process.env.INSTAGRAM_USERNAME,
                }, "Instagram posts retrieved");
            }
            catch (apiErr) {
                console.error("Instagram API fetch error:", apiErr);
                // Return empty array on error - frontend will use fallback
                this.sendSuccess(res, {
                    posts: [],
                    message: "Failed to fetch from Instagram API. Using placeholder posts.",
                }, "Instagram posts retrieved");
            }
        }
        catch (err) {
            this.sendError(res, err instanceof Error ? err : new Error("Failed to get Instagram posts"), 500, {
                posts: [],
            });
        }
    }
    /**
     * Get Instagram profile information
     */
    async getInstagramProfile(req, res) {
        try {
            const hasInstagramConfig = process.env.INSTAGRAM_ACCESS_TOKEN ||
                process.env.INSTAGRAM_APP_ID ||
                process.env.INSTAGRAM_APP_SECRET;
            if (!hasInstagramConfig) {
                this.sendSuccess(res, {
                    username: process.env.INSTAGRAM_USERNAME || "giftforyou.idn",
                    message: "Instagram API not configured. Using default username.",
                }, "Instagram profile retrieved");
                return;
            }
            // Instagram Graph API - Get profile info
            const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
            if (!accessToken) {
                this.sendSuccess(res, {
                    username: process.env.INSTAGRAM_USERNAME || "giftforyou.idn",
                    message: "Instagram API not configured. Using default username.",
                }, "Instagram profile retrieved");
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
                    this.sendSuccess(res, {
                        username: process.env.INSTAGRAM_USERNAME || "giftforyou.idn",
                    }, "Instagram profile retrieved");
                    return;
                }
                const data = await response.json();
                this.sendSuccess(res, {
                    username: data.username || process.env.INSTAGRAM_USERNAME || "giftforyou.idn",
                    accountType: data.account_type,
                }, "Instagram profile retrieved");
            }
            catch (apiErr) {
                console.error("Instagram profile API error:", apiErr);
                // Fallback to env var username
                this.sendSuccess(res, {
                    username: process.env.INSTAGRAM_USERNAME || "giftforyou.idn",
                }, "Instagram profile retrieved");
            }
        }
        catch (err) {
            this.sendError(res, err instanceof Error ? err : new Error("Failed to get Instagram profile"), 500);
        }
    }
})();
// Export functions for backward compatibility
exports.getInstagramPosts = instagramController.getInstagramPosts.bind(instagramController);
exports.getInstagramProfile = instagramController.getInstagramProfile.bind(instagramController);
//# sourceMappingURL=instagram-controller.js.map