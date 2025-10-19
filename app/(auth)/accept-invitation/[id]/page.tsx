"use client";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  acceptInvitation,
  checkUserExists,
  getInvitationDetails,
} from "@/actions/invitation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useSession } from "@/lib/auth-client";
import { PATHS } from "@/lib/path";
import type { InvitationDetails } from "@/types/actions";

export default function AcceptInvitation() {
  const params = useParams();
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const invitationId = params.id as string;

  const loadInvitationDetails = useCallback(async () => {
    try {
      const result = await getInvitationDetails(invitationId);
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setInvitation(result.data);

        // Check if user exists with this email
        const userExistsResult = await checkUserExists(result.data.email);
        if (userExistsResult.data !== undefined) {
          setUserExists(userExistsResult.data);
        }
      }
    } catch (_error) {
      setError("Failed to load invitation details");
    } finally {
      setLoading(false);
    }
  }, [invitationId]);

  useEffect(() => {
    if (invitationId) {
      loadInvitationDetails();
    }
  }, [invitationId, loadInvitationDetails]);

  const handleAcceptInvitation = async () => {
    if (!invitation) return;

    // If user is logged in and email matches invitation, accept directly
    if (session?.user && session.user.email === invitation.email) {
      setAccepting(true);
      setError("");

      try {
        const result = await acceptInvitation({ invitationId });
        if (result.error) {
          setError(result.error);
          toast.error(result.error);
        } else {
          toast.success(
            result.success ||
              "Invitation accepted! Welcome to the organization.",
          );
          // Small delay to ensure database update is committed before redirect
          setTimeout(() => {
            router.push(PATHS.dashboard);
          }, 100);
        }
      } catch (_error) {
        setError("Failed to accept invitation");
        toast.error("Failed to accept invitation");
      } finally {
        setAccepting(false);
      }
    } else {
      // For new users or signed-in users with different email, show password form
      setShowPasswordForm(true);
    }
  };

  const resetPasswordForm = () => {
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation) return;

    setError("");

    // Client-side validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setAccepting(true);

    try {
      const result = await acceptInvitation({
        invitationId,
        password,
      });

      if (result.error === "USER_EXISTS") {
        // User already exists, redirect to sign in
        const signInUrl = `${PATHS.signIn}?callbackUrl=${encodeURIComponent(window.location.href)}`;
        toast.info(
          result.success || "Please sign in to accept the invitation.",
        );
        router.push(signInUrl);
      } else if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success(
          result.success ||
            "Account created and invitation accepted! Welcome to the organization.",
        );
        // Small delay to ensure database update is committed before redirect
        setTimeout(() => {
          router.push(PATHS.dashboard);
        }, 100);
      }
    } catch (_error) {
      setError("Failed to accept invitation");
      toast.error("Failed to accept invitation");
    } finally {
      setAccepting(false);
    }
  };

  const handleSignOut = async () => {
    const { signOut } = await import("@/lib/auth-client");
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Signed out successfully");
          // Reload the page to refresh the invitation state
          window.location.reload();
        },
      },
    });
  };

  if (sessionPending || loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading invitation...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Invalid Invitation
          </CardTitle>
          <CardDescription>
            This invitation link is not valid or has expired.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Link href={PATHS.signIn}>
              <Button variant="outline" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!invitation) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Invitation not found
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check invitation status and expiry
  const isExpired = new Date(invitation.expiresAt) < new Date();
  const isAccepted = invitation.status === "accepted";
  const isCancelled = invitation.status === "cancelled";
  const isInvalid = invitation.status !== "pending" || isExpired;

  if (isInvalid) {
    let title = "Invalid Invitation";
    let description = "This invitation is no longer valid.";
    let alertMessage = "";

    if (isExpired) {
      title = "Invitation Expired";
      description = "This invitation has expired and can no longer be used.";
      alertMessage = `This invitation expired on ${new Date(invitation.expiresAt).toLocaleDateString()}`;
    } else if (isAccepted) {
      title = "Invitation Already Used";
      description = "This invitation has already been accepted and used.";
      alertMessage =
        "This invitation has already been accepted. If you need access, please contact your organization administrator.";
    } else if (isCancelled) {
      title = "Invitation Cancelled";
      description =
        "This invitation has been cancelled and is no longer valid.";
      alertMessage =
        "This invitation was cancelled by the organization. Please contact your organization administrator if you believe this is an error.";
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Link href={PATHS.signIn}>
              <Button variant="outline" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          You're Invited!
        </CardTitle>
        <CardDescription>
          {invitation.inviterName} has invited you to join{" "}
          <strong>{invitation.organizationName}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="text-sm">
            <strong>Email:</strong> {invitation.email}
          </div>
          <div className="text-sm">
            <strong>Role:</strong> {invitation.role}
          </div>
          <div className="text-sm">
            <strong>Invited by:</strong> {invitation.inviterName}
          </div>
        </div>

        {/* Show immediate sign-in prompt for existing users who aren't logged in */}
        {userExists && !session?.user && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Great! We found your account for{" "}
              <strong>{invitation.email}</strong>. Please sign in to accept this
              invitation and join <strong>{invitation.organizationName}</strong>
              .
            </AlertDescription>
          </Alert>
        )}

        {/* Show warning for logged-in user with different email */}
        {session?.user && session.user.email !== invitation.email && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You are currently signed in as{" "}
              <strong>{session.user.email}</strong>. This invitation is for{" "}
              <strong>{invitation.email}</strong>.
              {userExists
                ? " Please sign out and sign in with the invited email address."
                : " You can create a new account for the invited email below."}
            </AlertDescription>
          </Alert>
        )}

        {/* Show success message for correctly logged-in user */}
        {session?.user && session.user.email === invitation.email && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Perfect! You are signed in with the invited email address. Click
              accept to join the organization.
            </AlertDescription>
          </Alert>
        )}

        {/* Buttons for existing users not logged in */}
        {userExists && !session?.user && (
          <Button
            onClick={() => {
              const signInUrl = `${PATHS.signIn}?callbackUrl=${encodeURIComponent(window.location.href)}`;
              router.push(signInUrl);
            }}
            className="w-full"
            disabled={accepting}
          >
            Sign In to Accept Invitation
          </Button>
        )}

        {/* Buttons for logged-in user with different email */}
        {session?.user && session.user.email !== invitation.email && (
          <div className="flex gap-2">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="flex-1"
              disabled={accepting}
            >
              Sign Out First
            </Button>
            {!userExists && (
              <Button
                onClick={handleAcceptInvitation}
                className="flex-1"
                disabled={accepting}
              >
                {accepting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  "Create New Account"
                )}
              </Button>
            )}
          </div>
        )}

        {session?.user && session.user.email === invitation.email && (
          <Button
            onClick={handleAcceptInvitation}
            className="w-full"
            disabled={accepting}
          >
            {accepting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Accepting Invitation...
              </>
            ) : (
              "Accept Invitation"
            )}
          </Button>
        )}

        {showPasswordForm && !session?.user && !userExists && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Set your password</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a secure password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={accepting}>
                {accepting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account & Join"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetPasswordForm}
                disabled={accepting}
              >
                Clear Fields
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowPasswordForm(false)}
                disabled={accepting}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {!showPasswordForm && !session?.user && !userExists && (
          <Button
            onClick={handleAcceptInvitation}
            className="w-full"
            disabled={accepting}
          >
            {accepting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              "Continue to Set Password"
            )}
          </Button>
        )}

        <div className="text-center">
          <Link href={PATHS.signIn}>
            <Button variant="link" className="text-sm">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
