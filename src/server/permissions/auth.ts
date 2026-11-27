import type { UserRole } from '@prisma/client';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/database/prisma';
import { apiError } from '@/server/http/response';
import { sanitizeMetadata } from '@/lib/security/redact';
import { isDatabaseConfigured } from '@/config/env';

export interface AuthenticatedActor {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

export async function getSessionActor(): Promise<AuthenticatedActor | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? null,
    role: session.user.role ?? 'USER',
  };
}

export async function requireAuth(): Promise<
  { actor: AuthenticatedActor } | { error: ReturnType<typeof apiError> }
> {
  const actor = await getSessionActor();
  if (!actor) {
    return { error: apiError('UNAUTHORIZED', 'Authentication is required.', 401) };
  }
  return { actor };
}

export async function requireAdmin(): Promise<
  { actor: AuthenticatedActor } | { error: ReturnType<typeof apiError> }
> {
  const res = await requireAuth();
  if ('error' in res) return res;
  if (res.actor.role !== 'ADMIN' && res.actor.role !== 'SUPER_ADMIN') {
    return { error: apiError('FORBIDDEN', 'Administrator privileges are required.', 403) };
  }
  return res;
}

export async function requireSuperAdmin(): Promise<
  { actor: AuthenticatedActor } | { error: ReturnType<typeof apiError> }
> {
  const res = await requireAuth();
  if ('error' in res) return res;
  if (res.actor.role !== 'SUPER_ADMIN') {
    return { error: apiError('FORBIDDEN', 'Super administrator privileges are required.', 403) };
  }
  return res;
}

export { canManageAdminRoles, canAccessAdminPanel } from './rbac';

export async function isLastActiveSuperAdmin(userId: string): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, status: true },
  });
  if (!target || target.role !== 'SUPER_ADMIN' || target.status !== 'ACTIVE') {
    return false;
  }
  const activeSuperAdminCount = await prisma.user.count({
    where: { role: 'SUPER_ADMIN', status: 'ACTIVE' },
  });
  return activeSuperAdminCount <= 1;
}

export async function recordAuditLog(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  if (!isDatabaseConfigured()) return;
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        entityType,
        entityId,
        sanitizedMetadata: sanitizeMetadata(metadata) as object,
      },
    });
  } catch (err) {
    console.error('[AuditLog] Failed to record audit entry:', err instanceof Error ? err.message : err);
  }
}
