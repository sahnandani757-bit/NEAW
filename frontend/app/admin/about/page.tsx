"use client";

import { useEffect, useMemo, useState } from "react";
import { adminFetch, API_URL } from "@/lib/admin/client";

type AboutSection = {
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

type Img = {
  id: number;
  filename: string;
  content_type: string;
  alt_text: string;
  size_bytes: number;
  url: string;
};

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
  focus: "Core Focus / Values section. The value cards continue to come from the core_values content list.",
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
        err instanceof Error ? err.message : "Unable to load images."
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

    const selected = images.find((image) => image.id === imageId);

    setEditing({
      ...editing,
      image_id: imageId,
      image_url: selected?.url ?? null,
      image_alt: selected?.alt_text ?? editing.image_alt,
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
    const index = sections.findIndex((item) => item.id === section.id);

    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === sections.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
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
      SECTION_NAMES[section.section_key] ?? section.section_key;

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
          ? Math.max(...sections.map((section) => section.sort_order))
          : 0;

      const created = await adminFetch("/about-sections", {
        method: "POST",
        body: JSON.stringify({
          ...EMPTY_SECTION,
          section_key: `new-about-section-${Date.now()}`,
          sort_order: maxOrder + 1,
        }),
      });

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
    () => sections.filter((section) => section.enabled).length,
    [sections]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                About Page
              </h1>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {sections.length} sections
              </span>
            </div>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Manage the complete About page. Edit content, images,
              buttons, section order, and visibility without changing
              the website code.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                refresh();
                loadImages();
              }}
              disabled={loading || saving}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Refresh
            </button>

            <button
              type="button"
              onClick={handleCreate}
              disabled={saving}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Add Section
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Total
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {sections.length}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Enabled
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {enabledCount}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Disabled
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {sections.length - enabledCount}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Images
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {images.length}
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {/* Sections */}
        {loading ? (
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">
              Loading About page sections…
            </p>
          </div>
        ) : sections.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <h2 className="text-lg font-semibold text-slate-800">
              No About sections
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Create a section to start building the About page.
            </p>

            <button
              type="button"
              onClick={handleCreate}
              className="mt-5 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              + Add Section
            </button>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-4">
            {sections.map((section, index) => {
              const name =
                SECTION_NAMES[section.section_key] ??
                section.section_key;

              const description =
                SECTION_DESCRIPTIONS[section.section_key] ??
                "Custom About page section.";

              return (
                <div
                  key={section.id}
                  className={`rounded-xl border bg-white shadow-sm transition ${
                    section.enabled
                      ? "border-slate-200"
                      : "border-slate-200 opacity-70"
                  }`}
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      {/* Left */}
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
                          {index + 1}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base font-semibold text-slate-900">
                              {name}
                            </h2>

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                section.enabled
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {section.enabled
                                ? "Enabled"
                                : "Disabled"}
                            </span>

                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                              {section.section_type}
                            </span>
                          </div>

                          <p className="mt-1 text-xs font-medium text-slate-400">
                            Key: {section.section_key} · Order:{" "}
                            {section.sort_order}
                          </p>

                          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                            {description}
                          </p>

                          {section.title && (
                            <div className="mt-4 rounded-lg bg-slate-50 p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Current title
                              </p>

                              <p className="mt-1 text-sm font-medium text-slate-800">
                                {section.title}
                              </p>
                            </div>
                          )}

                          {section.image_id && (
                            <div className="mt-3 flex items-center gap-3">
                              {section.image_url && (
                                <img
                                  src={`${API_URL}${section.image_url}`}
                                  alt={section.image_alt || section.title}
                                  className="h-12 w-16 rounded-md border border-slate-200 object-cover"
                                />
                              )}

                              <div>
                                <p className="text-xs font-semibold text-slate-600">
                                  Image ID: {section.image_id}
                                </p>

                                <p className="text-xs text-slate-400">
                                  {section.image_alt ||
                                    "No alt text"}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            moveSection(section, "up")
                          }
                          disabled={index === 0 || saving}
                          title="Move up"
                          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
                          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          ↓
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggle(section)}
                          disabled={saving}
                          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {section.enabled
                            ? "Disable"
                            : "Enable"}
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditor(section)}
                          disabled={saving}
                          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(section)}
                          disabled={saving}
                          className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
          <div className="flex min-h-full items-center justify-center">
            <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Edit About Section
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {SECTION_NAMES[editing.section_key] ??
                      editing.section_key}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-md p-2 text-xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {/* Body */}
              <div className="max-h-[75vh] overflow-y-auto px-6 py-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Key */}
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Section key
                    </label>

                    <input
                      value={editing.section_key}
                      onChange={(e) =>
                        updateEditing(
                          "section_key",
                          e.target.value
                        )
                      }
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    />

                    <p className="mt-1 text-xs text-slate-400">
                      Keep the predefined keys unchanged.
                    </p>
                  </div>

                  {/* Type */}
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Section type
                    </label>

                    <select
                      value={editing.section_type}
                      onChange={(e) =>
                        updateEditing(
                          "section_type",
                          e.target.value
                        )
                      }
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    >
                      {SECTION_TYPES.map((type) => (
                        <option
                          key={type.value}
                          value={type.value}
                        >
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Sort order
                    </label>

                    <input
                      type="number"
                      min={1}
                      value={editing.sort_order}
                      onChange={(e) =>
                        updateEditing(
                          "sort_order",
                          Number(e.target.value)
                        )
                      }
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    />
                  </div>

                  {/* Enabled */}
                  <div className="flex items-center">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={editing.enabled}
                        onChange={(e) =>
                          updateEditing(
                            "enabled",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 rounded border-slate-300"
                      />

                      <span>
                        <span className="block text-sm font-medium text-slate-700">
                          Enable this section
                        </span>

                        <span className="block text-xs text-slate-400">
                          Disabled sections will not appear on
                          the About page.
                        </span>
                      </span>
                    </label>
                  </div>
                </div>

                {/* Eyebrow */}
                <div className="mt-5">
                  <label className="text-sm font-medium text-slate-700">
                    Eyebrow / Kicker
                  </label>

                  <input
                    value={editing.eyebrow}
                    onChange={(e) =>
                      updateEditing("eyebrow", e.target.value)
                    }
                    placeholder="About NEAW"
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  />
                </div>

                {/* Title */}
                <div className="mt-5">
                  <label className="text-sm font-medium text-slate-700">
                    Title
                  </label>

                  <input
                    value={editing.title}
                    onChange={(e) =>
                      updateEditing("title", e.target.value)
                    }
                    placeholder="Section title"
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  />
                </div>

                {/* Description */}
                <div className="mt-5">
                  <label className="text-sm font-medium text-slate-700">
                    Description
                  </label>

                  <textarea
                    value={editing.description}
                    onChange={(e) =>
                      updateEditing(
                        "description",
                        e.target.value
                      )
                    }
                    rows={4}
                    placeholder="Section description"
                    className="mt-1 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm leading-6 text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  />
                </div>

                {/* Content */}
                <div className="mt-5">
                  <label className="text-sm font-medium text-slate-700">
                    Main content
                  </label>

                  <textarea
                    value={editing.content}
                    onChange={(e) =>
                      updateEditing(
                        "content",
                        e.target.value
                      )
                    }
                    rows={8}
                    placeholder="Main section content. Separate paragraphs with a blank line."
                    className="mt-1 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm leading-6 text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Separate paragraphs with a blank line.
                  </p>
                </div>

                {/* Image */}
                <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Section Image
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Select an image from the existing Images
                    library.
                  </p>

                  <div className="mt-4">
                    <label className="text-sm font-medium text-slate-700">
                      Select image
                    </label>

                    <select
                      value={editing.image_id ?? ""}
                      onChange={(e) =>
                        handleImageChange(
                          e.target.value
                            ? Number(e.target.value)
                            : null
                        )
                      }
                      disabled={imagesLoading}
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 disabled:opacity-50"
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

                  {editing.image_id && editing.image_url && (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-medium text-slate-500">
                        Selected image
                      </p>

                      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <img
                          src={`${API_URL}${editing.image_url}`}
                          alt={
                            editing.image_alt ||
                            editing.title ||
                            "About section image"
                          }
                          className="max-h-72 w-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <label className="text-sm font-medium text-slate-700">
                      Image alt text
                    </label>

                    <input
                      value={editing.image_alt}
                      onChange={(e) =>
                        updateEditing(
                          "image_alt",
                          e.target.value
                        )
                      }
                      placeholder="Describe the image"
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    />
                  </div>

                  <p className="mt-3 text-xs text-slate-400">
                    Need a new image? Upload it first from Admin →
                    Images, then return here and select it.
                  </p>
                </div>

                {/* Buttons */}
                <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Buttons
                  </h3>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        Button 1 label
                      </label>

                      <input
                        value={editing.button_1_label}
                        onChange={(e) =>
                          updateEditing(
                            "button_1_label",
                            e.target.value
                          )
                        }
                        placeholder="Learn more"
                        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        Button 1 URL
                      </label>

                      <input
                        value={editing.button_1_url}
                        onChange={(e) =>
                          updateEditing(
                            "button_1_url",
                            e.target.value
                          )
                        }
                        placeholder="/projects"
                        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        Button 2 label
                      </label>

                      <input
                        value={editing.button_2_label}
                        onChange={(e) =>
                          updateEditing(
                            "button_2_label",
                            e.target.value
                          )
                        }
                        placeholder="Contact us"
                        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        Button 2 URL
                      </label>

                      <input
                        value={editing.button_2_url}
                        onChange={(e) =>
                          updateEditing(
                            "button_2_url",
                            e.target.value
                          )
                        }
                        placeholder="/contact"
                        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  disabled={saving}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-md bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}