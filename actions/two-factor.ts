"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { auth } from "@/lib/auth";
import { PATHS } from "@/lib/path";

const EnableTwoFactorSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

const DisableTwoFactorSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

type EnableTwoFactorInput = z.infer<typeof EnableTwoFactorSchema>;
type DisableTwoFactorInput = z.infer<typeof DisableTwoFactorSchema>;

type ActionOutput = {
  data?: {
    totpURI?: string;
    backupCodes?: string[];
  };
  error?: string;
  success?: string;
};

export async function enableTwoFactor(
  input: EnableTwoFactorInput,
): Promise<ActionOutput> {
  try {
    const validation = EnableTwoFactorSchema.safeParse(input);
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

    const { password } = validation.data;

    const result = await auth.api.enableTwoFactor({
      headers: await import("next/headers").then((mod) => mod.headers()),
      body: {
        password,
      },
    });

    if (!result.totpURI) {
      return {
        error: "Failed to enable two-factor authentication",
      };
    }

    revalidatePath(PATHS.profile);

    return {
      success: "Two-factor authentication enabled successfully",
      data: {
        totpURI: result.totpURI,
        backupCodes: result.backupCodes,
      },
    };
  } catch (error) {
    console.error("Error enabling two-factor:", error);
    return {
      error: "Failed to enable two-factor authentication",
    };
  }
}

export async function disableTwoFactor(
  input: DisableTwoFactorInput,
): Promise<ActionOutput> {
  try {
    const validation = DisableTwoFactorSchema.safeParse(input);
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

    const { password } = validation.data;

    const result = await auth.api.disableTwoFactor({
      headers: await import("next/headers").then((mod) => mod.headers()),
      body: {
        password,
      },
    });

    if (!result.status) {
      return {
        error: "Failed to disable two-factor authentication",
      };
    }

    revalidatePath(PATHS.profile);

    return {
      success: "Two-factor authentication disabled successfully",
    };
  } catch (error) {
    console.error("Error disabling two-factor:", error);
    return {
      error: "Failed to disable two-factor authentication",
    };
  }
}

export async function sendOTP(): Promise<ActionOutput> {
  try {
    const session = await auth.api.getSession({
      headers: await import("next/headers").then((mod) => mod.headers()),
    });

    if (!session?.user) {
      return {
        error: "Unauthorized",
      };
    }

    const result = await auth.api.sendTwoFactorOTP({
      headers: await import("next/headers").then((mod) => mod.headers()),
    });

    if (!result.status) {
      return {
        error: "Failed to send OTP email",
      };
    }

    return {
      success: "OTP sent to your email successfully",
    };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return {
      error: "Failed to send OTP email",
    };
  }
}

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
