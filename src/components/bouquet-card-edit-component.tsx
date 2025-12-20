// src/components/bouquet-card-edit-component.tsx

import React, { useEffect, useMemo, useState } from "react";
import "../styles/BouquetCardEditComponent.css";
import type { Bouquet } from "../models/domain/bouquet";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

interface Props {
  bouquet: Bouquet;
  collections: string[];
  onSave: (formData: FormData) => Promise<boolean> | void;
}

type FormState = {
  _id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  size: string;
  status: "ready" | "preorder";
  collectionName: string;
};

const BouquetEditor: React.FC<Props> = ({ bouquet, collections, onSave }) => {
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<FormState>({
    _id: bouquet._id,
    name: bouquet.name,
    description: bouquet.description ?? "",
    price: bouquet.price,
    type: bouquet.type ?? "",
    size: bouquet.size ?? "",
    status: bouquet.status,
    collectionName: bouquet.collectionName ?? "",
  });

  const [file, setFile] = useState<File | null>(null);

  /**
   * preview:
   * - can be an existing server path (e.g. "/uploads/xxx.jpg")
   * - or a blob url when user selects new file
   */
  const [preview, setPreview] = useState<string>(bouquet.image ?? "");

  // If parent re-renders with a different bouquet, refresh the form
  useEffect(() => {
    setForm({
      _id: bouquet._id,
      name: bouquet.name,
      description: bouquet.description ?? "",
      price: bouquet.price,
      type: bouquet.type ?? "",
      size: bouquet.size ?? "",
      status: bouquet.status,
      collectionName: bouquet.collectionName ?? "",
    });

    setFile(null);
    setPreview(bouquet.image ?? "");
  }, [bouquet]);

  // Create a blob preview when user selects a new image
  useEffect(() => {
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const previewUrl = useMemo(() => {
    if (!preview) return "";
    if (preview.startsWith("blob:")) return preview;
    if (preview.startsWith("http://") || preview.startsWith("https://"))
      return preview;

    // assume server path
    return `${API_BASE}${preview}`;
  }, [preview]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
  };

  const validate = (): string | null => {
    if (!form.name.trim() || form.name.trim().length < 2)
      return "Name must be at least 2 characters.";
    if (!Number.isFinite(form.price) || form.price <= 0)
      return "Price must be greater than 0.";
    if (form.status !== "ready" && form.status !== "preorder")
      return "Invalid status.";
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      alert(error);
      return;
    }

    const fd = new FormData();
    fd.append("_id", form._id);

    // only attach image if user selected a new one
    if (file) fd.append("image", file);

    fd.append("name", form.name.trim());
    fd.append("description", form.description ?? "");
    fd.append("price", String(form.price));
    fd.append("type", form.type ?? "");
    fd.append("size", form.size ?? "");
    fd.append("status", form.status);
    fd.append("collectionName", form.collectionName ?? "");

    try {
      setSaving(true);

      const result = await onSave(fd);

      // If caller returns boolean, show feedback here. Otherwise caller can handle feedback.
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
    <article
      className="bouquetEditorCard"
      aria-label={`Edit bouquet ${form.name}`}
    >
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={form.name}
          className="bouquetEditorCard__image"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/placeholder-bouquet.jpg";
          }}
        />
      ) : (
        <div className="bouquetEditorCard__imagePlaceholder">No Image</div>
      )}

      <div className="bouquetEditorCard__body">
        <label className="field">
          Name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Bouquet name"
          />
        </label>

        <label className="field">
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Short bouquet description"
          />
        </label>

        <div className="fieldRow">
          <label className="field">
            Price (IDR)
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
            />
          </label>

          <label className="field">
            Status
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="ready">Ready</option>
              <option value="preorder">Preorder</option>
            </select>
          </label>
        </div>

        <div className="fieldRow">
          <label className="field">
            Type
            <input
              name="type"
              value={form.type}
              onChange={handleChange}
              placeholder="e.g., orchid"
            />
          </label>

          <label className="field">
            Size
            <select name="size" value={form.size} onChange={handleChange}>
              <option value="">Select size</option>
              {/* Match your backend values if you use small/medium/large */}
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="extra-large">Extra Large</option>
            </select>
          </label>
        </div>

        <label className="field">
          Collection
          <select
            name="collectionName"
            value={form.collectionName}
            onChange={handleChange}
          >
            <option value="">Select collection</option>
            {collections.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          Image
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>

        <button
          type="button"
          className="bouquetEditorCard__save"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </article>
  );
};

export default BouquetEditor;
