export type DialogRequest =
  | { type: 'password'; message: string; resolve: (value: string | null) => void }
  | { type: 'confirm'; message: string; resolve: (value: boolean) => void }
  | { type: 'alert'; message: string; resolve: () => void };

let current: DialogRequest | null = null;
const listeners = new Set<() => void>();

function setCurrent(next: DialogRequest | null) {
  current = next;
  listeners.forEach(l => l());
}

export function subscribeDialog(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDialogSnapshot() {
  return current;
}

export function requestPassword(message: string): Promise<string | null> {
  return new Promise(resolve => {
    setCurrent({ type: 'password', message, resolve: value => { setCurrent(null); resolve(value); } });
  });
}

export function requestConfirm(message: string): Promise<boolean> {
  return new Promise(resolve => {
    setCurrent({ type: 'confirm', message, resolve: value => { setCurrent(null); resolve(value); } });
  });
}

export function requestAlert(message: string): Promise<void> {
  return new Promise(resolve => {
    setCurrent({ type: 'alert', message, resolve: () => { setCurrent(null); resolve(); } });
  });
}
