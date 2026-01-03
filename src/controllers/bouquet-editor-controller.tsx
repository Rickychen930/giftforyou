// src/controllers/bouquet-editor-controller.tsx
// Controller for bouquet editor form
// Handles all event handlers and state management
// Extends BaseController for common functionality (SOLID, DRY)

import React, { createRef } from "react";
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
import { BaseController, type BaseControllerProps, type BaseControllerState } from "./base/BaseController";

interface Props extends BaseControllerProps {
  bouquet: Bouquet;
  collections: string[];
  onSave: (formData: FormData) => Promise<boolean> | void;
  onDuplicate?: (bouquetId: string) => Promise<void>;
  onDelete?: (bouquetId: string) => Promise<void>;
}

interface State extends BaseControllerState {
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

export class BouquetEditorController extends BaseController<Props, State> {
  private previewRef: string = "";
  private nameInputRef = createRef<HTMLInputElement>();
  private quickActionsRef = createRef<HTMLDivElement>();
  private saveStatusTimeout: number | null = null;
  private keyboardShortcutHandler: ((e: KeyboardEvent) => void) | null = null;
  private clickOutsideHandler: ((e: MouseEvent | TouchEvent) => void) | null = null;
  private escapeHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(props: Props) {
    super(props);
    const initialForm = initializeFormState(props.bouquet);
    this.state = {
      ...this.state,
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

  /**
   * Component lifecycle: Mount
   * BaseController handles initialization
   */
  componentDidMount(): void {
    super.componentDidMount();
    this.loadDropdownOptions();
    this.autoFocusNameInput();
    this.setupKeyboardShortcuts();
    this.setupQuickActionsListeners();
  }

  componentDidUpdate(prevProps: Props, prevState: State): void {
    // Enhanced: Reset form when bouquet changes (different bouquet selected)
    if (prevProps.bouquet._id !== this.props.bouquet._id) {
      this.resetFormFromBouquet();
    }
    // Enhanced: Also update form when bouquet data changes (after save from parent)
    else if (prevProps.bouquet !== this.props.bouquet) {
      // Only update if form is not dirty to prevent overwriting user changes
      const { isDirty } = this.getValidationState();
      if (!isDirty) {
        this.resetFormFromBouquet();
      } else {
        // Enhanced: Show notification if there are unsaved changes when bouquet updates
        // This helps prevent accidental data loss
        if (process.env.NODE_ENV === "development") {
          console.log("Bouquet data updated but form has unsaved changes");
        }
      }
    }
    
    // Enhanced: Update quick actions listeners when showQuickActions changes
    if (prevState.showQuickActions !== this.state.showQuickActions) {
      this.updateQuickActionsListeners();
    }

    // Enhanced: Clear validation errors when form becomes valid
    if (prevState.fieldErrors && Object.keys(prevState.fieldErrors).length > 0) {
      const { validationError } = this.getValidationState();
      if (!validationError && Object.keys(this.state.fieldErrors).length > 0) {
        // Form is now valid, clear any remaining errors
        this.setState({ fieldErrors: {} });
      }
    }
  }

  /**
   * Component lifecycle: Unmount
   * BaseController handles cleanup
   */
  componentWillUnmount(): void {
    this.cleanup();
    this.removeQuickActionsListeners();
    this.removeKeyboardShortcuts();
    super.componentWillUnmount();
  }

  // ==================== Lifecycle Helpers ====================

  private loadDropdownOptions = async (): Promise<void> => {
    try {
      const options = await getDropdownOptions(this.abortController?.signal);
      this.setState({
        collectionOptions: options.collections,
        typeOptions: options.types,
        occasionOptions: options.occasions,
        flowerOptions: options.flowers,
        stockLevelOptions: options.stockLevels,
      });
    } catch (err) {
      if (!this.abortController?.signal.aborted) {
        this.setError(err, "Failed to load dropdown options");
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

    // Clear all timeouts
    if (this.saveStatusTimeout) {
      window.clearTimeout(this.saveStatusTimeout);
      this.saveStatusTimeout = null;
    }
    if (this.validationDebounceTimeout) {
      clearTimeout(this.validationDebounceTimeout);
      this.validationDebounceTimeout = null;
    }
    // Note: AbortController cleanup is handled by BaseController
  };

  private setupKeyboardShortcuts = (): void => {
    this.keyboardShortcutHandler = (e: KeyboardEvent): void => {
      // Prevent shortcuts when typing in inputs/textarea (except Ctrl+S)
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      
      const { canSave, isDirty } = this.getValidationState();
      
      // Ctrl/Cmd + S to save (always works, even in inputs)
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (canSave && isDirty) {
          this.handleSave();
        } else if (!isDirty) {
          // Show feedback when no changes to save
          this.setSaveStatus("idle", "Tidak ada perubahan untuk disimpan.");
        }
      }
      // Escape to reset changes (only when not in input/textarea)
      if (e.key === "Escape" && isDirty && !isInput) {
        e.preventDefault();
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
  private validationDebounceTimeout: NodeJS.Timeout | null = null;

  handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;

    // Mark field as touched immediately for better UX
    this.setState((prev) => ({
      touchedFields: new Set([...prev.touchedFields, name]),
    }));

    // Calculate new value with optimized logic
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

    // Update form state immediately (optimistic update)
    this.setState((prev) => ({
      form: { ...prev.form, [name]: newValue } as FormState,
    }));

    // Debounce validation for better performance (except for critical fields)
    const needsImmediateValidation = name === "name" || name === "price" || name === "size";
    
    if (needsImmediateValidation) {
      // Immediate validation for critical fields
      const error = validateField(name, newValue);
      this.setState((prev) => {
        const newErrors = { ...prev.fieldErrors };
        if (error) {
          newErrors[name] = error;
        } else {
          delete newErrors[name];
        }
        return { fieldErrors: newErrors };
      });
    } else {
      // Debounced validation for non-critical fields
      if (this.validationDebounceTimeout) {
        clearTimeout(this.validationDebounceTimeout);
      }
      this.validationDebounceTimeout = setTimeout(() => {
        const error = validateField(name, newValue);
        this.setState((prev) => {
          const newErrors = { ...prev.fieldErrors };
          if (error) {
            newErrors[name] = error;
          } else {
            delete newErrors[name];
          }
          return { fieldErrors: newErrors };
        });
      }, 300);
    }
  };

  handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const { name, value } = e.target;
    this.setState((prev) => ({
      form: { ...prev.form, [name]: value } as FormState,
      touchedFields: new Set([...prev.touchedFields, name]),
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
    // Enhanced: Prevent processing if already loading or saving
    if (this.state.isImageLoading || this.state.saving) {
      return;
    }

    // Enhanced: Check file size (8MB limit) - early validation for better UX
    const maxSize = 8 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      this.setSaveStatus("error", "Ukuran file maksimal 8MB. Silakan pilih file yang lebih kecil.");
      // Enhanced: Clear file input to prevent retry with same file
      if (this.nameInputRef.current?.form) {
        const fileInput = this.nameInputRef.current.form.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }
      }
      return;
    }

    // Enhanced: Validate file type with better error message
    if (!isAcceptableImage(selectedFile)) {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase() || 'unknown';
      this.setSaveStatus("error", `Format file tidak didukung (${fileExtension}). Gunakan JPG, PNG, WEBP, atau HEIC.`);
      // Enhanced: Clear file input
      if (this.nameInputRef.current?.form) {
        const fileInput = this.nameInputRef.current.form.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }
      }
      return;
    }

    // Optimistic UI update - show loading immediately
    this.setState({ 
      isImageLoading: true, 
      saveStatus: "idle", 
      saveMessage: "",
      // Clear previous errors
      fieldErrors: {},
    });

    try {
      // Process image with optimized performance
      // Compress image if it's large (optimize for performance)
      let processedFile = selectedFile;
      let dimensions: { width: number; height: number } | null = null;
      
      // Only compress if file is larger than 2MB to save processing time
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
          // Try to get dimensions from original file
          try {
            const img = new Image();
            const tempUrl = URL.createObjectURL(selectedFile);
            await new Promise<void>((resolve, reject) => {
              img.onload = () => {
                dimensions = { width: img.naturalWidth, height: img.naturalHeight };
                URL.revokeObjectURL(tempUrl);
                resolve();
              };
              img.onerror = () => {
                URL.revokeObjectURL(tempUrl);
                reject(new Error("Failed to load image"));
              };
              img.src = tempUrl;
            });
          } catch (dimError) {
            // Dimensions not critical, continue without them
            if (process.env.NODE_ENV === "development") {
              console.warn("Failed to get image dimensions:", dimError);
            }
          }
        }
      } else {
        // For smaller files, get dimensions without compression for faster processing
        try {
          const img = new Image();
          const tempUrl = URL.createObjectURL(selectedFile);
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              dimensions = { width: img.naturalWidth, height: img.naturalHeight };
              URL.revokeObjectURL(tempUrl);
              resolve();
            };
            img.onerror = () => {
              URL.revokeObjectURL(tempUrl);
              reject(new Error("Failed to load image"));
            };
            img.src = tempUrl;
          });
        } catch (dimError) {
          // Dimensions not critical, continue without them
          if (process.env.NODE_ENV === "development") {
            console.warn("Failed to get image dimensions:", dimError);
          }
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
        isImageLoading: false,
      });
    } catch (err) {
      // Error processing image - log in development only
      if (process.env.NODE_ENV === "development") {
        console.error("Error processing image:", err);
      }
      this.setSaveStatus("error", "Gagal memproses gambar. Silakan coba file lain.");
      this.setState({ 
        file: null,
        isImageLoading: false,
      });
      // Cleanup any blob URL that might have been created
      if (this.previewRef && this.previewRef.startsWith("blob:")) {
        URL.revokeObjectURL(this.previewRef);
        this.previewRef = this.props.bouquet.image ?? "";
      }
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
    // Enhanced: Prevent double submission or save during image processing
    if (this.state.saving || this.state.isImageLoading) {
      if (this.state.isImageLoading) {
        this.setSaveStatus("error", "Tunggu hingga gambar selesai diproses sebelum menyimpan.");
      }
      return;
    }

    const { validationError, isDirty } = this.getValidationState();

    // Enhanced: Better error handling and user feedback
    if (validationError) {
      // Enhanced: Mark all required fields as touched for better UX
      const requiredFields = ["name", "price", "size", "collectionName"];
      this.setState((prev) => ({
        touchedFields: new Set([...prev.touchedFields, ...requiredFields]),
      }));

      // Enhanced: Scroll to first error with optimized behavior using requestAnimationFrame
      const firstErrorField = Object.keys(this.state.fieldErrors)[0];
      if (firstErrorField) {
        // Use requestAnimationFrame for smooth scrolling
        requestAnimationFrame(() => {
          const errorElement = document.querySelector(
            `[name="${firstErrorField}"], #${firstErrorField}-error, [aria-describedby*="${firstErrorField}"]`
          ) as HTMLElement;
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
            // Enhanced: Focus after scroll completes for better accessibility
            setTimeout(() => {
              if (errorElement.tagName === "INPUT" || errorElement.tagName === "TEXTAREA" || errorElement.tagName === "SELECT") {
                errorElement.focus();
                // Enhanced: Select text if it's an input field
                if (errorElement instanceof HTMLInputElement && errorElement.type === "text") {
                  errorElement.select();
                }
              }
            }, 300);
          }
        });
      }
      // Enhanced: Show validation error message
      this.setSaveStatus("error", validationError);
      return;
    }

    // Enhanced: Better feedback when no changes
    if (!isDirty) {
      this.setSaveStatus("idle", "Tidak ada perubahan untuk disimpan.");
      return;
    }

    try {
      this.setState({ saving: true });
      const fd = buildFormData(this.state.form, this.state.file);

      // Enhanced: Add timeout protection for save (30 seconds) with better error handling
      const savePromise = this.props.onSave(fd);
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error("Save timeout. Silakan coba lagi.")), 30000);
      });

      let result: boolean | void;
      try {
        result = await Promise.race([savePromise, timeoutPromise]);
      } catch (timeoutErr) {
        // Enhanced: Handle timeout specifically
        if (timeoutErr instanceof Error && timeoutErr.message.includes("timeout")) {
          throw new Error("Waktu penyimpanan habis. Periksa koneksi internet dan coba lagi.");
        }
        throw timeoutErr;
      }
      
      // Handle save result
      if (typeof result === "boolean") {
        if (result) {
          // Save successful - update initialForm to reflect saved state
          // This prevents false "dirty" state after save
          const savedForm = { ...this.state.form };
          
          // Cleanup blob URL if file was uploaded
          if (this.state.file && this.previewRef && this.previewRef.startsWith("blob:")) {
            URL.revokeObjectURL(this.previewRef);
            // Update preview to use saved image URL (will be updated by parent)
            this.previewRef = this.props.bouquet.image ?? "";
          }
          
          this.setState((prev) => ({
            form: savedForm, // Keep current form state
            initialForm: savedForm, // Update initialForm to match current form
            file: null, // Clear file after successful save
            preview: this.props.bouquet.image ?? prev.preview, // Use saved image
            imageDimensions: null,
            saving: false,
            fieldErrors: {}, // Clear any validation errors
          }));
          
          // Show success message - STAY IN EDIT VIEW (don't auto-navigate)
          this.setSaveStatus(
            "success",
            "Perubahan tersimpan. Anda dapat melanjutkan editing atau kembali ke detail koleksi."
          );
        } else {
          // IMPORTANT: Reset saving state on failure to allow retry
          this.setState({ saving: false });
          this.setSaveStatus("error", "Gagal menyimpan. Silakan periksa koneksi dan coba lagi.");
        }
      } else {
        // Void return - assume success
        const savedForm = { ...this.state.form };
        
        // Cleanup blob URL if file was uploaded
        if (this.state.file && this.previewRef && this.previewRef.startsWith("blob:")) {
          URL.revokeObjectURL(this.previewRef);
          this.previewRef = this.props.bouquet.image ?? "";
        }
        
        this.setState((prev) => ({
          form: savedForm,
          initialForm: savedForm,
          saving: false,
          file: null,
          preview: this.props.bouquet.image ?? prev.preview,
          imageDimensions: null,
          fieldErrors: {},
        }));
        this.setSaveStatus("success", "Perubahan tersimpan.");
      }
    } catch (err) {
      console.error("Save error:", err);
      const errorMessage = formatErrorMessage(err);

      // IMPORTANT: Always reset saving state to allow retry
      this.setState({ saving: false });
      this.setSaveStatus("error", errorMessage);

      // Scroll to error message with optimized behavior
      requestAnimationFrame(() => {
        setTimeout(() => {
          const messageEl = document.querySelector(".becSaveNote.is-show");
          if (messageEl) {
            messageEl.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      });
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

