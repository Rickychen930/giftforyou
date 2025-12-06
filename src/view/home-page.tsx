import React, { useEffect, useState } from "react";
import "../styles/HomePage.css";
import {
  aboutUsContent,
  storeData,
  welcomeContent,
} from "../models/home-page-model";
import WelcomeSection from "./sections/welcome-section";
import AboutUsSection from "./sections/about-us-section";
import OurCollectionSection from "./sections/our-collection-section";
import StoreLocationSection from "./sections/store-location-section";

const HomePage: React.FC = () => {
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/collections")
      .then((res) => res.json())
      .then((data) => setCollections(data))
      .catch((err) => console.error("Failed to fetch collections", err));
  }, []);

  return (
    <main className="Home-page-container">
      <WelcomeSection content={welcomeContent} />
      <AboutUsSection content={aboutUsContent} />
      <OurCollectionSection items={collections} />
      <StoreLocationSection data={storeData} />
    </main>
  );
};

export default HomePage;
