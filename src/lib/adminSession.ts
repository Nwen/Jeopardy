const STORAGE_KEY = 'jeopardy_admin_password';

export function getAdminPassword(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(STORAGE_KEY);
}

export function setAdminPassword(password: string): void {
  sessionStorage.setItem(STORAGE_KEY, password);
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function isAdminLoggedIn(): boolean {
  return getAdminPassword() !== null;
}
