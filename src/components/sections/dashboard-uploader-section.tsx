import React, { Component } from "react";
import "../../styles/DashboardUploaderSection.css";
import { BOUQUET_SIZE_OPTIONS } from "../../constants/bouquet-constants";
import DropdownWithModal from "../DropdownWithModal";
import TagInput from "../TagInput";
import { getDropdownOptions } from "../../services/dropdown-options.service";

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
  occasions: string[]; // New: array for occasions
  flowersText: string;
  flowers: string[]; // New: array for flowers
  isNewEdition: boolean;
  isFeatured: boolean;
  customPenanda: string[];
  newPenandaInput: string;
  careInstructions: string;

  file: File | null;
  previewUrl: string;

  isDraggingImage: boolean;

  submitting: boolean;
  message: string;
  messageType: "success" | "error" | "";
  
  // Enhanced validation states
  fieldErrors: Record<string, string>;
  touchedFields: Set<string>;
  
  // New states for better UX
  isImageLoading: boolean;
  uploadProgress: number;
  
  // New features
  hasDraft: boolean;
  isSavingDraft: boolean;
  showValidationSummary: boolean;
  imageDimensions: { width: number; height: number } | null;
  
  // Database-synced options
  collectionOptions: string[];
  typeOptions: string[];
  occasionOptions: string[];
  flowerOptions: string[];
  stockLevelOptions: string[];
  sizeOptions: string[];
  statusOptions: string[];
}

const DRAFT_STORAGE_KEY = "bouquet_uploader_draft";
const AUTO_SAVE_INTERVAL = 2000; // 2 seconds

// Default options for dropdowns
const DEFAULT_COLLECTIONS = [
  "Best Sellers",
  "Wedding Collection",
  "Sympathy Flowers",
  "New Edition",
  "Featured",
  "Special Occasions",
];

const DEFAULT_TYPES = [
  "bouquet",
  "gift box",
  "stand acrylic",
  "artificial bouquet",
  "fresh flowers",
  "custom arrangement",
];

// DEFAULT_OCCASIONS removed - using TagInput with localStorage instead

const DEFAULT_STOCK_LEVELS = [
  "0",
  "1",
  "5",
  "10",
  "20",
  "50",
  "100",
  "200",
  "500",
  "1000",
];

class BouquetUploader extends Component<Props, State> {
  private fileInputRef = React.createRef<HTMLInputElement>();
  private formRef = React.createRef<HTMLFormElement>();
  private validationTimeout: NodeJS.Timeout | null = null;
  private imageLoadTimeout: NodeJS.Timeout | null = null;
  private autoSaveTimeout: NodeJS.Timeout | null = null;
  private scrollTimeout: NodeJS.Timeout | null = null;
  private imageElementRef: HTMLImageElement | null = null;
  private componentMounted = false;

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
      occasions: [],
      flowersText: "",
      flowers: [],
      isNewEdition: false,
      isFeatured: false,
      customPenanda: [],
      newPenandaInput: "",
      careInstructions: "",

      file: null,
      previewUrl: "",

      isDraggingImage: false,

      submitting: false,
      message: "",
      messageType: "",
      fieldErrors: {},
      touchedFields: new Set(),
      isImageLoading: false,
      uploadProgress: 0,
      hasDraft: false,
      isSavingDraft: false,
      showValidationSummary: false,
      imageDimensions: null,
      
      // Database-synced options
      collectionOptions: DEFAULT_COLLECTIONS,
      typeOptions: DEFAULT_TYPES,
      occasionOptions: [],
      flowerOptions: [],
      stockLevelOptions: DEFAULT_STOCK_LEVELS,
      sizeOptions: BOUQUET_SIZE_OPTIONS.map((opt) => opt.value),
      statusOptions: ["ready", "preorder"],
    };
  }

  componentDidMount(): void {
    this.componentMounted = true;
    
    // Check for draft existence first (silently)
    this.checkDraftExists();
    
    // Load draft on mount (silently, no message)
    this.loadDraftSilently();
    
    // Set up auto-save
    this.startAutoSave();
    
    // Set up keyboard shortcuts
    window.addEventListener("keydown", this.handleKeyboardShortcuts);
    
    // Load dropdown options from database
    this.loadDropdownOptions();
  }
  
  private loadDropdownOptions = async (): Promise<void> => {
    try {
      const options = await getDropdownOptions();
      this.setState({
        collectionOptions: options.collections,
        typeOptions: options.types,
        occasionOptions: options.occasions,
        flowerOptions: options.flowers,
        stockLevelOptions: options.stockLevels,
      });
    } catch (err) {
      // Failed to load dropdown options - log in development only
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.error("Failed to load dropdown options:", err);
      }
      // Keep defaults
    }
  };
  
  private loadDraftSilently(): void {
    try {
      const draftJson = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!draftJson) return;

      const draft = JSON.parse(draftJson);
      
      // Only load if draft is recent (less than 7 days old)
      if (draft.timestamp && Date.now() - draft.timestamp < 7 * 24 * 60 * 60 * 1000) {
        this.setState({
          name: draft.name || "",
          description: draft.description || "",
          price: draft.price || 0,
          type: draft.type || "bouquet",
          size: draft.size || "Medium",
          status: draft.status || "ready",
          collectionName: draft.collectionName || "",
          quantity: draft.quantity || 0,
          occasionsText: draft.occasionsText || "",
          occasions: Array.isArray(draft.occasions) ? draft.occasions : (draft.occasionsText ? draft.occasionsText.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
          flowersText: draft.flowersText || "",
          flowers: Array.isArray(draft.flowers) ? draft.flowers : (draft.flowersText ? draft.flowersText.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
          isNewEdition: draft.isNewEdition || false,
          isFeatured: draft.isFeatured || false,
          customPenanda: Array.isArray(draft.customPenanda) ? draft.customPenanda : [],
          careInstructions: draft.careInstructions || "",
          hasDraft: true,
          fieldErrors: {},
        });
      } else {
        // Clear old draft silently
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        this.setState({ hasDraft: false });
      }
    } catch (err) {
      // Error loading draft - log in development only
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.error("Error loading draft:", err);
      }
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      this.setState({ hasDraft: false });
    }
  }

  componentWillUnmount(): void {
    this.componentMounted = false;
    
    // Cleanup all timeouts
    if (this.validationTimeout) {
      clearTimeout(this.validationTimeout);
      this.validationTimeout = null;
    }
    if (this.imageLoadTimeout) {
      clearTimeout(this.imageLoadTimeout);
      this.imageLoadTimeout = null;
    }
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
      this.autoSaveTimeout = null;
    }
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = null;
    }
    
    // Cleanup blob URL
    if (this.state.previewUrl && this.state.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(this.state.previewUrl);
    }
    
    // Cleanup file input
    if (this.fileInputRef.current) {
      this.fileInputRef.current.value = "";
    }
    
    // Remove keyboard listener
    window.removeEventListener("keydown", this.handleKeyboardShortcuts);
  }

  private checkDraftExists(): void {
    try {
      const draft = localStorage.getItem(DRAFT_STORAGE_KEY);
      this.setState({ hasDraft: !!draft });
    } catch {
      // Ignore localStorage errors
    }
  }

  private loadDraft = (): void => {
    try {
      const draftJson = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!draftJson) {
        this.setMessage("Tidak ada draft tersimpan.", "error");
        this.setState({ hasDraft: false });
        return;
      }

      const draft = JSON.parse(draftJson);
      
      // Only load if draft is recent (less than 7 days old)
      if (draft.timestamp && Date.now() - draft.timestamp < 7 * 24 * 60 * 60 * 1000) {
        this.setState({
          name: draft.name || "",
          description: draft.description || "",
          price: draft.price || 0,
          type: draft.type || "bouquet",
          size: draft.size || "Medium",
          status: draft.status || "ready",
          collectionName: draft.collectionName || "",
          quantity: draft.quantity || 0,
          occasionsText: draft.occasionsText || "",
          occasions: Array.isArray(draft.occasions) ? draft.occasions : (draft.occasionsText ? draft.occasionsText.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
          flowersText: draft.flowersText || "",
          flowers: Array.isArray(draft.flowers) ? draft.flowers : (draft.flowersText ? draft.flowersText.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
          isNewEdition: draft.isNewEdition || false,
          isFeatured: draft.isFeatured || false,
          customPenanda: Array.isArray(draft.customPenanda) ? draft.customPenanda : [],
          careInstructions: draft.careInstructions || "",
          hasDraft: true,
          // Clear any previous errors when loading draft
          fieldErrors: {},
        });
        
        // Show success message
        this.setMessage("Draft berhasil dimuat.", "success");
        
        // Scroll to top to show the loaded data
        if (this.scrollTimeout) {
          clearTimeout(this.scrollTimeout);
        }
        this.scrollTimeout = setTimeout(() => {
          if (this.componentMounted) {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }, 100);
      } else {
        // Clear old draft
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        this.setState({ hasDraft: false });
        this.setMessage("Draft sudah kedaluwarsa (lebih dari 7 hari) dan telah dihapus.", "error");
      }
    } catch (err) {
      // Error loading draft - log in development only
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.error("Error loading draft:", err);
      }
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      this.setState({ hasDraft: false });
      this.setMessage("Gagal memuat draft. Data mungkin rusak.", "error");
    }
  };

  private saveDraft = (): void => {
    try {
      const draft = {
        name: this.state.name,
        description: this.state.description,
        price: this.state.price,
        type: this.state.type,
        size: this.state.size,
        status: this.state.status,
        collectionName: this.state.collectionName,
        quantity: this.state.quantity,
        occasionsText: this.state.occasionsText,
        occasions: this.state.occasions,
        flowersText: this.state.flowersText,
        flowers: this.state.flowers,
        isNewEdition: this.state.isNewEdition,
        isFeatured: this.state.isFeatured,
        customPenanda: this.state.customPenanda,
        careInstructions: this.state.careInstructions,
        timestamp: Date.now(),
      };

      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      this.setState({ hasDraft: true, isSavingDraft: false });
    } catch (err) {
      // Error saving draft - log in development only
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.error("Error saving draft:", err);
      }
      this.setState({ isSavingDraft: false });
    }
  };

  private clearDraft = (): void => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      this.setState({ hasDraft: false });
      this.setMessage("Draft dihapus.", "success");
    } catch (err) {
      // Error clearing draft - log in development only
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.error("Error clearing draft:", err);
      }
    }
  };

  private startAutoSave(): void {
    // Clear any existing timeout
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
    
    this.autoSaveTimeout = setTimeout(() => {
      // Check if component is still mounted before continuing
      if (!this.componentMounted) return;
      
      if (this.hasFormData() && !this.state.submitting) {
        this.setState({ isSavingDraft: true });
        this.saveDraft();
      }
      
      // Only continue if component is still mounted
      if (this.componentMounted) {
        this.startAutoSave();
      }
    }, AUTO_SAVE_INTERVAL);
  }

  private hasFormData(): boolean {
    return !!(
      this.state.name.trim() ||
      this.state.description.trim() ||
      this.state.price > 0 ||
      this.state.collectionName.trim() ||
      this.state.occasionsText.trim() ||
      this.state.flowersText.trim() ||
      this.state.careInstructions.trim() ||
      this.state.customPenanda.length > 0 ||
      this.state.file ||
      this.state.isNewEdition ||
      this.state.isFeatured ||
      this.state.quantity > 0
    );
  }

  private handleKeyboardShortcuts = (e: KeyboardEvent): void => {
    // Only handle if not typing in input
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      // Allow Ctrl/Cmd + S even in inputs
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (this.hasFormData() && !this.state.submitting) {
          this.setState({ isSavingDraft: true });
          this.saveDraft();
          this.setMessage("Draft tersimpan.", "success");
        }
      }
      return;
    }

    // Ctrl/Cmd + S to save draft
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      if (this.hasFormData() && !this.state.submitting) {
        this.setState({ isSavingDraft: true });
        this.saveDraft();
        this.setMessage("Draft tersimpan.", "success");
      }
    }

    // Esc to clear form (with confirmation)
    if (e.key === "Escape" && this.hasFormData() && !this.state.submitting) {
      if (window.confirm("Hapus semua data form? Draft akan tetap tersimpan.")) {
        this.resetForm();
      }
    }
  };

  private resetForm = (): void => {
    if (this.fileInputRef.current) {
      this.fileInputRef.current.value = "";
    }

    if (this.state.previewUrl && this.state.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(this.state.previewUrl);
    }

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
      occasions: [],
      flowersText: "",
      flowers: [],
      isNewEdition: false,
      isFeatured: false,
      customPenanda: [],
      newPenandaInput: "",
      careInstructions: "",
      file: null,
      previewUrl: "",
      fieldErrors: {},
      touchedFields: new Set(),
      isImageLoading: false,
      imageDimensions: null,
      message: "",
      messageType: "",
    });
  };

  private setMessage(message: string, messageType: State["messageType"]) {
    // Show server error details if present
    if (typeof message === "string" && message.startsWith("Upload failed")) {
      const match = message.match(/Upload failed \(\d+\): ([\s\S]+)/);
      if (match) {
        this.setState({ message: match[1], messageType });
        return;
      }
    }
    this.setState({ message, messageType });
  }

  private validateField(name: string, value: unknown): string | null {
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
        if (!str || str.length < 2) return "Koleksi wajib diisi (minimal 2 karakter).";
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
  }

  // Debounced validation to avoid excessive re-renders
  private debouncedValidate = (name: string, value: unknown) => {
    if (this.validationTimeout) {
      clearTimeout(this.validationTimeout);
    }

    this.validationTimeout = setTimeout(() => {
      const error = this.validateField(name, value);
      this.setState((prev) => {
        const newFieldErrors = { ...prev.fieldErrors };
        if (error) {
          newFieldErrors[name] = error;
        } else {
          delete newFieldErrors[name];
        }
        return { fieldErrors: newFieldErrors };
      });
    }, 300);
  };

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

    // Update state
    this.setState((prev) => {
      const newState = {
      ...prev,
      [name]:
        name === "price"
            ? value === "" ? 0 : (() => {
                const num = Number(value);
                // Handle NaN and Infinity
                if (!Number.isFinite(num) || num < 0) return 0;
                return num;
              })()
          : name === "quantity"
            ? value === "" ? 0 : (() => {
                const num = Number(value);
                // Handle NaN and Infinity
                if (!Number.isFinite(num) || num < 0) return 0;
                return Math.max(0, Math.trunc(num));
              })()
          : value,
      };

      // Mark field as touched
      const newTouchedFields = new Set(prev.touchedFields);
      newTouchedFields.add(name);

      // Immediate validation for required fields, debounced for others
      let error: string | null = null;
      if (name === "name" || name === "price" || name === "size") {
        error = this.validateField(name, newState[name as keyof typeof newState]);
      } else {
        // Debounce validation for non-critical fields
        this.debouncedValidate(name, newState[name as keyof typeof newState]);
      }

      const newFieldErrors = { ...prev.fieldErrors };
      if (error !== null) {
        if (error) {
          newFieldErrors[name] = error;
        } else {
          delete newFieldErrors[name];
        }
      }

      return {
        ...newState,
        touchedFields: newTouchedFields,
        fieldErrors: newFieldErrors,
      };
    });
  };

  private compressImage = async (file: File, maxWidth: number = 1920, quality: number = 0.85): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
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

  private handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    // cleanup old preview
    if (this.state.previewUrl && this.state.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(this.state.previewUrl);
    }

    if (!file) {
      this.setState({ file: null, previewUrl: "", isImageLoading: false, imageDimensions: null });
      return;
    }

    // Check file size (8MB limit)
    const maxSize = 8 * 1024 * 1024;
    if (file.size > maxSize) {
      this.setMessage("Ukuran file maksimal 8MB. Silakan pilih file yang lebih kecil.", "error");
      this.clearImage();
      return;
    }

    if (!this.isAcceptableImage(file)) {
      this.setMessage("File harus berupa gambar (JPG/PNG/WEBP/HEIC).", "error");
      this.clearImage();
      return;
    }

    // Set loading state
    this.setState({ isImageLoading: true, file });

    // Create preview with timeout for large files
    this.imageLoadTimeout = setTimeout(async () => {
      try {
        // Compress image if it's large
        let processedFile = file;
        if (file.size > 2 * 1024 * 1024) { // Compress if > 2MB
          try {
            processedFile = await this.compressImage(file);
          } catch (compressError) {
            // Image compression failed, using original file
            if (process.env.NODE_ENV === "development") {
              // eslint-disable-next-line no-console
              console.warn("Image compression failed, using original:", compressError);
            }
            // Continue with original file if compression fails
          }
        }

        const previewUrl = URL.createObjectURL(processedFile);
        this.setState({ 
          previewUrl, 
          isImageLoading: false,
          file: processedFile, // Use compressed file
        });
        // Note: Dimensions will be set by the preview image's onLoad handler in render
      } catch (err) {
        // Error creating preview - log in development only
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.error("Error creating preview:", err);
        }
        this.setMessage("Gagal memuat preview gambar. Silakan coba file lain.", "error");
        this.setState({ file: null, previewUrl: "", isImageLoading: false, imageDimensions: null });
      }
    }, 100);
  };

  private isAcceptableImage(file: File): boolean {
    const name = (file.name ?? "").toLowerCase();
    const type = (file.type ?? "").toLowerCase();
    
    // Check MIME type first
    if (type.startsWith("image/")) {
      // Additional check for common image types
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"];
      if (validTypes.includes(type)) return true;
    }
    
    // Fallback to extension check
    const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];
    return validExtensions.some(ext => name.endsWith(ext));
  }

  private clearImage = () => {
    if (this.state.previewUrl && this.state.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(this.state.previewUrl);
    }

    if (this.fileInputRef.current) {
      this.fileInputRef.current.value = "";
    }

    if (this.imageLoadTimeout) {
      clearTimeout(this.imageLoadTimeout);
    }

    this.setState({ 
      file: null, 
      previewUrl: "", 
      isDraggingImage: false,
      isImageLoading: false,
      imageDimensions: null,
    });
  };

  private openFilePicker = () => {
    if (this.state.submitting || this.state.isImageLoading) return;
    this.fileInputRef.current?.click();
  };

  private handleDropzoneKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.openFilePicker();
    }
  };

  private handleDropzoneDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.submitting || this.state.isImageLoading) return;
    if (!this.state.isDraggingImage) {
      this.setState({ isDraggingImage: true });
    }
  };

  private handleDropzoneDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear if we're actually leaving the dropzone
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!this.formRef.current?.contains(relatedTarget)) {
      this.setState({ isDraggingImage: false });
    }
  };

  private handleDropzoneDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.submitting || this.state.isImageLoading) return;

    const file = e.dataTransfer.files?.[0] ?? null;
    this.setState({ isDraggingImage: false });

    if (!file) return;

    // cleanup old preview
    if (this.state.previewUrl && this.state.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(this.state.previewUrl);
    }

    // Check file size
    const maxSize = 8 * 1024 * 1024;
    if (file.size > maxSize) {
      this.setMessage("Ukuran file maksimal 8MB. Silakan pilih file yang lebih kecil.", "error");
      return;
    }

    if (!this.isAcceptableImage(file)) {
      this.setMessage("File harus berupa gambar (JPG/PNG/WEBP/HEIC).", "error");
      return;
    }

    // Set loading state
    this.setState({ isImageLoading: true, file });

    // Create preview
    this.imageLoadTimeout = setTimeout(async () => {
      try {
        // Compress image if it's large
        let processedFile = file;
        if (file.size > 2 * 1024 * 1024) { // Compress if > 2MB
          try {
            processedFile = await this.compressImage(file);
          } catch (compressError) {
            // Image compression failed, using original file
            if (process.env.NODE_ENV === "development") {
              // eslint-disable-next-line no-console
              console.warn("Image compression failed, using original:", compressError);
            }
          }
        }

        const previewUrl = URL.createObjectURL(processedFile);
        this.setState({ 
          previewUrl, 
          isImageLoading: false,
          file: processedFile,
        });
        // Note: Dimensions will be set by the preview image's onLoad handler in render
      } catch (err) {
        // Error creating preview - log in development only
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.error("Error creating preview:", err);
        }
        this.setMessage("Gagal memuat preview gambar. Silakan coba file lain.", "error");
        this.setState({ file: null, previewUrl: "", isImageLoading: false, imageDimensions: null });
      }
    }, 100);
  };

  private formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const idx = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1
    );
    const val = bytes / Math.pow(1024, idx);
    return `${val.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
  }

  private formatPrice = (price: number): string => {
    if (!Number.isFinite(price) || price <= 0) return "";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  private validate(): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    // Validate all required fields with comprehensive checks
    const nameError = this.validateField("name", this.state.name);
    if (nameError) errors.name = nameError;

    const priceError = this.validateField("price", this.state.price);
    if (priceError) errors.price = priceError;

    const sizeError = this.validateField("size", this.state.size);
    if (sizeError) errors.size = sizeError;

    // Validate required collection field
    const collError = this.validateField("collectionName", this.state.collectionName);
    if (collError) errors.collectionName = collError;

    // Additional pre-flight validations
    // Check if file is valid (if provided)
    if (this.state.file) {
      // Double-check file size
      const maxSize = 8 * 1024 * 1024;
      if (this.state.file.size > maxSize) {
        errors.image = "Ukuran file maksimal 8MB. Silakan pilih file yang lebih kecil.";
      }
      
      // Double-check file type
      if (!this.isAcceptableImage(this.state.file)) {
        errors.image = "File harus berupa gambar (JPG/PNG/WEBP/HEIC).";
      }
    }

    // Validate optional fields if they have values
    if (this.state.description.trim()) {
      const descError = this.validateField("description", this.state.description);
      if (descError) errors.description = descError;
    }

    if (this.state.careInstructions.trim()) {
      const careError = this.validateField("careInstructions", this.state.careInstructions);
      if (careError) errors.careInstructions = careError;
    }

    if (this.state.occasionsText.trim()) {
      const occError = this.validateField("occasionsText", this.state.occasionsText);
      if (occError) errors.occasionsText = occError;
    }

    if (this.state.flowersText.trim()) {
      const flowError = this.validateField("flowersText", this.state.flowersText);
      if (flowError) errors.flowersText = flowError;
    }

    if (this.state.quantity > 0) {
      const qtyError = this.validateField("quantity", this.state.quantity);
      if (qtyError) errors.quantity = qtyError;
    }

    // Validate custom penanda
    if (this.state.customPenanda.length > 10) {
      errors.customPenanda = "Maksimal 10 penanda kustom.";
    }
    
    // Check for duplicate penanda (case-insensitive)
    const lowerPenanda = this.state.customPenanda.map(p => p.toLowerCase());
    const uniqueLower = new Set(lowerPenanda);
    if (lowerPenanda.length !== uniqueLower.size) {
      errors.customPenanda = "Terdapat penanda duplikat (tidak case-sensitive).";
    }
    
    // Validate each penanda length
    for (const penanda of this.state.customPenanda) {
      if (penanda.length < 2) {
        errors.customPenanda = "Setiap penanda minimal 2 karakter.";
        break;
      }
      if (penanda.length > 30) {
        errors.customPenanda = "Setiap penanda maksimal 30 karakter.";
        break;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  private buildFormData(): FormData {
    const fd = new FormData();
    
    // Image (only if new file is selected and valid)
    if (this.state.file) {
      // Final validation before appending
      const maxSize = 8 * 1024 * 1024;
      if (this.state.file.size > maxSize) {
        throw new Error("Ukuran file maksimal 8MB. Silakan pilih file yang lebih kecil.");
      }
      if (!this.isAcceptableImage(this.state.file)) {
        throw new Error("File harus berupa gambar (JPG/PNG/WEBP/HEIC).");
      }
      fd.append("image", this.state.file);
    }

    // Required fields with validation
    const name = this.state.name.trim();
    if (!name || name.length < 2) {
      throw new Error("Nama bouquet harus minimal 2 karakter.");
    }
    fd.append("name", name);

    const price = Number(this.state.price);
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error("Harga harus lebih besar dari 0.");
    }
    fd.append("price", String(price));

    const size = this.state.size || "Medium";
    if (!size || size.trim() === "") {
      throw new Error("Ukuran harus dipilih.");
    }
    fd.append("size", size);

    const status = this.state.status || "ready";
    fd.append("status", status);

    const collectionName = this.state.collectionName.trim();
    if (!collectionName || collectionName.length < 2) {
      throw new Error("Koleksi harus dipilih atau minimal 2 karakter.");
    }
    fd.append("collectionName", collectionName);

    // Optional fields with safe defaults
    fd.append("description", (this.state.description || "").trim());
    fd.append("type", (this.state.type || "bouquet").trim());
    fd.append("quantity", String(Math.max(0, this.state.quantity || 0)));
    fd.append("careInstructions", (this.state.careInstructions || "").trim());

    // Arrays - use array if available, otherwise fallback to text
    const occasionsValue = this.state.occasions.length > 0 
      ? this.state.occasions.join(",")
      : (this.state.occasionsText || "").trim();
    const flowersValue = this.state.flowers.length > 0
      ? this.state.flowers.join(",")
      : (this.state.flowersText || "").trim();
    fd.append("occasions", occasionsValue);
    fd.append("flowers", flowersValue);

    // Boolean flags
    fd.append("isNewEdition", String(Boolean(this.state.isNewEdition)));
    fd.append("isFeatured", String(Boolean(this.state.isFeatured)));
    
    // Custom penanda
    fd.append("customPenanda", this.state.customPenanda.join(","));

    return fd;
  }

  private handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Don't submit if image is still loading
    if (this.state.isImageLoading) {
      this.setMessage("Tunggu hingga gambar selesai dimuat.", "error");
      return;
    }

    // Mark all required fields as touched (for better error display)
    const allFields = new Set([
      "name",
      "price",
      "size",
      "collectionName", // Required field
    ]);

    this.setState((prev) => ({
      touchedFields: new Set([...prev.touchedFields, ...allFields]),
      showValidationSummary: true,
    }));

    // Validate with fresh state
    const validation = this.validate();
    
    if (!validation.isValid) {
      // Update field errors
      this.setState({ fieldErrors: validation.errors });
      
      // Show first error message
      const firstError = Object.values(validation.errors)[0];
      if (firstError) {
        this.setMessage(firstError, "error");
      }

      // Scroll to first error field
      const firstErrorField = Object.keys(validation.errors)[0];
      if (firstErrorField) {
        if (this.scrollTimeout) {
          clearTimeout(this.scrollTimeout);
        }
        this.scrollTimeout = setTimeout(() => {
          if (!this.componentMounted) return;
          
          // Handle customPenanda specially (no name attribute)
          if (firstErrorField === "customPenanda") {
            const penandaSection = this.formRef.current?.querySelector(
              ".uploader__customPenanda"
            ) as HTMLElement;
            if (penandaSection) {
              penandaSection.scrollIntoView({ behavior: "smooth", block: "center" });
              const input = penandaSection.querySelector(
                ".uploader__penandaInput"
              ) as HTMLElement;
              input?.focus();
            }
          } else {
            const field = this.formRef.current?.querySelector(
              `[name="${firstErrorField}"]`
            ) as HTMLElement;
            if (field) {
              field.scrollIntoView({ behavior: "smooth", block: "center" });
              field.focus();
            }
          }
        }, 100);
      }
      return;
    }

    // Clear any previous errors
    this.setState({ 
      submitting: true, 
      message: "", 
      messageType: "",
      fieldErrors: {},
      uploadProgress: 0,
      showValidationSummary: false,
    });

    try {
      // Pre-flight validation: Build FormData and validate before upload
      let formData: FormData;
      try {
        formData = this.buildFormData();
      } catch (buildError) {
        // If FormData building fails, show error immediately
        const buildErrorMessage = buildError instanceof Error 
          ? buildError.message 
          : "Data tidak valid. Silakan periksa semua field.";
        this.setState({
          submitting: false,
          message: buildErrorMessage,
          messageType: "error",
        });
        // Scroll to error message
        setTimeout(() => {
          const messageEl = document.querySelector(".uploader__message");
          if (messageEl) {
            messageEl.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
        return;
      }

      // Show loading message
      this.setState({
        submitting: true,
        message: "Mengunggah bouquet...",
        messageType: "",
      });

      const ok = await this.props.onUpload(formData);

      if (ok) {
        // Clear draft on success
        this.clearDraft();
        
        // Reset form
        if (this.fileInputRef.current) {
          this.fileInputRef.current.value = "";
        }
        
        // Cleanup blob URL
        if (this.state.previewUrl && this.state.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(this.state.previewUrl);
        }

        this.resetForm();
        this.setState({
          submitting: false,
          message: "Bouquet berhasil diunggah!",
          messageType: "success",
          imageDimensions: null, // Clear image dimensions on success
        });
        
        // Scroll to success message
        if (this.scrollTimeout) {
          clearTimeout(this.scrollTimeout);
        }
        this.scrollTimeout = setTimeout(() => {
          if (this.componentMounted) {
            const messageEl = document.querySelector(".uploader__message");
            if (messageEl) {
              messageEl.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }
        }, 100);
      } else {
        // Error message should already be set by the controller
        // But provide a fallback if not available
        // IMPORTANT: Always reset submitting state to allow retry
        this.setState({
          submitting: false,
          message: "Unggah gagal. Silakan periksa koneksi internet dan coba lagi. Pastikan semua field wajib sudah diisi dengan benar.",
          messageType: "error",
        });
        // Scroll to error message
        setTimeout(() => {
          const messageEl = document.querySelector(".uploader__message");
          if (messageEl) {
            messageEl.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      }
    } catch (err) {
      // Upload error - always log for debugging
      // eslint-disable-next-line no-console
      console.error("Upload error:", err);
      let errorMessage = "Terjadi kesalahan server. Silakan coba lagi.";
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Check for error details (from backend)
        const errorDetails = (err as any).details;
        if (errorDetails && process.env.NODE_ENV === "development") {
          // Error details - log in development only
          // eslint-disable-next-line no-console
          console.error("Error details:", errorDetails);
        }
        
        // Provide more user-friendly messages for common errors
        if (errorMessage.includes("NetworkError") || errorMessage.includes("Failed to fetch")) {
          errorMessage = "Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi.";
        } else if (errorMessage.includes("400") || errorMessage.includes("must be at least") || errorMessage.includes("must be greater")) {
          errorMessage = "Data yang diinput tidak valid. Pastikan semua field wajib sudah diisi dengan benar.";
        } else if (errorMessage.includes("401") || errorMessage.includes("403") || errorMessage.includes("Authentication") || errorMessage.includes("Insufficient permissions")) {
          errorMessage = "Sesi Anda telah berakhir atau tidak memiliki izin. Silakan login kembali.";
        } else if (errorMessage.includes("413") || errorMessage.includes("too large") || errorMessage.includes("LIMIT_FILE_SIZE")) {
          errorMessage = "File gambar terlalu besar. Maksimal 8MB. Silakan pilih file yang lebih kecil.";
        } else if (errorMessage.includes("500") || errorMessage.includes("Failed to create bouquet")) {
          // More specific error message for 500 errors
          if (errorMessage.includes("Failed to create bouquet:")) {
            // Extract the actual error from the message
            const actualError = errorMessage.replace("Failed to create bouquet:", "").trim();
            errorMessage = `Gagal membuat bouquet: ${actualError || "Terjadi kesalahan pada server. Silakan periksa semua field dan coba lagi."}`;
          } else {
            errorMessage = "Terjadi kesalahan pada server. Silakan periksa semua field wajib sudah diisi dengan benar dan coba lagi.";
          }
        }
      }
      
      // IMPORTANT: Always reset submitting state to allow retry
      this.setState({
        submitting: false,
        message: errorMessage,
        messageType: "error",
      });
      // Scroll to error message
      setTimeout(() => {
        const messageEl = document.querySelector(".uploader__message");
        if (messageEl) {
          messageEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  };

  private getCharacterCountClass = (current: number, max: number): string => {
    if (current >= max) return "uploader__fieldHint--error";
    if (current >= max * 0.9) return "uploader__fieldHint--warning";
    return "";
  };

  private handleAddPenanda = (): void => {
    const trimmed = this.state.newPenandaInput.trim();
    if (!trimmed) {
      this.setMessage("Nama penanda tidak boleh kosong.", "error");
      return;
    }
    
    if (this.state.customPenanda.length >= 10) {
      this.setMessage("Maksimal 10 penanda kustom.", "error");
      this.setState({ newPenandaInput: "" });
      return;
    }
    
    // Case-insensitive duplicate check
    const lowerTrimmed = trimmed.toLowerCase();
    if (this.state.customPenanda.some(p => p.toLowerCase() === lowerTrimmed)) {
      this.setMessage("Penanda ini sudah ada (tidak case-sensitive).", "error");
      this.setState({ newPenandaInput: "" });
      return;
    }
    
    if (trimmed.length < 2) {
      this.setMessage("Nama penanda minimal 2 karakter.", "error");
      return;
    }
    
    if (trimmed.length > 30) {
      this.setMessage("Nama penanda maksimal 30 karakter.", "error");
      return;
    }
    
    // Validate special characters (allow letters, numbers, spaces, and common punctuation)
    // Note: Comma is NOT allowed as it's used as separator
    const validPattern = /^[a-zA-Z0-9\s\-_.!?()]+$/;
    if (!validPattern.test(trimmed)) {
      this.setMessage("Penanda hanya boleh mengandung huruf, angka, spasi, dan tanda baca umum (koma tidak diperbolehkan).", "error");
      return;
    }
    
    // Prevent comma to avoid splitting issues
    if (trimmed.includes(",")) {
      this.setMessage("Koma (,) tidak diperbolehkan dalam penanda. Gunakan spasi atau underscore sebagai pengganti.", "error");
      return;
    }
    
    this.setState((prev) => ({
      customPenanda: [...prev.customPenanda, trimmed],
      newPenandaInput: "",
    }));
  };

  render(): React.ReactNode {
    const {
      submitting,
      message,
      messageType,
      previewUrl,
      file,
      isDraggingImage,
      fieldErrors,
      touchedFields,
      isImageLoading,
      hasDraft,
      isSavingDraft,
      showValidationSummary,
      imageDimensions,
    } = this.state;

    const errorCount = Object.keys(fieldErrors).length;
    const hasErrors = errorCount > 0;

    return (
      <section className="uploader" aria-label="Form unggah bouquet">
        <header className="uploader__header">
          <div className="uploader__headerTop">
            <div>
          <h2 className="uploader__title">Unggah Bouquet Baru</h2>
          <p className="uploader__subtitle">
                Tambahkan produk baru ke katalog toko. Kolom bertanda <span className="uploader__required">*</span> wajib diisi.
              </p>
            </div>
            <div className="uploader__headerActions">
              {hasDraft && (
                <button
                  type="button"
                  className="uploader__draftBtn"
                  onClick={this.loadDraft}
                  title="Muat draft tersimpan"
                  aria-label="Muat draft tersimpan"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Muat Draft
                </button>
              )}
              {isSavingDraft && (
                <span className="uploader__draftStatus" aria-live="polite">
                  Menyimpan...
                </span>
              )}
            </div>
          </div>
          
          {showValidationSummary && hasErrors && (
            <div className="uploader__validationSummary" role="alert" aria-live="polite">
              <strong>Perbaiki {errorCount} {errorCount === 1 ? "kesalahan" : "kesalahan"} sebelum mengunggah:</strong>
              <ul>
                    {Object.entries(fieldErrors).map(([field, error]) => (
                  <li key={field}>
                    <button
                      type="button"
                      onClick={() => {
                        // Handle customPenanda specially (no name attribute)
                        if (field === "customPenanda") {
                          const penandaSection = this.formRef.current?.querySelector(
                            ".uploader__customPenanda"
                          ) as HTMLElement;
                          if (penandaSection) {
                            penandaSection.scrollIntoView({ behavior: "smooth", block: "center" });
                            const input = penandaSection.querySelector(
                              ".uploader__penandaInput"
                            ) as HTMLElement;
                            input?.focus();
                          }
                        } else {
                          const fieldEl = this.formRef.current?.querySelector(
                            `[name="${field}"]`
                          ) as HTMLElement;
                          if (fieldEl) {
                            fieldEl.scrollIntoView({ behavior: "smooth", block: "center" });
                            fieldEl.focus();
                          }
                        }
                      }}
                    >
                      {error}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </header>

        <form
          ref={this.formRef}
          className="uploader__form"
          onSubmit={this.handleSubmit}
          noValidate
        >
          <div className="uploader__layout">
            <div className="uploader__col uploader__col--form">
              <div className="uploader__grid">
                <label className="uploader__field">
                  <span className="uploader__fieldLabel">
                    Nama <span className="uploader__required" aria-label="wajib diisi">*</span>
                  </span>
                  <input
                    name="name"
                    value={this.state.name}
                    onChange={this.handleChange}
                    placeholder="mis., Orchid Elegance"
                    disabled={submitting}
                    required
                    aria-required="true"
                    aria-invalid={touchedFields.has("name") && fieldErrors.name ? "true" : "false"}
                    aria-describedby={touchedFields.has("name") && fieldErrors.name ? "name-error" : undefined}
                    maxLength={100}
                  />
                  {touchedFields.has("name") && fieldErrors.name && (
                    <span id="name-error" className="uploader__fieldError" role="alert" aria-live="polite">
                      {fieldErrors.name}
                    </span>
                  )}
                </label>

                <label className="uploader__field">
                  <span className="uploader__fieldLabel">
                    Harga (IDR) <span className="uploader__required" aria-label="wajib diisi">*</span>
                  </span>
                  <div className="uploader__priceInputWrapper">
                  <input
                    name="price"
                    type="number"
                      value={this.state.price || ""}
                    onChange={this.handleChange}
                      placeholder="0"
                    disabled={submitting}
                    required
                    min={0}
                      step="any"
                      aria-required="true"
                      aria-invalid={touchedFields.has("price") && fieldErrors.price ? "true" : "false"}
                      aria-describedby={touchedFields.has("price") && fieldErrors.price ? "price-error" : undefined}
                      className="uploader__priceInput"
                    />
                  </div>
                  {touchedFields.has("price") && fieldErrors.price && (
                    <span id="price-error" className="uploader__fieldError" role="alert" aria-live="polite">
                      {fieldErrors.price}
                    </span>
                  )}
                </label>

                <label className="uploader__field">
                  <span className="uploader__fieldLabel">Status</span>
                  <DropdownWithModal
                    label="Status"
                    value={this.state.status === "ready" ? "Siap" : "Preorder"}
                    options={["Siap", "Preorder"]}
                    onChange={(value) => {
                      const statusValue = value === "Siap" ? "ready" : "preorder";
                      this.setState({ status: statusValue as "ready" | "preorder" });
                    }}
                    onAddNew={() => {
                      // Status tidak bisa ditambah baru, hanya pilihan tetap
                    }}
                    placeholder="Pilih status..."
                    disabled={submitting}
                    storageKey=""
                    allowAddNew={false}
                  />
                </label>

                <label className="uploader__field">
                  <span className="uploader__fieldLabel">
                    Koleksi <span className="uploader__required" aria-label="wajib diisi">*</span>
                  </span>
                  <DropdownWithModal
                    label="Koleksi"
                    value={this.state.collectionName}
                    options={this.state.collectionOptions}
                    onChange={(value) => {
                      this.setState({ collectionName: value });
                      const newTouchedFields = new Set(this.state.touchedFields);
                      newTouchedFields.add("collectionName");
                      this.setState({ touchedFields: newTouchedFields });
                      const error = this.validateField("collectionName", value);
                      if (error !== null) {
                        const newFieldErrors = { ...this.state.fieldErrors };
                        if (error) {
                          newFieldErrors.collectionName = error;
                        } else {
                          delete newFieldErrors.collectionName;
                        }
                        this.setState({ fieldErrors: newFieldErrors });
                      }
                    }}
                    onAddNew={(_newValue) => {
                      // Option added, already set in onChange by DropdownWithModal
                    }}
                    placeholder="Pilih atau tambahkan koleksi baru..."
                    disabled={submitting}
                    error={touchedFields.has("collectionName") && fieldErrors.collectionName ? fieldErrors.collectionName : undefined}
                    maxLength={100}
                    storageKey="uploader_collections"
                  />
                </label>

                <label className="uploader__field">
                  <span className="uploader__fieldLabel">Tipe</span>
                  <DropdownWithModal
                    label="Tipe"
                    value={this.state.type}
                    options={this.state.typeOptions}
                    onChange={(value) => {
                      this.setState({ type: value });
                    }}
                    onAddNew={(_newValue) => {
                      // Option added, already set in onChange by DropdownWithModal
                    }}
                    placeholder="Pilih atau tambahkan tipe baru..."
                    disabled={submitting}
                    storageKey="uploader_types"
                  />
                </label>

                <label className="uploader__field">
                  <span className="uploader__fieldLabel">
                    Ukuran <span className="uploader__required" aria-label="wajib diisi">*</span>
                  </span>
                  <DropdownWithModal
                    label="Ukuran"
                    value={this.state.size}
                    options={this.state.sizeOptions}
                    onChange={(value) => {
                      this.setState({ size: value });
                      const newTouchedFields = new Set(this.state.touchedFields);
                      newTouchedFields.add("size");
                      this.setState({ touchedFields: newTouchedFields });
                      const error = this.validateField("size", value);
                      if (error !== null) {
                        const newFieldErrors = { ...this.state.fieldErrors };
                        if (error) {
                          newFieldErrors.size = error;
                        } else {
                          delete newFieldErrors.size;
                        }
                        this.setState({ fieldErrors: newFieldErrors });
                      }
                    }}
                    onAddNew={(newValue) => {
                      // Add new size option
                      const newSizeOptions = [...this.state.sizeOptions, newValue];
                      this.setState({ sizeOptions: newSizeOptions, size: newValue });
                    }}
                    placeholder="Pilih atau tambahkan ukuran baru..."
                    disabled={submitting}
                    error={touchedFields.has("size") && fieldErrors.size ? fieldErrors.size : undefined}
                    maxLength={50}
                    storageKey="uploader_sizes"
                  />
                </label>

                <label className="uploader__field">
                  <span className="uploader__fieldLabel">Stok</span>
                  <DropdownWithModal
                    label="Stok"
                    value={this.state.quantity > 0 ? String(this.state.quantity) : ""}
                    options={this.state.stockLevelOptions}
                    onChange={(value) => {
                      const num = parseInt(value, 10);
                      if (!isNaN(num) && num >= 0) {
                        this.setState({ quantity: num });
                        const newTouchedFields = new Set(this.state.touchedFields);
                        newTouchedFields.add("quantity");
                        this.setState({ touchedFields: newTouchedFields });
                        const error = this.validateField("quantity", num);
                        if (error !== null) {
                          const newFieldErrors = { ...this.state.fieldErrors };
                          if (error) {
                            newFieldErrors.quantity = error;
                          } else {
                            delete newFieldErrors.quantity;
                          }
                          this.setState({ fieldErrors: newFieldErrors });
                        }
                      }
                    }}
                    onAddNew={(newValue) => {
                      const num = parseInt(newValue, 10);
                      if (!isNaN(num) && num >= 0) {
                        this.setState({ quantity: num });
                      }
                    }}
                    placeholder="Pilih jumlah stok..."
                    disabled={submitting}
                    error={touchedFields.has("quantity") && fieldErrors.quantity ? fieldErrors.quantity : undefined}
                    storageKey="uploader_stock_levels"
                  />
                  {touchedFields.has("quantity") && fieldErrors.quantity && (
                    <span id="quantity-error" className="uploader__fieldError" role="alert" aria-live="polite">
                      {fieldErrors.quantity}
                    </span>
                  )}
                </label>

                <div className="uploader__field uploader__field--full">
                  <span className="uploader__fieldLabel">Penanda</span>
                  <div
                    className="uploader__toggles"
                    role="group"
                    aria-label="Penanda bouquet"
                  >
                    <label className="uploader__toggle">
                      <input
                        type="checkbox"
                        name="isNewEdition"
                        checked={this.state.isNewEdition}
                        onChange={this.handleChange}
                        disabled={submitting}
                        aria-label="Edisi baru"
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
                        aria-label="Unggulan"
                      />
                      <span>Unggulan</span>
                    </label>
                  </div>
                  
                  {/* Custom Penanda Section */}
                  <div className="uploader__customPenanda">
                    {this.state.customPenanda.length > 0 && (
                      <div className="uploader__customPenandaList">
                        {this.state.customPenanda.map((penanda, index) => (
                          <span
                            key={`penanda-${index}-${penanda}`}
                            className="uploader__penandaTag"
                            role="button"
                            tabIndex={0}
                            aria-label={`Hapus penanda ${penanda}`}
                            onClick={() => {
                              if (submitting) return;
                              this.setState((prev) => ({
                                customPenanda: prev.customPenanda.filter((_, i) => i !== index),
                              }));
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                if (!submitting) {
                                  this.setState((prev) => ({
                                    customPenanda: prev.customPenanda.filter((_, i) => i !== index),
                                  }));
                                }
                              }
                            }}
                          >
                            {penanda}
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              aria-hidden="true"
                            >
                              <path
                                d="M18 6L6 18M6 6l12 12"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {this.state.customPenanda.length < 10 && (
                      <div className="uploader__addPenanda">
                        <div className="uploader__penandaInputWrapper">
                          <input
                            type="text"
                            className="uploader__penandaInput"
                            value={this.state.newPenandaInput}
                            onChange={(e) => {
                              this.setState({ newPenandaInput: e.target.value });
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                this.handleAddPenanda();
                              }
                            }}
                            placeholder="Tambah penanda baru..."
                            disabled={submitting}
                            maxLength={30}
                            aria-label="Input penanda baru"
                            aria-invalid={touchedFields.has("customPenanda") && fieldErrors.customPenanda ? "true" : "false"}
                            aria-describedby={touchedFields.has("customPenanda") && fieldErrors.customPenanda ? "customPenanda-error" : undefined}
                          />
                          {this.state.newPenandaInput.length > 0 && (
                            <div className={`uploader__penandaCharCount ${this.getCharacterCountClass(this.state.newPenandaInput.length, 30)}`}>
                              {this.state.newPenandaInput.length}/30
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          className="uploader__addPenandaBtn"
                          onClick={this.handleAddPenanda}
                          disabled={submitting || !this.state.newPenandaInput.trim()}
                          aria-label="Tambah penanda"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <path
                              d="M12 5v14M5 12h14"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Tambah
                        </button>
                      </div>
                    )}
                    
                    {this.state.customPenanda.length >= 10 && (
                      <div className="uploader__fieldHint uploader__fieldHint--warning">
                        Maksimal 10 penanda kustom telah tercapai.
                      </div>
                    )}
                    
                    {touchedFields.has("customPenanda") && fieldErrors.customPenanda && (
                      <span id="customPenanda-error" className="uploader__fieldError" role="alert" aria-live="polite">
                        {fieldErrors.customPenanda}
                      </span>
                    )}
                    
                    {this.state.customPenanda.length > 0 && (
                      <div className="uploader__fieldHint">
                        {this.state.customPenanda.length}/10 penanda
                      </div>
                    )}
                  </div>
                </div>

                <label className="uploader__field uploader__field--full">
                  <span className="uploader__fieldLabel">Deskripsi</span>
                  <textarea
                    name="description"
                    value={this.state.description}
                    onChange={this.handleChange}
                    rows={4}
                    placeholder="Deskripsi singkat..."
                    disabled={submitting}
                    maxLength={500}
                    aria-invalid={touchedFields.has("description") && fieldErrors.description ? "true" : "false"}
                    aria-describedby={touchedFields.has("description") && fieldErrors.description ? "description-error" : undefined}
                  />
                  <div className={`uploader__fieldHint ${this.getCharacterCountClass(this.state.description.length, 500)}`}>
                    {this.state.description.length}/500 karakter
                  </div>
                  {touchedFields.has("description") && fieldErrors.description && (
                    <span id="description-error" className="uploader__fieldError" role="alert" aria-live="polite">
                      {fieldErrors.description}
                    </span>
                  )}
                </label>

                <label className="uploader__field uploader__field--full">
                  <span className="uploader__fieldLabel">Acara</span>
                  <TagInput
                    label="Acara"
                    tags={this.state.occasions}
                    onChange={(tags) => {
                      this.setState({ 
                        occasions: tags,
                        occasionsText: tags.join(", ") // Keep text for backward compatibility
                      });
                      const newTouchedFields = new Set(this.state.touchedFields);
                      newTouchedFields.add("occasionsText");
                      this.setState({ touchedFields: newTouchedFields });
                      const error = this.validateField("occasionsText", tags.join(", "));
                      if (error !== null) {
                        const newFieldErrors = { ...this.state.fieldErrors };
                        if (error) {
                          newFieldErrors.occasionsText = error;
                        } else {
                          delete newFieldErrors.occasionsText;
                        }
                        this.setState({ fieldErrors: newFieldErrors });
                      }
                    }}
                    placeholder="Tambahkan acara..."
                    disabled={submitting}
                    maxTags={10}
                    maxLength={50}
                    error={touchedFields.has("occasionsText") && fieldErrors.occasionsText ? fieldErrors.occasionsText : undefined}
                    storageKey="uploader_occasions"
                  />
                  <div className="uploader__fieldHint" style={{ marginTop: "0.5rem" }}>
                    Klik "Tambah Baru" untuk menambahkan acara baru. Maksimal 10 acara.
                  </div>
                </label>

                <label className="uploader__field uploader__field--full">
                  <span className="uploader__fieldLabel">Bunga</span>
                  <TagInput
                    label="Bunga"
                    tags={this.state.flowers}
                    onChange={(tags) => {
                      this.setState({ 
                        flowers: tags,
                        flowersText: tags.join(", ") // Keep text for backward compatibility
                      });
                      const newTouchedFields = new Set(this.state.touchedFields);
                      newTouchedFields.add("flowersText");
                      this.setState({ touchedFields: newTouchedFields });
                      const error = this.validateField("flowersText", tags.join(", "));
                      if (error !== null) {
                        const newFieldErrors = { ...this.state.fieldErrors };
                        if (error) {
                          newFieldErrors.flowersText = error;
                        } else {
                          delete newFieldErrors.flowersText;
                        }
                        this.setState({ fieldErrors: newFieldErrors });
                      }
                    }}
                    placeholder="Tambahkan jenis bunga..."
                    disabled={submitting}
                    maxTags={20}
                    maxLength={50}
                    error={touchedFields.has("flowersText") && fieldErrors.flowersText ? fieldErrors.flowersText : undefined}
                    storageKey="uploader_flowers"
                    suggestions={this.state.flowerOptions}
                  />
                  <div className="uploader__fieldHint" style={{ marginTop: "0.5rem" }}>
                    Ketik dan tekan Enter/koma untuk menambahkan tag. Klik "Tambah Baru" untuk tag baru. Maksimal 20 jenis bunga.
                  </div>
                </label>

                <label className="uploader__field uploader__field--full">
                  <span className="uploader__fieldLabel">Instruksi perawatan</span>
                  <textarea
                    name="careInstructions"
                    value={this.state.careInstructions}
                    onChange={this.handleChange}
                    rows={3}
                    placeholder="Tips perawatan (opsional)"
                    disabled={submitting}
                    maxLength={300}
                    aria-invalid={touchedFields.has("careInstructions") && fieldErrors.careInstructions ? "true" : "false"}
                    aria-describedby={touchedFields.has("careInstructions") && fieldErrors.careInstructions ? "careInstructions-error" : undefined}
                  />
                  <div className={`uploader__fieldHint ${this.getCharacterCountClass(this.state.careInstructions.length, 300)}`}>
                    {this.state.careInstructions.length}/300 karakter
                  </div>
                  {touchedFields.has("careInstructions") && fieldErrors.careInstructions && (
                    <span id="careInstructions-error" className="uploader__fieldError" role="alert" aria-live="polite">
                      {fieldErrors.careInstructions}
                    </span>
                  )}
                </label>

                <div className="uploader__field uploader__field--full">
                  <span className="uploader__fieldLabel">Gambar</span>
                  <div
                    className={`uploader__dropzone ${
                      isDraggingImage ? "is-dragging" : ""
                    } ${file ? "has-file" : ""} ${isImageLoading ? "is-loading" : ""}`}
                    role="button"
                    tabIndex={0}
                    aria-label="Pilih gambar bouquet"
                    aria-disabled={submitting || isImageLoading ? "true" : "false"}
                    onClick={this.openFilePicker}
                    onKeyDown={this.handleDropzoneKeyDown}
                    onDragOver={this.handleDropzoneDragOver}
                    onDragLeave={this.handleDropzoneDragLeave}
                    onDrop={this.handleDropzoneDrop}
                  >
                    <div className="uploader__dropzoneIcon">
                      {isImageLoading ? (
                        <span className="uploader__dropzoneSpinner" aria-hidden="true"></span>
                      ) : (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="uploader__dropzoneText">
                      <div className="uploader__dropzoneTitle">
                        {isImageLoading 
                          ? "Memuat gambar..." 
                          : file 
                          ? "Gambar dipilih" 
                          : "Klik untuk pilih gambar"}
                      </div>
                      <div className="uploader__dropzoneSub">
                        {isImageLoading
                          ? "Mohon tunggu..."
                          : file
                          ? `${file.name} • ${this.formatBytes(file.size)}${imageDimensions ? ` • ${imageDimensions.width}×${imageDimensions.height}px` : ""}`
                          : "Atau drag & drop (JPG/PNG/WEBP/HEIC). Maksimal 8MB. Opsional."}
                      </div>
                    </div>

                    <div
                      className="uploader__dropzoneActions"
                      aria-label="Aksi gambar"
                      role="group"
                    >
                      {file && !isImageLoading ? (
                        <button
                          type="button"
                          className="uploader__ghostBtn"
                          onClick={(e) => {
                            e.stopPropagation();
                            this.clearImage();
                          }}
                          disabled={submitting}
                          aria-label="Hapus gambar"
                        >
                          Hapus
                        </button>
                      ) : !isImageLoading ? (
                        <button
                          type="button"
                          className="uploader__ghostBtn"
                          onClick={(e) => {
                            e.stopPropagation();
                            this.openFilePicker();
                          }}
                          disabled={submitting}
                          aria-label="Pilih file"
                        >
                          Pilih file
                        </button>
                      ) : null}
                    </div>

                    <input
                      ref={this.fileInputRef}
                      className="uploader__fileInput"
                      type="file"
                      accept="image/*,.heic,.heif"
                      capture="environment"
                      aria-label="Upload gambar bouquet"
                      onChange={this.handleImageChange}
                      disabled={submitting || isImageLoading}
                      tabIndex={-1}
                    />
                  </div>
                </div>
              </div>
            </div>

            <aside
              className="uploader__col uploader__col--preview"
              aria-label="Pratinjau gambar"
            >
              <div className="uploader__preview">
                <p className="uploader__previewLabel">Pratinjau</p>
                {isImageLoading ? (
                  <div className="uploader__previewLoading" aria-label="Memuat gambar">
                    <span className="uploader__previewSpinner" aria-hidden="true"></span>
                    <p>Memuat preview...</p>
                  </div>
                ) : previewUrl ? (
                  <div className="uploader__previewWrapper">
                    <img
                      ref={(el) => { this.imageElementRef = el; }}
                    className="uploader__previewImg"
                    src={previewUrl}
                      alt="Pratinjau bouquet"
                      onError={() => {
                        this.setMessage("Gagal memuat preview gambar. Silakan pilih file lain.", "error");
                        this.clearImage();
                      }}
                      onLoad={(e) => {
                        const img = e.currentTarget;
                        this.setState({
                          imageDimensions: { width: img.naturalWidth, height: img.naturalHeight },
                        });
                      }}
                    />
                    {imageDimensions && (
                      <div className="uploader__previewInfo">
                        {imageDimensions.width} × {imageDimensions.height}px
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="uploader__previewEmpty"
                    aria-label="Belum ada gambar"
                  >
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                      <path
                        d="M21 15l-5-5L5 21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p>Pilih gambar untuk melihat pratinjau</p>
                  </div>
                )}
              </div>
            </aside>
          </div>

          <div
            className="uploader__footer"
            aria-label="Aksi upload"
            role="group"
          >
            <div className="uploader__footerActions">
            <button
              className="uploader__submit"
              type="submit"
                disabled={submitting || isImageLoading}
                aria-busy={submitting}
              >
                {submitting ? (
                  <>
                    <span className="uploader__submitSpinner" aria-hidden="true"></span>
                    Mengunggah...
                  </>
                ) : (
                  "Unggah Bouquet"
                )}
              </button>
              
              {hasDraft && (
                <button
                  type="button"
                  className="uploader__clearDraftBtn"
                  onClick={() => {
                    if (window.confirm("Hapus draft tersimpan?")) {
                      this.clearDraft();
                    }
                  }}
              disabled={submitting}
                  aria-label="Hapus draft"
            >
                  Hapus Draft
            </button>
              )}
            </div>

            {message && (
              <div
                className={`uploader__message ${
                  messageType === "success" ? "is-success" : "is-error"
                }`}
                role={messageType === "error" ? "alert" : "status"}
                aria-live="polite"
                aria-atomic="true"
              >
                {message}
              </div>
            )}
          </div>
        </form>
      </section>
    );
  }
}

export default BouquetUploader;
