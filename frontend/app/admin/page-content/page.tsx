"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin/client";

type Block = {
  id: number;
  page_slug: string;
  block_key: string;
  value: string;
};

export default function AdminPageContentPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Block> | null>(null);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setLoading(true);
    const data = await adminFetch("/page-content");
    setBlocks(data);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleSave() {
    if (!editing) return;

    setSaving(true);

    await adminFetch("/page-content", {
      method: "PUT",
      body: JSON.stringify({
        page_slug: editing.page_slug,
        block_key: editing.block_key,
        value: editing.value ?? "",
      }),
    });

    setEditing(null);
    setSaving(false);
    refresh();
  }

  const byPage = blocks.reduce<Record<string, Block[]>>((acc, b) => {
    (acc[b.page_slug] ??= []).push(b);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-5 lg:px-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                Page Content
              </h1>

              <span className="rounded-[3px] bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                {blocks.length} blocks
              </span>
            </div>

            <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
              Manage freeform text blocks such as hero headings and intro
              paragraphs. Each block is identified by a page and block key.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setEditing({
                page_slug: "",
                block_key: "",
                value: "",
              })
            }
            className="w-fit rounded-[3px] bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            + Add Block
          </button>
        </div>

        {/* Summary */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="rounded-[3px] border border-slate-200 bg-white px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Total Blocks
            </p>

            <p className="mt-0.5 text-lg font-semibold text-slate-900">
              {blocks.length}
            </p>
          </div>

          <div className="rounded-[3px] border border-slate-200 bg-white px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Pages
            </p>

            <p className="mt-0.5 text-lg font-semibold text-slate-900">
              {Object.keys(byPage).length}
            </p>
          </div>

          <div className="col-span-2 rounded-[3px] border border-slate-200 bg-white px-3 py-2 sm:col-span-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Status
            </p>

            <p className="mt-0.5 text-lg font-semibold text-slate-900">
              Active
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="mt-5 rounded-[3px] border border-slate-200 bg-white p-6 text-center">
            <p className="text-sm text-slate-500">Loading page content…</p>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-5">
            {Object.entries(byPage).map(([page, items]) => (
              <div key={page}>
                {/* Page Header */}
                <div className="mb-2 flex items-center gap-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {page}
                  </h2>

                  <span className="rounded-[3px] bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                    {items.length}{" "}
                    {items.length === 1 ? "block" : "blocks"}
                  </span>
                </div>

                {/* Blocks Card */}
                <div className="overflow-hidden rounded-[3px] border border-slate-200 bg-white shadow-sm">
                  {items.map((b, index) => (
                    <div
                      key={b.id}
                      className={`flex items-start justify-between gap-4 px-4 py-3 ${
                        index !== items.length - 1
                          ? "border-b border-slate-200"
                          : ""
                      }`}
                    >
                      <div className="flex min-w-0 flex-1 gap-3">
                        {/* Number */}
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[3px] bg-slate-100 text-[10px] font-bold text-slate-500">
                          {index + 1}
                        </div>

                        {/* Block Content */}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="text-xs font-semibold text-slate-800">
                              {b.block_key}
                            </p>

                            <span className="rounded-[3px] bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                              Content
                            </span>
                          </div>

                          <p className="mt-1 text-[10px] font-medium text-slate-400">
                            Page: {b.page_slug} · ID: {b.id}
                          </p>

                          <div className="mt-2 rounded-[3px] bg-slate-50 px-3 py-2">
                            <p className="text-xs leading-5 text-slate-700">
                              {b.value || (
                                <span className="italic text-slate-400">
                                  Empty value
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <button
                        type="button"
                        onClick={() => setEditing(b)}
                        className="shrink-0 rounded-[3px] bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {blocks.length === 0 && (
              <div className="rounded-[3px] border border-dashed border-slate-300 bg-white p-8 text-center">
                <h2 className="text-sm font-semibold text-slate-800">
                  No Page Content
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Create a content block to start managing page text.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setEditing({
                      page_slug: "",
                      block_key: "",
                      value: "",
                    })
                  }
                  className="mt-4 rounded-[3px] bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                >
                  + Add Block
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {editing && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-3 sm:p-4">
          <div className="flex h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[3px] border border-slate-200 bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {editing.id != null
                    ? "Edit Content Block"
                    : "Add Content Block"}
                </h2>

                <p className="mt-0.5 text-[11px] text-slate-500">
                  Configure the page content block below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditing(null)}
                className="flex h-7 w-7 items-center justify-center rounded-[3px] text-lg leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
              <div className="space-y-4 p-4">
                {/* Basic Information */}
                <div className="rounded-[3px] border border-slate-200">
                  <div className="border-b border-slate-200 bg-slate-50 px-3 py-2">
                    <h3 className="text-xs font-semibold text-slate-800">
                      Basic Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2">
                    {/* Page Slug */}
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-slate-700">
                        Page slug
                      </label>

                      <input
                        value={editing.page_slug ?? ""}
                        disabled={editing.id != null}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            page_slug: e.target.value,
                          })
                        }
                        placeholder="home"
                        className="h-9 w-full rounded-[3px] border border-slate-300 bg-white px-2.5 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                      />
                    </div>

                    {/* Block Key */}
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-slate-700">
                        Block key
                      </label>

                      <input
                        value={editing.block_key ?? ""}
                        disabled={editing.id != null}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            block_key: e.target.value,
                          })
                        }
                        placeholder="hero_title"
                        className="h-9 w-full rounded-[3px] border border-slate-300 bg-white px-2.5 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="rounded-[3px] border border-slate-200">
                  <div className="border-b border-slate-200 bg-slate-50 px-3 py-2">
                    <h3 className="text-xs font-semibold text-slate-800">
                      Content
                    </h3>
                  </div>

                  <div className="p-3">
                    <label className="mb-1 block text-[11px] font-medium text-slate-700">
                      Value
                    </label>

                    <textarea
                      value={editing.value ?? ""}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          value: e.target.value,
                        })
                      }
                      rows={8}
                      placeholder="Enter content..."
                      className="w-full resize-y rounded-[3px] border border-slate-300 px-2.5 py-2 text-xs leading-5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-200"
                    />

                    <p className="mt-1.5 text-[10px] text-slate-400">
                      Enter the text that should appear for this content
                      block.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 bg-slate-50/70 px-4 py-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="h-9 rounded-[3px] border border-slate-300 bg-white px-3.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="h-9 rounded-[3px] bg-slate-900 px-4 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}