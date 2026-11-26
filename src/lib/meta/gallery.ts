export interface GalleryImage {
  /** full size (long edge <= 1920px); a `-sm.jpg` copy (<= 800px) must sit next to it */
  src: string;
  alt: string;
  /** shown over the photo and in the preview; most photos don't need one */
  caption?: string;
  /** also shown in the featured carousel at the top of /gallery */
  featured?: boolean;
  /** which program's page also shows it in its carousel */
  event?: "hackathon" | "hackfest";
}

const HG6 = "/assets/images/events/hackathon/hg6";
const HG5 = "/assets/images/events/hackathon/hg5";
const TEAM = "/assets/images/team";

// newest first: the gallery wall keeps this order
export const galleryImages: GalleryImage[] = [
  {
    src: `${HG6}/IMG_3118.JPG`,
    alt: "1st prize winners in the AI division with the HackGwinnett Team at the 6.0 Awards Ceremony.",
    caption: "1st prize (AI division) at Hackathon 6.0",
  },
  {
    src: `${HG6}/IMG_3110.JPG`,
    alt: "1st prize winners in the Non AI division with the HackGwinnett Team at the 6.0 Awards Ceremony.",
    caption: "1st prize (Non AI division) at Hackathon 6.0",
  },
  {
    src: `${HG6}/IMG_3056.jpg`,
    alt: "Participants crowd around the front desk, next to a large rubber duck cutout (thanks, GSMST CS Club!).",
    caption: "Getting busy at Hackathon 6.0",
    featured: true,
    event: "hackathon",
  },
  {
    src: `${TEAM}/gp2026.jpg`,
    alt: "The 2026 HackGwinnett officer team at Hackathon 6.0.",
    caption: "The 2026 HackGwinnett officer team at Hackathon 6.0",
  },
  {
    src: `${HG6}/IMG_2796.jpg`,
    alt: "Two participants smile at the camera from their laptops in the cafeteria.",
    featured: true,
    event: "hackathon",
  },
  { src: `${HG6}/IMG_2794.jpg`, alt: "A participant smiles at the camera from their laptop." },
  {
    src: `${HG6}/IMG_2797.jpg`,
    alt: "A team, some in costume, hacks away at a cafeteria table.",
  },
  {
    src: `${HG6}/IMG_2820.jpg`,
    alt: "A team laughs together over their laptops.",
    featured: true,
    event: "hackathon",
  },
  { src: `${HG6}/IMG_2799.jpg`, alt: "A team in costume works around a laptop." },
  { src: `${HG6}/IMG_2800.jpg`, alt: "Two participants work side by side at their laptops." },
  {
    src: `${HG6}/IMG_2826.jpg`,
    alt: "A participant in bunny ears chats with a hacker at their laptop.",
  },
  { src: `${HG6}/IMG_2828.jpg`, alt: "A mentor helps a participant at their laptop." },
  { src: `${HG6}/IMG_2832.jpg`, alt: "Two officers chat in front of the schedule screen." },
  { src: `${HG6}/IMG_2837.jpg`, alt: "Two participants focus on a laptop." },
  {
    src: `${HG6}/IMG_2839.jpg`,
    alt: "A nerd controls the big screen behind him.",
  },
  {
    src: `${HG6}/IMG_3058.jpg`,
    alt: "A team discusses their project with Wyn.",
    event: "hackathon",
  },
  {
    src: `${HG6}/IMG_3061.jpg`,
    alt: "Evan and Zihong, in their best attire, look over a project on a laptop.",
  },
  { src: `${HG6}/IMG_3064.jpg`, alt: "A camera's screen frames the cafeteria during filming." },
  { src: `${HG6}/IMG_3065.jpg`, alt: "The team handles participants' questions in the cafe." },
  {
    src: `${HG6}/IMG_3067.jpg`,
    alt: "Participants in costume laugh together.",
    featured: true,
  },
  {
    src: `${HG6}/IMG_3069.jpg`,
    alt: "A participant in white gloves presents a laptop to the camera.",
    caption: "Two participants demonstrate their project to the media team",
  },
  {
    src: `${HG6}/IMG_3072.jpg`,
    alt: "Participants pose and goof around in the hallway.",
    caption: "Don't sleep on Serge L.'s project!",
  },
  { src: `${HG6}/IMG_3074.jpg`, alt: "A participant laughs in the hallway." },
  {
    src: `${TEAM}/gp2025.jpg`,
    alt: "The 2025 HackGwinnett officer team at Hackathon 5.0.",
    caption: "The 2025 HackGwinnett officer team at Hackathon 5.0",
    featured: true,
  },
  {
    src: `${HG5}/IMG_6720.jpg`,
    alt: "1st place prize winners (HG 5.0)",
    caption: "1st place winners at Hackathon 5.0",
    event: "hackathon",
  },
  {
    src: `${HG5}/IMG_6700.jpg`,
    alt: "Ms. Rachkovskiy at Hackathon 5.0. To the right, Jaden side-eyes the camera.",
    event: "hackathon",
  },
  {
    src: `${HG5}/IMG_6716.jpg`,
    alt: "A speaker addresses participants from the front of the room at Hackathon 5.0.",
    event: "hackathon",
  },
  {
    src: `${HG5}/ss-02.jpg`,
    alt: "Vishnu and Serge pay attention to a workshop at 5.0.",
    event: "hackathon",
  },
  {
    src: `${HG5}/ss-03.jpg`,
    alt: "Neal speaks to the participants at 5.0.",
    event: "hackathon",
  },
  {
    src: `${HG5}/ss-05.jpg`,
    alt: "Participants working together at their laptops during Hackathon 5.0.",
    event: "hackathon",
  },
  {
    src: `${HG5}/ss-07.jpg`,
    alt: "Volunteers lean over a row of laptops to help participants at Hackathon 5.0.",
    event: "hackathon",
  },
  {
    src: `${HG5}/ss-15.jpg`,
    alt: "Three participants work at their laptops during Hackathon 5.0.",
  },
];

export const featuredImages = galleryImages.filter((image) => image.featured);

export function eventImages(event: NonNullable<GalleryImage["event"]>) {
  return galleryImages.filter((image) => image.event === event);
}

/** the <= 800px copy, for thumbnails and grids */
export function smallSrc(image: GalleryImage) {
  return image.src.replace(/\.jpg$/, "-sm.jpg");
}
