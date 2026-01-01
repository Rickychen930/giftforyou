/**
 * Collection Detail View Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import type { Collection } from "../../models/domain/collection";
import type { Bouquet } from "../../models/domain/bouquet";
import DropdownWithModal from "../inputs/DropdownWithModal";
import "../../styles/CollectionDetailView.css";
import { API_BASE } from "../../config/api";
import { formatIDR } from "../../utils/money";
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
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
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
 */
class CollectionDetailView extends Component<Props, CollectionDetailViewState> {
  private baseClass: string = "collectionDetailView";

  constructor(props: Props) {
    super(props);
    this.state = {
      movingBouquetId: null,
      deletingBouquetId: null,
      duplicatingBouquetId: null,
      showMoveModal: null,
    };
  }

  private getAvailableCollections(): Collection[] {
    return this.props.allCollections.filter((c) => c._id !== this.props.collection._id);
  }

  private handleMove = async (bouquetId: string, targetCollectionId: string): Promise<void> => {
    this.setState({ movingBouquetId: bouquetId });
    try {
      const success = await this.props.onBouquetMove(bouquetId, targetCollectionId);
      if (success) {
        this.setState({ showMoveModal: null });
      } else {
        alert("Gagal memindahkan bouquet. Silakan coba lagi.");
      }
    } catch (err) {
      console.error("Failed to move bouquet:", err);
      alert("Terjadi kesalahan saat memindahkan bouquet. Silakan coba lagi.");
    } finally {
      this.setState({ movingBouquetId: null });
    }
  };

  private handleDelete = async (bouquetId: string): Promise<void> => {
    const bouquetName =
      this.props.bouquets.find((b) => b._id === bouquetId)?.name || "bouquet ini";
    if (
      !window.confirm(
        `Yakin ingin menghapus "${bouquetName}"? Tindakan ini tidak dapat dibatalkan.`
      )
    ) {
      return;
    }
    this.setState({ deletingBouquetId: bouquetId });
    try {
      await this.props.onBouquetDelete(bouquetId);
    } catch (err) {
      console.error("Failed to delete bouquet:", err);
      alert("Gagal menghapus bouquet. Silakan coba lagi.");
      this.setState({ deletingBouquetId: null });
    }
  };

  private handleDuplicate = async (bouquetId: string): Promise<void> => {
    this.setState({ duplicatingBouquetId: bouquetId });
    try {
      await this.props.onBouquetDuplicate(bouquetId);
    } catch (err) {
      console.error("Failed to duplicate bouquet:", err);
      alert("Gagal menduplikasi bouquet. Silakan coba lagi.");
      this.setState({ duplicatingBouquetId: null });
    }
  };

  private getBouquetImageUrl(bouquet: Bouquet): string {
    if (!bouquet.image) return "/images/placeholder-bouquet.jpg";
    if (bouquet.image.startsWith("http")) return bouquet.image;
    return `${API_BASE}${bouquet.image}`;
  }

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
            d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h3>Koleksi kosong</h3>
        <p>Belum ada bouquet di koleksi ini.</p>
      </div>
    );
  }

  private renderBouquetCard(bouquet: Bouquet): React.ReactNode {
    const { movingBouquetId, deletingBouquetId, duplicatingBouquetId, showMoveModal } = this.state;
    const isMoving = movingBouquetId === bouquet._id;
    const isDeleting = deletingBouquetId === bouquet._id;
    const isDuplicating = duplicatingBouquetId === bouquet._id;
    const showMove = showMoveModal === bouquet._id;
    const availableCollections = this.getAvailableCollections();

    return (
      <div key={bouquet._id} className={`${this.baseClass}__cardWrapper`}>
        <article
          className={`${this.baseClass}__card`}
          onClick={() => this.props.onBouquetSelect(bouquet)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              this.props.onBouquetSelect(bouquet);
            }
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
            onClick={() => this.props.onBouquetSelect(bouquet)}
            aria-label={`Edit ${bouquet.name}`}
            title="Edit"
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
                    this.setState({ showMoveModal: bouquet._id });
                  }}
                  disabled={isMoving}
                  aria-label={`Pindahkan ${bouquet.name}`}
                  title="Pindahkan"
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
                      d="M5 12h14M12 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
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
              void this.handleDuplicate(bouquet._id);
            }}
            disabled={isDuplicating}
            aria-label={`Duplikat ${bouquet.name}`}
            title="Duplikat"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect
                x="9"
                y="9"
                width="13"
                height="13"
                rx="2"
                ry="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            {isDuplicating ? "Menduplikat..." : "Duplikat"}
          </button>

          <button
            type="button"
            className={`${this.baseClass}__actionBtn ${this.baseClass}__actionBtn--delete`}
            onClick={(e) => {
              e.stopPropagation();
              void this.handleDelete(bouquet._id);
            }}
            disabled={isDeleting}
            aria-label={`Hapus ${bouquet.name}`}
            title="Hapus"
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
                d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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
        <header className={`${this.baseClass}__header`}>
          <button
            type="button"
            className={`${this.baseClass}__backBtn`}
            onClick={onBack}
            aria-label="Kembali ke daftar koleksi"
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
                d="M19 12H5M12 19l-7-7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Kembali
          </button>
          <div className={`${this.baseClass}__headerContent`}>
            <h2 className={`${this.baseClass}__title`}>{collection.name}</h2>
            {collection.description && (
              <p className={`${this.baseClass}__description`}>{collection.description}</p>
            )}
            <div className={`${this.baseClass}__stats`}>
              <span>
                {bouquets.length} {bouquets.length === 1 ? "bouquet" : "bouquets"}
              </span>
            </div>
            <div className={`${this.baseClass}__actions`}>
              <DownloadPDFButton collectionName={collection.name} bouquets={bouquets} />
            </div>
          </div>
        </header>

        {bouquets.length === 0 ? (
          this.renderEmptyState()
        ) : (
          <div className={`${this.baseClass}__grid`}>
            {bouquets.map((bouquet) => this.renderBouquetCard(bouquet))}
          </div>
        )}
      </section>
    );
  }
}

export default CollectionDetailView;

