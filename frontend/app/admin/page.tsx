import Link from "next/link";

const CARDS = [
  {
    href: "/admin/settings",
    title: "Settings",
    desc: "Company name, tagline, contact info, and social links.",
  },
  {
    href: "/admin/page-content",
    title: "Page Content",
    desc: "Freeform text and images for page content blocks.",
  },
  {
    href: "/admin/lists",
    title: "Content Lists",
    desc: "Manage focus areas, values, partnership types, and other lists.",
  },
  {
    href: "/admin/projects",
    title: "Projects",
    desc: "Add, edit, or remove project cards.",
  },
  {
    href: "/admin/opportunities",
    title: "Opportunities",
    desc: "Manage opportunity categories and content.",
  },
  {
    href: "/admin/articles",
    title: "Insights / Articles",
    desc: "Manage news and insight articles.",
  },
  {
    href: "/admin/jobs",
    title: "Job Openings",
    desc: "Manage open roles and career opportunities.",
  },
  {
    href: "/admin/images",
    title: "Images",
    desc: "Upload and manage website images.",
  },
  {
    href: "/admin/home",
    title: "Home",
    desc: "Manage Home page sections, content, buttons, and order.",
  },
  {
    href: "/admin/about",
    title: "About",
    desc: "Manage About page sections, content, images, and buttons.",
  },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-full bg-white">
      <div className="container-wide px-5 py-6 sm:px-8 sm:py-8">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-line pb-5">
          <div>
            <span className="text-[11px] font-semibold text-blue">
              NEAW CONTENT MANAGEMENT
            </span>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">
              Dashboard
            </h1>

            <p className="mt-1.5 max-w-xl text-xs leading-5 text-slate">
              Manage the content and structure of the NEAW website from one
              place.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/"
              className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[11px] font-semibold text-ink transition hover:bg-surface-alt"
            >
              View Website
            </Link>
          </div>
        </div>

        {/* Section heading */}
        <div className="mt-6">
          <span className="text-[11px] font-semibold text-blue">
            WEBSITE MANAGEMENT
          </span>

          <h2 className="mt-0.5 text-base font-bold text-ink">
            Manage your website
          </h2>

          <p className="mt-0.5 text-xs text-slate">
            Select a section to manage its content and settings.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-[10px] border border-line bg-white p-3.5 transition hover:border-blue/30 hover:bg-surface-alt"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-pale text-[11px] font-bold text-blue">
                  {card.title.charAt(0)}
                </div>

                <span className="text-sm text-slate transition-transform group-hover:translate-x-1 group-hover:text-blue">
                  →
                </span>
              </div>

              <h3 className="mt-3 text-sm font-bold text-ink">
                {card.title}
              </h3>

              <p className="mt-1 text-[11px] leading-4.5 text-slate">
                {card.desc}
              </p>

              <div className="mt-2.5 text-[11px] font-semibold text-blue">
                Manage {card.title}
              </div>
            </Link>
          ))}
        </div>

        {/* API */}
        <section className="mt-6 rounded-[10px] border border-line bg-surface-alt p-3.5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-[11px] font-semibold text-blue">
                DEVELOPER ACCESS
              </span>

              <h2 className="mt-0.5 text-sm font-bold text-ink">
                API documentation
              </h2>

              <p className="mt-0.5 text-[11px] leading-4 text-slate">
                Use the backend API for bulk edits, integrations, and
                automation.
              </p>
            </div>

            <Link
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-full border border-line bg-white px-3.5 py-1.5 text-[11px] font-semibold text-ink transition hover:bg-white/70"
            >
              Open API Docs ↗
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}