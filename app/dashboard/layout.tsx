import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { auth } from "@/lib/auth";
import { PATHS } from "@/lib/path";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await import("next/headers").then((mod) => mod.headers()),
  });

  if (!session) {
    redirect(PATHS.signIn);
  }

  const organizations = await auth.api.listOrganizations({
    headers: await import("next/headers").then((mod) => mod.headers()),
  });

  if (!organizations || organizations.length === 0) {
    redirect(PATHS.organizationSetup);
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <main className="lg:pl-64">{children}</main>
    </div>
  );
}
