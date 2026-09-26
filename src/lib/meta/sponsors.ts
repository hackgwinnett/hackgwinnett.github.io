export type Sponsor = {
  title: string;
  href: string;
  src?: string;
  /**
   * required so a new sponsor can't silently ship without a UTM decision: `false` for
   * vanity/short links (they already carry their own tracking), `true` otherwise
   */
  utm: boolean;
};

const UTM = {
  utm_source: "hackgwinnett",
  utm_medium: "referral",
  utm_campaign: "sponsors",
};

const sponsorList: { main: Array<Sponsor>; other: Array<Sponsor>; past: Array<Sponsor> } = {
  // main / premier sponsors
  main: [
    { title: "State Farm", href: "https://st8.fm/hg", src: "statefarm.svg", utm: false },
    { title: "Amazon", href: "https://amazon.com/", src: "amazon.svg", utm: false },
    { title: "OpenAI", href: "https://openai.com/", /* src: "oaiwordmark.svg", */ utm: false },
  ],

  // other current sponsors (scroller / grid):
  other: [{ title: "GSMST", href: "https://gsmst.gcpsk12.org", src: "gsmst.webp", utm: false }],

  // past sponsors (shown only in the "past sponsors" section on /sponsors):
  past: [
    { title: "Replit", href: "https://replit.com", src: "replit.svg", utm: true },
    { title: "Inspirit AI", href: "https://inspiritai.com", src: "inspirit.jpeg", utm: true },
    { title: "Taskade", href: "https://taskade.com", src: "taskade-v2.svg", utm: true },
    { title: "egghead.io", href: "https://egghead.io", src: "egghead.svg", utm: true },
    { title: "Hack Club", href: "https://hackclub.com", src: "hackclub.svg", utm: true },
    { title: "Interview Cake", href: "https://interviewcake.com", src: "intcake.svg", utm: true },
    { title: "MIE Coach", href: "https://miecoach.com", src: "mie-logo.png", utm: true },
  ],
};

function withUtm(href: string): string {
  try {
    const url = new URL(href);
    for (const [key, value] of Object.entries(UTM)) url.searchParams.set(key, value);
    return url.toString();
  } catch {
    return href;
  }
}

const sponsorify = (s: Sponsor): Sponsor => ({
  ...s,
  href: s.utm === false ? s.href : withUtm(s.href),
  src: s.src && `/assets/images/sponsors/${s.src}`.toAsset(),
});

export const mainSponsors: Array<Sponsor> = sponsorList.main.map(sponsorify);
export const otherSponsors: Array<Sponsor> = sponsorList.other.map(sponsorify);
export const pastSponsors: Array<Sponsor> = sponsorList.past.map(sponsorify);

export const sponsors: Array<Sponsor> = [...mainSponsors, ...otherSponsors, ...pastSponsors];
