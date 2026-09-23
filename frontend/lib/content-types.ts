export type Settings = Record<string, string>;

export type NamedItem = {
  id: number;
  title: string;
  description: string;
  sort_order: number;
};

export type ProjectStatus =
  | "Concept"
  | "Development"
  | "Under Construction"
  | "Operational";

export type Project = {
  id: number;
  slug: string;
  title: string;
  location: string;
  sector: string;
  status: ProjectStatus;
  description: string;
  is_sample: boolean;
  show_on_home: boolean;
  sort_order: number;
  image_id: number | null;
  image_url: string | null;
};

export type Opportunity = {
  id: number;
  category: string;
  title: string;
  description: string;
};
export type Article = {
  id: number;
  slug: string;
  category: string;
  title: string;
  article_date: string;
  description: string;
  featured: boolean;
  show_on_home: boolean;
  image_url: string | null;
};

export type JobOpening = {
  id: number;
  slug: string;
  title: string;
  location: string;
  employment_type: string;
  summary: string;
  is_open: boolean;
};

export type PageContentBlock = {
  id: number;
  page_slug: string;
  block_key: string;
  value: string;
  image_url: string | null;
};
export type HomeSection = {
  id: number;
  section_key: string;
  section_type: string;
  eyebrow: string;
  title: string;
  description: string;
  content: string;
  image_id: number | null;
  image_alt: string;
  enabled: boolean;
  sort_order: number;
  button_1_label: string;
  button_1_url: string;
  button_2_label: string;
  button_2_url: string;
  image_url: string | null;
};