/**
 * Store Location Section Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/StoreLocationSection.css";
import type { StoreData } from "../../models/store-model";
import { storeData } from "../../models/store-model";
import StoreAddressCard from "../../components/store-location/StoreAddressCard";
import StoreContactCard from "../../components/store-location/StoreContactCard";
import StoreHoursCard from "../../components/store-location/StoreHoursCard";
import StoreSocialLinks from "../../components/store-location/StoreSocialLinks";

interface StoreLocationSectionProps {
  data?: StoreData;
}

interface StoreLocationSectionState {
  // No state needed, but keeping for consistency
}

/**
 * Store Location Section Component
 * Class-based component for store location section
 */
class StoreLocationSection extends Component<StoreLocationSectionProps, StoreLocationSectionState> {
  private baseClass: string = "store-location";

  render(): React.ReactNode {
    const { data = storeData } = this.props;
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
      <section className={this.baseClass} id="Location">
        <div className={`${this.baseClass}__container`}>
          <div className={`${this.baseClass}__info`} aria-labelledby="store-location-title">
            <p className={`${this.baseClass}__kicker`}>Toko & Kontak</p>

            <h2 id="store-location-title" className={`${this.baseClass}__title`}>
              Kunjungi Toko Kami di Cirebon
            </h2>

            <div className={`${this.baseClass}__cards`}>
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
  }
}

export default StoreLocationSection;

