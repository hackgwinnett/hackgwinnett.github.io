import { createFileRoute, Link, Navigate } from "@tanstack/react-router";

// TODO: replace with actual archive browser and replace navbar's "archive" with more
// the more dropdown will make it so that no menu item is hidden/only in the drawer
// the hidden functionality will still be there for strictly mobile-only stuff but that's all

export const Route = createFileRoute("/programs/hackathon/archive")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Navigate to="." href="https://hackgwinnett-6-0.devpost.com/project-gallery" replace />
      <Link to="/" className="link">
        Continue to HG6 gallery
      </Link>
    </>
  );
}
