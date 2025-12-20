import React from "react";
import "../../styles/AboutUsSection.css";
import { Link } from "react-router-dom";
import { AboutUsContent } from "../../models/about-us-model";

interface AboutUsSectionProps {
  content: AboutUsContent;
  ctaHref?: string; // optional: where the button should go
}

const AboutUsSection: React.FC<AboutUsSectionProps> = ({
  content,
  ctaHref = "/about",
}) => {
  return (
    <section id="AboutUs" className="aboutUs" aria-labelledby="aboutUs-title">
      <div className="aboutUs__container">
        <div className="aboutUs__card">
          <p className="aboutUs__kicker">About Our Florist</p>

          <h2 id="aboutUs-title" className="aboutUs__title">
            {content.title}
          </h2>

          <p className="aboutUs__description">{content.description}</p>

          <div className="aboutUs__actions">
            <Link to={ctaHref} className="aboutUs__button">
              {content.buttonLabel}
            </Link>
          </div>

          {/* Optional closing line if your content has it */}
          {"closing" in content && (content as any).closing && (
            <p className="aboutUs__closing">{(content as any).closing}</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
