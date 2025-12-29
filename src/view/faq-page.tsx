/**
 * FAQ Page View
 * Pure presentation component - no business logic
 */

import React from "react";
import "../styles/FAQPage.css";
import type { FAQItem, FAQCategory } from "../models/faq-page-model";
import { STORE_PROFILE } from "../config/store-profile";

interface FAQPageViewProps {
  faqs: FAQItem[];
  filteredFAQs: FAQItem[];
  categories: readonly FAQCategory[];
  selectedCategory: FAQCategory;
  searchQuery: string;
  openItems: Set<number>;
  onCategoryChange: (category: FAQCategory) => void;
  onSearchChange: (query: string) => void;
  onToggleItem: (index: number) => void;
}

/**
 * FAQ Page View Component
 * Pure presentation - receives all data and handlers via props
 */
const FAQPageView: React.FC<FAQPageViewProps> = ({
  faqs,
  filteredFAQs,
  categories,
  selectedCategory,
  searchQuery,
  openItems,
  onCategoryChange,
  onSearchChange,
  onToggleItem,
}) => {
  return (
    <main className="faq-page">
      <div className="faq-container">
        <header className="faq-header reveal-on-scroll">
          <h1 className="faq-title gradient-text">Pertanyaan yang Sering Diajukan</h1>
          <p className="faq-subtitle">
            Temukan jawaban untuk pertanyaan Anda tentang produk dan layanan kami
          </p>
        </header>

        <div className="faq-controls reveal-on-scroll">
          <div className="faq-search">
            <input
              type="text"
              placeholder="Cari pertanyaan..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="faq-search-input"
            />
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="faq-search-icon"
            >
              <path
                d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="faq-categories">
            {categories.map((category) => (
              <button
                key={category}
                className={`faq-category-btn ${
                  selectedCategory === category ? "is-active" : ""
                }`}
                onClick={() => onCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="faq-list">
          {filteredFAQs.length === 0 ? (
            <div className="faq-empty">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p>Tidak ada pertanyaan yang ditemukan</p>
              <p className="faq-empty-subtitle">
                Coba gunakan kata kunci lain atau pilih kategori berbeda
              </p>
            </div>
          ) : (
            filteredFAQs.map((faq, index) => {
              const originalIndex = faqs.indexOf(faq);
              const isOpen = openItems.has(originalIndex);

              return (
                <div
                  key={originalIndex}
                  className={`faq-item fade-in ${isOpen ? "is-open" : ""}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <button
                    className="faq-question"
                    onClick={() => onToggleItem(originalIndex)}
                    aria-expanded={isOpen}
                  >
                    <span className="faq-question-text">{faq.question}</span>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`faq-chevron ${isOpen ? "is-open" : ""}`}
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <div className={`faq-answer ${isOpen ? "is-open" : ""}`}>
                    <div className="faq-answer-content">
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="faq-contact reveal-on-scroll">
          <div className="faq-contact-card">
            <h3 className="faq-contact-title">Masih Ada Pertanyaan?</h3>
            <p className="faq-contact-text">
              Jika pertanyaan Anda belum terjawab, jangan ragu untuk menghubungi kami.
              Tim kami siap membantu Anda.
            </p>
            <div className="faq-contact-buttons">
              <a
                href={STORE_PROFILE.whatsapp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="faq-contact-btn faq-contact-btn--primary"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Chat via WhatsApp
              </a>
              <a
                href="/contact"
                className="faq-contact-btn faq-contact-btn--secondary"
              >
                Halaman Kontak
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default FAQPageView;
