const SITE_URL = "https://hackgwinnett.github.io"; // https://hackgwinnett.org

// head()'s meta type in the installed router version is typed as raw <meta> props and
// hasn't caught up to the "script:ld+json" entry its own runtime (Asset.js) already handles,
// hence the `any` returns below.

export const organizationSchema = ({
  name,
  logo,
  sameAs,
}: {
  name: string;
  logo?: string;
  sameAs?: string[];
}): any => ({
  "script:ld+json": {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: SITE_URL,
    ...(logo && { logo }),
    ...(sameAs?.length && { sameAs }),
  },
});

export const breadcrumbSchema = (
  crumbs: readonly { label: string; pathname: string; linkable?: boolean }[],
): any => ({
  "script:ld+json": {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      // dead end crumbs have no page behind them; a ListItem may carry just a name
      ...(crumb.linkable === false
        ? {}
        : { item: `${SITE_URL}${crumb.pathname === "/" ? "" : crumb.pathname}` }),
    })),
  },
});

export const eventSchema = ({
  name,
  description,
  startDate,
  endDate,
  url,
  location,
  price,
}: {
  name: string;
  description: string;
  startDate?: Date;
  endDate?: Date;
  url: string;
  location: { name: string; address: string };
  price?: number;
}): any => ({
  "script:ld+json": {
    "@context": "https://schema.org",
    "@type": "Event",
    name,
    description,
    ...(startDate && { startDate: startDate.toISOString() }),
    ...(endDate && { endDate: endDate.toISOString() }),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    url,
    location: {
      "@type": "Place",
      name: location.name,
      address: location.address,
    },
    organizer: {
      "@type": "Organization",
      name: "HackGwinnett",
      url: SITE_URL,
    },
    offers: {
      "@type": "Offer",
      price: price?.toString() || "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  },
});

export const articleSchema = ({
  headline,
  description,
  authorNames,
  datePublished,
  image,
  url,
}: {
  headline: string;
  description?: string;
  authorNames: string[];
  datePublished: Date;
  image?: string;
  url: string;
}): any => ({
  "script:ld+json": {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    ...(description && { description }),
    datePublished: datePublished.toISOString(),
    url,
    ...(image && { image }),
    author: authorNames.map((name) => ({ "@type": "Person", name })),
    publisher: {
      "@type": "Organization",
      name: "HackGwinnett",
      url: SITE_URL,
    },
  },
});

export const seo = ({
  title,
  description,
  keywords,
  image,
}: {
  title: string;
  description?: string;
  image?: string;
  keywords?: string;
}) => {
  const tags = [
    { title },
    { name: "description", content: description },
    { name: "keywords", content: keywords },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:creator", content: "@hackgwinnettATL" }, // we have a twitter?!
    { name: "twitter:site", content: "@hackgwinnettATL" },
    { name: "og:type", content: "website" },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    ...(image
      ? [
          { name: "twitter:image", content: image },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "og:image", content: image },
        ]
      : []),
  ];

  return tags;
};

// out of search results & sitemap
export const noindex = () => [{ name: "robots", content: "noindex, nofollow" }];
