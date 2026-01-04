/**
 * Product Reviews Component
 * Displays and allows submission of product reviews with ratings
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getAccessToken } from "../utils/auth-utils";
import { toast } from "../utils/toast";
import { API_BASE } from "../config/api";
import "../styles/ProductReviews.css";

export interface Review {
  _id?: string;
  bouquetId: string;
  customerId?: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt?: string;
  verified?: boolean;
}

interface ProductReviewsProps {
  bouquetId: string;
  bouquetName: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ bouquetId, bouquetName }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: "",
    customerName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAuthenticated = !!getAccessToken();

  const loadReviews = useCallback(async () => {
    if (!bouquetId || typeof bouquetId !== "string" || bouquetId.trim() === "") {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      try {
        const response = await fetch(`${API_BASE}/api/reviews?bouquetId=${encodeURIComponent(bouquetId)}`, {
          signal: controller.signal,
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            setReviews([]);
            return;
          }
          throw new Error(`Failed to load reviews: ${response.status} ${response.statusText}`);
        }
        
        const text = await response.text();
        if (!text || text.trim() === "") {
          setReviews([]);
          return;
        }
        
        let data: unknown;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error("Failed to parse reviews response:", parseError);
          setReviews([]);
          return;
        }
        
        // Validate and normalize data
        if (Array.isArray(data)) {
          setReviews(data.filter((r): r is Review => 
            r != null && 
            typeof r === "object" && 
            typeof (r as Review).rating === "number" &&
            (r as Review).rating >= 1 &&
            (r as Review).rating <= 5
          ));
        } else if (data && typeof data === "object" && "reviews" in data && Array.isArray((data as any).reviews)) {
          setReviews((data as any).reviews.filter((r: unknown): r is Review => 
            r != null && 
            typeof r === "object" && 
            typeof (r as Review).rating === "number" &&
            (r as Review).rating >= 1 &&
            (r as Review).rating <= 5
          ));
        } else {
          setReviews([]);
        }
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          console.warn("Reviews request timeout");
          toast.error("Request timeout. Silakan coba lagi.");
        } else {
          throw fetchError;
        }
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error("Failed to load reviews:", error);
      toast.error("Gagal memuat review. Silakan refresh halaman.");
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  }, [bouquetId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.comment.trim()) {
      toast.error("Mohon isi komentar");
      return;
    }

    if (!formData.customerName.trim() && !isAuthenticated) {
      toast.error("Mohon isi nama");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = getAccessToken();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      
      const response = await fetch(`${API_BASE}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          bouquetId,
          rating: Math.max(1, Math.min(5, Math.round(formData.rating))), // Ensure valid rating
          comment: formData.comment.trim(),
          customerName: formData.customerName.trim() || "Customer",
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const responseData = await response.json().catch(() => null);
        if (responseData) {
          toast.success("Review berhasil dikirim!");
          setFormData({ rating: 5, comment: "", customerName: "" });
          setShowForm(false);
          loadReviews();
        } else {
          toast.warning("Review dikirim, tetapi gagal memuat konfirmasi.");
          loadReviews();
        }
      } else {
        let errorMessage = "Gagal mengirim review";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = response.status === 400 
            ? "Data tidak valid. Periksa kembali form Anda."
            : response.status === 401
            ? "Anda harus login untuk mengirim review."
            : response.status >= 500
            ? "Server error. Silakan coba lagi nanti."
            : errorMessage;
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        toast.error("Request timeout. Silakan coba lagi.");
      } else if (error instanceof TypeError && error.message.includes("fetch")) {
        toast.error("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
      } else {
        toast.error("Terjadi kesalahan. Silakan coba lagi.");
      }
      console.error("Submit review error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = useMemo(() => {
    if (!Array.isArray(reviews) || reviews.length === 0) return 0;
    const validReviews = reviews.filter((r) => r && typeof r.rating === "number" && r.rating >= 1 && r.rating <= 5);
    if (validReviews.length === 0) return 0;
    const sum = validReviews.reduce((acc, r) => acc + (Number.isFinite(r.rating) ? r.rating : 0), 0);
    return Number.isFinite(sum) ? sum / validReviews.length : 0;
  }, [reviews]);

  const ratingDistribution = useMemo(() => {
    if (!Array.isArray(reviews) || reviews.length === 0) {
      return [5, 4, 3, 2, 1].map((rating) => ({ rating, count: 0, percentage: 0 }));
    }
    const validReviews = reviews.filter((r) => r && typeof r.rating === "number" && r.rating >= 1 && r.rating <= 5);
    return [5, 4, 3, 2, 1].map((rating) => {
      const count = validReviews.filter((r) => r.rating === rating).length;
      return {
        rating,
        count,
        percentage: validReviews.length > 0 ? (count / validReviews.length) * 100 : 0,
      };
    });
  }, [reviews]);

  const StarRating: React.FC<{ rating: number; size?: "sm" | "md" | "lg"; interactive?: boolean; onRatingChange?: (rating: number) => void }> = ({
    rating,
    size = "md",
    interactive = false,
    onRatingChange,
  }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
      <div className={`productReviews__stars productReviews__stars--${size} ${interactive ? "productReviews__stars--interactive" : ""}`}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (hoverRating || rating);
          return (
            <button
              key={star}
              type={interactive ? "button" : undefined}
              className={`productReviews__star ${isFilled ? "productReviews__star--filled" : ""}`}
              onClick={() => interactive && onRatingChange && onRatingChange(star)}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              disabled={!interactive || isSubmitting}
              aria-label={`${star} bintang`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill={isFilled ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="productReviews productReviews--loading">
        <div className="productReviews__spinner"></div>
        <p>Memuat review...</p>
      </div>
    );
  }

  return (
    <div className="productReviews">
      <div className="productReviews__header">
        <h3 className="productReviews__title">Ulasan & Rating</h3>
        {reviews.length > 0 && (
          <div className="productReviews__summary">
            <div className="productReviews__averageRating">
              <span className="productReviews__averageNumber">{averageRating.toFixed(1)}</span>
              <StarRating rating={Math.round(averageRating)} size="lg" />
              <span className="productReviews__reviewCount">({reviews.length} ulasan)</span>
            </div>
            <div className="productReviews__distribution">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="productReviews__distributionItem">
                  <span className="productReviews__distributionLabel">{rating} bintang</span>
                  <div className="productReviews__distributionBar">
                    <div
                      className="productReviews__distributionFill"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="productReviews__distributionCount">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {!showForm ? (
        <button
          type="button"
          className="productReviews__writeBtn"
          onClick={() => setShowForm(true)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Tulis Ulasan
        </button>
      ) : (
        <form className="productReviews__form" onSubmit={handleSubmit}>
          <div className="productReviews__formGroup">
            <label className="productReviews__formLabel">Rating</label>
            <StarRating
              rating={formData.rating}
              interactive
              onRatingChange={(rating) => setFormData({ ...formData, rating })}
            />
          </div>
          {!isAuthenticated && (
            <div className="productReviews__formGroup">
              <label className="productReviews__formLabel" htmlFor="customerName">
                Nama <span className="productReviews__required">*</span>
              </label>
              <input
                id="customerName"
                name="customerName"
                type="text"
                className="productReviews__formInput"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Masukkan nama Anda"
                required
              />
            </div>
          )}
          <div className="productReviews__formGroup">
            <label className="productReviews__formLabel" htmlFor="comment">
              Ulasan <span className="productReviews__required">*</span>
            </label>
            <textarea
              id="comment"
              className="productReviews__formTextarea"
              rows={4}
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Bagikan pengalaman Anda dengan produk ini..."
              required
              maxLength={500}
            />
            <div className="productReviews__charCount">
              {formData.comment.length} / 500 karakter
            </div>
          </div>
          <div className="productReviews__formActions">
            <button
              type="button"
              className="productReviews__formBtn productReviews__formBtn--cancel"
              onClick={() => {
                setShowForm(false);
                setFormData({ rating: 5, comment: "", customerName: "" });
              }}
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="productReviews__formBtn productReviews__formBtn--submit"
              disabled={isSubmitting || !formData.comment.trim()}
            >
              {isSubmitting ? "Mengirim..." : "Kirim Ulasan"}
            </button>
          </div>
        </form>
      )}

      <div className="productReviews__list">
        {reviews.length === 0 ? (
          <div className="productReviews__empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
            </svg>
            <p>Belum ada ulasan untuk produk ini</p>
            <p className="productReviews__emptyHint">Jadilah yang pertama memberikan ulasan!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id || Math.random()} className="productReviews__item">
              <div className="productReviews__itemHeader">
                <div className="productReviews__itemInfo">
                  <span className="productReviews__itemName">
                    {review.customerName}
                    {review.verified && (
                      <span className="productReviews__verified" title="Verified Purchase">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                  </span>
                  {review.createdAt && (
                    <span className="productReviews__itemDate">
                      {new Date(review.createdAt).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
                <StarRating rating={review.rating} size="sm" />
              </div>
              <p className="productReviews__itemComment">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;

