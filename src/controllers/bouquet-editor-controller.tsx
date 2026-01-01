// src/controllers/bouquet-editor-controller.tsx
// Controller for bouquet editor form
// Handles all event handlers and state management

import React, { Component, createRef } from "react";
import type { Bouquet } from "../models/domain/bouquet";
import { getDropdownOptions } from "../services/dropdown-options.service";
import {
  type FormState,
  type SaveStatus,
  initializeFormState,
  validateField,
  validateForm,
  isFormDirty,
  isAcceptableImage,
  compressImage,
  buildFormData,
  validatePenandaInput,
  formatErrorMessage,
  DEFAULT_COLLECTIONS,
  DEFAULT_TYPES,
  DEFAULT_STOCK_LEVELS,
  buildPreviewUrl,
} from "../models/bouquet-editor-model";

interface Props {
  bouquet: Bouquet;
  collections: string[];
  onSave: (formData: FormData) => Promise<boolean> | void;
  onDuplicate?: (bouquetId: string) => Promise<void>;
  onDelete?: (bouquetId: string) => Promise<void>;
}

interface State {
  // Form state
  form: FormState;
  initialForm: FormState;

  // UI state
  saving: boolean;
  file: File | null;
  preview: string;
  saveStatus: SaveStatus;
  saveMessage: string;
  isDraggingImage: boolean;
  isImageLoading: boolean;
  imageDimensions: { width: number; height: number } | null;
  fieldErrors: Record<string, string>;
  touchedFields: Set<string>;
  showQuickActions: boolean;
  showDeleteConfirm: boolean;
  isDeleting: boolean;
  isDuplicating: boolean;

  // Dropdown options
  collectionOptions: string[];
  typeOptions: string[];
  occasionOptions: string[];
  flowerOptions: string[];
  stockLevelOptions: string[];
}

export class BouquetEditorController extends Component<Props, State> {
  private previewRef: string = "";
  private nameInputRef = createRef<HTMLInputElement>();
  private quickActionsRef = createRef<HTMLDivElement>();
  private abortController: AbortController | null = null;
  private saveStatusTimeout: number | null = null;
  private keyboardShortcutHandler: ((e: KeyboardEvent) => void) | null = null;
  private clickOutsideHandler: ((e: MouseEvent | TouchEvent) => void) | null = null;
  private escapeHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(props: Props) {
    super(props);
    const initialForm = initializeFormState(props.bouquet);
    this.state = {
      form: initialForm,
      initialForm,
      saving: false,
      file: null,
      preview: props.bouquet.image ?? "",
      saveStatus: "idle",
      saveMessage: "",
      isDraggingImage: false,
      isImageLoading: false,
      imageDimensions: null,
      fieldErrors: {},
      touchedFields: new Set(),
      showQuickActions: false,
      showDeleteConfirm: false,
      isDeleting: false,
      isDuplicating: false,
      collectionOptions: DEFAULT_COLLECTIONS,
      typeOptions: DEFAULT_TYPES,
      occasionOptions: [],
      flowerOptions: [],
      stockLevelOptions: DEFAULT_STOCK_LEVELS,
    };
    this.previewRef = props.bouquet.image ?? "";
  }

  componentDidMount(): void {
    this.loadDropdownOptions();
    this.autoFocusNameInput();
    this.setupKeyboardShortcuts();
    this.setupQuickActionsListeners();
  }

  componentDidUpdate(prevProps: Props, prevState: State): void {
    if (prevProps.bouquet._id !== this.props.bouquet._id) {
      this.resetFormFromBouquet();
    }
    
    // Update quick actions listeners when showQuickActions changes
    if (prevState.showQuickActions !== this.state.showQuickActions) {
      this.updateQuickActionsListeners();
    }
  }

  componentWillUnmount(): void {
    this.cleanup();
    this.removeQuickActionsListeners();
    this.removeKeyboardShortcuts();
  }

  // ==================== Lifecycle Helpers ====================

  private loadDropdownOptions = async (): Promise<void> => {
    this.abortController = new AbortController();
    try {
      const options = await getDropdownOptions(this.abortController.signal);
      this.setState({
        collectionOptions: options.collections,
        typeOptions: options.types,
        occasionOptions: options.occasions,
        flowerOptions: options.flowers,
        stockLevelOptions: options.stockLevels,
      });
    } catch (err) {
      if (!this.abortController.signal.aborted) {
        console.error("Failed to load dropdown options:", err);
        // Keep defaults
      }
    }
  };

  private autoFocusNameInput = (): void => {
    if (this.nameInputRef.current) {
      this.nameInputRef.current.focus();
    }
  };

  private resetFormFromBouquet = (): void => {
    const initialForm = initializeFormState(this.props.bouquet);
    
    // Cleanup blob URL if exists
    if (this.previewRef && this.previewRef.startsWith("blob:")) {
      URL.revokeObjectURL(this.previewRef);
    }

    const newPreview = this.props.bouquet.image ?? "";
    this.previewRef = newPreview;

    this.setState({
      form: initialForm,
      initialForm,
      file: null,
      preview: newPreview,
      saveStatus: "idle",
      saveMessage: "",
      fieldErrors: {},
      touchedFields: new Set(),
      imageDimensions: null,
    });
  };

  private cleanup = (): void => {
    // Cleanup blob URL
    if (this.previewRef && this.previewRef.startsWith("blob:")) {
      URL.revokeObjectURL(this.previewRef);
    }

    // Abort fetch requests
    if (this.abortController) {
      this.abortController.abort();
    }

    // Clear timeouts
    if (this.saveStatusTimeout) {
      window.clearTimeout(this.saveStatusTimeout);
    }
  };

  private setupKeyboardShortcuts = (): void => {
    this.keyboardShortcutHandler = (e: KeyboardEvent): void => {
      const { canSave, isDirty } = this.getValidationState();
      
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (canSave && isDirty) {
          this.handleSave();
        }
      }
      // Escape to reset changes
      if (e.key === "Escape" && isDirty) {
        if (window.confirm("Apakah Anda yakin ingin membatalkan perubahan?")) {
          this.resetForm();
        }
      }
    };

    window.addEventListener("keydown", this.keyboardShortcutHandler);
  };

  private removeKeyboardShortcuts = (): void => {
    if (this.keyboardShortcutHandler) {
      window.removeEventListener("keydown", this.keyboardShortcutHandler);
      this.keyboardShortcutHandler = null;
    }
  };

  private setupQuickActionsListeners = (): void => {
    this.clickOutsideHandler = (e: MouseEvent | TouchEvent): void => {
      if (
        this.quickActionsRef.current &&
        !this.quickActionsRef.current.contains(e.target as Node)
      ) {
        this.setState({ showQuickActions: false });
      }
    };

    this.escapeHandler = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && this.state.showQuickActions) {
        this.setState({ showQuickActions: false });
      }
    };

    // Listeners will be added/removed based on showQuickActions state
    this.updateQuickActionsListeners();
  };

  private updateQuickActionsListeners = (): void => {
    if (this.state.showQuickActions) {
      // Use capture phase for better mobile support
      document.addEventListener("mousedown", this.clickOutsideHandler!, true);
      document.addEventListener("touchstart", this.clickOutsideHandler!, true);
      document.addEventListener("keydown", this.escapeHandler!);
    } else {
      this.removeQuickActionsListeners();
    }
  };

  private removeQuickActionsListeners = (): void => {
    if (this.clickOutsideHandler) {
      document.removeEventListener("mousedown", this.clickOutsideHandler, true);
      document.removeEventListener("touchstart", this.clickOutsideHandler, true);
    }
    if (this.escapeHandler) {
      document.removeEventListener("keydown", this.escapeHandler);
    }
  };

  // ==================== Validation Helpers ====================

  private getValidationState(): { validationError: string | null; canSave: boolean; isDirty: boolean } {
    const validationError = validateForm(this.state.form);
    const canSave = !this.state.saving && !validationError;
    const isDirty = isFormDirty(this.state.form, this.state.initialForm, !!this.state.file);
    return { validationError, canSave, isDirty };
  }

  // ==================== Form Handlers ====================

  handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;

    // Mark field as touched
    this.setState((prev) => ({
      touchedFields: new Set([...prev.touchedFields, name]),
    }));

    // Calculate new value
    const newValue =
      name === "price"
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
    this.setState((prev) => {
      const newErrors = { ...prev.fieldErrors };
      if (error) {
        newErrors[name] = error;
      } else {
        delete newErrors[name];
      }
      return {
        form: { ...prev.form, [name]: newValue } as FormState,
        fieldErrors: newErrors,
      };
    });
  };

  handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const { name, value } = e.target;
    this.setState((prev) => ({
      form: { ...prev.form, [name]: value } as FormState,
    }));
  };

  handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, checked } = e.target;
    this.setState((prev) => ({
      form: { ...prev.form, [name]: checked } as FormState,
    }));
  };

  // ==================== Image Handlers ====================

  handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    // Prevent double processing
    if (this.state.isImageLoading || this.state.saving) {
      return;
    }

    const selectedFile = e.target.files?.[0] ?? null;
    if (!selectedFile) {
      // Cleanup blob URL if clearing file
      if (this.previewRef && this.previewRef.startsWith("blob:")) {
        URL.revokeObjectURL(this.previewRef);
      }
      this.setState({
        file: null,
        preview: this.props.bouquet.image ?? "",
      });
      this.previewRef = this.props.bouquet.image ?? "";
      return;
    }

    await this.processImageFile(selectedFile);
  };

  private processImageFile = async (selectedFile: File): Promise<void> => {
    // Prevent processing if already loading or saving
    if (this.state.isImageLoading || this.state.saving) {
      return;
    }

    // Check file size (8MB limit)
    const maxSize = 8 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      this.setSaveStatus("error", "Ukuran file maksimal 8MB. Silakan pilih file yang lebih kecil.");
      return;
    }

    if (!isAcceptableImage(selectedFile)) {
      this.setSaveStatus("error", "File harus berupa gambar (JPG/PNG/WEBP/HEIC).");
      return;
    }

    this.setState({ isImageLoading: true, saveStatus: "idle", saveMessage: "" });

    try {
      // Compress image if it's large
      let processedFile = selectedFile;
      let dimensions: { width: number; height: number } | null = null;
      
      if (selectedFile.size > 2 * 1024 * 1024) {
        try {
          const result = await compressImage(selectedFile);
          processedFile = result.file;
          dimensions = result.dimensions;
        } catch (compressError) {
          // Image compression failed, using original file
          if (process.env.NODE_ENV === "development") {
            console.warn("Image compression failed, using original:", compressError);
          }
          // Continue with original file if compression fails
        }
      }

      // Create new blob URL
      const objectUrl = URL.createObjectURL(processedFile);

      // Cleanup old preview blob URL if exists
      if (this.previewRef && this.previewRef.startsWith("blob:")) {
        URL.revokeObjectURL(this.previewRef);
      }

      // Set file and preview atomically
      this.previewRef = objectUrl;
      this.setState({
        file: processedFile,
        preview: objectUrl,
        imageDimensions: dimensions,
      });
    } catch (err) {
      // Error processing image - log in development only
      if (process.env.NODE_ENV === "development") {
        console.error("Error processing image:", err);
      }
      this.setSaveStatus("error", "Gagal memproses gambar. Silakan coba file lain.");
      this.setState({ file: null });
      // Cleanup any blob URL that might have been created
      if (this.previewRef && this.previewRef.startsWith("blob:")) {
        URL.revokeObjectURL(this.previewRef);
      }
    } finally {
      this.setState({ isImageLoading: false });
    }
  };

  resetImage = (): void => {
    if (this.previewRef && this.previewRef.startsWith("blob:")) {
      URL.revokeObjectURL(this.previewRef);
    }
    this.setState({
      file: null,
      preview: this.props.bouquet.image ?? "",
      saveStatus: "idle",
      saveMessage: "",
      imageDimensions: null,
    });
    this.previewRef = this.props.bouquet.image ?? "";
  };

  // ==================== Penanda Handlers ====================

  handleAddPenanda = (): void => {
    const { form } = this.state;
    const validation = validatePenandaInput(form.newPenandaInput, form.customPenanda);

    if (!validation.valid) {
      this.setSaveStatus("error", validation.error || "Nama penanda tidak boleh kosong.");
      if (validation.error?.includes("sudah ada") || validation.error?.includes("Maksimal")) {
        this.setState((prev) => ({
          form: { ...prev.form, newPenandaInput: "" },
        }));
      }
      return;
    }

    const trimmed = form.newPenandaInput.trim();
    this.setState((prev) => ({
      form: {
        ...prev.form,
        customPenanda: [...prev.form.customPenanda, trimmed],
        newPenandaInput: "",
      },
    }));
  };

  // ==================== Save/Delete/Duplicate Handlers ====================

  handleSave = async (): Promise<void> => {
    // Prevent double submission
    if (this.state.saving) {
      return;
    }

    const { validationError, isDirty } = this.getValidationState();

    if (validationError) {
      // Scroll to first error
      const firstErrorField = Object.keys(this.state.fieldErrors)[0];
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
      this.setState({ saving: true });
      const fd = buildFormData(this.state.form, this.state.file);

      // Add timeout protection for save (30 seconds)
      const savePromise = this.props.onSave(fd);
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error("Save timeout. Silakan coba lagi.")), 30000);
      });

      const result = await Promise.race([savePromise, timeoutPromise]);
      if (typeof result === "boolean") {
        if (result) {
          // Clear file after successful save
          this.setState({
            file: null,
            imageDimensions: null,
            saving: false,
          });
          // Show success message - STAY IN EDIT VIEW (don't auto-navigate)
          this.setSaveStatus(
            "success",
            "Perubahan tersimpan. Anda dapat melanjutkan editing atau kembali ke detail koleksi."
          );
        } else {
          // IMPORTANT: Reset saving state on failure to allow retry
          this.setState({ saving: false });
          this.setSaveStatus("error", "Gagal menyimpan. Coba lagi.");
        }
      } else {
        this.setSaveStatus("success", "Perubahan tersimpan.");
        this.setState({
          saving: false,
          file: null,
          imageDimensions: null,
        });
      }
    } catch (err) {
      console.error("Save error:", err);
      const errorMessage = formatErrorMessage(err);

      // IMPORTANT: Always reset saving state to allow retry
      this.setState({ saving: false });
      this.setSaveStatus("error", errorMessage);

      // Scroll to error message
      setTimeout(() => {
        const messageEl = document.querySelector(".becSaveNote.is-show");
        if (messageEl) {
          messageEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  };

  resetForm = (): void => {
    const initialForm = initializeFormState(this.props.bouquet);
    
    // Cleanup blob URL if exists
    if (this.previewRef && this.previewRef.startsWith("blob:")) {
      URL.revokeObjectURL(this.previewRef);
    }

    const newPreview = this.props.bouquet.image ?? "";
    this.previewRef = newPreview;

    this.setState({
      form: initialForm,
      initialForm,
      file: null,
      preview: newPreview,
      fieldErrors: {},
      touchedFields: new Set(),
      imageDimensions: null,
      isImageLoading: false,
      saveStatus: "idle",
      saveMessage: "",
    });
  };

  handleDuplicate = async (): Promise<void> => {
    if (!this.props.onDuplicate) return;

    try {
      this.setState({ isDuplicating: true });
      await this.props.onDuplicate(this.props.bouquet._id);
      this.setSaveStatus("success", "Bouquet berhasil diduplikasi!");
      this.setState({ showQuickActions: false });
    } catch (err) {
      console.error("Duplicate error:", err);
      this.setSaveStatus("error", "Gagal menduplikasi bouquet.");
    } finally {
      this.setState({ isDuplicating: false });
    }
  };

  handleDelete = async (): Promise<void> => {
    if (!this.props.onDelete) return;

    try {
      this.setState({ isDeleting: true });
      await this.props.onDelete(this.props.bouquet._id);
      this.setState({
        showDeleteConfirm: false,
        showQuickActions: false,
      });
    } catch (err) {
      console.error("Delete error:", err);
      this.setSaveStatus("error", "Gagal menghapus bouquet.");
      this.setState({ isDeleting: false });
    }
  };

  // ==================== UI State Helpers ====================

  setSaveStatus = (status: SaveStatus, message: string = ""): void => {
    this.setState({ saveStatus: status, saveMessage: message });

    // Auto-hide status after 3.5 seconds
    if (status !== "idle") {
      if (this.saveStatusTimeout) {
        window.clearTimeout(this.saveStatusTimeout);
      }
      this.saveStatusTimeout = window.setTimeout(() => {
        this.setState({ saveStatus: "idle", saveMessage: "" });
      }, 3500);
    }
  };

  // ==================== Getters for View ====================

  getPreviewUrl = (): string => {
    return buildPreviewUrl(this.state.preview);
  };

  getValidationError = (): string | null => {
    return validateForm(this.state.form);
  };

  getCanSave = (): boolean => {
    const { validationError } = this.getValidationState();
    return !this.state.saving && !validationError;
  };

  getIsDirty = (): boolean => {
    return isFormDirty(this.state.form, this.state.initialForm, !!this.state.file);
  };

  // Expose state and handlers for View component
  getControllerState() {
    return {
      state: this.state,
      handlers: {
        handleTextChange: this.handleTextChange,
        handleSelectChange: this.handleSelectChange,
        handleToggleChange: this.handleToggleChange,
        handleImageChange: this.handleImageChange,
        handleAddPenanda: this.handleAddPenanda,
        handleSave: this.handleSave,
        resetForm: this.resetForm,
        resetImage: this.resetImage,
        handleDuplicate: this.handleDuplicate,
        handleDelete: this.handleDelete,
      },
      getters: {
        previewUrl: this.getPreviewUrl(),
        validationError: this.getValidationError(),
        canSave: this.getCanSave(),
        isDirty: this.getIsDirty(),
      },
      refs: {
        nameInputRef: this.nameInputRef,
        quickActionsRef: this.quickActionsRef,
      },
    };
  }

  render(): React.ReactNode {
    // Import View dynamically to avoid circular dependency
    const BouquetEditorView = require("../view/bouquet-editor-view").default;
    return <BouquetEditorView controller={this} />;
  }
}

