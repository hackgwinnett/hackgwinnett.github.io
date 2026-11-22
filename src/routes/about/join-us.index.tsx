import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { NewsletterCTA } from "#/components/elements/ctas/NewsletterCTA.tsx";
import { pages } from "cms/pages";
import { md } from "#/lib/markdown";
import { brand } from "#/lib/meta/brand";
const JOIN_US_PAGE_ID = "join-us";

const hgta = {
  name: "HackGwinnett Team Applications 2027", // HGTA
  closed: false,
  form: "/go/hgta27form",
  document: "/go/hgta27app",
  timeline: [
    {
      title: "Applications open",
      description: "Make a copy of the application document and start working.",
      date: new Date("2026-11-21T00:00:00Z"),
    },
    {
      title: "Applications due",
      description: "Upload your completed application PDF to the form.",
      date: new Date("2027-01-17T00:00:00Z"),
    },
    {
      title: "Interviews",
      description: "Selected applicants will be contacted for a brief interview.",
    },
    { title: "Final decisions", description: "Everyone who applied will hear back from us." },
  ] as { title: string; description?: string; date?: Date }[],
};

export const Route = createFileRoute("/about/join-us/")({
  staticData: { title: "Join Us", breadcrumb: { hidden: true }, classNames: { container: false } },
  loader: async () => pages.find((p) => JOIN_US_PAGE_ID === p._meta.path.slugify()),
  component: RouteComponent,
});

function RouteComponent() {
  const content = Route.useLoaderData();

  return (
    <div>
      <div className="relative bg-hg-black flex items-center justify-center h-24 overflow-hidden sm:h-36 lg:h-48">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 bg-[url('/assets/images/hero/hexagons.svg')] opacity-30" />
        <h1 className="relative font-light font-brand text-5xl uppercase text-white sm:text-6xl lg:text-8xl">
          JOIN US
        </h1>
      </div>

      <div className="p-4 mx-auto max-w-7xl">
        <div className="my-8" />

        <section className="border p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">{hgta.name}</h2>
            <p className="text-muted-foreground">
              {hgta.closed
                ? "Applications are currently closed. Sign up below to be notified when they open."
                : "Applications are open! Read the information below before you start."}
            </p>
          </div>
          {!hgta.closed && (
            <div className="flex flex-wrap gap-3">
              <Button
                render={<a href={hgta.document} target="_blank" rel="noreferrer" />}
                nativeButton={false}
                size="lg"
              >
                Get the application
              </Button>
              <Button
                render={<a href={hgta.form} target="_blank" rel="noreferrer" />}
                nativeButton={false}
                variant="outline"
                size="lg"
              >
                Submit
              </Button>
            </div>
          )}
        </section>

        <div className="grid gap-10 my-10 lg:grid-cols-[2fr_1fr]">
          {content ? (
            <div
              className="typeset max-w-none space-y-2"
              dangerouslySetInnerHTML={{ __html: md(content.content) }}
            />
          ) : (
            <p>{brand.description}</p>
          )}

          <aside id="timeline" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold mb-6">Timeline</h2>
            <ol className="relative border-l border-border ml-2 space-y-8">
              {hgta.timeline.map((step) => (
                <li key={step.title} className="pl-6 relative">
                  <span className="absolute -left-1.25 top-1.5 size-2.5 bg-primary" />
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                    {step.date
                      ? step.date.toLocaleDateString("en-US", { dateStyle: "medium" })
                      : "TBA"}
                  </p>
                  <h4 className="font-semibold">{step.title}</h4>
                  {step.description && (
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  )}
                </li>
              ))}
            </ol>
            <p className="text-sm text-muted-foreground mt-8">
              Questions?{" "}
              <Link to="/about" className="link">
                Contact us
              </Link>
              .
            </p>
          </aside>
        </div>

        <NewsletterCTA
          className="border p-6 my-10"
          description="Be the first to know when officer applications are open. Plus, learn about upcoming events and opportunities from the HackGwinnett team!"
        />
      </div>
    </div>
  );
}
