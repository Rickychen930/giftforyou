import React, { useState, useEffect } from "react";
import "../styles/BouquetCardEditComponent.css";
import { IBouquet } from "../models/bouquet-model-real";

interface BouquetForm {
  _id: string;
  name: string;
  description?: string;
  price: number;
  type?: string;
  size?: string;
  image?: string;
  status: "ready" | "preorder";
  collectionName?: string;
}

interface Props {
  bouquet: IBouquet;
  collections: string[];
  onSave: (formData: FormData) => void;
}

const BouquetEditor: React.FC<Props> = ({ bouquet, collections, onSave }) => {
  // convert IBouquet (ObjectId) → BouquetForm (string id)
  const initialForm: BouquetForm = {
    _id: String(bouquet._id),
    name: bouquet.name,
    description: bouquet.description,
    price: bouquet.price,
    type: bouquet.type,
    size: bouquet.size,
    image: bouquet.image,
    status: bouquet.status,
    collectionName: bouquet.collectionName,
  };

  const [form, setForm] = useState<BouquetForm>(initialForm);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>(bouquet.image);

  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

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
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append("_id", form._id); // ✅ string, bukan ObjectId
    if (file) formData.append("image", file);
    formData.append("name", form.name);
    formData.append("price", form.price.toString());
    formData.append("status", form.status);
    formData.append("description", form.description ?? "");
    formData.append("type", form.type ?? "");
    formData.append("size", form.size ?? "");
    formData.append("collectionName", form.collectionName ?? "");
    onSave(formData);
  };

  return (
    <div className="bouquet-editor">
      {preview && (
        <img
          src={
            preview.startsWith("blob")
              ? preview
              : `http://localhost:4000${preview}`
          }
          alt={form.name}
          className="bouquet-image"
        />
      )}

      {/* Form fields */}
      <label htmlFor="name">Name:</label>
      <input
        id="name"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Bouquet Name"
      />

      <label htmlFor="description">Description:</label>
      <textarea
        id="description"
        name="description"
        value={form.description ?? ""}
        onChange={handleChange}
        placeholder="Description"
      />

      <label htmlFor="price">Price (Rp):</label>
      <input
        id="price"
        name="price"
        type="number"
        value={form.price}
        onChange={handleChange}
        placeholder="Price"
      />

      <label htmlFor="type">Type:</label>
      <input
        id="type"
        name="type"
        value={form.type ?? ""}
        onChange={handleChange}
        placeholder="Type"
      />

      <label htmlFor="size">Size:</label>
      <select
        id="size"
        name="size"
        value={form.size ?? ""}
        onChange={handleChange}
      >
        <option value="">Select Size</option>
        <option value="Small">Small</option>
        <option value="Medium">Medium</option>
        <option value="Large">Large</option>
      </select>

      <label htmlFor="collectionName">Collection:</label>
      <select
        id="collectionName"
        name="collectionName"
        value={form.collectionName ?? ""}
        onChange={handleChange}
      >
        <option value="">Select Collection</option>
        {collections.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <label htmlFor="status">Status:</label>
      <select
        id="status"
        name="status"
        value={form.status}
        onChange={handleChange}
      >
        <option value="ready">Ready</option>
        <option value="preorder">Preorder</option>
      </select>

      <label htmlFor="image">Image:</label>
      <input
        id="image"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />

      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default BouquetEditor;
