import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod/mini";
import { socialLinks } from "#/lib/meta/brand";
import { events } from "#/lib/meta/events";
import { trackEvent } from "#/lib/analytics.ts";

const redirects: Record<string, string> = {
  // redirects
  register: events.hackathon.registration?.page || "/programs/hackathon",
  volunteer: events.hackathon.volunteer || "/programs/hackathon",
  form: events.hackathon.registration?.url || "/programs/hackathon",
  issues: "/report",
  workshops: "https://github.com/hackgwinnett/workshops",
  aboutworkshops: "/programs/hackathon#workshops",
  wsarchive: "https://github.com/hackgwinnett/workshops",

  // socials
  instagram: socialLinks.instagram || "/",
  x: socialLinks.twitter || "/",
  youtube: socialLinks.youtube || "/",
  discord: socialLinks.discord || "/",

  // time-sensitive redirects
  // summerws26: "/posts/summer-workshops-with-peach-state-2026",
  // submit: "https://placeholder.devpost.com/",
};

// FOR THE RECORD, I opened #7141 in TanStack/router TWO MONTHS AGO
// but I didn't see that it was closed an hour later until... just now :P
// anyway this patchPath needs to be here to avoid page hangs
// update 7/14: bug only occurs when a route tries to preload via link hover
// update 8/1: we're going to keep patchPath to deal with unexpected behavior

const path = (href: string) => (href.startsWith("/") ? { to: href } : { href });

export const Route = createFileRoute("/go/$slug")({
  staticData: {
    title: { page: "Redirecting...", exact: true },
    header: { hidden: true },
  },
  // ?ref= tags where a golink was shared from (a poster, a bio, a QR code...) so we can see
  // which sources actually drive clicks
  validateSearch: z.object({
    ref: z.optional(z.string()),
  }),
  loaderDeps: ({ search }) => ({ ref: search.ref }),
  loader: ({ params, deps }) => {
    const { slug } = params;
    const target = redirects[slug];

    if (!target) throw notFound();

    trackEvent("Go Link", { slug, ref: deps.ref || "(direct)" });

    return Route.redirect(path(target));
  },
});
