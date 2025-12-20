import React, { Component } from "react";
import "../../styles/StoreLocationSection.css";
import type { StoreData } from "../../models/store-model";

interface StoreLocationSectionProps {
  data?: StoreData;
}

const DEFAULT_STORE_DATA: StoreData = {
  name: "Giftforyou.idn",
  address: "Your Address Here",
  city: "Your City",
  phone: "+62 851 6142 8911",
  email: "giftforyou.idn01@gmail.com",
  hours: {
    weekdays: "Mon–Fri: 09:00 – 18:00",
    saturday: "Sat: 09:00 – 18:00",
    sunday: "Sun: Closed",
  },
  // Put your Google Maps embed URL here:
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.100757749125!2d108.55960827488147!3d-6.7575665660787445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6f1d0c68b89013%3A0x6349563c1a437106!2sGiftforyou.idn%20Florist%20%26%20Gift%20shop!5e0!3m2!1sen!2sid!4v1766162380787!5m2!1sen!2sid",
};

class StoreLocationSection extends Component<StoreLocationSectionProps> {
  protected renderStoreInfo(data: StoreData): React.ReactNode {
    const { name, address, city, phone, email, hours } = data;

    return (
      <div
        className="storeLocation__info"
        aria-labelledby="storeLocation-title"
      >
        <p className="storeLocation__kicker">Store & Contact</p>
        <h2 id="storeLocation-title" className="storeLocation__title">
          Visit Our Florist Shop
        </h2>

        <div className="storeLocation__cards">
          <div className="storeLocation__card">
            <h3 className="storeLocation__cardTitle">{name}</h3>
            <p className="storeLocation__text">{address}</p>
            <p className="storeLocation__text">{city}</p>
          </div>

          <div className="storeLocation__card">
            <h3 className="storeLocation__cardTitle">Contact</h3>
            <p className="storeLocation__text">
              Phone: <a href={`tel:${phone}`}>{phone}</a>
            </p>
            <p className="storeLocation__text">
              Email: <a href={`mailto:${email}`}>{email}</a>
            </p>
          </div>

          <div className="storeLocation__card">
            <h3 className="storeLocation__cardTitle">Opening Hours</h3>
            <p className="storeLocation__text">{hours.weekdays}</p>
            <p className="storeLocation__text">{hours.saturday}</p>
            <p className="storeLocation__text">{hours.sunday}</p>
          </div>
        </div>
      </div>
    );
  }

  protected renderMap(data: StoreData): React.ReactNode {
    return (
      <div className="storeLocation__map" aria-label="Store location map">
        <iframe
          title={`${data.name} Store Location`}
          src={data.mapEmbedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    );
  }

  public render(): React.ReactNode {
    const data = this.props.data ?? DEFAULT_STORE_DATA;

    return (
      <section className="storeLocation" id="Location">
        <div className="storeLocation__container">
          {this.renderStoreInfo(data)}
          {this.renderMap(data)}
        </div>
      </section>
    );
  }
}

export default StoreLocationSection;
