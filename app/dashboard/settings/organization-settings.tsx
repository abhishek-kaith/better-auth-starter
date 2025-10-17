"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Settings, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { updateOrganization } from "@/actions/organization";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardSkeleton, QuickActionsSkeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useActiveOrganization } from "@/lib/auth-client";
import { PATHS } from "@/lib/path";
import type {
  ActionResponse,
  OrganizationUpdateResult,
  UpdateOrganizationInput,
} from "@/types/actions";

const UpdateOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  slug: z.string().min(1, "Organization slug is required").optional(),
});

export function OrganizationSettings() {
  const { data: organization, isPending } = useActiveOrganization();
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateOrganizationInput>({
    resolver: zodResolver(UpdateOrganizationSchema),
    values: {
      name: organization?.name || "",
      slug: organization?.slug || "",
    },
  });

  const onSubmit = async (data: UpdateOrganizationInput) => {
    if (!organization?.id) return;

    setIsUpdating(true);
    try {
      const result = await updateOrganization({
        ...data,
        organizationId: organization.id,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success || "Organization updated successfully");
      }
    } catch (_error) {
      toast.error("Failed to update organization");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = () => {
    reset({
      name: organization?.name || "",
      slug: organization?.slug || "",
    });
  };

  if (isPending) {
    return (
      <div className="grid gap-6">
        <CardSkeleton showActions />
        <QuickActionsSkeleton />
      </div>
    );
  }

  if (!organization) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organization Settings</CardTitle>
          <CardDescription>
            You are not a member of any organization. Contact an admin to get
            access.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization Settings</CardTitle>
          <CardDescription>
            Manage your organization information and settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input
                  id="org-name"
                  {...register("name")}
                  placeholder="Enter organization name"
                  disabled={isUpdating}
                  className="w-full"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-slug">Organization Slug</Label>
                <Input
                  id="org-slug"
                  {...register("slug")}
                  placeholder="Enter organization slug"
                  disabled={isUpdating}
                  className="w-full"
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">
                    {errors.slug.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="submit"
                disabled={isUpdating}
                className="min-w-[160px] flex items-center gap-2"
              >
                {isUpdating && <Spinner size="sm" />}
                {isUpdating ? "Updating..." : "Update Organization"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isUpdating}
                className="flex-shrink-0"
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage organization members and other settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Link href={PATHS.settingsMembers}>
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Manage Team Members
                <ExternalLink className="ml-auto h-4 w-4" />
              </Button>
            </Link>
            <Link href={PATHS.settings}>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                General Settings
                <ExternalLink className="ml-auto h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
