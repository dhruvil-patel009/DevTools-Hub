import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) {
    console.error('ADMIN_EMAIL environment variable is required to bootstrap a super admin.');
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    console.error(
      `No registered user found with email ${adminEmail}. Register the user first, then run bootstrap-admin.`
    );
    process.exit(1);
  }

  await prisma.user.update({
    where: { id: existing.id },
    data: { role: UserRole.SUPER_ADMIN },
  });

  await prisma.auditLog.create({
    data: {
      actorId: existing.id,
      action: 'BOOTSTRAP_SUPER_ADMIN',
      entityType: 'User',
      entityId: existing.id,
      sanitizedMetadata: { via: 'cli-bootstrap-script' },
    },
  });

  console.log(`Promoted ${adminEmail} to SUPER_ADMIN.`);
}

main()
  .catch((error) => {
    console.error('Admin bootstrap failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
