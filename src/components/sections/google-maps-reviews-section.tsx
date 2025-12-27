import React from "react";
import "../../styles/GoogleMapsReviewsSection.css";

interface Review {
  id: string;
  authorName: string;
  authorPhoto?: string;
  rating: number;
  text: string;
  time: string;
  relativeTime: string;
}

interface GoogleMapsReviewsSectionProps {
  placeId?: string; // Google Maps Place ID
  placeName?: string;
  reviews?: Review[]; // Optional: if you want to pass reviews directly
}

const GoogleMapsReviewsSection: React.FC<GoogleMapsReviewsSectionProps> = ({
  placeId,
  placeName = "GiftForYou.idn",
  reviews: providedReviews,
}) => {
  // Default reviews - you can replace these with actual Google Maps reviews
  const defaultReviews: Review[] = [
    {
      id: "1",
      authorName: "Siti Nurhaliza",
      rating: 5,
      text: "Bouquet yang sangat cantik dan fresh! Pelayanan sangat ramah dan cepat. Recommended banget untuk acara spesial.",
      time: "2024-01-15T10:30:00Z",
      relativeTime: "2 minggu lalu",
    },
    {
      id: "2",
      authorName: "Ahmad Rizki",
      rating: 5,
      text: "Gift box premium dengan kualitas terbaik. Packaging sangat rapi dan elegan. Customer service sangat responsif.",
      time: "2024-01-10T14:20:00Z",
      relativeTime: "3 minggu lalu",
    },
    {
      id: "3",
      authorName: "Dewi Lestari",
      rating: 5,
      text: "Stand acrylic yang sangat bagus dan kuat. Desainnya modern dan sesuai dengan ekspektasi. Pengiriman tepat waktu!",
      time: "2024-01-05T09:15:00Z",
      relativeTime: "1 bulan lalu",
    },
    {
      id: "4",
      authorName: "Budi Santoso",
      rating: 5,
      text: "Artificial bouquet yang sangat mirip dengan asli! Kualitas premium dan tahan lama. Harga sangat worth it.",
      time: "2023-12-28T16:45:00Z",
      relativeTime: "1 bulan lalu",
    },
    {
      id: "5",
      authorName: "Maya Sari",
      rating: 5,
      text: "Bouquet custom untuk pernikahan sangat memuaskan! Tim sangat profesional dan detail oriented. Highly recommended!",
      time: "2023-12-20T11:30:00Z",
      relativeTime: "1 bulan lalu",
    },
    {
      id: "6",
      authorName: "Rizki Pratama",
      rating: 5,
      text: "Pelayanan sangat baik dari awal konsultasi sampai pengiriman. Bouquet fresh dan sesuai pesanan. Terima kasih!",
      time: "2023-12-15T13:20:00Z",
      relativeTime: "2 bulan lalu",
    },
    {
      id: "7",
      authorName: "Indah Permata",
      rating: 5,
      text: "Gift box untuk anniversary sangat special! Packaging premium dan isinya sesuai ekspektasi. Pasangan sangat suka!",
      time: "2023-12-10T10:00:00Z",
      relativeTime: "2 bulan lalu",
    },
    {
      id: "8",
      authorName: "Fajar Nugroho",
      rating: 5,
      text: "Stand acrylic untuk event sangat memuaskan! Kualitas bagus dan desainnya elegan. Akan order lagi untuk event berikutnya.",
      time: "2023-12-05T15:30:00Z",
      relativeTime: "2 bulan lalu",
    },
  ];

  const allReviews = providedReviews && providedReviews.length > 0 
    ? providedReviews 
    : defaultReviews;

  // Filter only 5-star reviews
  const filteredReviews = allReviews.filter((review) => review.rating === 5);

  // Sort by time (newest first)
  const sortedReviews = [...filteredReviews].sort((a, b) => 
    new Date(b.time).getTime() - new Date(a.time).getTime()
  );

  // For infinite scroll, duplicate reviews to create seamless loop
  const displayedReviews = [...sortedReviews, ...sortedReviews, ...sortedReviews];

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <svg
        key={index}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={index < rating ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ));
  };

  return (
    <section className="google-maps-reviews-section" id="reviews">
      <div className="google-maps-reviews-container">
        <header className="google-maps-reviews-header">
          <div className="google-maps-reviews-header-content">
            <div className="google-maps-reviews-icon-wrapper">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
            <h2 className="google-maps-reviews-title">Ulasan Pelanggan</h2>
            <p className="google-maps-reviews-subtitle">
              Lihat apa kata pelanggan tentang kami di Google Maps
            </p>
          </div>
        </header>

        {/* Reviews horizontal scroll */}
        {displayedReviews.length > 0 ? (
          <div className="google-maps-reviews-scroll-container">
            <div className="google-maps-reviews-scroll" role="list" aria-label="Customer reviews">
              {displayedReviews.map((review, index) => (
                <article
                  key={`${review.id}-${index}`}
                  className="google-maps-review-card"
                  role="listitem"
                >
                  <div className="google-maps-review-header">
                    <div className="google-maps-review-author">
                      {review.authorPhoto ? (
                        <img
                          src={review.authorPhoto}
                          alt={review.authorName}
                          className="google-maps-review-author-photo"
                          loading="lazy"
                        />
                      ) : (
                        <div className="google-maps-review-author-photo-placeholder">
                          {review.authorName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="google-maps-review-author-info">
                        <h3 className="google-maps-review-author-name">{review.authorName}</h3>
                        <div className="google-maps-review-rating">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>
                    <time
                      className="google-maps-review-time"
                      dateTime={review.time}
                      title={new Date(review.time).toLocaleString("id-ID")}
                    >
                      {review.relativeTime}
                    </time>
                  </div>
                  <p className="google-maps-review-text">{review.text}</p>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="google-maps-reviews-empty" role="status" aria-live="polite">
            <p>Tidak ada review tersedia</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default GoogleMapsReviewsSection;

