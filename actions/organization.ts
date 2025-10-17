"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import type {
  ActionResponse,
  InvitationResult,
  InviteMemberInput,
  MembersList,
  OrganizationUpdateResult,
  RemoveMemberInput,
  UpdateOrganizationInput,
} from "@/types/actions";

const UpdateOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  slug: z.string().min(1, "Organization slug is required").optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  description: z.string().optional(),
});

const InviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["member", "admin"]).default("member"),
});

const RemoveMemberSchema = z.object({
  memberIdOrEmail: z.string().min(1, "Member ID or email is required"),
});

export async function updateOrganization(
  input: UpdateOrganizationInput & { organizationId: string },
): Promise<ActionResponse<OrganizationUpdateResult>> {
  try {
    const validatedInput = UpdateOrganizationSchema.parse(input);

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const result = await auth.api.updateOrganization({
      body: {
        data: validatedInput,
        organizationId: input.organizationId,
      },
      headers: await headers(),
    });

    if (!result) {
      return { error: "Failed to update organization" };
    }

    return { success: "Organization updated successfully", data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message || "Invalid input" };
    }
    return { error: "Failed to update organization" };
  }
}

export async function inviteMember(
  input: InviteMemberInput,
): Promise<ActionResponse<InvitationResult>> {
  try {
    const validatedInput = InviteMemberSchema.parse(input);

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const result = await auth.api.createInvitation({
      body: validatedInput,
      headers: await headers(),
    });

    if (!result) {
      return { error: "Failed to create invitation" };
    }

    return { success: "Invitation sent successfully", data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message || "Invalid input" };
    }
    return { error: "Failed to send invitation" };
  }
}

export async function removeMember(
  input: RemoveMemberInput,
): Promise<ActionResponse> {
  try {
    const validatedInput = RemoveMemberSchema.parse(input);

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const _result = await auth.api.removeMember({
      body: {
        memberIdOrEmail: validatedInput.memberIdOrEmail,
      },
      headers: await headers(),
    });

    return { success: "Member removed successfully" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message || "Invalid input" };
    }
    return { error: "Failed to remove member" };
  }
}

export async function getOrganizationMembers(): Promise<
  ActionResponse<MembersList>
> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const result = await auth.api.listMembers({
      headers: await headers(),
    });

    return { data: result.members };
  } catch (_error) {
    return { error: "Failed to fetch organization members" };
  }
}
