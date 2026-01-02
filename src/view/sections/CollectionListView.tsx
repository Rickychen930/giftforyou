/**
 * Collection List View Component (OOP)
 * Class-based component following SOLID principles
 */

/**
 * Collection List View Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component, RefObject } from "react";
import type { Collection } from "../../models/domain/collection";
import "../../styles/CollectionListView.css";
import SectionHeader from "../../components/common/SectionHeader";
import EmptyState from "../../components/common/EmptyState";
import { CollectionIcon, CheckIcon, CloseIcon, EditIcon, DeleteIcon, SpinnerIcon } from "../../components/icons";

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

  /**
   * Render empty state
   */
  private renderEmptyState(): React.ReactNode {
    return (
      <EmptyState
        title="Tidak ada koleksi"
        description="Belum ada koleksi yang dibuat."
        icon={<CollectionIcon width={64} height={64} style={{ opacity: 0.3 }} />}
        className={`${this.baseClass}__empty`}
      />
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
                  <CheckIcon width={16} height={16} />
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
                  <CloseIcon width={16} height={16} />
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
                  <EditIcon width={18} height={18} />
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
                      <SpinnerIcon width={18} height={18} className="spinning" />
                    ) : (
                      <DeleteIcon width={18} height={18} />
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
        <SectionHeader
          title="Edit Koleksi & Bouquet"
          subtitle="Pilih koleksi untuk melihat dan mengelola bouquet di dalamnya"
          className={`${this.baseClass}__header`}
        />

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

