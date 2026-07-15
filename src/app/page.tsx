'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { GridListItem } from '@/types';

export default function Home() {
  const [grids, setGrids] = useState<GridListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/grids')
      .then(r => r.json())
      .then(data => { setGrids(data); setLoading(false); });
  }, []);

  const deleteGrid = async (id: string, name: string) => {
    if (!confirm(`Supprimer "${name}" ?`)) return;
    await fetch(`/api/grids/${id}`, { method: 'DELETE' });
    setGrids(g => g.filter(x => x.id !== id));
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-black text-jeopardy-gold text-center mb-2 uppercase tracking-widest drop-shadow-lg">
          Jeopardy!
        </h1>
        <p className="text-purple-300 text-center mb-12 text-lg">Créez et jouez vos propres quizz</p>

        <div className="flex justify-end mb-6">
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
                  <h2 className="text-white font-black text-xl">{grid.name}</h2>
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
                  <Link href={`/editor/${grid.id}`} className="bg-purple-800 hover:bg-purple-700 text-white font-bold px-5 py-2 rounded-lg transition">
                    ✎ Éditer
                  </Link>
                  <button onClick={() => deleteGrid(grid.id, grid.name)} className="bg-red-900 hover:bg-red-800 text-white font-bold px-4 py-2 rounded-lg transition">
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
