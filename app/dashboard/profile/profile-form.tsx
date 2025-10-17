"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { updateProfile } from "@/actions/profile";
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
import { Spinner } from "@/components/ui/spinner";
import type { ActionResponse, UpdateProfileInput } from "@/types/actions";
import type { ExtendedUser } from "@/types/auth";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: ExtendedUser;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    startTransition(async () => {
      const result = await updateProfile(data);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        reset(data); // Reset form with new values
      }
    });
  };

  const handleCancel = () => {
    reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your personal information and profile details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter your full name"
                disabled={isPending}
                className="w-full"
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-muted w-full"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed. Contact support if you need to update
                your email.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="submit"
              disabled={isPending || !isDirty}
              className="min-w-[120px] flex items-center gap-2"
            >
              {isPending && <Spinner size="sm" />}
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending || !isDirty}
              className="flex-shrink-0"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
