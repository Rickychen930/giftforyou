/**
 * Hero Slider Editor Section Component (OOP)
 * Class-based component following SOLID principles
 */

/**
 * Hero Slider Editor Section Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/HeroSliderEditorSection.css";
import { STORE_PROFILE } from "../../config/store-profile";
import { API_BASE } from "../../config/api";
import EmptyState from "../../components/common/EmptyState";
import AlertMessage from "../../components/common/AlertMessage";
// Reusable form components - used in renderSlideCard (line 515+) and render (line 952+)
import TextInput from "../../components/inputs/TextInput";
import TextareaInput from "../../components/inputs/TextareaInput";
import HeroImageUpload from "../../components/hero/HeroImageUpload";
import FormField from "../../components/inputs/FormField";

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

interface HeroSliderEditorSectionState {
  loading: boolean;
  saving: boolean;
  error: string;
  success: string;
  heading: string;
  slides: HeroSlide[];
  uploading: Record<string, boolean>;
  uploadProgress: Record<string, number>;
  uploadError: Record<string, string>;
  draggedIndex: number | null;
  dragOverIndex: number | null;
  deleteConfirm: string | null;
  zoomedImage: string | null;
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

/**
 * Hero Slider Editor Section Component
 * Class-based component for hero slider editor
 */
class HeroSliderEditorSection extends Component<Props, HeroSliderEditorSectionState> {
  private baseClass: string = "hsEditor";
  private keyboardHandler: ((e: KeyboardEvent) => void) | null = null;
  private uploadProgressIntervals: Record<string, NodeJS.Timeout> = {};
  private successTimeout: NodeJS.Timeout | null = null;
  private cancelled: boolean = false;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      saving: false,
      error: "",
      success: "",
      heading: "Koleksi Terbaru",
      slides: [],
      uploading: {},
      uploadProgress: {},
      uploadError: {},
      draggedIndex: null,
      dragOverIndex: null,
      deleteConfirm: null,
      zoomedImage: null,
    };
  }

  componentDidMount(): void {
    this.loadData();
  }

  componentDidUpdate(prevProps: Props, prevState: HeroSliderEditorSectionState): void {
    // Setup keyboard handler for zoomed image
    if (this.state.zoomedImage && !prevState.zoomedImage) {
      this.setupKeyboardHandler();
    } else if (!this.state.zoomedImage && prevState.zoomedImage) {
      this.cleanupKeyboardHandler();
    }
  }

  componentWillUnmount(): void {
    this.cancelled = true;
    this.cleanupKeyboardHandler();
    this.cleanupUploadIntervals();
    if (this.successTimeout) {
      clearTimeout(this.successTimeout);
    }
  }

  private setupKeyboardHandler(): void {
    this.keyboardHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        this.setState({ zoomedImage: null });
      }
    };
    window.addEventListener("keydown", this.keyboardHandler);
  }

  private cleanupKeyboardHandler(): void {
    if (this.keyboardHandler) {
      window.removeEventListener("keydown", this.keyboardHandler);
      this.keyboardHandler = null;
    }
  }

  private cleanupUploadIntervals(): void {
    Object.values(this.uploadProgressIntervals).forEach((interval) => {
      clearInterval(interval);
    });
    this.uploadProgressIntervals = {};
  }

  private loadData = async (): Promise<void> => {
    this.cancelled = false;
    try {
      this.setState({ loading: true, error: "", success: "" });

      const res = await fetch(`${API_BASE}/api/hero-slider/home`);
      if (this.cancelled) return;

      if (!res.ok) throw new Error(`Gagal memuat (${res.status})`);

      const data = (await res.json()) as HeroSliderContent | null;
      if (this.cancelled) return;

      if (data && Array.isArray(data.slides) && data.slides.length > 0) {
        this.setState({
          heading: data.heading ?? "Koleksi Terbaru",
          slides: data.slides,
        });
      } else {
        this.setState({
          heading: "Koleksi Terbaru",
          slides: [emptySlide()],
        });
      }
    } catch (e) {
      if (this.cancelled) return;
      this.setState({
        error: e instanceof Error ? e.message : "Gagal memuat data slider hero.",
        heading: "Koleksi Terbaru",
        slides: [emptySlide()],
      });
    } finally {
      if (!this.cancelled) {
        this.setState({ loading: false });
      }
    }
  };

  private getValidationError(): string | null {
    const { slides } = this.state;
    if (!slides.length) return "Tambahkan minimal 1 slide.";

    for (let i = 0; i < slides.length; i++) {
      const s = slides[i];
      if (!s.title.trim()) return `Slide ${i + 1}: judul wajib diisi.`;
      if (!s.image.trim()) return `Slide ${i + 1}: gambar wajib diisi (unggah atau URL/path).`;
      if (!s.primaryCta.label.trim()) return `Slide ${i + 1}: label CTA utama wajib diisi.`;
      if (!s.primaryCta.href.trim()) return `Slide ${i + 1}: tautan CTA utama wajib diisi.`;
    }
    return null;
  }

  private updateSlide = (id: string, patch: Partial<HeroSlide>): void => {
    this.setState((prevState) => ({
      slides: prevState.slides.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  };

  private updatePrimaryCta = (id: string, patch: Partial<HeroSlide["primaryCta"]>): void => {
    this.setState((prevState) => ({
      slides: prevState.slides.map((s) =>
        s.id === id ? { ...s, primaryCta: { ...s.primaryCta, ...patch } } : s
      ),
    }));
  };

  private updateSecondaryCta = (
    id: string,
    patch: Partial<NonNullable<HeroSlide["secondaryCta"]>>
  ): void => {
    this.setState((prevState) => ({
      slides: prevState.slides.map((s) => {
        if (s.id !== id) return s;
        const current = s.secondaryCta ?? { label: "", href: "" };
        return { ...s, secondaryCta: { ...current, ...patch } };
      }),
    }));
  };

  private removeSlide = (id: string): void => {
    this.setState((prevState) => ({
      slides: prevState.slides.filter((s) => s.id !== id),
      deleteConfirm: null,
    }));
  };

  private duplicateSlide = (id: string): void => {
    this.setState((prevState) => {
      const idx = prevState.slides.findIndex((s) => s.id === id);
      if (idx < 0) return prevState;
      const slide = prevState.slides[idx];
      const newSlide = { ...slide, id: uid(), title: `${slide.title} (Salinan)` };
      return {
        ...prevState,
        slides: [...prevState.slides.slice(0, idx + 1), newSlide, ...prevState.slides.slice(idx + 1)],
      };
    });
  };

  private addSlide = (): void => {
    this.setState((prevState) => ({
      slides: [...prevState.slides, emptySlide()],
    }));
  };

  private moveSlide = (id: string, direction: "up" | "down"): void => {
    this.setState((prevState) => {
      const idx = prevState.slides.findIndex((s) => s.id === id);
      if (idx < 0) return prevState;

      const next = [...prevState.slides];
      const target = direction === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= next.length) return prevState;

      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...prevState, slides: next };
    });
  };

  private handleDragStart = (index: number): void => {
    this.setState({ draggedIndex: index });
  };

  private handleDragOver = (e: React.DragEvent, index: number): void => {
    e.preventDefault();
    this.setState({ dragOverIndex: index });
  };

  private handleDragLeave = (): void => {
    this.setState({ dragOverIndex: null });
  };

  private handleDrop = (e: React.DragEvent, dropIndex: number): void => {
    e.preventDefault();
    const { draggedIndex } = this.state;
    if (draggedIndex === null || draggedIndex === dropIndex) {
      this.setState({ draggedIndex: null, dragOverIndex: null });
      return;
    }

    this.setState((prevState) => {
      const next = [...prevState.slides];
      const [removed] = next.splice(draggedIndex, 1);
      next.splice(dropIndex, 0, removed);
      return { ...prevState, slides: next, draggedIndex: null, dragOverIndex: null };
    });
  };

  private handleDragEnd = (): void => {
    this.setState({ draggedIndex: null, dragOverIndex: null });
  };

  private setSlideCollection = (slideId: string, collectionName: string): void => {
    const href = buildCollectionHref(collectionName);
    this.setState((prevState) => ({
      ...prevState,
      slides: prevState.slides.map((s) =>
        s.id === slideId
          ? {
              ...s,
              title: s.title.trim() ? s.title : collectionName,
              primaryCta: { ...s.primaryCta, href },
            }
          : s
      ),
    }));
  };

  private uploadSlideImage = async (slideId: string, file: File): Promise<void> => {
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.setState((prevState) => ({
        ...prevState,
        uploadError: { ...prevState.uploadError, [slideId]: "Ukuran file harus kurang dari 5MB" },
      }));
      return;
    }

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ];
    if (!validTypes.includes(file.type)) {
      this.setState((prevState) => ({
        ...prevState,
        uploadError: {
          ...prevState.uploadError,
          [slideId]: "Silakan unggah file gambar yang valid (JPEG, PNG, WebP, HEIC)",
        },
      }));
      return;
    }

    this.setState((prevState) => ({
      ...prevState,
      uploadError: { ...prevState.uploadError, [slideId]: "" },
      uploading: { ...prevState.uploading, [slideId]: true },
      uploadProgress: { ...prevState.uploadProgress, [slideId]: 0 },
    }));

    try {
      const fd = new FormData();
      fd.append("image", file);

      const progressInterval = setInterval(() => {
        this.setState((prevState) => {
          const current = prevState.uploadProgress[slideId] || 0;
          if (current < 90) {
            return { ...prevState, uploadProgress: { ...prevState.uploadProgress, [slideId]: current + 10 } };
          }
          return prevState;
        });
      }, 200);

      this.uploadProgressIntervals[slideId] = progressInterval;

      const res = await fetch(`${API_BASE}/api/hero-slider/home/upload`, {
        method: "POST",
        body: fd,
      });

      clearInterval(progressInterval);
      delete this.uploadProgressIntervals[slideId];

      this.setState((prevState) => ({
        ...prevState,
        uploadProgress: { ...prevState.uploadProgress, [slideId]: 100 },
      }));

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `Unggah gagal (${res.status})`);
      }

      this.updateSlide(slideId, { image: data.path });
      this.setState({ success: "Gambar berhasil diunggah untuk slide ini." });

      if (this.successTimeout) {
        clearTimeout(this.successTimeout);
      }
      this.successTimeout = setTimeout(() => {
        this.setState((prevState) => ({
          ...prevState,
          success: "",
          uploadProgress: { ...prevState.uploadProgress, [slideId]: 0 },
        }));
      }, 3000);
    } catch (e) {
      this.setState((prevState) => ({
        ...prevState,
        uploadError: {
          ...prevState.uploadError,
          [slideId]: e instanceof Error ? e.message : "Unggah gagal",
        },
        uploadProgress: { ...prevState.uploadProgress, [slideId]: 0 },
      }));
    } finally {
      this.setState((prevState) => ({
        ...prevState,
        uploading: { ...prevState.uploading, [slideId]: false },
      }));
    }
  };

  private save = async (): Promise<void> => {
    this.setState({ success: "", error: "" });

    const validationError = this.getValidationError();
    if (validationError) {
      this.setState({ error: validationError });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      this.setState({ saving: true });

      const { heading, slides } = this.state;
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
            secondaryCta: hasSecondary ? { label: secLabel, href: secHref } : undefined,
          };
        }),
      };

      const res = await fetch(`${API_BASE}/api/hero-slider/home`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Gagal menyimpan (${res.status})`);

      this.setState({ success: "Hero slider berhasil disimpan." });

      await Promise.resolve(this.props.onSaved?.());

      window.scrollTo({ top: 0, behavior: "smooth" });

      if (this.successTimeout) {
        clearTimeout(this.successTimeout);
      }
      this.successTimeout = setTimeout(() => {
        this.setState({ success: "" });
      }, 5000);
    } catch (e) {
      this.setState({
        error: e instanceof Error ? e.message : "Gagal menyimpan slider hero.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      this.setState({ saving: false });
    }
  };

  private clearAll = (): void => {
    if (
      window.confirm(
        "Yakin ingin menghapus semua slide? Tindakan ini tidak bisa dibatalkan."
      )
    ) {
      this.setState({
        slides: [emptySlide()],
        success: "Semua slide dihapus. Jangan lupa simpan!",
      });
    }
  };

  private renderSlideCard(slide: HeroSlide, index: number): React.ReactNode {
    const {
      draggedIndex,
      dragOverIndex,
      deleteConfirm,
      uploading,
      uploadProgress,
      uploadError,
    } = this.state;
    const { collections } = this.props;
    
    // Ensure reusable components are used (TextInput, TextareaInput, HeroImageUpload, FormField)
    // These are used below in the JSX

    return (
      <article
        key={slide.id}
        className={`hsSlideCard ${
          draggedIndex === index ? "hsSlideCard--dragging" : ""
        } ${dragOverIndex === index ? "hsSlideCard--dragover" : ""}`}
        draggable
        onDragStart={() => this.handleDragStart(index)}
        onDragOver={(e) => this.handleDragOver(e, index)}
        onDragLeave={this.handleDragLeave}
        onDrop={(e) => this.handleDrop(e, index)}
        onDragEnd={this.handleDragEnd}
        aria-label={`Slide ${index + 1} dari ${this.state.slides.length}`}
        aria-describedby={`slide-${slide.id}-description`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const firstInput = e.currentTarget.querySelector<HTMLElement>("input, textarea, select");
            firstInput?.focus();
          }
        }}
      >
        <div id={`slide-${slide.id}-description`} className="hsEditor__srOnly">
          {slide.title || "Slide tanpa judul"} -{" "}
          {slide.image ? "Gambar tersedia" : "Gambar belum diunggah"}
        </div>
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
            <div className="hsSlideCard__id">ID: {slide.id}</div>
          </div>

          <div className="hsSlideCard__actions">
            <button
              type="button"
              className="hsMiniBtn"
              onClick={() => this.moveSlide(slide.id, "up")}
              disabled={index === 0}
              title="Geser ke atas"
            >
              ↑
            </button>
            <button
              type="button"
              className="hsMiniBtn"
              onClick={() => this.moveSlide(slide.id, "down")}
              disabled={index === this.state.slides.length - 1}
              title="Geser ke bawah"
            >
              ↓
            </button>
            <button
              type="button"
              className="hsMiniBtn hsMiniBtn--secondary"
              onClick={() => this.duplicateSlide(slide.id)}
              title="Duplikat slide"
            >
              Duplikat
            </button>
            {deleteConfirm === slide.id ? (
              <>
                <button
                  type="button"
                  className="hsMiniBtn hsMiniBtn--danger"
                  onClick={() => this.removeSlide(slide.id)}
                  title="Konfirmasi hapus"
                >
                  ✓ Ya, hapus
                </button>
                <button
                  type="button"
                  className="hsMiniBtn"
                  onClick={() => this.setState({ deleteConfirm: null })}
                  title="Batal"
                >
                  ✕
                </button>
              </>
            ) : (
              <button
                type="button"
                className="hsMiniBtn hsMiniBtn--danger"
                onClick={() => this.setState({ deleteConfirm: slide.id })}
                title="Hapus slide"
              >
                Hapus
              </button>
            )}
          </div>
        </div>

        <div className="hsSlideCard__grid">
          <FormField
            label="Tautkan ke Koleksi (Isi Cepat)"
            htmlFor={`collection-${slide.id}`}
            className="hsField--full"
          >
            <select
              id={`collection-${slide.id}`}
              value=""
              onChange={(e) => {
                const name = e.target.value;
                if (name) this.setSlideCollection(slide.id, name);
              }}
              aria-label={`Tautkan slide ${index + 1} ke koleksi`}
              className="hsField__select"
            >
              <option value="">Pilih koleksi…</option>
              {(collections ?? []).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Badge (Opsional)"
            htmlFor={`badge-${slide.id}`}
          >
            <TextInput
              id={`badge-${slide.id}`}
              name="badge"
              value={slide.badge ?? ""}
              onChange={(e) => this.updateSlide(slide.id, { badge: e.target.value })}
              placeholder="mis. NEW ARRIVAL"
              maxLength={50}
            />
          </FormField>

          <FormField
            label="Judul"
            htmlFor={`title-${slide.id}`}
            required
          >
            <TextInput
              id={`title-${slide.id}`}
              name="title"
              value={slide.title}
              onChange={(e) => this.updateSlide(slide.id, { title: e.target.value })}
              placeholder="mis. Orchid Luxe Collection"
              required
              maxLength={100}
              showCharacterCount
            />
          </FormField>

          <FormField
            label="Subjudul (Opsional)"
            htmlFor={`subtitle-${slide.id}`}
            className="hsField--full"
          >
            <TextareaInput
              id={`subtitle-${slide.id}`}
              name="subtitle"
              value={slide.subtitle ?? ""}
              onChange={(e) => this.updateSlide(slide.id, { subtitle: e.target.value })}
              rows={2}
              placeholder="Deskripsi singkat koleksi..."
              maxLength={200}
              showCharacterCount
            />
          </FormField>

          <div className="hsField--full">
            <HeroImageUpload
              value={slide.image}
              onChange={(value) => this.updateSlide(slide.id, { image: value })}
              onFileUpload={(file) => this.uploadSlideImage(slide.id, file)}
              uploading={uploading[slide.id]}
              uploadProgress={uploadProgress[slide.id]}
              uploadError={uploadError[slide.id]}
              id={`image-${slide.id}`}
              label="Gambar"
              required
              previewUrl={slide.image ? normalizeImageUrl(slide.image) : undefined}
              onPreviewClick={() =>
                this.setState({
                  zoomedImage:
                    normalizeImageUrl(slide.image) || "/images/placeholder-bouquet.jpg",
                })
              }
            />
          </div>

          <div className="hsFieldGroup">
            <div className="hsGroupTitle">CTA Utama *</div>

            <FormField
              label="Teks"
              htmlFor={`primary-cta-label-${slide.id}`}
            >
              <TextInput
                id={`primary-cta-label-${slide.id}`}
                name="primaryCtaLabel"
                value={slide.primaryCta.label}
                onChange={(e) => this.updatePrimaryCta(slide.id, { label: e.target.value })}
                placeholder="mis. Lihat koleksi"
                required
                maxLength={50}
              />
            </FormField>

            <FormField
              label="Tautan"
              htmlFor={`primary-cta-href-${slide.id}`}
            >
              <TextInput
                id={`primary-cta-href-${slide.id}`}
                name="primaryCtaHref"
                value={slide.primaryCta.href}
                onChange={(e) => this.updatePrimaryCta(slide.id, { href: e.target.value })}
                placeholder="/collection or https://..."
                type="url"
                required
              />
            </FormField>
          </div>

          <div className="hsFieldGroup">
            <div className="hsGroupTitle">CTA Kedua (Opsional)</div>

            <FormField
              label="Teks"
              htmlFor={`secondary-cta-label-${slide.id}`}
            >
              <TextInput
                id={`secondary-cta-label-${slide.id}`}
                name="secondaryCtaLabel"
                value={slide.secondaryCta?.label ?? ""}
                onChange={(e) =>
                  this.updateSecondaryCta(slide.id, {
                    label: e.target.value,
                  })
                }
                placeholder="mis. Pesan via WhatsApp"
                maxLength={50}
              />
            </FormField>

            <FormField
              label="Tautan"
              htmlFor={`secondary-cta-href-${slide.id}`}
            >
              <TextInput
                id={`secondary-cta-href-${slide.id}`}
                name="secondaryCtaHref"
                value={slide.secondaryCta?.href ?? ""}
                onChange={(e) => this.updateSecondaryCta(slide.id, { href: e.target.value })}
                placeholder="https://wa.me/..."
                type="url"
              />
            </FormField>
          </div>
        </div>
      </article>
    );
  }

  render(): React.ReactNode {
    const { loading, saving, error, success, heading, slides, zoomedImage } = this.state;
    const validationError = this.getValidationError();

    return (
      <section className={this.baseClass} aria-label="Editor slider hero">
        <header className={`${this.baseClass}__header`}>
          <div>
            <h2 className={`${this.baseClass}__title`}>Hero Slider</h2>
            <p className={`${this.baseClass}__subtitle`}>
              Atur slider hero di homepage. Seret untuk mengubah urutan slide.
            </p>
            {slides.length > 0 && (
              <div className={`${this.baseClass}__stats`} aria-live="polite" aria-atomic="true">
                <span className={`${this.baseClass}__stat`}>
                  {slides.length} {slides.length === 1 ? "slide" : "slides"}
                </span>
              </div>
            )}
          </div>

          <div className={`${this.baseClass}__headerActions`}>
            <button
              type="button"
              className={`${this.baseClass}__btn ${this.baseClass}__btn--ghost`}
              onClick={this.clearAll}
              disabled={loading || slides.length === 0}
              title="Hapus semua slide"
              aria-label="Hapus semua slide"
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
                  d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span>Hapus Semua</span>
            </button>

            <button
              type="button"
              className={`${this.baseClass}__btn`}
              onClick={this.addSlide}
              disabled={loading}
              aria-label="Tambah slide baru"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M12 8v8M8 12h8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span>Tambah Slide</span>
            </button>

            <button
              type="button"
              className={`${this.baseClass}__btn ${this.baseClass}__btn--primary`}
              onClick={() => void this.save()}
              disabled={saving || loading || Boolean(validationError)}
              title={validationError ?? "Simpan perubahan"}
              aria-label={saving ? "Menyimpan perubahan..." : validationError || "Simpan perubahan"}
              aria-busy={saving}
            >
              {saving ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="31.416"
                      strokeDashoffset="31.416"
                    >
                      <animate
                        attributeName="stroke-dasharray"
                        dur="2s"
                        values="0 31.416;15.708 15.708;0 31.416;0 31.416"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="stroke-dashoffset"
                        dur="2s"
                        values="0;-15.708;-31.416;-31.416"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </svg>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M17 21v-8H7v8M7 3v5h8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Simpan</span>
                </>
              )}
            </button>
          </div>
        </header>

        <div className={`${this.baseClass}__card`}>
          <FormField
            label="Judul Slider"
            htmlFor="hero-heading"
          >
            <TextInput
              id="hero-heading"
              name="heading"
              value={heading}
              onChange={(e) => this.setState({ heading: e.target.value })}
              placeholder="mis. Koleksi Terbaru"
              disabled={loading}
              maxLength={100}
              showCharacterCount
            />
          </FormField>

          {loading ? (
            <div className="hsState" role="status" aria-live="polite" aria-busy="true">
              <span>Memuat slider hero…</span>
            </div>
          ) : (
            <>
              {error && (
                <AlertMessage
                  variant="error"
                  message={error}
                  className="hsAlert"
                />
              )}
              {success && (
                <AlertMessage
                  variant="success"
                  message={success}
                  className="hsAlert"
                />
              )}

              {slides.length === 0 ? (
                <EmptyState
                  title="Belum ada slide"
                  description="Klik 'Tambah Slide' untuk memulai!"
                  icon={
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 2s2 3.5 5 4 4.5 1.8 4 4-2.2 4.2-4 5-4 1-5 4c0 0-2-3.5-5-4s-4.5-1.8-4-4 2.2-4.2 4-5 4-1 5-4z"
                        fill="currentColor"
                        opacity="0.3"
                      />
                    </svg>
                  }
                  className="hsEmpty"
                />
              ) : (
                <div className="hsSlides">
                  {slides.map((slide, index) => this.renderSlideCard(slide, index))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Image zoom modal */}
        {zoomedImage && (
          <div
            className="hsZoomModal"
            onClick={() => this.setState({ zoomedImage: null })}
            role="dialog"
            aria-label="Pratinjau gambar"
            tabIndex={-1}
          >
            <div
              className="hsZoomModal__content"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="hsZoomModal__close"
                onClick={() => this.setState({ zoomedImage: null })}
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
  }
}

export default HeroSliderEditorSection;
