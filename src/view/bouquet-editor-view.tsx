// src/view/bouquet-editor-view.tsx
// View component for bouquet editor
// Follows OOP and SOLID principles - only handles presentation

import React, { Component } from "react";
import "../styles/BouquetCardEditComponent.css";
import type { BouquetEditorController } from "../controllers/bouquet-editor-controller";
import {
  formatPrice,
  formatPricePreview,
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
import { validateField } from "../models/bouquet-editor-model";

interface Props {
  controller: BouquetEditorController;
}

/**
 * View Component for Bouquet Editor
 * Handles only presentation logic - follows Single Responsibility Principle
 */
class BouquetEditorView extends Component<Props> {
  private getControllerState() {
    return this.props.controller.getControllerState();
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
    const { imageDimensions } = state;

    return (
      <div className="becImage">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={state.form.name}
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
  private renderFormFields(): React.ReactNode {
    const { state, handlers, refs } = this.getControllerState();
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
          <input
            ref={refs.nameInputRef}
            id="bec-name"
            name="name"
            value={form.name}
            onChange={handlers.handleTextChange}
            placeholder="Nama bouquet"
            autoComplete="off"
            aria-invalid={
              touchedFields.has("name") && fieldErrors.name ? "true" : "false"
            }
            aria-describedby={
              touchedFields.has("name") && fieldErrors.name
                ? "bec-name-error"
                : undefined
            }
          />
          <span
            className={`becHint ${getCharacterCountClass(form.name.length, 100)}`}
          >
            {form.name.length}/100
          </span>
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
          <input
            id="bec-price"
            name="price"
            type="number"
            min={0}
            step={1000}
            value={form.price || ""}
            onChange={handlers.handleTextChange}
            aria-invalid={
              touchedFields.has("price") && fieldErrors.price ? "true" : "false"
            }
            aria-describedby={
              touchedFields.has("price") && fieldErrors.price
                ? "bec-price-error"
                : undefined
            }
          />
          {form.price > 0 && (
            <span
              className="becHint"
              style={{ color: "var(--brand-rose-500)", fontWeight: 700 }}
            >
              {formatPricePreview(form.price)}
            </span>
          )}
        </FormField>

        {/* Quantity Field */}
        {this.renderQuantityField()}

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
        <FormField label="Status" htmlFor="bec-status">
          <select
            id="bec-status"
            name="status"
            value={form.status}
            onChange={handlers.handleSelectChange}
          >
            <option value="ready">Siap</option>
            <option value="preorder">Preorder</option>
          </select>
        </FormField>

        {/* Collection Field */}
        <DropdownWithModal
          label="Koleksi"
          value={form.collectionName}
          options={[
            ...collectionOptions,
            ...collections.filter((c) => !collectionOptions.includes(c)),
          ]}
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
          <textarea
            id="bec-description"
            name="description"
            value={form.description}
            onChange={handlers.handleTextChange}
            rows={3}
            placeholder="Deskripsi singkat bouquet"
            aria-invalid={
              touchedFields.has("description") && fieldErrors.description
                ? "true"
                : "false"
            }
            aria-describedby={
              touchedFields.has("description") && fieldErrors.description
                ? "bec-description-error"
                : undefined
            }
          />
          <span
            className={`becHint ${getCharacterCountClass(form.description.length, 500)}`}
          >
            {form.description.length}/500
          </span>
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
          <textarea
            id="bec-care"
            name="careInstructions"
            value={form.careInstructions}
            onChange={handlers.handleTextChange}
            rows={3}
            placeholder="Tips perawatan (opsional) untuk pelanggan"
            aria-invalid={
              touchedFields.has("careInstructions") &&
              fieldErrors.careInstructions
                ? "true"
                : "false"
            }
            aria-describedby={
              touchedFields.has("careInstructions") &&
              fieldErrors.careInstructions
                ? "bec-care-error"
                : undefined
            }
          />
          <span
            className={`becHint ${getCharacterCountClass(form.careInstructions.length, 300)}`}
          >
            {form.careInstructions.length}/300
          </span>
        </FormField>

        {/* Image Upload Field */}
        {this.renderImageUploadSection()}
      </div>
    );
  }

  private renderQuantityField(): React.ReactNode {
    const { state, handlers } = this.getControllerState();
    const { form, fieldErrors, touchedFields, saving, stockLevelOptions } =
      state;

    return (
      <FormField
        label="Stok"
        error={
          touchedFields.has("quantity") && fieldErrors.quantity
            ? fieldErrors.quantity
            : undefined
        }
        htmlFor="bec-quantity"
      >
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <DropdownWithModal
              label=""
              value={form.quantity > 0 ? String(form.quantity) : ""}
              options={stockLevelOptions}
              onChange={(value) => {
                const num = parseInt(value, 10);
                if (!isNaN(num) && num >= 0) {
                  const error = validateField("quantity", num);
                  this.props.controller.setState((prev) => {
                    const newErrors = { ...prev.fieldErrors };
                    if (error) {
                      newErrors.quantity = error;
                    } else {
                      delete newErrors.quantity;
                    }
                    return {
                      form: { ...prev.form, quantity: num } as typeof prev.form,
                      touchedFields: new Set([...prev.touchedFields, "quantity"]),
                      fieldErrors: newErrors,
                    };
                  });
                }
              }}
              onAddNew={() => {}}
              placeholder="Pilih atau masukkan"
              disabled={saving}
              error={
                touchedFields.has("quantity") && fieldErrors.quantity
                  ? fieldErrors.quantity
                  : undefined
              }
              storageKey="uploader_stock_levels"
            />
          </div>
          <span
            style={{
              alignSelf: "center",
              color: "var(--ink-500)",
              fontSize: "0.85rem",
              fontWeight: 700,
            }}
          >
            atau
          </span>
          <input
            id="bec-quantity"
            name="quantity"
            type="number"
            min={0}
            step={1}
            value={form.quantity || ""}
            onChange={handlers.handleTextChange}
            placeholder="Manual"
            style={{ width: "120px" }}
            aria-invalid={
              touchedFields.has("quantity") && fieldErrors.quantity
                ? "true"
                : "false"
            }
            aria-describedby={
              touchedFields.has("quantity") && fieldErrors.quantity
                ? "bec-quantity-error"
                : undefined
            }
          />
        </div>
      </FormField>
    );
  }

  private renderFlagsSection(): React.ReactNode {
    const { state, handlers } = this.getControllerState();
    const { form } = state;

    return (
      <div className="becField becField--full">
        <span className="becLabel">Penanda</span>
        <div className="becToggles" role="group" aria-label="Penanda bouquet">
          <label className="becToggle">
            <input
              type="checkbox"
              name="isNewEdition"
              checked={form.isNewEdition}
              onChange={handlers.handleToggleChange}
            />
            <span>Edisi baru</span>
          </label>

          <label className="becToggle">
            <input
              type="checkbox"
              name="isFeatured"
              checked={form.isFeatured}
              onChange={handlers.handleToggleChange}
            />
            <span>Unggulan</span>
          </label>
        </div>
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
    const { saving } = state;
    const { validationError } = getters;
    const { canSave, isDirty } = getters;

    return (
      <div className="becFooter">
        <button
          type="button"
          className="becSave"
          onClick={handlers.handleSave}
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
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flexShrink: 0 }}
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
    const { form } = state;

    return (
      <article className="becCard" aria-label={`Edit bouquet ${form.name}`}>
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
  }
}

export default BouquetEditorView;

