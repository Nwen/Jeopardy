'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Grid, Category } from '@/types';

interface Player {
  name: string;
  score: number;
}

interface CellState {
  played: boolean;
  correct: boolean | null;
}

function initBoard(categories: Category[]): CellState[][] {
  return categories.map(cat => cat.questions.map(() => ({ played: false, correct: null })));
}

export default function QuizPage({ params }: Readonly<{ params: Readonly<{ id: string }> }>) {
  const [grid, setGrid] = useState<Grid | null>(null);
  const [board, setBoard] = useState<CellState[][]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [activeCell, setActiveCell] = useState<{ catIdx: number; qIdx: number } | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [phase, setPhase] = useState<'setup' | 'game' | 'end'>('setup');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingScoreIdx, setEditingScoreIdx] = useState<number | null>(null);
  const [editScoreValue, setEditScoreValue] = useState('');

  useEffect(() => {
    fetch(`/api/grids/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setGrid(data);
        setBoard(initBoard(data.categories));
        setLoading(false);
      });
  }, [params.id]);

  const addPlayer = () => {
    const name = newPlayerName.trim();
    if (!name) return;
    setPlayers(p => [...p, { name, score: 0 }]);
    setNewPlayerName('');
  };

  const openCell = (catIdx: number, qIdx: number) => {
    if (board[catIdx]?.[qIdx]?.played) return;
    setActiveCell({ catIdx, qIdx });
    setShowAnswer(false);
  };

  const applyPenalty = (playerIdx: number) => {
    if (!activeCell || !grid) return;
    const value = grid.categories[activeCell.catIdx].questions[activeCell.qIdx].value;
    setPlayers(p => p.map((player, i) =>
      i === playerIdx ? { ...player, score: player.score - value } : player
    ));
  };

  const resolveCell = (correct: boolean | null, playerIdx: number | null) => {
    if (!activeCell || !grid) return;
    const value = grid.categories[activeCell.catIdx].questions[activeCell.qIdx].value;
    const { catIdx, qIdx } = activeCell;

    if (correct && playerIdx !== null) {
      setPlayers(p => p.map((player, i) =>
        i === playerIdx ? { ...player, score: player.score + value } : player
      ));
    }

    setBoard(b => b.map((row, ci) =>
      row.map((cell, qi) => ci === catIdx && qi === qIdx ? { played: true, correct } : cell)
    ));
    setActiveCell(null);
    setCurrentPlayerIdx(i => (i + 1) % players.length);

    const allDone = board.every((row, ci) =>
      row.every((cell, qi) => (ci === catIdx && qi === qIdx) || cell.played)
    );
    if (allDone) setPhase('end');
  };

  const confirmScoreEdit = (playerIdx: number) => {
    const parsed = Number.parseInt(editScoreValue, 10);
    if (!Number.isNaN(parsed)) {
      setPlayers(arr => arr.map((x, j) => j === playerIdx ? { ...x, score: parsed } : x));
    }
    setEditingScoreIdx(null);
  };

  const activeQuestion = activeCell && grid
    ? grid.categories[activeCell.catIdx].questions[activeCell.qIdx]
    : null;

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-white text-2xl">Chargement...</p></div>;
  }

  if (!grid) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-red-400 text-2xl">Grille introuvable</p></div>;
  }

  /* ── SETUP ── */
  if (phase === 'setup') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="self-stretch mb-8">
          <Link href="/" className="text-purple-300 hover:text-white transition">← Retour</Link>
        </div>
        <h1 className="text-4xl font-black text-jeopardy-gold uppercase tracking-widest mb-2 text-center">{grid.name}</h1>
        <p className="text-purple-300 mb-10 text-center">Ajoutez les joueurs avant de commencer</p>

        <div className="bg-purple-950 rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-white font-black text-xl mb-6 uppercase tracking-wide">Joueurs</h2>
          <div className="flex gap-2 mb-6">
            <input
              value={newPlayerName}
              onChange={e => setNewPlayerName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPlayer()}
              placeholder="Nom du joueur..."
              className="flex-1 bg-purple-900 text-white px-4 py-3 rounded-xl outline-none placeholder-purple-500 focus:bg-purple-800 transition"
            />
            <button onClick={addPlayer} className="bg-jeopardy-gold text-jeopardy-blue font-black px-5 py-3 rounded-xl hover:brightness-110 transition text-xl">
              +
            </button>
          </div>

          <div className="space-y-3 mb-8 min-h-[60px]">
            {players.map((p, i) => (
              <div key={`player-${p.name}-${i}`} className="flex items-center justify-between bg-purple-900 rounded-xl px-4 py-3">
                <span className="text-white font-bold">{p.name}</span>
                <button onClick={() => setPlayers(arr => arr.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 transition font-bold">✕</button>
              </div>
            ))}
            {players.length === 0 && <p className="text-purple-500 text-center text-sm pt-4">Aucun joueur ajouté</p>}
          </div>

          <button
            onClick={() => players.length > 0 && setPhase('game')}
            disabled={players.length === 0}
            className="w-full bg-green-700 hover:bg-green-600 text-white font-black text-xl py-4 rounded-xl uppercase tracking-widest transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ▶ Commencer !
          </button>
        </div>
      </main>
    );
  }

  /* ── GAME ── */
  const numCols = grid.categories.length;
  const numRows = grid.categories[0].questions.length;

  return (
    <main className="min-h-screen flex flex-col p-3 gap-3">
      {/* Nav */}
      <div className="flex items-center gap-3">
        <Link href="/" className="text-purple-300 hover:text-white text-sm transition flex-shrink-0">← Quitter</Link>
        <h1 className="text-lg font-black text-jeopardy-gold uppercase tracking-wider flex-1 min-w-0 truncate">{grid.name}</h1>
      </div>

      {/* Scoreboard — tous les joueurs toujours visibles */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${players.length}, 1fr)` }}>
        {players.map((p, i) => {
          const isActive = i === currentPlayerIdx;
          const isEditing = editingScoreIdx === i;

          return (
            <div
              key={`score-${p.name}-${i}`}
              className={`rounded-xl px-3 py-3 text-center transition ${
                isActive
                  ? 'bg-jeopardy-gold text-jeopardy-blue ring-4 ring-purple-300'
                  : 'bg-purple-950 text-white'
              }`}
            >
              <p className="font-bold text-xs uppercase tracking-wide truncate">{p.name}</p>

              {isEditing ? (
                <input
                  type="number"
                  value={editScoreValue}
                  onChange={e => setEditScoreValue(e.target.value)}
                  onBlur={() => confirmScoreEdit(i)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { confirmScoreEdit(i); }
                    else if (e.key === 'Escape') { setEditingScoreIdx(null); }
                  }}
                  className="w-full text-center text-2xl font-black bg-white/20 rounded-lg outline-none mt-1 py-0.5"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => { setEditingScoreIdx(i); setEditScoreValue(String(p.score)); }}
                  title="Cliquer pour modifier"
                  className={`text-3xl font-black mt-1 w-full rounded hover:opacity-70 transition ${p.score < 0 && !isActive ? 'text-red-400' : ''}`}
                >
                  {p.score < 0 ? '−' : ''}{Math.abs(p.score)}
                </button>
              )}

              {isActive && !isEditing && <p className="text-xs font-bold mt-1 opacity-70 uppercase">son tour</p>}
            </div>
          );
        })}
      </div>

      {/* Board */}
      <div className="flex-1 overflow-auto">
        <div
          className="grid gap-2 h-full"
          style={{ gridTemplateColumns: `repeat(${numCols}, minmax(120px, 1fr))` }}
        >
          {/* Category headers */}
          {grid.categories.map((cat, catIdx) => (
            <div key={`cat-${catIdx}`} className="bg-purple-950 border-2 border-purple-800 rounded-xl p-3 flex items-center justify-center min-h-[70px]">
              <p className="text-jeopardy-gold font-black text-sm uppercase tracking-wide text-center leading-tight">
                {cat.name}
              </p>
            </div>
          ))}

          {/* Cells row by row */}
          {Array.from({ length: numRows }, (_, qIdx) =>
            grid.categories.map((cat, catIdx) => {
              const cell = board[catIdx]?.[qIdx];
              const q = cat.questions[qIdx];
              return (
                <button
                  key={`cell-${catIdx}-${qIdx}`}
                  onClick={() => openCell(catIdx, qIdx)}
                  disabled={cell?.played}
                  className={`rounded-xl flex items-center justify-center min-h-[100px] font-black text-3xl border-2 transition ${
                    cell?.played
                      ? 'bg-purple-950 border-purple-950 cursor-not-allowed opacity-20'
                      : 'bg-purple-900 border-purple-700 text-jeopardy-gold hover:bg-purple-800 hover:border-jeopardy-gold cursor-pointer'
                  }`}
                >
                  {cell?.played ? '' : q.value}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Question modal */}
      {activeCell && activeQuestion && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-6 z-50">
          <div className="bg-purple-950 border-4 border-jeopardy-gold rounded-2xl max-w-2xl w-full p-8 text-center max-h-[90vh] overflow-y-auto">
            <p className="text-purple-400 text-xs uppercase tracking-widest mb-1">
              {grid.categories[activeCell.catIdx].name}
            </p>
            <p className="text-jeopardy-gold text-5xl font-black mb-6">{activeQuestion.value}</p>
            {activeQuestion.imageUrl && (
              <img
                src={activeQuestion.imageUrl}
                alt=""
                className="max-h-72 max-w-full object-contain rounded-xl mx-auto mb-6"
              />
            )}
            <p className="text-white text-2xl font-bold leading-relaxed mb-8">{activeQuestion.question}</p>

            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                className="bg-jeopardy-gold text-jeopardy-blue font-black text-xl px-10 py-4 rounded-xl uppercase tracking-wide hover:brightness-110 transition"
              >
                Révéler la réponse
              </button>
            ) : (
              <>
                <div className="bg-green-950 border-2 border-green-700 rounded-xl p-5 mb-8">
                  <p className="text-green-400 text-xs uppercase tracking-widest mb-2">Réponse</p>
                  <p className="text-green-100 text-2xl font-bold">{activeQuestion.answer}</p>
                </div>

                <div className="space-y-4">
                  <p className="text-purple-300 text-sm font-bold uppercase tracking-wide">Qui a répondu correctement ?</p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {players.map((p, i) => (
                      <button key={`correct-${p.name}`} onClick={() => resolveCell(true, i)} className="bg-green-700 hover:bg-green-600 text-white font-bold px-5 py-3 rounded-xl transition">
                        ✓ {p.name} <span className="text-green-300 text-sm">+{activeQuestion.value}</span>
                      </button>
                    ))}
                  </div>

                  <p className="text-purple-400 text-xs uppercase tracking-wide pt-2">Pénalité (mauvaise réponse)</p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {players.map((p, i) => (
                      <button key={`wrong-${p.name}`} onClick={() => applyPenalty(i)} className="bg-red-900 hover:bg-red-800 text-red-300 font-bold px-4 py-2 rounded-xl transition text-sm">
                        ✗ {p.name} <span className="text-red-500 text-xs">−{activeQuestion.value}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button onClick={() => resolveCell(null, null)} className="bg-purple-800 hover:bg-purple-700 text-white font-bold px-8 py-3 rounded-xl transition">
                      Passer (aucun point)
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* End game overlay */}
      {phase === 'end' && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-6 z-50">
          <div className="bg-purple-950 border-4 border-jeopardy-gold rounded-2xl max-w-lg w-full p-8 text-center">
            <h2 className="text-jeopardy-gold text-5xl font-black uppercase tracking-widest mb-2">Fin !</h2>
            <p className="text-purple-300 mb-8">Classement final</p>
            <div className="space-y-3 mb-8">
              {sortedPlayers.map((p, i) => (
                <div
                  key={`rank-${p.name}`}
                  className={`flex justify-between items-center rounded-xl px-6 py-4 ${
                    i === 0 ? 'bg-jeopardy-gold text-jeopardy-blue' : 'bg-purple-900 text-white'
                  }`}
                >
                  <span className="font-black text-lg">{i === 0 ? '🏆 ' : `${i + 1}. `}{p.name}</span>
                  <span className="font-black text-2xl">{p.score < 0 ? '−' : ''}{Math.abs(p.score)}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setBoard(initBoard(grid.categories));
                  setPlayers(p => p.map(x => ({ ...x, score: 0 })));
                  setCurrentPlayerIdx(0);
                  setPhase('setup');
                }}
                className="bg-jeopardy-gold text-jeopardy-blue font-black px-8 py-4 rounded-xl uppercase tracking-wide hover:brightness-110 transition"
              >
                Rejouer
              </button>
              <Link href="/" className="bg-purple-800 hover:bg-purple-700 text-white font-black px-8 py-4 rounded-xl uppercase tracking-wide transition">
                Accueil
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
