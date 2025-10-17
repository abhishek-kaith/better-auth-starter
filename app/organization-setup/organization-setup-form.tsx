"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import { organization } from "@/lib/auth-client";
import { PATHS } from "@/lib/path";

const CreateOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  slug: z.string().min(1, "Organization slug is required"),
});

type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;

export function OrganizationSetupForm() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrganizationInput>({
    resolver: zodResolver(CreateOrganizationSchema),
  });

  const onSubmit = async (data: CreateOrganizationInput) => {
    setIsCreating(true);
    try {
      const result = await organization.create({
        name: data.name,
        slug: data.slug,
      });

      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success("Organization created successfully!");
        router.push(PATHS.dashboard);
      }
    } catch (_error) {
      toast.error("Failed to create organization");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Organization</CardTitle>
        <CardDescription>
          Create a new organization to get started with the dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter organization name"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Organization Slug</Label>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="enter-organization-slug"
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Used in URLs and must be unique
            </p>
          </div>

          <Button type="submit" disabled={isCreating} className="w-full">
            {isCreating ? "Creating..." : "Create Organization"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-muted-foreground text-center">
            Waiting for an invitation? Check your email or contact an admin.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
