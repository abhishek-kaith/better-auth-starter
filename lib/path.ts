export const PATHS = {
  home: "/",
  dashboard: "/dashboard",
  profile: "/dashboard/profile",
  profileSecurity: "/dashboard/profile/security",
  settings: "/dashboard/settings",
  settingsMembers: "/dashboard/settings/members",
  settingsOrganization: "/dashboard/settings/organization",
  organizationSetup: "/organization-setup",
  // Auth
  signIn: "/sign-in",
  signUp: "/sign-up",
  forgetPassword: "/forget-password",
  resetPassword: "/reset-password",
  twoFactor: "/two-factor",
  acceptInvitation: (id: string) => `/accept-invitation/${id}` as const,
} as const;
