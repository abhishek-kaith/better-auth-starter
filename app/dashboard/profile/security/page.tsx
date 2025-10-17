import { ExternalLink, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardPageContainer } from "@/components/layout/dashboard-page-container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { PATHS } from "@/lib/path";
import type { ExtendedUser } from "@/types/auth";
import { PasswordForm } from "../password-form";
import { SecurityForm } from "../security-form";

export default async function SecurityPage() {
  const session = await auth.api.getSession({
    headers: await import("next/headers").then((mod) => mod.headers()),
  });

  if (!session) {
    redirect(PATHS.signIn);
  }

  const breadcrumbItems = [
    { label: "Dashboard", href: PATHS.dashboard },
    { label: "Profile", href: PATHS.profile },
    { label: "Security" },
  ];

  const user = session.user as ExtendedUser;

  return (
    <DashboardPageContainer breadcrumbItems={breadcrumbItems}>
      <div className="grid gap-6">
        {/* Password Form */}
        <PasswordForm />

        {/* Security Form (Password Reset) */}
        <SecurityForm user={user} />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Navigate to other profile sections.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Link href={PATHS.profile}>
                <Button variant="outline" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Profile Overview
                  <ExternalLink className="ml-auto h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardPageContainer>
  );
}
