"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin/client";

const LABELS: Record<string, string> = {
  name: "Company name",
  shortName: "Short name",
  tagline: "Tagline",
  email: "Email",
  phone: "Phone",
  location: "Location",
  website: "Website",
  linkedin: "LinkedIn URL",
  facebook: "Facebook URL",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    adminFetch("/settings").then((data) => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  async function save() {
    setSaving(true);

    const payload = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
    }));

    await adminFetch("/settings", {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    setSaving(false);
    setSavedAt(Date.now());
  }

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    );
  }

  const keys = Array.from(
    new Set([...Object.keys(LABELS), ...Object.keys(settings)])
  );

  return (
    <div className="w-full max-w-4xl p-5 px-6 sm:px-6 lg:px-10">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Manage company information used across the website.
        </p>
      </div>

      {/* Settings Card */}
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        {/* Card Header */}
        <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">
            Company Information
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Update the details displayed on the website.
          </p>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 gap-x-5 gap-y-3 p-4 sm:grid-cols-2">
          {keys.map((key) => (
            <div key={key}>
              <label
                htmlFor={`setting-${key}`}
                className="mb-1 block text-xs font-medium text-slate-700"
              >
                {LABELS[key] ?? key}
              </label>

              <input
                id={`setting-${key}`}
                value={settings[key] ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    [key]: e.target.value,
                  }))
                }
                className="h-9 w-full rounded-[3px] border border-slate-300 bg-white px-2.5 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-200"
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-4 py-3">
          <div className="min-h-[18px]">
            {savedAt && (
              <span className="text-xs font-medium text-green-600">
                ✓ Changes saved
              </span>
            )}
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="h-9 rounded-[3px] bg-slate-900 px-4 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}