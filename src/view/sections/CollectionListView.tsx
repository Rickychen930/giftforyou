/**
 * Collection List View Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component, RefObject } from "react";
import type { Collection } from "../../models/domain/collection";
import "../../styles/CollectionListView.css";

interface Props {
  collections: Collection[];
  onCollectionSelect: (collectionId: string) => void;
  onCollectionUpdate: (collectionId: string, newName: string) => Promise<boolean>;
  onCollectionDelete?: (collectionId: string) => Promise<boolean>;
}

interface CollectionListViewState {
  editingId: string | null;
  editValue: string;
  saving: boolean;
  deletingId: string | null;
  deleteConfirmId: string | null;
}

/**
 * Collection List View Component
 * Class-based component for collection list view
 */
class CollectionListView extends Component<Props, CollectionListViewState> {
  private baseClass: string = "collectionListView";
  private inputRef: RefObject<HTMLInputElement>;

  constructor(props: Props) {
    super(props);
    this.state = {
      editingId: null,
      editValue: "",
      saving: false,
      deletingId: null,
      deleteConfirmId: null,
    };
    this.inputRef = React.createRef();
  }

  componentDidUpdate(prevProps: Props, prevState: CollectionListViewState): void {
    if (this.state.editingId && !prevState.editingId && this.inputRef.current) {
      this.inputRef.current.focus();
      this.inputRef.current.select();
    }
  }

  private bouquetCount(collection: Collection): number {
    return Array.isArray(collection.bouquets) ? collection.bouquets.length : 0;
  }

  private handleEditStart = (collection: Collection): void => {
    this.setState({
      editingId: collection._id,
      editValue: collection.name,
    });
  };

  private handleEditCancel = (): void => {
    this.setState({
      editingId: null,
      editValue: "",
    });
  };

  private handleEditSave = async (collectionId: string): Promise<void> => {
    const { editValue } = this.state;
    const trimmed = editValue.trim();
    const currentCollection = this.props.collections.find((c) => c._id === collectionId);

    if (!trimmed) {
      alert("Nama koleksi tidak boleh kosong.");
      return;
    }

    if (trimmed === currentCollection?.name) {
      this.handleEditCancel();
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

    this.setState({ saving: true });
    try {
      const success = await this.props.onCollectionUpdate(collectionId, trimmed);
      if (success) {
        this.setState({
          editingId: null,
          editValue: "",
        });
      } else {
        alert("Gagal mengupdate nama koleksi. Silakan coba lagi.");
      }
    } catch (err) {
      console.error("Failed to update collection:", err);
      alert("Terjadi kesalahan saat mengupdate nama koleksi. Silakan coba lagi.");
    } finally {
      this.setState({ saving: false });
    }
  };

  private handleKeyDown = (e: React.KeyboardEvent, collectionId: string): void => {
    if (e.key === "Enter") {
      e.preventDefault();
      void this.handleEditSave(collectionId);
    } else if (e.key === "Escape") {
      e.preventDefault();
      this.handleEditCancel();
    }
  };

  private handleDeleteClick = (e: React.MouseEvent, collectionId: string): void => {
    e.stopPropagation();
    e.preventDefault();
    this.setState({ deleteConfirmId: collectionId });
  };

  private handleDeleteConfirm = async (collectionId: string): Promise<void> => {
    const { onCollectionDelete } = this.props;
    if (!onCollectionDelete) {
      this.setState({ deleteConfirmId: null });
      return;
    }

    const collection = this.props.collections.find((c) => c._id === collectionId);
    if (!collection) {
      this.setState({ deleteConfirmId: null });
      return;
    }

    this.setState({
      deletingId: collectionId,
      deleteConfirmId: null,
    });

    try {
      const success = await onCollectionDelete(collectionId);
      if (!success) {
        alert("Gagal menghapus koleksi. Silakan coba lagi.");
        this.setState({ deletingId: null });
      } else {
        this.setState({ deletingId: null });
      }
    } catch (err) {
      console.error("Failed to delete collection:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menghapus koleksi. Silakan coba lagi.";
      alert(errorMessage);
      this.setState({ deletingId: null });
    }
  };

  private handleDeleteCancel = (): void => {
    this.setState({ deleteConfirmId: null });
  };

  private renderEmptyState(): React.ReactNode {
    return (
      <div className={`${this.baseClass}__empty`} role="status">
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
    );
  }

  private renderCollectionCard(collection: Collection): React.ReactNode {
    const { editingId, editValue, saving, deletingId, deleteConfirmId } = this.state;
    const isEditing = editingId === collection._id;
    const count = this.bouquetCount(collection);
    const isDeleting = deletingId === collection._id;
    const showDeleteConfirm = deleteConfirmId === collection._id;

    return (
      <article
        key={collection._id}
        className={`${this.baseClass}__card`}
        role="button"
        tabIndex={0}
        onClick={() => !isEditing && this.props.onCollectionSelect(collection._id)}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !isEditing) {
            e.preventDefault();
            this.props.onCollectionSelect(collection._id);
          }
        }}
      >
        <div className={`${this.baseClass}__cardHeader`} style={{ position: "relative" }}>
          {isEditing ? (
            <div className={`${this.baseClass}__editForm`}>
              <input
                ref={this.inputRef}
                type="text"
                className={`${this.baseClass}__editInput`}
                value={editValue}
                onChange={(e) => this.setState({ editValue: e.target.value })}
                onKeyDown={(e) => this.handleKeyDown(e, collection._id)}
                onBlur={() => void this.handleEditSave(collection._id)}
                disabled={saving}
                maxLength={100}
                aria-label="Edit nama koleksi"
              />
              <div className={`${this.baseClass}__editActions`}>
                <button
                  type="button"
                  className={`${this.baseClass}__editBtn ${this.baseClass}__editBtn--save`}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    void this.handleEditSave(collection._id);
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
                  className={`${this.baseClass}__editBtn ${this.baseClass}__editBtn--cancel`}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    this.handleEditCancel();
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
              <h3 className={`${this.baseClass}__cardTitle`}>{collection.name}</h3>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <button
                  type="button"
                  className={`${this.baseClass}__editIconBtn`}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    this.handleEditStart(collection);
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
                {this.props.onCollectionDelete && (
                  <button
                    type="button"
                    className={`${this.baseClass}__deleteIconBtn`}
                    onClick={(e) => this.handleDeleteClick(e, collection._id)}
                    disabled={isDeleting || showDeleteConfirm}
                    aria-label={`Hapus koleksi ${collection.name}`}
                    title="Hapus"
                  >
                    {isDeleting ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        className="spinning"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeDasharray="31.416"
                          strokeDashoffset="31.416"
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
                          d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m4 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
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
            </>
          )}
        </div>

        <div className={`${this.baseClass}__cardBody`}>
          <p className={`${this.baseClass}__cardDescription`}>
            {collection.description || "Tidak ada deskripsi"}
          </p>
          <div className={`${this.baseClass}__cardMeta`}>
            <span className={`${this.baseClass}__cardCount`}>
              {count} {count === 1 ? "bouquet" : "bouquets"}
            </span>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className={`${this.baseClass}__deleteConfirm`}>
            <p>Yakin ingin menghapus koleksi ini?</p>
            <div className={`${this.baseClass}__deleteConfirmActions`}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void this.handleDeleteConfirm(collection._id);
                }}
                className={`${this.baseClass}__deleteConfirmBtn ${this.baseClass}__deleteConfirmBtn--confirm`}
              >
                Ya, Hapus
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  this.handleDeleteCancel();
                }}
                className={`${this.baseClass}__deleteConfirmBtn ${this.baseClass}__deleteConfirmBtn--cancel`}
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </article>
    );
  }

  render(): React.ReactNode {
    const { collections } = this.props;

    return (
      <section className={this.baseClass} aria-label="Daftar koleksi">
        <header className={`${this.baseClass}__header`}>
          <div className={`${this.baseClass}__headerContent`}>
            <h2 className={`${this.baseClass}__title`}>Edit Koleksi & Bouquet</h2>
            <p className={`${this.baseClass}__subtitle`}>
              Pilih koleksi untuk melihat dan mengelola bouquet di dalamnya
            </p>
          </div>
        </header>

        {collections.length === 0 ? (
          this.renderEmptyState()
        ) : (
          <div
            className={`${this.baseClass}__grid`}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {collections.map((collection) => this.renderCollectionCard(collection))}
          </div>
        )}
      </section>
    );
  }
}

export default CollectionListView;

