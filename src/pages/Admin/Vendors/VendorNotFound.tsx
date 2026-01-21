import NotFoundShell from "@/components/shared/NotFoundShell";

export default function VendorNotFound() {
  return (
    <NotFoundShell
      pageTitle="Vendor - Page not found"
      subtitle="404 - Vendor route missing"
      title="This vendor page doesn’t exist."
      description="This route isn’t available in the vendor dashboard. Return to your dashboard or view leads."
      primaryCta={{ label: "Back to Home", to: "/" }}
      secondaryCta={{ label: "Go to Vendor Dashboard", to: "/vendor/dashboard" }}
    />
  );
}
