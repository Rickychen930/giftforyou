/**
 * Store Location Section Component (OOP)
 * Class-based component following SOLID principles
 */

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
import SectionHeader from "../../components/common/SectionHeader";
import Container from "../../components/layout/Container";

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
  private baseClass: string = "storeLocation";

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
        <Container variant="default" padding="md" className={`${this.baseClass}__container`}>
          <SectionHeader
            eyebrow="Toko & Kontak"
            title="Kunjungi Toko Kami di Cirebon"
            subtitle="Kami siap melayani Anda dengan senyuman. Kunjungi toko kami atau hubungi melalui kontak di bawah untuk konsultasi dan pemesanan."
            className={`${this.baseClass}__header`}
            titleId="store-location-title"
          />

          <div className={`${this.baseClass}__content`} aria-labelledby="store-location-title">
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
                instagram={social?.instagram}
                tiktok={social?.tiktok}
              />

              <StoreHoursCard hours={hours} />
            </div>
          </div>
        </Container>
      </section>
    );
  }
}

export default StoreLocationSection;

