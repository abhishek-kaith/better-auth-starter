import type { ReadonlyURLSearchParams } from "next/navigation";
import { PATHS } from "./path";

const allowedCallbackSet: ReadonlySet<string> = new Set([
  PATHS.dashboard,
  "/device",
]);

export const getCallbackURL = (
  queryParams: ReadonlyURLSearchParams,
): string => {
  const callbackUrl = queryParams.get("callbackUrl");
  if (callbackUrl) {
    if (allowedCallbackSet.has(callbackUrl)) {
      return callbackUrl;
    }
    return PATHS.dashboard;
  }
  return PATHS.dashboard;
};
