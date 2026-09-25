import type {
  Article,
  AboutSection,
  HomeSection,
  JobOpening,
  NamedItem,
  Opportunity,
  PageContentBlock,
  Project,
  Settings,
} from "@/lib/content-types";

// -----------------------------------------------------------------------
// Every page reads content through the functions in this file — never by
// hardcoding an array or importing the database. That boundary is what
// lets an editor change content in the admin panel (or via the FastAPI
// endpoints directly) and have it show up on the site with no code
// change. If the API is unreachable (e.g. backend not started yet in
// dev), each function falls back to an empty/default value so the site
// still renders instead of crashing.
// -----------------------------------------------------------------------

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiGet<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export async function getSettings(): Promise<Settings> {
  return apiGet<Settings>("/settings", {});
}

export async function getContentList(listKey: string): Promise<NamedItem[]> {
  return apiGet<NamedItem[]>(`/lists/${listKey}`, []);
}

export async function getProjects(): Promise<Project[]> {
  return apiGet<Project[]>("/projects", []);
}
export async function getAboutSections(): Promise<AboutSection[]> {
  return apiGet<AboutSection[]>("/about-sections", []);
}
export async function getHomeSections(): Promise<HomeSection[]> {
  return apiGet<HomeSection[]>("/home-sections", []);
}

export async function getProject(slug: string): Promise<Project | null> {
  return apiGet<Project | null>(`/projects/${slug}`, null);
}

export async function getOpportunities(): Promise<Opportunity[]> {
  return apiGet<Opportunity[]>("/opportunities", []);
}

export async function getArticles(): Promise<Article[]> {
  return apiGet<Article[]>("/articles", []);
}

export async function getFeaturedArticle(): Promise<Article | null> {
  const articles = await getArticles();
  return articles.find((a) => a.featured) ?? articles[0] ?? null;
}

export async function getJobOpenings(): Promise<JobOpening[]> {
  return apiGet<JobOpening[]>("/job-openings", []);
}

export async function getPageContent(
  pageSlug: string
): Promise<Record<string, PageContentBlock>> {
  const blocks = await apiGet<PageContentBlock[]>(`/page-content/${pageSlug}`, []);
  return Object.fromEntries(blocks.map((b) => [b.block_key, b]));
}

/** Reads one block's text value, or `fallback` if the block hasn't been set yet. */
export function block(
  content: Record<string, PageContentBlock>,
  key: string,
  fallback: string
): string {
  return content[key]?.value ?? fallback;
}
