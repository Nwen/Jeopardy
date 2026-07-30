'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { GridListItem } from '@/types';
import { adminFetch } from '@/lib/adminFetch';
import { setAdminPassword, clearAdminSession, isAdminLoggedIn } from '@/lib/adminSession';
import { requestPassword, requestConfirm, requestAlert, requestPasswordSetup } from '@/lib/dialogStore';

export default function Home() {
  const [grids, setGrids] = useState<GridListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminRequired, setAdminRequired] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch('/api/grids')
      .then(r => r.json())
      .then(data => { setGrids(data); setLoading(false); });
    setIsAdmin(isAdminLoggedIn());

    fetch('/api/admin/status')
      .then(r => r.json())
      .then(async data => {
        setAdminRequired(data.required);
        if (!data.needsSetup) return;

        const password = await requestPasswordSetup(
          "Aucun mot de passe administrateur n'est configuré. Créez-en un pour protéger la création, la modification et la suppression des grilles :"
        );
        if (!password) return;

        const res = await fetch('/api/admin/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });
        if (!res.ok) { await requestAlert('Erreur lors de la création du mot de passe.'); return; }

        setAdminPassword(password);
        setIsAdmin(true);
        setAdminRequired(true);
      });
  }, []);

  const canEdit = !adminRequired || isAdmin;

  const loginAsAdmin = async () => {
    const password = await requestPassword('Mot de passe administrateur :');
    if (password === null) return;
    const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'x-admin-password': password } });
    if (!res.ok) { await requestAlert('Mot de passe incorrect.'); return; }
    setAdminPassword(password);
    setIsAdmin(true);
  };

  const logoutAdmin = () => {
    clearAdminSession();
    setIsAdmin(false);
  };

  const deleteGrid = async (id: string, name: string) => {
    if (!(await requestConfirm(`Supprimer "${name}" ?`))) return;
    const res = await adminFetch(`/api/grids/${id}`, { method: 'DELETE' });
    if (!res) return;
    if (res.status === 401) { await requestAlert('Mot de passe incorrect.'); return; }
    setGrids(g => g.filter(x => x.id !== id));
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-black text-jeopardy-gold text-center mb-2 uppercase tracking-widest drop-shadow-lg">
          Jeopardy!
        </h1>
        <p className="text-purple-300 text-center mb-12 text-lg">Créez et jouez vos propres quizz</p>

        <div className="flex justify-end items-center gap-3 mb-6">
          {adminRequired && (
            isAdmin ? (
              <button
                onClick={logoutAdmin}
                className="bg-purple-900 hover:bg-purple-800 text-purple-300 font-bold px-5 py-3 rounded-xl uppercase tracking-wide transition text-sm"
              >
                🔓 Déconnexion admin
              </button>
            ) : (
              <button
                onClick={loginAsAdmin}
                className="bg-purple-900 hover:bg-purple-800 text-purple-300 font-bold px-5 py-3 rounded-xl uppercase tracking-wide transition text-sm"
              >
                🔒 Connexion admin
              </button>
            )
          )}
          <Link
            href="/editor/new"
            className="bg-jeopardy-gold text-jeopardy-blue font-black px-6 py-3 rounded-xl uppercase tracking-wide hover:brightness-110 transition text-lg"
          >
            + Nouvelle grille
          </Link>
        </div>

        {loading && <p className="text-white text-center text-xl mt-20">Chargement...</p>}
        {!loading && grids.length === 0 && (
          <div className="text-center text-purple-300 mt-24">
            <p className="text-3xl font-bold mb-4">Aucune grille</p>
            <p className="text-lg">Créez votre première grille pour commencer !</p>
          </div>
        )}
        {!loading && grids.length > 0 && (
          <div className="flex flex-col gap-4">
            {grids.map(grid => (
              <div key={grid.id} className="bg-purple-950 border border-purple-800 rounded-xl p-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-white font-black text-xl uppercase">{grid.name}</h2>
                  <p className="text-purple-400 text-sm mt-1">
                    Modifié le {new Date(grid.updatedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <Link href={`/quiz/${grid.id}`} className="bg-green-700 hover:bg-green-600 text-white font-bold px-5 py-2 rounded-lg transition">
                    ▶ Jouer
                  </Link>
                  {canEdit && (
                    <Link href={`/editor/${grid.id}`} className="bg-purple-800 hover:bg-purple-700 text-white font-bold px-5 py-2 rounded-lg transition">
                      ✎ Éditer
                    </Link>
                  )}
                  {canEdit && (
                    <button onClick={() => deleteGrid(grid.id, grid.name)} className="bg-red-900 hover:bg-red-800 text-white font-bold px-4 py-2 rounded-lg transition">
                      🗑
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
