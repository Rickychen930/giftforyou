/**
 * About Us Section Component (OOP)
 * Class-based component following SOLID principles
 */

/**
 * About Us Section Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../../styles/AboutUsSection.css";
import { AboutUsContent } from "../../models/about-us-model";
import SectionHeader from "../../components/common/SectionHeader";

interface AboutUsSectionProps {
  content: AboutUsContent;
  ctaHref?: string; // optional: where the button should go
}

interface AboutUsSectionState {
  // No state needed, but keeping for consistency
}

/**
 * About Us Section Component
 * Class-based component for about us section
 */
class AboutUsSection extends Component<AboutUsSectionProps, AboutUsSectionState> {
  private baseClass: string = "aboutUs";

  render(): React.ReactNode {
    const { content, ctaHref = "/about" } = this.props;

    return (
      <section id="AboutUs" className={this.baseClass} aria-labelledby="aboutUs-title">
        <div className={`${this.baseClass}__container`}>
          <div className={`${this.baseClass}__card`}>
            <SectionHeader
              eyebrow="About Our Florist"
              title={content.title}
              subtitle={content.description}
              className={`${this.baseClass}__header`}
              titleId="aboutUs-title"
            />

            <div className={`${this.baseClass}__actions`}>
              <Link to={ctaHref} className={`${this.baseClass}__button`}>
                {content.buttonLabel}
              </Link>
            </div>

            {/* Optional closing line if your content has it */}
            {"closing" in content && (content as any).closing && (
              <p className={`${this.baseClass}__closing`}>{(content as any).closing}</p>
            )}
          </div>
        </div>
      </section>
    );
  }
}

export default AboutUsSection;

