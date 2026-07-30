'use client';
import { useState, useSyncExternalStore } from 'react';
import { subscribeDialog, getDialogSnapshot } from '@/lib/dialogStore';

export default function DialogHost() {
  const request = useSyncExternalStore(subscribeDialog, getDialogSnapshot, () => null);
  const [value, setValue] = useState('');

  if (!request) return null;

  if (request.type === 'password') {
    const submit = () => { request.resolve(value); setValue(''); };
    const cancel = () => { request.resolve(null); setValue(''); };
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-[100]">
        <div className="bg-purple-950 border-4 border-jeopardy-gold rounded-2xl max-w-sm w-full p-6">
          <p className="text-white font-bold mb-4">{request.message}</p>
          <input
            type="password"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') submit();
              else if (e.key === 'Escape') cancel();
            }}
            autoFocus
            className="w-full bg-purple-900 text-white px-4 py-3 rounded-xl outline-none mb-4"
          />
          <div className="flex gap-3 justify-end">
            <button onClick={cancel} className="bg-purple-800 hover:bg-purple-700 text-white font-bold px-5 py-2 rounded-lg transition">
              Annuler
            </button>
            <button onClick={submit} className="bg-jeopardy-gold text-jeopardy-blue font-black px-5 py-2 rounded-lg hover:brightness-110 transition">
              Valider
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (request.type === 'confirm') {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-[100]">
        <div className="bg-purple-950 border-4 border-jeopardy-gold rounded-2xl max-w-sm w-full p-6">
          <p className="text-white font-bold mb-6">{request.message}</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => request.resolve(false)} className="bg-purple-800 hover:bg-purple-700 text-white font-bold px-5 py-2 rounded-lg transition">
              Annuler
            </button>
            <button onClick={() => request.resolve(true)} className="bg-red-700 hover:bg-red-600 text-white font-black px-5 py-2 rounded-lg transition">
              Confirmer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-[100]">
      <div className="bg-purple-950 border-4 border-jeopardy-gold rounded-2xl max-w-sm w-full p-6">
        <p className="text-white font-bold mb-6">{request.message}</p>
        <div className="flex justify-end">
          <button onClick={() => request.resolve()} className="bg-jeopardy-gold text-jeopardy-blue font-black px-6 py-2 rounded-lg hover:brightness-110 transition">
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
