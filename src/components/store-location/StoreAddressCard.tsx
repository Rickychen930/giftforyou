import React from "react";
import "../../styles/store-location/StoreAddressCard.css";
import StoreLocationCard from "./StoreLocationCard";
import CopyButton from "../common/CopyButton";

export interface StoreAddressCardProps {
  name: string;
  address: string;
  city: string;
  mapDirectionsUrl?: string;
}

const StoreAddressCard: React.FC<StoreAddressCardProps> = ({
  name,
  address,
  city,
  mapDirectionsUrl,
}) => {
  const fullAddress = [address, city].filter(Boolean).join(", ");

  const locationIcon = (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );

  return (
    <StoreLocationCard
      icon={locationIcon}
      title={name}
      variant="location"
    >
      <p className="store-address-card__address">{address}</p>
      <p className="store-address-card__city">{city}</p>

      <div className="store-address-card__actions">
        <CopyButton
          text={fullAddress}
          label="Salin alamat"
          copiedLabel="Tersalin"
          size="sm"
          className="store-address-card__copy-btn"
        />

        {mapDirectionsUrl && (
          <a
            href={mapDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="store-address-card__directions-btn"
            aria-label="Petunjuk arah ke toko"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M3 11l19-9-9 19-2-8-8-2z" />
            </svg>
            Petunjuk Arah
          </a>
        )}
      </div>
    </StoreLocationCard>
  );
};

export default StoreAddressCard;

