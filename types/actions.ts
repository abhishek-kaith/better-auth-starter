// Shared action response types for consistent data handling across frontend and backend

export type ActionResponse<T = void> = {
  data?: T;
  error?: string;
  success?: string;
};

// Organization related types
export type Organization = {
  id: string;
  name: string;
  slug?: string;
  website?: string;
  description?: string;
  logo?: string | null;
  createdAt: Date;
  updatedAt?: Date;
  metadata?: Record<string, unknown>;
};

export type OrganizationMember = {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
};

export type Invitation = {
  id: string;
  organizationId: string;
  email: string;
  role: "admin" | "member" | "owner";
  status: string;
  inviterId: string;
  expiresAt: Date;
};

// Profile related types
export type UserProfile = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
};

// Action result types - matching actual API responses
export type OrganizationUpdateResult = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  logo?: string | null;
  metadata?: Record<string, unknown>;
} & {
  metadata: Record<string, unknown> | undefined;
};

export type InvitationResult = {
  id: string;
  organizationId: string;
  email: string;
  role: "admin" | "member" | "owner";
  status: string;
  inviterId: string;
  expiresAt: Date;
};

export type MembersList = OrganizationMember[];

export type ProfileUpdateResult = {
  user: UserProfile;
};

// Form input types
export type UpdateOrganizationInput = {
  name: string;
  slug?: string;
  website?: string;
  description?: string;
};

export type InviteMemberInput = {
  email: string;
  role: "admin" | "member";
};

export type RemoveMemberInput = {
  memberIdOrEmail: string;
};

export type UpdateProfileInput = {
  name: string;
};

export type UpdatePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
