export const brand = {
  name: "HackGwinnett",
  domain: "hackgwinnett.github.io", // hackgwinnett.org
  company: "HackGwinnett",
  description:
    "HackGwinnett is Metro Atlanta's premier computer science organization and programming event organizer, dedicated to fostering innovation, collaboration, and technical excellence among Middle/High School students in Gwinnett and beyond.", // `HackGwinnett is a student-run organization that aims to promote computer science and technology education in Gwinnett County, Georgia. We organize hackathons, workshops, and other events to help students learn and grow in the field of technology.`
  handles: {
    // https://instagram.com/
    instagram: "hackgwinnett",
    // https://x.com/
    twitter: "hackgwinnettATL",
    // https://youtube.com/@
    youtube: "hackgwinnett",
    // NOTE: https://discord.gg/amcVA5Yp5a ---- .gg/hackgwinnett vanity link would be tuff
    discord: "mAFVKz3RSH",
  },
};

export const repo = {
  slug: import.meta.env.PUBLIC_GIT_REPO || "hackgwinnett/www",
  get url() {
    return `https://github.com/${repo.slug}`;
  },
  get commitUrl() {
    const sha = import.meta.env.PUBLIC_GIT_SHA;
    return sha ? `${repo.url}/commit/${sha}` : repo.url;
  },
};

export const socialLinks = {
  instagram: `https://instagram.com/${brand.handles.instagram}`,
  twitter: `https://x.com/${brand.handles.twitter}`,
  youtube: `https://youtube.com/@${brand.handles.youtube}`,
  discord: `https://discord.gg/${brand.handles.discord}`,
};
