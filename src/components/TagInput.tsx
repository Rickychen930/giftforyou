import React, { useState, useRef, useEffect } from "react";
import "../styles/TagInput.css";

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

const TagInput: React.FC<TagInputProps> = ({
  label,
  tags,
  onChange,
  placeholder = "Tambahkan tag...",
  disabled = false,
  maxTags = 20,
  maxLength = 50,
  error,
  storageKey,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [customTags, setCustomTags] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Load custom tags from localStorage
  useEffect(() => {
    if (storageKey) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setCustomTags(parsed);
          }
        }
      } catch (err) {
        console.error("Error loading custom tags:", err);
      }
    }
  }, [storageKey]);

  // Save custom tags to localStorage
  const saveCustomTags = (newTags: string[]) => {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newTags));
      } catch (err) {
        console.error("Error saving custom tags:", err);
      }
    }
  };

  const availableTags = [...customTags].filter(
    (tag) => !tags.includes(tag)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        showAddModal
      ) {
        setShowAddModal(false);
        setNewTag("");
      }
    };

    if (showAddModal) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showAddModal]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(inputValue.trim());
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      // Remove last tag on backspace
      onChange(tags.slice(0, -1));
    }
  };

  const handleAddTag = (tag: string) => {
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
    setInputValue("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleAddNewTag = () => {
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
      setCustomTags(updated);
      saveCustomTags(updated);
    }

    onChange([...tags, trimmed]);
    setShowAddModal(false);
    setNewTag("");
  };

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowAddModal(false);
      setNewTag("");
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleAddNewTag();
    }
  };

  return (
    <>
      <div className="tagInput">
        <div className="tagInput__container">
          {tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="tagInput__tag"
              role="button"
              tabIndex={0}
              aria-label={`Hapus tag ${tag}`}
              onClick={() => !disabled && handleRemoveTag(tag)}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !disabled) {
                  e.preventDefault();
                  handleRemoveTag(tag);
                }
              }}
            >
              {tag}
              {!disabled && (
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
              )}
            </span>
          ))}

          {tags.length < maxTags && (
            <>
              <input
                ref={inputRef}
                type="text"
                className="tagInput__input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder={tags.length === 0 ? placeholder : ""}
                disabled={disabled}
                maxLength={maxLength}
                aria-label={`Input tag ${label.toLowerCase()}`}
                aria-invalid={!!error}
              />

              {availableTags.length > 0 && (
                <div className="tagInput__suggestions">
                  <div className="tagInput__suggestionsLabel">Tag tersedia:</div>
                  <div className="tagInput__suggestionsList">
                    {availableTags.slice(0, 5).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className="tagInput__suggestion"
                        onClick={() => handleAddTag(tag)}
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
                className="tagInput__addBtn"
                onClick={() => setShowAddModal(true)}
                disabled={disabled || tags.length >= maxTags}
                aria-label="Tambah tag baru"
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
                Tambah Baru
              </button>
            </>
          )}
        </div>

        <div className="tagInput__hint">
          {tags.length}/{maxTags} tag
          {tags.length >= maxTags && " (maksimal tercapai)"}
        </div>

        {error && (
          <span className="tagInput__error" role="alert" aria-live="polite">
            {error}
          </span>
        )}
      </div>

      {showAddModal && (
        <div
          className="tagInput__overlay"
          aria-modal="true"
          role="dialog"
          onClick={() => {
            setShowAddModal(false);
            setNewTag("");
          }}
        >
          <div
            className="tagInput__modal"
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleModalKeyDown}
          >
            <div className="tagInput__modalHeader">
              <h3 className="tagInput__modalTitle">Tambah Tag Baru</h3>
              <button
                type="button"
                className="tagInput__modalClose"
                onClick={() => {
                  setShowAddModal(false);
                  setNewTag("");
                }}
                aria-label="Tutup"
              >
                <svg
                  width="20"
                  height="20"
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
              </button>
            </div>

            <div className="tagInput__modalBody">
              <label className="tagInput__modalLabel">
                <span>Nama Tag</span>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Masukkan nama tag"
                  maxLength={maxLength}
                  className="tagInput__modalInput"
                  autoFocus
                />
                <div className="tagInput__modalHint">
                  {newTag.length}/{maxLength} karakter
                </div>
              </label>
            </div>

            <div className="tagInput__modalFooter">
              <button
                type="button"
                className="tagInput__modalBtn tagInput__modalBtn--cancel"
                onClick={() => {
                  setShowAddModal(false);
                  setNewTag("");
                }}
              >
                Batal
              </button>
              <button
                type="button"
                className="tagInput__modalBtn tagInput__modalBtn--submit"
                onClick={handleAddNewTag}
                disabled={!newTag.trim()}
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TagInput;

