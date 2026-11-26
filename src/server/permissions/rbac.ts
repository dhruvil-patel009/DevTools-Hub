import type { UserRole } from '@prisma/client';

export function canManageAdminRoles(actorRole: UserRole): boolean {
  return actorRole === 'SUPER_ADMIN';
}

export function canAccessAdminPanel(actorRole: UserRole): boolean {
  return actorRole === 'ADMIN' || actorRole === 'SUPER_ADMIN';
}
