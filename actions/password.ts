"use server";

import { auth } from "@/lib/auth";
import { PATHS } from "@/lib/path";

type ActionOutput = {
  error?: string;
  success?: string;
};

export async function forgetPassword(email: string): Promise<ActionOutput> {
  try {
    if (!email) {
      return {
        error: "Email is required",
      };
    }

    const result = await auth.api.forgetPassword({
      body: {
        email,
        redirectTo: `${process.env.BETTER_AUTH_URL}${PATHS.resetPassword}`,
      },
    });

    if (!result.status) {
      return {
        error: "Failed to send password reset email",
      };
    }

    return {
      success: "Password reset email sent successfully",
    };
  } catch (error) {
    console.error("Error sending password reset:", error);
    return {
      error: "Failed to send password reset email",
    };
  }
}
