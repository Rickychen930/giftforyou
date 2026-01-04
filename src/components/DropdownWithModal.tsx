import React, { useState, useRef, useEffect } from "react";
import "../styles/DropdownWithModal.css";

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

const DropdownWithModal: React.FC<DropdownWithModalProps> = ({
  label,
  value,
  options,
  onChange,
  onAddNew,
  placeholder = "Pilih atau tambahkan baru...",
  disabled = false,
  required = false,
  error,
  maxLength = 100,
  storageKey,
  allowAddNew = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [customOptions, setCustomOptions] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load custom options from localStorage
  useEffect(() => {
    if (storageKey) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setCustomOptions(parsed);
          }
        }
      } catch (err) {
        console.error("Error loading custom options:", err);
      }
    }
  }, [storageKey]);

  // Save custom options to localStorage
  const saveCustomOptions = (newOptions: string[]) => {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newOptions));
      } catch (err) {
        console.error("Error saving custom options:", err);
      }
    }
  };

  const allOptions = [...options, ...customOptions].filter(
    (opt, index, self) => self.indexOf(opt) === index
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        showModal
      ) {
        setShowModal(false);
        setNewValue("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  useEffect(() => {
    if (showModal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showModal]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  const handleAddNewClick = () => {
    setShowModal(true);
    setIsOpen(false);
  };

  const handleModalSubmit = () => {
    const trimmed = newValue.trim();
    if (!trimmed) return;

    if (trimmed.length > maxLength) {
      alert(`Maksimal ${maxLength} karakter.`);
      return;
    }

    // Check if already exists
    if (allOptions.includes(trimmed)) {
      alert("Opsi ini sudah ada.");
      return;
    }

    // Add to custom options
    const updated = [...customOptions, trimmed];
    setCustomOptions(updated);
    saveCustomOptions(updated);

    // Set as selected value
    onChange(trimmed);
    setShowModal(false);
    setNewValue("");
    onAddNew(trimmed);
  };

  const handleModalCancel = () => {
    setShowModal(false);
    setNewValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      if (showModal) {
        handleModalCancel();
      } else {
        setIsOpen(false);
      }
    } else if (e.key === "Enter" && showModal) {
      e.preventDefault();
      handleModalSubmit();
    }
  };

  return (
    <>
      <div className="dropdownWithModal" ref={dropdownRef}>
        <button
          type="button"
          className={`dropdownWithModal__trigger ${isOpen ? "is-open" : ""} ${error ? "has-error" : ""}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="dropdownWithModal__value">
            {value || (
              <span className="dropdownWithModal__placeholder">{placeholder}</span>
            )}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="dropdownWithModal__icon"
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
          <div className="dropdownWithModal__menu" role="listbox">
            {allOptions.length > 0 ? (
              <>
                {allOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`dropdownWithModal__option ${
                      value === option ? "is-selected" : ""
                    }`}
                    onClick={() => handleSelect(option)}
                    role="option"
                    aria-selected={value === option}
                  >
                    {option}
                    {value === option && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
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
                    )}
                  </button>
                ))}
              </>
            ) : (
              <div className="dropdownWithModal__empty">Tidak ada opsi</div>
            )}
            {allowAddNew && (
              <button
                type="button"
                className="dropdownWithModal__addNew"
                onClick={handleAddNewClick}
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
            )}
          </div>
        )}

        {error && (
          <span className="dropdownWithModal__error" role="alert" aria-live="polite">
            {error}
          </span>
        )}
      </div>

      {showModal && (
        <div className="dropdownWithModal__overlay" aria-modal="true" role="dialog">
          <div
            className="dropdownWithModal__modal"
            ref={modalRef}
            onKeyDown={handleKeyDown}
          >
            <div className="dropdownWithModal__modalHeader">
              <h3 className="dropdownWithModal__modalTitle">Tambah {label} Baru</h3>
              <button
                type="button"
                className="dropdownWithModal__modalClose"
                onClick={handleModalCancel}
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

            <div className="dropdownWithModal__modalBody">
              <label className="dropdownWithModal__modalLabel">
                <span>{label}</span>
                <input
                  ref={inputRef}
                  type="text"
                  id={`dropdown-modal-input-${label.toLowerCase().replace(/\s+/g, '-')}`}
                  name={`dropdown-modal-input-${label.toLowerCase().replace(/\s+/g, '-')}`}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={`Masukkan ${label.toLowerCase()} baru`}
                  maxLength={maxLength}
                  className="dropdownWithModal__modalInput"
                />
                <div className="dropdownWithModal__modalHint">
                  {newValue.length}/{maxLength} karakter
                </div>
              </label>
            </div>

            <div className="dropdownWithModal__modalFooter">
              <button
                type="button"
                className="dropdownWithModal__modalBtn dropdownWithModal__modalBtn--cancel"
                onClick={handleModalCancel}
              >
                Batal
              </button>
              <button
                type="button"
                className="dropdownWithModal__modalBtn dropdownWithModal__modalBtn--submit"
                onClick={handleModalSubmit}
                disabled={!newValue.trim()}
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

export default DropdownWithModal;

