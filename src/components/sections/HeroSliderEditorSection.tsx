import React, { useEffect, useMemo, useState } from "react";
import "../../styles/HeroSliderEditorSection.css";
import { STORE_PROFILE } from "../../config/store-profile";

import { API_BASE } from "../../config/api";

type HeroSlide = {
  id: string;
  badge?: string;
  title: string;
  subtitle?: string;
  image: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

type HeroSliderContent = {
  key?: string;
  heading?: string;
  slides: HeroSlide[];
};

interface Props {
  collections: string[];
  onSaved?: () => void | Promise<void>;
}

const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const normalizeImageUrl = (img: string) => {
  const v = (img ?? "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;

  const normalized = v.startsWith("/") ? v : `/${v}`;

  if (!API_BASE || API_BASE.startsWith("/")) {
    return new URL(normalized, window.location.origin).toString();
  }

  return new URL(normalized, API_BASE).toString();
};

const buildCollectionHref = (collectionName: string) =>
  `/collection?name=${encodeURIComponent(collectionName)}`;

const emptySlide = (): HeroSlide => ({
  id: uid(),
  badge: "",
  title: "",
  subtitle: "",
  image: "",
  primaryCta: { label: "Lihat koleksi", href: "/collection" },
  secondaryCta: {
    label: "Pesan via WhatsApp",
    href: STORE_PROFILE.whatsapp.url,
  },
});

const HeroSliderEditorSection: React.FC<Props> = ({ collections, onSaved }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const [heading, setHeading] = useState<string>("Koleksi Terbaru");
  const [slides, setSlides] = useState<HeroSlide[]>([]);

  // Per-slide upload state with progress
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [uploadError, setUploadError] = useState<Record<string, string>>({});

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Image zoom preview
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const res = await fetch(`${API_BASE}/api/hero-slider/home`);
        if (!res.ok) throw new Error(`Gagal memuat (${res.status})`);

        const data = (await res.json()) as HeroSliderContent | null;
        if (cancelled) return;

        if (data && Array.isArray(data.slides) && data.slides.length > 0) {
          setHeading(data.heading ?? "Koleksi Terbaru");
          setSlides(data.slides);
        } else {
          setHeading("Koleksi Terbaru");
          setSlides([emptySlide()]);
        }
      } catch (e) {
        if (cancelled) return;
        setError(
          e instanceof Error ? e.message : "Gagal memuat data slider hero."
        );
        setHeading("Koleksi Terbaru");
        setSlides([emptySlide()]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const validationError = useMemo(() => {
    if (!slides.length) return "Tambahkan minimal 1 slide.";

    for (let i = 0; i < slides.length; i++) {
      const s = slides[i];
      if (!s.title.trim()) return `Slide ${i + 1}: judul wajib diisi.`;
      if (!s.image.trim())
        return `Slide ${i + 1}: gambar wajib diisi (unggah atau URL/path).`;
      if (!s.primaryCta.label.trim())
        return `Slide ${i + 1}: label CTA utama wajib diisi.`;
      if (!s.primaryCta.href.trim())
        return `Slide ${i + 1}: tautan CTA utama wajib diisi.`;
    }
    return null;
  }, [slides]);

  const updateSlide = (id: string, patch: Partial<HeroSlide>) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  };

  const updatePrimaryCta = (
    id: string,
    patch: Partial<HeroSlide["primaryCta"]>
  ) => {
    setSlides((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, primaryCta: { ...s.primaryCta, ...patch } } : s
      )
    );
  };

  const updateSecondaryCta = (
    id: string,
    patch: Partial<NonNullable<HeroSlide["secondaryCta"]>>
  ) => {
    setSlides((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const current = s.secondaryCta ?? { label: "", href: "" };
        return { ...s, secondaryCta: { ...current, ...patch } };
      })
    );
  };

  const removeSlide = (id: string) => {
    setSlides((prev) => prev.filter((s) => s.id !== id));
    setDeleteConfirm(null);
  };

  const duplicateSlide = (id: string) => {
    setSlides((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const slide = prev[idx];
      const newSlide = { ...slide, id: uid(), title: `${slide.title} (Salinan)` };
      return [...prev.slice(0, idx + 1), newSlide, ...prev.slice(idx + 1)];
    });
  };

  const addSlide = () => setSlides((prev) => [...prev, emptySlide()]);

  const moveSlide = (id: string, direction: "up" | "down") => {
    setSlides((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0) return prev;

      const next = [...prev];
      const target = direction === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= next.length) return prev;

      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    setSlides((prev) => {
      const next = [...prev];
      const [removed] = next.splice(draggedIndex, 1);
      next.splice(dropIndex, 0, removed);
      return next;
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const setSlideCollection = (slideId: string, collectionName: string) => {
    const href = buildCollectionHref(collectionName);
    setSlides((prev) =>
      prev.map((s) =>
        s.id === slideId
          ? {
              ...s,
              title: s.title.trim() ? s.title : collectionName,
              primaryCta: { ...s.primaryCta, href },
            }
          : s
      )
    );
  };

  const uploadSlideImage = async (slideId: string, file: File) => {
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError((prev) => ({
        ...prev,
        [slideId]: "Ukuran file harus kurang dari 5MB",
      }));
      return;
    }

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ];
    if (!validTypes.includes(file.type)) {
      setUploadError((prev) => ({
        ...prev,
        [slideId]: "Silakan unggah file gambar yang valid (JPEG, PNG, WebP, HEIC)",
      }));
      return;
    }

    setUploadError((prev) => ({ ...prev, [slideId]: "" }));
    setUploading((prev) => ({ ...prev, [slideId]: true }));
    setUploadProgress((prev) => ({ ...prev, [slideId]: 0 }));

    try {
      const fd = new FormData();
      fd.append("image", file);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const current = prev[slideId] || 0;
          if (current < 90) {
            return { ...prev, [slideId]: current + 10 };
          }
          return prev;
        });
      }, 200);

      const res = await fetch(`${API_BASE}/api/hero-slider/home/upload`, {
        method: "POST",
        body: fd,
      });

      clearInterval(progressInterval);
      setUploadProgress((prev) => ({ ...prev, [slideId]: 100 }));

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `Unggah gagal (${res.status})`);
      }

      updateSlide(slideId, { image: data.path });
      setSuccess(`✅ Gambar berhasil diunggah untuk slide ini!`);
      setTimeout(() => {
        setSuccess("");
        setUploadProgress((prev) => ({ ...prev, [slideId]: 0 }));
      }, 3000);
    } catch (e) {
      setUploadError((prev) => ({
        ...prev,
        [slideId]: e instanceof Error ? e.message : "Unggah gagal",
      }));
      setUploadProgress((prev) => ({ ...prev, [slideId]: 0 }));
    } finally {
      setUploading((prev) => ({ ...prev, [slideId]: false }));
    }
  };

  const save = async () => {
    setSuccess("");
    setError("");

    if (validationError) {
      setError(`❌ ${validationError}`);
      // Scroll to error
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setSaving(true);

      const payload: HeroSliderContent = {
        heading: heading.trim(),
        slides: slides.map((s) => {
          const sec = s.secondaryCta;
          const secLabel = (sec?.label ?? "").trim();
          const secHref = (sec?.href ?? "").trim();
          const hasSecondary = secLabel.length > 0 || secHref.length > 0;

          return {
            id: s.id,
            badge: (s.badge ?? "").trim(),
            title: s.title.trim(),
            subtitle: (s.subtitle ?? "").trim(),
            image: s.image.trim(),
            primaryCta: {
              label: s.primaryCta.label.trim(),
              href: s.primaryCta.href.trim(),
            },
            secondaryCta: hasSecondary
              ? { label: secLabel, href: secHref }
              : undefined,
          };
        }),
      };

      const res = await fetch(`${API_BASE}/api/hero-slider/home`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Gagal menyimpan (${res.status})`);

      setSuccess("✅ Hero slider updated successfully!");

      // Allow parent (Dashboard) to refresh metrics/visitors after saving.
      await Promise.resolve(onSaved?.());

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Auto-hide success message
      setTimeout(() => setSuccess(""), 5000);
    } catch (e) {
      setError(
        `❌ ${e instanceof Error ? e.message : "Gagal menyimpan slider hero."}`
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const clearAll = () => {
    if (
      window.confirm(
        "Yakin ingin menghapus semua slide? Tindakan ini tidak bisa dibatalkan."
      )
    ) {
      setSlides([emptySlide()]);
      setSuccess("Semua slide dihapus. Jangan lupa simpan!");
    }
  };

  return (
    <section className="hsEditor" aria-label="Editor slider hero">
      <header className="hsEditor__header">
        <div>
          <h2 className="hsEditor__title">🌸 Slider Hero</h2>
          <p className="hsEditor__subtitle">
            Atur slider hero di homepage. Seret untuk mengubah urutan slide.
          </p>
        </div>

        <div className="hsEditor__headerActions">
          <button
            type="button"
            className="hsEditor__btn hsEditor__btn--ghost"
            onClick={clearAll}
            disabled={loading || slides.length === 0}
            title="Hapus semua slide"
          >
            Hapus Semua
          </button>

          <button
            type="button"
            className="hsEditor__btn"
            onClick={addSlide}
            disabled={loading}
          >
            + Tambah Slide
          </button>

          <button
            type="button"
            className="hsEditor__btn hsEditor__btn--primary"
            onClick={save}
            disabled={saving || loading}
            title={validationError ?? "Simpan perubahan"}
          >
            {saving ? "Menyimpan..." : "💾 Simpan"}
          </button>
        </div>
      </header>

      <div className="hsEditor__card">
        <label className="hsField">
          <span className="hsLabel">Judul</span>
          <input
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="mis. Koleksi Terbaru"
            disabled={loading}
          />
        </label>

        {loading ? (
          <div className="hsState">Memuat slider hero…</div>
        ) : (
          <>
            {error && <div className="hsAlert hsAlert--error">{error}</div>}
            {success && (
              <div className="hsAlert hsAlert--success">{success}</div>
            )}

            {slides.length === 0 ? (
              <div className="hsEmpty">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2s2 3.5 5 4 4.5 1.8 4 4-2.2 4.2-4 5-4 1-5 4c0 0-2-3.5-5-4s-4.5-1.8-4-4 2.2-4.2 4-5 4-1 5-4z"
                    fill="currentColor"
                    opacity="0.2"
                  />
                </svg>
                <p>Belum ada slide. Klik "Tambah Slide" untuk memulai!</p>
              </div>
            ) : (
              <div className="hsSlides">
                {slides.map((s, index) => (
                  <article
                    key={s.id}
                    className={`hsSlideCard ${
                      draggedIndex === index ? "hsSlideCard--dragging" : ""
                    } ${
                      dragOverIndex === index ? "hsSlideCard--dragover" : ""
                    }`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    aria-label={`Slide ${index + 1}`}
                  >
                    <div className="hsSlideCard__top">
                      <div className="hsSlideCard__meta">
                        <div className="hsSlideCard__index">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="hsSlideCard__dragIcon"
                          >
                            <path
                              d="M9 5h2v2H9V5zm0 6h2v2H9v-2zm0 6h2v2H9v-2zm4-12h2v2h-2V5zm0 6h2v2h-2v-2zm0 6h2v2h-2v-2z"
                              fill="currentColor"
                            />
                          </svg>
                          Slide {index + 1}
                        </div>
                        <div className="hsSlideCard__id">ID: {s.id}</div>
                      </div>

                      <div className="hsSlideCard__actions">
                        <button
                          type="button"
                          className="hsMiniBtn"
                          onClick={() => moveSlide(s.id, "up")}
                          disabled={index === 0}
                          title="Geser ke atas"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="hsMiniBtn"
                          onClick={() => moveSlide(s.id, "down")}
                          disabled={index === slides.length - 1}
                          title="Geser ke bawah"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="hsMiniBtn hsMiniBtn--secondary"
                          onClick={() => duplicateSlide(s.id)}
                          title="Duplikat slide"
                        >
                          📋
                        </button>
                        {deleteConfirm === s.id ? (
                          <>
                            <button
                              type="button"
                              className="hsMiniBtn hsMiniBtn--danger"
                              onClick={() => removeSlide(s.id)}
                              title="Konfirmasi hapus"
                            >
                              ✓ Ya, hapus
                            </button>
                            <button
                              type="button"
                              className="hsMiniBtn"
                              onClick={() => setDeleteConfirm(null)}
                              title="Batal"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="hsMiniBtn hsMiniBtn--danger"
                            onClick={() => setDeleteConfirm(s.id)}
                            title="Hapus slide"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="hsSlideCard__grid">
                      <label className="hsField hsField--full">
                        <span className="hsLabel">
                          🔗 Tautkan ke Koleksi (Isi Cepat)
                        </span>
                        <select
                          value=""
                          onChange={(e) => {
                            const name = e.target.value;
                            if (name) setSlideCollection(s.id, name);
                          }}
                        >
                          <option value="">Pilih koleksi…</option>
                          {(collections ?? []).map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="hsField">
                        <span className="hsLabel">Badge (Opsional)</span>
                        <input
                          value={s.badge ?? ""}
                          onChange={(e) =>
                            updateSlide(s.id, { badge: e.target.value })
                          }
                          placeholder="mis. NEW ARRIVAL"
                        />
                      </label>

                      <label className="hsField">
                        <span className="hsLabel">Judul *</span>
                        <input
                          value={s.title}
                          onChange={(e) =>
                            updateSlide(s.id, { title: e.target.value })
                          }
                          placeholder="mis. Orchid Luxe Collection"
                        />
                      </label>

                      <label className="hsField hsField--full">
                        <span className="hsLabel">Subjudul (Opsional)</span>
                        <textarea
                          value={s.subtitle ?? ""}
                          onChange={(e) =>
                            updateSlide(s.id, { subtitle: e.target.value })
                          }
                          rows={2}
                          placeholder="Deskripsi singkat koleksi..."
                        />
                      </label>

                      <label className="hsField hsField--full">
                        <span className="hsLabel">Gambar * (Unggah atau URL)</span>

                        <input
                          type="file"
                          accept="image/*,.heic,.heif"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadSlideImage(s.id, file);
                          }}
                          disabled={uploading[s.id]}
                        />

                        {uploading[s.id] && (
                          <div className="hsUploadProgress">
                            <div className="hsUploadProgress__bar">
                              <div
                                className="hsUploadProgress__fill"
                                style={{
                                  width: `${uploadProgress[s.id] || 0}%`,
                                }}
                              />
                            </div>
                            <div className="hsUploadProgress__text">
                              Mengunggah... {uploadProgress[s.id] || 0}%
                            </div>
                          </div>
                        )}
                        {uploadError[s.id] && (
                          <div className="hsAlert hsAlert--error hsAlert--small">
                            {uploadError[s.id]}
                          </div>
                        )}

                        <div style={{ marginTop: "0.5rem" }}>
                          <span
                            className="hsLabel"
                            style={{
                              display: "block",
                              marginBottom: "0.35rem",
                            }}
                          >
                            Atau tempel URL / path
                          </span>
                          <input
                            value={s.image}
                            onChange={(e) =>
                              updateSlide(s.id, { image: e.target.value })
                            }
                            placeholder="/uploads/hero/xxx.jpg or https://..."
                          />
                        </div>

                        {s.image && (
                          <div className="hsPreviewRow">
                            <div className="hsPreviewLabel">Pratinjau</div>
                            <div className="hsPreviewWrapper">
                              <img
                                className="hsPreview"
                                src={
                                  normalizeImageUrl(s.image) ||
                                  "/images/placeholder-bouquet.jpg"
                                }
                                alt={s.title || `Slide ${index + 1}`}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src =
                                    "/images/placeholder-bouquet.jpg";
                                }}
                                onClick={() =>
                                  setZoomedImage(
                                    normalizeImageUrl(s.image) ||
                                      "/images/placeholder-bouquet.jpg"
                                  )
                                }
                                style={{ cursor: "pointer" }}
                                title="Klik untuk memperbesar"
                              />
                              <div className="hsPreviewOverlay">
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle
                                    cx="11"
                                    cy="11"
                                    r="8"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  />
                                  <path
                                    d="M21 21l-4.35-4.35"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                  />
                                  <path
                                    d="M11 8v6M8 11h6"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <span>Klik untuk memperbesar</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </label>

                      <div className="hsFieldGroup">
                        <div className="hsGroupTitle">CTA Utama *</div>

                        <label className="hsField">
                          <span className="hsLabel">Teks</span>
                          <input
                            value={s.primaryCta.label}
                            onChange={(e) =>
                              updatePrimaryCta(s.id, { label: e.target.value })
                            }
                            placeholder="mis. Lihat koleksi"
                          />
                        </label>

                        <label className="hsField">
                          <span className="hsLabel">Tautan</span>
                          <input
                            value={s.primaryCta.href}
                            onChange={(e) =>
                              updatePrimaryCta(s.id, { href: e.target.value })
                            }
                            placeholder="/collection or https://..."
                          />
                        </label>
                      </div>

                      <div className="hsFieldGroup">
                        <div className="hsGroupTitle">
                          CTA Kedua (Opsional)
                        </div>

                        <label className="hsField">
                          <span className="hsLabel">Teks</span>
                          <input
                            value={s.secondaryCta?.label ?? ""}
                            onChange={(e) =>
                              updateSecondaryCta(s.id, {
                                label: e.target.value,
                              })
                            }
                            placeholder="mis. Pesan via WhatsApp"
                          />
                        </label>

                        <label className="hsField">
                          <span className="hsLabel">Tautan</span>
                          <input
                            value={s.secondaryCta?.href ?? ""}
                            onChange={(e) =>
                              updateSecondaryCta(s.id, { href: e.target.value })
                            }
                            placeholder="https://wa.me/..."
                          />
                        </label>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Image zoom modal */}
      {zoomedImage && (
        <div
          className="hsZoomModal"
          onClick={() => setZoomedImage(null)}
          role="dialog"
          aria-label="Pratinjau gambar"
        >
          <div className="hsZoomModal__content">
            <button
              className="hsZoomModal__close"
              onClick={() => setZoomedImage(null)}
              aria-label="Tutup pratinjau"
            >
              ✕
            </button>
            <img src={zoomedImage} alt="Pratinjau diperbesar" />
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSliderEditorSection;
