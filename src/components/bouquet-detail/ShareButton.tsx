import React, { useState, useCallback, memo } from "react";
import { toast } from "../../utils/toast";
import "../../styles/bouquet-detail/ShareButton.css";

interface ShareButtonProps {
  title: string;
  url: string;
  text?: string;
}

/**
 * Share Button Component
 * Supports Web Share API and fallback to clipboard
 */
const ShareButton: React.FC<ShareButtonProps> = memo(({ title, url, text }) => {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = useCallback(async () => {
    if (isSharing) return;

    setIsSharing(true);

    try {
      const shareData: ShareData = {
        title,
        text: text || title,
        url,
      };

      // Use Web Share API if available
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success("Berhasil dibagikan!");
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        toast.success("Tautan disalin ke clipboard!");
      }
    } catch (error) {
      // User cancelled or error occurred
      if (error instanceof Error && error.name !== "AbortError") {
        // Try fallback to clipboard
        try {
          await navigator.clipboard.writeText(url);
          toast.success("Tautan disalin ke clipboard!");
        } catch (clipboardError) {
          toast.error("Gagal membagikan. Silakan salin tautan secara manual.");
        }
      }
    } finally {
      setIsSharing(false);
    }
  }, [title, url, text, isSharing]);

  return (
    <button
      type="button"
      className="share-button"
      onClick={handleShare}
      disabled={isSharing}
      aria-label="Bagikan produk"
      title="Bagikan produk"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{isSharing ? "Membagikan..." : "Bagikan"}</span>
    </button>
  );
});

ShareButton.displayName = "ShareButton";

export default ShareButton;

