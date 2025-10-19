import {
  adminClient,
  deviceAuthorizationClient,
  genericOAuthClient,
  lastLoginMethodClient,
  multiSessionClient,
  oidcClient,
  oneTapClient,
  organizationClient,
  passkeyClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { toast } from "sonner";
import { env } from "@/env";
import { PATHS } from "./path";

export const client = createAuthClient({
  plugins: [
    organizationClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = PATHS.twoFactor;
      },
    }),
    passkeyClient(),
    adminClient(),
    multiSessionClient(),
    oneTapClient({
      clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      promptOptions: {
        maxAttempts: 1,
      },
    }),
    oidcClient(),
    genericOAuthClient(),
    deviceAuthorizationClient(),
    lastLoginMethodClient(),
  ],
  fetchOptions: {
    onError(e) {
      if (e.error.status === 429) {
        toast.error("Too many requests. Please try again later.");
      } else if (e.error.status === 401) {
        toast.error("Authentication failed. Please check your credentials.");
      } else if (e.error.status === 403) {
        toast.error(
          "Access denied. You don't have permission to perform this action.",
        );
      } else if (e.error.status === 400) {
        toast.error(
          e.error.message || "Invalid request. Please check your input.",
        );
      } else if (e.error.status >= 500) {
        toast.error("Server error. Please try again later.");
      } else if (!e.error.status) {
        toast.error("Network error. Please check your connection.");
      }
    },
  },
});

export const {
  signUp,
  signIn,
  signOut,
  useSession,
  organization,
  useListOrganizations,
  useActiveOrganization,
} = client;
