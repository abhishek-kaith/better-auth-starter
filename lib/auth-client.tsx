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
