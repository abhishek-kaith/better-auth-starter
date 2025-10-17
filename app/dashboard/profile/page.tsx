import { ExternalLink, Shield } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardPageContainer } from "@/components/layout/dashboard-page-container";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await import("next/headers").then((mod) => mod.headers()),
  });

  if (!session) {
    redirect(PATHS.signIn);
  }

  const breadcrumbItems = [
    { label: "Dashboard", href: PATHS.dashboard },
    { label: "Profile" },
  ];

  const user = session.user as ExtendedUser;

  return (
    <DashboardPageContainer breadcrumbItems={breadcrumbItems}>
      <div className="grid gap-4 sm:gap-6">
        {/* Profile Overview */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">
              Profile Overview
            </CardTitle>
            <CardDescription className="text-sm">
              Your profile information and account status.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                  <AvatarImage src={user.image || undefined} alt={user.name} />
                  <AvatarFallback className="text-xl sm:text-2xl">
                    {user.name?.charAt(0)?.toUpperCase() ||
                      user.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="space-y-3 text-center sm:text-left flex-1 min-w-0">
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-semibold">
                    {user.name}
                  </h3>
                  <p className="text-sm text-muted-foreground break-words">
                    {user.email}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <Badge
                    variant={user.emailVerified ? "default" : "secondary"}
                    className="text-xs px-2 py-1"
                  >
                    {user.emailVerified ? "✓ Verified" : "✗ Unverified"}
                  </Badge>
                  {user.role && (
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      {user.role}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <ProfileForm user={user} />

        {/* Account Information */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">
              Account Information
            </CardTitle>
            <CardDescription className="text-sm">
              View your account details and statistics.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 p-3 rounded-lg bg-muted/30">
                <div className="text-sm font-medium text-foreground">
                  Account Created
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="space-y-2 p-3 rounded-lg bg-muted/30">
                <div className="text-sm font-medium text-foreground">
                  Last Updated
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(user.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="space-y-2 p-3 rounded-lg bg-muted/30">
                <div className="text-sm font-medium text-foreground">
                  Two-Factor Authentication
                </div>
                <div>
                  <Badge
                    variant={user.twoFactorEnabled ? "default" : "secondary"}
                    className="text-xs px-2 py-1"
                  >
                    {user.twoFactorEnabled ? "✓ Enabled" : "✗ Disabled"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2 p-3 rounded-lg bg-muted/30">
                <div className="text-sm font-medium text-foreground">
                  User ID
                </div>
                <p className="text-xs text-muted-foreground font-mono break-all leading-relaxed">
                  {user.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
            <CardDescription className="text-sm">
              Access security settings and other profile features.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <Link href={PATHS.profileSecurity} className="block">
                <Button
                  variant="outline"
                  className="w-full justify-between h-12 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center">
                    <Shield className="mr-3 h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Security Settings</div>
                      <div className="text-xs text-muted-foreground">
                        Manage passwords and 2FA
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardPageContainer>
  );
}
