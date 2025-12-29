/**
 * FAQ Page View
 * Pure presentation component - no business logic
 */

import React from "react";
import { Link } from "react-router-dom";
import "../styles/FAQPage.css";
import type { FAQItem, FAQCategory } from "../models/faq-page-model";
import { STORE_PROFILE } from "../config/store-profile";
import FAQItemComponent from "../components/common/FAQItem";
import SearchInput from "../components/common/SearchInput";
import CategoryFilter from "../components/common/CategoryFilter";
import HelpSection from "../components/common/HelpSection";
import WhatsAppButton from "../components/common/WhatsAppButton";
import LuxuryButton from "../components/LuxuryButton";

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
          <SearchInput
            placeholder="Cari pertanyaan..."
            value={searchQuery}
            onSearchChange={onSearchChange}
            className="faq-search"
          />

          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
            className="faq-categories"
          />
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
                <FAQItemComponent
                  key={originalIndex}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={isOpen}
                  onToggle={() => onToggleItem(originalIndex)}
                  index={index}
                />
              );
            })
          )}
        </div>

        <HelpSection
          title="Masih Ada Pertanyaan?"
          className="faq-contact reveal-on-scroll"
        >
          Jika pertanyaan Anda belum terjawab, jangan ragu untuk menghubungi kami.
          Tim kami siap membantu Anda.
          <div className="faq-contact-buttons">
            <WhatsAppButton
              href={STORE_PROFILE.whatsapp.url}
              variant="primary"
              size="md"
              className="faq-contact-btn"
            >
              Chat via WhatsApp
            </WhatsAppButton>
            <Link to="/contact" className="faq-contact-btn faq-contact-btn--secondary">
              <LuxuryButton variant="secondary" size="md">
                Halaman Kontak
              </LuxuryButton>
            </Link>
          </div>
        </HelpSection>
      </div>
    </main>
  );
};

export default FAQPageView;
