// src/view/bouquet-editor-view.tsx
// View component for bouquet editor
// Follows OOP and SOLID principles - only handles presentation

import React, { Component } from "react";
import "../styles/BouquetCardEditComponent.css";
import type { BouquetEditorController } from "../controllers/bouquet-editor-controller";
import {
  formatPrice,
  formatBytes,
  getCharacterCountClass,
  FALLBACK_IMAGE,
} from "../models/bouquet-editor-model";
import {
  BOUQUET_SIZE_OPTIONS,
  type BouquetSize,
} from "../constants/bouquet-constants";
import DropdownWithModal from "../components/inputs/DropdownWithModal";
import TagInput from "../components/inputs/TagInput";
import FormField from "../components/inputs/FormField";
import TextInput from "../components/inputs/TextInput";
import NumberInput from "../components/inputs/NumberInput";
import PriceInput from "../components/inputs/PriceInput";
import TextareaInput from "../components/inputs/TextareaInput";
import StatusSelect from "../components/inputs/StatusSelect";
import ToggleGroup, { type ToggleOption } from "../components/common/ToggleGroup";
import { validateField } from "../models/bouquet-editor-model";

interface Props {
  controller: BouquetEditorController;
}

/**
 * View Component for Bouquet Editor
 * Handles only presentation logic - follows Single Responsibility Principle
 * Optimized for performance with shouldComponentUpdate
 */
class BouquetEditorView extends Component<Props> {
  // Performance: Cache controller state to prevent unnecessary recalculations
  private cachedState: ReturnType<BouquetEditorController['getControllerState']> | null = null;
  private lastControllerStateHash: string = "";
  // Performance: Cache rendered components
  private renderCache: Map<string, React.ReactNode> = new Map();
  private lastRenderKey: string = "";

  // Performance: Prevent unnecessary re-renders with deep comparison
  shouldComponentUpdate(nextProps: Props): boolean {
    // Only update if controller reference changed
    if (nextProps.controller !== this.props.controller) {
      // Clear cache when controller changes
      this.cachedState = null;
      this.lastControllerStateHash = "";
      this.renderCache.clear();
      this.lastRenderKey = "";
      return true;
    }
    return false;
  }

  private getControllerState() {
    // Performance: Cache state to prevent recalculation
    const state = this.props.controller.getControllerState();
    
    // Performance: Create hash from only relevant state fields
    const stateHash = JSON.stringify({
      form: {
        name: state.state.form.name,
        price: state.state.form.price,
        collectionName: state.state.form.collectionName,
        description: state.state.form.description,
        _id: state.state.form._id,
      },
      saving: state.state.saving,
      isImageLoading: state.state.isImageLoading,
      fieldErrors: state.state.fieldErrors,
    });
    
    if (this.cachedState && this.lastControllerStateHash === stateHash) {
      return this.cachedState;
    }
    
    this.cachedState = state;
    this.lastControllerStateHash = stateHash;
    return state;
  }

  // Performance: Clear cache when component unmounts
  componentWillUnmount(): void {
    this.cachedState = null;
    this.lastControllerStateHash = "";
    this.renderCache.clear();
    this.lastRenderKey = "";
  }

  // ==================== Header Section ====================
  private renderHeader(): React.ReactNode {
    const { state, getters } = this.getControllerState();
    const { form } = state;

    return (
      <header className="becHeader">
        <div className="becHeader__left">
          <h3
            className="becHeader__title"
            title={form.name || "Bouquet tanpa judul"}
          >
            <span className="becHeader__titleText">
              {form.name || "Bouquet tanpa judul"}
            </span>
            {getters.isDirty && (
              <span
                className="becDirtyIndicator"
                title="Ada perubahan yang belum disimpan"
                aria-label="Perubahan belum disimpan"
              >
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 8 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="4" cy="4" r="4" fill="currentColor" />
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
          {this.renderQuickActions()}
        </div>
      </header>
    );
  }

  private renderQuickActions(): React.ReactNode {
    const { state, handlers, refs } = this.getControllerState();
    const { showQuickActions, isDuplicating, isDeleting } = state;
    const controller = this.props.controller;
    const onDuplicate = controller.props.onDuplicate;
    const onDelete = controller.props.onDelete;

    if (!onDuplicate && !onDelete) return null;

    return (
      <div className="becQuickActions" ref={refs.quickActionsRef}>
        <button
          type="button"
          className="becQuickActionsBtn"
          onClick={() => {
            const controller = this.props.controller;
            controller.setState((prev) => ({
              ...prev,
              showQuickActions: !prev.showQuickActions,
            }));
          }}
          aria-label="Quick actions"
          aria-expanded={showQuickActions}
          title="Quick actions"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="5" r="2" fill="currentColor" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
            <circle cx="12" cy="19" r="2" fill="currentColor" />
          </svg>
        </button>

        {showQuickActions && (
          <>
            <div
              className="becQuickActionsOverlay"
              onClick={() => {
                const controller = this.props.controller;
                controller.setState((prev) => ({
                  ...prev,
                  showQuickActions: false,
                }));
              }}
              aria-hidden="true"
            />
            <div className="becQuickActionsMenu">
              {onDuplicate && (
                <button
                  type="button"
                  className="becQuickActionItem"
                  onClick={() => {
                    const controller = this.props.controller;
                    controller.setState((prev) => ({
                      ...prev,
                      showQuickActions: false,
                    }));
                    handlers.handleDuplicate();
                  }}
                  disabled={isDuplicating}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 8V5C8 3.89543 8.89543 3 10 3H19C20.1046 3 21 3.89543 21 5V14C21 15.1046 20.1046 16 19 16H16M5 8H16C17.1046 8 18 8.89543 18 10V19C18 20.1046 17.1046 21 16 21H5C3.89543 21 3 20.1046 3 19V10C3 8.89543 3.89543 8 5 8Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isDuplicating ? "Menduplikasi..." : "Duplikasi"}
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  className="becQuickActionItem becQuickActionItem--danger"
                  onClick={() => {
                    const controller = this.props.controller;
                    controller.setState((prev) => ({
                      ...prev,
                      showQuickActions: false,
                      showDeleteConfirm: true,
                    }));
                  }}
                  disabled={isDeleting}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Hapus
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // ==================== Delete Confirmation Modal ====================
  private renderDeleteModal(): React.ReactNode {
    const { state, handlers } = this.getControllerState();
    const { showDeleteConfirm, isDeleting, form } = state;

    if (!showDeleteConfirm) return null;

    return (
      <div
        className="becModalOverlay"
        onClick={() => {
          const controller = this.props.controller;
          controller.setState((prev) => ({
            ...prev,
            showDeleteConfirm: false,
          }));
        }}
      >
        <div
          className="becModal"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="becModalTitle">Hapus Bouquet?</h3>
          <p className="becModalText">
            Apakah Anda yakin ingin menghapus "{form.name}"? Tindakan ini tidak
            dapat dibatalkan.
          </p>
          <div className="becModalActions">
            <button
              type="button"
              className="becModalBtn becModalBtn--cancel"
              onClick={() => {
                const controller = this.props.controller;
                controller.setState((prev) => ({
                  ...prev,
                  showDeleteConfirm: false,
                }));
              }}
              disabled={isDeleting}
            >
              Batal
            </button>
            <button
              type="button"
              className="becModalBtn becModalBtn--danger"
              onClick={handlers.handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== Image Section ====================
  private renderImageSection(): React.ReactNode {
    const { state, getters } = this.getControllerState();
    const { previewUrl } = getters;
    const { imageDimensions, isImageLoading } = state;

    return (
      <div className="becImage">
        {isImageLoading ? (
          <div className="becImage__loading" aria-label="Memuat gambar">
            <div className="becSpinner"></div>
            <span>Memproses gambar...</span>
          </div>
        ) : previewUrl ? (
          <img
            src={previewUrl}
            alt={state.form.name || "Bouquet"}
            loading="lazy"
            onLoad={(e) => {
              const img = e.currentTarget;
              if (
                img.naturalWidth &&
                img.naturalHeight &&
                !imageDimensions
              ) {
                const controller = this.props.controller;
                controller.setState((prev) => ({
                  ...prev,
                  imageDimensions: {
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                  },
                }));
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
    );
  }

  // ==================== Alerts Section ====================
  private renderAlerts(): React.ReactNode {
    const { state, getters } = this.getControllerState();
    const {
      saveStatus,
      saveMessage,
      touchedFields,
    } = state;
    const { validationError } = getters;

    return (
      <>
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
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ flexShrink: 0 }}
              aria-hidden="true"
            >
              <path
                d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
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
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ flexShrink: 0 }}
              aria-hidden="true"
            >
              <path
                d="M20 6L9 17l-5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
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
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ flexShrink: 0 }}
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
            <span>{saveMessage}</span>
          </div>
        )}
      </>
    );
  }

  // ==================== Form Fields ====================
  // Performance: Memoize collection names with caching
  private collectionNamesCache: string[] | null = null;
  private lastCollectionsHash: string = "";

  private getCollectionNames = (collections: string[]): string[] => {
    const hash = collections.join(",");
    if (this.collectionNamesCache && this.lastCollectionsHash === hash) {
      return this.collectionNamesCache;
    }
    this.collectionNamesCache = collections;
    this.lastCollectionsHash = hash;
    return collections;
  };

  // Performance: Memoize merged collection options
  private mergedCollectionOptionsCache: string[] | null = null;
  private lastMergedOptionsHash: string = "";

  private getMergedCollectionOptions(
    collectionOptions: string[],
    collections: string[]
  ): string[] {
    const hash = `${collectionOptions.join(",")}-${collections.join(",")}`;
    if (this.mergedCollectionOptionsCache && this.lastMergedOptionsHash === hash) {
      return this.mergedCollectionOptionsCache;
    }
    
    // Performance: Use Set for deduplication (O(n) instead of O(n²))
    const allOptions = new Set<string>();
    for (const opt of collectionOptions) {
      allOptions.add(opt);
    }
    for (const col of collections) {
      allOptions.add(col);
    }
    
    const result = Array.from(allOptions);
    this.mergedCollectionOptionsCache = result;
    this.lastMergedOptionsHash = hash;
    return result;
  }

  private renderFormFields(): React.ReactNode {
    const { state, handlers } = this.getControllerState();
    const {
      form,
      fieldErrors,
      touchedFields,
      saving,
      collectionOptions,
      typeOptions,
      occasionOptions,
      flowerOptions,
    } = state;
    const { collections } = this.props.controller.props;
    
    // Performance: Use memoized merged collection options
    const allCollectionOptions = this.getMergedCollectionOptions(
      collectionOptions,
      this.getCollectionNames(collections)
    );

    return (
      <div className="becGrid">
        {/* Name Field */}
        <FormField
          label="Nama"
          error={
            touchedFields.has("name") && fieldErrors.name
              ? fieldErrors.name
              : undefined
          }
          htmlFor="bec-name"
        >
          <TextInput
            id="bec-name"
            name="name"
            value={form.name}
            onChange={handlers.handleTextChange}
            placeholder="Nama bouquet"
            autoComplete="off"
            maxLength={100}
            ariaInvalid={
              touchedFields.has("name") && fieldErrors.name ? "true" : "false"
            }
            ariaDescribedBy={
              touchedFields.has("name") && fieldErrors.name
                ? "bec-name-error"
                : undefined
            }
            showCharacterCount
          />
        </FormField>

        {/* Price Field */}
        <FormField
          label="Harga (IDR)"
          error={
            touchedFields.has("price") && fieldErrors.price
              ? fieldErrors.price
              : undefined
          }
          htmlFor="bec-price"
        >
          <PriceInput
            id="bec-price"
            name="price"
            value={form.price}
            onChange={handlers.handleTextChange}
            min={0}
            step={1000}
            ariaInvalid={
              touchedFields.has("price") && fieldErrors.price ? "true" : "false"
            }
            ariaDescribedBy={
              touchedFields.has("price") && fieldErrors.price
                ? "bec-price-error"
                : undefined
            }
            showPreview
          />
        </FormField>

        {/* Type Field */}
        <DropdownWithModal
          label="Tipe"
          value={form.type}
          options={typeOptions}
          onChange={(value) => {
            this.props.controller.setState((prev) => ({
              form: { ...prev.form, type: value } as typeof prev.form,
              touchedFields: new Set([...prev.touchedFields, "type"]),
            }));
          }}
          onAddNew={() => {}}
          placeholder="mis., bouquet"
          disabled={saving}
          error={
            touchedFields.has("type") && fieldErrors.type
              ? fieldErrors.type
              : undefined
          }
          storageKey="uploader_types"
        />

        {/* Size Field */}
        <DropdownWithModal
          label="Ukuran"
          value={form.size}
          options={BOUQUET_SIZE_OPTIONS.map((s) => s.value)}
          onChange={(value) => {
            const error = validateField("size", value);
            this.props.controller.setState((prev) => {
              const newErrors = { ...prev.fieldErrors };
              if (error) {
                newErrors.size = error;
              } else {
                delete newErrors.size;
              }
              return {
                form: { ...prev.form, size: value as BouquetSize } as typeof prev.form,
                touchedFields: new Set([...prev.touchedFields, "size"]),
                fieldErrors: newErrors,
              };
            });
          }}
          onAddNew={() => {}}
          placeholder="Pilih ukuran"
          disabled={saving}
          error={
            touchedFields.has("size") && fieldErrors.size
              ? fieldErrors.size
              : undefined
          }
          storageKey="uploader_sizes"
        />

        {/* Status Field */}
        <StatusSelect
          label="Status"
          value={form.status}
          onChange={(value) => {
            this.props.controller.setState((prev) => ({
              form: { ...prev.form, status: value } as typeof prev.form,
              touchedFields: new Set([...prev.touchedFields, "status"]),
            }));
          }}
          disabled={saving}
          id="bec-status"
          name="status"
          error={
            touchedFields.has("status") && fieldErrors.status
              ? fieldErrors.status
              : undefined
          }
        />

        {/* Quantity Field */}
        <FormField
          label="Stok"
          error={
            touchedFields.has("quantity") && fieldErrors.quantity
              ? fieldErrors.quantity
              : undefined
          }
          htmlFor="bec-quantity"
        >
          <NumberInput
            id="bec-quantity"
            name="quantity"
            value={form.quantity}
            onChange={handlers.handleTextChange}
            placeholder="0"
            min={0}
            step={1}
            disabled={saving}
            ariaInvalid={
              touchedFields.has("quantity") && fieldErrors.quantity
                ? "true"
                : "false"
            }
            ariaDescribedBy={
              touchedFields.has("quantity") && fieldErrors.quantity
                ? "bec-quantity-error"
                : undefined
            }
          />
        </FormField>

        {/* Collection Field */}
        <DropdownWithModal
          label="Koleksi"
          value={form.collectionName}
          options={allCollectionOptions}
          onChange={(value) => {
            const error = validateField("collectionName", value);
            this.props.controller.setState((prev) => {
              const newErrors = { ...prev.fieldErrors };
              if (error) {
                newErrors.collectionName = error;
              } else {
                delete newErrors.collectionName;
              }
              return {
                form: { ...prev.form, collectionName: value } as typeof prev.form,
                touchedFields: new Set([...prev.touchedFields, "collectionName"]),
                fieldErrors: newErrors,
              };
            });
          }}
          onAddNew={() => {}}
          placeholder="mis., New Edition"
          disabled={saving}
          error={
            touchedFields.has("collectionName") && fieldErrors.collectionName
              ? fieldErrors.collectionName
              : undefined
          }
          storageKey="uploader_collections"
        />

        {/* Flags Section */}
        {this.renderFlagsSection()}

        {/* Custom Penanda Section */}
        {this.renderCustomPenandaSection()}

        {/* Description Field */}
        <FormField
          label="Deskripsi"
          error={
            touchedFields.has("description") && fieldErrors.description
              ? fieldErrors.description
              : undefined
          }
          htmlFor="bec-description"
          className="becField--full"
        >
          <TextareaInput
            id="bec-description"
            name="description"
            value={form.description}
            onChange={handlers.handleTextChange}
            rows={4}
            placeholder="Deskripsi singkat bouquet"
            maxLength={500}
            ariaInvalid={
              touchedFields.has("description") && fieldErrors.description
                ? "true"
                : "false"
            }
            ariaDescribedBy={
              touchedFields.has("description") && fieldErrors.description
                ? "bec-description-error"
                : undefined
            }
            showCharacterCount
          />
        </FormField>

        {/* Occasions Field */}
        <TagInput
          label="Acara"
          tags={form.occasions}
          onChange={(tags) => {
            const error = validateField("occasionsText", tags.join(", "));
            this.props.controller.setState((prev) => {
              const newErrors = { ...prev.fieldErrors };
              if (error) {
                newErrors.occasionsText = error;
              } else {
                delete newErrors.occasionsText;
              }
              return {
                form: {
                  ...prev.form,
                  occasions: tags,
                  occasionsText: tags.join(", "),
                } as typeof prev.form,
                touchedFields: new Set([...prev.touchedFields, "occasionsText"]),
                fieldErrors: newErrors,
              };
            });
          }}
          placeholder="mis., Ulang Tahun, Anniversary"
          disabled={saving}
          maxTags={10}
          maxLength={50}
          error={
            touchedFields.has("occasionsText") && fieldErrors.occasionsText
              ? fieldErrors.occasionsText
              : undefined
          }
          storageKey="uploader_occasions"
          suggestions={occasionOptions}
        />

        {/* Flowers Field */}
        <TagInput
          label="Bunga"
          tags={form.flowers}
          onChange={(tags) => {
            const error = validateField("flowersText", tags.join(", "));
            this.props.controller.setState((prev) => {
              const newErrors = { ...prev.fieldErrors };
              if (error) {
                newErrors.flowersText = error;
              } else {
                delete newErrors.flowersText;
              }
              return {
                form: {
                  ...prev.form,
                  flowers: tags,
                  flowersText: tags.join(", "),
                } as typeof prev.form,
                touchedFields: new Set([...prev.touchedFields, "flowersText"]),
                fieldErrors: newErrors,
              };
            });
          }}
          placeholder="mis., Orchid, Mawar"
          disabled={saving}
          maxTags={20}
          maxLength={50}
          error={
            touchedFields.has("flowersText") && fieldErrors.flowersText
              ? fieldErrors.flowersText
              : undefined
          }
          storageKey="uploader_flowers"
          suggestions={flowerOptions}
        />

        {/* Care Instructions Field */}
        <FormField
          label="Instruksi perawatan"
          error={
            touchedFields.has("careInstructions") && fieldErrors.careInstructions
              ? fieldErrors.careInstructions
              : undefined
          }
          htmlFor="bec-care"
          className="becField--full"
        >
          <TextareaInput
            id="bec-care"
            name="careInstructions"
            value={form.careInstructions}
            onChange={handlers.handleTextChange}
            rows={3}
            placeholder="Tips perawatan (opsional) untuk pelanggan"
            maxLength={300}
            ariaInvalid={
              touchedFields.has("careInstructions") &&
              fieldErrors.careInstructions
                ? "true"
                : "false"
            }
            ariaDescribedBy={
              touchedFields.has("careInstructions") &&
              fieldErrors.careInstructions
                ? "bec-care-error"
                : undefined
            }
            showCharacterCount
          />
        </FormField>

        {/* Image Upload Field */}
        {this.renderImageUploadSection()}
      </div>
    );
  }

  private renderFlagsSection(): React.ReactNode {
    const { state } = this.getControllerState();
    const { form, saving } = state;

    const toggleOptions: ToggleOption[] = [
      {
        name: "isNewEdition",
        label: "Edisi baru",
        checked: form.isNewEdition,
        disabled: saving,
        "aria-label": "Tandai sebagai edisi baru",
      },
      {
        name: "isFeatured",
        label: "Unggulan",
        checked: form.isFeatured,
        disabled: saving,
        "aria-label": "Tandai sebagai unggulan",
      },
    ];

    return (
      <div className="becField becField--full">
        <ToggleGroup
          label="Penanda"
          options={toggleOptions}
          onChange={(name, checked) => {
            this.props.controller.setState((prev) => ({
              form: { ...prev.form, [name]: checked } as typeof prev.form,
            }));
          }}
          disabled={saving}
          className="becToggles"
          aria-label="Penanda bouquet"
        />
      </div>
    );
  }

  private renderCustomPenandaSection(): React.ReactNode {
    const { state, handlers } = this.getControllerState();
    const { form } = state;

    return (
      <div className="becField becField--full becCustomPenanda">
        <span className="becLabel">
          Custom Penanda
          {form.customPenanda.length > 0 && (
            <span className="becPenandaCount">
              ({form.customPenanda.length}/10)
            </span>
          )}
        </span>
        {form.customPenanda.length > 0 && (
          <div className="becPenandaList">
            {form.customPenanda.map((penanda, index) => (
              <span
                key={`penanda-${index}-${penanda}`}
                className="becPenandaTag"
              >
                <span className="becPenandaTagText" title={penanda}>
                  {penanda}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    this.props.controller.setState((prev) => ({
                      form: {
                        ...prev.form,
                        customPenanda: prev.form.customPenanda.filter(
                          (_, i) => i !== index
                        ),
                      },
                    }));
                  }}
                  aria-label={`Hapus penanda ${penanda}`}
                  className="becPenandaDelete"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
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
              onChange={(e) =>
                this.props.controller.setState((prev) => ({
                  form: {
                    ...prev.form,
                    newPenandaInput: e.target.value,
                  },
                }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handlers.handleAddPenanda();
                }
              }}
              placeholder="Tambah penanda baru..."
              maxLength={30}
              disabled={form.customPenanda.length >= 10}
            />
            <span
              className={`becPenandaCharCount ${getCharacterCountClass(form.newPenandaInput.length, 30)}`}
            >
              {form.newPenandaInput.length}/30
            </span>
          </div>
          <button
            type="button"
            className="becAddPenandaBtn"
            onClick={handlers.handleAddPenanda}
            disabled={
              form.customPenanda.length >= 10 || !form.newPenandaInput.trim()
            }
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
    );
  }

  private renderImageUploadSection(): React.ReactNode {
    const { state, handlers, getters } = this.getControllerState();
    const {
      file,
      imageDimensions,
      isImageLoading,
      isDraggingImage,
    } = state;
    const { previewUrl } = getters;

    return (
      <div className="becField becField--full">
        <span className="becLabel">Gambar</span>
        <div
          className={`becDropzone ${isDraggingImage ? "is-dragging" : ""} ${isImageLoading ? "is-loading" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            this.props.controller.setState((prev) => ({
              ...prev,
              isDraggingImage: true,
            }));
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              this.props.controller.setState((prev) => ({
                ...prev,
                isDraggingImage: false,
              }));
            }
          }}
          onDrop={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.props.controller.setState((prev) => ({
              ...prev,
              isDraggingImage: false,
            }));
            const droppedFile = e.dataTransfer.files?.[0];
            if (droppedFile) {
              const syntheticEvent = {
                target: { files: [droppedFile] },
              } as unknown as React.ChangeEvent<HTMLInputElement>;
              await handlers.handleImageChange(syntheticEvent);
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
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Seret gambar ke sini atau klik untuk memilih</span>
              <span className="becHint">
                PNG/JPG/WEBP/HEIC didukung (maks. 8MB)
              </span>
            </>
          )}
          <input
            className="becFile"
            type="file"
            accept="image/*,.heic,.heif"
            onChange={handlers.handleImageChange}
            disabled={isImageLoading}
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              cursor: "pointer",
            }}
          />
        </div>
        {file && (
          <div className="becFileInfo">
            <span className="becHint">
              File: {file.name} ({formatBytes(file.size)})
              {imageDimensions &&
                ` • ${imageDimensions.width}×${imageDimensions.height}px`}
            </span>
            <button
              type="button"
              className="becGhost"
              onClick={handlers.resetImage}
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
              onClick={handlers.resetImage}
              disabled
              title="Tidak ada perubahan gambar"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    );
  }

  // ==================== Footer Section ====================
  private renderFooter(): React.ReactNode {
    const { state, handlers, getters } = this.getControllerState();
    const { saving, isImageLoading } = state;
    const { validationError } = getters;
    const { canSave, isDirty } = getters;
    
    const isDisabled = !canSave || !isDirty || saving || isImageLoading;

    return (
      <div className="becFooter">
        <button
          type="button"
          className="becSave"
          onClick={handlers.handleSave}
          disabled={isDisabled}
          title={
            saving
              ? "Menyimpan..."
              : isImageLoading
                ? "Menunggu gambar selesai diproses..."
                : validationError
                  ? validationError
                  : !isDirty
                    ? "Tidak ada perubahan"
                    : "Simpan perubahan (Ctrl+S)"
          }
          aria-busy={saving || isImageLoading}
          aria-label={
            saving
              ? "Menyimpan perubahan"
              : isImageLoading
                ? "Menunggu gambar selesai diproses"
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
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flexShrink: 0 }}
                aria-hidden="true"
              >
                <path
                  d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 21V13H7V21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 3V8H15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Simpan Perubahan</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // ==================== Main Render ====================
  render(): React.ReactNode {
    const { state } = this.getControllerState();
    const { form, saving, isImageLoading } = state;
    
    // Performance: Create render key for caching
    const renderKey = `${form._id}-${form.name}-${saving}-${isImageLoading}`;
    
    // Performance: Check cache first
    if (this.renderCache.has(renderKey) && this.lastRenderKey === renderKey) {
      return this.renderCache.get(renderKey)!;
    }
    
    // Enhanced: Early return optimization with better loading state
    if (!form._id) {
      const loadingRender = (
        <article className="becCard becCard--loading" aria-label="Loading bouquet">
          <div className="becBody">
            <div className="becLoadingState">
              <div className="becSpinner" aria-hidden="true"></div>
              <p className="becLoadingText">Memuat data bouquet...</p>
            </div>
          </div>
        </article>
      );
      this.renderCache.set(renderKey, loadingRender);
      this.lastRenderKey = renderKey;
      return loadingRender;
    }

    // Enhanced: Add error boundary for missing critical data
    if (!form.name && !form._id) {
      const errorRender = (
        <article className="becCard becCard--error" aria-label="Error loading bouquet">
          <div className="becBody">
            <div className="becAlert becAlert--error">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Gagal memuat data bouquet. Silakan refresh halaman.</span>
            </div>
          </div>
        </article>
      );
      this.renderCache.set(renderKey, errorRender);
      this.lastRenderKey = renderKey;
      return errorRender;
    }

    // Performance: Cache main render
    const mainRender = (
      <article 
        className="becCard" 
        aria-label={`Edit bouquet ${form.name || "tanpa nama"}`}
        aria-busy={saving || isImageLoading}
        data-saving={saving}
        data-loading={isImageLoading}
      >
        {this.renderHeader()}
        {this.renderDeleteModal()}
        {this.renderImageSection()}
        <div className="becBody">
          {this.renderAlerts()}
          {this.renderFormFields()}
          {this.renderFooter()}
        </div>
      </article>
    );
    
    // Performance: Cache and return
    this.renderCache.set(renderKey, mainRender);
    // Performance: Limit cache size to prevent memory leaks
    if (this.renderCache.size > 5) {
      const firstKey = this.renderCache.keys().next().value;
      this.renderCache.delete(firstKey);
    }
    this.lastRenderKey = renderKey;
    return mainRender;
  }
}

export default BouquetEditorView;

