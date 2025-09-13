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
import { siteConfig } from "./config";
import { reactInvitationEmail } from "./email/invitation";
import { sendEmail } from "./email/mail";
import { reactResetPasswordEmail } from "./email/reset-password";
import { PATHS } from "./path";

export const auth = betterAuth({
  appName: siteConfig.name,
  baseURL: siteConfig.url,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailVerification: {
    async sendVerificationEmail({ user, url }) {
      const res = await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        html: `<a href="${url}">Verify your email address</a>`,
      });
      console.log(res, user.email);
    },
  },
  account: {
    accountLinking: {
      trustedProviders: ["google", "auth-app"],
    },
  },
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url }) {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        html: await render(
          reactResetPasswordEmail({
            username: user.email,
            resetLink: url,
          }),
        ),
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  plugins: [
    organization({
      async sendInvitationEmail(data) {
        await sendEmail({
          to: data.email,
          subject: "You've been invited to join an organization",
          html: await render(
            reactInvitationEmail({
              username: data.email,
              invitedByUsername: data.inviter.user.name,
              invitedByEmail: data.inviter.user.email,
              teamName: data.organization.name,
              inviteLink: PATHS.acceptInvitation(data.id)
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
    admin({
      adminUserIds: ["EXD5zjob2SD6CBWcEQ6OpLRHcyoUbnaB"],
    }),
    multiSession(),
    oAuthProxy(),
    nextCookies(),

    oneTap(),
    customSession(async (session) => {
      return {
        ...session,
        user: {
          ...session.user,
          dd: "test",
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
