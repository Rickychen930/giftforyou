// src/view/bouquet-uploader-view.tsx
// View component for bouquet uploader form
// Follows OOP and SOLID principles - only handles presentation

import React, { Component } from "react";
import "../../styles/DashboardUploaderSection.css";
import type { BouquetUploaderController } from "../controllers/bouquet-uploader-controller";
import {
  formatBytes,
  formatPricePreview,
  getCharacterCountClass,
  validateField,
} from "../models/bouquet-uploader-model";
import DropdownWithModal from "../components/inputs/DropdownWithModal";
import TagInput from "../components/inputs/TagInput";
import FormField from "../components/inputs/FormField";

interface Props {
  controller: BouquetUploaderController;
}

/**
 * View Component for Bouquet Uploader
 * Handles only presentation logic - follows Single Responsibility Principle
 */
class BouquetUploaderView extends Component<Props> {
  private getControllerState() {
    return this.props.controller.getControllerState();
  }

  // ==================== Header Section ====================
  private renderHeader(): React.ReactNode {
    const { state, handlers } = this.getControllerState();
    const {
      hasDraft,
      isSavingDraft,
      showValidationSummary,
      fieldErrors,
    } = state;

    const errorCount = Object.keys(fieldErrors).length;
    const hasErrors = errorCount > 0;

    return (
      <header className="uploader__header">
        <div className="uploader__headerTop">
          <div>
            <h2 className="uploader__title">Unggah Bouquet Baru</h2>
            <p className="uploader__subtitle">
              Tambahkan produk baru ke katalog toko. Kolom bertanda{" "}
              <span className="uploader__required">*</span> wajib diisi.
            </p>
          </div>
          <div className="uploader__headerActions">
            {hasDraft && (
              <button
                type="button"
                className="uploader__draftBtn"
                onClick={handlers.loadDraft}
                title="Muat draft tersimpan"
                aria-label="Muat draft tersimpan"
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
                    d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4M7 10l5 5 5-5M12 15V3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
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
          <div
            className="uploader__validationSummary"
            role="alert"
            aria-live="polite"
          >
            <strong>
              Perbaiki {errorCount}{" "}
              {errorCount === 1 ? "kesalahan" : "kesalahan"} sebelum mengunggah:
            </strong>
            <ul>
              {Object.entries(fieldErrors).map(([field, error]) => (
                <li key={field}>
                  <button
                    type="button"
                    onClick={() => {
                      const { refs } = this.getControllerState();
                      if (field === "customPenanda") {
                        const penandaSection = refs.formRef.current?.querySelector(
                          ".uploader__customPenanda"
                        ) as HTMLElement;
                        if (penandaSection) {
                          penandaSection.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                          const input = penandaSection.querySelector(
                            ".uploader__penandaInput"
                          ) as HTMLElement;
                          input?.focus();
                        }
                      } else {
                        const fieldEl = refs.formRef.current?.querySelector(
                          `[name="${field}"]`
                        ) as HTMLElement;
                        if (fieldEl) {
                          fieldEl.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
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
    );
  }

  // ==================== Form Fields ====================
  private renderFormFields(): React.ReactNode {
    const { state, handlers } = this.getControllerState();
    const {
      name,
      description,
      price,
      type,
      size,
      status,
      collectionName,
      quantity,
      occasions,
      flowers,
      isNewEdition,
      isFeatured,
      customPenanda,
      newPenandaInput,
      careInstructions,
      fieldErrors,
      touchedFields,
      submitting,
      collectionOptions,
      typeOptions,
      occasionOptions,
      flowerOptions,
      stockLevelOptions,
      sizeOptions,
    } = state;

    return (
      <div className="uploader__grid">
        {/* Name Field */}
        <FormField
          label="Nama"
          error={
            touchedFields.has("name") && fieldErrors.name
              ? fieldErrors.name
              : undefined
          }
          htmlFor="uploader-name"
        >
          <input
            id="uploader-name"
            name="name"
            value={name}
            onChange={handlers.handleTextChange}
            placeholder="mis., Orchid Elegance"
            disabled={submitting}
            required
            aria-required="true"
            aria-invalid={
              touchedFields.has("name") && fieldErrors.name ? "true" : "false"
            }
            aria-describedby={
              touchedFields.has("name") && fieldErrors.name
                ? "name-error"
                : undefined
            }
            maxLength={100}
          />
          <span
            className={`uploader__fieldHint ${getCharacterCountClass(name.length, 100)}`}
          >
            {name.length}/100
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
          htmlFor="uploader-price"
        >
          <div className="uploader__priceInputWrapper">
            <input
              id="uploader-price"
              name="price"
              type="number"
              value={price || ""}
              onChange={handlers.handleTextChange}
              placeholder="0"
              disabled={submitting}
              required
              min={0}
              step="any"
              aria-required="true"
              aria-invalid={
                touchedFields.has("price") && fieldErrors.price
                  ? "true"
                  : "false"
              }
              aria-describedby={
                touchedFields.has("price") && fieldErrors.price
                  ? "price-error"
                  : undefined
              }
              className="uploader__priceInput"
            />
          </div>
          {price > 0 && (
            <span
              className="uploader__fieldHint"
              style={{ color: "var(--brand-rose-500)", fontWeight: 700 }}
            >
              {formatPricePreview(price)}
            </span>
          )}
        </FormField>

        {/* Status Field */}
        <FormField label="Status" htmlFor="uploader-status">
          <DropdownWithModal
            label="Status"
            value={status === "ready" ? "Siap" : "Preorder"}
            options={["Siap", "Preorder"]}
            onChange={(value) => {
              const statusValue = value === "Siap" ? "ready" : "preorder";
              handlers.handleSelectChange("status", statusValue);
            }}
            onAddNew={() => {}}
            placeholder="Pilih status..."
            disabled={submitting}
            storageKey=""
            allowAddNew={false}
          />
        </FormField>

        {/* Collection Field */}
        <FormField
          label="Koleksi"
          error={
            touchedFields.has("collectionName") && fieldErrors.collectionName
              ? fieldErrors.collectionName
              : undefined
          }
          htmlFor="uploader-collection"
        >
          <DropdownWithModal
            label="Koleksi"
            value={collectionName}
            options={collectionOptions}
            onChange={(value) => {
              handlers.handleSelectChange("collectionName", value);
            }}
            onAddNew={() => {}}
            placeholder="Pilih atau tambahkan koleksi baru..."
            disabled={submitting}
            error={
              touchedFields.has("collectionName") && fieldErrors.collectionName
                ? fieldErrors.collectionName
                : undefined
            }
            maxLength={100}
            storageKey="uploader_collections"
          />
        </FormField>

        {/* Type Field */}
        <FormField label="Tipe" htmlFor="uploader-type">
          <DropdownWithModal
            label="Tipe"
            value={type}
            options={typeOptions}
            onChange={(value) => {
              handlers.handleSelectChange("type", value);
            }}
            onAddNew={() => {}}
            placeholder="Pilih atau tambahkan tipe baru..."
            disabled={submitting}
            storageKey="uploader_types"
          />
        </FormField>

        {/* Size Field */}
        <FormField
          label="Ukuran"
          error={
            touchedFields.has("size") && fieldErrors.size
              ? fieldErrors.size
              : undefined
          }
          htmlFor="uploader-size"
        >
          <DropdownWithModal
            label="Ukuran"
            value={size}
            options={sizeOptions}
            onChange={(value) => {
              handlers.handleSelectChange("size", value);
            }}
            onAddNew={(newValue) => {
              const controller = this.props.controller;
              controller.setState((prev) => ({
                ...prev,
                sizeOptions: [...prev.sizeOptions, newValue],
                size: newValue,
              }));
            }}
            placeholder="Pilih atau tambahkan ukuran baru..."
            disabled={submitting}
            error={
              touchedFields.has("size") && fieldErrors.size
                ? fieldErrors.size
                : undefined
            }
            maxLength={50}
            storageKey="uploader_sizes"
          />
        </FormField>

        {/* Quantity Field */}
        <FormField
          label="Stok"
          error={
            touchedFields.has("quantity") && fieldErrors.quantity
              ? fieldErrors.quantity
              : undefined
          }
          htmlFor="uploader-quantity"
        >
          <DropdownWithModal
            label="Stok"
            value={quantity > 0 ? String(quantity) : ""}
            options={stockLevelOptions}
            onChange={(value) => {
              const num = parseInt(value, 10);
              if (!isNaN(num) && num >= 0) {
                handlers.handleSelectChange("quantity", String(num));
              }
            }}
            onAddNew={(newValue) => {
              const num = parseInt(newValue, 10);
              if (!isNaN(num) && num >= 0) {
                handlers.handleSelectChange("quantity", String(num));
              }
            }}
            placeholder="Pilih jumlah stok..."
            disabled={submitting}
            error={
              touchedFields.has("quantity") && fieldErrors.quantity
                ? fieldErrors.quantity
                : undefined
            }
            storageKey="uploader_stock_levels"
          />
        </FormField>

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
          htmlFor="uploader-description"
          className="uploader__field--full"
        >
          <textarea
            id="uploader-description"
            name="description"
            value={description}
            onChange={handlers.handleTextChange}
            rows={4}
            placeholder="Deskripsi singkat..."
            disabled={submitting}
            maxLength={500}
            aria-invalid={
              touchedFields.has("description") && fieldErrors.description
                ? "true"
                : "false"
            }
            aria-describedby={
              touchedFields.has("description") && fieldErrors.description
                ? "description-error"
                : undefined
            }
          />
          <div
            className={`uploader__fieldHint ${getCharacterCountClass(description.length, 500)}`}
          >
            {description.length}/500 karakter
          </div>
        </FormField>

        {/* Occasions Field */}
        <FormField
          label="Acara"
          error={
            touchedFields.has("occasionsText") && fieldErrors.occasionsText
              ? fieldErrors.occasionsText
              : undefined
          }
          htmlFor="uploader-occasions"
          className="uploader__field--full"
        >
          <TagInput
            label="Acara"
            tags={occasions}
            onChange={(tags) => {
              const controller = this.props.controller;
              const error = validateField("occasionsText", tags.join(", "));
              controller.setState((prev) => {
                const newErrors = { ...prev.fieldErrors };
                if (error) {
                  newErrors.occasionsText = error;
                } else {
                  delete newErrors.occasionsText;
                }
                return {
                  ...prev,
                  occasions: tags,
                  occasionsText: tags.join(", "),
                  touchedFields: new Set([...prev.touchedFields, "occasionsText"]),
                  fieldErrors: newErrors,
                };
              });
            }}
            placeholder="Tambahkan acara..."
            disabled={submitting}
            maxTags={10}
            maxLength={50}
            error={
              touchedFields.has("occasionsText") && fieldErrors.occasionsText
                ? fieldErrors.occasionsText
                : undefined
            }
            storageKey="uploader_occasions"
          />
          <div className="uploader__fieldHint" style={{ marginTop: "0.5rem" }}>
            Klik "Tambah Baru" untuk menambahkan acara baru. Maksimal 10 acara.
          </div>
        </FormField>

        {/* Flowers Field */}
        <FormField
          label="Bunga"
          error={
            touchedFields.has("flowersText") && fieldErrors.flowersText
              ? fieldErrors.flowersText
              : undefined
          }
          htmlFor="uploader-flowers"
          className="uploader__field--full"
        >
          <TagInput
            label="Bunga"
            tags={flowers}
            onChange={(tags) => {
              const controller = this.props.controller;
              const error = validateField("flowersText", tags.join(", "));
              controller.setState((prev) => {
                const newErrors = { ...prev.fieldErrors };
                if (error) {
                  newErrors.flowersText = error;
                } else {
                  delete newErrors.flowersText;
                }
                return {
                  ...prev,
                  flowers: tags,
                  flowersText: tags.join(", "),
                  touchedFields: new Set([...prev.touchedFields, "flowersText"]),
                  fieldErrors: newErrors,
                };
              });
            }}
            placeholder="Tambahkan jenis bunga..."
            disabled={submitting}
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
          <div className="uploader__fieldHint" style={{ marginTop: "0.5rem" }}>
            Ketik dan tekan Enter/koma untuk menambahkan tag. Klik "Tambah Baru"
            untuk tag baru. Maksimal 20 jenis bunga.
          </div>
        </FormField>

        {/* Care Instructions Field */}
        <FormField
          label="Instruksi perawatan"
          error={
            touchedFields.has("careInstructions") &&
            fieldErrors.careInstructions
              ? fieldErrors.careInstructions
              : undefined
          }
          htmlFor="uploader-care"
          className="uploader__field--full"
        >
          <textarea
            id="uploader-care"
            name="careInstructions"
            value={careInstructions}
            onChange={handlers.handleTextChange}
            rows={3}
            placeholder="Tips perawatan (opsional)"
            disabled={submitting}
            maxLength={300}
            aria-invalid={
              touchedFields.has("careInstructions") &&
              fieldErrors.careInstructions
                ? "true"
                : "false"
            }
            aria-describedby={
              touchedFields.has("careInstructions") &&
              fieldErrors.careInstructions
                ? "careInstructions-error"
                : undefined
            }
          />
          <div
            className={`uploader__fieldHint ${getCharacterCountClass(careInstructions.length, 300)}`}
          >
            {careInstructions.length}/300 karakter
          </div>
        </FormField>

        {/* Image Upload Field */}
        {this.renderImageUploadSection()}
      </div>
    );
  }

  private renderFlagsSection(): React.ReactNode {
    const { state, handlers } = this.getControllerState();
    const { isNewEdition, isFeatured, submitting } = state;

    return (
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
              checked={isNewEdition}
              onChange={handlers.handleTextChange}
              disabled={submitting}
              aria-label="Edisi baru"
            />
            <span>Edisi baru</span>
          </label>

          <label className="uploader__toggle">
            <input
              type="checkbox"
              name="isFeatured"
              checked={isFeatured}
              onChange={handlers.handleTextChange}
              disabled={submitting}
              aria-label="Unggulan"
            />
            <span>Unggulan</span>
          </label>
        </div>
      </div>
    );
  }

  private renderCustomPenandaSection(): React.ReactNode {
    const { state, handlers } = this.getControllerState();
    const {
      customPenanda,
      newPenandaInput,
      submitting,
      fieldErrors,
      touchedFields,
    } = state;

    return (
      <div className="uploader__field uploader__field--full uploader__customPenanda">
        <span className="uploader__fieldLabel">
          Custom Penanda
          {customPenanda.length > 0 && (
            <span className="uploader__penandaCount">
              ({customPenanda.length}/10)
            </span>
          )}
        </span>
        {customPenanda.length > 0 && (
          <div className="uploader__customPenandaList">
            {customPenanda.map((penanda, index) => (
              <span
                key={`penanda-${index}-${penanda}`}
                className="uploader__penandaTag"
                role="button"
                tabIndex={0}
                aria-label={`Hapus penanda ${penanda}`}
                onClick={() => {
                  if (submitting) return;
                  const controller = this.props.controller;
                  controller.setState((prev) => ({
                    ...prev,
                    customPenanda: prev.customPenanda.filter((_, i) => i !== index),
                  }));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (!submitting) {
                      const controller = this.props.controller;
                      controller.setState((prev) => ({
                        ...prev,
                        customPenanda: prev.customPenanda.filter(
                          (_, i) => i !== index
                        ),
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

        {customPenanda.length < 10 && (
          <div className="uploader__addPenanda">
            <div className="uploader__penandaInputWrapper">
              <input
                type="text"
                className="uploader__penandaInput"
                value={newPenandaInput}
                onChange={(e) => {
                  const controller = this.props.controller;
                  controller.setState((prev) => ({
                    ...prev,
                    newPenandaInput: e.target.value,
                  }));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handlers.handleAddPenanda();
                  }
                }}
                placeholder="Tambah penanda baru..."
                disabled={submitting}
                maxLength={30}
                aria-label="Input penanda baru"
                aria-invalid={
                  touchedFields.has("customPenanda") && fieldErrors.customPenanda
                    ? "true"
                    : "false"
                }
                aria-describedby={
                  touchedFields.has("customPenanda") && fieldErrors.customPenanda
                    ? "customPenanda-error"
                    : undefined
                }
              />
              {newPenandaInput.length > 0 && (
                <div
                  className={`uploader__penandaCharCount ${getCharacterCountClass(newPenandaInput.length, 30)}`}
                >
                  {newPenandaInput.length}/30
                </div>
              )}
            </div>
            <button
              type="button"
              className="uploader__addPenandaBtn"
              onClick={handlers.handleAddPenanda}
              disabled={submitting || !newPenandaInput.trim()}
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

        {customPenanda.length >= 10 && (
          <div className="uploader__fieldHint uploader__fieldHint--warning">
            Maksimal 10 penanda kustom telah tercapai.
          </div>
        )}

        {touchedFields.has("customPenanda") && fieldErrors.customPenanda && (
          <span
            id="customPenanda-error"
            className="uploader__fieldError"
            role="alert"
            aria-live="polite"
          >
            {fieldErrors.customPenanda}
          </span>
        )}

        {customPenanda.length > 0 && (
          <div className="uploader__fieldHint">
            {customPenanda.length}/10 penanda
          </div>
        )}
      </div>
    );
  }

  private renderImageUploadSection(): React.ReactNode {
    const { state, handlers, refs } = this.getControllerState();
    const {
      file,
      previewUrl,
      isDraggingImage,
      isImageLoading,
      imageDimensions,
      submitting,
    } = state;

    return (
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
          onClick={handlers.openFilePicker}
          onKeyDown={handlers.handleDropzoneKeyDown}
          onDragOver={handlers.handleDropzoneDragOver}
          onDragLeave={handlers.handleDropzoneDragLeave}
          onDrop={handlers.handleDropzoneDrop}
        >
          <div className="uploader__dropzoneIcon">
            {isImageLoading ? (
              <span
                className="uploader__dropzoneSpinner"
                aria-hidden="true"
              ></span>
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
                  ? `${file.name} • ${formatBytes(file.size)}${imageDimensions ? ` • ${imageDimensions.width}×${imageDimensions.height}px` : ""}`
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
                  handlers.clearImage();
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
                  handlers.openFilePicker();
                }}
                disabled={submitting}
                aria-label="Pilih file"
              >
                Pilih file
              </button>
            ) : null}
          </div>

          <input
            ref={refs.fileInputRef}
            className="uploader__fileInput"
            type="file"
            accept="image/*,.heic,.heif"
            capture="environment"
            aria-label="Upload gambar bouquet"
            onChange={handlers.handleImageChange}
            disabled={submitting || isImageLoading}
            tabIndex={-1}
          />
        </div>
      </div>
    );
  }

  // ==================== Preview Section ====================
  private renderPreviewSection(): React.ReactNode {
    const { state } = this.getControllerState();
    const { previewUrl, isImageLoading, imageDimensions } = state;

    return (
      <aside
        className="uploader__col uploader__col--preview"
        aria-label="Pratinjau gambar"
      >
        <div className="uploader__preview">
          <p className="uploader__previewLabel">Pratinjau</p>
          {isImageLoading ? (
            <div className="uploader__previewLoading" aria-label="Memuat gambar">
              <span
                className="uploader__previewSpinner"
                aria-hidden="true"
              ></span>
              <p>Memuat preview...</p>
            </div>
          ) : previewUrl ? (
            <div className="uploader__previewWrapper">
              <img
                className="uploader__previewImg"
                src={previewUrl}
                alt="Pratinjau bouquet"
                onError={() => {
                  const { handlers } = this.getControllerState();
                  handlers.clearImage();
                }}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  const controller = this.props.controller;
                  if (img.naturalWidth && img.naturalHeight) {
                    controller.setState((prev) => ({
                      ...prev,
                      imageDimensions: {
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                      },
                    }));
                  }
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
    );
  }

  // ==================== Footer Section ====================
  private renderFooter(): React.ReactNode {
    const { state, handlers } = this.getControllerState();
    const { submitting, isImageLoading, hasDraft, message, messageType } = state;

    return (
      <div className="uploader__footer" aria-label="Aksi upload" role="group">
        <div className="uploader__footerActions">
          <button
            className="uploader__submit"
            type="submit"
            disabled={submitting || isImageLoading}
            aria-busy={submitting}
            type="submit"
          >
            {submitting ? (
              <>
                <span
                  className="uploader__submitSpinner"
                  aria-hidden="true"
                ></span>
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
                  handlers.clearDraft();
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
    );
  }

  // ==================== Main Render ====================
  render(): React.ReactNode {
    const { refs, handlers } = this.getControllerState();

    return (
      <section className="uploader" aria-label="Form unggah bouquet">
        {this.renderHeader()}
        <form
          ref={refs.formRef}
          className="uploader__form"
          onSubmit={handlers.handleSubmit}
          noValidate
        >
          <div className="uploader__layout">
            <div className="uploader__col uploader__col--form">
              {this.renderFormFields()}
            </div>
            {this.renderPreviewSection()}
          </div>
          {this.renderFooter()}
        </form>
      </section>
    );
  }
}

export default BouquetUploaderView;

