"use client";

import { useEffect, useMemo, useState } from "react";
import { adminFetch } from "@/lib/admin/client";
import HomeSectionEditor from "@/components/admin/HomeSectionEditer";
import type { HomeSection } from "@/components/admin/HomeSectionEditer";

const SECTION_NAMES: Record<string, string> = {
  hero: "Hero",
  introduction: "Introduction",
  focus: "Areas of Focus",
  projects: "Projects",
  partnerships: "Partnerships",
  opportunities: "Opportunities",
  insights: "Insights",
  careers: "Careers",
  final_cta: "Final CTA",
};

const SECTION_DESCRIPTIONS: Record<string, string> = {
  hero: "Main hero section shown at the top of the Home page.",
  introduction:
    "Introduction section with company overview and supporting image.",
  focus:
    "Areas of Focus cards pulled from the Focus Areas content list.",
  projects: "Featured project section shown on the Home page.",
  partnerships:
    "Partnership-focused image and content section.",
  opportunities:
    "Opportunity / project enquiry call-to-action section.",
  insights:
    "Featured insights/articles shown on the Home page.",
  careers: "Careers section with supporting content.",
  final_cta:
    "Final call-to-action section at the bottom of the Home page.",
};

const EMPTY_SECTION: Omit<HomeSection, "id" | "image_url"> = {
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

export default function AdminHomePage() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<HomeSection | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ---------------------------------
     Load sections
  --------------------------------- */

  async function refresh() {
    setLoading(true);
    setError("");

    try {
      const data = await adminFetch("/home-sections");

      const sortedSections = [...data].sort(
        (a: HomeSection, b: HomeSection) =>
          a.sort_order - b.sort_order || a.id - b.id
      );

      setSections(sortedSections);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load Home page sections."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  /* ---------------------------------
     Open editor
  --------------------------------- */

  function openEditor(section: HomeSection) {
    setError("");
    setSuccess("");

    setEditing({
      ...section,
    });
  }

  /* ---------------------------------
     Update editor field
  --------------------------------- */

  function updateEditing(
    field: keyof HomeSection,
    value: string | number | boolean | null
  ) {
    setEditing((current) =>
      current
        ? ({
            ...current,
            [field]: value,
          } as HomeSection)
        : current
    );
  }

  /* ---------------------------------
     Save section
  --------------------------------- */

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
      await adminFetch(`/home-sections/${editing.id}`, {
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
      setSuccess("Home section saved successfully.");

      await refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save Home section."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ---------------------------------
     Enable / Disable
  --------------------------------- */

  async function handleToggle(section: HomeSection) {
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await adminFetch(`/home-sections/${section.id}`, {
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

      const name =
        SECTION_NAMES[section.section_key] ??
        section.section_key;

      setSuccess(
        `${name} ${
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
    } finally {
      setSaving(false);
    }
  }

  /* ---------------------------------
     Move section
  --------------------------------- */

  async function moveSection(
    section: HomeSection,
    direction: "up" | "down"
  ) {
    const index = sections.findIndex(
      (item) => item.id === section.id
    );

    if (index === -1) return;

    if (direction === "up" && index === 0) {
      return;
    }

    if (
      direction === "down" &&
      index === sections.length - 1
    ) {
      return;
    }

    const targetIndex =
      direction === "up" ? index - 1 : index + 1;

    const target = sections[targetIndex];

    if (!target) return;

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await Promise.all([
        adminFetch(`/home-sections/${section.id}`, {
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

        adminFetch(`/home-sections/${target.id}`, {
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

      setSuccess("Section order updated.");

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

  /* ---------------------------------
     Delete section
  --------------------------------- */

  async function handleDelete(section: HomeSection) {
    const name =
      SECTION_NAMES[section.section_key] ??
      section.section_key;

    const confirmed = window.confirm(
      `Delete the "${name}" Home section?\n\nThis cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await adminFetch(`/home-sections/${section.id}`, {
        method: "DELETE",
      });

      setSuccess(`${name} section deleted.`);

      await refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete section."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ---------------------------------
     Create section
  --------------------------------- */

  async function handleCreate() {
    setError("");
    setSuccess("");
    setSaving(true);

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
        "/home-sections",
        {
          method: "POST",
          body: JSON.stringify({
            ...EMPTY_SECTION,
            section_key: `new-section-${Date.now()}`,
            sort_order: maxOrder + 1,
          }),
        }
      );

      await refresh();

      setEditing(created);

      setSuccess("New Home section created.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create Home section."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ---------------------------------
     Stats
  --------------------------------- */

  const enabledCount = useMemo(
    () =>
      sections.filter((section) => section.enabled)
        .length,
    [sections]
  );

  const disabledCount =
    sections.length - enabledCount;

  /* ---------------------------------
     Render
  --------------------------------- */

  return (
    <div className="min-h-full bg-white">
      <div className="container-wide px-5 py-6 sm:px-8 sm:py-7">
        {/* HEADER */}
        <div className="flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold tracking-wide text-blue">
                HOME PAGE BUILDER
              </span>

              <span className="rounded-[3px] bg-blue-pale px-2 py-1 text-[10px] font-semibold text-blue">
                {sections.length} sections
              </span>
            </div>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">
              Home Page
            </h1>

            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate">
              Manage Home page sections, content,
              buttons, images and display order.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={refresh}
              disabled={loading || saving}
              className="rounded-[3px] border border-line bg-white px-3.5 py-2 text-[11px] font-semibold text-ink transition hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50"
            >
              Refresh
            </button>

            <button
              type="button"
              onClick={handleCreate}
              disabled={saving}
              className="rounded-[3px] bg-ink px-3.5 py-2 text-[11px] font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Add Section
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <div className="rounded-[3px] border border-line bg-white px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate">
              Total
            </p>

            <p className="mt-0.5 text-lg font-bold text-ink">
              {sections.length}
            </p>
          </div>

          <div className="rounded-[3px] border border-line bg-white px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate">
              Enabled
            </p>

            <p className="mt-0.5 text-lg font-bold text-ink">
              {enabledCount}
            </p>
          </div>

          <div className="rounded-[3px] border border-line bg-white px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate">
              Disabled
            </p>

            <p className="mt-0.5 text-lg font-bold text-ink">
              {disabledCount}
            </p>
          </div>
        </div>

        {/* MESSAGES */}
        {error && (
          <div className="mt-4 rounded-[3px] border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-[3px] border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-700">
            {success}
          </div>
        )}

        {/* SECTIONS */}
        {loading ? (
          <div className="mt-5 rounded-[3px] border border-line bg-white p-8 text-center">
            <p className="text-xs text-slate">
              Loading Home page sections…
            </p>
          </div>
        ) : sections.length === 0 ? (
          <div className="mt-5 rounded-[3px] border border-dashed border-line bg-white p-8 text-center">
            <h2 className="text-sm font-bold text-ink">
              No Home sections
            </h2>

            <p className="mt-1 text-xs text-slate">
              Create a section to start building the Home
              page.
            </p>

            <button
              type="button"
              onClick={handleCreate}
              disabled={saving}
              className="mt-4 rounded-[3px] bg-ink px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Add Section
            </button>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-2.5">
            {sections.map((section, index) => {
              const name =
                SECTION_NAMES[section.section_key] ??
                section.section_key;

              const description =
                SECTION_DESCRIPTIONS[
                  section.section_key
                ] ?? "Custom Home page section.";

              return (
                <div
                  key={section.id}
                  className={`rounded-[3px] border bg-white transition ${
                    section.enabled
                      ? "border-line"
                      : "border-line opacity-60"
                  }`}
                >
                  <div className="p-3.5 sm:p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      {/* SECTION INFO */}
                      <div className="flex min-w-0 gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-blue-pale text-[11px] font-bold text-blue">
                          {index + 1}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h2 className="text-sm font-bold text-ink">
                              {name}
                            </h2>

                            <span
                              className={`rounded-[6px] px-2 py-0.5 text-[10px] font-semibold ${
                                section.enabled
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {section.enabled
                                ? "Enabled"
                                : "Disabled"}
                            </span>

                            <span className="rounded-[6px] bg-blue-pale px-2 py-0.5 text-[10px] font-medium text-blue">
                              {section.section_type}
                            </span>
                          </div>

                          <p className="mt-0.5 text-[10px] text-slate">
                            Key: {section.section_key} ·
                            Order: {section.sort_order}
                          </p>

                          <p className="mt-1.5 max-w-2xl text-[11px] leading-4 text-slate">
                            {description}
                          </p>

                          {section.title && (
                            <div className="mt-2 border-l-2 border-blue pl-2.5">
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate">
                                Current title
                              </p>

                              <p className="mt-0.5 text-xs font-medium text-ink">
                                {section.title}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            moveSection(
                              section,
                              "up"
                            )
                          }
                          disabled={
                            index === 0 || saving
                          }
                          title="Move up"
                          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-line bg-white text-xs text-slate transition hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            moveSection(
                              section,
                              "down"
                            )
                          }
                          disabled={
                            index ===
                              sections.length - 1 ||
                            saving
                          }
                          title="Move down"
                          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-line bg-white text-xs text-slate transition hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          ↓
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleToggle(section)
                          }
                          disabled={saving}
                          className="rounded-[3px] border border-line bg-white px-3 py-1.5 text-[10px] font-semibold text-ink transition hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50"
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
                          className="rounded-[3px] bg-ink px-3.5 py-1.5 text-[10px] font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(section)
                          }
                          disabled={saving}
                          className="rounded-[3px] border border-red-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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

        {/* EDITOR MODAL */}
        <HomeSectionEditor
          section={editing}
          sectionName={
            editing
              ? SECTION_NAMES[editing.section_key] ??
                editing.section_key
              : ""
          }
          saving={saving}
          onClose={() => {
            if (!saving) {
              setEditing(null);
            }
          }}
          onChange={updateEditing}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}