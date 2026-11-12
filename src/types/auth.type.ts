export type UserRole = "CUSTOMER" | "ADMIN";

// field user yang dikirim BE (publicUserSelect di auths.service.ts)
export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  avatarUrl: string | null;
  emailVerifiedAt: string | null;
  createdAt: string;
};
