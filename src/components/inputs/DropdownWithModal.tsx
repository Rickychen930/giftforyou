/**
 * Dropdown With Modal Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component, RefObject } from "react";
import "../../styles/DropdownWithModal.css";

interface DropdownWithModalProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  onAddNew: (newValue: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  maxLength?: number;
  storageKey?: string; // For persisting custom options
  allowAddNew?: boolean; // Allow adding new options via modal
}

interface DropdownWithModalState {
  isOpen: boolean;
  showModal: boolean;
  newValue: string;
  customOptions: string[];
}

/**
 * Dropdown With Modal Component
 * Class-based component for dropdown with add new option modal
 */
class DropdownWithModal extends Component<DropdownWithModalProps, DropdownWithModalState> {
  private baseClass: string = "dropdownWithModal";
  private dropdownRef: RefObject<HTMLDivElement>;
  private modalRef: RefObject<HTMLDivElement>;
  private inputRef: RefObject<HTMLInputElement>;

  constructor(props: DropdownWithModalProps) {
    super(props);
    this.state = {
      isOpen: false,
      showModal: false,
      newValue: "",
      customOptions: [],
    };
    this.dropdownRef = React.createRef();
    this.modalRef = React.createRef();
    this.inputRef = React.createRef();
  }

  componentDidMount(): void {
    this.loadCustomOptions();
  }

  componentDidUpdate(prevProps: DropdownWithModalProps, prevState: DropdownWithModalState): void {
    if (this.state.showModal && !prevState.showModal && this.inputRef.current) {
      this.inputRef.current.focus();
    }

    if (this.state.isOpen || this.state.showModal) {
      document.addEventListener("mousedown", this.handleClickOutside);
    } else {
      document.removeEventListener("mousedown", this.handleClickOutside);
    }
  }

  componentWillUnmount(): void {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  private loadCustomOptions = (): void => {
    const { storageKey } = this.props;
    if (!storageKey) return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.setState({ customOptions: parsed });
        }
      }
    } catch (err) {
      console.error("Error loading custom options:", err);
    }
  };

  private saveCustomOptions = (newOptions: string[]): void => {
    const { storageKey } = this.props;
    if (!storageKey) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(newOptions));
    } catch (err) {
      console.error("Error saving custom options:", err);
    }
  };

  private handleClickOutside = (event: MouseEvent): void => {
    if (
      this.dropdownRef.current &&
      !this.dropdownRef.current.contains(event.target as Node)
    ) {
      this.setState({ isOpen: false });
    }
    if (
      this.modalRef.current &&
      !this.modalRef.current.contains(event.target as Node) &&
      this.state.showModal
    ) {
      this.setState({ showModal: false, newValue: "" });
    }
  };

  private handleSelect = (option: string): void => {
    this.props.onChange(option);
    this.setState({ isOpen: false });
  };

  private handleAddNewClick = (): void => {
    this.setState({ showModal: true, isOpen: false });
  };

  private handleModalSubmit = (): void => {
    const { maxLength = 100, onChange, onAddNew, options } = this.props;
    const { newValue, customOptions } = this.state;
    const trimmed = newValue.trim();

    if (!trimmed) return;

    if (trimmed.length > maxLength) {
      alert(`Maksimal ${maxLength} karakter.`);
      return;
    }

    const allOptions = [...options, ...customOptions];
    if (allOptions.includes(trimmed)) {
      alert("Opsi ini sudah ada.");
      return;
    }

    // Add to custom options
    const updated = [...customOptions, trimmed];
    this.setState({ customOptions: updated });
    this.saveCustomOptions(updated);

    // Set as selected value
    onChange(trimmed);
    this.setState({ showModal: false, newValue: "" });
    onAddNew(trimmed);
  };

  private handleModalCancel = (): void => {
    this.setState({ showModal: false, newValue: "" });
  };

  private handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "Escape") {
      if (this.state.showModal) {
        this.handleModalCancel();
      } else {
        this.setState({ isOpen: false });
      }
    } else if (e.key === "Enter" && this.state.showModal) {
      e.preventDefault();
      this.handleModalSubmit();
    }
  };

  private handleNewValueChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ newValue: e.target.value });
  };

  private getAllOptions(): string[] {
    const { options } = this.props;
    const { customOptions } = this.state;
    return [...options, ...customOptions].filter((opt, index, self) => self.indexOf(opt) === index);
  }

  private renderModal(): React.ReactNode {
    const { label, maxLength = 100 } = this.props;
    const { showModal, newValue } = this.state;

    if (!showModal) return null;

    return (
      <div className={`${this.baseClass}__overlay`} aria-modal="true" role="dialog">
        <div
          className={`${this.baseClass}__modal`}
          ref={this.modalRef}
          onKeyDown={this.handleKeyDown}
        >
          <div className={`${this.baseClass}__modalHeader`}>
            <h3 className={`${this.baseClass}__modalTitle`}>Tambah {label} Baru</h3>
            <button
              type="button"
              className={`${this.baseClass}__modalClose`}
              onClick={this.handleModalCancel}
              aria-label="Tutup"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className={`${this.baseClass}__modalBody`}>
            <label className={`${this.baseClass}__modalLabel`}>
              <span>{label}</span>
              <input
                ref={this.inputRef}
                type="text"
                value={newValue}
                onChange={this.handleNewValueChange}
                placeholder={`Masukkan ${label.toLowerCase()} baru`}
                maxLength={maxLength}
                className={`${this.baseClass}__modalInput`}
              />
              <div className={`${this.baseClass}__modalHint`}>
                {newValue.length}/{maxLength} karakter
              </div>
            </label>
          </div>

          <div className={`${this.baseClass}__modalFooter`}>
            <button
              type="button"
              className={`${this.baseClass}__modalBtn ${this.baseClass}__modalBtn--cancel`}
              onClick={this.handleModalCancel}
            >
              Batal
            </button>
            <button
              type="button"
              className={`${this.baseClass}__modalBtn ${this.baseClass}__modalBtn--submit`}
              onClick={this.handleModalSubmit}
              disabled={!newValue.trim()}
            >
              Tambah
            </button>
          </div>
        </div>
      </div>
    );
  }

  render(): React.ReactNode {
    const {
      value,
      placeholder = "Pilih atau tambahkan baru...",
      disabled = false,
      error,
      allowAddNew = true,
    } = this.props;
    const { isOpen } = this.state;
    const allOptions = this.getAllOptions();

    return (
      <>
        <div className={this.baseClass} ref={this.dropdownRef}>
          <button
            type="button"
            className={`${this.baseClass}__trigger ${isOpen ? "is-open" : ""} ${error ? "has-error" : ""}`}
            onClick={() => !disabled && this.setState({ isOpen: !isOpen })}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <span className={`${this.baseClass}__value`}>
              {value || <span className={`${this.baseClass}__placeholder`}>{placeholder}</span>}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className={`${this.baseClass}__icon`}
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {isOpen && (
            <div className={`${this.baseClass}__menu`} role="listbox">
              {allOptions.length > 0 ? (
                <>
                  {allOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`${this.baseClass}__option ${value === option ? "is-selected" : ""}`}
                      onClick={() => this.handleSelect(option)}
                      role="option"
                      aria-selected={value === option}
                    >
                      {option}
                      {value === option && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path
                            d="M20 6L9 17l-5-5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                </>
              ) : (
                <div className={`${this.baseClass}__empty`}>Tidak ada opsi</div>
              )}
              {allowAddNew && (
                <button
                  type="button"
                  className={`${this.baseClass}__addNew`}
                  onClick={this.handleAddNewClick}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Tambah Baru
                </button>
              )}
            </div>
          )}

          {error && (
            <span className={`${this.baseClass}__error`} role="alert" aria-live="polite">
              {error}
            </span>
          )}
        </div>

        {this.renderModal()}
      </>
    );
  }
}

export default DropdownWithModal;

