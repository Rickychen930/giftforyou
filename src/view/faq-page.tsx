/**
 * FAQ Page View
 * Pure presentation component - no business logic
 * OOP-based class component following SOLID principles
 * Luxury, elegant, UI/UX clean, effective
 */

import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../styles/FAQPage.css";
import type { FAQItem, FAQCategory } from "../models/faq-page-model";
import { STORE_PROFILE } from "../config/store-profile";
import FAQItemComponent from "../components/common/FAQItem";
import LuxurySearchInput from "../components/common/LuxurySearchInput";
import CategoryFilter from "../components/common/CategoryFilter";
import HelpSection from "../components/common/HelpSection";
import WhatsAppButton from "../components/common/WhatsAppButton";
import LuxuryButton from "../components/buttons/LuxuryButton";
import Section from "../components/layout/Section";
import Container from "../components/layout/Container";

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
 * Pure presentation class component - receives all data and handlers via props
 * Follows Single Responsibility Principle: only handles UI rendering
 */
class FAQPageView extends Component<FAQPageViewProps> {
  /**
   * Render method - Single Responsibility: render UI only
   */
  render(): React.ReactNode {
    const {
      faqs,
      filteredFAQs,
      categories,
      selectedCategory,
      searchQuery,
      openItems,
      onCategoryChange,
      onSearchChange,
      onToggleItem,
    } = this.props;

    return (
      <Section variant="gradient" padding="lg" className="faq-page" aria-labelledby="faq-title">
        <Container variant="default" padding="md">
          <header className="faq-page__header reveal-on-scroll">
            <h1 className="faq-page__title" id="faq-title">
              Pertanyaan yang Sering Diajukan
            </h1>
            <p className="faq-page__subtitle">
              Temukan jawaban untuk pertanyaan Anda tentang produk dan layanan kami
            </p>
          </header>

          <div className="faq-page__controls reveal-on-scroll">
            <div className="faq-page__search-wrapper">
              <LuxurySearchInput
                placeholder="Cari pertanyaan..."
                value={searchQuery}
                onSearchChange={onSearchChange}
                className="faq-page__search"
              />
            </div>

            <div className="faq-page__categories-wrapper">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={onCategoryChange}
                className="faq-page__categories"
              />
            </div>
          </div>

          <div className="faq-page__list">
            {filteredFAQs.length === 0 ? (
              <div className="faq-page__empty">
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="faq-page__empty-icon"
                  aria-hidden="true"
                >
                  <path
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="faq-page__empty-title">Tidak ada pertanyaan yang ditemukan</p>
                <p className="faq-page__empty-subtitle">
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

          <div className="faq-page__contact reveal-on-scroll">
            <HelpSection
              title="Masih Ada Pertanyaan?"
              className="faq-page__help-section"
            >
              <p className="faq-page__contact-text">
                Jika pertanyaan Anda belum terjawab, jangan ragu untuk menghubungi kami.
                Tim kami siap membantu Anda.
              </p>
              <div className="faq-page__contact-buttons">
                <WhatsAppButton
                  href={STORE_PROFILE.whatsapp.url}
                  variant="primary"
                  size="md"
                  className="faq-page__contact-btn"
                >
                  Chat via WhatsApp
                </WhatsAppButton>
                <Link to="/contact" className="faq-page__contact-link">
                  <LuxuryButton variant="secondary" size="md" className="faq-page__contact-btn">
                    Halaman Kontak
                  </LuxuryButton>
                </Link>
              </div>
            </HelpSection>
          </div>
        </Container>
      </Section>
    );
  }
}

export default FAQPageView;
