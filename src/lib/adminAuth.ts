export function isAdminAuthorized(request: Request): boolean {
  const required = process.env.ADMIN_PASSWORD;
  if (!required) return true;
  return request.headers.get('x-admin-password') === required;
}
