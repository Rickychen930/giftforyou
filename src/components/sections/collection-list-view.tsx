import React, { useState, useRef, useEffect } from "react";
import type { Collection } from "../../models/domain/collection";
import "../../styles/CollectionListView.css";

interface Props {
  collections: Collection[];
  onCollectionSelect: (collectionId: string) => void;
  onCollectionUpdate: (collectionId: string, newName: string) => Promise<boolean>;
  onCollectionDelete?: (collectionId: string) => Promise<boolean>;
}

const CollectionListView: React.FC<Props> = ({
  collections,
  onCollectionSelect,
  onCollectionUpdate,
  onCollectionDelete,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleEditStart = (collection: Collection): void => {
    setEditingId(collection._id);
    setEditValue(collection.name);
  };

  const handleEditCancel = (): void => {
    setEditingId(null);
    setEditValue("");
  };

  const handleEditSave = async (collectionId: string): Promise<void> => {
    const trimmed = editValue.trim();
    const currentCollection = collections.find((c) => c._id === collectionId);
    
    if (!trimmed) {
      alert("Nama koleksi tidak boleh kosong.");
      return;
    }
    
    if (trimmed === currentCollection?.name) {
      handleEditCancel();
      return;
    }

    if (trimmed.length < 2) {
      alert("Nama koleksi minimal 2 karakter.");
      return;
    }

    if (trimmed.length > 100) {
      alert("Nama koleksi maksimal 100 karakter.");
      return;
    }

    setSaving(true);
    try {
      const success = await onCollectionUpdate(collectionId, trimmed);
      if (success) {
        setEditingId(null);
        setEditValue("");
      } else {
        alert("Gagal mengupdate nama koleksi. Silakan coba lagi.");
      }
    } catch (err) {
      console.error("Failed to update collection:", err);
      alert("Terjadi kesalahan saat mengupdate nama koleksi. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    collectionId: string
  ): void => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleEditSave(collectionId);
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleEditCancel();
    }
  };

  const bouquetCount = (collection: Collection): number => {
    return Array.isArray(collection.bouquets)
      ? collection.bouquets.length
      : 0;
  };

  const handleDeleteClick = (e: React.MouseEvent, collectionId: string): void => {
    e.stopPropagation();
    e.preventDefault();
    setDeleteConfirmId(collectionId);
  };

  const handleDeleteConfirm = async (collectionId: string): Promise<void> => {
    if (!onCollectionDelete) {
      setDeleteConfirmId(null);
      return;
    }

    const collection = collections.find((c) => c._id === collectionId);
    if (!collection) {
      setDeleteConfirmId(null);
      return;
    }

    setDeletingId(collectionId);
    setDeleteConfirmId(null);

    try {
      const success = await onCollectionDelete(collectionId);
      if (!success) {
        alert("Gagal menghapus koleksi. Silakan coba lagi.");
        setDeletingId(null);
      } else {
        // Success - deletingId will be cleared by parent component state update
        setDeletingId(null);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to delete collection:", err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Terjadi kesalahan saat menghapus koleksi. Silakan coba lagi.";
      alert(errorMessage);
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = (): void => {
    setDeleteConfirmId(null);
  };

  return (
    <section className="collectionListView" aria-label="Daftar koleksi">
      <header className="collectionListView__header">
        <div className="collectionListView__headerContent">
          <h2 className="collectionListView__title">Edit Koleksi & Bouquet</h2>
          <p className="collectionListView__subtitle">
            Pilih koleksi untuk melihat dan mengelola bouquet di dalamnya
          </p>
        </div>
      </header>

      {collections.length === 0 ? (
        <div className="collectionListView__empty" role="status">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3>Tidak ada koleksi</h3>
          <p>Belum ada koleksi yang dibuat.</p>
        </div>
      ) : (
        <div className="collectionListView__grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {collections.map((collection) => {
            const isEditing = editingId === collection._id;
            const count = bouquetCount(collection);

            return (
              <article
                key={collection._id}
                className="collectionListView__card"
                role="button"
                tabIndex={0}
                onClick={() => !isEditing && onCollectionSelect(collection._id)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !isEditing) {
                    e.preventDefault();
                    onCollectionSelect(collection._id);
                  }
                }}
              >
                <div className="collectionListView__cardHeader" style={{ position: "relative" }}>
                  {isEditing ? (
                    <div className="collectionListView__editForm">
                      <input
                        ref={inputRef}
                        type="text"
                        className="collectionListView__editInput"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, collection._id)}
                        onBlur={() => handleEditSave(collection._id)}
                        disabled={saving}
                        maxLength={100}
                        aria-label="Edit nama koleksi"
                      />
                      <div className="collectionListView__editActions">
                        <button
                          type="button"
                          className="collectionListView__editBtn collectionListView__editBtn--save"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            void handleEditSave(collection._id);
                          }}
                          disabled={saving}
                          aria-label="Simpan"
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
                              d="M20 6L9 17l-5-5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="collectionListView__editBtn collectionListView__editBtn--cancel"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleEditCancel();
                          }}
                          disabled={saving}
                          aria-label="Batal"
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
                              d="M18 6L6 18M6 6l12 12"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                  <>
                    <h3 className="collectionListView__cardTitle">
                      {collection.name}
                    </h3>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", position: "relative", zIndex: 1 }}>
                      <button
                        type="button"
                        className="collectionListView__editIconBtn"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleEditStart(collection);
                        }}
                        aria-label={`Edit nama koleksi ${collection.name}`}
                        title="Edit nama"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      {onCollectionDelete && (
                        <button
                          type="button"
                          className="collectionListView__deleteIconBtn"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleDeleteClick(e, collection._id);
                          }}
                          disabled={deletingId === collection._id}
                          aria-label={`Hapus koleksi ${collection.name}`}
                          title="Hapus koleksi"
                        >
                          {deletingId === collection._id ? (
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              aria-hidden="true"
                              style={{ animation: "spin 1s linear infinite" }}
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeDasharray="32"
                                strokeDashoffset="32"
                              />
                            </svg>
                          ) : (
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              aria-hidden="true"
                            >
                              <path
                                d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M10 11v6M14 11v6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  {deleteConfirmId === collection._id && (
                    <div
                      className="collectionListView__deleteConfirm"
                      style={{ zIndex: 10001 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    >
                      <p>Yakin ingin menghapus koleksi ini?</p>
                      {count > 0 && (
                        <p style={{ fontSize: "0.875rem", color: "var(--ink-620)", marginTop: "0.25rem" }}>
                          {count} bouquet akan kehilangan nama koleksi
                        </p>
                      )}
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                        <button
                          type="button"
                          className="collectionListView__deleteConfirmBtn collectionListView__deleteConfirmBtn--confirm"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            void handleDeleteConfirm(collection._id);
                          }}
                          disabled={deletingId === collection._id}
                        >
                          {deletingId === collection._id ? "Menghapus..." : "Hapus"}
                        </button>
                        <button
                          type="button"
                          className="collectionListView__deleteConfirmBtn collectionListView__deleteConfirmBtn--cancel"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleDeleteCancel();
                          }}
                          disabled={deletingId === collection._id}
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}
                  </>
                  )}
                </div>

                {collection.description && (
                  <p className="collectionListView__cardDescription">
                    {collection.description}
                  </p>
                )}

                <div className="collectionListView__cardFooter">
                  <div className="collectionListView__cardStats">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>
                      {count} {count === 1 ? "bouquet" : "bouquets"}
                    </span>
                  </div>
                  <div className="collectionListView__cardArrow">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M9 18l6-6-6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CollectionListView;

