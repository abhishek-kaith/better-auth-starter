import type { ReadonlyURLSearchParams } from "next/navigation";
import { PATHS } from "./path";

const allowedCallbackSet: ReadonlySet<string> = new Set([
  PATHS.dashboard,
  "/device",
]);

// Pattern for accept invitation URLs
const isAcceptInvitationURL = (url: string): boolean => {
  return url.match(/^\/accept-invitation\/[a-zA-Z0-9\-_]+$/) !== null;
};

export const getCallbackURL = (
  queryParams: ReadonlyURLSearchParams,
): string => {
  const callbackUrl = queryParams.get("callbackUrl");
  if (callbackUrl) {
    if (
      allowedCallbackSet.has(callbackUrl) ||
      isAcceptInvitationURL(callbackUrl)
    ) {
      return callbackUrl;
    }
    return PATHS.dashboard;
  }
  return PATHS.dashboard;
};
