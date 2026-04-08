import { User } from '@prisma/client';

/**
 * Strips passwordHash and returns a user object matching the frontend contract.
 */
export function serializeUser(user: User) {
  const { passwordHash, updatedAt, ...safe } = user;
  return {
    ...safe,
    createdAt: user.createdAt.toISOString(),
  };
}
