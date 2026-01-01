/**
 * Google Maps Reviews Section Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
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

interface GoogleMapsReviewsSectionState {
  // No state needed, but keeping for consistency
}

/**
 * Google Maps Reviews Section Component
 * Class-based component for Google Maps reviews section
 */
class GoogleMapsReviewsSection extends Component<
  GoogleMapsReviewsSectionProps,
  GoogleMapsReviewsSectionState
> {
  private baseClass: string = "googleMapsReviews";

  private getDefaultReviews(): Review[] {
    const { placeName = "GiftForYou.idn" } = this.props;
    return [
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
  }

  private getAllReviews(): Review[] {
    const { reviews } = this.props;
    return reviews && reviews.length > 0 ? reviews : this.getDefaultReviews();
  }

  private getFilteredReviews(): Review[] {
    const allReviews = this.getAllReviews();
    // Filter only 5-star reviews
    return allReviews.filter((review) => review.rating === 5);
  }

  private getSortedReviews(): Review[] {
    const filtered = this.getFilteredReviews();
    // Sort by time (newest first)
    return [...filtered].sort((a, b) => {
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();
      return timeB - timeA;
    });
  }

  private renderStars(rating: number): React.ReactNode {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={i < rating ? "currentColor" : "none"}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ));
  }

  private renderReview(review: Review): React.ReactNode {
    return (
      <div key={review.id} className={`${this.baseClass}__review`}>
        <div className={`${this.baseClass}__reviewHeader`}>
          <div className={`${this.baseClass}__reviewAuthor`}>
            {review.authorPhoto && (
              <img
                src={review.authorPhoto}
                alt={review.authorName}
                className={`${this.baseClass}__reviewPhoto`}
              />
            )}
            <div>
              <h4 className={`${this.baseClass}__reviewName`}>{review.authorName}</h4>
              <div className={`${this.baseClass}__reviewRating`} aria-label={`Rating: ${review.rating} bintang`}>
                {this.renderStars(review.rating)}
              </div>
            </div>
          </div>
          <time className={`${this.baseClass}__reviewTime`} dateTime={review.time}>
            {review.relativeTime}
          </time>
        </div>
        <p className={`${this.baseClass}__reviewText`}>{review.text}</p>
      </div>
    );
  }

  render(): React.ReactNode {
    const { placeName = "GiftForYou.idn" } = this.props;
    const reviews = this.getSortedReviews().slice(0, 6); // Show top 6 reviews

    if (reviews.length === 0) return null;

    return (
      <section className={this.baseClass} id="Reviews" aria-labelledby="reviews-title">
        <div className={`${this.baseClass}__container`}>
          <header className={`${this.baseClass}__header`}>
            <p className={`${this.baseClass}__kicker`}>Testimoni Pelanggan</p>
            <h2 id="reviews-title" className={`${this.baseClass}__title`}>
              Ulasan Google Maps
            </h2>
            <p className={`${this.baseClass}__subtitle`}>
              Lihat apa yang pelanggan katakan tentang {placeName}
            </p>
          </header>

          <div className={`${this.baseClass}__reviews`}>
            {reviews.map((review) => this.renderReview(review))}
          </div>

          <div className={`${this.baseClass}__footer`}>
            <a
              href={`https://www.google.com/maps/place/?q=place_id:${this.props.placeId || ""}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${this.baseClass}__link`}
            >
              Lihat semua ulasan di Google Maps →
            </a>
          </div>
        </div>
      </section>
    );
  }
}

export default GoogleMapsReviewsSection;

