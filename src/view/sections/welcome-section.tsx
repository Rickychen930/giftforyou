// src/components/WelcomeSection/WelcomeSection.tsx

import React from "react";
import "../../styles/WelcomeSection.css";
import { WelcomeContent } from "../../models/home-page-model";

interface WelcomeSectionProps {
  content: WelcomeContent;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ content }) => {
  return (
    <section id="Home" className="welcome-section">
      <div className="welcome-image">
        <img src="/images/welcome-image.jpeg" alt="Welcome" />
      </div>
      <div className="welcome-text">
        <div className="welcome-title">{content.title}</div>
        <div className="welcome-intro">{content.intro}</div>
      </div>
    </section>
  );
};

export default WelcomeSection;
