import { useCallback, useEffect, useState } from "react";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "#/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import WheelGestures from "embla-carousel-wheel-gestures";
import { RiPauseLine, RiPlayLine } from "@remixicon/react";
import { cn } from "#/lib/utils";
import { motion } from "motion/react";
import { useIsReducedMotion } from "#/hooks/browser.ts";

export function MakeCarousel({
  className,
  items,
}: {
  className?: string;
  items: Array<React.ReactNode>;
}) {
  const [emblaApi, setApi] = useState<CarouselApi | undefined>(undefined);
  const [playing, setPlaying] = useState<boolean>(false);
  const reducedMotion = useIsReducedMotion();

  const toggleAutoplay = useCallback(
    (override?: "play" | "stop") => {
      const autoplay = emblaApi?.plugins()?.autoplay;
      if (!autoplay) return;

      switch (override) {
        case "play":
          autoplay.play();
          return;
        case "stop":
          autoplay.stop();
          return;
      }

      const switchState = autoplay.isPlaying() ? autoplay.stop : autoplay.play;
      switchState();
    },
    [emblaApi],
  );

  // reduced motion: don't autostart
  useEffect(() => {
    toggleAutoplay(reducedMotion ? "stop" : "play");
  }, [toggleAutoplay, reducedMotion]);

  useEffect(() => {
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (!autoplay) return;

    setPlaying(autoplay.isPlaying());
    emblaApi
      .on("autoplay:play", () => setPlaying(true))
      .on("autoplay:stop", () => setPlaying(false))
      .on("reinit", () => setPlaying(autoplay.isPlaying()));
  }, [emblaApi]);

  return (
    <Carousel
      plugins={[Autoplay(), WheelGestures({ wheelDraggingClass: "cursor-" })]}
      setApi={setApi}
      // slides fill the carousel's height, so a fixed-height carousel crops its slides
      // instead of letting them overflow (and clip whatever sits at their bottom edge)
      className={cn("group/carousel relative [&>[data-slot=carousel-content]]:h-full", className)}
    >
      <CarouselContent className="h-full">
        {items.map((item, index) => (
          <CarouselItem key={index} className="h-full">
            {item}
          </CarouselItem>
        ))}
      </CarouselContent>

      <motion.button
        className={cn(
          "group/btn flex items-center",
          "absolute bottom-2.5 right-2.5 z-10",
          "p-1.5 bg-hg-black/50 backdrop-blur-xs text-white",
          "transition-opacity opacity-100 lg:opacity-0 group-hover/carousel:opacity-100",
          "active:scale-98",
        )}
        onClick={() => toggleAutoplay()}
        layout
      >
        {playing ? <RiPauseLine /> : <RiPlayLine />}
        <span
          className={cn(
            "hidden lg:inline-block",
            "ml-1 mr-1.5 text-sm",
            // " group-hover/btn:animate-in group-hover/btn:fade-in group-hover/btn:slide-in-from-left-2",
            // "duration-200",
          )}
        >
          {playing ? "Pause" : "Play"}
        </span>
      </motion.button>
    </Carousel>
  );
}
