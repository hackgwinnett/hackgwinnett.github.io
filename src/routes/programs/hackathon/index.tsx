import { createFileRoute, Link } from "@tanstack/react-router";
import { events } from "#/lib/meta/events";
import { EventPage, type ProgramsGalleryImage } from "../-components";
import { HackathonFAQ } from "#/components/elements/ctas/HackathonFAQ.tsx";
import { buildUrl } from "#/lib/utils.ts";
import { RiInstagramLine, RiLink } from "@remixicon/react";
import { Separator } from "#/components/ui/separator";
import { pages } from "cms/pages";
import { md } from "#/lib/markdown";
import { eventSchema } from "#/lib/seo";
import { Button } from "#/components/ui/button";

const eventId = "hackathon";

export const Route = createFileRoute("/programs/hackathon/")({
  staticData: { breadcrumb: false },
  loader: async () => {
    const content = pages.find((p) => eventId === p._meta.path.slugify());
    return content || { content: "" };
  },
  head: () => ({
    meta: [
      eventSchema({
        name: events[eventId].name,
        description: events[eventId].description,
        startDate: events[eventId].date?.start,
        endDate: events[eventId].date?.end,
        url: buildUrl("/programs/hackathon"),
        location: events[eventId].location,
        price: events[eventId].price || 0,
      }),
    ],
  }),
  component: RouteComponent,
});

const press: { label: string; icon?: React.ReactNode; href: string }[] = [
  { label: "Hackathon 5.0 Recap", href: "https://www.youtube.com/watch?v=aQhZfWQlVXU" },
  { label: "Hackathon 5.0 DMC Recap", href: "https://www.instagram.com/reel/DSlEv4xifqL/" },
  { label: "Hack Club Hackathons", href: "https://hackathons.hackclub.com/" },
  {
    label: "@hackgwinnett on Instagram",
    icon: <RiInstagramLine />,
    href: "https://www.instagram.com/hackgwinnett/",
  },
];

const gallery: ProgramsGalleryImage[] = [
  {
    src: "/assets/images/events/hackathon/IMG_6720-resize.jpg",
    alt: "1st place prize winners (HG 5.0)",
  },
  {
    src: "/assets/images/events/hackathon/IMG_6700-resize.jpg",
    alt: "Ms. Rachkovskiy at Hackathon 5.0. To the right, Jaden side-eyes the camera.",
  },
  {
    src: "/assets/images/events/hackathon/IMG_6716-resize.jpg",
    alt: "A speaker addresses participants from the front of the room at Hackathon 5.0.",
  },
  {
    src: "/assets/images/events/hackathon/oldss/ss-02-resize.jpg",
    alt: "Vishnu and Serge pay attention to a workshop at 5.0.",
  },
  {
    src: "/assets/images/events/hackathon/oldss/ss-03-resize.jpg",
    alt: "Neal speaks to the participants at 5.0.",
  },
  {
    src: "/assets/images/events/hackathon/oldss/ss-05-resize.jpg",
    alt: "Participants working together at their laptops during Hackathon 5.0.",
  },
  {
    src: "/assets/images/events/hackathon/oldss/ss-07-resize.jpg",
    alt: "Volunteers lean over a row of laptops to help participants at Hackathon 5.0.",
  },
];

function RouteComponent() {
  const document = Route.useLoaderData();
  const content = (
    <div
      className="typeset max-w-none space-y-2"
      dangerouslySetInnerHTML={{ __html: md(document.content) }}
    />
  );

  return (
    <EventPage
      event={events[eventId]}
      content={content || events[eventId].description}
      gallery={gallery}
      additions={{
        left: {
          // /programs/hackathon#workshops brings you to this description
          start: <div id="workshops" />,
          cta: (
            <Button
              variant="secondary"
              size="lg"
              render={<Link to="/go/$slug" params={{ slug: "volunteer" }} />}
              nativeButton={false}
            >
              Volunteer for {events[eventId].shortName}
            </Button>
          ),
          end: (
            <>
              <Separator />

              <div>
                <h2 className="text-base font-semibold">In the news</h2>
                {press.map((item) => (
                  <Link
                    key={item.href}
                    className="primary-link icon-link w-fit"
                    to={item.href as string}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.icon || <RiLink />}
                    {item.label}
                  </Link>
                ))}
              </div>
            </>
          ),
        },
        right: {
          end: <HackathonFAQ responsiveText={false} />,
        },
      }}
    />
  );
}
