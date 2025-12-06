import React, { Component } from "react";
import "../../styles/StoreLocationSection.css";
import { StoreData } from "../../models/home-page-model";

interface StoreLocationSectionProps {
  data: StoreData;
}

class StoreLocationSection extends Component<StoreLocationSectionProps> {
  protected renderStoreInfo(): React.ReactNode {
    const { data } = this.props;

    if (!data) {
      return (
        <div className="store-location-info">
          <p>Store information is unavailable.</p>
        </div>
      );
    }

    const { name, address, city, phone, email, hours } = data;

    return (
      <div className="store-location-info">
        <h2 className="store-location-title">📍 Visit Our Store</h2>
        <div className="store-location-card">
          <h3>{name}</h3>
          <p>{address}</p>
          <p>{city}</p>
        </div>
        <div className="store-location-card">
          <h3>Contact Us</h3>
          <p>
            📞 <a href={`tel:${phone}`}>{phone}</a>
          </p>
          <p>
            ✉️ <a href={`mailto:${email}`}>{email}</a>
          </p>
        </div>
        <div className="store-location-card">
          <h3>🕒 Open Hours</h3>
          <p>{hours.weekdays}</p>
          <p>{hours.saturday}</p>
          <p>{hours.sunday}</p>
        </div>
      </div>
    );
  }

  protected renderMap(): React.ReactNode {
    return (
      <div className="store-location-map">
        <iframe
          title="Store Location Map"
          src={this.props.data.mapEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
        ></iframe>
      </div>
    );
  }

  public render(): React.ReactNode {
    return (
      <section className="store-location-section" id="Location">
        <div className="store-location-wrapper">
          {this.renderStoreInfo()}
          {this.renderMap()}
        </div>
      </section>
    );
  }
}

export default StoreLocationSection;
