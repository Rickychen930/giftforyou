import React, { Component } from "react";
import "../../styles/DashboardUploaderSection.css";

interface Props {
  onUpload: (formData: FormData) => Promise<boolean>;
}

interface State {
  name: string;
  description: string;
  price: number;
  type: string;
  size: string;
  status: "ready" | "preorder";
  collectionName: string;
  feedback: string;
  feedbackType: "success" | "error" | "";
  file: File | null;
  preview: string;
}

class BouquetUploader extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      name: "",
      description: "",
      price: 0,
      type: "",
      size: "",
      status: "ready",
      collectionName: "",
      feedback: "",
      feedbackType: "",
      file: null,
      preview: "",
    };
  }

  handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    this.setState((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      this.setState({ file, preview: blobUrl });

      // cleanup preview URL
      if (this.state.preview) {
        URL.revokeObjectURL(this.state.preview);
      }
    }
  };

  validateForm = (): boolean => {
    const { name, price } = this.state;
    if (!name || name.trim().length < 2) {
      this.setState({
        feedback: "Name must be at least 2 characters.",
        feedbackType: "error",
      });
      return false;
    }
    if (!price || price <= 0) {
      this.setState({
        feedback: "Price must be greater than 0.",
        feedbackType: "error",
      });
      return false;
    }
    this.setState({ feedback: "", feedbackType: "" });
    return true;
  };

  handleUpload = async () => {
    if (!this.validateForm()) return;

    const formData = new FormData();
    const {
      file,
      name,
      description,
      price,
      type,
      size,
      status,
      collectionName,
    } = this.state;

    if (file) formData.append("image", file);
    formData.append("name", name);
    formData.append("description", description ?? "");
    formData.append("price", price.toString());
    formData.append("type", type ?? "");
    formData.append("size", size ?? "");
    formData.append("status", status);
    formData.append("collectionName", collectionName ?? "");

    const success = await this.props.onUpload(formData);

    if (success) {
      this.setState({
        name: "",
        description: "",
        price: 0,
        type: "",
        size: "",
        status: "ready",
        collectionName: "",
        feedback: "Bouquet uploaded successfully!",
        feedbackType: "success",
        file: null,
        preview: "",
      });
    } else {
      this.setState({
        feedback: "Upload failed. Please try again.",
        feedbackType: "error",
      });
    }
  };

  render(): React.ReactNode {
    const {
      name,
      description,
      price,
      type,
      size,
      collectionName,
      status,
      preview,
      feedback,
      feedbackType,
    } = this.state;

    return (
      <section className="bouquet-uploader">
        <h3>Add New Bouquet</h3>

        <div className="row">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              id="name"
              name="name"
              value={name}
              onChange={this.handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="price">Price *</label>
            <input
              id="price"
              name="price"
              type="number"
              value={price}
              onChange={this.handleChange}
            />
          </div>
        </div>

        <div className="row">
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={this.handleChange}
            >
              <option value="ready">Ready</option>
              <option value="preorder">Preorder</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="collectionName">Collection</label>
            <input
              id="collectionName"
              name="collectionName"
              value={collectionName}
              onChange={this.handleChange}
            />
          </div>
        </div>

        <div className="row">
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={this.handleChange}
              placeholder="Bouquet description"
              rows={4}
            />
          </div>
        </div>

        <div className="row">
          <div className="form-group">
            <label htmlFor="type">Type</label>
            <input
              id="type"
              name="type"
              value={type}
              onChange={this.handleChange}
              placeholder="e.g., Roses"
            />
          </div>
          <div className="form-group">
            <label htmlFor="size">Size</label>
            <input
              id="size"
              name="size"
              value={size}
              onChange={this.handleChange}
              placeholder="e.g., Large"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="imageUpload">Upload Image</label>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={this.handleImageChange}
          />
        </div>

        {preview && (
          <div className="image-preview">
            <p>Preview:</p>
            <img src={preview} alt="Bouquet preview" />
          </div>
        )}

        <button onClick={this.handleUpload}>Upload Bouquet</button>

        {feedback && (
          <div className={`feedback ${feedbackType}`}>{feedback}</div>
        )}
      </section>
    );
  }
}

export default BouquetUploader;
