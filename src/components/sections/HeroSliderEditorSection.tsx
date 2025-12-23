import React, { useEffect, useMemo, useState } from "react";
import "../../styles/HeroSliderEditorSection.css";

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
  primaryCta: { label: "Shop Collection", href: "/collection" },
  secondaryCta: {
    label: "Order via WhatsApp",
    href: "https://wa.me/6285161428911",
  },
});

const HeroSliderEditorSection: React.FC<Props> = ({ collections, onSaved }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const [heading, setHeading] = useState<string>("New Collections");
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
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);

        const data = (await res.json()) as HeroSliderContent | null;
        if (cancelled) return;

        if (data && Array.isArray(data.slides) && data.slides.length > 0) {
          setHeading(data.heading ?? "New Collections");
          setSlides(data.slides);
        } else {
          setHeading("New Collections");
          setSlides([emptySlide()]);
        }
      } catch (e) {
        if (cancelled) return;
        setError(
          e instanceof Error ? e.message : "Failed to load hero slider data."
        );
        setHeading("New Collections");
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
    if (!slides.length) return "Add at least 1 slide.";

    for (let i = 0; i < slides.length; i++) {
      const s = slides[i];
      if (!s.title.trim()) return `Slide ${i + 1}: title is required.`;
      if (!s.image.trim())
        return `Slide ${i + 1}: image is required (upload or URL/path).`;
      if (!s.primaryCta.label.trim())
        return `Slide ${i + 1}: primary CTA label is required.`;
      if (!s.primaryCta.href.trim())
        return `Slide ${i + 1}: primary CTA link is required.`;
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
      const newSlide = { ...slide, id: uid(), title: `${slide.title} (Copy)` };
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
        [slideId]: "File size must be less than 5MB",
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
        [slideId]: "Please upload a valid image file (JPEG, PNG, WebP, HEIC)",
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
        throw new Error(data?.error || `Upload failed (${res.status})`);
      }

      updateSlide(slideId, { image: data.path });
      setSuccess(`✅ Image uploaded successfully for slide!`);
      setTimeout(() => {
        setSuccess("");
        setUploadProgress((prev) => ({ ...prev, [slideId]: 0 }));
      }, 3000);
    } catch (e) {
      setUploadError((prev) => ({
        ...prev,
        [slideId]: e instanceof Error ? e.message : "Upload failed",
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

      if (!res.ok) throw new Error(`Save failed (${res.status})`);

      setSuccess("✅ Hero slider updated successfully!");

      // Allow parent (Dashboard) to refresh metrics/visitors after saving.
      await Promise.resolve(onSaved?.());

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Auto-hide success message
      setTimeout(() => setSuccess(""), 5000);
    } catch (e) {
      setError(
        `❌ ${e instanceof Error ? e.message : "Failed to save hero slider."}`
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const clearAll = () => {
    if (
      window.confirm(
        "Are you sure you want to remove all slides? This cannot be undone."
      )
    ) {
      setSlides([emptySlide()]);
      setSuccess("All slides cleared. Don't forget to save!");
    }
  };

  return (
    <section className="hsEditor" aria-label="Hero slider editor">
      <header className="hsEditor__header">
        <div>
          <h2 className="hsEditor__title">🌸 Hero Slider</h2>
          <p className="hsEditor__subtitle">
            Configure homepage hero slider with stunning visuals. Drag to
            reorder slides.
          </p>
        </div>

        <div className="hsEditor__headerActions">
          <button
            type="button"
            className="hsEditor__btn hsEditor__btn--ghost"
            onClick={clearAll}
            disabled={loading || slides.length === 0}
            title="Clear all slides"
          >
            Clear All
          </button>

          <button
            type="button"
            className="hsEditor__btn"
            onClick={addSlide}
            disabled={loading}
          >
            + Add Slide
          </button>

          <button
            type="button"
            className="hsEditor__btn hsEditor__btn--primary"
            onClick={save}
            disabled={saving || loading}
            title={validationError ?? "Save changes"}
          >
            {saving ? "Saving..." : "💾 Save"}
          </button>
        </div>
      </header>

      <div className="hsEditor__card">
        <label className="hsField">
          <span className="hsLabel">Heading</span>
          <input
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="e.g. New Collections"
            disabled={loading}
          />
        </label>

        {loading ? (
          <div className="hsState">Loading hero slider…</div>
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
                <p>No slides yet. Click "Add Slide" to get started!</p>
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
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="hsMiniBtn"
                          onClick={() => moveSlide(s.id, "down")}
                          disabled={index === slides.length - 1}
                          title="Move down"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="hsMiniBtn hsMiniBtn--secondary"
                          onClick={() => duplicateSlide(s.id)}
                          title="Duplicate slide"
                        >
                          📋
                        </button>
                        {deleteConfirm === s.id ? (
                          <>
                            <button
                              type="button"
                              className="hsMiniBtn hsMiniBtn--danger"
                              onClick={() => removeSlide(s.id)}
                              title="Confirm delete"
                            >
                              ✓ Confirm
                            </button>
                            <button
                              type="button"
                              className="hsMiniBtn"
                              onClick={() => setDeleteConfirm(null)}
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="hsMiniBtn hsMiniBtn--danger"
                            onClick={() => setDeleteConfirm(s.id)}
                            title="Delete slide"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="hsSlideCard__grid">
                      <label className="hsField hsField--full">
                        <span className="hsLabel">
                          🔗 Link to Collection (Quick Fill)
                        </span>
                        <select
                          value=""
                          onChange={(e) => {
                            const name = e.target.value;
                            if (name) setSlideCollection(s.id, name);
                          }}
                        >
                          <option value="">Select collection…</option>
                          {(collections ?? []).map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="hsField">
                        <span className="hsLabel">Badge (Optional)</span>
                        <input
                          value={s.badge ?? ""}
                          onChange={(e) =>
                            updateSlide(s.id, { badge: e.target.value })
                          }
                          placeholder="e.g. NEW ARRIVAL"
                        />
                      </label>

                      <label className="hsField">
                        <span className="hsLabel">Title *</span>
                        <input
                          value={s.title}
                          onChange={(e) =>
                            updateSlide(s.id, { title: e.target.value })
                          }
                          placeholder="e.g. Orchid Luxe Collection"
                        />
                      </label>

                      <label className="hsField hsField--full">
                        <span className="hsLabel">Subtitle (Optional)</span>
                        <textarea
                          value={s.subtitle ?? ""}
                          onChange={(e) =>
                            updateSlide(s.id, { subtitle: e.target.value })
                          }
                          rows={2}
                          placeholder="Brief description of the collection..."
                        />
                      </label>

                      <label className="hsField hsField--full">
                        <span className="hsLabel">Image * (Upload or URL)</span>

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
                              Uploading... {uploadProgress[s.id] || 0}%
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
                            Or paste URL / path
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
                            <div className="hsPreviewLabel">Preview</div>
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
                                title="Click to zoom"
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
                                <span>Click to zoom</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </label>

                      <div className="hsFieldGroup">
                        <div className="hsGroupTitle">Primary CTA *</div>

                        <label className="hsField">
                          <span className="hsLabel">Label</span>
                          <input
                            value={s.primaryCta.label}
                            onChange={(e) =>
                              updatePrimaryCta(s.id, { label: e.target.value })
                            }
                            placeholder="e.g. Shop Collection"
                          />
                        </label>

                        <label className="hsField">
                          <span className="hsLabel">Link</span>
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
                          Secondary CTA (Optional)
                        </div>

                        <label className="hsField">
                          <span className="hsLabel">Label</span>
                          <input
                            value={s.secondaryCta?.label ?? ""}
                            onChange={(e) =>
                              updateSecondaryCta(s.id, {
                                label: e.target.value,
                              })
                            }
                            placeholder="e.g. Order via WhatsApp"
                          />
                        </label>

                        <label className="hsField">
                          <span className="hsLabel">Link</span>
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
          aria-label="Image preview"
        >
          <div className="hsZoomModal__content">
            <button
              className="hsZoomModal__close"
              onClick={() => setZoomedImage(null)}
              aria-label="Close preview"
            >
              ✕
            </button>
            <img src={zoomedImage} alt="Zoomed preview" />
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSliderEditorSection;
