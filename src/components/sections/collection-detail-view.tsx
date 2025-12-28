import React, { useState } from "react";
import type { Collection } from "../../models/domain/collection";
import type { Bouquet } from "../../models/domain/bouquet";
import DropdownWithModal from "../DropdownWithModal";
import "../../styles/CollectionDetailView.css";
import { API_BASE } from "../../config/api";
import { formatIDR } from "../../utils/money";
import { formatBouquetName, formatBouquetType, formatBouquetSize, formatCollectionName } from "../../utils/text-formatter";
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

// Download PDF Button Component
const DownloadPDFButton: React.FC<{
  collectionName: string;
  bouquets: Bouquet[];
}> = ({ collectionName, bouquets }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleDownload = async (withWatermark: boolean) => {
    if (bouquets.length === 0) {
      alert("Tidak ada bouquet untuk diunduh.");
      return;
    }

    setIsGenerating(true);
    setShowOptions(false);

    try {
      // Add timeout protection (60 seconds for collection PDF)
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
      // eslint-disable-next-line no-console
      console.error("Failed to generate PDF:", err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Gagal menghasilkan PDF. Silakan coba lagi.";
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="collectionDetailView__downloadWrapper" style={{ position: "relative", marginTop: "1rem", zIndex: 10000, isolation: "isolate" }}>
      <button
        type="button"
        className="collectionDetailView__downloadBtn"
        onClick={() => setShowOptions(!showOptions)}
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
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "linear-gradient(135deg, rgba(212, 140, 156, 0.2) 0%, rgba(168, 213, 186, 0.2) 100%)";
          e.currentTarget.style.borderColor = "rgba(212, 140, 156, 0.5)";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "linear-gradient(135deg, rgba(212, 140, 156, 0.12) 0%, rgba(168, 213, 186, 0.12) 100%)";
          e.currentTarget.style.borderColor = "rgba(212, 140, 156, 0.3)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.05)";
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
          {/* Backdrop to close popup when clicking outside */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10002,
              background: "transparent",
            }}
            onClick={() => setShowOptions(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              marginTop: "0.5rem",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)",
              border: "2px solid rgba(212, 140, 156, 0.3)",
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)",
              zIndex: 10003,
              display: "flex",
              flexDirection: "column",
              minWidth: "200px",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
          <button
            type="button"
            onClick={() => handleDownload(false)}
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
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(212, 140, 156, 0.12) 0%, rgba(168, 213, 186, 0.08) 100%)";
              e.currentTarget.style.color = "var(--brand-rose-700)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--ink-800)";
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Tanpa Watermark
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleDownload(true)}
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
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(212, 140, 156, 0.12) 0%, rgba(168, 213, 186, 0.08) 100%)";
              e.currentTarget.style.color = "var(--brand-rose-700)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--ink-800)";
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Dengan Watermark
            </span>
          </button>
          </div>
        </>
      )}
    </div>
  );
};

const CollectionDetailView: React.FC<Props> = ({
  collection,
  bouquets,
  allCollections,
  onBack,
  onBouquetSelect,
  onBouquetMove,
  onBouquetDelete,
  onBouquetDuplicate,
}) => {
  const [movingBouquetId, setMovingBouquetId] = useState<string | null>(null);
  const [deletingBouquetId, setDeletingBouquetId] = useState<string | null>(null);
  const [duplicatingBouquetId, setDuplicatingBouquetId] = useState<string | null>(null);
  const [showMoveModal, setShowMoveModal] = useState<string | null>(null);

  const handleMove = async (bouquetId: string, targetCollectionId: string): Promise<void> => {
    setMovingBouquetId(bouquetId);
    try {
      const success = await onBouquetMove(bouquetId, targetCollectionId);
      if (success) {
        setShowMoveModal(null);
        // Show success feedback (could be enhanced with toast notification)
      } else {
        alert("Gagal memindahkan bouquet. Silakan coba lagi.");
      }
    } catch (err) {
      console.error("Failed to move bouquet:", err);
      alert("Terjadi kesalahan saat memindahkan bouquet. Silakan coba lagi.");
    } finally {
      setMovingBouquetId(null);
    }
  };

  const handleDelete = async (bouquetId: string): Promise<void> => {
    const bouquetName = bouquets.find((b) => b._id === bouquetId)?.name || "bouquet ini";
    if (!window.confirm(`Yakin ingin menghapus "${bouquetName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }
    setDeletingBouquetId(bouquetId);
    try {
      await onBouquetDelete(bouquetId);
      // Success feedback is handled by parent component
    } catch (err) {
      console.error("Failed to delete bouquet:", err);
      alert("Gagal menghapus bouquet. Silakan coba lagi.");
      setDeletingBouquetId(null);
    }
  };

  const handleDuplicate = async (bouquetId: string): Promise<void> => {
    setDuplicatingBouquetId(bouquetId);
    try {
      await onBouquetDuplicate(bouquetId);
      // Success feedback is handled by parent component
    } catch (err) {
      console.error("Failed to duplicate bouquet:", err);
      alert("Gagal menduplikasi bouquet. Silakan coba lagi.");
      setDuplicatingBouquetId(null);
    }
  };

  const availableCollections = allCollections.filter(
    (c) => c._id !== collection._id
  );

  return (
    <section className="collectionDetailView" aria-label={`Detail koleksi ${collection.name}`}>
      <header className="collectionDetailView__header">
        <button
          type="button"
          className="collectionDetailView__backBtn"
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
        <div className="collectionDetailView__headerContent">
          <h2 className="collectionDetailView__title">{collection.name}</h2>
          {collection.description && (
            <p className="collectionDetailView__description">
              {collection.description}
            </p>
          )}
          <div className="collectionDetailView__stats">
            <span>
              {bouquets.length} {bouquets.length === 1 ? "bouquet" : "bouquets"}
            </span>
          </div>
          <div className="collectionDetailView__actions">
            <DownloadPDFButton
              collectionName={collection.name}
              bouquets={bouquets}
            />
          </div>
        </div>
      </header>

      {bouquets.length === 0 ? (
        <div className="collectionDetailView__empty" role="status">
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
      ) : (
        <div className="collectionDetailView__grid">
          {bouquets.map((bouquet) => {
            const isMoving = movingBouquetId === bouquet._id;
            const isDeleting = deletingBouquetId === bouquet._id;
            const isDuplicating = duplicatingBouquetId === bouquet._id;
            const showMove = showMoveModal === bouquet._id;

            return (
              <div key={bouquet._id} className="collectionDetailView__cardWrapper">
                <article
                  className="collectionDetailView__card"
                  onClick={() => onBouquetSelect(bouquet)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onBouquetSelect(bouquet);
                    }
                  }}
                >
                  <div className="collectionDetailView__cardMedia">
                    <img
                      src={
                        bouquet.image
                          ? bouquet.image.startsWith("http")
                            ? bouquet.image
                            : `${API_BASE}${bouquet.image}`
                          : "/images/placeholder-bouquet.jpg"
                      }
                      alt={formatBouquetName(bouquet.name)}
                      className="collectionDetailView__cardImage"
                      loading="lazy"
                    />
                    {(bouquet.isFeatured || bouquet.isNewEdition) && (
                      <div className="collectionDetailView__cardBadges">
                        {bouquet.isFeatured && (
                          <span className="collectionDetailView__badge collectionDetailView__badge--featured">
                            Featured
                          </span>
                        )}
                        {bouquet.isNewEdition && !bouquet.isFeatured && (
                          <span className="collectionDetailView__badge collectionDetailView__badge--new">
                            Baru
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="collectionDetailView__cardBody">
                    <h3 className="collectionDetailView__cardTitle">
                      {formatBouquetName(bouquet.name)}
                    </h3>
                    <div className="collectionDetailView__cardPrice">
                      {formatIDR(bouquet.price)}
                    </div>
                    {(bouquet.type || bouquet.size || bouquet.collectionName) && (
                      <div className="collectionDetailView__cardTags">
                        {bouquet.collectionName && (
                          <span className="collectionDetailView__tag">
                            {formatCollectionName(bouquet.collectionName)}
                          </span>
                        )}
                        {bouquet.type && (
                          <span className="collectionDetailView__tag">
                            {formatBouquetType(bouquet.type)}
                          </span>
                        )}
                        {bouquet.size && (
                          <span className="collectionDetailView__tag">
                            {formatBouquetSize(bouquet.size)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </article>

                <div className="collectionDetailView__actions">
                  <button
                    type="button"
                    className="collectionDetailView__actionBtn collectionDetailView__actionBtn--edit"
                    onClick={() => onBouquetSelect(bouquet)}
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
                    <div className="collectionDetailView__moveWrapper">
                      {showMove ? (
                        <div className="collectionDetailView__moveDropdown">
                          <DropdownWithModal
                            label="Pindahkan ke"
                            value=""
                            options={availableCollections.map((c) => c.name)}
                            onChange={(value) => {
                              const targetCollection = availableCollections.find(
                                (c) => c.name === value
                              );
                              if (targetCollection) {
                                handleMove(bouquet._id, targetCollection._id);
                              }
                            }}
                            onAddNew={() => {}}
                            placeholder="Pilih koleksi..."
                            disabled={isMoving}
                            storageKey=""
                          />
                          <button
                            type="button"
                            className="collectionDetailView__moveCancel"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMoveModal(null);
                            }}
                            aria-label="Batal"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="collectionDetailView__actionBtn collectionDetailView__actionBtn--move"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMoveModal(bouquet._id);
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
                    className="collectionDetailView__actionBtn collectionDetailView__actionBtn--duplicate"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicate(bouquet._id);
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
                    className="collectionDetailView__actionBtn collectionDetailView__actionBtn--delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(bouquet._id);
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
          })}
        </div>
      )}
    </section>
  );
};

export default CollectionDetailView;

