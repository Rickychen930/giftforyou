/**
 * FAQ Page Controller
 * OOP-based controller for managing FAQ page state and filtering
 * Extends BaseController for common functionality (SOLID, DRY)
 */

import React from "react";
import {
  type FAQItem,
  type FAQCategory,
  FAQ_DATA,
  FAQ_CATEGORIES,
  type FAQPageState,
  INITIAL_FAQ_PAGE_STATE,
  DEFAULT_FAQ_PAGE_SEO,
} from "../models/faq-page-model";
import { setFaqSeo } from "../utils/seo";
import { BaseController, type BaseControllerProps, type BaseControllerState, type SeoConfig } from "./base/BaseController";
import FAQPageView from "../view/faq-page";

interface FAQPageControllerProps extends BaseControllerProps {
  // Add any props if needed in the future
}

/**
 * FAQ Page Controller Class
 * Manages all business logic, filtering, and state for the FAQ page
 * Extends BaseController to avoid code duplication
 */
export class FAQPageController extends BaseController<
  FAQPageControllerProps,
  FAQPageState & BaseControllerState
> {
  constructor(props: FAQPageControllerProps) {
    const seoConfig: SeoConfig = {
      defaultSeo: DEFAULT_FAQ_PAGE_SEO,
    };

    super(props, seoConfig);

    this.state = {
      ...this.state,
      ...INITIAL_FAQ_PAGE_STATE,
    };
  }

  /**
   * Initialize FAQ structured data for SEO
   */
  private initializeFaqSeo(): void {
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
   * BaseController handles SEO initialization
   */
  componentDidMount(): void {
    super.componentDidMount();
    this.initializeFaqSeo();
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

