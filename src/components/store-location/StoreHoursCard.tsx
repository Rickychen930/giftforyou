import React from "react";
import "../../styles/store-location/StoreHoursCard.css";
import StoreLocationCard from "./StoreLocationCard";
import type { StoreHours } from "../../models/store-model";

export interface StoreHoursCardProps {
  hours: StoreHours;
}

const StoreHoursCard: React.FC<StoreHoursCardProps> = ({ hours }) => {
  const clockIcon = (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );

  return (
    <StoreLocationCard
      icon={clockIcon}
      title="Jam Operasional"
      variant="hours"
    >
      <p className="store-hours-card__time">{hours.weekdays}</p>
      <p className="store-hours-card__time">{hours.saturday}</p>
      <p className="store-hours-card__time store-hours-card__time--closed">
        {hours.sunday}
      </p>
    </StoreLocationCard>
  );
};

export default StoreHoursCard;

