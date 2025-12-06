import React, { Component } from "react";
import "../../styles/OurCollectionSection.css";
import CollectionCard, {
  BouquetCardProps,
} from "../../components/collection-card-component";
import { ICollection } from "../../models/collection-model";

interface OurCollectionViewProps {
  items: ICollection[]; // backend documents, with bouquets populated
}

class OurCollectionView extends Component<OurCollectionViewProps> {
  private renderCards(): React.ReactNode {
    const { items } = this.props;

    if (!items || items.length === 0) {
      return (
        <div className="our-collection-items">
          <p>No collections available.</p>
        </div>
      );
    }

    return (
      <div className="our-collection-items">
        {items.map((collection) => {
          // ✅ convert IBouquet[] → BouquetCardProps[]
          const bouquets: BouquetCardProps[] = collection.bouquets.map((b) => ({
            _id: String(b._id), // cast ObjectId → string
            name: b.name,
            description: b.description,
            price: b.price,
            type: b.type,
            size: b.size,
            image: b.image,
            status: b.status,
            collectionName: b.collectionName,
          }));

          return (
            <CollectionCard
              key={String(collection._id)}
              id={String(collection._id)}
              name={collection.name}
              description={collection.description ?? ""}
              bouquets={bouquets} // ✅ sekarang plain props
            />
          );
        })}
      </div>
    );
  }

  public render(): React.ReactNode {
    return (
      <section className="our-collection-section" id="OurCollection">
        <div className="our-collection-wrapper">{this.renderCards()}</div>
      </section>
    );
  }
}

export default OurCollectionView;
