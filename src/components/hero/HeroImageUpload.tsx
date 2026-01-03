/**
 * Hero Image Upload Component
 * Luxury, elegant, reusable component for hero slide image upload
 * Follows OOP, SOLID, DRY principles
 * Fully responsive on all devices
 */

import React, { Component } from "react";
import "../../styles/hero/HeroImageUpload.css";
import AlertMessage from "../common/AlertMessage";

export interface HeroImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  onFileUpload: (file: File) => Promise<void>;
  uploading?: boolean;
  uploadProgress?: number;
  uploadError?: string;
  disabled?: boolean;
  id?: string;
  label?: string;
  required?: boolean;
  className?: string;
  previewUrl?: string;
  onPreviewClick?: () => void;
}

interface HeroImageUploadState {
  isDragging: boolean;
  isFocused: boolean;
}

/**
 * Hero Image Upload Component
 * Class-based component following Single Responsibility Principle
 */
class HeroImageUpload extends Component<HeroImageUploadProps, HeroImageUploadState> {
  private fileInputRef = React.createRef<HTMLInputElement>();
  private dragCounter = 0;

  constructor(props: HeroImageUploadProps) {
    super(props);
    this.state = {
      isDragging: false,
      isFocused: false,
    };
  }

  private handleFileSelect = async (file: File | null): Promise<void> => {
    if (!file || this.props.disabled || this.props.uploading) return;

    try {
      await this.props.onFileUpload(file);
    } catch (error) {
      // Error handling is done in parent component
      console.error("Upload error:", error);
    }
  };

  private handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      void this.handleFileSelect(file);
    }
    // Reset input to allow same file selection
    if (this.fileInputRef.current) {
      this.fileInputRef.current.value = "";
    }
  };

  private handleDragEnter = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    this.dragCounter++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      this.setState({ isDragging: true });
    }
  };

  private handleDragLeave = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    this.dragCounter--;
    if (this.dragCounter === 0) {
      this.setState({ isDragging: false });
    }
  };

  private handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  private handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    this.dragCounter = 0;
    this.setState({ isDragging: false });

    if (this.props.disabled || this.props.uploading) return;

    const file = e.dataTransfer.files?.[0] ?? null;
    if (file) {
      void this.handleFileSelect(file);
    }
  };

  private handleClick = (): void => {
    if (!this.props.disabled && !this.props.uploading) {
      this.fileInputRef.current?.click();
    }
  };

  private handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.handleClick();
    }
  };

  private handleFocus = (): void => {
    this.setState({ isFocused: true });
  };

  private handleBlur = (): void => {
    this.setState({ isFocused: false });
  };

  private getClasses(): string {
    const { isDragging, isFocused } = this.state;
    const { uploading, disabled, className = "" } = this.props;
    const baseClass = "heroImageUpload";
    const classes = [baseClass];

    if (isDragging) classes.push(`${baseClass}--dragging`);
    if (isFocused) classes.push(`${baseClass}--focused`);
    if (uploading) classes.push(`${baseClass}--uploading`);
    if (disabled) classes.push(`${baseClass}--disabled`);
    if (className) classes.push(className);

    return classes.join(" ");
  }

  render(): React.ReactNode {
    const {
      value,
      uploading = false,
      uploadProgress = 0,
      uploadError,
      disabled = false,
      id = "hero-image-upload",
      label = "Gambar",
      required = false,
      previewUrl,
      onPreviewClick,
    } = this.props;
    const { isDragging } = this.state;

    return (
      <div className={this.getClasses()}>
        {label && (
          <label htmlFor={id} className="heroImageUpload__label">
            {label}
            {required && <span className="heroImageUpload__required">*</span>}
          </label>
        )}

        {/* File Upload Dropzone */}
        <div
          className="heroImageUpload__dropzone"
          onClick={this.handleClick}
          onDragEnter={this.handleDragEnter}
          onDragOver={this.handleDragOver}
          onDragLeave={this.handleDragLeave}
          onDrop={this.handleDrop}
          onKeyDown={this.handleKeyDown}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          role="button"
          tabIndex={disabled || uploading ? -1 : 0}
          aria-label="Unggah gambar hero slide"
          aria-disabled={disabled || uploading}
        >
          {uploading ? (
            <div className="heroImageUpload__uploading">
              <div className="heroImageUpload__spinner" aria-hidden="true" />
              <div className="heroImageUpload__progress">
                <div
                  className="heroImageUpload__progressBar"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="heroImageUpload__progressText">
                Mengunggah... {uploadProgress}%
              </span>
            </div>
          ) : (
            <>
              <div className="heroImageUpload__icon">
                <svg
                  width="48"
                  height="48"
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
              </div>
              <div className="heroImageUpload__text">
                <span className="heroImageUpload__title">
                  {isDragging ? "Lepaskan untuk mengunggah" : "Klik atau seret gambar ke sini"}
                </span>
                <span className="heroImageUpload__subtitle">
                  PNG, JPG, WEBP, HEIC (maks. 5MB)
                </span>
              </div>
            </>
          )}

          <input
            ref={this.fileInputRef}
            type="file"
            id={id}
            accept="image/*,.heic,.heif"
            onChange={this.handleInputChange}
            disabled={disabled || uploading}
            className="heroImageUpload__input"
            aria-label="Pilih file gambar"
            tabIndex={-1}
          />
        </div>

        {/* URL/Path Input Alternative */}
        <div className="heroImageUpload__altSource">
          <label htmlFor={`${id}-url`} className="heroImageUpload__altLabel">
            Atau masukkan URL / path
          </label>
          <input
            type="text"
            id={`${id}-url`}
            value={value}
            onChange={(e) => this.props.onChange(e.target.value)}
            placeholder="/uploads/hero/xxx.jpg atau https://..."
            disabled={disabled || uploading}
            className="heroImageUpload__urlInput"
          />
        </div>

        {/* Upload Error */}
        {uploadError && (
          <AlertMessage
            variant="error"
            message={uploadError}
            className="heroImageUpload__error"
          />
        )}

        {/* Image Preview */}
        {(previewUrl || value) && !uploading && (
          <div className="heroImageUpload__preview">
            <div className="heroImageUpload__previewLabel">Pratinjau</div>
            <div
              className="heroImageUpload__previewWrapper"
              onClick={onPreviewClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onPreviewClick?.();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Klik untuk memperbesar gambar"
            >
              <img
                src={previewUrl || value}
                alt="Pratinjau hero slide"
                className="heroImageUpload__previewImage"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/placeholder-bouquet.jpg";
                }}
              />
              <div className="heroImageUpload__previewOverlay">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M21 21l-4.35-4.35"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M11 8v6M8 11h6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span>Klik untuk memperbesar</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default HeroImageUpload;

