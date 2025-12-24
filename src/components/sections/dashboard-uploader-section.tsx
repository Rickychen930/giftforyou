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

    if (!this.state.size) return "Silakan pilih ukuran.";

    if (name.length < 2) return "Nama minimal 2 karakter.";
    if (!Number.isFinite(price) || price <= 0)
      return "Harga harus lebih dari 0.";
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
          message: "Bouquet berhasil diunggah.",
          messageType: "success",
        });
      } else {
        this.setState({
          submitting: false,
          message: "Unggah gagal. Silakan coba lagi.",
          messageType: "error",
        });
      }
    } catch (err) {
      console.error("Upload error:", err);
      this.setState({
        submitting: false,
        message: "Terjadi kesalahan server. Silakan coba lagi.",
        messageType: "error",
      });
    }
  };

  render(): React.ReactNode {
    const { submitting, message, messageType, previewUrl } = this.state;

    return (
      <section className="uploader">
        <header className="uploader__header">
          <h2 className="uploader__title">Unggah Bouquet Baru</h2>
          <p className="uploader__subtitle">
            Tambahkan produk baru ke katalog toko. Kolom bertanda * wajib
            diisi.
          </p>
        </header>

        <form className="uploader__form" onSubmit={this.handleSubmit}>
          <div className="uploader__layout">
            <div className="uploader__col uploader__col--form">
              <div className="uploader__grid">
            <label className="uploader__field">
              Nama *
              <input
                name="name"
                value={this.state.name}
                onChange={this.handleChange}
                placeholder="mis., Orchid Elegance"
                disabled={submitting}
                required
              />
            </label>

            <label className="uploader__field">
              Harga (IDR) *
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
                <option value="ready">Siap</option>
                <option value="preorder">Preorder</option>
              </select>
            </label>

            <label className="uploader__field">
              Koleksi
              <input
                name="collectionName"
                value={this.state.collectionName}
                onChange={this.handleChange}
                placeholder="mis., New Edition"
                disabled={submitting}
              />
            </label>

            <label className="uploader__field">
              Tipe
              <input
                name="type"
                value={this.state.type}
                onChange={this.handleChange}
                placeholder="mis., bouquet"
                disabled={submitting}
              />
            </label>

            <label className="uploader__field">
              Ukuran
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
              Stok
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
              Penanda
              <div className="uploader__toggles" role="group" aria-label="Penanda bouquet">
                <label className="uploader__toggle">
                  <input
                    type="checkbox"
                    name="isNewEdition"
                    checked={this.state.isNewEdition}
                    onChange={this.handleChange}
                    disabled={submitting}
                  />
                  <span>Edisi baru</span>
                </label>

                <label className="uploader__toggle">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={this.state.isFeatured}
                    onChange={this.handleChange}
                    disabled={submitting}
                  />
                  <span>Unggulan</span>
                </label>
              </div>
            </label>

            <label className="uploader__field uploader__field--full">
              Deskripsi
              <textarea
                name="description"
                value={this.state.description}
                onChange={this.handleChange}
                rows={4}
                placeholder="Deskripsi singkat..."
                disabled={submitting}
              />
            </label>

            <label className="uploader__field uploader__field--full">
              Acara
              <input
                name="occasionsText"
                value={this.state.occasionsText}
                onChange={this.handleChange}
                placeholder="mis., Ulang Tahun, Anniversary"
                disabled={submitting}
              />
            </label>

            <label className="uploader__field uploader__field--full">
              Bunga
              <input
                name="flowersText"
                value={this.state.flowersText}
                onChange={this.handleChange}
                placeholder="mis., Orchid, Mawar"
                disabled={submitting}
              />
            </label>

            <label className="uploader__field uploader__field--full">
              Instruksi perawatan
              <textarea
                name="careInstructions"
                value={this.state.careInstructions}
                onChange={this.handleChange}
                rows={3}
                placeholder="Tips perawatan (opsional)"
                disabled={submitting}
              />
            </label>

            <label className="uploader__field uploader__field--full">
              Gambar
              <input
                type="file"
                accept="image/*,.heic,.heif"
                onChange={this.handleImageChange}
                disabled={submitting}
              />
            </label>
              </div>
            </div>

            <aside className="uploader__col uploader__col--preview" aria-label="Pratinjau gambar">
              <div className="uploader__preview">
                <p className="uploader__previewLabel">Pratinjau</p>
                {previewUrl ? (
                  <img
                    className="uploader__previewImg"
                    src={previewUrl}
                    alt="Pratinjau"
                  />
                ) : (
                  <div className="uploader__previewEmpty" aria-label="Belum ada gambar">
                    Pilih gambar untuk melihat pratinjau.
                  </div>
                )}
              </div>
            </aside>
          </div>

          <button
            className="uploader__submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Mengunggah..." : "Unggah Bouquet"}
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
