"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import db from "@/db/client";
import { user } from "@/db/schema/auth";
import { auth } from "@/lib/auth";
import { PATHS } from "@/lib/path";
import type {
  ActionResponse,
  ProfileUpdateResult,
  UpdatePasswordInput,
  UpdateProfileInput,
} from "@/types/actions";

const UpdateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
});

const UpdatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<ActionResponse> {
  try {
    const validation = UpdateProfileSchema.safeParse(input);
    if (!validation.success) {
      return {
        error: validation.error.issues[0]?.message || "Invalid input",
      };
    }

    const session = await auth.api.getSession({
      headers: await import("next/headers").then((mod) => mod.headers()),
    });

    if (!session?.user) {
      return {
        error: "Unauthorized",
      };
    }

    const { name } = validation.data;

    // Update user profile directly in database
    await db
      .update(user)
      .set({
        name,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id));

    revalidatePath(PATHS.profile);

    return {
      success: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      error: "Failed to update profile",
    };
  }
}

export async function updatePassword(
  input: UpdatePasswordInput,
): Promise<ActionResponse> {
  try {
    const validation = UpdatePasswordSchema.safeParse(input);
    if (!validation.success) {
      return {
        error: validation.error.issues[0]?.message || "Invalid input",
      };
    }

    const session = await auth.api.getSession({
      headers: await import("next/headers").then((mod) => mod.headers()),
    });

    if (!session?.user) {
      return {
        error: "Unauthorized",
      };
    }

    const { currentPassword, newPassword } = validation.data;

    const result = await auth.api.changePassword({
      headers: await import("next/headers").then((mod) => mod.headers()),
      body: {
        newPassword,
        currentPassword,
      },
    });

    if (!result.user) {
      return {
        error: "Failed to update password. Please check your current password.",
      };
    }

    revalidatePath(PATHS.profile);

    return {
      success: "Password updated successfully",
    };
  } catch (error) {
    console.error("Error updating password:", error);
    return {
      error: "Failed to update password",
    };
  }
}

export async function deleteAccount(): Promise<ActionResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await import("next/headers").then((mod) => mod.headers()),
    });

    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    // Delete user account using direct database query
    await db.delete(user).where(eq(user.id, session.user.id));

    // Sign out the user and redirect
    await auth.api.signOut({
      headers: await import("next/headers").then((mod) => mod.headers()),
    });

    redirect(PATHS.signIn);
  } catch (error) {
    console.error("Error deleting account:", error);
    return {
      error: "Failed to delete account",
    };
  }
}
