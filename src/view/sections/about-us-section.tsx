import React from "react";
import "../../styles/AboutUsSection.css";
import { AboutUsContent } from "../../models/home-page-model";

interface AboutUsSectionProps {
  content: AboutUsContent;
}

const AboutUsSection: React.FC<AboutUsSectionProps> = ({ content }) => {
  return (
    <section id="AboutUs" className="about-us">
      <div className="about-us-wrapper">
        <div className="about-us-text-wrapper">
          <h2 className="about-us-title">{content.title}</h2>
          <p className="about-us-info">{content.description}</p>
        </div>
        <button className="about-us-button">{content.buttonLabel}</button>
      </div>
    </section>
  );
};

export default AboutUsSection;
