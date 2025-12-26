import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import "../styles/BouquetCardEditComponent.css";
import type { Bouquet } from "../models/domain/bouquet";

import { API_BASE } from "../config/api";
import { formatIDR } from "../utils/money";
import {
  BOUQUET_SIZE_OPTIONS,
  type BouquetSize,
} from "../constants/bouquet-constants";

const FALLBACK_IMAGE = "/images/placeholder-bouquet.jpg";

interface Props {
  bouquet: Bouquet;
  collections: string[];
  onSave: (formData: FormData) => Promise<boolean> | void;
  onDuplicate?: (bouquetId: string) => Promise<void>;
  onDelete?: (bouquetId: string) => Promise<void>;
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
  customPenanda: string[];
  newPenandaInput: string;
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

const formatPrice = formatIDR;

const joinCsv = (list: unknown): string => {
  if (!Array.isArray(list)) return "";
  return list
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean)
    .join(", ");
};

type SaveStatus = "idle" | "success" | "error";

const BouquetEditor: React.FC<Props> = ({ bouquet, collections, onSave, onDuplicate, onDelete }) => {
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(bouquet.image ?? "");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);

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
    customPenanda: Array.isArray(bouquet.customPenanda) ? bouquet.customPenanda : [],
    newPenandaInput: "",
    careInstructions: bouquet.careInstructions ?? "",
  });

  const initialForm = useMemo<FormState>(() => {
    return {
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
      customPenanda: Array.isArray(bouquet.customPenanda) ? bouquet.customPenanda : [],
      newPenandaInput: "",
      careInstructions: bouquet.careInstructions ?? "",
    };
  }, [bouquet]);

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
      customPenanda: Array.isArray(bouquet.customPenanda) ? bouquet.customPenanda : [],
      newPenandaInput: "",
      careInstructions: bouquet.careInstructions ?? "",
    });

    setFile(null);
    setPreview(bouquet.image ?? "");
    setSaveStatus("idle");
    setSaveMessage("");
    setFieldErrors({});
    setTouchedFields(new Set());
    setImageDimensions(null);
  }, [bouquet]);

  useEffect(() => {
    if (saveStatus === "idle") return;
    const t = window.setTimeout(() => {
      setSaveStatus("idle");
      setSaveMessage("");
    }, 3500);
    return () => window.clearTimeout(t);
  }, [saveStatus]);

  // Cleanup blob URL on unmount or file change
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // Auto-focus first field when component mounts
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  // Close quick actions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(e.target as Node)) {
        setShowQuickActions(false);
      }
    };

    if (showQuickActions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showQuickActions]);

  const previewUrl = useMemo(() => buildPreviewUrl(preview), [preview]);

  // Enhanced validation
  const validateField = (name: string, value: unknown): string | null => {
    switch (name) {
      case "name": {
        const str = String(value).trim();
        if (str.length < 2) return "Nama minimal 2 karakter.";
        if (str.length > 100) return "Nama maksimal 100 karakter.";
        return null;
      }
      case "price": {
        const num = Number(value);
        if (!Number.isFinite(num) || num <= 0) return "Harga harus lebih dari 0.";
        if (num > 1000000000) return "Harga terlalu besar (maksimal 1 miliar).";
        return null;
      }
      case "size": {
        if (!value || String(value).trim() === "") return "Silakan pilih ukuran.";
        return null;
      }
      case "description": {
        const str = String(value).trim();
        if (str.length > 500) return "Deskripsi maksimal 500 karakter.";
        return null;
      }
      case "collectionName": {
        const str = String(value).trim();
        if (str.length > 100) return "Nama koleksi maksimal 100 karakter.";
        return null;
      }
      case "careInstructions": {
        const str = String(value).trim();
        if (str.length > 300) return "Instruksi perawatan maksimal 300 karakter.";
        return null;
      }
      case "occasionsText": {
        const str = String(value).trim();
        if (str) {
          const items = str.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
          if (items.length > 10) return "Maksimal 10 acara.";
        }
        return null;
      }
      case "flowersText": {
        const str = String(value).trim();
        if (str) {
          const items = str.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
          if (items.length > 20) return "Maksimal 20 jenis bunga.";
        }
        return null;
      }
      case "quantity": {
        const num = Number(value);
        if (!Number.isFinite(num) || num < 0) return "Stok tidak boleh negatif.";
        if (num > 100000) return "Stok terlalu besar (maksimal 100.000).";
        return null;
      }
      default:
        return null;
    }
  };

  const validationError = useMemo((): string | null => {
    const nameErr = validateField("name", form.name);
    if (nameErr) return nameErr;
    const priceErr = validateField("price", form.price);
    if (priceErr) return priceErr;
    const sizeErr = validateField("size", form.size);
    if (sizeErr) return sizeErr;
    if (form.status !== "ready" && form.status !== "preorder")
      return "Status tidak valid.";
    if (form.customPenanda.length > 10)
      return "Maksimal 10 penanda kustom.";
    return null;
  }, [form.name, form.price, form.size, form.status, form.customPenanda.length]);

  const canSave = !saving && !validationError;

  const isDirty = useMemo(() => {
    if (file) return true;
    return (
      form.name !== initialForm.name ||
      (form.description ?? "") !== (initialForm.description ?? "") ||
      form.price !== initialForm.price ||
      (form.type ?? "") !== (initialForm.type ?? "") ||
      form.size !== initialForm.size ||
      form.status !== initialForm.status ||
      (form.collectionName ?? "") !== (initialForm.collectionName ?? "") ||
      form.quantity !== initialForm.quantity ||
      (form.occasionsText ?? "") !== (initialForm.occasionsText ?? "") ||
      (form.flowersText ?? "") !== (initialForm.flowersText ?? "") ||
      Boolean(form.isNewEdition) !== Boolean(initialForm.isNewEdition) ||
      Boolean(form.isFeatured) !== Boolean(initialForm.isFeatured) ||
      JSON.stringify(form.customPenanda) !== JSON.stringify(initialForm.customPenanda) ||
      (form.careInstructions ?? "") !== (initialForm.careInstructions ?? "")
    );
  }, [file, form, initialForm]);

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouchedFields(prev => new Set([...prev, name]));
    
    // Update form
    setForm((prev) => {
      const newValue = name === "price"
        ? (() => {
            const num = Number(value);
            if (!Number.isFinite(num) || num < 0) return 0;
            return num;
          })()
        : name === "quantity"
          ? (() => {
              const num = Number(value);
              if (!Number.isFinite(num) || num < 0) return 0;
              return Math.max(0, Math.trunc(num));
            })()
          : value;
      
      // Validate field
      const error = validateField(name, newValue);
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[name] = error;
        } else {
          delete newErrors[name];
        }
        return newErrors;
      });
      
      return { ...prev, [name]: newValue };
    });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value } as FormState));
  };

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: checked } as FormState));
  };

  // Image compression function
  const compressImage = async (file: File, maxWidth: number = 1920, quality: number = 0.85): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to compress image"));
                return;
              }
              
              setImageDimensions({ width, height });
              
              const compressedFile = new File([blob], file.name, {
                type: file.type || "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            file.type || "image/jpeg",
            quality
          );
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const isAcceptableImage = (file: File): boolean => {
    const name = (file.name ?? "").toLowerCase();
    const type = (file.type ?? "").toLowerCase();
    
    if (type.startsWith("image/")) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"];
      if (validTypes.includes(type)) return true;
    }
    
    const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];
    return validExtensions.some(ext => name.endsWith(ext));
  };

  const formatBytes = (bytes: number): string => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const idx = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1
    );
    const val = bytes / Math.pow(1024, idx);
    return `${val.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
  };

  const formatPricePreview = (price: number): string => {
    if (!Number.isFinite(price) || price <= 0) return "";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getCharacterCountClass = (current: number, max: number): string => {
    if (current >= max) return "becHint--error";
    if (current >= max * 0.9) return "becHint--warning";
    return "";
  };

  const processImageFile = async (selectedFile: File): Promise<void> => {
    // Check file size (8MB limit)
    const maxSize = 8 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setSaveStatus("error");
      setSaveMessage("Ukuran file maksimal 8MB. Silakan pilih file yang lebih kecil.");
      return;
    }

    if (!isAcceptableImage(selectedFile)) {
      setSaveStatus("error");
      setSaveMessage("File harus berupa gambar (JPG/PNG/WEBP/HEIC).");
      return;
    }

    setIsImageLoading(true);
    setSaveStatus("idle");
    setSaveMessage("");

    try {
      // Compress image if it's large
      let processedFile = selectedFile;
      if (selectedFile.size > 2 * 1024 * 1024) {
        try {
          processedFile = await compressImage(selectedFile);
        } catch (compressError) {
          console.warn("Image compression failed, using original:", compressError);
        }
      }

      setFile(processedFile);
      const objectUrl = URL.createObjectURL(processedFile);
      setPreview(objectUrl);
    } catch (err) {
      console.error("Error processing image:", err);
      setSaveStatus("error");
      setSaveMessage("Gagal memproses gambar. Silakan coba file lain.");
      setFile(null);
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (!selectedFile) {
      setFile(null);
      return;
    }

    await processImageFile(selectedFile);
  };

  const resetImage = () => {
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(bouquet.image ?? "");
    setSaveStatus("idle");
    setSaveMessage("");
    setImageDimensions(null);
  };

  const handleAddPenanda = () => {
    const trimmed = form.newPenandaInput.trim();
    if (!trimmed) {
      setSaveStatus("error");
      setSaveMessage("Nama penanda tidak boleh kosong.");
      return;
    }
    
    if (form.customPenanda.length >= 10) {
      setSaveStatus("error");
      setSaveMessage("Maksimal 10 penanda kustom.");
      setForm(prev => ({ ...prev, newPenandaInput: "" }));
      return;
    }
    
    const lowerTrimmed = trimmed.toLowerCase();
    if (form.customPenanda.some(p => p.toLowerCase() === lowerTrimmed)) {
      setSaveStatus("error");
      setSaveMessage("Penanda ini sudah ada (tidak case-sensitive).");
      setForm(prev => ({ ...prev, newPenandaInput: "" }));
      return;
    }
    
    if (trimmed.length < 2) {
      setSaveStatus("error");
      setSaveMessage("Nama penanda minimal 2 karakter.");
      return;
    }
    
    if (trimmed.length > 30) {
      setSaveStatus("error");
      setSaveMessage("Nama penanda maksimal 30 karakter.");
      return;
    }
    
    const validPattern = /^[a-zA-Z0-9\s\-_.!?()]+$/;
    if (!validPattern.test(trimmed)) {
      setSaveStatus("error");
      setSaveMessage("Penanda hanya boleh mengandung huruf, angka, spasi, dan tanda baca umum (koma tidak diperbolehkan).");
      return;
    }
    
    if (trimmed.includes(",")) {
      setSaveStatus("error");
      setSaveMessage("Koma (,) tidak diperbolehkan dalam penanda.");
      return;
    }
    
    setForm(prev => ({
      ...prev,
      customPenanda: [...prev.customPenanda, trimmed],
      newPenandaInput: "",
    }));
  };

  const buildFormData = useCallback((): FormData => {
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
    fd.append("customPenanda", form.customPenanda.join(","));
    fd.append("careInstructions", form.careInstructions ?? "");
    return fd;
  }, [form, file]);

  const handleSave = useCallback(async () => {
    if (validationError) {
      // Scroll to first error
      const firstErrorField = Object.keys(fieldErrors)[0];
      if (firstErrorField) {
        const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
          (errorElement as HTMLElement).focus();
        }
      }
      return;
    }
    if (!isDirty) return;

    try {
      setSaving(true);
      const fd = buildFormData();
      const result = await onSave(fd);
      if (typeof result === "boolean") {
        setSaveStatus(result ? "success" : "error");
        setSaveMessage(
          result ? "Perubahan tersimpan." : "Gagal menyimpan. Coba lagi."
        );
        if (result) {
          // Clear file after successful save
          setFile(null);
          setImageDimensions(null);
          // Scroll to success message
          setTimeout(() => {
            const messageEl = document.querySelector(".becSaveNote.is-show");
            if (messageEl) {
              messageEl.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 100);
        }
      } else {
        setSaveStatus("success");
        setSaveMessage("Perubahan tersimpan.");
        setFile(null);
        setImageDimensions(null);
        setTimeout(() => {
          const messageEl = document.querySelector(".becSaveNote.is-show");
          if (messageEl) {
            messageEl.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      }
    } catch (err) {
      console.error("Save error:", err);
      setSaveStatus("error");
      setSaveMessage("Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }, [validationError, isDirty, buildFormData, onSave, fieldErrors]);

  const resetForm = useCallback(() => {
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
      customPenanda: Array.isArray(bouquet.customPenanda) ? bouquet.customPenanda : [],
      newPenandaInput: "",
      careInstructions: bouquet.careInstructions ?? "",
    });
    setFile(null);
    setPreview(bouquet.image ?? "");
    setFieldErrors({});
    setTouchedFields(new Set());
    setImageDimensions(null);
    setSaveStatus("idle");
    setSaveMessage("");
  }, [bouquet]);

  const handleDuplicate = useCallback(async () => {
    if (!onDuplicate) return;
    
    try {
      setIsDuplicating(true);
      await onDuplicate(bouquet._id);
      setSaveStatus("success");
      setSaveMessage("Bouquet berhasil diduplikasi!");
      setShowQuickActions(false);
    } catch (err) {
      console.error("Duplicate error:", err);
      setSaveStatus("error");
      setSaveMessage("Gagal menduplikasi bouquet.");
    } finally {
      setIsDuplicating(false);
    }
  }, [onDuplicate, bouquet._id]);

  const handleDelete = useCallback(async () => {
    if (!onDelete) return;
    
    try {
      setIsDeleting(true);
      await onDelete(bouquet._id);
      setShowDeleteConfirm(false);
      setShowQuickActions(false);
    } catch (err) {
      console.error("Delete error:", err);
      setSaveStatus("error");
      setSaveMessage("Gagal menghapus bouquet.");
      setIsDeleting(false);
    }
  }, [onDelete, bouquet._id]);

  // Keyboard shortcuts (moved after function definitions)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (canSave && isDirty) {
          handleSave();
        }
      }
      // Escape to reset changes
      if (e.key === "Escape" && isDirty) {
        if (window.confirm("Apakah Anda yakin ingin membatalkan perubahan?")) {
          resetForm();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canSave, isDirty, handleSave, resetForm]);

  return (
    <article className="becCard" aria-label={`Edit bouquet ${form.name}`}>
      <header className="becHeader">
        <div className="becHeader__left">
          <h3
            className="becHeader__title"
            title={form.name || "Bouquet tanpa judul"}
          >
            <span className="becHeader__titleText">{form.name || "Bouquet tanpa judul"}</span>
            {isDirty && (
              <span className="becDirtyIndicator" title="Ada perubahan yang belum disimpan" aria-label="Perubahan belum disimpan">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="4" cy="4" r="4" fill="currentColor"/>
                </svg>
              </span>
            )}
          </h3>
          <p className="becHeader__sub">
            {formatPrice(form.price)} • {form.type} • {form.size}
          </p>
        </div>

        <div className="becHeader__right">
          <span
            className={`becStatus ${
              form.status === "ready" ? "is-ready" : "is-preorder"
            }`}
          >
            {form.status === "ready" ? "Siap" : "Preorder"}
          </span>
          
          {(onDuplicate || onDelete) && (
            <div className="becQuickActions" ref={quickActionsRef}>
              <button
                type="button"
                className="becQuickActionsBtn"
                onClick={() => setShowQuickActions(!showQuickActions)}
                aria-label="Quick actions"
                aria-expanded={showQuickActions}
                title="Quick actions"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="5" r="2" fill="currentColor"/>
                  <circle cx="12" cy="12" r="2" fill="currentColor"/>
                  <circle cx="12" cy="19" r="2" fill="currentColor"/>
                </svg>
              </button>
              
              {showQuickActions && (
                <div className="becQuickActionsMenu">
                  {onDuplicate && (
                    <button
                      type="button"
                      className="becQuickActionItem"
                      onClick={handleDuplicate}
                      disabled={isDuplicating}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 8V5C8 3.89543 8.89543 3 10 3H19C20.1046 3 21 3.89543 21 5V14C21 15.1046 20.1046 16 19 16H16M5 8H16C17.1046 8 18 8.89543 18 10V19C18 20.1046 17.1046 21 16 21H5C3.89543 21 3 20.1046 3 19V10C3 8.89543 3.89543 8 5 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {isDuplicating ? "Menduplikasi..." : "Duplikasi"}
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      className="becQuickActionItem becQuickActionItem--danger"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isDeleting}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Hapus
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {showDeleteConfirm && (
        <div className="becModalOverlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="becModal" onClick={(e) => e.stopPropagation()}>
            <h3 className="becModalTitle">Hapus Bouquet?</h3>
            <p className="becModalText">
              Apakah Anda yakin ingin menghapus "{form.name}"? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="becModalActions">
              <button
                type="button"
                className="becModalBtn becModalBtn--cancel"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Batal
              </button>
              <button
                type="button"
                className="becModalBtn becModalBtn--danger"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="becImage">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={form.name}
            loading="lazy"
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth && img.naturalHeight && !imageDimensions) {
                setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
              }
            }}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
        ) : (
          <div className="becImage__placeholder">Tanpa gambar</div>
        )}
      </div>

      <div className="becBody">
        {validationError && (
          <div 
            className="becAlert" 
            role="alert"
            aria-live="polite"
            aria-atomic="true"
            ref={(el) => {
              if (el && touchedFields.size > 0) {
                setTimeout(() => {
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 100);
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }} aria-hidden="true">
              <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{validationError}</span>
          </div>
        )}

        {saveStatus === "success" && saveMessage && (
          <div 
            className="becAlert becAlert--success" 
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }} aria-hidden="true">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{saveMessage}</span>
          </div>
        )}

        {saveStatus === "error" && saveMessage && (
          <div 
            className="becAlert becAlert--error" 
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }} aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{saveMessage}</span>
          </div>
        )}

        <div className="becGrid">
          <label className="becField">
            <span className="becLabel">Nama</span>
            <input
              ref={nameInputRef}
              name="name"
              value={form.name}
              onChange={handleTextChange}
              placeholder="Nama bouquet"
              autoComplete="off"
              aria-invalid={touchedFields.has("name") && fieldErrors.name ? "true" : "false"}
              aria-describedby={touchedFields.has("name") && fieldErrors.name ? "bec-name-error" : undefined}
            />
            {touchedFields.has("name") && fieldErrors.name && (
              <span id="bec-name-error" className="becHint becHint--error" role="alert">
                {fieldErrors.name}
              </span>
            )}
            <span className={`becHint ${getCharacterCountClass(form.name.length, 100)}`}>
              {form.name.length}/100
            </span>
          </label>

          <label className="becField">
            <span className="becLabel">Harga (IDR)</span>
            <input
              name="price"
              type="number"
              min={0}
              step={1000}
              value={form.price || ""}
              onChange={handleTextChange}
              aria-invalid={touchedFields.has("price") && fieldErrors.price ? "true" : "false"}
              aria-describedby={touchedFields.has("price") && fieldErrors.price ? "bec-price-error" : undefined}
            />
            {touchedFields.has("price") && fieldErrors.price && (
              <span id="bec-price-error" className="becHint becHint--error" role="alert">
                {fieldErrors.price}
              </span>
            )}
            {form.price > 0 && (
              <span className="becHint" style={{ color: "var(--brand-rose-500)", fontWeight: 700 }}>
                {formatPricePreview(form.price)}
              </span>
            )}
          </label>

          <label className="becField">
            <span className="becLabel">Stok</span>
            <input
              name="quantity"
              type="number"
              min={0}
              step={1}
              value={form.quantity || ""}
              onChange={handleTextChange}
              placeholder="0"
              aria-invalid={touchedFields.has("quantity") && fieldErrors.quantity ? "true" : "false"}
              aria-describedby={touchedFields.has("quantity") && fieldErrors.quantity ? "bec-quantity-error" : undefined}
            />
            {touchedFields.has("quantity") && fieldErrors.quantity && (
              <span id="bec-quantity-error" className="becHint becHint--error" role="alert">
                {fieldErrors.quantity}
              </span>
            )}
          </label>

          <label className="becField">
            <span className="becLabel">Tipe</span>
            <input
              name="type"
              value={form.type}
              onChange={handleTextChange}
              placeholder="mis., bouquet"
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
            <span className="becLabel">Ukuran</span>
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
              <option value="ready">Siap</option>
              <option value="preorder">Preorder</option>
            </select>
          </label>

          <label className="becField">
            <span className="becLabel">Koleksi</span>
            <select
              name="collectionName"
              value={form.collectionName}
              onChange={handleSelectChange}
            >
              <option value="">Pilih koleksi</option>
              {collections.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <div className="becField becField--full">
            <span className="becLabel">Penanda</span>
            <div className="becToggles" role="group" aria-label="Penanda bouquet">
              <label className="becToggle">
                <input
                  type="checkbox"
                  name="isNewEdition"
                  checked={form.isNewEdition}
                  onChange={handleToggleChange}
                />
                <span>Edisi baru</span>
              </label>

              <label className="becToggle">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleToggleChange}
                />
                <span>Unggulan</span>
              </label>
            </div>
          </div>

          <div className="becField becField--full becCustomPenanda">
            <span className="becLabel">
              Custom Penanda
              {form.customPenanda.length > 0 && (
                <span className="becPenandaCount">({form.customPenanda.length}/10)</span>
              )}
            </span>
            {form.customPenanda.length > 0 && (
              <div className="becPenandaList">
                {form.customPenanda.map((penanda, index) => (
                  <span key={`penanda-${index}-${penanda}`} className="becPenandaTag">
                    <span className="becPenandaTagText" title={penanda}>{penanda}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setForm(prev => ({
                          ...prev,
                          customPenanda: prev.customPenanda.filter((_, i) => i !== index),
                        }));
                      }}
                      aria-label={`Hapus penanda ${penanda}`}
                      className="becPenandaDelete"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="becAddPenanda">
              <div className="becPenandaInputWrapper">
                <input
                  type="text"
                  className="becPenandaInput"
                  value={form.newPenandaInput}
                  onChange={(e) => setForm(prev => ({ ...prev, newPenandaInput: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddPenanda();
                    }
                  }}
                  placeholder="Tambah penanda baru..."
                  maxLength={30}
                  disabled={form.customPenanda.length >= 10}
                />
                <span className={`becPenandaCharCount ${getCharacterCountClass(form.newPenandaInput.length, 30)}`}>
                  {form.newPenandaInput.length}/30
                </span>
              </div>
              <button
                type="button"
                className="becAddPenandaBtn"
                onClick={handleAddPenanda}
                disabled={form.customPenanda.length >= 10 || !form.newPenandaInput.trim()}
              >
                Tambah
              </button>
            </div>
            {form.customPenanda.length >= 10 && (
              <span className="becHint becHint--warning">
                Maksimal 10 penanda kustom.
              </span>
            )}
          </div>

          <label className="becField becField--full">
            <span className="becLabel">Deskripsi</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleTextChange}
              rows={3}
              placeholder="Deskripsi singkat bouquet"
              aria-invalid={touchedFields.has("description") && fieldErrors.description ? "true" : "false"}
              aria-describedby={touchedFields.has("description") && fieldErrors.description ? "bec-description-error" : undefined}
            />
            {touchedFields.has("description") && fieldErrors.description && (
              <span id="bec-description-error" className="becHint becHint--error" role="alert">
                {fieldErrors.description}
              </span>
            )}
            <span className={`becHint ${getCharacterCountClass(form.description.length, 500)}`}>
              {form.description.length}/500
            </span>
          </label>

          <label className="becField becField--full">
            <span className="becLabel">Acara</span>
            <input
              name="occasionsText"
              value={form.occasionsText}
              onChange={handleTextChange}
              placeholder="mis., Ulang Tahun, Anniversary, Wisuda"
              autoComplete="off"
            />
            <span className="becHint">Pisahkan dengan koma.</span>
          </label>

          <label className="becField becField--full">
            <span className="becLabel">Bunga</span>
            <input
              name="flowersText"
              value={form.flowersText}
              onChange={handleTextChange}
              placeholder="mis., Orchid, Mawar, Lily"
              autoComplete="off"
            />
            <span className="becHint">Pisahkan dengan koma.</span>
          </label>

          <label className="becField becField--full">
            <span className="becLabel">Instruksi perawatan</span>
            <textarea
              name="careInstructions"
              value={form.careInstructions}
              onChange={handleTextChange}
              rows={3}
              placeholder="Tips perawatan (opsional) untuk pelanggan"
              aria-invalid={touchedFields.has("careInstructions") && fieldErrors.careInstructions ? "true" : "false"}
              aria-describedby={touchedFields.has("careInstructions") && fieldErrors.careInstructions ? "bec-care-error" : undefined}
            />
            {touchedFields.has("careInstructions") && fieldErrors.careInstructions && (
              <span id="bec-care-error" className="becHint becHint--error" role="alert">
                {fieldErrors.careInstructions}
              </span>
            )}
            <span className={`becHint ${getCharacterCountClass(form.careInstructions.length, 300)}`}>
              {form.careInstructions.length}/300
            </span>
          </label>

          <div className="becField becField--full">
            <span className="becLabel">Gambar</span>
            <div
              className={`becDropzone ${isDraggingImage ? "is-dragging" : ""} ${isImageLoading ? "is-loading" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDraggingImage(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setIsDraggingImage(false);
                }
              }}
              onDrop={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDraggingImage(false);
                const droppedFile = e.dataTransfer.files?.[0];
                if (droppedFile) {
                  await processImageFile(droppedFile);
                }
              }}
            >
              {isImageLoading ? (
                <div className="becDropzoneLoading">
                  <div className="becSpinner"></div>
                  <span>Memproses gambar...</span>
                </div>
              ) : (
                <>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Seret gambar ke sini atau klik untuk memilih</span>
                  <span className="becHint">PNG/JPG/WEBP/HEIC didukung (maks. 8MB)</span>
                </>
              )}
              <input
                className="becFile"
                type="file"
                accept="image/*,.heic,.heif"
                onChange={handleImageChange}
                disabled={isImageLoading}
                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
              />
            </div>
            {file && (
              <div className="becFileInfo">
                <span className="becHint">
                  File: {file.name} ({formatBytes(file.size)})
                  {imageDimensions && ` • ${imageDimensions.width}×${imageDimensions.height}px`}
                </span>
                <button
                  type="button"
                  className="becGhost"
                  onClick={resetImage}
                  title="Hapus gambar baru"
                >
                  Hapus
                </button>
              </div>
            )}
            {!file && previewUrl && (
              <div className="becFileInfo">
                <span className="becHint">Menggunakan gambar yang ada</span>
                <button
                  type="button"
                  className="becGhost"
                  onClick={resetImage}
                  disabled
                  title="Tidak ada perubahan gambar"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="becFooter">
          <button
            type="button"
            className="becSave"
            onClick={handleSave}
            disabled={!canSave || !isDirty || saving}
            title={
              saving
                ? "Menyimpan..."
                : validationError
                  ? validationError
                  : !isDirty
                    ? "Tidak ada perubahan"
                    : "Simpan perubahan (Ctrl+S)"
            }
            aria-busy={saving}
            aria-label={
              saving
                ? "Menyimpan perubahan"
                : validationError
                  ? `Tidak dapat menyimpan: ${validationError}`
                  : !isDirty
                    ? "Tidak ada perubahan untuk disimpan"
                    : "Simpan perubahan bouquet"
            }
          >
            {saving ? (
              <>
                <div className="becSaveSpinner"></div>
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                  <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 3V8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

export default React.memo(BouquetEditor);
