import * as React from "react";
import { Link } from "@tanstack/react-router";
import { RiGridLine, RiPlayLine } from "@remixicon/react";
import { cn } from "#/lib/utils";
import { Scroller } from "#/components/ui/motion-primitives/scroller";
import {
  type Sponsor as SponsorData,
  mainSponsors,
  otherSponsors,
  pastSponsors,
} from "#/lib/meta/sponsors";
import { useBreakpoint, useIsReducedMotion } from "#/hooks/browser.ts";

export function Sponsors({
  title,
  canScroll = true,
  footer,
}: {
  title?: React.ReactNode;
  canScroll?: boolean;
  footer?: React.ReactNode;
}) {
  const { md } = useBreakpoint();
  const isMobile = !md;
  const reducedMotion = useIsReducedMotion();
  const [hasKeyboardFocus, setHasKeyboardFocus] = React.useState(false);
  const [manualGrid, setManualGrid] = React.useState(!canScroll);

  // too few sponsors to bother scrolling — a marquee with only a handful of logos just
  // looks like a stall, so it's not worth animating (or offering the toggle for) at all
  const tooFewToScroll = otherSponsors.length < 6;

  // the marquee is the only reason the grid isn't the default, so anything that rules the
  // marquee out (small screens, reduced motion, an explicit ask, too few sponsors) falls
  // back to the grid. Scroller keeps the same sponsor links mounted across this toggle, so
  // switching layout while tabbing through never drops focus.
  const showGrid = isMobile || reducedMotion || hasKeyboardFocus || manualGrid || tooFewToScroll;
  const canToggle = canScroll && !isMobile && !reducedMotion && !tooFewToScroll;

  const handleFocusCapture = (e: React.FocusEvent<HTMLElement>) => {
    if ((e.target as HTMLElement | null)?.matches(":focus-visible")) {
      setHasKeyboardFocus(true);
    }
  };

  const handleBlurCapture = (e: React.FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setHasKeyboardFocus(false);
    }
  };

  return (
    <div
      className="space-y-8 text-center"
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
    >
      {title}

      <div className="space-y-6">
        {/* main sponsors (3 per row) */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 max-w-5xl mx-auto">
          {mainSponsors.map((sponsor, index) => (
            <Sponsor
              key={`main-${sponsor.title}-${index}`}
              sponsor={sponsor}
              classNames={{
                image: "h-10 w-auto max-w-40 sm:h-12 sm:max-w-56",
              }}
            />
          ))}
        </div>

        {/* other sponsors */}
        <div className="relative mx-auto max-w-4xl w-full">
          <Scroller
            className="w-full"
            scrollClassName="mask-x-from-95%"
            speedOnHover={0.5}
            gap={24}
            grid={showGrid}
            gridClassName="flex flex-wrap items-center justify-center gap-6"
          >
            {otherSponsors.map((sponsor, index) => (
              <Sponsor key={`${sponsor.title}-${index}-logo`} sponsor={sponsor} />
            ))}
          </Scroller>

          {canToggle && (
            <button
              type="button"
              onClick={() => setManualGrid((prev) => !prev)}
              aria-pressed={manualGrid}
              title={manualGrid ? "Show scrolling sponsors" : "Show all sponsors as a grid"}
              className="absolute -bottom-8 right-0 flex items-center gap-1.5 rounded-full border border-border/50 bg-background/80 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur-sm transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              {manualGrid ? (
                <>
                  <RiPlayLine className="size-3.5" /> Scroll
                </>
              ) : (
                <>
                  <RiGridLine className="size-3.5" /> Show all
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div>
        {footer}
        {/* <span className="text-muted-foreground/50">
          Prizes brought to you by{" "}
          <img
            src={"/assets/images/sponsors/sf-symbol.svg".toAsset()}
            alt="State Farm Brand Icon"
            className="inline h-[1em] not-hover:grayscale opacity-50 drag-none"
          />
        </span> */}
      </div>
    </div>
  );
}

export function PastSponsors({ title }: { title?: React.ReactNode }) {
  if (pastSponsors.length === 0) return null;

  return (
    <div className="space-y-4 text-center">
      {title}
      <div className="flex flex-wrap items-center justify-center gap-4 max-w-3xl mx-auto">
        {pastSponsors.map((sponsor, index) => (
          <Sponsor
            key={`past-${sponsor.title}-${index}`}
            sponsor={sponsor}
            classNames={{ image: "h-6 w-auto max-w-24 sm:h-7 sm:max-w-28" }}
          />
        ))}
      </div>
    </div>
  );
}

type SponsorProps = Omit<React.ComponentPropsWithoutRef<typeof Link>, "href" | "title"> & {
  sponsor: SponsorData;
  classNames?: {
    parent?: string;
    image?: string;
  };
};

export const Sponsor = React.forwardRef<HTMLAnchorElement, SponsorProps>(
  ({ sponsor, classNames, className, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        to={sponsor.href}
        target="_blank"
        rel="noopener noreferrer"
        title={sponsor.title}
        className={cn(
          "group flex items-center justify-center rounded-lg p-3 transition focus-visible:ring-2 focus-visible:ring-ring",
          classNames?.parent,
          className,
        )}
        {...props}
      >
        {sponsor.src ? (
          <img
            src={sponsor.src}
            alt={sponsor.title}
            className={cn(
              "max-h-12 max-w-full object-contain select-none transition sm:grayscale sm:opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-focus-visible:grayscale-0 group-focus-visible:opacity-100",
              classNames?.image,
            )}
          />
        ) : (
          <span
            className={cn(
              "text-5xl font-semibold select-none transition sm:grayscale sm:opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-focus-visible:grayscale-0 group-focus-visible:opacity-100",
              classNames?.image,
            )}
          >
            {sponsor.title}
          </span>
        )}
      </Link>
    );
  },
);
