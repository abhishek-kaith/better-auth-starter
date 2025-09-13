export const PATHS = {
  home: "/",
  dashboard: "/dashboard",
  // Auth
  signIn: "/sign-in",
  signUp: "/sign-up",
  forgetPassword: "/forget-password",
  resetPassword: "/reset-password",
  twoFactor: "/two-factor",
  acceptInvitation: (id: string) => `/accept-invitation/${id}` as const,
} as const;
