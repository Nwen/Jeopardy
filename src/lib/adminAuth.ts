export function isAdminAuthorized(request: Request): boolean {
  const required = process.env.ADMIN_PASSWORD;
  if (!required) {
    console.log('[admin-auth] ADMIN_PASSWORD is not set — allowing request without authentication');
    return true;
  }
  const authorized = request.headers.get('x-admin-password') === required;
  console.log(`[admin-auth] ADMIN_PASSWORD is set — request ${authorized ? 'authorized' : 'rejected'}`);
  return authorized;
}
