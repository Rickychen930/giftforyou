import React, { useEffect, useMemo, useState } from "react";
import "../../styles/HeroSliderEditorSection.css";

import { API_BASE } from "../../config/api";

type HeroSlide = {
  id: string;
  badge?: string;
  title: string;
  subtitle?: string;
  image: string; // stores "/uploads/hero/....jpg" or full URL
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
}

const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const normalizeImageUrl = (img: string) => {
  const v = (img ?? "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;

  const normalized = v.startsWith("/") ? v : `/${v}`;

  // API_BASE might be "" or "/api" in production -> not a valid base for new URL()
  if (!API_BASE || API_BASE.startsWith("/")) {
    return new URL(normalized, window.location.origin).toString();
  }

  // API_BASE is absolute (e.g. https://api.example.com) -> valid base
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

const HeroSliderEditorSection: React.FC<Props> = ({ collections }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const [heading, setHeading] = useState<string>("New Collections");
  const [slides, setSlides] = useState<HeroSlide[]>([]);

  // per-slide upload state
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadError, setUploadError] = useState<Record<string, string>>({});

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

  const removeSlide = (id: string) =>
    setSlides((prev) => prev.filter((s) => s.id !== id));
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

  // Upload image file for a slide
  const uploadSlideImage = async (slideId: string, file: File) => {
    setUploadError((prev) => ({ ...prev, [slideId]: "" }));
    setUploading((prev) => ({ ...prev, [slideId]: true }));

    try {
      const fd = new FormData();
      fd.append("image", file);

      const res = await fetch(`${API_BASE}/api/hero-slider/home/upload`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `Upload failed (${res.status})`);
      }

      // backend returns { path: "/uploads/hero/..." }
      updateSlide(slideId, { image: data.path });
    } catch (e) {
      setUploadError((prev) => ({
        ...prev,
        [slideId]: e instanceof Error ? e.message : "Upload failed",
      }));
    } finally {
      setUploading((prev) => ({ ...prev, [slideId]: false }));
    }
  };

  const save = async () => {
    setSuccess("");
    setError("");

    if (validationError) {
      setError(validationError);
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
      setSuccess("Hero slider updated successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save hero slider.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="hsEditor" aria-label="Hero slider editor">
      <header className="hsEditor__header">
        <div>
          <h2 className="hsEditor__title">Hero Slider</h2>
          <p className="hsEditor__subtitle">
            Configure homepage hero slider (heading + slides). Upload images per
            slide.
          </p>
        </div>

        <div className="hsEditor__headerActions">
          <button type="button" className="hsEditor__btn" onClick={addSlide}>
            + Add Slide
          </button>

          <button
            type="button"
            className="hsEditor__btn hsEditor__btn--primary"
            onClick={save}
            disabled={saving || loading}
            title={validationError ?? "Save changes"}
          >
            {saving ? "Saving..." : "Save"}
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

            <div className="hsSlides">
              {slides.map((s, index) => (
                <article
                  key={s.id}
                  className="hsSlideCard"
                  aria-label={`Slide ${index + 1}`}
                >
                  <div className="hsSlideCard__top">
                    <div className="hsSlideCard__meta">
                      <div className="hsSlideCard__index">
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
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="hsMiniBtn"
                        onClick={() => moveSlide(s.id, "down")}
                        disabled={index === slides.length - 1}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="hsMiniBtn hsMiniBtn--danger"
                        onClick={() => removeSlide(s.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="hsSlideCard__grid">
                    <label className="hsField hsField--full">
                      <span className="hsLabel">
                        Link slide to existing collection (helper)
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
                      <span className="hsLabel">Badge</span>
                      <input
                        value={s.badge ?? ""}
                        onChange={(e) =>
                          updateSlide(s.id, { badge: e.target.value })
                        }
                      />
                    </label>

                    <label className="hsField">
                      <span className="hsLabel">Title *</span>
                      <input
                        value={s.title}
                        onChange={(e) =>
                          updateSlide(s.id, { title: e.target.value })
                        }
                      />
                    </label>

                    <label className="hsField hsField--full">
                      <span className="hsLabel">Subtitle</span>
                      <textarea
                        value={s.subtitle ?? ""}
                        onChange={(e) =>
                          updateSlide(s.id, { subtitle: e.target.value })
                        }
                        rows={2}
                      />
                    </label>

                    <label className="hsField hsField--full">
                      <span className="hsLabel">Image *</span>

                      <input
                        type="file"
                        accept="image/*,.heic,.heif"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadSlideImage(s.id, file);
                        }}
                      />

                      {uploading[s.id] && (
                        <div className="hsState">Uploading image…</div>
                      )}
                      {uploadError[s.id] && (
                        <div className="hsAlert hsAlert--error">
                          {uploadError[s.id]}
                        </div>
                      )}

                      <div style={{ marginTop: "0.5rem" }}>
                        <span
                          className="hsLabel"
                          style={{ display: "block", marginBottom: "0.35rem" }}
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

                      <div className="hsPreviewRow">
                        <div className="hsPreviewLabel">Preview</div>
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
                        />
                      </div>
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
                        />
                      </label>

                      <label className="hsField">
                        <span className="hsLabel">Link</span>
                        <input
                          value={s.primaryCta.href}
                          onChange={(e) =>
                            updatePrimaryCta(s.id, { href: e.target.value })
                          }
                        />
                      </label>
                    </div>

                    <div className="hsFieldGroup">
                      <div className="hsGroupTitle">
                        Secondary CTA (optional)
                      </div>

                      <label className="hsField">
                        <span className="hsLabel">Label</span>
                        <input
                          value={s.secondaryCta?.label ?? ""}
                          onChange={(e) =>
                            updateSecondaryCta(s.id, { label: e.target.value })
                          }
                        />
                      </label>

                      <label className="hsField">
                        <span className="hsLabel">Link</span>
                        <input
                          value={s.secondaryCta?.href ?? ""}
                          onChange={(e) =>
                            updateSecondaryCta(s.id, { href: e.target.value })
                          }
                        />
                      </label>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default HeroSliderEditorSection;
