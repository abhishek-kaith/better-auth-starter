import { redirect } from "next/navigation";
import { getPendingInvitationForUser } from "@/actions/invitation";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { env } from "@/env";
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

  // Check for pending invitations first - higher priority than org setup
  const pendingInvitation = await getPendingInvitationForUser(
    session.user.email,
  );

  if (pendingInvitation.data) {
    redirect(PATHS.acceptInvitation(pendingInvitation.data.id));
  }

  const organizations = await auth.api.listOrganizations({
    headers: await import("next/headers").then((mod) => mod.headers()),
  });

  if (
    (!organizations || organizations.length === 0) &&
    session.user.email === env.ADMIN_EMAIL
  ) {
    redirect(PATHS.organizationSetup);
  }

  await auth.api.setActiveOrganization({
    body: {
      organizationId: organizations[0].id,
      organizationSlug: organizations[0].slug,
    },
    headers: await import("next/headers").then((mod) => mod.headers()),
  });

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <main className="lg:pl-64">{children}</main>
    </div>
  );
}
