/**
 * Why Choose Us Section Component (OOP)
 * Class-based component following SOLID principles
 * Luxury, elegant, clean, effective, and fully responsive
 * MVC Pattern: View component for WhyChooseUs section
 */

import React, { Component, RefObject } from "react";
import "../../styles/WhyChooseUsSection.css";
import SectionHeader from "../../components/common/SectionHeader";
import Container from "../../components/layout/Container";
import { DEFAULT_WHY_CHOOSE_US_CONTENT, type Benefit } from "../../models/why-choose-us-model";

/**
 * Render benefit icon based on icon type
 * Encapsulation: Private helper function
 */
const renderBenefitIcon = (iconType: Benefit["iconType"]): React.ReactNode => {
  switch (iconType) {
    case "premium":
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "fast-delivery":
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 6V12L16 14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "friendly-service":
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "satisfaction-guarantee":
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M9 12L11 14L15 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
};

interface WhyChooseUsSectionState {
  isVisible: boolean;
}

/**
 * Why Choose Us Section Component
 * Displays trust indicators and benefits with luxury styling
 * Follows Single Responsibility Principle: only handles UI rendering
 * Optimized with shouldComponentUpdate to prevent unnecessary re-renders
 */
class WhyChooseUsSection extends Component<{}, WhyChooseUsSectionState> {
  private baseClass: string = "whyChooseUs";
  private sectionRef: RefObject<HTMLElement>;
  private intersectionObserver: IntersectionObserver | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      isVisible: false,
    };
    this.sectionRef = React.createRef();
  }

  /**
   * Prevent unnecessary re-renders when props haven't changed
   * Optimizes performance by avoiding re-renders when data is the same
   */
  shouldComponentUpdate(_nextProps: {}, nextState: WhyChooseUsSectionState): boolean {
    return nextState.isVisible !== this.state.isVisible;
  }

  componentDidMount(): void {
    this.setupIntersectionObserver();
  }

  componentWillUnmount(): void {
    this.cleanupIntersectionObserver();
  }

  /**
   * Setup Intersection Observer for visibility detection
   * Disconnects after visibility is set to improve performance
   */
  private setupIntersectionObserver(): void {
    if (!this.sectionRef.current) return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.setState({ isVisible: true });
            // Disconnect observer after visibility is set to improve performance
            this.cleanupIntersectionObserver();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      }
    );

    if (this.sectionRef.current) {
      this.intersectionObserver.observe(this.sectionRef.current);
    }
  }

  /**
   * Cleanup Intersection Observer
   * Prevents memory leaks
   */
  private cleanupIntersectionObserver(): void {
    try {
      if (this.intersectionObserver) {
        if (this.sectionRef.current) {
          this.intersectionObserver.unobserve(this.sectionRef.current);
        }
        this.intersectionObserver.disconnect();
        this.intersectionObserver = null;
      }
    } catch (error) {
      console.warn("Error during intersection observer cleanup:", error);
      // Ensure observer is null even if cleanup fails
      this.intersectionObserver = null;
    }
  }

  /**
   * Get benefits data from model
   * Single Responsibility: data retrieval
   */
  private getBenefits(): Benefit[] {
    return DEFAULT_WHY_CHOOSE_US_CONTENT.benefits;
  }

  /**
   * Get content from model
   * Single Responsibility: data retrieval
   */
  private getContent() {
    return DEFAULT_WHY_CHOOSE_US_CONTENT;
  }

  /**
   * Render individual benefit card
   * Encapsulation: Private method for rendering logic
   */
  private renderBenefit(benefit: Benefit, index: number): React.ReactNode {
    const { isVisible } = this.state;

    return (
      <article
        key={benefit.id}
        className={`${this.baseClass}__benefit ${isVisible ? `${this.baseClass}__benefit--visible` : ""}`}
        style={{ animationDelay: `${index * 0.1}s` }}
        aria-labelledby={`benefit-${benefit.id}-title`}
      >
        <div className={`${this.baseClass}__benefitIcon`} aria-hidden="true">
          {renderBenefitIcon(benefit.iconType)}
        </div>
        <h3 id={`benefit-${benefit.id}-title`} className={`${this.baseClass}__benefitTitle`}>
          {benefit.title}
        </h3>
        <p className={`${this.baseClass}__benefitDescription`}>{benefit.description}</p>
      </article>
    );
  }

  /**
   * Render method
   * Single Responsibility: Only handles UI rendering
   */
  render(): React.ReactNode {
    const content = this.getContent();
    const benefits = this.getBenefits();

    return (
      <section
        className={this.baseClass}
        id="why-choose-us-section"
        ref={this.sectionRef}
        aria-labelledby="why-choose-us-title"
      >
        <Container variant="default" padding="md" className={`${this.baseClass}__container`}>
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            subtitle={content.subtitle}
            className={`${this.baseClass}__header`}
            titleId="why-choose-us-title"
          />

          <div className={`${this.baseClass}__grid`} role="list">
            {benefits.map((benefit, index) => this.renderBenefit(benefit, index))}
          </div>
        </Container>
      </section>
    );
  }
}

export default WhyChooseUsSection;

