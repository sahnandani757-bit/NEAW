import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import CTASection from "@/components/CTASection";
import Button from "@/components/Button";
import { getContentList } from "@/lib/api";

export const metadata: Metadata = { title: "Partnerships" };

export default async function PartnershipsPage() {
  const partnershipTypes = await getContentList("partnership_types");
  return (
    <>
      <section className="border-b border-line bg-blue-pale/40 py-16 sm:py-24">
        <div className="container-wide flex flex-col gap-4">
          <span className="text-sm font-semibold text-blue">
            Partnerships
          </span>

          <h1 className="max-w-2xl text-4xl font-extrabold text-ink sm:text-5xl">
            Building Nepal&rsquo;s future together
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-slate sm:text-lg">
            We believe meaningful progress comes through strong partnerships.
            By bringing together local knowledge, technical expertise,
            investment, and shared ambition, we work with partners to develop
            practical opportunities that contribute to Nepal&rsquo;s long-term
            growth and development.
          </p>
        </div>
      </section>
      <section className="border-y border-line bg-ink py-16 sm:py-20">
        <div className="container-wide flex flex-col items-start gap-6">
          <h2 className="max-w-lg text-3xl font-bold text-white sm:text-4xl">
            Discuss a Partnership
          </h2>

          <p className="max-w-md text-base leading-relaxed text-white/75">
            Whether you have a project, investment opportunity, technical
            capability, or collaboration idea, we would be interested in
            hearing from you. Tell us about your organisation and what you
            have in mind, and our team will explore how we can work together.
          </p>

          <Button
            href="/contact"
            className="bg-white text-ink hover:bg-blue-pale"
          >
            Discuss a Partnership
          </Button>
        </div>
      </section>
      <section className="container-wide py-16 sm:py-24">
        <div className="flex flex-col gap-10">
          <SectionHeading
            title="Ways to work with us"
            description="We offer flexible partnership opportunities for organisations looking to contribute to or participate in projects and initiatives across Nepal."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {partnershipTypes.map((type) => (
              <div
                key={type.id}
                className="border border-line bg-white p-8 transition-shadow hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-ink">
                  {type.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate">
                  {type.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CTASection
        title="Already have a project or proposal?"
        description="Share your project details, objectives, and requirements with our team. We will review your proposal and get back to you to discuss the next steps."
        primaryCta={{ label: "Contact us", href: "/contact" }}
        secondaryCta={{
          label: "View opportunities",
          href: "/opportunities",
        }}
      />
    </>
  );
}