/**
 * FAQ Page Controller
 * OOP-based controller for managing FAQ page state and filtering
 */

import React, { Component } from "react";
import {
  type FAQItem,
  type FAQCategory,
  FAQ_DATA,
  FAQ_CATEGORIES,
  type FAQPageState,
  INITIAL_FAQ_PAGE_STATE,
  DEFAULT_FAQ_PAGE_SEO,
} from "../models/faq-page-model";
import { setSeo, setFaqSeo } from "../utils/seo";
import FAQPageView from "../view/faq-page";

interface FAQPageControllerProps {
  // Add any props if needed in the future
}

/**
 * FAQ Page Controller Class
 * Manages all business logic, filtering, and state for the FAQ page
 */
export class FAQPageController extends Component<
  FAQPageControllerProps,
  FAQPageState
> {
  constructor(props: FAQPageControllerProps) {
    super(props);
    this.state = { ...INITIAL_FAQ_PAGE_STATE };
  }

  /**
   * Initialize SEO
   */
  private initializeSeo(): void {
    setSeo(DEFAULT_FAQ_PAGE_SEO);

    // Set FAQ structured data for SEO
    setFaqSeo(
      FAQ_DATA.map((item) => ({
        question: item.question,
        answer: item.answer,
      }))
    );
  }

  /**
   * Handle category selection
   */
  handleCategoryChange = (category: FAQCategory): void => {
    this.setState({ selectedCategory: category });
  };

  /**
   * Handle search query change
   */
  handleSearchChange = (query: string): void => {
    this.setState({ searchQuery: query });
  };

  /**
   * Toggle FAQ item open/close state
   */
  handleToggleItem = (index: number): void => {
    this.setState((prevState) => {
      const newOpenItems = new Set(prevState.openItems);
      if (newOpenItems.has(index)) {
        newOpenItems.delete(index);
      } else {
        newOpenItems.add(index);
      }
      return { openItems: newOpenItems };
    });
  };

  /**
   * Filter FAQs based on category and search query
   */
  private filterFAQs(): FAQItem[] {
    const { selectedCategory, searchQuery } = this.state;

    return FAQ_DATA.filter((faq) => {
      const matchesCategory =
        selectedCategory === "Semua" || faq.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  /**
   * Component lifecycle: Mount
   */
  componentDidMount(): void {
    this.initializeSeo();
  }

  /**
   * Render view
   */
  render(): React.ReactNode {
    const filteredFAQs = this.filterFAQs();

    return (
      <FAQPageView
        faqs={FAQ_DATA}
        filteredFAQs={filteredFAQs}
        categories={FAQ_CATEGORIES}
        selectedCategory={this.state.selectedCategory}
        searchQuery={this.state.searchQuery}
        openItems={this.state.openItems}
        onCategoryChange={this.handleCategoryChange}
        onSearchChange={this.handleSearchChange}
        onToggleItem={this.handleToggleItem}
      />
    );
  }
}

export default FAQPageController;

