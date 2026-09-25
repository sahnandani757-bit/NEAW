"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

export type HomeSection = {
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

type HomeSectionEditorProps = {
  section: HomeSection | null;
  sectionName: string;
  saving: boolean;
  onClose: () => void;
  onChange: (
    field: keyof HomeSection,
    value: string | number | boolean | null
  ) => void;
  onSave: () => void;
};

const inputClass =
  "w-full rounded-[3px] border border-line bg-white px-2.5 py-1.5 text-xs text-ink outline-none transition-colors placeholder:text-slate-light focus:border-blue";

const labelClass =
  "mb-1 block text-[11px] font-semibold text-slate";

const sectionClass =
  "rounded-[3px] border border-line bg-white p-3";

export default function HomeSectionEditor({
  section,
  sectionName,
  saving,
  onClose,
  onChange,
  onSave,
}: HomeSectionEditorProps) {
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
      {/* MODAL */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="home-section-editor-title"
        className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[3px] border border-line bg-white shadow-2xl"
        onWheel={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-2.5">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-blue">
              Home Page Section
            </p>

            <h2
              id="home-section-editor-title"
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
                  <label className={labelClass}>Section Key</label>

                  <input
                    type="text"
                    value={section.section_key}
                    onChange={(e) =>
                      onChange("section_key", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Section Type</label>

                  <select
                    value={section.section_type}
                    onChange={(e) =>
                      onChange("section_type", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="hero">Hero</option>
                    <option value="image_text">Image + Text</option>
                    <option value="cards">Cards</option>
                    <option value="projects">Projects</option>
                    <option value="split_cta">Split CTA</option>
                    <option value="articles">Articles</option>
                    <option value="cta">CTA</option>
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
                  <label className={labelClass}>Eyebrow</label>

                  <input
                    type="text"
                    value={section.eyebrow}
                    onChange={(e) =>
                      onChange("eyebrow", e.target.value)
                    }
                    placeholder="Optional eyebrow text"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Title</label>

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
                  <label className={labelClass}>Description</label>

                  <textarea
                    value={section.description}
                    onChange={(e) =>
                      onChange("description", e.target.value)
                    }
                    rows={2}
                    placeholder="Section description"
                    className={`${inputClass} resize-y`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Content</label>

                  <textarea
                    value={section.content}
                    onChange={(e) =>
                      onChange("content", e.target.value)
                    }
                    rows={3}
                    placeholder="Additional section content"
                    className={`${inputClass} resize-y`}
                  />
                </div>
              </div>
            </section>

            {/* IMAGE */}
            <section className={`${sectionClass} mb-3`}>
              <h3 className="mb-2.5 text-xs font-bold text-ink">
                Image
              </h3>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Image ID</label>

                  <input
                    type="number"
                    min={1}
                    value={section.image_id ?? ""}
                    onChange={(e) =>
                      onChange(
                        "image_id",
                        e.target.value === ""
                          ? null
                          : Number(e.target.value)
                      )
                    }
                    placeholder="Image ID"
                    className={inputClass}
                  />
                </div>

                <div>
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
              </div>

              {section.image_url && (
                <div className="mt-2.5 overflow-hidden rounded-[3px] border border-line bg-surface p-1.5">
                  <img
                    src={section.image_url}
                    alt={
                      section.image_alt ||
                      section.title ||
                      "Section image"
                    }
                    className="max-h-32 w-full object-contain"
                  />
                </div>
              )}
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
                    placeholder="e.g. Learn More"
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
                      onChange("button_1_url", e.target.value)
                    }
                    placeholder="/about"
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
                    placeholder="e.g. Contact Us"
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
                      onChange("button_2_url", e.target.value)
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
                  <label className={labelClass}>Sort Order</label>

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

                    <span>Section Enabled</span>
                  </label>
                </div>
              </div>
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
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}