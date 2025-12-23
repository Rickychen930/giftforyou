import React, { Component } from "react";
import "../../styles/DashboardUploaderSection.css";
import { BOUQUET_SIZE_OPTIONS } from "../../constants/bouquet-constants";

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

  quantity: number;
  occasionsText: string;
  flowersText: string;
  isNewEdition: boolean;
  isFeatured: boolean;
  careInstructions: string;

  file: File | null;
  previewUrl: string;

  submitting: boolean;
  message: string;
  messageType: "success" | "error" | "";
}

class BouquetUploader extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      name: "",
      description: "",
      price: 0,
      type: "bouquet",
      size: "Medium",
      status: "ready",
      collectionName: "",

      quantity: 0,
      occasionsText: "",
      flowersText: "",
      isNewEdition: false,
      isFeatured: false,
      careInstructions: "",

      file: null,
      previewUrl: "",

      submitting: false,
      message: "",
      messageType: "",
    };
  }

  componentWillUnmount(): void {
    if (this.state.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(this.state.previewUrl);
    }
  }

  private setMessage(message: string, messageType: State["messageType"]) {
    this.setState({ message, messageType });
  }

  private handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name } = e.target;
    const value =
      e.target instanceof HTMLInputElement && e.target.type === "checkbox"
        ? e.target.checked
        : e.target.value;

    this.setState((prev) => ({
      ...prev,
      [name]:
        name === "price"
          ? Number(value)
          : name === "quantity"
            ? Math.max(0, Math.trunc(Number(value)))
            : value,
    }));
  };

  private handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    // cleanup old preview
    if (this.state.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(this.state.previewUrl);
    }

    if (!file) {
      this.setState({ file: null, previewUrl: "" });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    this.setState({ file, previewUrl });
  };

  private validate(): string | null {
    const name = this.state.name.trim();
    const price = this.state.price;

    if (!this.state.size) return "Please select a size.";

    if (name.length < 2) return "Name must be at least 2 characters.";
    if (!Number.isFinite(price) || price <= 0)
      return "Price must be greater than 0.";
    // image optional; if required, validate here
    return null;
  }

  private buildFormData(): FormData {
    const fd = new FormData();
    if (this.state.file) fd.append("image", this.state.file);

    fd.append("name", this.state.name.trim());
    fd.append("description", this.state.description ?? "");
    fd.append("price", String(this.state.price));
    fd.append("type", (this.state.type ?? "bouquet").trim() || "bouquet");
    fd.append("size", this.state.size ?? "Medium");
    fd.append("status", this.state.status);
    fd.append("collectionName", this.state.collectionName ?? "");

    fd.append("quantity", String(this.state.quantity ?? 0));
    fd.append("occasions", this.state.occasionsText ?? "");
    fd.append("flowers", this.state.flowersText ?? "");
    fd.append("isNewEdition", String(Boolean(this.state.isNewEdition)));
    fd.append("isFeatured", String(Boolean(this.state.isFeatured)));
    fd.append("careInstructions", this.state.careInstructions ?? "");

    return fd;
  }

  private handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = this.validate();
    if (error) {
      this.setMessage(error, "error");
      return;
    }

    this.setState({ submitting: true, message: "", messageType: "" });

    try {
      const ok = await this.props.onUpload(this.buildFormData());

      if (ok) {
        this.setState({
          name: "",
          description: "",
          price: 0,
          type: "",
          size: "",
          status: "ready",
          collectionName: "",
          quantity: 0,
          occasionsText: "",
          flowersText: "",
          isNewEdition: false,
          isFeatured: false,
          careInstructions: "",
          file: null,
          previewUrl: "",
          submitting: false,
          message: "Bouquet uploaded successfully.",
          messageType: "success",
        });
      } else {
        this.setState({
          submitting: false,
          message: "Upload failed. Please try again.",
          messageType: "error",
        });
      }
    } catch (err) {
      console.error("Upload error:", err);
      this.setState({
        submitting: false,
        message: "Server error. Please try again.",
        messageType: "error",
      });
    }
  };

  render(): React.ReactNode {
    const { submitting, message, messageType, previewUrl } = this.state;

    return (
      <section className="uploader">
        <header className="uploader__header">
          <h2 className="uploader__title">Upload New Bouquet</h2>
          <p className="uploader__subtitle">
            Add a new product to your store catalog. Fields marked * are
            required.
          </p>
        </header>

        <form className="uploader__form" onSubmit={this.handleSubmit}>
          <div className="uploader__grid">
            <label className="uploader__field">
              Name *
              <input
                name="name"
                value={this.state.name}
                onChange={this.handleChange}
                placeholder="e.g., Orchid Elegance"
                disabled={submitting}
                required
              />
            </label>

            <label className="uploader__field">
              Price (IDR) *
              <input
                name="price"
                type="number"
                value={this.state.price}
                onChange={this.handleChange}
                disabled={submitting}
                required
                min={0}
              />
            </label>

            <label className="uploader__field">
              Status
              <select
                name="status"
                value={this.state.status}
                onChange={this.handleChange}
                disabled={submitting}
              >
                <option value="ready">Ready</option>
                <option value="preorder">Preorder</option>
              </select>
            </label>

            <label className="uploader__field">
              Collection
              <input
                name="collectionName"
                value={this.state.collectionName}
                onChange={this.handleChange}
                placeholder="e.g., New Edition"
                disabled={submitting}
              />
            </label>

            <label className="uploader__field">
              Type
              <input
                name="type"
                value={this.state.type}
                onChange={this.handleChange}
                placeholder="e.g., bouquet"
                disabled={submitting}
              />
            </label>

            <label className="uploader__field">
              Size
              <select
                name="size"
                value={this.state.size}
                onChange={this.handleChange}
                disabled={submitting}
                required
              >
                {BOUQUET_SIZE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="uploader__field">
              Quantity
              <input
                name="quantity"
                type="number"
                min={0}
                step={1}
                value={this.state.quantity}
                onChange={this.handleChange}
                disabled={submitting}
              />
            </label>

            <label className="uploader__field uploader__field--full">
              Flags
              <div className="uploader__toggles" role="group" aria-label="Bouquet flags">
                <label className="uploader__toggle">
                  <input
                    type="checkbox"
                    name="isNewEdition"
                    checked={this.state.isNewEdition}
                    onChange={this.handleChange}
                    disabled={submitting}
                  />
                  <span>New edition</span>
                </label>

                <label className="uploader__toggle">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={this.state.isFeatured}
                    onChange={this.handleChange}
                    disabled={submitting}
                  />
                  <span>Featured</span>
                </label>
              </div>
            </label>

            <label className="uploader__field uploader__field--full">
              Description
              <textarea
                name="description"
                value={this.state.description}
                onChange={this.handleChange}
                rows={4}
                placeholder="Short description..."
                disabled={submitting}
              />
            </label>

            <label className="uploader__field uploader__field--full">
              Occasions
              <input
                name="occasionsText"
                value={this.state.occasionsText}
                onChange={this.handleChange}
                placeholder="e.g., Birthday, Anniversary"
                disabled={submitting}
              />
            </label>

            <label className="uploader__field uploader__field--full">
              Flowers
              <input
                name="flowersText"
                value={this.state.flowersText}
                onChange={this.handleChange}
                placeholder="e.g., Orchid, Rose"
                disabled={submitting}
              />
            </label>

            <label className="uploader__field uploader__field--full">
              Care instructions
              <textarea
                name="careInstructions"
                value={this.state.careInstructions}
                onChange={this.handleChange}
                rows={3}
                placeholder="Optional care tips"
                disabled={submitting}
              />
            </label>

            <label className="uploader__field uploader__field--full">
              Image
              <input
                type="file"
                accept="image/*,.heic,.heif"
                onChange={this.handleImageChange}
                disabled={submitting}
              />
            </label>
          </div>

          {previewUrl && (
            <div className="uploader__preview">
              <p className="uploader__previewLabel">Preview</p>
              <img
                className="uploader__previewImg"
                src={previewUrl}
                alt="Preview"
              />
            </div>
          )}

          <button
            className="uploader__submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Uploading..." : "Upload Bouquet"}
          </button>

          {message && (
            <div
              className={`uploader__message ${
                messageType === "success" ? "is-success" : "is-error"
              }`}
              role={messageType === "error" ? "alert" : "status"}
            >
              {message}
            </div>
          )}
        </form>
      </section>
    );
  }
}

export default BouquetUploader;
