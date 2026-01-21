import NotFoundShell from "@/components/shared/NotFoundShell";

export default function AdminNotFound() {
  return (
    <NotFoundShell
      pageTitle="Admin - Page not found"
      subtitle="404 - Admin route missing"
      title="This admin page doesn’t exist."
      description="This route isn’t available in the admin console. Return to the dashboard or go back home."
      primaryCta={{ label: "Back to Home", to: "/" }}
      secondaryCta={{ label: "Go to Admin Dashboard", to: "/admin/dashboard" }}
    />
  );
}
