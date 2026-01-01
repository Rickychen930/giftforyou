import React, { Component } from "react";
import type { Bouquet } from "../../models/domain/bouquet";
import type { Collection } from "../../models/domain/collection";
import "../../styles/BouquetEditForm.css";
import BouquetEditor from "../bouquet-card-edit-component";
import DropdownWithModal from "../inputs/DropdownWithModal";

interface Props {
  bouquet: Bouquet;
  collections: Collection[];
  onSave: (formData: FormData) => Promise<boolean>;
  onBack: () => void;
}

interface State {
  collectionName: string;
  bouquet: Bouquet;
}

class BouquetEditForm extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      collectionName: props.bouquet.collectionName || "",
      bouquet: props.bouquet,
    };
  }

  componentDidUpdate(prevProps: Props): void {
    if (prevProps.bouquet._id !== this.props.bouquet._id) {
      this.setState({
        bouquet: this.props.bouquet,
        collectionName: this.props.bouquet.collectionName || "",
      });
    }
  }

  private handleSave = async (formData: FormData): Promise<boolean> => {
    // Update collection name in form data
    formData.set("collectionName", this.state.collectionName);
    const success = await this.props.onSave(formData);
    // State will be updated by parent component (BouquetEditorSection)
    // No need to update local state here as parent handles it
    return success;
  };

  private handleCollectionChange = (value: string): void => {
    this.setState({ collectionName: value });
  };

  render(): React.ReactNode {
    const { collections, onBack } = this.props;
    const { bouquet, collectionName } = this.state;
    const collectionOptions = collections.map((c) => c.name);
    const collectionNames = collections.map((c) => c.name);

    return (
      <section className="bouquetEditForm" aria-label={`Edit bouquet ${bouquet.name}`}>
        <header className="bouquetEditForm__header">
          <button
            type="button"
            className="bouquetEditForm__backBtn"
            onClick={onBack}
            aria-label="Kembali ke detail koleksi"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Kembali
          </button>
          <div className="bouquetEditForm__headerContent">
            <h2 className="bouquetEditForm__title">Edit Bouquet</h2>
            <p className="bouquetEditForm__subtitle">
              Edit detail bouquet. Perubahan akan tersimpan ke database.
            </p>
          </div>
        </header>

        <div className="bouquetEditForm__collectionSelector">
          <label className="bouquetEditForm__collectionLabel">
            <span className="bouquetEditForm__collectionLabelText">Koleksi</span>
            <DropdownWithModal
              label="Koleksi"
              value={collectionName}
              options={collectionOptions}
              onChange={this.handleCollectionChange}
              onAddNew={() => {}}
              placeholder="Pilih koleksi..."
              storageKey=""
            />
          </label>
          <p className="bouquetEditForm__collectionHint">
            Pilih koleksi untuk bouquet ini. Perubahan akan disimpan saat menyimpan bouquet.
          </p>
        </div>

        <div className="bouquetEditForm__formWrapper">
          <BouquetEditor
            bouquet={bouquet}
            collections={collectionNames}
            onSave={this.handleSave}
          />
        </div>
      </section>
    );
  }
}

export default BouquetEditForm;

