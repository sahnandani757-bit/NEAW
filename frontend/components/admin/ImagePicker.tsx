"use client";

import { useEffect, useRef, useState } from "react";
import { adminFetch, API_URL } from "@/lib/admin/client";

type Img = { id: number; filename: string; content_type: string; alt_text: string; size_bytes: number; url: string };

export default function AdminImagesPage() {
  const [images, setImages] = useState<Img[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    setLoading(true);
    const data = await adminFetch("/images");
    setImages(data);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleUpload(file: File) {
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("alt_text", file.name);
    await adminFetch("/images", { method: "POST", body: form });
    setUploading(false);
    refresh();
  }

  async function handleDelete(img: Img) {
    if (!confirm(`Delete "${img.filename}"? Anything still using it will show a broken image.`)) return;
    await adminFetch(`/images/${img.id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Images</h1>
          <p className="mt-1 text-sm text-slate-500">
            Stored directly in Postgres. Used by Projects and Articles — upload here, or upload inline
            from those forms.
          </p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="shrink-0 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Upload image"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = "";
          }}
        />
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {images.map((img) => (
            <div key={img.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="flex h-28 items-center justify-center bg-slate-100">
                <img src={`${API_URL}${img.url}`} alt={img.alt_text} className="h-full w-full object-cover" />
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-medium text-slate-700">{img.filename}</p>
                <p className="text-xs text-slate-400">{(img.size_bytes / 1024).toFixed(0)} KB</p>
                <button
                  onClick={() => handleDelete(img)}
                  className="mt-2 text-xs font-medium text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {images.length === 0 && (
            <p className="col-span-full rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
              No images uploaded yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
