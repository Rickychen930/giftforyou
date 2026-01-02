/**
 * Review Card Component (OOP)
 * Class-based component following SOLID principles
 * Reusable component for displaying individual reviews
 */

import React, { Component } from "react";
import "../../styles/reviews/ReviewCard.css";

export interface ReviewCardProps {
  id: string;
  authorName: string;
  authorPhoto?: string;
  rating: number;
  text: string;
  time: string;
  relativeTime: string;
  className?: string;
}

interface ReviewCardState {
  // No state needed, but keeping for consistency
}

/**
 * Review Card Component
 * Class-based component for individual review card
 */
class ReviewCard extends Component<ReviewCardProps, ReviewCardState> {
  private baseClass: string = "review-card";

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

  render(): React.ReactNode {
    const { authorName, authorPhoto, rating, text, time, relativeTime, className = "" } = this.props;

    return (
      <article className={`${this.baseClass} ${className}`} aria-label={`Review by ${authorName}`}>
        <header className={`${this.baseClass}__header`}>
          <div className={`${this.baseClass}__author`}>
            {authorPhoto && (
              <img
                src={authorPhoto}
                alt={authorName}
                className={`${this.baseClass}__photo`}
                loading="lazy"
              />
            )}
            <div className={`${this.baseClass}__authorInfo`}>
              <h4 className={`${this.baseClass}__name`}>{authorName}</h4>
              <div
                className={`${this.baseClass}__rating`}
                aria-label={`Rating: ${rating} out of 5 stars`}
                role="img"
              >
                {this.renderStars(rating)}
              </div>
            </div>
          </div>
          <time className={`${this.baseClass}__time`} dateTime={time}>
            {relativeTime}
          </time>
        </header>
        <p className={`${this.baseClass}__text`}>{text}</p>
      </article>
    );
  }
}

export default ReviewCard;

