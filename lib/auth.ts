import { render } from "@react-email/components";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import {
  admin,
  bearer,
  customSession,
  deviceAuthorization,
  lastLoginMethod,
  multiSession,
  oAuthProxy,
  oneTap,
  openAPI,
  organization,
  twoFactor,
} from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import db from "@/db/client";
import schema from "@/db/schema";
import { env } from "@/env";
import { siteConfig } from "./config";
import { reactInvitationEmail } from "./email/invitation";
import { sendEmail } from "./email/mail";
import { ResetPasswordEmail } from "./email/reset-password";
import { PATHS } from "./path";

export const auth = betterAuth({
  appName: siteConfig.name,
  baseURL: siteConfig.url,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
      },
    },
  },
  emailVerification: {
    sendOnSignIn: true,
    sendOnSignUp: true,
    async sendVerificationEmail({ user, url }) {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        html: `<a href="${url}">Verify your email address</a>`,
      });
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "auth-app"],
    },
  },
  emailAndPassword: {
    requireEmailVerification: true,
    disableSignUp: true,
    enabled: true,
    async sendResetPassword({ user, url }) {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        html: await render(
          ResetPasswordEmail({
            username: user.email,
            resetLink: url,
          }),
        ),
      });
    },
  },
  socialProviders: {
    google: {
      clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      disableSignUp: true,
    },
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: async (user) => {
        const u = await db.query.user.findFirst({
          where: (fields, operators) => operators.eq(fields.id, user.id),
        });
        if (u && u.role === "admin" && !u.banned && u.emailVerified) {
          return true;
        }
        return false;
      },
      async sendInvitationEmail(data) {
        await sendEmail({
          to: data.email,
          subject: `You've been invited to join ${siteConfig.name}`,
          html: await render(
            reactInvitationEmail({
              username: data.email,
              invitedByUsername: data.inviter.user.name,
              invitedByEmail: data.inviter.user.email,
              teamName: data.organization.name,
              inviteLink: `${siteConfig.url}/${PATHS.acceptInvitation(data.id)}`,
            }),
          ),
        });
      },
    }),
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }) {
          await sendEmail({
            to: user.email,
            subject: "Your OTP",
            html: `Your OTP is ${otp}`,
          });
        },
      },
    }),
    passkey(),
    openAPI(),
    bearer(),
    admin(),
    multiSession(),
    oAuthProxy(),
    nextCookies(),
    oneTap(),
    customSession(async (session) => {
      return {
        ...session,
        user: {
          ...session.user,
          // test: "test",
        },
      };
    }),
    deviceAuthorization({
      expiresIn: "3min",
      interval: "5s",
    }),
    lastLoginMethod(),
  ],
  trustedOrigins: ["exp://"],
});
