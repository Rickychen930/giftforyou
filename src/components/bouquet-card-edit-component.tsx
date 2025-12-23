import React, { useEffect, useMemo, useState } from "react";
import "../styles/BouquetCardEditComponent.css";
import type { Bouquet } from "../models/domain/bouquet";

import { API_BASE } from "../config/api";
import {
  BOUQUET_SIZE_OPTIONS,
  type BouquetSize,
} from "../constants/bouquet-constants";

const FALLBACK_IMAGE = "/images/placeholder-bouquet.jpg";

interface Props {
  bouquet: Bouquet;
  collections: string[];
  onSave: (formData: FormData) => Promise<boolean> | void;
}

type BouquetStatus = "ready" | "preorder";

type FormState = {
  _id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  size: BouquetSize;
  status: BouquetStatus;
  collectionName: string;
  quantity: number;
  occasionsText: string;
  flowersText: string;
  isNewEdition: boolean;
  isFeatured: boolean;
  careInstructions: string;
};

const TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: "Bouquet", value: "bouquet" },
  { label: "Hand-tied", value: "hand-tied" },
  { label: "Vase arrangement", value: "vase-arrangement" },
  { label: "Wreath", value: "wreath" },
  { label: "Basket", value: "basket" },
];



const buildPreviewUrl = (preview: string) => {
  if (!preview) return "";
  if (preview.startsWith("blob:")) return preview;
  if (preview.startsWith("http://") || preview.startsWith("https://"))
    return preview;

  const normalized = preview.startsWith("/") ? preview : `/${preview}`;

  // IMPORTANT:
  // API_BASE can be "" or "/api" in production -> not valid base for new URL().
  // Use current site origin as base when API_BASE is relative.
  if (!API_BASE || API_BASE.startsWith("/")) {
    return new URL(normalized, window.location.origin).toString();
  }

  // If API_BASE is absolute (e.g. https://api.example.com), this is valid.
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

const joinCsv = (list: unknown): string => {
  if (!Array.isArray(list)) return "";
  return list
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean)
    .join(", ");
};

const toNonNegativeInt = (v: string) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.trunc(n));
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
    type: bouquet.type ?? "",
    // IMPORTANT: your DB enum is Title Case (Extra-Small..Jumbo)
    size: (bouquet.size as BouquetSize) || "Medium",
    status: bouquet.status === "preorder" ? "preorder" : "ready",
    collectionName: bouquet.collectionName ?? "",
    quantity: typeof bouquet.quantity === "number" ? bouquet.quantity : 0,
    occasionsText: joinCsv(bouquet.occasions),
    flowersText: joinCsv(bouquet.flowers),
    isNewEdition: Boolean(bouquet.isNewEdition),
    isFeatured: Boolean(bouquet.isFeatured),
    careInstructions: bouquet.careInstructions ?? "",
  });

  useEffect(() => {
    setForm({
      _id: bouquet._id,
      name: bouquet.name ?? "",
      description: bouquet.description ?? "",
      price: Number.isFinite(bouquet.price) ? bouquet.price : 0,
      type: bouquet.type ?? "",
      size: (bouquet.size as BouquetSize) || "Medium",
      status: bouquet.status === "preorder" ? "preorder" : "ready",
      collectionName: bouquet.collectionName ?? "",
      quantity: typeof bouquet.quantity === "number" ? bouquet.quantity : 0,
      occasionsText: joinCsv(bouquet.occasions),
      flowersText: joinCsv(bouquet.flowers),
      isNewEdition: Boolean(bouquet.isNewEdition),
      isFeatured: Boolean(bouquet.isFeatured),
      careInstructions: bouquet.careInstructions ?? "",
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
    if (!Number.isFinite(form.quantity) || form.quantity < 0)
      return "Quantity must be 0 or higher.";
    if (form.status !== "ready" && form.status !== "preorder")
      return "Invalid status.";
    return null;
  }, [form.name, form.price, form.quantity, form.status]);

  const canSave = !saving && !validationError;

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "price"
          ? toNumber(value)
          : name === "quantity"
            ? toNonNegativeInt(value)
            : value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value } as FormState));
  };

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: checked } as FormState));
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
    fd.append("type", (form.type ?? "").trim());
    fd.append("size", form.size);
    fd.append("status", form.status);
    fd.append("collectionName", (form.collectionName ?? "").trim());
    fd.append("quantity", String(form.quantity ?? 0));
    fd.append("occasions", form.occasionsText ?? "");
    fd.append("flowers", form.flowersText ?? "");
    fd.append("isNewEdition", String(Boolean(form.isNewEdition)));
    fd.append("isFeatured", String(Boolean(form.isFeatured)));
    fd.append("careInstructions", form.careInstructions ?? "");

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
            <span className="becLabel">Quantity</span>
            <input
              name="quantity"
              type="number"
              min={0}
              step={1}
              value={form.quantity}
              onChange={handleTextChange}
              placeholder="0"
            />
          </label>

          <label className="becField">
            <span className="becLabel">Type</span>
            <input
              name="type"
              value={form.type}
              onChange={handleTextChange}
              placeholder="e.g., bouquet"
              list="bec-type-options"
              autoComplete="off"
            />
            <datalist id="bec-type-options">
              {TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value} />
              ))}
            </datalist>
          </label>

          <label className="becField">
            <span className="becLabel">Size</span>
            <select name="size" value={form.size} onChange={handleSelectChange}>
              {BOUQUET_SIZE_OPTIONS.map((s) => (
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

          <div className="becField becField--full">
            <span className="becLabel">Flags</span>
            <div className="becToggles" role="group" aria-label="Bouquet flags">
              <label className="becToggle">
                <input
                  type="checkbox"
                  name="isNewEdition"
                  checked={form.isNewEdition}
                  onChange={handleToggleChange}
                />
                <span>New edition</span>
              </label>

              <label className="becToggle">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleToggleChange}
                />
                <span>Featured</span>
              </label>
            </div>
          </div>

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
            <span className="becLabel">Occasions</span>
            <input
              name="occasionsText"
              value={form.occasionsText}
              onChange={handleTextChange}
              placeholder="e.g., Birthday, Anniversary, Graduation"
              autoComplete="off"
            />
            <span className="becHint">Separate values with commas.</span>
          </label>

          <label className="becField becField--full">
            <span className="becLabel">Flowers</span>
            <input
              name="flowersText"
              value={form.flowersText}
              onChange={handleTextChange}
              placeholder="e.g., Orchid, Rose, Lily"
              autoComplete="off"
            />
            <span className="becHint">Separate values with commas.</span>
          </label>

          <label className="becField becField--full">
            <span className="becLabel">Care instructions</span>
            <textarea
              name="careInstructions"
              value={form.careInstructions}
              onChange={handleTextChange}
              rows={3}
              placeholder="Optional care tips for the customer"
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
