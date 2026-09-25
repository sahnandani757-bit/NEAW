"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminGuard } from "@/lib/admin/useAdminGuard";
import { clearToken, API_URL } from "@/lib/admin/client";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/home", label: "Home" },
  { href: "/admin/about", label: "About" },
  { href: "/admin/page-content", label: "Page Content" },
  { href: "/admin/lists", label: "Content Lists" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/opportunities", label: "Opportunities" },
  { href: "/admin/articles", label: "Insights / Articles" },
  { href: "/admin/jobs", label: "Job Openings" },
  { href: "/admin/images", label: "Images" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, username } = useAdminGuard();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-xs text-slate">
        Checking session…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-ink">
      {/* Fixed Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-line bg-white">
        {/* Header */}
        <div className="shrink-0 border-b border-line px-4 py-4">
          <p className="text-sm font-bold text-ink">NEAW Admin</p>

          <p className="mt-0.5 truncate text-[11px] text-slate">
            Signed in as {username}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2.5 py-2.5">
          <div className="flex flex-col gap-0.5">
            {NAV.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-[10px] px-3 py-2 text-xs font-medium transition-colors ${
                    active
                      ? "bg-blue-pale text-blue"
                      : "text-slate hover:bg-surface-alt hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="shrink-0 border-t border-line p-2.5">
          <a
            href={`${API_URL}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-[10px] px-3 py-2 text-xs font-medium text-slate transition-colors hover:bg-surface-alt hover:text-ink"
          >
            API docs ↗
          </a>

          <button
            onClick={() => {
              clearToken();
              router.replace("/admin/login");
            }}
            className="mt-0.5 block w-full rounded-[10px] px-3 py-2 text-left text-xs font-medium text-slate transition-colors hover:bg-surface-alt hover:text-ink"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Normal Browser Page Scroll */}
      <main className="ml-56 min-h-screen min-w-0">
        {children}
      </main>
    </div>
  );
}