import React, { useEffect, useMemo, useState } from "react";
import "../styles/BouquetCardEditComponent.css";
import type { Bouquet } from "../models/domain/bouquet";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";
const FALLBACK_IMAGE = "/images/placeholder-bouquet.jpg";

interface Props {
  bouquet: Bouquet;
  collections: string[];
  onSave: (formData: FormData) => Promise<boolean> | void;
}

type BouquetStatus = "ready" | "preorder";
type BouquetType =
  | "hand-tied"
  | "vase-arrangement"
  | "wreath"
  | "basket"
  | "bouquet";
type BouquetSize = "Small" | "Medium" | "Large" | "Extra-Large";

type FormState = {
  _id: string;
  name: string;
  description: string;
  price: number;
  type: BouquetType;
  size: BouquetSize;
  status: BouquetStatus;
  collectionName: string;
};

const TYPE_OPTIONS: { label: string; value: BouquetType }[] = [
  { label: "Bouquet", value: "bouquet" },
  { label: "Hand-tied", value: "hand-tied" },
  { label: "Vase arrangement", value: "vase-arrangement" },
  { label: "Wreath", value: "wreath" },
  { label: "Basket", value: "basket" },
];

const SIZE_OPTIONS: { label: string; value: BouquetSize }[] = [
  { label: "Small", value: "Small" },
  { label: "Medium", value: "Medium" },
  { label: "Large", value: "Large" },
  { label: "Extra large", value: "Extra-Large" },
];

const buildPreviewUrl = (preview: string) => {
  if (!preview) return "";
  if (preview.startsWith("blob:")) return preview;
  if (preview.startsWith("http://") || preview.startsWith("https://"))
    return preview;
  const normalized = preview.startsWith("/") ? preview : `/${preview}`;
  return new URL(normalized, API_BASE).toString();
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

const toNumber = (v: string) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const BouquetEditor: React.FC<Props> = ({ bouquet, collections, onSave }) => {
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(bouquet.image ?? "");

  const [form, setForm] = useState<FormState>({
    _id: bouquet._id,
    name: bouquet.name ?? "",
    description: bouquet.description ?? "",
    price: Number.isFinite(bouquet.price) ? bouquet.price : 0,
    type: (bouquet.type as BouquetType) || "bouquet",
    // IMPORTANT: your DB enum is Title Case (Small/Medium/...)
    size: (bouquet.size as BouquetSize) || "Medium",
    status: bouquet.status === "preorder" ? "preorder" : "ready",
    collectionName: bouquet.collectionName ?? "",
  });

  useEffect(() => {
    setForm({
      _id: bouquet._id,
      name: bouquet.name ?? "",
      description: bouquet.description ?? "",
      price: Number.isFinite(bouquet.price) ? bouquet.price : 0,
      type: (bouquet.type as BouquetType) || "bouquet",
      size: (bouquet.size as BouquetSize) || "Medium",
      status: bouquet.status === "preorder" ? "preorder" : "ready",
      collectionName: bouquet.collectionName ?? "",
    });

    setFile(null);
    setPreview(bouquet.image ?? "");
  }, [bouquet]);

  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const previewUrl = useMemo(() => buildPreviewUrl(preview), [preview]);

  const validationError = useMemo((): string | null => {
    const nm = form.name.trim();
    if (nm.length < 2) return "Name must be at least 2 characters.";
    if (!Number.isFinite(form.price) || form.price <= 0)
      return "Price must be greater than 0.";
    if (form.status !== "ready" && form.status !== "preorder")
      return "Invalid status.";
    return null;
  }, [form.name, form.price, form.status]);

  const canSave = !saving && !validationError;

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price" ? toNumber(value) : value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value } as FormState));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const handleSave = async () => {
    if (validationError) return;

    const fd = new FormData();
    fd.append("_id", form._id);
    if (file) fd.append("image", file);

    fd.append("name", form.name.trim());
    fd.append("description", form.description ?? "");
    fd.append("price", String(form.price));
    fd.append("type", form.type);
    fd.append("size", form.size);
    fd.append("status", form.status);
    fd.append("collectionName", (form.collectionName ?? "").trim());

    try {
      setSaving(true);
      const result = await onSave(fd);
      if (typeof result === "boolean") {
        alert(
          result
            ? "✅ Bouquet saved successfully."
            : "❌ Failed to save bouquet."
        );
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("❌ Failed to save bouquet.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="becCard" aria-label={`Edit bouquet ${form.name}`}>
      <header className="becHeader">
        <div className="becHeader__left">
          <h3
            className="becHeader__title"
            title={form.name || "Untitled bouquet"}
          >
            {form.name || "Untitled bouquet"}
          </h3>
          <p className="becHeader__sub">
            {formatPrice(form.price)} • {form.type} • {form.size}
          </p>
        </div>

        <span
          className={`becStatus ${
            form.status === "ready" ? "is-ready" : "is-preorder"
          }`}
        >
          {form.status === "ready" ? "Ready" : "Preorder"}
        </span>
      </header>

      <div className="becImage">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={form.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
        ) : (
          <div className="becImage__placeholder">No Image</div>
        )}
      </div>

      <div className="becBody">
        {validationError && (
          <div className="becAlert" role="alert">
            {validationError}
          </div>
        )}

        <div className="becGrid">
          <label className="becField">
            <span className="becLabel">Name</span>
            <input
              name="name"
              value={form.name}
              onChange={handleTextChange}
              placeholder="Bouquet name"
              autoComplete="off"
            />
          </label>

          <label className="becField">
            <span className="becLabel">Price (IDR)</span>
            <input
              name="price"
              type="number"
              min={0}
              step={1000}
              value={form.price}
              onChange={handleTextChange}
            />
          </label>

          <label className="becField">
            <span className="becLabel">Type</span>
            <select name="type" value={form.type} onChange={handleSelectChange}>
              {TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <label className="becField">
            <span className="becLabel">Size</span>
            <select name="size" value={form.size} onChange={handleSelectChange}>
              {SIZE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <label className="becField">
            <span className="becLabel">Status</span>
            <select
              name="status"
              value={form.status}
              onChange={handleSelectChange}
            >
              <option value="ready">Ready</option>
              <option value="preorder">Preorder</option>
            </select>
          </label>

          <label className="becField">
            <span className="becLabel">Collection</span>
            <select
              name="collectionName"
              value={form.collectionName}
              onChange={handleSelectChange}
            >
              <option value="">Select collection</option>
              {collections.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="becField becField--full">
            <span className="becLabel">Description</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleTextChange}
              rows={3}
              placeholder="Short bouquet description"
            />
          </label>

          <label className="becField becField--full">
            <span className="becLabel">Image</span>
            <input
              type="file"
              accept="image/*,.heic,.heif"
              onChange={handleImageChange}
            />
            <span className="becHint">
              PNG/JPG/WEBP/HEIC supported (HEIC will be converted).
            </span>
          </label>
        </div>

        <div className="becFooter">
          <button
            type="button"
            className="becSave"
            onClick={handleSave}
            disabled={!canSave}
            title={validationError ?? "Save changes"}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default BouquetEditor;
