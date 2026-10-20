import { useEffect, useState } from "react";
import { Link, useHydrated } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { Magnetic } from "#/components/ui/motion-primitives/magnetic";
import { TextScramble } from "#/components/ui/motion-primitives/text-scramble";
import { cn } from "#/lib/utils";
import { RiArrowDownLine, RiArrowRightDoubleLine, RiPlayFill } from "@remixicon/react";
import { ColorBadge } from "#/components/ui/color-badge";
import { events } from "#/lib/meta/events";
import { DialogTrigger } from "#/components/ui/dialog";
import { videoDialog, videoId } from "./video.tsx";
import { useBreakpoint, useIsReducedMotion } from "#/hooks/browser.ts";

export function HomepageHero({ isScrolled }: { isScrolled: boolean }) {
  const { md, xl } = useBreakpoint();
  const isMobile = !md;
  const reducedMotion = useIsReducedMotion();

  const [hackathonOver, setHackathonOver] = useState(false);
  const hydrated = useHydrated();

  useEffect(() => {
    if (!hydrated || !events.hackathon.date?.end) return;
    setHackathonOver(events.hackathon.date.end.getTime() < new Date().getTime());
  }, [hydrated]);

  return (
    <div className="relative bg-hg-black bg-[url('/assets/images/hero/bgtexture01.svg')] text-white">
      <div className="min-h-safe-dvh px-6 sm:px-8 md:px-12 flex flex-row items-center justify-between gap-12 animate-in fade-in slide-in-from-bottom-5 animation-duration-800 animation-delay-50 fill-mode-backwards">
        <div className="flex flex-col justify-center gap-4 max-w-md sm:max-w-xl md:max-w-2xl">
          <ColorBadge
            render={<Link to="/posts/$postId" params={{ postId: "new-website-announcement" }} />}
          >
            NEW: Our official T-shirts have arrived!
            <RiArrowRightDoubleLine />
          </ColorBadge>
          <h1 className="text-2xl sm:text-5xl md:text-6xl max-w-2xl font-mono leading-8 sm:leading-14 md:leading-17 select-none">
            Atlanta's premier{" "}
            <span className="text-primary-light">
              <TextScramble trigger={!reducedMotion}>computer science</TextScramble>
            </span>{" "}
            organization
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/80">
            {events.hackathon.name}
            {hackathonOver ? (
              <>has concluded. Thank you, everyone!</>
            ) : (
              <>
                {events.hackathon.date ? (
                  <>
                    {" is on "}
                    {events.hackathon.date.start.toLocaleDateString("en-US", {
                      dateStyle: "full",
                    })}
                    .{" "}
                  </>
                ) : (
                  " is coming soon. "
                )}
                {!events.hackathon.registration?.closed ? (
                  "Register now!"
                ) : (
                  <>
                    <Link to="." hash="newslettercta" className="link">
                      Get notified
                    </Link>{" "}
                    when registration opens
                  </>
                )}
              </>
            )}
          </p>
          <div className="flex flex-row gap-4">
            {!events.hackathon.registration?.closed && (
              <Magnetic intensity={0.4}>
                <Button
                  render={
                    <Link to="/go/$slug" params={{ slug: "form" }} search={{ ref: "hero" }} />
                  }
                  className="cursor-none motion-reduce:cursor-pointer striped-hg-green hover:brightness-110 not-motion-reduce:hover:not-active:scale-103"
                  variant="hero"
                  size={isMobile ? "sm" : "lg"}
                  nativeButton={false}
                >
                  Register
                </Button>
              </Magnetic>
            )}
            <Magnetic intensity={0.4}>
              <Button
                render={<Link to="/programs/hackathon" />}
                className="cursor-none motion-reduce:cursor-pointer not-motion-reduce:hover:not-active:scale-103"
                variant="glass"
                size={isMobile ? "sm" : "lg"}
                nativeButton={false}
              >
                Learn more
              </Button>
            </Magnetic>
            {!xl && (
              <DialogTrigger
                handle={videoDialog}
                render={<button className="link text-base md:text-lg" />}
              >
                Watch video
              </DialogTrigger>
            )}
          </div>
        </div>

        <DialogTrigger handle={videoDialog}>
          <Magnetic
            className="group relative hidden xl:inline-flex max-w-lg cursor-none motion-reduce:cursor-pointer"
            intensity={0.2}
            range={300}
          >
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt="HG Hero Video thumbnail"
              className={cn(
                "w-lg aspect-video select-none drag-none",
                "bg-hg-black/50 border-3 group-hover:border-primary-light group-hover:border-4",
                "transition-[scale,filter] not-motion-reduce:group-hover:scale-101 not-motion-reduce:group-hover:group-active:scale-99",
                "not-group-hover:brightness-80",
              )}
            />
            <div
              className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10",
                "p-1.5 bg-black/50 text-white",
                "transition-opacity group-hover:opacity-0",
              )}
            >
              <RiPlayFill className="size-24" />
            </div>
          </Magnetic>
        </DialogTrigger>
      </div>
      <div className="absolute bottom-0 left-[47dvw] flex justify-center pb-8">
        <Magnetic intensity={0.4}>
          <Button
            className={cn(
              "transition-colors hover:bg-primary hover:text-primary-foreground",
              "mx-auto cursor-none motion-reduce:cursor-pointer",
              "data-[state=show]:animate-in data-[state=hide]:animate-out fill-mode-forwards fade-in slide-in-from-bottom-5 fade-out",
              isScrolled && "pointer-events-none",
            )}
            data-state={isScrolled ? "hide" : "show"}
            aria-hidden={isScrolled}
            tabIndex={isScrolled ? -1 : undefined}
            aria-label="Scroll to main content"
            variant="ghost"
            size={isMobile ? "icon" : "icon-lg"}
            onClick={() =>
              document
                .getElementById("subhero")
                ?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" })
            }
          >
            <RiArrowDownLine className="size-3/4" />
          </Button>
        </Magnetic>
      </div>
    </div>
  );
}
