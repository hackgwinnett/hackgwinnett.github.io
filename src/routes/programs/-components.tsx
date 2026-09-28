import { Button } from "#/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "#/components/ui/item";
import { Popover, PopoverContent, PopoverTrigger } from "#/components/ui/popover";
import {
  RiAppleFill,
  RiGoogleFill,
  RiMapPinLine,
  RiMicrosoftFill,
  RiTimeLine,
} from "@remixicon/react";
import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger,
} from "#/components/ui/context-menu";
import { useHydrated } from "@tanstack/react-router";
import { cn, copy } from "#/lib/utils";
import { MakeCarousel } from "#/components/elements/misc/MakeCarousel.tsx";

import type { HGEvent } from "#/lib/meta/events";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const isValidDate = (d: Date): boolean => d instanceof Date && !Number.isNaN(d.getTime());

/** formatRange keeps the weekday on both ends of a multi-day range; the fallback below has to too */
export function formatEventDate(start: Date, end?: Date): string {
  if (!isValidDate(start)) return "Invalid date";
  if (!end || !isValidDate(end)) return dateFormatter.format(start);

  const [rangeStart, rangeEnd] = start <= end ? [start, end] : [end, start];
  if (rangeStart.getTime() === rangeEnd.getTime()) return dateFormatter.format(rangeStart);

  try {
    return dateFormatter.formatRange(rangeStart, rangeEnd);
  } catch {
    return `${dateFormatter.format(rangeStart)} – ${dateFormatter.format(rangeEnd)}`;
  }
}

export interface ProgramsGalleryImage {
  src: string;
  alt: string;
}

export function EventPage({
  event,
  content,
  gallery,
  additions,
}: {
  event: HGEvent;
  content?: React.ReactNode;
  /** photos from past years; omitted for events we haven't shot yet */
  gallery?: ProgramsGalleryImage[];
  additions?: {
    left?: { start?: React.ReactNode; cta?: React.ReactNode; end?: React.ReactNode };
    right?: { start?: React.ReactNode; end?: React.ReactNode };
  };
}) {
  const hydrated = useHydrated();

  const escapeICS = (value: string) =>
    value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

  const formatICSDate = (date: Date) => date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const getCalendarLink = (event: HGEvent, type: "apple" | "google" | "outlook") => {
    if (!event.date) return undefined;
    const { start, end: rawEnd } = event.date;
    const end = rawEnd || new Date(start.getTime() + 60 * 60 * 24 * 1000); // default to 1 day later if no end date is provided

    const buildICS = () => {
      const uid =
        `${event.shortName || event.name}-${start.toISOString()}@events.hackgwinnett.org`.replace(
          /\s+/g,
          "-",
        );

      return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//HackGwinnett//Calendar//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART:${formatICSDate(start)}`,
        `DTEND:${formatICSDate(end)}`,
        `SUMMARY:${escapeICS(event.name)}`,
        `DESCRIPTION:${escapeICS(event.description)}`,
        `LOCATION:${escapeICS(`${event.location.name}, ${event.location.address}`)}`,
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n");
    };

    if (type === "google") {
      const startStr = start.toISOString().replace(/-|:|\.\d\d\d/g, "");
      const endStr = end.toISOString().replace(/-|:|\.\d\d\d/g, "");
      const details = encodeURIComponent(event.description);
      const location = encodeURIComponent(`${event.location.name}, ${event.location.address}`);
      const text = encodeURIComponent(event.name);

      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
    }

    if (type === "outlook") {
      const startStr = encodeURIComponent(start.toISOString());
      // end date or all day
      const endStr = encodeURIComponent(end.toISOString());
      const subject = encodeURIComponent(event.name);
      const body = encodeURIComponent(event.description);
      const location = encodeURIComponent(`${event.location.name}, ${event.location.address}`);

      return `https://outlook.cloud.microsoft/calendar/0/deeplink/compose?subject=${subject}&body=${body}&startdt=${startStr}&enddt=${endStr}&location=${location}`;
    }

    const blob = new Blob([buildICS()], { type: "text/calendar;charset=utf-8" });
    return URL.createObjectURL(blob);
  };

  const addToCalendar = (event: HGEvent, type: "apple" | "google" | "outlook") => {
    if (!hydrated) return;

    const url = getCalendarLink(event, type);
    if (!url) return;
    const filename = `${event.shortName || event.name}.ics`;

    if (type === "apple") {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(() => URL.revokeObjectURL(url), 500);
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyToCalendar = (event: HGEvent, type: "apple" | "google" | "outlook") => {
    if (!hydrated) return;

    const url = getCalendarLink(event, type);
    if (!url) return;
    copy(url);
  };

  return (
    <div>
      <div className="grid lg:grid-cols-2 gap-10">
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl">{event.name}</h2>
            <p>{event.description}</p>
          </div>

          <div className="flex flex-col gap-2">
            {event.registration?.closed ? (
              <Alert>
                <AlertTitle>Event registration is not open</AlertTitle>
                <AlertDescription>
                  Sign-ups for {event.name} are closed at this time. Check back later!
                </AlertDescription>
              </Alert>
            ) : event.registration ? (
              <Button
                size="lg"
                render={<Link to={event.registration.page || event.registration.url} />}
                nativeButton={false}
              >
                Register Now
              </Button>
            ) : null}
            {additions?.left?.cta}
          </div>

          <ItemGroup>
            <Item variant="muted">
              <ItemMedia variant="icon">
                <RiMapPinLine />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{event.location.name}</ItemTitle>
                <ItemDescription className="text-xs">
                  <Link
                    to={event.location.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link"
                  >
                    {event.location.address}
                  </Link>
                </ItemDescription>
              </ItemContent>
            </Item>
            {event.date && (
              <Item variant="muted">
                <ItemMedia variant="icon">
                  <RiTimeLine />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{formatEventDate(event.date.start, event.date.end)}</ItemTitle>
                  <ItemDescription className="text-xs">
                    <Popover>
                      <PopoverTrigger className="alt-link">Add to calendar</PopoverTrigger>
                      <PopoverContent>
                        <ContextMenu>
                          <ContextMenuTrigger
                            render={
                              <Button
                                variant="outline"
                                size="lg"
                                onClick={() => addToCalendar(event, "apple")}
                              />
                            }
                          >
                            <RiAppleFill /> Apple
                            <span className="sr-only">Apple Calendar</span>
                          </ContextMenuTrigger>
                          <ContextMenuContent className="w-48">
                            <ContextMenuGroup>
                              <ContextMenuItem
                                onSelect={() => copyToCalendar(event, "apple")}
                                disabled
                              >
                                Copy link
                              </ContextMenuItem>
                            </ContextMenuGroup>
                          </ContextMenuContent>
                        </ContextMenu>

                        <ContextMenu>
                          <ContextMenuTrigger
                            render={
                              <Button
                                variant="outline"
                                size="lg"
                                onClick={() => addToCalendar(event, "google")}
                              />
                            }
                          >
                            <RiGoogleFill /> Google
                            <span className="sr-only">Google Calendar</span>
                          </ContextMenuTrigger>
                          <ContextMenuContent className="w-48">
                            <ContextMenuGroup>
                              <ContextMenuItem onSelect={() => copyToCalendar(event, "google")}>
                                Copy link
                              </ContextMenuItem>
                            </ContextMenuGroup>
                          </ContextMenuContent>
                        </ContextMenu>

                        <ContextMenu>
                          <ContextMenuTrigger
                            render={
                              <Button
                                variant="outline"
                                size="lg"
                                onClick={() => addToCalendar(event, "outlook")}
                              />
                            }
                          >
                            <RiMicrosoftFill /> Outlook
                            <span className="sr-only">Microsoft Outlook</span>
                          </ContextMenuTrigger>
                          <ContextMenuContent className="w-48">
                            <ContextMenuGroup>
                              <ContextMenuItem onSelect={() => copyToCalendar(event, "outlook")}>
                                Copy link
                              </ContextMenuItem>
                            </ContextMenuGroup>
                          </ContextMenuContent>
                        </ContextMenu>
                      </PopoverContent>
                    </Popover>
                  </ItemDescription>
                </ItemContent>
              </Item>
            )}
          </ItemGroup>
          <div className="flex flex-col gap-2">
            {additions?.left?.start}
            {content}
            {/*{event.details?.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}*/}
            {additions?.left?.end}
          </div>
        </div>
        <div className="flex flex-col gap-2 items-center lg:items-end">
          {additions?.right?.start}
          {gallery?.length ? (
            <MakeCarousel
              className={cn(
                "max-w-full md:max-w-xl lg:max-w-full h-80 overflow-hidden",
                "[&>img]:block [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>img]:object-center [&>img]:drag-none",
              )}
              items={gallery.map((image) => (
                <img src={image.src.toAsset()} alt={image.alt} />
              ))}
            />
          ) : null}
          {additions?.right?.end}
        </div>
      </div>
    </div>
  );
}
