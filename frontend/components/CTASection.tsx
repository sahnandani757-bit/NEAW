import Button from "@/components/Button";

type CTASectionProps = {
  title: string;
  description: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

export default function CTASection({
  title,
  description,
  primaryCta,
  secondaryCta,
}: CTASectionProps) {
  return (
    <section className="relative overflow-hidden bg-ink">
      <div className="container-wide relative flex flex-col items-start gap-6 py-16 sm:py-20">
        <h2 className="max-w-xl text-3xl font-bold text-white sm:text-4xl">
          {title}
        </h2>

        <p className="max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">
          {description}
        </p>

        {(primaryCta || secondaryCta) && (
          <div className="mt-2 flex flex-wrap gap-4">
            {primaryCta && (
              <Button
                href={primaryCta.href}
                className="bg-black text-ink hover:bg-blue"
              >
                {primaryCta.label}
              </Button>
            )}

            {secondaryCta && (
              <Button
                href={secondaryCta.href}
                variant="ghost"
                className="border-white/30 text-white hover:border-white hover:text-white"
              >
                {secondaryCta.label}
              </Button>
            )}
          </div>
        )}
      </div>

      <div
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-green/20 blur-2xl"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -bottom-20 right-1/4 h-64 w-64 rounded-full bg-blue/25 blur-2xl"
        aria-hidden="true"
      />
    </section>
  );
}