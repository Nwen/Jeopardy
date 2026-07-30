import { getAdminPassword, setAdminPassword, clearAdminSession } from '@/lib/adminSession';
import { requestPassword } from '@/lib/dialogStore';

export async function adminFetch(input: string, init: RequestInit = {}): Promise<Response | null> {
  let password = getAdminPassword();
  if (password === null) {
    password = await requestPassword('Mot de passe administrateur :');
    if (password === null) return null;
  }

  const headers = new Headers(init.headers);
  headers.set('x-admin-password', password);
  const res = await fetch(input, { ...init, headers });

  if (res.status === 401) {
    clearAdminSession();
  } else {
    setAdminPassword(password);
  }
  return res;
}
