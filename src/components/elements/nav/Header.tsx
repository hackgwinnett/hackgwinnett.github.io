import * as React from "react";
import { Link as RouterLink } from "@tanstack/react-router";
import {
  RiDiscordFill,
  RiInstagramFill,
  RiMenuLine,
  RiMenu3Line,
  RiYoutubeFill,
  RiExternalLinkLine,
  RiFlagLine,
} from "@remixicon/react";
import {
  NavigationMenu as NavMenu,
  NavigationMenuContent as NavMenuContent,
  NavigationMenuItem as NavMenuItem,
  NavigationMenuLink as NavMenuLink,
  NavigationMenuList as NavMenuList,
  NavigationMenuTrigger as NavMenuTrigger,
  navigationMenuTriggerStyle as navMenuTriggerStyle,
} from "#/components/ui/navigation-menu";
import { cn } from "#/lib/utils";
import { Button } from "#/components/ui/button";
import { events } from "#/lib/meta/events";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "#/components/ui/drawer";
import { toolInfo } from "#/routes/tools/-shared";
import { Separator } from "#/components/ui/separator";
import { useBreakpoint } from "#/hooks/browser.ts";

interface NavLinkItem {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
}

interface NavGroupItem {
  title: string;
  className?: string;
  list: { className?: string; items: NavLinkItem[] };
}

type NavItem = NavLinkItem | NavGroupItem;

const CTA_HOVER_CLASS = "hover:bg-hg-green hover:text-ground";

const navItems = [
  {
    title: "About Us",
    description: "Learn more about HackGwinnett, our team, and our mission.",
    href: "/about",
  },
  {
    title: "Posts",
    description: "News, updates, and announcements from HackGwinnett and our officers.",
    href: "/posts",
  },
  {
    title: "Sponsors",
    description: "HackGwinnett wouldn't be possible without the support of our sponsors.",
    className: "hidden", // drawer-only
    href: "/sponsors",
  },
  {
    title: "Programs",
    list: {
      className: "w-100",
      items: [
        {
          title: events.hackathon.name,
          description: events.hackathon.description,
          href: "/programs/hackathon",
        },
        {
          title: events.hackfest.name,
          description: events.hackfest.description,
          href: "/programs/hackfest",
        },
        // {
        //   title: "Summer Workshops (coming soon)",
        //   description: "in collaboration with Peach State Hacks",
        //   href: "/programs/summer-workshops",
        //   disabled: true,
        // },
      ],
    },
  },
  {
    title: "Tools",
    list: {
      className: "w-96",
      items: [
        {
          title: toolInfo.bogey.name,
          description: toolInfo.bogey.description,
          href: "/tools/bogey",
        },
        {
          title: toolInfo.birdie.name,
          description: toolInfo.birdie.description,
          href: "/tools/birdie",
          disabled: true,
        },
        {
          title: "All tools...",
          href: "/tools",
        },
      ],
    },
  },
  {
    title: "Archive",
    className: "hidden lg:flex", // drawer-only on mobile/tablet
    list: {
      className:
        "grid grid-flow-col grid-rows-3 gap-2 md:grid-cols-2 w-84 [&_.nav-label]:font-brand",
      items: [
        // { title: "Media gallery", href: "/gallery" },
        {
          title: "Hackathon 6.0",
          href: "https://hackgwinnett-6-0.devpost.com/project-gallery",
          external: true,
        },
        {
          title: "Hackathon 5.0",
          href: "https://hackgwinnett-5-0.devpost.com/project-gallery",
          external: true,
        },
        {
          title: "Hackathon 4.0",
          href: "https://hackgwinnett-iv.devpost.com/project-gallery",
          external: true,
        },
        {
          title: "Hackathon 3.0",
          href: "https://hackgwinnett3.devpost.com/project-gallery",
          external: true,
        },
        {
          title: "Hackathon 2.0",
          href: "https://hackgwinnett-2-0.devpost.com/project-gallery",
          external: true,
        },
        {
          title: "HackGwinnett[0]",
          href: "https://hackgwinnett.devpost.com/project-gallery",
          external: true,
        },
      ],
    },
  },
  {
    title: "Report issue",
    description: "Found a bug or issue in the new site? Let us know so we can fix it!",
    icon: <RiFlagLine className="size-4" />,
    className: "hidden", // drawer-only
    href: "/eda/report",
  },
] satisfies NavItem[];

export type HeaderClassNames = {
  div?: string;
  logo?: string;
  navigationMenu?: {
    global?: string;
    container?: string;
    items?: { global?: string; container?: string; link?: string; dropdown?: string };
  };
  cta?: { global?: string; container?: string; link?: string };
};

function isLeaf(item: NavItem): item is NavLinkItem {
  return "href" in item;
}

function itemKey(item: NavLinkItem) {
  return `${item.href}-${item.title}`;
}

function Link({
  item,
  children,
  buttonStyle,
  className,
  ...props
}: {
  item: NavLinkItem;
  children?: React.ReactNode;
  buttonStyle?: boolean;
} & Omit<React.ComponentProps<typeof RouterLink>, "to" | "href">) {
  const linkClassName = cn("link", buttonStyle && "icon-link", className);

  if (item.external) {
    return (
      <RouterLink
        to={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
        {...props}
      >
        {children ?? item.title}
      </RouterLink>
    );
  }

  return (
    <RouterLink to={item.href} className={linkClassName} {...props}>
      {children ?? item.title}
    </RouterLink>
  );
}

function DesktopListItem({ item }: { item: NavLinkItem }) {
  return (
    <li>
      <NavMenuLink render={<Link item={item} disabled={item.disabled} buttonStyle />}>
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex items-center gap-1 font-medium leading-none">
            {item.icon}
            <span className="nav-label">{item.title}</span>
          </div>

          {item.description && (
            <div className="line-clamp-2 text-muted-foreground">{item.description}</div>
          )}
        </div>
      </NavMenuLink>
    </li>
  );
}

function NavRowLink({ item }: { item: NavLinkItem }) {
  const content = (
    <div
      className={cn(
        "flex w-full flex-col gap-1 p-2",
        "transition hover:bg-accent",
        item.disabled && "pointer-events-none opacity-50",
      )}
    >
      <div className="flex items-center gap-2 font-medium">
        {item.icon}
        <span className="nav-label">{item.title}</span>
        {item.external && <RiExternalLinkLine className="size-4" />}
      </div>

      {item.description && (
        <div className="line-clamp-2 text-sm text-muted-foreground">{item.description}</div>
      )}
    </div>
  );

  return (
    <DrawerClose
      render={<Link className="w-full" item={item} disabled={item.disabled} buttonStyle />}
      nativeButton={false}
    >
      {content}
    </DrawerClose>
  );
}

function NavSection({
  item,
  navClassNames,
  isMobile,
}: {
  item: NavItem;
  navClassNames?: HeaderClassNames["navigationMenu"];
  isMobile: boolean;
}) {
  if (isLeaf(item)) {
    return (
      <NavMenuItem
        className={cn(
          item.className,
          navClassNames?.items?.global,
          navClassNames?.items?.container,
        )}
        title={item.description}
      >
        <NavMenuLink
          className={cn(
            navMenuTriggerStyle(),
            "hover:bg-hg-green active:bg-hg-green/80 focus:bg-transparent",
            navClassNames?.items?.global,
            navClassNames?.items?.link,
          )}
          render={<Link item={item} buttonStyle />}
        >
          {item.title}
        </NavMenuLink>
      </NavMenuItem>
    );
  }

  return (
    <NavMenuItem className={item.className}>
      <NavMenuTrigger
        className={cn(
          "hover:bg-hg-green/50 data-popup-open:hover:bg-hg-green data-popup-open:bg-hg-green/50 focus:bg-transparent",
          navClassNames?.items?.global,
          navClassNames?.items?.dropdown,
        )}
      >
        {item.title}
      </NavMenuTrigger>
      <NavMenuContent>
        <ul className={item.list.className}>
          {item.list.items.map((subItem) =>
            isMobile ? (
              <NavRowLink key={itemKey(subItem)} item={subItem} />
            ) : (
              <DesktopListItem key={itemKey(subItem)} item={subItem} />
            ),
          )}
        </ul>
      </NavMenuContent>
    </NavMenuItem>
  );
}

function NavDrawerSection({ item }: { item: NavItem }) {
  if (isLeaf(item)) {
    return <NavRowLink item={item} />;
  }

  return (
    <div className="mt-3 flex flex-col gap-3">
      <h4 className="border-b pb-2 text-lg font-thin uppercase font-brand">{item.title}</h4>
      <div className="flex flex-col gap-3 p-1.5 bg-accent/40">
        {item.list.items.map((subItem) => (
          <NavRowLink key={itemKey(subItem)} item={subItem} />
        ))}
      </div>
    </div>
  );
}

function SocialButton({
  slug,
  icon,
  label,
  className,
}: {
  slug: string;
  icon: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <Button
      render={
        <RouterLink
          to="/go/$slug"
          params={{ slug }}
          search={{ ref: "nav" }}
          target="_blank"
          className="link icon-link"
        />
      }
      className={cn(CTA_HOVER_CLASS, className)}
      variant="ghost"
      size="icon-sm"
      nativeButton={false}
      aria-label={label}
      title={label}
    >
      {icon}
    </Button>
  );
}

export function Header({
  className,
  classNames,
  detached,
}: {
  className?: string;
  classNames?: HeaderClassNames;
  detached?: boolean;
}) {
  const { md } = useBreakpoint();
  const isMobile = !md;

  return (
    <header
      className={cn(
        "p-4 text-white",
        detached ? "fixed left-0 top-0 z-50 w-full" : "sticky top-0 z-40 bg-primary",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-7xl items-center justify-between",
          classNames?.div,
        )}
      >
        <span className={cn("flex flex-1 justify-start", classNames?.logo)}>
          <RouterLink to="/" title="HackGwinnett Logo" className="text-xl font-mono font-bold">
            <img
              className="size-9"
              alt="HackGwinnett Logo"
              src={"/assets/images/brand/hgwordmark.svg".toAsset()}
            />
          </RouterLink>

          {import.meta.env.DEV ? (
            <RouterLink to="/developer" className="link">
              ++
            </RouterLink>
          ) : null}
        </span>

        <div
          className={cn(
            "hidden flex-1 justify-center md:flex",
            classNames?.navigationMenu?.global,
            classNames?.navigationMenu?.container,
          )}
        >
          <NavMenu>
            <NavMenuList>
              {navItems.map((item) => (
                <NavSection
                  key={item.title}
                  item={item}
                  navClassNames={classNames?.navigationMenu}
                  isMobile={isMobile}
                />
              ))}
            </NavMenuList>
          </NavMenu>
        </div>

        <div
          title="hgm.en-US.header_cta"
          className={cn(
            "flex flex-1 justify-end gap-1",
            classNames?.cta?.global,
            classNames?.cta?.container,
          )}
        >
          <SocialButton
            slug="instagram"
            label="Instagram"
            icon={<RiInstagramFill />}
            className={classNames?.cta?.link}
          />
          <SocialButton
            slug="youtube"
            label="YouTube"
            icon={<RiYoutubeFill />}
            className={classNames?.cta?.link}
          />
          <SocialButton
            slug="discord"
            label="Discord"
            icon={<RiDiscordFill />}
            className={classNames?.cta?.link}
          />

          <Drawer swipeDirection="right">
            <DrawerTrigger
              render={
                <Button
                  className={cn(CTA_HOVER_CLASS, classNames?.cta?.global, classNames?.cta?.link)}
                  variant="ghost"
                  size="icon-sm"
                />
              }
            >
              <span className="sr-only">Menu</span>
              {isMobile ? <RiMenuLine className="size-4" /> : <RiMenu3Line className="size-4" />}
            </DrawerTrigger>

            <DrawerContent className="rounded-none">
              {/*<DrawerHeader>
                <DrawerTitle className="flex items-center gap-2">
                  Explore <Badge>BETA</Badge>
                </DrawerTitle>
                <DrawerDescription>
                  Problem?{" "}
                  <Link to="/go/$slug" params={{ slug: "issues" }}>
                    Report any issues
                  </Link>{" "}
                  you find in our new site {":)"}
                </DrawerDescription>
              </DrawerHeader>

              <Separator className="mt-5" />*/}

              <div className="flex-1 overflow-y-auto scroll-fade p-4">
                <nav className="flex flex-col gap-3">
                  {navItems.map((item) => (
                    <NavDrawerSection key={item.title} item={item} />
                  ))}
                </nav>
              </div>

              <Separator className="mb-5" />

              <DrawerFooter>
                <Button
                  render={
                    <RouterLink
                      to="/go/$slug"
                      params={{ slug: "register" }}
                      search={{ ref: "nav" }}
                      className="link icon-link"
                    />
                  }
                  size="lg"
                  nativeButton={false}
                >
                  Register for {events.hackathon.shortName}
                </Button>
                <DrawerClose render={<Button size="sm" variant="outline" />}>
                  Close Menu
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  );
}
