import React, { useState, useEffect } from "react";
import HeroSlider, { HeroSliderContent } from "../hero/HeroSlider";
import { API_BASE } from "../../config/api";

interface HeroCollectionSliderProps {
  content?: HeroSliderContent;
  loading?: boolean;
}

const HeroCollectionSlider: React.FC<HeroCollectionSliderProps> = ({
  content,
  loading = false,
}) => {
  const [heroContent, setHeroContent] = useState<HeroSliderContent | null>(null);
  const [isLoading, setIsLoading] = useState(loading);

  useEffect(() => {
    if (content) {
      setHeroContent(content);
      setIsLoading(false);
      return;
    }

    // Fetch from API if no content provided
    const fetchHeroContent = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE}/api/hero-slider/home`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.slides && Array.isArray(data.slides)) {
            setHeroContent(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch hero slider:", err);
        // Fallback to default content
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroContent();
  }, [content]);

  return <HeroSlider content={heroContent ?? undefined} loading={isLoading} />;
};

export default HeroCollectionSlider;
