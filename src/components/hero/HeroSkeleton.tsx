import React from "react";
import "../../styles/hero/HeroSkeleton.css";

const HeroSkeleton: React.FC = () => {
  return (
    <section className="hero-skeleton" aria-label="Memuat hero slider">
      <div className="hero-skeleton__container">
        <div className="hero-skeleton__image" />
        <div className="hero-skeleton__content">
          <div className="hero-skeleton__badge" />
          <div className="hero-skeleton__title" />
          <div className="hero-skeleton__subtitle" />
          <div className="hero-skeleton__buttons">
            <div className="hero-skeleton__button" />
            <div className="hero-skeleton__button" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSkeleton;

