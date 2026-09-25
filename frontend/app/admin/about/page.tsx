"use client";

import { useEffect, useMemo, useState } from "react";
import { adminFetch, API_URL } from "@/lib/admin/client";
import AboutSectionEditor, {
  AboutSection,
  AboutImage,
} from "@/components/admin/AboutSectionEditor";

type Img = AboutImage;

const SECTION_NAMES: Record<string, string> = {
  hero: "Hero",
  introduction: "Company Introduction",
  mission: "Mission",
  vision: "Vision",
  focus: "Core Focus / Values",
  approach: "Approach",
  partnerships: "Partnership Approach",
  final_cta: "Final CTA",
};

const SECTION_DESCRIPTIONS: Record<string, string> = {
  hero: "Main About page introduction shown at the top of the page.",
  introduction:
    "Company introduction section describing NEAW, its background, and formation.",
  mission: "Company mission statement.",
  vision: "Company vision statement.",
  focus:
    "Core Focus / Values section. The value cards continue to come from the core_values content list.",
  approach: "Description of how NEAW develops and approaches projects.",
  partnerships:
    "Description of NEAW's strategic, project, and investment partnership approach.",
  final_cta: "Final call-to-action section at the bottom of the About page.",
};

const SECTION_TYPES = [
  { value: "hero", label: "Hero" },
  { value: "image_text", label: "Image + Text" },
  { value: "statement", label: "Statement" },
  { value: "cards", label: "Cards" },
  { value: "cta", label: "CTA" },
];

const EMPTY_SECTION: Omit<AboutSection, "id" | "image_url"> = {
  section_key: "",
  section_type: "image_text",
  eyebrow: "",
  title: "",
  description: "",
  content: "",
  image_id: null,
  image_alt: "",
  enabled: true,
  sort_order: 1,
  button_1_label: "",
  button_1_url: "",
  button_2_label: "",
  button_2_url: "",
};

export default function AdminAboutPage() {
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [images, setImages] = useState<Img[]>([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoading, setImagesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<AboutSection | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");

    try {
      const data = await adminFetch("/about-sections");

      setSections(
        [...data].sort(
          (a: AboutSection, b: AboutSection) =>
            a.sort_order - b.sort_order || a.id - b.id
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load About page sections."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadImages() {
    setImagesLoading(true);

    try {
      const data = await adminFetch("/images");
      setImages(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load images."
      );
    } finally {
      setImagesLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    loadImages();
  }, []);

  function openEditor(section: AboutSection) {
    setSuccess("");
    setError("");
    setEditing({ ...section });
  }

  function updateEditing(
    field: keyof AboutSection,
    value: string | number | boolean | null
  ) {
    setEditing((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current
    );
  }

  function handleImageChange(imageId: number | null) {
    if (!editing) return;

    const selected = images.find(
      (image) => image.id === imageId
    );

    setEditing({
      ...editing,
      image_id: imageId,
      image_url: selected?.url ?? null,
      image_alt:
        selected?.alt_text ?? editing.image_alt,
    });
  }

  async function handleSave() {
    if (!editing) return;

    if (!editing.section_key.trim()) {
      setError("Section key is required.");
      return;
    }

    if (!editing.section_type.trim()) {
      setError("Section type is required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await adminFetch(`/about-sections/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify({
          section_key: editing.section_key.trim(),
          section_type: editing.section_type,
          eyebrow: editing.eyebrow,
          title: editing.title,
          description: editing.description,
          content: editing.content,
          image_id: editing.image_id,
          image_alt: editing.image_alt,
          enabled: editing.enabled,
          sort_order: Number(editing.sort_order),
          button_1_label: editing.button_1_label,
          button_1_url: editing.button_1_url,
          button_2_label: editing.button_2_label,
          button_2_url: editing.button_2_url,
        }),
      });

      setEditing(null);
      setSuccess("About section saved successfully.");
      await refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save About section."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(section: AboutSection) {
    setError("");
    setSuccess("");

    try {
      await adminFetch(`/about-sections/${section.id}`, {
        method: "PUT",
        body: JSON.stringify({
          section_key: section.section_key,
          section_type: section.section_type,
          eyebrow: section.eyebrow,
          title: section.title,
          description: section.description,
          content: section.content,
          image_id: section.image_id,
          image_alt: section.image_alt,
          enabled: !section.enabled,
          sort_order: section.sort_order,
          button_1_label: section.button_1_label,
          button_1_url: section.button_1_url,
          button_2_label: section.button_2_label,
          button_2_url: section.button_2_url,
        }),
      });

      setSuccess(
        `${SECTION_NAMES[section.section_key] ?? section.section_key} ${
          !section.enabled ? "enabled" : "disabled"
        }.`
      );

      await refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update section."
      );
    }
  }

  async function moveSection(
    section: AboutSection,
    direction: "up" | "down"
  ) {
    const index = sections.findIndex(
      (item) => item.id === section.id
    );

    if (direction === "up" && index === 0) return;
    if (
      direction === "down" &&
      index === sections.length - 1
    )
      return;

    const targetIndex =
      direction === "up" ? index - 1 : index + 1;

    const target = sections[targetIndex];

    if (!target) return;

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await Promise.all([
        adminFetch(`/about-sections/${section.id}`, {
          method: "PUT",
          body: JSON.stringify({
            section_key: section.section_key,
            section_type: section.section_type,
            eyebrow: section.eyebrow,
            title: section.title,
            description: section.description,
            content: section.content,
            image_id: section.image_id,
            image_alt: section.image_alt,
            enabled: section.enabled,
            sort_order: target.sort_order,
            button_1_label: section.button_1_label,
            button_1_url: section.button_1_url,
            button_2_label: section.button_2_label,
            button_2_url: section.button_2_url,
          }),
        }),

        adminFetch(`/about-sections/${target.id}`, {
          method: "PUT",
          body: JSON.stringify({
            section_key: target.section_key,
            section_type: target.section_type,
            eyebrow: target.eyebrow,
            title: target.title,
            description: target.description,
            content: target.content,
            image_id: target.image_id,
            image_alt: target.image_alt,
            enabled: target.enabled,
            sort_order: section.sort_order,
            button_1_label: target.button_1_label,
            button_1_url: target.button_1_url,
            button_2_label: target.button_2_label,
            button_2_url: target.button_2_url,
          }),
        }),
      ]);

      setSuccess("About section order updated.");
      await refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to change section order."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(section: AboutSection) {
    const name =
      SECTION_NAMES[section.section_key] ??
      section.section_key;

    const confirmed = window.confirm(
      `Delete the "${name}" About section?\n\nThis cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await adminFetch(`/about-sections/${section.id}`, {
        method: "DELETE",
      });

      setSuccess(`${name} section deleted.`);
      await refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete About section."
      );
    }
  }

  async function handleCreate() {
    setError("");
    setSuccess("");

    try {
      const maxOrder =
        sections.length > 0
          ? Math.max(
              ...sections.map(
                (section) => section.sort_order
              )
            )
          : 0;

      const created = await adminFetch(
        "/about-sections",
        {
          method: "POST",
          body: JSON.stringify({
            ...EMPTY_SECTION,
            section_key: `new-about-section-${Date.now()}`,
            sort_order: maxOrder + 1,
          }),
        }
      );

      setSuccess("New About section created.");
      await refresh();

      setEditing(created);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create About section."
      );
    }
  }

  const enabledCount = useMemo(
    () =>
      sections.filter(
        (section) => section.enabled
      ).length,
    [sections]
  );

  const buttonClass =
    "rounded-[3px] border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-5 lg:px-6">

        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                About Page
              </h1>

              <span className="rounded-[3px] bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                {sections.length} sections
              </span>
            </div>

            <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
              Manage About page content, images, buttons,
              order, and visibility.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                refresh();
                loadImages();
              }}
              disabled={loading || saving}
              className="rounded-[3px] border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Refresh
            </button>

            <button
              type="button"
              onClick={handleCreate}
              disabled={saving}
              className="rounded-[3px] bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Add Section
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-[3px] border border-slate-200 bg-white px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Total
            </p>
            <p className="mt-0.5 text-lg font-semibold text-slate-900">
              {sections.length}
            </p>
          </div>

          <div className="rounded-[3px] border border-slate-200 bg-white px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Enabled
            </p>
            <p className="mt-0.5 text-lg font-semibold text-slate-900">
              {enabledCount}
            </p>
          </div>

          <div className="rounded-[3px] border border-slate-200 bg-white px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Disabled
            </p>
            <p className="mt-0.5 text-lg font-semibold text-slate-900">
              {sections.length - enabledCount}
            </p>
          </div>

          <div className="rounded-[3px] border border-slate-200 bg-white px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Images
            </p>
            <p className="mt-0.5 text-lg font-semibold text-slate-900">
              {images.length}
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mt-4 rounded-[3px] border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-[3px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            {success}
          </div>
        )}

        {/* Sections */}
        {loading ? (
          <div className="mt-5 rounded-[3px] border border-slate-200 bg-white p-6 text-center">
            <p className="text-sm text-slate-500">
              Loading About page sections…
            </p>
          </div>
        ) : sections.length === 0 ? (
          <div className="mt-5 rounded-[3px] border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-base font-semibold text-slate-800">
              No About sections
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Create a section to start building the About page.
            </p>

            <button
              type="button"
              onClick={handleCreate}
              className="mt-4 rounded-[3px] bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
            >
              + Add Section
            </button>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-2">
            {sections.map((section, index) => {
              const name =
                SECTION_NAMES[section.section_key] ??
                section.section_key;

              const description =
                SECTION_DESCRIPTIONS[
                  section.section_key
                ] ?? "Custom About page section.";

              return (
                <div
                  key={section.id}
                  className={`rounded-[3px] border bg-white shadow-sm transition ${
                    section.enabled
                      ? "border-slate-200"
                      : "border-slate-200 opacity-70"
                  }`}
                >
                  <div className="px-4 py-3">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

                      {/* Left */}
                      <div className="flex min-w-0 gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] bg-slate-100 text-xs font-bold text-slate-600">
                          {index + 1}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h2 className="text-sm font-semibold text-slate-900">
                              {name}
                            </h2>

                            <span
                              className={`rounded-[3px] px-2 py-0.5 text-[10px] font-semibold ${
                                section.enabled
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {section.enabled
                                ? "Enabled"
                                : "Disabled"}
                            </span>

                            <span className="rounded-[3px] bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                              {section.section_type}
                            </span>
                          </div>

                          <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                            Key: {section.section_key} · Order:{" "}
                            {section.sort_order}
                          </p>

                          <p className="mt-1.5 max-w-3xl text-xs leading-5 text-slate-500">
                            {description}
                          </p>

                          {section.title && (
                            <div className="mt-2 rounded-[3px] bg-slate-50 px-3 py-2">
                              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                                Current title
                              </p>

                              <p className="mt-0.5 text-xs font-medium text-slate-800">
                                {section.title}
                              </p>
                            </div>
                          )}

                          {section.image_id && (
                            <div className="mt-2 flex items-center gap-2">
                              {section.image_url && (
                                <img
                                  src={`${API_URL}${section.image_url}`}
                                  alt={
                                    section.image_alt ||
                                    section.title
                                  }
                                  className="h-10 w-14 rounded-[3px] border border-slate-200 object-cover"
                                />
                              )}

                              <div>
                                <p className="text-[10px] font-semibold text-slate-600">
                                  Image ID: {section.image_id}
                                </p>

                                <p className="text-[10px] text-slate-400">
                                  {section.image_alt ||
                                    "No alt text"}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            moveSection(section, "up")
                          }
                          disabled={
                            index === 0 || saving
                          }
                          title="Move up"
                          className={buttonClass}
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            moveSection(section, "down")
                          }
                          disabled={
                            index === sections.length - 1 ||
                            saving
                          }
                          title="Move down"
                          className={buttonClass}
                        >
                          ↓
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleToggle(section)
                          }
                          disabled={saving}
                          className="rounded-[3px] border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {section.enabled
                            ? "Disable"
                            : "Enable"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openEditor(section)
                          }
                          disabled={saving}
                          className="rounded-[3px] bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(section)
                          }
                          disabled={saving}
                          className="rounded-[3px] border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ABOUT SECTION EDITOR */}
      <AboutSectionEditor
        section={editing}
        sectionName={
          editing
            ? SECTION_NAMES[editing.section_key] ??
              editing.section_key
            : ""
        }
        sectionTypes={SECTION_TYPES}
        images={images}
        imagesLoading={imagesLoading}
        saving={saving}
        apiUrl={API_URL}
        onClose={() => setEditing(null)}
        onChange={updateEditing}
        onImageChange={handleImageChange}
        onSave={handleSave}
      />
    </div>
  );
}