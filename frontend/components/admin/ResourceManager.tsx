"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { adminFetch } from "@/lib/admin/client";
import ImagePicker from "@/components/admin/ImagePicker";

export type FieldConfig = {
  name: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "select"
    | "checkbox"
    | "image";
  options?: string[];
  required?: boolean;
};

type ResourceManagerProps = {
  title: string;
  description?: string;
  endpoint: string;
  fields: FieldConfig[];
  emptyItem: Record<string, any>;
  columns: string[];
  idField?: string;
};

export default function ResourceManager({
  title,
  description,
  endpoint,
  fields,
  emptyItem,
  columns,
  idField = "id",
}: ResourceManagerProps) {
  const [items, setItems] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);

    try {
      const data = await adminFetch(endpoint);
      setItems(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load data",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  /*
   * Lock background page scrolling while editor is open.
   * The modal itself has no internal scrollbar.
   */
  useEffect(() => {
    if (!editing) return;

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
  }, [editing]);

  function startCreate() {
    setEditing({ ...emptyItem });
    setError(null);
  }

  function startEdit(item: Record<string, any>) {
    setEditing({ ...item });
    setError(null);
  }

  function closeEditor() {
    if (saving) return;

    setEditing(null);
    setError(null);
  }

  function handleFieldChange(
    field: FieldConfig,
    value: string | number | boolean | null,
  ) {
    setEditing((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        [field.name]: value,
      };
    });
  }

  async function handleSave() {
    if (!editing) return;

    setSaving(true);
    setError(null);

    try {
      const payload: Record<string, any> = {};

      for (const f of fields) {
        if (f.type === "number") {
          payload[f.name] = Number(editing[f.name] ?? 0);
        } else if (f.type === "checkbox") {
          payload[f.name] = Boolean(editing[f.name]);
        } else if (f.type === "image") {
          payload[f.name] = editing[f.name] ?? null;
        } else {
          payload[f.name] = editing[f.name] ?? "";
        }
      }

      /*
       * Keep image_id support for resources where the image field
       * is represented separately in emptyItem.
       */
      if ("image_id" in emptyItem) {
        payload.image_id = editing.image_id ?? null;
      }

      if (editing[idField] != null) {
        await adminFetch(`${endpoint}/${editing[idField]}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await adminFetch(endpoint, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setEditing(null);
      await refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Save failed",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: Record<string, any>) {
    if (
      !confirm(
        `Delete "${item.title ?? item[idField]}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await adminFetch(`${endpoint}/${item[idField]}`, {
        method: "DELETE",
      });

      await refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Delete failed",
      );
    }
  }

  const getFieldLabel = (name: string) =>
    fields.find((f) => f.name === name)?.label ?? name;

  const inputClass =
    "w-full rounded-[3px] border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10";

  const labelClass =
    "mb-1 block text-[11px] font-semibold text-slate-600";

  const sectionClass =
    "rounded-[3px] border border-slate-200 bg-white p-3";

  const getDisplayValue = (
    item: Record<string, any>,
    column: string,
  ) => {
    const value = item[column];

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "—";
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  };

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-5 lg:px-6">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-slate-900">
                {title}
              </h1>

              <span className="rounded-[3px] border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                {items.length}
              </span>
            </div>

            {description && (
              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center justify-center rounded-[3px] bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            + Add New
          </button>
        </div>

        {/* Summary */}
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-[3px] border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Total
            </div>

            <div className="mt-0.5 text-lg font-semibold text-slate-900">
              {items.length}
            </div>
          </div>

          <div className="rounded-[3px] border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Fields
            </div>

            <div className="mt-0.5 text-lg font-semibold text-slate-900">
              {fields.length}
            </div>
          </div>

          <div className="rounded-[3px] border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Status
            </div>

            <div className="mt-0.5 text-lg font-semibold text-slate-900">
              Active
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-[3px] border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Resource List */}
        <div className={sectionClass}>
          <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h2 className="text-xs font-semibold text-slate-800">
                Resource List
              </h2>

              <p className="mt-0.5 text-[10px] text-slate-400">
                Manage existing records and update their details.
              </p>
            </div>

            {!loading && (
              <span className="text-[10px] font-medium text-slate-400">
                {items.length} record
                {items.length === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-xs text-slate-400">
                Loading...
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-[3px] border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
              <div className="text-xs font-medium text-slate-500">
                No records found
              </div>

              <div className="mt-1 text-[10px] text-slate-400">
                Add a new record to get started.
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-hidden rounded-[3px] border border-slate-200 md:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="w-12 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          #
                        </th>

                        {columns.map((column) => (
                          <th
                            key={column}
                            className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                          >
                            {getFieldLabel(column)}
                          </th>
                        ))}

                        <th className="w-32 px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {items.map((item, index) => (
                        <tr
                          key={item[idField] ?? index}
                          className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70"
                        >
                          <td className="px-3 py-2.5 text-[10px] font-medium text-slate-400">
                            {index + 1}
                          </td>

                          {columns.map((column) => (
                            <td
                              key={column}
                              className="max-w-[280px] px-3 py-2.5 text-xs text-slate-700"
                            >
                              <div className="truncate">
                                {getDisplayValue(item, column)}
                              </div>
                            </td>
                          ))}

                          <td className="px-3 py-2.5">
                            <div className="flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => startEdit(item)}
                                className="rounded-[3px] border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(item)}
                                className="rounded-[3px] border border-red-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-red-600 transition hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-2.5 md:hidden">
                {items.map((item, index) => (
                  <div
                    key={item[idField] ?? index}
                    className="rounded-[3px] border border-slate-200 bg-white p-3"
                  >
                    <div className="mb-2.5 flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-[3px] bg-slate-100 text-[10px] font-semibold text-slate-500">
                          {index + 1}
                        </span>

                        <span className="text-[11px] font-semibold text-slate-800">
                          {item.title ??
                            item.name ??
                            item[idField] ??
                            `Record ${index + 1}`}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {columns.map((column) => (
                        <div
                          key={column}
                          className="grid grid-cols-[110px_1fr] gap-2"
                        >
                          <div className="text-[10px] font-semibold text-slate-400">
                            {getFieldLabel(column)}
                          </div>

                          <div className="break-words text-[11px] text-slate-700">
                            {getDisplayValue(item, column)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex justify-end gap-1.5 border-t border-slate-100 pt-2.5">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="rounded-[3px] border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="rounded-[3px] border border-red-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Editor Modal */}
      {editing &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-3 sm:p-4"
            onWheel={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="resource-editor-title"
              className="flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[3px] border border-slate-200 bg-white shadow-2xl"
              onWheel={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-2.5">
                <div className="min-w-0">
                  <h2
                    id="resource-editor-title"
                    className="truncate text-sm font-semibold text-slate-900"
                  >
                    {editing[idField] != null
                      ? `Edit ${title}`
                      : `Add ${title}`}
                  </h2>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Update the information below and save your changes.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={saving}
                  className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-[3px] border border-slate-200 bg-white text-sm text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {/* Form */}
              <div className="min-h-0 flex-1 overflow-hidden">
                <div className="h-full px-4 py-3">
                  {error && (
                    <div className="mb-3 rounded-[3px] border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {fields.map((f) => {
                      const value = editing[f.name];

                      const fullWidth =
                        f.type === "textarea" ||
                        f.type === "image";

                      return (
                        <div
                          key={f.name}
                          className={
                            fullWidth ? "md:col-span-2" : ""
                          }
                        >
                          {f.type !== "checkbox" && (
                            <label className={labelClass}>
                              {f.label}

                              {f.required && (
                                <span className="ml-0.5 text-red-500">
                                  *
                                </span>
                              )}
                            </label>
                          )}

                          {/* Text */}
                          {f.type === "text" && (
                            <input
                              type="text"
                              value={value ?? ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  f,
                                  e.target.value,
                                )
                              }
                              required={f.required}
                              className={inputClass}
                            />
                          )}

                          {/* Number */}
                          {f.type === "number" && (
                            <input
                              type="number"
                              value={value ?? ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  f,
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value),
                                )
                              }
                              required={f.required}
                              className={inputClass}
                            />
                          )}

                          {/* Textarea */}
                          {f.type === "textarea" && (
                            <textarea
                              value={value ?? ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  f,
                                  e.target.value,
                                )
                              }
                              required={f.required}
                              rows={3}
                              className={`${inputClass} resize-none`}
                            />
                          )}

                          {/* Select */}
                          {f.type === "select" && (
                            <select
                              value={value ?? ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  f,
                                  e.target.value,
                                )
                              }
                              required={f.required}
                              className={inputClass}
                            >
                              <option value="">
                                Select...
                              </option>

                              {f.options?.map((option) => (
                                <option
                                  key={option}
                                  value={option}
                                >
                                  {option}
                                </option>
                              ))}
                            </select>
                          )}

                          {/* Checkbox */}
                          {f.type === "checkbox" && (
                            <label className="flex min-h-[31px] items-center gap-2 rounded-[3px] border border-slate-200 bg-white px-2.5 py-1.5">
                              <input
                                type="checkbox"
                                checked={Boolean(value)}
                                onChange={(e) =>
                                  handleFieldChange(
                                    f,
                                    e.target.checked,
                                  )
                                }
                                className="h-3.5 w-3.5 rounded border-slate-300"
                              />

                              <span className="text-[11px] font-semibold text-slate-600">
                                {f.label}

                                {f.required && (
                                  <span className="ml-0.5 text-red-500">
                                    *
                                  </span>
                                )}
                              </span>
                            </label>
                          )}

                          {/* Image */}
                          {f.type === "image" && (
                            <div className="rounded-[3px] border border-slate-200 bg-slate-50 p-2.5">
                              <ImagePicker
                                imageId={
                                  typeof value === "number"
                                    ? value
                                    : value != null
                                      ? Number(value)
                                      : null
                                }
                                imageUrl={
                                  editing[
                                    `${f.name}_url`
                                  ] ??
                                  editing.image_url ??
                                  null
                                }
                                onChange={(
                                  imageId,
                                  imageUrl,
                                ) => {
                                  setEditing((prev) => {
                                    if (!prev) return prev;

                                    return {
                                      ...prev,
                                      [f.name]:
                                        imageId,
                                      [`${f.name}_url`]:
                                        imageUrl,
                                      ...(f.name === "image_id"
                                        ? {
                                            image_id:
                                              imageId,
                                          }
                                        : {}),
                                      ...(f.name === "image_id"
                                        ? {
                                            image_url:
                                              imageUrl,
                                          }
                                        : {}),
                                    };
                                  });
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-white px-4 py-2.5">
                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={saving}
                  className="rounded-[3px] border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-[3px] bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}