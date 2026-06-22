export const USER_ROLES = {
  superAdmin: 'SuperAdmin',
  user: 'User',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export interface User {
  id: number;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  email: string;
  password?: string;
  role: UserRole;
}