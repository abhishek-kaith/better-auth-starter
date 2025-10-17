"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Key, Mail } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { forgetPassword } from "@/actions/two-factor";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import type { ExtendedUser } from "@/types/auth";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface SecurityFormProps {
  user: ExtendedUser;
  hasPassword?: boolean; // This would need to be determined from the session or user data
}

export function SecurityForm({ user, hasPassword = true }: SecurityFormProps) {
  const [isPending, startTransition] = useTransition();
  const [showResetDialog, setShowResetDialog] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: user.email,
    },
  });

  const onSendReset = (data: EmailFormData) => {
    startTransition(async () => {
      const result = await forgetPassword(data.email);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        setShowResetDialog(false);
        reset();
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Account Security
        </CardTitle>
        <CardDescription>
          Manage your password and account security settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasPassword && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You signed in with a social provider and haven't set a password
              yet. Setting a password will allow you to sign in directly with
              email and password.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h4 className="font-medium">Password</h4>
            <p className="text-sm text-muted-foreground">
              {hasPassword
                ? "Change your password or reset it via email"
                : "Set a password for your account"}
            </p>
          </div>
          <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Mail className="h-4 w-4 mr-2" />
                {hasPassword ? "Reset Password" : "Set Password"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {hasPassword ? "Reset Password" : "Set Password"}
                </DialogTitle>
                <DialogDescription>
                  We'll send a password reset link to your email address.
                  {!hasPassword &&
                    " You can use this to set your first password."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSendReset)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    disabled={isPending}
                    className="w-full"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 flex items-center gap-2"
                  >
                    {isPending && <Spinner size="sm" />}
                    {isPending ? "Sending..." : "Send Reset Link"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowResetDialog(false)}
                    disabled={isPending}
                    className="flex-shrink-0"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Password reset links expire after 24 hours</p>
          <p>• Check your spam folder if you don't receive the email</p>
          {!hasPassword && (
            <p>
              • After setting a password, you can sign in with email/password or
              continue using social sign-in
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
