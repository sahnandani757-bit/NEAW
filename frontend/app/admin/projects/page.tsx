"use client";

import ResourceManager from "@/components/admin/ResourceManager";

export default function AdminProjectsPage() {
  return (
    <ResourceManager
      title="Projects"
      description="Shown as cards on the Home and Projects pages, and on each project's detail page."
      endpoint="/projects"
      columns={["title", "location", "sector", "status"]}
      fields={[
        {
          name: "title",
          label: "Title",
          type: "text",
          required: true,
        },

        {
          name: "slug",
          label: "Slug (used in the URL)",
          type: "text",
          required: true,
        },

        {
          name: "location",
          label: "Location",
          type: "text",
        },

        {
          name: "sector",
          label: "Sector",
          type: "text",
        },

        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            "Concept",
            "Development",
            "Under Construction",
            "Operational",
          ],
        },

        {
          name: "description",
          label: "Description",
          type: "textarea",
        },

        {
          name: "image",
          label: "Image",
          type: "image",
        },

        {
          name: "is_sample",
          label: "Sample content (not a real project yet)",
          type: "checkbox",
        },

        {
          name: "show_on_home",
          label: "Show on Home",
          type: "checkbox",
        },

        {
          name: "sort_order",
          label: "Sort order",
          type: "number",
        },
      ]}
      emptyItem={{
        title: "",
        slug: "",
        location: "",
        sector: "",
        status: "Concept",
        description: "",
        image_id: null,
        image_url: null,
        is_sample: true,
        show_on_home: false,
        sort_order: 0,
      }}
    />
  );
}