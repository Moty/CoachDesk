export enum UserRole {
  CUSTOMER = 'customer',
  AGENT = 'agent',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  role: UserRole;
  organizationId: string;
  email: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Validate if a role value is valid
 */
export function isValidRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}
