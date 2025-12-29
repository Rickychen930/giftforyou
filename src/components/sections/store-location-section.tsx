import React from "react";
import "../../styles/StoreLocationSection.css";
import type { StoreData } from "../../models/store-model";
import { storeData } from "../../models/store-model";
import StoreAddressCard from "../store-location/StoreAddressCard";
import StoreContactCard from "../store-location/StoreContactCard";
import StoreHoursCard from "../store-location/StoreHoursCard";
import StoreSocialLinks from "../store-location/StoreSocialLinks";

interface StoreLocationSectionProps {
  data?: StoreData;
}

const StoreLocationSection: React.FC<StoreLocationSectionProps> = ({
  data = storeData,
}) => {
  const {
    name,
    address,
    city,
    phone,
    email,
    hours,
    mapDirectionsUrl,
    social,
  } = data;

  return (
    <section className="store-location" id="Location">
      <div className="store-location__container">
        <div className="store-location__info" aria-labelledby="store-location-title">
          <p className="store-location__kicker">Toko & Kontak</p>

          <h2 id="store-location-title" className="store-location__title">
            Kunjungi Toko Kami di Cirebon
          </h2>

          <div className="store-location__cards">
            <StoreAddressCard
              name={name}
              address={address}
              city={city}
              mapDirectionsUrl={mapDirectionsUrl}
            />

            <StoreContactCard
              phone={phone}
              email={email}
              whatsappUrl={social?.whatsapp}
            />

            <StoreHoursCard hours={hours} />
          </div>

          {social && (social.instagram || social.tiktok) && (
            <StoreSocialLinks
              instagram={social.instagram}
              tiktok={social.tiktok}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default StoreLocationSection;
