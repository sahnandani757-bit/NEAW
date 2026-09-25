"use client";

import { useEffect, useRef, useState } from "react";
import { adminFetch, API_URL } from "@/lib/admin/client";

type Img = {
  id: number;
  filename: string;
  content_type: string;
  alt_text: string;
  size_bytes: number;
  url: string;
};

export default function AdminImagesPage() {
  const [images, setImages] = useState<Img[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    setLoading(true);

    try {
      const data = await adminFetch("/images");
      setImages(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleUpload(file: File) {
    setUploading(true);

    try {
      const form = new FormData();

      form.append("file", file);
      form.append("alt_text", file.name);

      await adminFetch("/images", {
        method: "POST",
        body: form,
      });

      await refresh();
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(img: Img) {
    if (
      !confirm(
        `Delete "${img.filename}"? Anything still using it will show a broken image.`,
      )
    ) {
      return;
    }

    await adminFetch(`/images/${img.id}`, {
      method: "DELETE",
    });

    await refresh();
  }

  const totalSize = images.reduce(
    (total, img) => total + img.size_bytes,
    0,
  );

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-5 lg:px-6">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-slate-900">
                Images
              </h1>

              <span className="rounded-[3px] border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                {images.length}
              </span>
            </div>

            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
              Manage uploaded images used across Projects, Articles and other
              website content.
            </p>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center justify-center rounded-[3px] bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "+ Upload Image"}
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (file) {
                handleUpload(file);
              }

              e.target.value = "";
            }}
          />
        </div>

        {/* Summary */}
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-[3px] border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Total Images
            </div>

            <div className="mt-0.5 text-lg font-semibold text-slate-900">
              {images.length}
            </div>
          </div>

          <div className="rounded-[3px] border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Storage Used
            </div>

            <div className="mt-0.5 text-lg font-semibold text-slate-900">
              {(totalSize / 1024 / 1024).toFixed(2)} MB
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

        {/* Image Library */}
        <div className="rounded-[3px] border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h2 className="text-xs font-semibold text-slate-800">
                Image Library
              </h2>

              <p className="mt-0.5 text-[10px] text-slate-400">
                Images stored in PostgreSQL and available for content editors.
              </p>
            </div>

            {!loading && (
              <span className="text-[10px] font-medium text-slate-400">
                {images.length} file{images.length === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-xs text-slate-400">
                Loading images…
              </span>
            </div>
          ) : images.length === 0 ? (
            /* Empty */
            <div className="rounded-[3px] border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-[3px] border border-slate-200 bg-white text-lg text-slate-300">
                +
              </div>

              <p className="text-xs font-medium text-slate-500">
                No images uploaded yet
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                Upload an image to add it to your media library.
              </p>

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-3 rounded-[3px] bg-slate-900 px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-slate-800"
              >
                Upload Image
              </button>
            </div>
          ) : (
            /* Image Grid */
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="group overflow-hidden rounded-[3px] border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
                >
                  {/* Image */}
                  <div className="relative flex h-32 items-center justify-center overflow-hidden bg-slate-100">
                    <img
                      src={`${API_URL}${img.url}`}
                      alt={img.alt_text}
                      className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                    />

                    <div className="absolute left-2 top-2 rounded-[3px] border border-white/60 bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 shadow-sm">
                      #{img.id}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-2.5">
                    <p
                      title={img.filename}
                      className="truncate text-[11px] font-semibold text-slate-700"
                    >
                      {img.filename}
                    </p>

                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="text-[9px] text-slate-400">
                        {(img.size_bytes / 1024).toFixed(0)} KB
                      </span>

                      <span className="truncate text-[9px] text-slate-400">
                        {img.content_type}
                      </span>
                    </div>

                    {img.alt_text && (
                      <p
                        title={img.alt_text}
                        className="mt-1.5 truncate text-[9px] text-slate-400"
                      >
                        {img.alt_text}
                      </p>
                    )}

                    <div className="mt-2.5 border-t border-slate-100 pt-2">
                      <button
                        type="button"
                        onClick={() => handleDelete(img)}
                        className="w-full rounded-[3px] border border-white bg-black px-2 py-1.5 text-[10px] font-semibold text-white transition hover:bg-white hover:text-black hover:border-black cursor-pointer "
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}