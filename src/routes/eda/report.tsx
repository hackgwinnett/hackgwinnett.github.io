import { useEffect, useState } from "react";
import {
  createFileRoute,
  Link,
  useHydrated,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { Fallback } from "#/components/Fallback";
import { z } from "zod/mini";
import { Button } from "#/components/ui/button";
import { Separator } from "#/components/ui/separator";
import { RiFlag2Fill } from "@remixicon/react";
import { brand, repo } from "#/lib/meta/brand";

const templates = {
  nocontent: {
    title: "Missing Content",
    description:
      "Encountered a 404 error. \n(Describe the content that is missing, where you expected to find it, and any other details that might help us track down this pesky bug.)",
  },
  error: {
    title: "Error / bug report",
    description:
      "Encountered an unknown error. \n(Describe what you were doing when the error occurred, what you expected to happen, and any other details that might help us track down this pesky bug.)",
  },
  feedback: {
    title: "Feedback / feature request",
    description: "",
  },
};

const formLineDivider = "=————————————————————————————————————=";

export const Route = createFileRoute("/eda/report")({
  // fills the viewport itself, so the page container would only add overflow
  staticData: { title: "Report a problem", classNames: { container: false } },
  validateSearch: z.object({
    from: z.optional(z.string()), // the route the user came from (if applicable)
    c: z.optional(z.number()), // error code (e.g. 404)
    t: z.optional(z.enum(Object.keys(templates) as Array<keyof typeof templates>)), // template (for form, see templates ^^)
  }),
  beforeLoad: ({ search }) => {
    if (search.from === "/thecakeisalie") {
      throw new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 418,
        statusText: "the cake is a lie",
      });
    }
  },
  component: RouteComponent,
  errorComponent: ErrorComponent,
});

function RouteComponent() {
  const { from: origin, c: code, t: templateId } = Route.useSearch();
  const [date, setDate] = useState<string>();

  const template = templateId ? templates[templateId] : undefined;
  const link = `https://docs.google.com/forms/d/e/1FAIpQLSd8ngPGYLdc5gZicMCwm2fZN0bkOqZzPcHKVwFhgzchuYpGkw/viewform?entry.1231647937=HG+Marketing+(hackgwinnett.org)${date && `&entry.2078293770=${date}`}${templateId && `&entry.1830352709=${template?.description}`}${`&entry.1501072006=${formLineDivider}%0Aeda-${templateId || "generic"}:[${code || "none"}], using template ${template ? `"${template.title}"` : "(no template)"}, origin: ${origin || "(no origin)"}`}%0A${formLineDivider}%0A`;

  const hydrated = useHydrated();

  useEffect(() => {
    if (!hydrated) return;
    const now = new Date();

    setDate(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}+${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
    );
  }, [hydrated]);

  return (
    <div className="flex font-heading flex-col min-h-safe-dvh max-w-lg mx-auto items-center justify-center text-center gap-4 px-4">
      <h3>Sorry about that!</h3>
      {/*<p>Click below to report an issue or submit feedback:</p>*/}
      <div className="flex flex-col items-center text-center gap-2">
        <Button
          render={<Link to={link} target="_blank" rel="noopener noreferrer" />}
          variant="destructive"
          nativeButton={false}
        >
          <RiFlag2Fill /> Report issue...
        </Button>
        <p className="italic text-muted-foreground text-sm">
          or view the{" "}
          <Link to={repo.url as string} target="_blank" rel="noopener noreferrer" className="link">
            GitHub repository
          </Link>
        </p>
      </div>
      <Separator />
      <p className="text-muted-foreground text-xs">
        We'll ask for your email, but {brand.name} will only contact you if you've previously
        allowed us or you gave us confirmation in the form you're about to submit. We do this to
        combat spam from emails with a history of malicious/false reports {":)"}
      </p>
      <p className="text-muted-foreground text-xs">
        Please only submit valid issues related to the HackGwinnett website (hackgwinnett.org). If
        you need help with our other software, visit that specific repository or product page. If
        you can't find it, or have any other question about HackGwinnett,{" "}
        <Link to="/contact" className="link">
          reach out to us
        </Link>
        ! Anytime!!!
      </p>
    </div>
  );
}

function ErrorComponent(props: ErrorComponentProps) {
  return (
    <Fallback
      title={
        props.error instanceof Response
          ? `${props.error.statusText} (${props.error.status})`
          : "the issue reporter failed to process your request."
      }
      actions={[{ label: "go home", to: "/" }]}
    />
  );
}
