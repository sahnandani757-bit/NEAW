"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

export type AboutSection = {
  id: number;
  section_key: string;
  section_type: string;
  eyebrow: string;
  title: string;
  description: string;
  content: string;
  image_id: number | null;
  image_alt: string;
  enabled: boolean;
  sort_order: number;
  button_1_label: string;
  button_1_url: string;
  button_2_label: string;
  button_2_url: string;
  image_url: string | null;
};

export type AboutImage = {
  id: number;
  filename: string;
  content_type: string;
  alt_text: string;
  size_bytes: number;
  url: string;
};

export type AboutSectionType = {
  value: string;
  label: string;
};

type AboutSectionEditorProps = {
  section: AboutSection | null;
  sectionName: string;
  sectionTypes: AboutSectionType[];
  images: AboutImage[];
  imagesLoading: boolean;
  saving: boolean;
  apiUrl: string;
  onClose: () => void;
  onChange: (
    field: keyof AboutSection,
    value: string | number | boolean | null
  ) => void;
  onImageChange: (imageId: number | null) => void;
  onSave: () => void;
};

const inputClass =
  "w-full rounded-[3px] border border-line bg-white px-2.5 py-1.5 text-xs text-ink outline-none transition-colors placeholder:text-slate-light focus:border-blue";

const labelClass =
  "mb-1 block text-[11px] font-semibold text-slate";

const sectionClass =
  "rounded-[3px] border border-line bg-white p-3";

export default function AboutSectionEditor({
  section,
  sectionName,
  sectionTypes,
  images,
  imagesLoading,
  saving,
  apiUrl,
  onClose,
  onChange,
  onImageChange,
  onSave,
}: AboutSectionEditorProps) {
  useEffect(() => {
    if (!section) return;

    const html = document.documentElement;
    const body = document.body;

    const scrollY = window.scrollY;

    const previousHtmlOverflow = html.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyWidth = body.style.width;

    html.style.overflow = "hidden";

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.width = previousBodyWidth;

      window.scrollTo(0, scrollY);
    };
  }, [section]);

  if (!section || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-3 sm:p-4"
      onWheel={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-section-editor-title"
        className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[3px] border border-line bg-white shadow-2xl"
        onWheel={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-2.5">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-blue">
              About Page Section
            </p>

            <h2
              id="about-section-editor-title"
              className="mt-0.5 truncate text-base font-bold text-ink"
            >
              Edit {sectionName}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close editor"
            className="ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-[3px] border border-line text-base leading-none text-slate transition-colors hover:bg-surface-alt hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* FORM AREA */}
        <div
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="mx-auto max-w-5xl px-4 py-3">

            {/* BASIC INFORMATION */}
            <section className={`${sectionClass} mb-3`}>
              <h3 className="mb-2.5 text-xs font-bold text-ink">
                Basic Information
              </h3>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Section Key
                  </label>

                  <input
                    type="text"
                    value={section.section_key}
                    onChange={(e) =>
                      onChange("section_key", e.target.value)
                    }
                    className={inputClass}
                  />

                  <p className="mt-1 text-[10px] text-slate-light">
                    Keep the predefined keys unchanged.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>
                    Section Type
                  </label>

                  <select
                    value={section.section_type}
                    onChange={(e) =>
                      onChange("section_type", e.target.value)
                    }
                    className={inputClass}
                  >
                    {sectionTypes.map((type) => (
                      <option
                        key={type.value}
                        value={type.value}
                      >
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* CONTENT */}
            <section className={`${sectionClass} mb-3`}>
              <h3 className="mb-2.5 text-xs font-bold text-ink">
                Content
              </h3>

              <div className="space-y-2.5">
                <div>
                  <label className={labelClass}>
                    Eyebrow / Kicker
                  </label>

                  <input
                    type="text"
                    value={section.eyebrow}
                    onChange={(e) =>
                      onChange("eyebrow", e.target.value)
                    }
                    placeholder="About NEAW"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Title
                  </label>

                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      onChange("title", e.target.value)
                    }
                    placeholder="Section title"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Description
                  </label>

                  <textarea
                    value={section.description}
                    onChange={(e) =>
                      onChange("description", e.target.value)
                    }
                    rows={3}
                    placeholder="Section description"
                    className={`${inputClass} resize-y leading-5`}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Main Content
                  </label>

                  <textarea
                    value={section.content}
                    onChange={(e) =>
                      onChange("content", e.target.value)
                    }
                    rows={6}
                    placeholder="Main section content. Separate paragraphs with a blank line."
                    className={`${inputClass} resize-y leading-5`}
                  />

                  <p className="mt-1 text-[10px] text-slate-light">
                    Separate paragraphs with a blank line.
                  </p>
                </div>
              </div>
            </section>

            {/* IMAGE */}
            <section className={`${sectionClass} mb-3`}>
              <h3 className="mb-2.5 text-xs font-bold text-ink">
                Section Image
              </h3>

              <p className="mb-3 text-[10px] text-slate">
                Select an image from the existing Images library.
              </p>

              <div>
                <label className={labelClass}>
                  Select Image
                </label>

                <select
                  value={section.image_id ?? ""}
                  onChange={(e) =>
                    onImageChange(
                      e.target.value
                        ? Number(e.target.value)
                        : null
                    )
                  }
                  disabled={imagesLoading}
                  className={inputClass}
                >
                  <option value="">
                    {imagesLoading
                      ? "Loading images…"
                      : "No image"}
                  </option>

                  {images.map((image) => (
                    <option
                      key={image.id}
                      value={image.id}
                    >
                      #{image.id} — {image.filename}
                    </option>
                  ))}
                </select>
              </div>

              {section.image_id && section.image_url && (
                <div className="mt-3">
                  <p className="mb-1 text-[10px] font-medium text-slate">
                    Selected Image
                  </p>

                  <div className="overflow-hidden rounded-[3px] border border-line bg-surface p-1.5">
                    <img
                      src={`${apiUrl}${section.image_url}`}
                      alt={
                        section.image_alt ||
                        section.title ||
                        "About section image"
                      }
                      className="max-h-60 w-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="mt-3">
                <label className={labelClass}>
                  Image Alt Text
                </label>

                <input
                  type="text"
                  value={section.image_alt}
                  onChange={(e) =>
                    onChange("image_alt", e.target.value)
                  }
                  placeholder="Describe the image"
                  className={inputClass}
                />
              </div>

              <p className="mt-2 text-[10px] text-slate-light">
                Need a new image? Upload it first from Admin →
                Images, then return here and select it.
              </p>
            </section>

            {/* BUTTONS */}
            <section className={`${sectionClass} mb-3`}>
              <h3 className="mb-2.5 text-xs font-bold text-ink">
                Buttons
              </h3>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Button 1 Label
                  </label>

                  <input
                    type="text"
                    value={section.button_1_label}
                    onChange={(e) =>
                      onChange(
                        "button_1_label",
                        e.target.value
                      )
                    }
                    placeholder="Learn more"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Button 1 URL
                  </label>

                  <input
                    type="text"
                    value={section.button_1_url}
                    onChange={(e) =>
                      onChange(
                        "button_1_url",
                        e.target.value
                      )
                    }
                    placeholder="/projects"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Button 2 Label
                  </label>

                  <input
                    type="text"
                    value={section.button_2_label}
                    onChange={(e) =>
                      onChange(
                        "button_2_label",
                        e.target.value
                      )
                    }
                    placeholder="Contact us"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Button 2 URL
                  </label>

                  <input
                    type="text"
                    value={section.button_2_url}
                    onChange={(e) =>
                      onChange(
                        "button_2_url",
                        e.target.value
                      )
                    }
                    placeholder="/contact"
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* SETTINGS */}
            <section className={`${sectionClass} mb-2`}>
              <h3 className="mb-2.5 text-xs font-bold text-ink">
                Settings
              </h3>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Sort Order
                  </label>

                  <input
                    type="number"
                    min={1}
                    value={section.sort_order}
                    onChange={(e) =>
                      onChange(
                        "sort_order",
                        e.target.value === ""
                          ? 0
                          : Number(e.target.value)
                      )
                    }
                    className={inputClass}
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex h-[32px] items-center gap-2 text-xs font-medium text-slate">
                    <input
                      type="checkbox"
                      checked={section.enabled}
                      onChange={(e) =>
                        onChange(
                          "enabled",
                          e.target.checked
                        )
                      }
                      className="h-3.5 w-3.5 rounded-[3px] border-line"
                    />

                    <span>
                      Section Enabled
                    </span>
                  </label>
                </div>
              </div>

              <p className="mt-2 text-[10px] text-slate-light">
                Disabled sections will not appear on the About page.
              </p>
            </section>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex shrink-0 justify-end gap-2 border-t border-line bg-white px-4 py-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-[3px] border border-line px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-[3px] bg-ink px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}