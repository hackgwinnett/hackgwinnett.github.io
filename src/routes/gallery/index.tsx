import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import { MakeCarousel } from "#/components/elements/misc/MakeCarousel";
import { Dialog, DialogContent, DialogTitle } from "#/components/ui/dialog";
import { featuredImages, galleryImages, smallSrc, type GalleryImage } from "#/lib/meta/gallery";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/gallery/")({
  staticData: {
    title: "Gallery",
    // dark page: the blurred photo backdrop below shows through, and the header floats over it
    classNames: {
      main: cn(
        "bg-transparent text-white",
        "[&_[data-slot=breadcrumb-list]]:text-white/60 [&_[data-slot=breadcrumb-page]]:text-white",
      ),
    },
    header: {
      className: "bg-hg-black/50 backdrop-blur-md border-b border-white/10",
      classNames: {
        navigationMenu: {
          items: {
            global: "hover:text-black focus:hover:bg-white",
            link: "hover:bg-white",
            dropdown:
              "hover:bg-white/50 data-popup-open:bg-white/20 data-popup-open:hover:bg-white",
          },
        },
      },
    },
  },
  component: RouteComponent,
});

function RouteComponent() {
  // index into galleryImages of the photo open in the preview, or null when it's closed
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const openPreview = (image: GalleryImage) => setPreviewIndex(galleryImages.indexOf(image));

  return (
    <div className="space-y-12">
      <h1 className="sr-only">Gallery</h1>

      {featuredImages[0] && (
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <img
            src={smallSrc(featuredImages[0]).toAsset()}
            alt=""
            className="h-full w-full scale-110 object-cover opacity-40 blur-3xl"
          />
          <div className="absolute inset-0 bg-hg-black/60" />
        </div>
      )}

      {featuredImages.length > 0 && (
        <section aria-label="Featured photos">
          <MakeCarousel
            className="h-64 sm:h-96 lg:h-130 overflow-hidden"
            items={featuredImages.map((image) => (
              <button
                type="button"
                className="relative block h-full w-full cursor-zoom-in"
                aria-label={`View photo: ${image.alt}`}
                onClick={() => openPreview(image)}
              >
                <img
                  src={image.src.toAsset()}
                  alt={image.alt}
                  className="block h-full w-full object-cover object-center drag-none"
                />
                {image.caption && (
                  <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-hg-black/80 to-transparent p-4 pr-28 pt-12 text-left text-sm text-white sm:text-base">
                    {image.caption}
                  </span>
                )}
              </button>
            ))}
          />
        </section>
      )}

      <section aria-label="All photos" className="grid-lanes gap-4 grid-cols-2 lg:grid-cols-3">
        {galleryImages.map((image) => (
          <button
            key={image.src}
            type="button"
            aria-label={`View photo: ${image.alt}`}
            onClick={() => openPreview(image)}
            className="group relative block self-start overflow-hidden cursor-zoom-in"
          >
            <img
              src={smallSrc(image).toAsset()}
              alt={image.alt}
              loading="lazy"
              className={cn(
                "block w-full h-auto bg-muted",
                "transition-transform duration-300 not-motion-reduce:group-hover:scale-105",
              )}
            />
            {image.caption && (
              <span
                className={cn(
                  "absolute inset-x-0 bottom-0 p-3 pt-8 text-left text-xs text-white sm:text-sm",
                  "bg-linear-to-t from-hg-black/80 to-transparent",
                  "transition-opacity opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100",
                )}
              >
                {image.caption}
              </span>
            )}
          </button>
        ))}
      </section>

      <PhotoPreviewDialog
        index={previewIndex}
        onIndexChange={setPreviewIndex}
        onClose={() => setPreviewIndex(null)}
      />
    </div>
  );
}

function PhotoPreviewDialog({
  index,
  onIndexChange,
  onClose,
}: {
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const image = index === null ? undefined : galleryImages[index];
  const total = galleryImages.length;

  const step = (by: number) => {
    if (index === null) return;
    onIndexChange((index + by + total) % total);
  };

  return (
    <Dialog open={index !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="p-2 w-[calc(100%-2rem)] sm:max-w-6xl"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") step(-1);
          if (e.key === "ArrowRight") step(1);
        }}
      >
        {image && (
          <figure className="flex flex-col gap-2">
            <div className="relative flex items-center justify-center bg-hg-black">
              <img
                key={image.src}
                src={image.src.toAsset()}
                alt={image.alt}
                className="max-h-[80svh] w-auto max-w-full object-contain drag-none"
              />

              {total > 1 && (
                <>
                  <PreviewNavButton side="left" onClick={() => step(-1)} />
                  <PreviewNavButton side="right" onClick={() => step(1)} />
                </>
              )}
            </div>

            <figcaption className="flex items-start justify-between gap-4 px-2 pb-1 text-sm">
              <DialogTitle className="text-sm font-normal">
                {image.caption ?? <span className="sr-only">{image.alt}</span>}
              </DialogTitle>
              <span className="shrink-0 text-muted-foreground tabular-nums">
                {index! + 1} / {total}
              </span>
            </figcaption>
          </figure>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PreviewNavButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? RiArrowLeftSLine : RiArrowRightSLine;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 p-1.5",
        side === "left" ? "left-2" : "right-2",
        "bg-hg-black/50 backdrop-blur-xs text-white transition hover:bg-hg-black/70 active:scale-95",
      )}
    >
      <Icon className="size-6" />
    </button>
  );
}
