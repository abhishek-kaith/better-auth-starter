"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import db from "@/db/client";
import { invitation, member, organization, user } from "@/db/schema/auth";
import { auth } from "@/lib/auth";
import type { ActionResponse, InvitationDetails } from "@/types/actions";

/**
 * Get invitation details by ID
 */
export async function getInvitationDetails(
  invitationId: string,
): Promise<ActionResponse<InvitationDetails>> {
  try {
    if (!invitationId) {
      return { error: "Invitation ID is required" };
    }

    // Find the invitation with organization and inviter details
    const invitationData = await db
      .select({
        invitation,
        organization,
        inviter: user,
      })
      .from(invitation)
      .leftJoin(organization, eq(invitation.organizationId, organization.id))
      .leftJoin(user, eq(invitation.inviterId, user.id))
      .where(eq(invitation.id, invitationId))
      .limit(1);

    if (!invitationData.length) {
      return { error: "Invitation not found" };
    }

    const data = invitationData[0];

    if (!data.organization || !data.inviter) {
      return { error: "Invalid invitation data" };
    }

    return {
      data: {
        id: data.invitation.id,
        email: data.invitation.email,
        role: data.invitation.role || "member",
        organizationName: data.organization.name,
        inviterName: data.inviter.name,
        expiresAt: data.invitation.expiresAt.toISOString(),
        status: data.invitation.status,
      },
    };
  } catch (error) {
    console.error("Error getting invitation details:", error);
    return { error: "Failed to get invitation details" };
  }
}

/**
 * Simplified invitation acceptance - handles both new and existing users
 */
export async function acceptInvitation(input: {
  invitationId: string;
  password?: string;
}): Promise<ActionResponse> {
  try {
    const { invitationId, password } = input;

    if (!invitationId) {
      return { error: "Invitation ID is required" };
    }

    // Get invitation details first
    const invitationResult = await getInvitationDetails(invitationId);
    if (invitationResult.error || !invitationResult.data) {
      return { error: invitationResult.error || "Invalid invitation" };
    }

    const invitationDetails = invitationResult.data;

    // Check if invitation is still valid
    if (new Date(invitationDetails.expiresAt) < new Date()) {
      return { error: "This invitation has expired" };
    }

    // Check invitation status with specific error messages
    if (invitationDetails.status === "accepted") {
      return { error: "This invitation has already been accepted and used" };
    }

    if (invitationDetails.status === "cancelled") {
      return {
        error: "This invitation has been cancelled and is no longer valid",
      };
    }

    if (invitationDetails.status !== "pending") {
      return { error: "This invitation is no longer valid" };
    }

    // Get the invitation record to get the organization ID early
    const invitationRecord = await db
      .select()
      .from(invitation)
      .where(eq(invitation.id, invitationId))
      .limit(1);

    if (!invitationRecord.length) {
      return { error: "Invitation not found" };
    }

    const orgId = invitationRecord[0].organizationId;

    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, invitationDetails.email))
      .limit(1);

    let userId: string;

    if (existingUser.length > 0) {
      // User exists
      if (!session?.user) {
        return {
          error: "USER_EXISTS",
          success: "Please sign in first to accept this invitation.",
        };
      }

      if (session.user.email !== invitationDetails.email) {
        return {
          error:
            "You must be signed in with the invited email address to accept this invitation",
        };
      }

      userId = session.user.id;

      // Check if user is already a member of this organization
      const existingMember = await db
        .select()
        .from(member)
        .where(and(eq(member.organizationId, orgId), eq(member.userId, userId)))
        .limit(1);

      if (existingMember.length > 0) {
        return { error: "You are already a member of this organization" };
      }
    } else {
      // New user - password is required
      if (!password) {
        return { error: "Password is required for new accounts" };
      }

      if (password.length < 8) {
        return { error: "Password must be at least 8 characters long" };
      }

      // Create new user account
      const createUserResult = await auth.api.createUser({
        body: {
          email: invitationDetails.email,
          password: password,
          name: invitationDetails.email.split("@")[0],
        },
      });

      if (!createUserResult || !createUserResult.user) {
        return { error: "Failed to create user account" };
      }

      userId = createUserResult.user.id;

      // Mark email as verified since they accessed the invitation link
      await db
        .update(user)
        .set({ emailVerified: true })
        .where(eq(user.email, invitationDetails.email));

      // Sign in the new user
      await auth.api.signInEmail({
        body: {
          email: invitationDetails.email,
          password: password,
        },
      });
    }

    // Add user to organization
    await db.insert(member).values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      userId: userId,
      role: invitationDetails.role,
      createdAt: new Date(),
    });

    // Update invitation status to accepted
    await db
      .update(invitation)
      .set({ status: "accepted" })
      .where(eq(invitation.id, invitationId));

    return {
      success:
        existingUser.length > 0
          ? "Successfully joined the organization!"
          : "Account created and invitation accepted! Welcome to the organization.",
    };
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return { error: "Failed to accept invitation" };
  }
}

/**
 * Check if a user exists with given email
 */
export async function checkUserExists(
  email: string,
): Promise<ActionResponse<boolean>> {
  try {
    const existingUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    return { data: existingUser.length > 0 };
  } catch (error) {
    console.error("Error checking if user exists:", error);
    return { error: "Failed to check user existence" };
  }
}

/**
 * Check if user has any pending invitations
 */
export async function getPendingInvitationForUser(
  userEmail: string,
): Promise<ActionResponse<InvitationDetails | null>> {
  try {
    // First check if user exists and get their ID
    const existingUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, userEmail))
      .limit(1);

    // Find pending invitations for this email
    const pendingInvitations = await db
      .select({
        invitation,
        organization,
        inviter: user,
      })
      .from(invitation)
      .leftJoin(organization, eq(invitation.organizationId, organization.id))
      .leftJoin(user, eq(invitation.inviterId, user.id))
      .where(
        and(eq(invitation.email, userEmail), eq(invitation.status, "pending")),
      )
      .limit(1);

    if (!pendingInvitations.length) {
      return { data: null };
    }

    const data = pendingInvitations[0];

    if (!data.organization || !data.inviter) {
      return { data: null };
    }

    // Check if invitation is still valid (not expired)
    if (new Date(data.invitation.expiresAt) < new Date()) {
      return { data: null };
    }

    // Additional safeguard: If user exists, check if they're already a member of this organization
    if (existingUser.length > 0) {
      const existingMembership = await db
        .select({ id: member.id })
        .from(member)
        .where(
          and(
            eq(member.userId, existingUser[0].id),
            eq(member.organizationId, data.invitation.organizationId),
          ),
        )
        .limit(1);

      // If user is already a member, don't show this as a pending invitation
      if (existingMembership.length > 0) {
        return { data: null };
      }
    }

    return {
      data: {
        id: data.invitation.id,
        email: data.invitation.email,
        role: data.invitation.role || "member",
        organizationName: data.organization.name,
        inviterName: data.inviter.name,
        expiresAt: data.invitation.expiresAt.toISOString(),
        status: data.invitation.status,
      },
    };
  } catch (error) {
    console.error("Error getting pending invitation:", error);
    return { error: "Failed to check for pending invitations" };
  }
}

/**
 * Get all invitations for current user's organization
 */
export async function getOrganizationInvitations(): Promise<
  ActionResponse<InvitationDetails[]>
> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    // Get user's active organization
    const organizations = await auth.api.listOrganizations({
      headers: await headers(),
    });

    if (!organizations || organizations.length === 0) {
      return { data: [] };
    }

    const activeOrg = organizations[0];

    // Get all invitations for this organization
    const invitations = await db
      .select({
        invitation,
        inviter: user,
      })
      .from(invitation)
      .leftJoin(user, eq(invitation.inviterId, user.id))
      .where(eq(invitation.organizationId, activeOrg.id));

    const result: InvitationDetails[] = invitations.map((inv) => ({
      id: inv.invitation.id,
      email: inv.invitation.email,
      role: inv.invitation.role || "member",
      organizationName: activeOrg.name,
      inviterName: inv.inviter?.name || "Unknown",
      expiresAt: inv.invitation.expiresAt.toISOString(),
      status: inv.invitation.status,
    }));

    return { data: result };
  } catch (error) {
    console.error("Error getting organization invitations:", error);
    return { error: "Failed to get invitations" };
  }
}

/**
 * Cancel/revoke an invitation
 */
export async function cancelInvitation(
  invitationId: string,
): Promise<ActionResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    // Update invitation status to cancelled
    await db
      .update(invitation)
      .set({ status: "cancelled" })
      .where(eq(invitation.id, invitationId));

    return { success: "Invitation cancelled successfully" };
  } catch (error) {
    console.error("Error cancelling invitation:", error);
    return { error: "Failed to cancel invitation" };
  }
}

/**
 * Resend an invitation email
 * Note: This would need to be implemented based on available Better Auth APIs
 */
export async function resendInvitation(
  _invitationId: string,
): Promise<ActionResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    // TODO: Implement when Better Auth supports resending invitations
    // For now, return an error indicating it's not implemented
    return { error: "Resend invitation is not yet implemented" };
  } catch (error) {
    console.error("Error resending invitation:", error);
    return { error: "Failed to resend invitation" };
  }
}
