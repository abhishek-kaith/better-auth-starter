import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PATHS } from "@/lib/path";
import { OrganizationSetupForm } from "./organization-setup-form";

export default async function OrganizationSetupPage() {
  const session = await auth.api.getSession({
    headers: await import("next/headers").then((mod) => mod.headers()),
  });

  if (!session) {
    redirect(PATHS.signIn);
  }

  // Check if user already has organizations
  const organizations = await auth.api.listOrganizations({
    headers: await import("next/headers").then((mod) => mod.headers()),
  });

  if (organizations && organizations.length > 0) {
    redirect(PATHS.dashboard);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Organization Setup</h1>
          <p className="text-muted-foreground mt-2">
            You need to be part of an organization to access the dashboard.
          </p>
        </div>
        <OrganizationSetupForm />
      </div>
    </div>
  );
}
