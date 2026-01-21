import NotFoundShell from "@/components/shared/NotFoundShell";

export default function NotFoundUser() {
  return (
    <NotFoundShell
      pageTitle="Page not found"
      subtitle="404 - Page not found"
      title="We couldn’t find that page."
      description="Looks like the path ended here. Go back home or head to the marketplace."
      primaryCta={{ label: "Back to Home", to: "/" }}
      secondaryCta={{ label: "Go to Marketplace", to: "/marketplace" }}
    />
  );
}
