// DEFINITIONS

const eventList = {
  hackathon: {
    name: "Hackathon 6.0",
    shortName: "HG6",
    description: "A free, one-day hackathon for middle and high school students.",
    location: {
      name: "Gwinnett School of Mathematics, Science, and Technology",
      shortName: "GSMST",
      address: "970 McElvaney Ln, Lawrenceville, GA 30044",
      mapUrl: "https://maps.apple.com/place?place-id=I3551F8AF8A34BB8A", // https://goo.gl/maps/1Zt7n9s5mL2qjv3bA
    },
    date: {
      start: new Date("2026-10-31T09:00:00"),
      end: new Date("2026-10-31T17:00:00"),
    },
    registration: {
      url: "https://docs.google.com/forms/d/e/1FAIpQLSfZn384gkF09tDDLrMyxB9WhqiCsW3_hMMEek7lDLB_L-gjNw/viewform",
      page: "/programs/hackathon/register",
      // closed: true, REGISTRATION... IS NOW... OPEN!
    },
    volunteer:
      "https://docs.google.com/forms/d/e/1FAIpQLSfTV8Gh3-4WEkZlvdjhdP0qsVM7GTzhKC0AdbCCbrjNVsIzPQ/viewform",
  },
  hackfest: {
    name: "HackFest IV",
    shortName: "HF4",
    description: "A one-day STEM event for primary students.",
    content: "hackfest",
    location: {
      name: "Baggett Elementary School",
      address: "2136 Old Norcross Rd, Lawrenceville, GA 30044",
      mapUrl: "https://maps.apple.com/place?place-id=I992A6F0C1A2001BD", // https://goo.gl/maps/1Zt7n9s5mL2qjv3bA
    },
    date: {
      start: new Date("2026-03-24T09:00:00"),
      end: new Date("2026-03-24T17:00:00"),
    },
  },
} satisfies Record<string, HGEvent>;

export const events: Record<EventKey, HGEvent> = eventList;

// TYPES

export type EventKey = keyof typeof eventList;

export interface HGEvent {
  /** The name of the event */
  name: string;
  /** The shortened name of the event */
  shortName?: string;
  /** A short summary of the event */
  description: string;
  /** The `cms/pages/content` pathname for the .md file about this event */
  content?: string;
  /** The location details for the event */
  location: {
    /** The location name (Gwinnett School of Math, Science, and Tech) */
    name: string;
    /** A short location name (GSMST) */
    shortName?: string;
    /** The physical address or virtual conference software required to join */
    address: string;
    /** The Apple Maps address link or virtual meeting link */
    mapUrl: string;
  };
  /** Registration price for the event */
  price?: number;
  /** The date & time range of the event, if scheduled yet */
  date?: {
    /** The start date & time of the event */
    start: Date;
    /** The end date & time of the event */
    end?: Date;
  };
  /** The registration details of the event, if any */
  registration?: {
    /** Whether registration has closed for this event
     * if the event is far into the future, set to false
     * if the event date is close but registration deadline has passed, set to true
     * otherwise, set to false (or nothing)
     */
    closed?: boolean;
    /** The registration link. Could be a Google Form, email compose link, etc. */
    url: string;
    /** An on-site sign-up page (e.g. /programs/hackathon/register) */
    page?: string;
  };
  /** The volunteer registration link. Could be a Google Form, email compose link, etc. */
  volunteer?: string;
}
