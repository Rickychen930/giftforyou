/**
 * Tag Input Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component, RefObject } from "react";
import "../../styles/TagInput.css";

interface TagInputProps {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxTags?: number;
  maxLength?: number;
  error?: string;
  storageKey?: string; // For persisting custom tags
  suggestions?: string[]; // Database-synced suggestions
}

interface TagInputState {
  inputValue: string;
  showAddModal: boolean;
  newTag: string;
  customTags: string[];
}

/**
 * Tag Input Component
 * Class-based component for tag input with modal
 */
class TagInput extends Component<TagInputProps, TagInputState> {
  private baseClass: string = "tagInput";
  private inputRef: RefObject<HTMLInputElement>;
  private modalRef: RefObject<HTMLDivElement>;

  constructor(props: TagInputProps) {
    super(props);
    this.state = {
      inputValue: "",
      showAddModal: false,
      newTag: "",
      customTags: [],
    };
    this.inputRef = React.createRef();
    this.modalRef = React.createRef();
  }

  componentDidMount(): void {
    this.loadCustomTags();
  }

  componentDidUpdate(prevProps: TagInputProps, prevState: TagInputState): void {
    if (this.state.showAddModal && !prevState.showAddModal) {
      document.addEventListener("mousedown", this.handleClickOutside);
    } else if (!this.state.showAddModal && prevState.showAddModal) {
      document.removeEventListener("mousedown", this.handleClickOutside);
    }
  }

  componentWillUnmount(): void {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  private loadCustomTags = (): void => {
    const { storageKey } = this.props;
    if (!storageKey) return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.setState({ customTags: parsed });
        }
      }
    } catch (err) {
      console.error("Error loading custom tags:", err);
    }
  };

  private saveCustomTags = (newTags: string[]): void => {
    const { storageKey } = this.props;
    if (!storageKey) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(newTags));
    } catch (err) {
      console.error("Error saving custom tags:", err);
    }
  };

  private handleClickOutside = (event: MouseEvent): void => {
    if (
      this.modalRef.current &&
      !this.modalRef.current.contains(event.target as Node) &&
      this.state.showAddModal
    ) {
      this.setState({ showAddModal: false, newTag: "" });
    }
  };

  private handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ inputValue: e.target.value });
  };

  private handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    const { tags, onChange } = this.props;
    const { inputValue } = this.state;

    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      this.handleAddTag(inputValue.trim());
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  private handleAddTag = (tag: string): void => {
    const { tags, maxTags = 20, maxLength = 50, onChange } = this.props;

    if (!tag) return;

    if (tags.length >= maxTags) {
      alert(`Maksimal ${maxTags} tag.`);
      return;
    }

    if (tag.length > maxLength) {
      alert(`Maksimal ${maxLength} karakter per tag.`);
      return;
    }

    if (tags.includes(tag)) {
      alert("Tag ini sudah ditambahkan.");
      return;
    }

    onChange([...tags, tag]);
    this.setState({ inputValue: "" });
  };

  private handleRemoveTag = (tagToRemove: string): void => {
    const { tags, onChange } = this.props;
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  private handleAddNewTag = (): void => {
    const { tags, maxTags = 20, maxLength = 50, onChange } = this.props;
    const { newTag, customTags } = this.state;
    const trimmed = newTag.trim();

    if (!trimmed) return;

    if (trimmed.length > maxLength) {
      alert(`Maksimal ${maxLength} karakter.`);
      return;
    }

    if (tags.includes(trimmed)) {
      alert("Tag ini sudah ditambahkan.");
      return;
    }

    if (tags.length >= maxTags) {
      alert(`Maksimal ${maxTags} tag.`);
      return;
    }

    // Add to custom tags if not already there
    if (!customTags.includes(trimmed)) {
      const updated = [...customTags, trimmed];
      this.setState({ customTags: updated });
      this.saveCustomTags(updated);
    }

    onChange([...tags, trimmed]);
    this.setState({ showAddModal: false, newTag: "" });
  };

  private handleModalKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "Escape") {
      this.setState({ showAddModal: false, newTag: "" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      this.handleAddNewTag();
    }
  };

  private handleNewTagChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ newTag: e.target.value });
  };

  private getAvailableTags(): string[] {
    const { tags } = this.props;
    const { customTags } = this.state;
    return [...customTags].filter((tag) => !tags.includes(tag));
  }

  private renderTag(tag: string, index: number): React.ReactNode {
    const { disabled = false } = this.props;

    return (
      <span
        key={`${tag}-${index}`}
        className={`${this.baseClass}__tag`}
        role="button"
        tabIndex={0}
        aria-label={`Hapus tag ${tag}`}
        onClick={() => !disabled && this.handleRemoveTag(tag)}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            this.handleRemoveTag(tag);
          }
        }}
      >
        {tag}
        {!disabled && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    );
  }

  private renderModal(): React.ReactNode {
    const { maxLength = 50 } = this.props;
    const { showAddModal, newTag } = this.state;

    if (!showAddModal) return null;

    return (
      <div
        className={`${this.baseClass}__overlay`}
        aria-modal="true"
        role="dialog"
        onClick={() => {
          this.setState({ showAddModal: false, newTag: "" });
        }}
      >
        <div
          className={`${this.baseClass}__modal`}
          ref={this.modalRef}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={this.handleModalKeyDown}
        >
          <div className={`${this.baseClass}__modalHeader`}>
            <h3 className={`${this.baseClass}__modalTitle`}>Tambah Tag Baru</h3>
            <button
              type="button"
              className={`${this.baseClass}__modalClose`}
              onClick={() => {
                this.setState({ showAddModal: false, newTag: "" });
              }}
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
              <span>Nama Tag</span>
              <input
                type="text"
                value={newTag}
                onChange={this.handleNewTagChange}
                placeholder="Masukkan nama tag"
                maxLength={maxLength}
                className={`${this.baseClass}__modalInput`}
                autoFocus
              />
              <div className={`${this.baseClass}__modalHint`}>
                {newTag.length}/{maxLength} karakter
              </div>
            </label>
          </div>

          <div className={`${this.baseClass}__modalFooter`}>
            <button
              type="button"
              className={`${this.baseClass}__modalBtn ${this.baseClass}__modalBtn--cancel`}
              onClick={() => {
                this.setState({ showAddModal: false, newTag: "" });
              }}
            >
              Batal
            </button>
            <button
              type="button"
              className={`${this.baseClass}__modalBtn ${this.baseClass}__modalBtn--submit`}
              onClick={this.handleAddNewTag}
              disabled={!newTag.trim()}
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
      tags,
      placeholder = "Tambahkan tag...",
      disabled = false,
      maxTags = 20,
      maxLength = 50,
      error,
    } = this.props;
    const { inputValue } = this.state;
    const availableTags = this.getAvailableTags();

    return (
      <>
        <div className={this.baseClass}>
          <div className={`${this.baseClass}__container`}>
            {tags.map((tag, index) => this.renderTag(tag, index))}

            {tags.length < maxTags && (
              <>
                <input
                  ref={this.inputRef}
                  type="text"
                  className={`${this.baseClass}__input`}
                  value={inputValue}
                  onChange={this.handleInputChange}
                  onKeyDown={this.handleInputKeyDown}
                  placeholder={tags.length === 0 ? placeholder : ""}
                  disabled={disabled}
                  maxLength={maxLength}
                  aria-label={`Input tag ${this.props.label.toLowerCase()}`}
                  aria-invalid={!!error}
                />

                {availableTags.length > 0 && (
                  <div className={`${this.baseClass}__suggestions`}>
                    <div className={`${this.baseClass}__suggestionsLabel`}>Tag tersedia:</div>
                    <div className={`${this.baseClass}__suggestionsList`}>
                      {availableTags.slice(0, 5).map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className={`${this.baseClass}__suggestion`}
                          onClick={() => this.handleAddTag(tag)}
                          disabled={disabled}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className={`${this.baseClass}__addBtn`}
                  onClick={() => this.setState({ showAddModal: true })}
                  disabled={disabled || tags.length >= maxTags}
                  aria-label="Tambah tag baru"
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
              </>
            )}
          </div>

          <div className={`${this.baseClass}__hint`}>
            {tags.length}/{maxTags} tag
            {tags.length >= maxTags && " (maksimal tercapai)"}
          </div>

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

export default TagInput;

