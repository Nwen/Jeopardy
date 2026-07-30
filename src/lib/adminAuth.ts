import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/passwordHash';

const ADMIN_CONFIG_ID = 1;

export async function getDbAdminPasswordHash(): Promise<string | null> {
  const config = await prisma.adminConfig.findUnique({ where: { id: ADMIN_CONFIG_ID } });
  return config?.passwordHash ?? null;
}

export async function setDbAdminPassword(passwordHash: string): Promise<void> {
  await prisma.adminConfig.upsert({
    where: { id: ADMIN_CONFIG_ID },
    create: { id: ADMIN_CONFIG_ID, passwordHash },
    update: { passwordHash },
  });
}

export async function isAdminConfigured(): Promise<boolean> {
  if (process.env.ADMIN_PASSWORD) return true;
  return (await getDbAdminPasswordHash()) !== null;
}

export async function isAdminAuthorized(request: Request): Promise<boolean> {
  const envPassword = process.env.ADMIN_PASSWORD;
  const provided = request.headers.get('x-admin-password');

  if (envPassword) {
    const authorized = provided === envPassword;
    console.log(`[admin-auth] ADMIN_PASSWORD env var is set — request ${authorized ? 'authorized' : 'rejected'}`);
    return authorized;
  }

  const storedHash = await getDbAdminPasswordHash();
  if (storedHash) {
    const authorized = provided !== null && (await verifyPassword(provided, storedHash));
    console.log(`[admin-auth] admin password configured in database — request ${authorized ? 'authorized' : 'rejected'}`);
    return authorized;
  }

  console.log('[admin-auth] no admin password configured (env or database) — allowing request without authentication');
  return true;
}
