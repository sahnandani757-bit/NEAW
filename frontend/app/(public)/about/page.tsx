import type { Metadata } from "next";

import SectionHeading from "@/components/SectionHeading";
import ImageSection from "@/components/ImageSection";
import CTASection from "@/components/CTASection";
import TopoArt from "@/components/TopoArt";
import { getContentList, getAboutSections } from "@/lib/api";

export const metadata: Metadata = {
  title: "About",
};

type AboutSection = {
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

function paragraphs(content: string) {
  return content
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default async function AboutPage() {
  const [sections, values] = await Promise.all([
    getAboutSections(),
    getContentList("core_values"),
  ]);

  const enabledSections = sections
    .filter((section) => section.enabled)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <>
      {enabledSections.map((section) => {
        switch (section.section_key) {
          case "hero":
            return (
              <section
                key={section.id}
                className="border-b border-line bg-blue-pale/40 py-16 sm:py-24"
              >
                <div className="container-wide flex flex-col gap-4">
                  {section.eyebrow && (
                    <span className="text-sm font-semibold text-blue">
                      {section.eyebrow}
                    </span>
                  )}

                  <h1 className="max-w-2xl text-4xl font-extrabold text-ink sm:text-5xl">
                    {section.title}
                  </h1>

                  {section.description && (
                    <p className="max-w-2xl text-base leading-relaxed text-slate sm:text-lg">
                      {section.description}
                    </p>
                  )}
                </div>
              </section>
            );

          case "introduction":
            return (
              <section
                key={section.id}
                className="container-wide py-16 sm:py-24"
              >
                <ImageSection
                  eyebrow={section.eyebrow}
                  title={section.title}
                  visual={
                    section.image_url ? (
                      <img
                        src={section.image_url}
                        alt={section.image_alt || section.title}
                        className="h-full w-full rounded-lg object-cover"
                      />
                    ) : (
                      <TopoArt className="h-3/4 w-3/4" />
                    )
                  }
                >
                  {section.description && (
                    <p className="leading-relaxed text-slate">
                      {section.description}
                    </p>
                  )}

                  {paragraphs(section.content).map((paragraph, index) => (
                    <p key={index} className="leading-relaxed text-slate">
                      {paragraph}
                    </p>
                  ))}
                </ImageSection>
              </section>
            );

          case "mission":
          case "vision":
            return null;

          case "focus":
            return (
              <section
                key={section.id}
                className="container-wide py-16 sm:py-24"
              >
                <div className="flex flex-col gap-10">
                  <SectionHeading
                    kicker={section.eyebrow}
                    title={section.title}
                    description={section.description}
                  />

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {values.map((value) => (
                      <div
                        key={value.id}
                        className="border border-line bg-white p-7"
                      >
                        <h3 className="text-lg font-semibold text-ink">
                          {value.title}
                        </h3>

                        <p className="mt-2 text-sm leading-relaxed text-slate">
                          {value.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          case "approach":
            return (
              <section
                key={section.id}
                className="border-y border-line bg-white py-16 sm:py-24"
              >
                <div className="container-wide">
                  <ImageSection
                    eyebrow={section.eyebrow}
                    title={section.title}
                    reverse
                    visual={
                      section.image_url ? (
                        <img
                          src={section.image_url}
                          alt={section.image_alt || section.title}
                          className="h-full w-full rounded-lg object-cover"
                        />
                      ) : (
                        <TopoArt className="h-3/4 w-3/4" />
                      )
                    }
                  >
                    {section.description && (
                      <p className="leading-relaxed text-slate">
                        {section.description}
                      </p>
                    )}

                    {paragraphs(section.content).map((paragraph, index) => (
                      <p key={index} className="leading-relaxed text-slate">
                        {paragraph}
                      </p>
                    ))}
                  </ImageSection>
                </div>
              </section>
            );

          case "partnerships":
            return (
              <section
                key={section.id}
                className="container-wide py-16 sm:py-24"
              >
                <ImageSection
                  eyebrow={section.eyebrow}
                  title={section.title}
                  visual={
                    section.image_url ? (
                      <img
                        src={section.image_url}
                        alt={section.image_alt || section.title}
                        className="h-full w-full rounded-lg object-cover"
                      />
                    ) : (
                      <TopoArt className="h-3/4 w-3/4" />
                    )
                  }
                >
                  {section.description && (
                    <p className="leading-relaxed text-slate">
                      {section.description}
                    </p>
                  )}

                  {paragraphs(section.content).map((paragraph, index) => (
                    <p key={index} className="leading-relaxed text-slate">
                      {paragraph}
                    </p>
                  ))}
                </ImageSection>
              </section>
            );

          case "final_cta":
            return (
              <CTASection
                key={section.id}
                title={section.title}
                description={section.description}
                primaryCta={
                  section.button_1_label && section.button_1_url
                    ? {
                        label: section.button_1_label,
                        href: section.button_1_url,
                      }
                    : undefined
                }
                secondaryCta={
                  section.button_2_label && section.button_2_url
                    ? {
                        label: section.button_2_label,
                        href: section.button_2_url,
                      }
                    : undefined
                }
              />
            );

          default:
            return null;
        }
      })}

      {/* Mission and Vision are rendered together to preserve the existing design. */}
      {enabledSections.some((section) => section.section_key === "mission") ||
      enabledSections.some((section) => section.section_key === "vision") ? (
        <section className="border-y border-line bg-white py-16 sm:py-24">
          <div className="container-wide grid grid-cols-1 gap-10 lg:grid-cols-2">
            {enabledSections
              .filter(
                (section) =>
                  section.section_key === "mission" ||
                  section.section_key === "vision"
              )
              .map((section) => (
                <div
                  key={section.id}
                  className="flex flex-col gap-4 border border-line p-8"
                >
                  <span
                    className={
                      section.section_key === "mission"
                        ? "text-sm font-semibold text-blue"
                        : "text-sm font-semibold text-green"
                    }
                  >
                    {section.eyebrow}
                  </span>

                  <h2 className="text-2xl font-bold text-ink">
                    {section.title}
                  </h2>

                  <p className="text-base leading-relaxed text-slate">
                    {section.content || section.description}
                  </p>
                </div>
              ))}
          </div>
        </section>
      ) : null}
    </>
  );
}