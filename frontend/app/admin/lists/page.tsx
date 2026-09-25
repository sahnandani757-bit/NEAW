"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin/client";

const KNOWN_LISTS = [
  { key: "focus_areas", label: "Focus Areas (Home / What We Do)" },
  { key: "core_values", label: "Core Values (About)" },
  { key: "partnership_types", label: "Partnership Types (Partnerships)" },
  { key: "career_reasons", label: "Career Reasons (Careers)" },
  { key: "privacy_sections", label: "Privacy Policy Sections" },
];

type Item = {
  id: number;
  title: string;
  description: string;
  sort_order: number;
};

export default function AdminListsPage() {
  const [listKey, setListKey] = useState(KNOWN_LISTS[0].key);
  const [customKey, setCustomKey] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Item> | null>(null);
  const [saving, setSaving] = useState(false);

  const activeKey = customKey.trim() || listKey;

  async function refresh() {
    setLoading(true);
    const data = await adminFetch(`/lists/${activeKey}`);
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  async function handleSave() {
    if (!editing) return;

    setSaving(true);

    const payload = {
      title: editing.title ?? "",
      description: editing.description ?? "",
      sort_order: editing.sort_order ?? items.length,
    };

    if (editing.id != null) {
      await adminFetch(`/lists/items/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } else {
      await adminFetch(`/lists/${activeKey}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }

    setEditing(null);
    setSaving(false);
    refresh();
  }

  async function handleDelete(item: Item) {
    if (!confirm(`Delete "${item.title}"?`)) return;

    await adminFetch(`/lists/items/${item.id}`, {
      method: "DELETE",
    });

    refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-5 lg:px-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                Content Lists
              </h1>

              <span className="rounded-[3px] bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                {items.length} items
              </span>
            </div>

            <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
              Manage reusable content lists used across the website. Select a
              known list or enter a custom list key.
            </p>
          </div>

          <button
            onClick={() =>
              setEditing({
                title: "",
                description: "",
                sort_order: items.length,
              })
            }
            className="w-fit rounded-[3px] bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            + Add Item
          </button>
        </div>

        {/* Summary */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="rounded-[3px] border border-slate-200 bg-white px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Active List
            </p>
            <p
              className="mt-1 truncate text-sm font-semibold text-slate-900"
              title={activeKey}
            >
              {activeKey}
            </p>
          </div>

          <div className="rounded-[3px] border border-slate-200 bg-white px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Total Items
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {items.length}
            </p>
          </div>

          <div className="rounded-[3px] border border-slate-200 bg-white px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Status
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {loading ? "Loading" : "Ready"}
            </p>
          </div>
        </div>

        {/* List Selector */}
        <div className="mt-4 rounded-[3px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-slate-900">
              List Selection
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Choose an existing content list or enter a custom key.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
            {/* Known List */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600">
                Known List
              </label>

              <select
                value={listKey}
                onChange={(e) => {
                  setListKey(e.target.value);
                  setCustomKey("");
                }}
                className="mt-1 h-9 w-full rounded-[3px] border border-slate-300 bg-white px-2.5 text-xs text-slate-700 outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-200"
              >
                {KNOWN_LISTS.map((list) => (
                  <option key={list.key} value={list.key}>
                    {list.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Key */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600">
                Custom List Key
              </label>

              <input
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="e.g. timeline_milestones"
                className="mt-1 h-9 w-full rounded-[3px] border border-slate-300 bg-white px-2.5 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-200"
              />
            </div>

            <button
              onClick={() =>
                setEditing({
                  title: "",
                  description: "",
                  sort_order: items.length,
                })
              }
              className="h-9 rounded-[3px] bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              + Add Item
            </button>
          </div>

          <div className="mt-3 rounded-[3px] bg-slate-50 px-3 py-2">
            <p className="text-[10px] leading-4 text-slate-500">
              Current list:{" "}
              <span className="font-semibold text-slate-700">
                {activeKey}
              </span>
              . A custom list will only appear on a page after a developer
              connects it using{" "}
              <code className="rounded-[3px] bg-white px-1.5 py-0.5 text-[10px] text-slate-700">
                getContentList(&quot;your_key&quot;)
              </code>
              .
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                List Items
              </h2>
              <p className="text-[11px] text-slate-500">
                Content cards belonging to this list.
              </p>
            </div>

            <span className="rounded-[3px] bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>

          {loading ? (
            <div className="rounded-[3px] border border-slate-200 bg-white px-4 py-8 text-center shadow-sm">
              <p className="text-xs text-slate-500">Loading list items…</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-[3px] border border-slate-200 bg-white shadow-sm transition hover:border-slate-300"
                >
                  <div className="flex items-start gap-3 px-4 py-3">
                    {/* Number */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] bg-slate-100 text-[11px] font-semibold text-slate-600">
                      {index + 1}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-900">
                          {item.title || "Untitled item"}
                        </h3>

                        <span className="rounded-[3px] bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                          Item
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400">
                        <span>ID: {item.id}</span>
                        <span>Sort: {item.sort_order}</span>
                      </div>

                      <div className="mt-2 rounded-[3px] bg-slate-50 px-3 py-2">
                        <p className="line-clamp-2 text-xs leading-5 text-slate-600">
                          {item.description || "No description provided."}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        onClick={() => setEditing(item)}
                        className="rounded-[3px] border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(item)}
                        className="rounded-[3px] border border-red-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <div className="rounded-[3px] border border-dashed border-slate-300 bg-white px-4 py-10 text-center">
                  <p className="text-sm font-medium text-slate-600">
                    No items found
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    No items in &quot;{activeKey}&quot; yet.
                  </p>

                  <button
                    onClick={() =>
                      setEditing({
                        title: "",
                        description: "",
                        sort_order: items.length,
                      })
                    }
                    className="mt-3 rounded-[3px] bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                  >
                    + Add First Item
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit / Add Modal */}
      {editing && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-3 sm:p-4">
          <div className="flex h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[3px] border border-slate-200 bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {editing.id != null ? "Edit Item" : "Add Item"}
                </h2>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  Update the content and display order for this list item.
                </p>
              </div>

              <button
                onClick={() => setEditing(null)}
                className="rounded-[3px] px-2 py-1 text-lg leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-4">
              <div className="space-y-4">
                {/* Basic Information */}
                <div>
                  <div className="mb-2 border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-semibold text-slate-900">
                      Item Information
                    </h3>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Enter the title and supporting description.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Title */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">
                        Title
                      </label>

                      <input
                        value={editing.title ?? ""}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            title: e.target.value,
                          })
                        }
                        className="mt-1 h-9 w-full rounded-[3px] border border-slate-300 px-2.5 text-xs text-slate-700 outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-200"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">
                        Description
                      </label>

                      <textarea
                        value={editing.description ?? ""}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            description: e.target.value,
                          })
                        }
                        rows={7}
                        className="mt-1 w-full resize-y rounded-[3px] border border-slate-300 px-2.5 py-2 text-xs leading-5 text-slate-700 outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-200"
                      />
                    </div>

                    {/* Sort Order */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">
                        Sort Order
                      </label>

                      <input
                        type="number"
                        value={editing.sort_order ?? 0}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            sort_order: Number(e.target.value),
                          })
                        }
                        className="mt-1 h-9 w-full rounded-[3px] border border-slate-300 px-2.5 text-xs text-slate-700 outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-200"
                      />

                      <p className="mt-1 text-[10px] text-slate-400">
                        Lower values appear earlier in the list.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
              <button
                onClick={() => setEditing(null)}
                className="rounded-[3px] border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-[3px] bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}