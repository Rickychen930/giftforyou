// src/controllers/bouquet-uploader-controller.tsx
// Controller for bouquet uploader form
// Manages state and event handlers following MVC pattern

import React, { Component } from "react";
import { getDropdownOptions } from "../services/dropdown-options.service";
import { BOUQUET_SIZE_OPTIONS } from "../constants/bouquet-constants";
import {
  initializeEmptyFormState,
  validateUploadForm,
  buildUploadFormData,
  saveDraft,
  loadDraft,
  checkDraftExists,
  clearDraft,
  processImageForUpload,
  validateField,
  validatePenandaInput,
  AUTO_SAVE_INTERVAL,
  type UploadFormState,
  type MessageType,
} from "../models/bouquet-uploader-model";

interface Props {
  onUpload: (formData: FormData) => Promise<boolean>;
}

interface State extends UploadFormState {
  file: File | null;
  previewUrl: string;
  isDraggingImage: boolean;
  submitting: boolean;
  message: string;
  messageType: MessageType;
  fieldErrors: Record<string, string>;
  touchedFields: Set<string>;
  isImageLoading: boolean;
  uploadProgress: number;
  hasDraft: boolean;
  isSavingDraft: boolean;
  showValidationSummary: boolean;
  imageDimensions: { width: number; height: number } | null;
  collectionOptions: string[];
  typeOptions: string[];
  occasionOptions: string[];
  flowerOptions: string[];
  stockLevelOptions: string[];
  sizeOptions: string[];
  statusOptions: string[];
}

/**
 * Controller for Bouquet Uploader
 * Manages all state and business logic
 */
export class BouquetUploaderController extends Component<Props, State> {
  private fileInputRef = React.createRef<HTMLInputElement>();
  private formRef = React.createRef<HTMLFormElement>();
  private validationTimeout: NodeJS.Timeout | null = null;
  private imageLoadTimeout: NodeJS.Timeout | null = null;
  private autoSaveTimeout: NodeJS.Timeout | null = null;
  private scrollTimeout: NodeJS.Timeout | null = null;
  private componentMounted = false;

  constructor(props: Props) {
    super(props);
    this.state = {
      ...initializeEmptyFormState(),
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
      collectionOptions: [],
      typeOptions: [],
      occasionOptions: [],
      flowerOptions: [],
      stockLevelOptions: [],
      sizeOptions: BOUQUET_SIZE_OPTIONS.map((opt) => opt.value),
      statusOptions: ["ready", "preorder"],
    };
  }

    componentDidMount(): void {
    this.componentMounted = true;
    
    // Check for draft existence
    this.setState({ hasDraft: checkDraftExists() });
    
    // Load draft silently
    this.loadDraftSilently();
    
    // Set up auto-save
    this.startAutoSave();
    
    // Set up keyboard shortcuts
    window.addEventListener("keydown", this.handleKeyboardShortcuts);
    
    // Load dropdown options from database
    this.loadDropdownOptions();
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

  // ==================== Dropdown Options ====================
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
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to load dropdown options:", err);
      }
    }
  };

  // ==================== Draft Management ====================
  private loadDraftSilently(): void {
    const draft = loadDraft();
    if (draft) {
      this.setState((prevState) => ({
        ...prevState,
        ...draft,
        hasDraft: true,
        fieldErrors: {},
      }));
    }
  }

  private loadDraftWithMessage = (): void => {
    const draft = loadDraft();
    if (draft) {
      this.setState((prevState) => ({
        ...prevState,
        ...draft,
        hasDraft: true,
        fieldErrors: {},
      }));
      this.setMessage("Draft berhasil dimuat.", "success");
      
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }
      this.scrollTimeout = setTimeout(() => {
        if (this.componentMounted) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 100);
    } else {
      this.setMessage("Tidak ada draft tersimpan.", "error");
      this.setState({ hasDraft: false });
    }
  };

  private saveDraftToStorage = (): void => {
    const formState: UploadFormState = {
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
      newPenandaInput: this.state.newPenandaInput,
      careInstructions: this.state.careInstructions,
    };
    
    saveDraft(formState);
    this.setState({ hasDraft: true, isSavingDraft: false });
  };

  private clearDraftStorage = (): void => {
    clearDraft();
    this.setState({ hasDraft: false });
    this.setMessage("Draft dihapus.", "success");
  };

  private startAutoSave(): void {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
    
    this.autoSaveTimeout = setTimeout(() => {
      if (!this.componentMounted) return;
      
      if (this.hasFormData() && !this.state.submitting) {
        this.setState({ isSavingDraft: true });
        this.saveDraftToStorage();
      }
      
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

  // ==================== Keyboard Shortcuts ====================
  private handleKeyboardShortcuts = (e: KeyboardEvent): void => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (this.hasFormData() && !this.state.submitting) {
          this.setState({ isSavingDraft: true });
          this.saveDraftToStorage();
          this.setMessage("Draft tersimpan.", "success");
        }
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      if (this.hasFormData() && !this.state.submitting) {
        this.setState({ isSavingDraft: true });
        this.saveDraftToStorage();
        this.setMessage("Draft tersimpan.", "success");
      }
    }

    if (e.key === "Escape" && this.hasFormData() && !this.state.submitting) {
      if (window.confirm("Hapus semua data form? Draft akan tetap tersimpan.")) {
        this.resetForm();
      }
    }
  };

  // ==================== Form Management ====================
  private resetForm = (): void => {
    if (this.fileInputRef.current) {
      this.fileInputRef.current.value = "";
    }

    if (this.state.previewUrl && this.state.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(this.state.previewUrl);
    }

    this.setState({
      ...initializeEmptyFormState(),
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

  private setMessage = (message: string, messageType: MessageType): void => {
    if (typeof message === "string" && message.startsWith("Upload failed")) {
      const match = message.match(/Upload failed \(\d+\): ([\s\S]+)/);
      if (match) {
        this.setState({ message: match[1], messageType });
        return;
      }
    }
    this.setState({ message, messageType });
  };

  // ==================== Validation ====================
  private debouncedValidate = (name: string, value: unknown): void => {
    if (this.validationTimeout) {
      clearTimeout(this.validationTimeout);
    }

    this.validationTimeout = setTimeout(() => {
      const error = validateField(name, value);
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

  // ==================== Form Handlers ====================
  handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name } = e.target;
    const value =
      e.target instanceof HTMLInputElement && e.target.type === "checkbox"
        ? e.target.checked
        : e.target.value;

    this.setState((prev) => {
      const newState = {
        ...prev,
        [name]:
          name === "price"
            ? value === "" || value === null || value === undefined
              ? 0
              : (() => {
                  const num = Number(value);
                  if (!Number.isFinite(num) || isNaN(num)) return 0;
                  return num < 0 ? 0 : num;
                })()
            : name === "quantity"
              ? value === "" || value === null || value === undefined
                ? 0
                : (() => {
                    const num = Number(value);
                    if (!Number.isFinite(num) || isNaN(num)) return 0;
                    return Math.max(0, Math.trunc(num));
                  })()
              : value,
      } as State;

      const newTouchedFields = new Set(prev.touchedFields);
      newTouchedFields.add(name);

      let error: string | null = null;
      if (name === "name" || name === "price" || name === "size") {
        error = validateField(name, newState[name as keyof typeof newState]);
      } else {
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

  handleSelectChange = (name: string, value: string): void => {
    this.setState((prev) => {
      const newTouchedFields = new Set(prev.touchedFields);
      newTouchedFields.add(name);

      const error = validateField(name, value);
      const newFieldErrors = { ...prev.fieldErrors };
      if (error) {
        newFieldErrors[name] = error;
      } else {
        delete newFieldErrors[name];
      }

      return {
        ...prev,
        [name]: value,
        touchedFields: newTouchedFields,
        fieldErrors: newFieldErrors,
      };
    });
  };

  handleToggleChange = (name: string, checked: boolean): void => {
    this.setState((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  handleAddPenanda = (): void => {
    const trimmed = this.state.newPenandaInput.trim();
    const validation = validatePenandaInput(trimmed, this.state.customPenanda);
    
    if (!validation.valid && validation.error) {
      this.setMessage(validation.error, "error");
      if (validation.error.includes("Maksimal")) {
        this.setState({ newPenandaInput: "" });
      }
      return;
    }

    this.setState((prev) => ({
      customPenanda: [...prev.customPenanda, trimmed],
      newPenandaInput: "",
    }));
  };

  // ==================== Image Handlers ====================
  handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0] ?? null;

    if (this.state.previewUrl && this.state.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(this.state.previewUrl);
    }

    if (!file) {
      this.setState({
        file: null,
        previewUrl: "",
        isImageLoading: false,
        imageDimensions: null,
      });
      return;
    }

    try {
      this.setState({ isImageLoading: true, file });

      if (this.imageLoadTimeout) {
        clearTimeout(this.imageLoadTimeout);
      }

      this.imageLoadTimeout = setTimeout(async () => {
        if (!this.componentMounted) return;

        try {
          const result = await processImageForUpload(file);
          
          if (!this.componentMounted) {
            URL.revokeObjectURL(result.previewUrl);
            return;
          }

          this.setState({
            previewUrl: result.previewUrl,
            isImageLoading: false,
            file: result.file,
            imageDimensions: result.dimensions,
          });
        } catch (err) {
          if (this.componentMounted) {
            const errorMessage =
              err instanceof Error ? err.message : "Gagal memuat preview gambar.";
            this.setMessage(errorMessage, "error");
            this.setState({
              file: null,
              previewUrl: "",
              isImageLoading: false,
              imageDimensions: null,
            });
          }
        }
      }, 100);
    } catch (err) {
      if (this.componentMounted) {
        const errorMessage =
          err instanceof Error ? err.message : "Gagal memuat preview gambar.";
        this.setMessage(errorMessage, "error");
        this.setState({
          file: null,
          previewUrl: "",
          isImageLoading: false,
          imageDimensions: null,
        });
      }
    }
  };

  handleDropzoneDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.submitting || this.state.isImageLoading) return;
    if (!this.state.isDraggingImage) {
      this.setState({ isDraggingImage: true });
    }
  };

  handleDropzoneDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!this.formRef.current?.contains(relatedTarget)) {
      this.setState({ isDraggingImage: false });
    }
  };

  handleDropzoneKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.openFilePicker();
    }
  };

  handleDropzoneDrop = async (e: React.DragEvent<HTMLDivElement>): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.submitting || this.state.isImageLoading) return;

    const file = e.dataTransfer.files?.[0] ?? null;
    this.setState({ isDraggingImage: false });

    if (!file) return;

    if (this.state.previewUrl && this.state.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(this.state.previewUrl);
    }

    try {
      this.setState({ isImageLoading: true, file });

      const result = await processImageForUpload(file);
      this.setState({
        previewUrl: result.previewUrl,
        isImageLoading: false,
        file: result.file,
        imageDimensions: result.dimensions,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal memuat preview gambar.";
      this.setMessage(errorMessage, "error");
      this.setState({
        file: null,
        previewUrl: "",
        isImageLoading: false,
        imageDimensions: null,
      });
    }
  };

  clearImage = (): void => {
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

  openFilePicker = (): void => {
    if (this.state.submitting || this.state.isImageLoading) return;
    this.fileInputRef.current?.click();
  };

  // ==================== Submit Handler ====================
  handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (this.state.submitting || this.state.isImageLoading) {
      return;
    }

    const allRequiredFields = new Set(["name", "price", "size", "collectionName"]);
    this.setState((prev) => ({
      touchedFields: new Set([...prev.touchedFields, ...allRequiredFields]),
      showValidationSummary: true,
    }));

    const validation = validateUploadForm(this.state, !!this.state.file);

    if (!validation.isValid) {
      this.setState({ fieldErrors: validation.errors });

      const errorKeys = Object.keys(validation.errors);
      const requiredFieldErrors = errorKeys.filter((key) =>
        ["name", "price", "size", "collectionName"].includes(key)
      );

      let errorMessage = "";
      if (requiredFieldErrors.length > 0) {
        const fieldNames: Record<string, string> = {
          name: "Nama bouquet",
          price: "Harga",
          size: "Ukuran",
          collectionName: "Koleksi",
        };
        const missingFields = requiredFieldErrors
          .map((key) => fieldNames[key] || key)
          .join(", ");
        errorMessage = `Field wajib belum diisi: ${missingFields}. Silakan lengkapi semua field wajib terlebih dahulu.`;
      } else {
        const firstError = Object.values(validation.errors)[0];
        if (firstError) {
          errorMessage = firstError;
        }
      }

      if (errorMessage) {
        this.setMessage(errorMessage, "error");
      }

      const firstErrorField = Object.keys(validation.errors)[0];
      if (firstErrorField) {
        if (this.scrollTimeout) {
          clearTimeout(this.scrollTimeout);
        }
        this.scrollTimeout = setTimeout(() => {
          if (!this.componentMounted) return;

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

    this.setState({
      submitting: true,
      message: "",
      messageType: "",
      fieldErrors: {},
      uploadProgress: 0,
      showValidationSummary: false,
    });

    try {
      let formData: FormData;
      try {
        formData = buildUploadFormData(this.state, this.state.file);
      } catch (buildError) {
        const buildErrorMessage =
          buildError instanceof Error
            ? buildError.message
            : "Data tidak valid. Silakan periksa semua field.";
        this.setState({
          submitting: false,
          message: buildErrorMessage,
          messageType: "error",
        });
        setTimeout(() => {
          const messageEl = document.querySelector(".uploader__message");
          if (messageEl) {
            messageEl.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
        return;
      }

      this.setState({
        submitting: true,
        message: "Mengunggah bouquet...",
        messageType: "",
      });

      const uploadTimeout = 60000;
      const uploadPromise = this.props.onUpload(formData);
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(
          () =>
            reject(
              new Error(
                "Upload timeout. File mungkin terlalu besar atau koneksi lambat. Silakan coba lagi dengan file yang lebih kecil."
              )
            ),
          uploadTimeout
        );
      });

      let ok: boolean;
      try {
        ok = await Promise.race([uploadPromise, timeoutPromise]);
      } catch (timeoutErr) {
        if (
          timeoutErr instanceof Error &&
          timeoutErr.message.includes("timeout")
        ) {
          throw new Error(timeoutErr.message);
        }
        throw timeoutErr;
      }

      if (ok) {
        this.clearDraftStorage();

        if (this.fileInputRef.current) {
          this.fileInputRef.current.value = "";
        }

        if (this.state.previewUrl && this.state.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(this.state.previewUrl);
        }

        this.loadDropdownOptions();
        this.resetForm();
        this.setState({
          submitting: false,
          message: "Bouquet berhasil diunggah!",
          messageType: "success",
          imageDimensions: null,
        });

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
        this.setState({
          submitting: false,
          message:
            "Unggah gagal. Silakan periksa koneksi internet dan coba lagi. Pastikan semua field wajib sudah diisi dengan benar.",
          messageType: "error",
        });
        setTimeout(() => {
          const messageEl = document.querySelector(".uploader__message");
          if (messageEl) {
            messageEl.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      }
    } catch (err) {
      console.error("Upload error:", err);
      let errorMessage = "Terjadi kesalahan server. Silakan coba lagi.";

      if (err instanceof Error) {
        errorMessage = err.message;

        // User-friendly error messages
        if (errorMessage.includes("timeout") || errorMessage.includes("Timeout")) {
          errorMessage =
            "Upload timeout. File mungkin terlalu besar atau koneksi lambat. Silakan coba lagi dengan file yang lebih kecil atau periksa koneksi internet Anda.";
        } else if (
          errorMessage.includes("NetworkError") ||
          errorMessage.includes("Failed to fetch")
        ) {
          errorMessage =
            "Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi.";
        } else if (errorMessage.includes("413") || errorMessage.includes("too large")) {
          errorMessage =
            "File gambar terlalu besar. Maksimal 8MB. Silakan pilih file yang lebih kecil.";
        } else if (errorMessage.includes("415") || errorMessage.includes("Unsupported")) {
          errorMessage =
            "Format file tidak didukung. Silakan gunakan JPG, PNG, WEBP, atau HEIC.";
        }
      }

      this.setState({
        submitting: false,
        message: errorMessage,
        messageType: "error",
      });
      setTimeout(() => {
        const messageEl = document.querySelector(".uploader__message");
        if (messageEl) {
          messageEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  };

  // ==================== Expose State for View ====================
  getControllerState() {
    return {
      state: this.state,
      handlers: {
        handleTextChange: this.handleTextChange,
        handleSelectChange: this.handleSelectChange,
        handleToggleChange: this.handleToggleChange,
        handleImageChange: this.handleImageChange,
        handleDropzoneDragOver: this.handleDropzoneDragOver,
        handleDropzoneDragLeave: this.handleDropzoneDragLeave,
        handleDropzoneKeyDown: this.handleDropzoneKeyDown,
        handleDropzoneDrop: this.handleDropzoneDrop,
        handleAddPenanda: this.handleAddPenanda,
        handleSubmit: this.handleSubmit,
        clearImage: this.clearImage,
        openFilePicker: this.openFilePicker,
        loadDraft: this.loadDraftWithMessage,
        clearDraft: this.clearDraftStorage,
        resetForm: this.resetForm,
      },
      refs: {
        fileInputRef: this.fileInputRef,
        formRef: this.formRef,
      },
    };
  }

  render(): React.ReactNode {
    // View will be rendered by wrapper component
    const BouquetUploaderView = require("../view/bouquet-uploader-view").default;
    return <BouquetUploaderView controller={this} />;
  }
}

