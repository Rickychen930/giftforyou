/**
 * Collection Detail View Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import type { Collection } from "../../models/domain/collection";
import type { Bouquet } from "../../models/domain/bouquet";
import DropdownWithModal from "../../components/inputs/DropdownWithModal";
import SectionHeader from "../../components/common/SectionHeader";
import EmptyState from "../../components/common/EmptyState";
import Grid from "../../components/layout/Grid";
import "../../styles/CollectionDetailView.css";
import { API_BASE } from "../../config/api";
import { formatIDR } from "../../utils/money";
import { DownloadIcon, EditIcon, ArrowRightIcon, CopyIcon, DeleteIcon, PackageIcon } from "../../components/icons";
import {
  formatBouquetName,
  formatBouquetType,
  formatBouquetSize,
  formatCollectionName,
} from "../../utils/text-formatter";
import { generateCollectionPDF } from "../../utils/pdf-generator";

interface Props {
  collection: Collection;
  bouquets: Bouquet[];
  allCollections: Collection[];
  onBack: () => void;
  onBouquetSelect: (bouquet: Bouquet) => void;
  onBouquetMove: (bouquetId: string, targetCollectionId: string) => Promise<boolean>;
  onBouquetDelete: (bouquetId: string) => Promise<void>;
  onBouquetDuplicate: (bouquetId: string) => Promise<void>;
}

interface CollectionDetailViewState {
  movingBouquetId: string | null;
  deletingBouquetId: string | null;
  duplicatingBouquetId: string | null;
  showMoveModal: string | null;
}

/**
 * Download PDF Button Component (OOP)
 * Class-based component for PDF download
 */
class DownloadPDFButton extends Component<
  { collectionName: string; bouquets: Bouquet[] },
  { isGenerating: boolean; showOptions: boolean }
> {
  constructor(props: { collectionName: string; bouquets: Bouquet[] }) {
    super(props);
    this.state = {
      isGenerating: false,
      showOptions: false,
    };
  }

  private handleDownload = async (withWatermark: boolean): Promise<void> => {
    const { bouquets, collectionName } = this.props;
    if (bouquets.length === 0) {
      alert("Tidak ada bouquet untuk diunduh.");
      return;
    }

    this.setState({ isGenerating: true, showOptions: false });

    try {
      const pdfPromise = generateCollectionPDF(
        collectionName,
        bouquets.map((b) => ({
          _id: b._id,
          name: b.name,
          price: b.price,
          image: b.image,
          isFeatured: b.isFeatured,
          isNewEdition: b.isNewEdition,
        })),
        { withWatermark }
      );

      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error("PDF generation timeout. Silakan coba lagi.")), 60000);
      });

      await Promise.race([pdfPromise, timeoutPromise]);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Gagal menghasilkan PDF. Silakan coba lagi.";
      alert(errorMessage);
    } finally {
      this.setState({ isGenerating: false });
    }
  };

  render(): React.ReactNode {
    const { bouquets } = this.props;
    const { isGenerating, showOptions } = this.state;

    return (
      <div
        className="collectionDetailView__downloadWrapper"
        style={{
          position: "relative",
          marginTop: "1rem",
          zIndex: 10000,
          isolation: "isolate",
        }}
      >
        <button
          type="button"
          className="collectionDetailView__downloadBtn"
          onClick={() => this.setState({ showOptions: !showOptions })}
          disabled={isGenerating || bouquets.length === 0}
          aria-label="Download PDF"
          style={{
            padding: "0.65rem 1.25rem",
            borderRadius: "12px",
            border: "2px solid rgba(212, 140, 156, 0.3)",
            background: "linear-gradient(135deg, rgba(212, 140, 156, 0.12) 0%, rgba(168, 213, 186, 0.12) 100%)",
            color: "var(--brand-rose-700)",
            fontWeight: 800,
            fontSize: "0.95rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            position: "relative",
            zIndex: 10001,
          }}
        >
          <DownloadIcon width={16} height={16} />
          {isGenerating ? "Generating..." : "Download PDF"}
        </button>

        {showOptions && (
          <>
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 10000,
                background: "rgba(0, 0, 0, 0.3)",
                backdropFilter: "blur(2px)",
                WebkitBackdropFilter: "blur(2px)",
              }}
              onClick={() => this.setState({ showOptions: false })}
            />
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)",
                border: "2px solid rgba(212, 140, 156, 0.3)",
                borderRadius: "16px",
                boxShadow: "0 24px 64px rgba(0, 0, 0, 0.25), 0 12px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.9) inset",
                zIndex: 10001,
                display: "flex",
                flexDirection: "column",
                minWidth: "240px",
                maxWidth: "90vw",
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                overflow: "hidden",
                isolation: "isolate",
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => void this.handleDownload(false)}
                disabled={isGenerating}
                style={{
                  padding: "0.85rem 1.25rem",
                  border: "none",
                  background: "transparent",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "var(--ink-800)",
                  transition: "all 0.2s ease",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <DownloadIcon width={16} height={16} />
                  Tanpa Watermark
                </span>
              </button>
              <button
                type="button"
                onClick={() => void this.handleDownload(true)}
                disabled={isGenerating}
                style={{
                  padding: "0.85rem 1.25rem",
                  border: "none",
                  background: "transparent",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "var(--ink-800)",
                  borderTop: "1px solid rgba(212, 140, 156, 0.15)",
                  transition: "all 0.2s ease",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <DownloadIcon width={16} height={16} />
                  Dengan Watermark
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    );
  }
}

/**
 * Collection Detail View Component
 * Class-based component for collection detail view
 * Optimized for performance with shouldComponentUpdate
 */
class CollectionDetailView extends Component<Props, CollectionDetailViewState> {
  private baseClass: string = "collectionDetailView";
  // Performance: Cache expensive computations
  private availableCollectionsCache: Collection[] | null = null;
  private lastCollectionId: string = "";

  constructor(props: Props) {
    super(props);
    this.state = {
      movingBouquetId: null,
      deletingBouquetId: null,
      duplicatingBouquetId: null,
      showMoveModal: null,
    };
  }

  // Performance: Prevent unnecessary re-renders
  shouldComponentUpdate(nextProps: Props, nextState: CollectionDetailViewState): boolean {
    // Only update if props or state actually changed
    const propsChanged = 
      nextProps.collection !== this.props.collection ||
      nextProps.bouquets !== this.props.bouquets ||
      nextProps.allCollections !== this.props.allCollections ||
      nextProps.onBack !== this.props.onBack ||
      nextProps.onBouquetSelect !== this.props.onBouquetSelect ||
      nextProps.onBouquetMove !== this.props.onBouquetMove ||
      nextProps.onBouquetDelete !== this.props.onBouquetDelete ||
      nextProps.onBouquetDuplicate !== this.props.onBouquetDuplicate;

    const stateChanged = 
      nextState.movingBouquetId !== this.state.movingBouquetId ||
      nextState.deletingBouquetId !== this.state.deletingBouquetId ||
      nextState.duplicatingBouquetId !== this.state.duplicatingBouquetId ||
      nextState.showMoveModal !== this.state.showMoveModal;

    return propsChanged || stateChanged;
  }

  // Performance: Memoize available collections
  private getAvailableCollections(): Collection[] {
    const currentCollectionId = this.props.collection._id;
    if (this.availableCollectionsCache && this.lastCollectionId === currentCollectionId) {
      return this.availableCollectionsCache;
    }
    
    const available = this.props.allCollections.filter((c) => c._id !== currentCollectionId);
    this.availableCollectionsCache = available;
    this.lastCollectionId = currentCollectionId;
    return available;
  }

  private handleMove = async (bouquetId: string, targetCollectionId: string): Promise<void> => {
    // Enhanced: Validate inputs
    if (!bouquetId || !targetCollectionId) {
      alert("Data tidak valid untuk operasi pindah.");
      return;
    }

    // Enhanced: Check if bouquet exists
    const bouquet = this.props.bouquets.find((b) => b._id === bouquetId);
    if (!bouquet) {
      alert("Bouquet tidak ditemukan.");
      return;
    }

    // Enhanced: Check if target collection exists
    const targetCollection = this.props.allCollections.find((c) => c._id === targetCollectionId);
    if (!targetCollection) {
      alert("Koleksi tujuan tidak ditemukan.");
      return;
    }

    // Enhanced: Prevent moving to same collection
    if (this.props.collection._id === targetCollectionId) {
      alert("Bouquet sudah berada di koleksi ini.");
      this.setState({ showMoveModal: null });
      return;
    }

    // Enhanced: Prevent concurrent operations
    if (this.state.movingBouquetId || this.state.deletingBouquetId || this.state.duplicatingBouquetId) {
      alert("Tunggu hingga operasi sebelumnya selesai.");
      return;
    }

    this.setState({ movingBouquetId: bouquetId });
    try {
      // Enhanced: Add timeout protection
      const movePromise = this.props.onBouquetMove(bouquetId, targetCollectionId);
      const timeoutPromise = new Promise<boolean>((_, reject) => 
        setTimeout(() => reject(new Error("Operasi pindah timeout")), 30000)
      );

      const success = await Promise.race([movePromise, timeoutPromise]);
      
      if (success) {
        this.setState({ showMoveModal: null });
      } else {
        alert("Gagal memindahkan bouquet. Silakan coba lagi.");
      }
    } catch (err) {
      console.error("Failed to move bouquet:", err);
      const errorMessage = err instanceof Error 
        ? (err.message.includes("timeout") ? "Operasi pindah timeout. Silakan coba lagi." : err.message)
        : "Terjadi kesalahan saat memindahkan bouquet. Silakan coba lagi.";
      alert(errorMessage);
    } finally {
      this.setState({ movingBouquetId: null });
    }
  };

  private handleDelete = async (bouquetId: string): Promise<void> => {
    // Enhanced: Validate input
    if (!bouquetId) {
      alert("Data tidak valid untuk operasi hapus.");
      return;
    }

    // Enhanced: Check if bouquet exists
    const bouquet = this.props.bouquets.find((b) => b._id === bouquetId);
    if (!bouquet) {
      alert("Bouquet tidak ditemukan.");
      return;
    }

    // Enhanced: Prevent concurrent operations
    if (this.state.movingBouquetId || this.state.deletingBouquetId || this.state.duplicatingBouquetId) {
      alert("Tunggu hingga operasi sebelumnya selesai.");
      return;
    }

    const bouquetName = bouquet.name || "bouquet ini";
    if (
      !window.confirm(
        `Yakin ingin menghapus "${bouquetName}"? Tindakan ini tidak dapat dibatalkan.`
      )
    ) {
      return;
    }

    this.setState({ deletingBouquetId: bouquetId });
    try {
      // Enhanced: Add timeout protection
      const deletePromise = this.props.onBouquetDelete(bouquetId);
      const timeoutPromise = new Promise<void>((_, reject) => 
        setTimeout(() => reject(new Error("Operasi hapus timeout")), 30000)
      );

      await Promise.race([deletePromise, timeoutPromise]);
    } catch (err) {
      console.error("Failed to delete bouquet:", err);
      const errorMessage = err instanceof Error 
        ? (err.message.includes("timeout") ? "Operasi hapus timeout. Silakan coba lagi." : err.message)
        : "Gagal menghapus bouquet. Silakan coba lagi.";
      alert(errorMessage);
      this.setState({ deletingBouquetId: null });
    }
  };

  private handleDuplicate = async (bouquetId: string): Promise<void> => {
    // Enhanced: Validate input
    if (!bouquetId) {
      alert("Data tidak valid untuk operasi duplikasi.");
      return;
    }

    // Enhanced: Check if bouquet exists
    const bouquet = this.props.bouquets.find((b) => b._id === bouquetId);
    if (!bouquet) {
      alert("Bouquet tidak ditemukan.");
      return;
    }

    // Enhanced: Prevent concurrent operations
    if (this.state.movingBouquetId || this.state.deletingBouquetId || this.state.duplicatingBouquetId) {
      alert("Tunggu hingga operasi sebelumnya selesai.");
      return;
    }

    this.setState({ duplicatingBouquetId: bouquetId });
    try {
      // Enhanced: Add timeout protection
      const duplicatePromise = this.props.onBouquetDuplicate(bouquetId);
      const timeoutPromise = new Promise<void>((_, reject) => 
        setTimeout(() => reject(new Error("Operasi duplikasi timeout")), 30000)
      );

      await Promise.race([duplicatePromise, timeoutPromise]);
    } catch (err) {
      console.error("Failed to duplicate bouquet:", err);
      const errorMessage = err instanceof Error 
        ? (err.message.includes("timeout") ? "Operasi duplikasi timeout. Silakan coba lagi." : err.message)
        : "Gagal menduplikasi bouquet. Silakan coba lagi.";
      alert(errorMessage);
      this.setState({ duplicatingBouquetId: null });
    }
  };

  private getBouquetImageUrl(bouquet: Bouquet): string {
    if (!bouquet.image) return "/images/placeholder-bouquet.jpg";
    if (bouquet.image.startsWith("http")) return bouquet.image;
    return `${API_BASE}${bouquet.image}`;
  }

  /**
   * Render empty state
   */
  private renderEmptyState(): React.ReactNode {
    return (
      <EmptyState
        title="Koleksi kosong"
        description="Belum ada bouquet di koleksi ini."
        icon={
          <PackageIcon width={64} height={64} style={{ opacity: 0.3 }} />
        }
        className={`${this.baseClass}__empty`}
      />
    );
  }

  // Performance: Memoize bouquet card rendering
  private renderBouquetCard(bouquet: Bouquet): React.ReactNode {
    const { movingBouquetId, deletingBouquetId, duplicatingBouquetId, showMoveModal } = this.state;
    const isMoving = movingBouquetId === bouquet._id;
    const isDeleting = deletingBouquetId === bouquet._id;
    const isDuplicating = duplicatingBouquetId === bouquet._id;
    const showMove = showMoveModal === bouquet._id;
    
    // Performance: Cache available collections (only recalculate if collection changes)
    const availableCollections = this.getAvailableCollections();
    
    // Enhanced: Check if any operation is in progress (prevent concurrent operations)
    const isAnyOperationInProgress = !!movingBouquetId || !!deletingBouquetId || !!duplicatingBouquetId;
    const isThisBouquetOperationInProgress = isMoving || isDeleting || isDuplicating;

    return (
      <div key={bouquet._id} className={`${this.baseClass}__cardWrapper`}>
        <article
          className={`${this.baseClass}__card`}
          onClick={() => {
            // Enhanced: Prevent selection during operations
            if (!isAnyOperationInProgress) {
              this.props.onBouquetSelect(bouquet);
            }
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !isAnyOperationInProgress) {
              e.preventDefault();
              this.props.onBouquetSelect(bouquet);
            }
          }}
          style={{
            cursor: isAnyOperationInProgress ? "wait" : "pointer",
            opacity: isThisBouquetOperationInProgress ? 0.6 : 1,
          }}
        >
          <div className={`${this.baseClass}__cardMedia`}>
            <img
              src={this.getBouquetImageUrl(bouquet)}
              alt={formatBouquetName(bouquet.name)}
              className={`${this.baseClass}__cardImage`}
              loading="lazy"
            />
            {(bouquet.isFeatured || bouquet.isNewEdition) && (
              <div className={`${this.baseClass}__cardBadges`}>
                {bouquet.isFeatured && (
                  <span
                    className={`${this.baseClass}__badge ${this.baseClass}__badge--featured`}
                  >
                    Featured
                  </span>
                )}
                {bouquet.isNewEdition && !bouquet.isFeatured && (
                  <span className={`${this.baseClass}__badge ${this.baseClass}__badge--new`}>
                    Baru
                  </span>
                )}
              </div>
            )}
          </div>
          <div className={`${this.baseClass}__cardBody`}>
            <h3 className={`${this.baseClass}__cardTitle`}>{formatBouquetName(bouquet.name)}</h3>
            <div className={`${this.baseClass}__cardPrice`}>{formatIDR(bouquet.price)}</div>
            {(bouquet.type || bouquet.size || bouquet.collectionName) && (
              <div className={`${this.baseClass}__cardTags`}>
                {bouquet.collectionName && (
                  <span className={`${this.baseClass}__tag`}>
                    {formatCollectionName(bouquet.collectionName)}
                  </span>
                )}
                {bouquet.type && (
                  <span className={`${this.baseClass}__tag`}>
                    {formatBouquetType(bouquet.type)}
                  </span>
                )}
                {bouquet.size && (
                  <span className={`${this.baseClass}__tag`}>
                    {formatBouquetSize(bouquet.size)}
                  </span>
                )}
              </div>
            )}
          </div>
        </article>

        <div className={`${this.baseClass}__actions`}>
          <button
            type="button"
            className={`${this.baseClass}__actionBtn ${this.baseClass}__actionBtn--edit`}
            onClick={() => {
              // Enhanced: Prevent edit during operations
              if (!isAnyOperationInProgress) {
                this.props.onBouquetSelect(bouquet);
              }
            }}
            disabled={isAnyOperationInProgress}
            aria-label={`Edit ${bouquet.name}`}
            title="Edit"
          >
            <EditIcon width={16} height={16} />
            Edit
          </button>

          {availableCollections.length > 0 && (
            <div className={`${this.baseClass}__moveWrapper`}>
              {showMove ? (
                <div className={`${this.baseClass}__moveDropdown`}>
                  <DropdownWithModal
                    label="Pindahkan ke"
                    value=""
                    options={availableCollections.map((c) => c.name)}
                    onChange={(value: string) => {
                      const targetCollection = availableCollections.find((c) => c.name === value);
                      if (targetCollection) {
                        void this.handleMove(bouquet._id, targetCollection._id);
                      }
                    }}
                    onAddNew={() => {}}
                    placeholder="Pilih koleksi..."
                    disabled={isMoving}
                    storageKey=""
                  />
                  <button
                    type="button"
                    className={`${this.baseClass}__moveCancel`}
                    onClick={(e) => {
                      e.stopPropagation();
                      this.setState({ showMoveModal: null });
                    }}
                    aria-label="Batal"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={`${this.baseClass}__actionBtn ${this.baseClass}__actionBtn--move`}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Enhanced: Prevent opening move modal during other operations
                    if (!isAnyOperationInProgress) {
                      this.setState({ showMoveModal: bouquet._id });
                    }
                  }}
                  disabled={isMoving || isAnyOperationInProgress}
                  aria-label={`Pindahkan ${bouquet.name}`}
                  title="Pindahkan"
                >
                  <ArrowRightIcon width={16} height={16} />
                  {isMoving ? "Memindahkan..." : "Pindahkan"}
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            className={`${this.baseClass}__actionBtn ${this.baseClass}__actionBtn--duplicate`}
            onClick={(e) => {
              e.stopPropagation();
              // Enhanced: Prevent duplicate during other operations
              if (!isAnyOperationInProgress) {
                void this.handleDuplicate(bouquet._id);
              }
            }}
            disabled={isDuplicating || isAnyOperationInProgress}
            aria-label={`Duplikat ${bouquet.name}`}
            title="Duplikat"
          >
            <CopyIcon width={16} height={16} />
            {isDuplicating ? "Menduplikat..." : "Duplikat"}
          </button>

          <button
            type="button"
            className={`${this.baseClass}__actionBtn ${this.baseClass}__actionBtn--delete`}
            onClick={(e) => {
              e.stopPropagation();
              // Enhanced: Prevent delete during other operations
              if (!isAnyOperationInProgress) {
                void this.handleDelete(bouquet._id);
              }
            }}
            disabled={isDeleting || isAnyOperationInProgress}
            aria-label={`Hapus ${bouquet.name}`}
            title="Hapus"
          >
            <DeleteIcon width={16} height={16} />
            {isDeleting ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    );
  }

  render(): React.ReactNode {
    const { collection, bouquets, onBack } = this.props;

    return (
      <section
        className={this.baseClass}
        aria-label={`Detail koleksi ${collection.name}`}
      >
        <SectionHeader
          title={collection.name}
          subtitle={collection.description}
          stats={
            <span>
              {bouquets.length} {bouquets.length === 1 ? "bouquet" : "bouquets"}
            </span>
          }
          actions={<DownloadPDFButton collectionName={collection.name} bouquets={bouquets} />}
          backButton={{
            onClick: onBack,
            label: "Kembali",
          }}
          className={`${this.baseClass}__header`}
        />

        {bouquets.length === 0 ? (
          this.renderEmptyState()
        ) : (
          <Grid
            minColumnWidth="sm"
            gap="lg"
            className={`${this.baseClass}__grid`}
            ariaLabel={`Menampilkan ${bouquets.length} bouquet dalam koleksi ${collection.name}`}
          >
            {bouquets.map((bouquet) => this.renderBouquetCard(bouquet))}
          </Grid>
        )}
      </section>
    );
  }
}

export default CollectionDetailView;

