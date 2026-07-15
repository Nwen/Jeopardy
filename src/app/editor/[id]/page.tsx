'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Category, Question } from '@/types';

const DEFAULT_VALUES = [100, 200, 300, 400, 500];

function genId() {
  return Math.random().toString(36).slice(2);
}

function emptyCategory(): Category {
  return {
    id: genId(),
    name: 'Nouvelle catégorie',
    questions: DEFAULT_VALUES.map(value => ({ value, question: '', answer: '' })),
  };
}

function emptyGrid() {
  return {
    name: 'Ma grille',
    categories: Array.from({ length: 5 }, emptyCategory),
  };
}

function applyQuestionUpdate(
  c: Category,
  qIdx: number,
  field: keyof Question,
  value: string,
): Category {
  return {
    ...c,
    questions: c.questions.map((q, j) => j === qIdx ? { ...q, [field]: value } : q),
  };
}

export default function EditorPage({ params }: Readonly<{ params: Readonly<{ id: string }> }>) {
  const router = useRouter();
  const isNew = params.id === 'new';
  const [gridName, setGridName] = useState('Ma grille');
  const [categories, setCategories] = useState<Category[]>(emptyGrid().categories);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isNew) return;
    fetch(`/api/grids/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setGridName(data.name);
        setCategories(data.categories.map((c: Category) => ({ ...c, id: c.id ?? genId() })));
        setLoading(false);
      });
  }, [params.id, isNew]);

  const updateCategoryName = (catId: string, name: string) => {
    setCategories(cats => cats.map(c => c.id === catId ? { ...c, name } : c));
  };

  const updateQuestion = (catId: string, qIdx: number, field: keyof Question, value: string) => {
    setCategories(cats => cats.map(c =>
      c.id === catId ? applyQuestionUpdate(c, qIdx, field, value) : c
    ));
  };

  const addCategory = () => setCategories(cats => [...cats, emptyCategory()]);

  const removeCategory = (catId: string) => {
    if (categories.length <= 1) return;
    setCategories(cats => cats.filter(c => c.id !== catId));
  };

  const save = async () => {
    setSaving(true);
    const body = { name: gridName, categories };
    const res = await fetch(
      isNew ? '/api/grids' : `/api/grids/${params.id}`,
      { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );
    const data = await res.json();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    if (isNew) router.push(`/editor/${data.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white text-2xl">Chargement...</p>
      </div>
    );
  }

  const saveButtonClass = saved
    ? 'bg-green-600 text-white'
    : 'bg-jeopardy-gold text-jeopardy-blue hover:brightness-110';

  return (
    <main className="min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        <Link href="/" className="text-purple-300 hover:text-white transition flex-shrink-0">
          ← Retour
        </Link>
        <input
          value={gridName}
          onChange={e => setGridName(e.target.value)}
          className="text-2xl font-black text-jeopardy-gold bg-transparent border-b-2 border-jeopardy-gold outline-none flex-1 min-w-40 uppercase tracking-wide"
          placeholder="Nom de la grille"
        />
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={save}
            disabled={saving}
            className={`font-black px-6 py-3 rounded-xl uppercase tracking-wide transition disabled:opacity-50 ${saveButtonClass}`}
          >
            {saving ? 'Sauvegarde...' : saved ? '✓ Sauvegardé !' : 'Enregistrer'}
          </button>
          {!isNew && (
            <Link href={`/quiz/${params.id}`} className="bg-green-700 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl uppercase transition">
              ▶ Jouer
            </Link>
          )}
        </div>
      </div>

      {/* Grid editor */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
          {categories.map(cat => (
            <div key={cat.id} className="w-60 flex flex-col gap-3">
              {/* Extra padding-top so the delete button isn't clipped */}
              <div className="relative pt-3">
                <input
                  value={cat.name}
                  onChange={e => updateCategoryName(cat.id, e.target.value)}
                  className="w-full bg-purple-950 border-2 border-jeopardy-gold text-jeopardy-gold font-black text-center uppercase p-3 rounded-xl outline-none focus:border-purple-300 text-sm tracking-wide"
                  placeholder="Catégorie"
                />
                {categories.length > 1 && (
                  <button
                    onClick={() => removeCategory(cat.id)}
                    className="absolute top-0 -right-2 bg-red-600 hover:bg-red-500 text-white w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Questions */}
              {cat.questions.map((q, qIdx) => (
                <div key={q.value} className="bg-purple-950 border border-purple-800 rounded-xl p-3">
                  <p className="text-jeopardy-gold font-black text-xl text-center mb-2">{q.value}</p>
                  <textarea
                    value={q.question}
                    onChange={e => updateQuestion(cat.id, qIdx, 'question', e.target.value)}
                    placeholder="Question..."
                    rows={3}
                    className="w-full bg-purple-900 text-white text-sm p-2 rounded-lg outline-none resize-none mb-2 placeholder-purple-600 focus:bg-purple-800 transition"
                  />
                  <input
                    value={q.answer}
                    onChange={e => updateQuestion(cat.id, qIdx, 'answer', e.target.value)}
                    placeholder="Réponse..."
                    className="w-full bg-green-950 border border-green-800 text-green-300 text-sm p-2 rounded-lg outline-none placeholder-green-800 focus:bg-green-900 transition"
                  />
                </div>
              ))}
            </div>
          ))}

          {/* Add category */}
          <div className="w-60 flex-shrink-0 pt-3">
            <button
              onClick={addCategory}
              className="w-full h-16 bg-purple-950 border-2 border-dashed border-purple-700 text-purple-400 font-bold rounded-xl hover:border-purple-500 hover:text-purple-300 transition text-lg"
            >
              + Catégorie
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
