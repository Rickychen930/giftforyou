import React from "react";
import "../../styles/store-location/StoreLocationCard.css";

export interface StoreLocationCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  variant?: "location" | "contact" | "hours";
  className?: string;
}

const StoreLocationCard: React.FC<StoreLocationCardProps> = ({
  icon,
  title,
  children,
  variant = "location",
  className = "",
}) => {
  return (
    <div className={`store-location-card store-location-card--${variant} ${className}`}>
      <div className="store-location-card__icon">{icon}</div>
      <h3 className="store-location-card__title">{title}</h3>
      <div className="store-location-card__content">{children}</div>
    </div>
  );
};

export default StoreLocationCard;

