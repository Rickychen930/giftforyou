import React, { useState, useEffect } from "react";
import "../../styles/InstagramFeedSection.css";

interface InstagramPost {
  id: string;
  imageUrl: string;
  caption?: string;
  link: string; // Link to Instagram post
  timestamp?: string;
}

interface InstagramFeedSectionProps {
  instagramUsername?: string; // e.g., "giftforyou.idn"
  posts?: InstagramPost[]; // Optional: if you want to pass posts directly
}

const InstagramFeedSection: React.FC<InstagramFeedSectionProps> = ({
  instagramUsername = "giftforyou.idn",
  posts: providedPosts,
}) => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);

  // Default posts - you can replace these with actual Instagram post links
  const defaultPosts: InstagramPost[] = [
    {
      id: "1",
      imageUrl: "/images/instagram/instagram-1.jpg",
      caption: "Bouquet Fresh untuk Hari Spesial",
      link: `https://www.instagram.com/${instagramUsername}/`,
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      imageUrl: "/images/instagram/instagram-2.jpg",
      caption: "Gift Box Premium Collection",
      link: `https://www.instagram.com/${instagramUsername}/`,
      timestamp: "5 hours ago",
    },
    {
      id: "3",
      imageUrl: "/images/instagram/instagram-3.jpg",
      caption: "Stand Acrylic Elegant Design",
      link: `https://www.instagram.com/${instagramUsername}/`,
      timestamp: "1 day ago",
    },
    {
      id: "4",
      imageUrl: "/images/instagram/instagram-4.jpg",
      caption: "Artificial Bouquet Terbaru",
      link: `https://www.instagram.com/${instagramUsername}/`,
      timestamp: "2 days ago",
    },
    {
      id: "5",
      imageUrl: "/images/instagram/instagram-5.jpg",
      caption: "Bouquet Custom untuk Pernikahan",
      link: `https://www.instagram.com/${instagramUsername}/`,
      timestamp: "3 days ago",
    },
    {
      id: "6",
      imageUrl: "/images/instagram/instagram-6.jpg",
      caption: "Gift Box Special Edition",
      link: `https://www.instagram.com/${instagramUsername}/`,
      timestamp: "4 days ago",
    },
    {
      id: "7",
      imageUrl: "/images/instagram/instagram-7.jpg",
      caption: "Bouquet Fresh dari Kebun",
      link: `https://www.instagram.com/${instagramUsername}/`,
      timestamp: "5 days ago",
    },
    {
      id: "8",
      imageUrl: "/images/instagram/instagram-8.jpg",
      caption: "Stand Acrylic Premium",
      link: `https://www.instagram.com/${instagramUsername}/`,
      timestamp: "1 week ago",
    },
    {
      id: "9",
      imageUrl: "/images/instagram/instagram-9.jpg",
      caption: "Bouquet Anniversary Special",
      link: `https://www.instagram.com/${instagramUsername}/`,
      timestamp: "1 week ago",
    },
    {
      id: "10",
      imageUrl: "/images/instagram/instagram-10.jpg",
      caption: "Gift Box Valentine Collection",
      link: `https://www.instagram.com/${instagramUsername}/`,
      timestamp: "2 weeks ago",
    },
  ];

  useEffect(() => {
    if (providedPosts && providedPosts.length > 0) {
      setPosts(providedPosts.slice(0, 10));
    } else {
      // Use default posts or fetch from API if needed
      setPosts(defaultPosts.slice(0, 10));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providedPosts]);

  const handlePostClick = (link: string) => {
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const handleViewAllClick = () => {
    window.open(`https://www.instagram.com/${instagramUsername}/`, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="instagram-feed-section" id="instagram-feed">
      <div className="instagram-feed-container">
        <header className="instagram-feed-header">
          <div className="instagram-feed-header-content">
            <div className="instagram-feed-icon-wrapper">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.069-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.98-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.98-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </div>
            <h2 className="instagram-feed-title">Ikuti Kami di Instagram</h2>
            <p className="instagram-feed-subtitle">
              Lihat update terbaru dan inspirasi bouquet dari kami
            </p>
          </div>
          <a
            href={`https://www.instagram.com/${instagramUsername}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="instagram-feed-follow-btn"
            aria-label={`Follow @${instagramUsername} di Instagram`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M18 8h-7V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2zm-7 8h7v-2h-7v2zM6 8h5v8H6V8z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Follow @{instagramUsername}
          </a>
        </header>

        {posts.length > 0 ? (
          <>
            <div className="instagram-feed-grid" role="list" aria-label="Instagram posts">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="instagram-post-card fade-in"
                  role="listitem"
                  tabIndex={0}
                  onClick={() => handlePostClick(post.link)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handlePostClick(post.link);
                    }
                  }}
                  aria-label={`Instagram post: ${post.caption || "View on Instagram"}`}
                >
                  <div className="instagram-post-image-wrapper">
                    <img
                      src={post.imageUrl}
                      alt={post.caption || "Instagram post"}
                      className="instagram-post-image"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.src = "/images/placeholder-bouquet.jpg";
                      }}
                    />
                    <div className="instagram-post-overlay">
                      <div className="instagram-post-overlay-content">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.069-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.98-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.98-6.98-1.281-.059-1.69-.073-4.949-.073z"
                            fill="currentColor"
                          />
                        </svg>
                        <span className="instagram-post-view-text">Lihat di Instagram</span>
                      </div>
                    </div>
                  </div>
                  {post.caption && (
                    <div className="instagram-post-caption" title={post.caption}>
                      {post.caption}
                    </div>
                  )}
                </article>
              ))}
            </div>
            <div className="instagram-feed-footer">
              <button
                type="button"
                className="instagram-feed-view-all-btn"
                onClick={handleViewAllClick}
                aria-label="Lihat semua post di Instagram"
              >
                Lihat Semua di Instagram
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M5 12h14M12 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="instagram-feed-empty" role="status" aria-live="polite">
            <p>Tidak ada post tersedia</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default InstagramFeedSection;

