import { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowLeft, Zap } from 'lucide-react';
import { AnswerFeedback } from './AnswerFeedback';
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  getFillInForLevel,
  type GrammarCategory,
} from '../grammar-games-data';
import { recordMistake } from '../mistakeTracking';
import { type ExamLevel, loadActiveLevel } from '../levelConfig';

interface GrammarQuizProps {
  onBack: () => void;
  level?: ExamLevel;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const QUESTIONS_PER_SESSION = 15;
const ALL_CATEGORIES: GrammarCategory[] = [
  'conjugation', 'modal', 'accusative', 'possessive', 'negation', 'separable', 'imperative',
];

// ── Category Picker ───────────────────────────────────────────────

function CategoryPicker({ onSelect, onBack, questions, level }: {
  onSelect: (cat: GrammarCategory | 'all') => void;
  onBack: () => void;
  questions: ReturnType<typeof getFillInForLevel>;
  level: string;
}) {
  const counts: Record<string, number> = {};
  for (const cat of ALL_CATEGORIES) {
    counts[cat] = questions.filter(q => q.category === cat).length;
  }

  return (
    <div className="min-h-dvh flex flex-col bg-exam-bg">
      <div className="bg-white border-b-2 border-card-border px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="text-gray-400 hover:text-telc transition-colors p-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-extrabold text-lg">Grammatik-Quiz</h1>
        <span className="text-xs text-gray-400 font-medium">— Wähle ein Thema</span>
      </div>
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* All categories */}
          <button
            onClick={() => onSelect('all')}
            className="card card-interactive !rounded-2xl p-5 text-left col-span-full"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-telc text-white flex items-center justify-center shrink-0 font-extrabold text-lg">{level}</div>
              <div>
                <div className="font-extrabold text-telc">Alle Kategorien (gemischt)</div>
                <div className="text-sm text-gray-500">{questions.length} Fragen · {QUESTIONS_PER_SESSION} pro Runde · zufällig gemischt</div>
              </div>
            </div>
          </button>

          {ALL_CATEGORIES.filter(cat => (counts[cat] ?? 0) > 0).map(cat => (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className="card card-interactive !rounded-2xl p-5 text-left"
            >
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[cat]}`}>
                  {CATEGORY_LABELS[cat]}
                </span>
                <span className="text-xs text-gray-400 font-medium">{counts[cat]} Fragen</span>
              </div>
              <div className="mt-2 text-sm text-gray-600 font-medium">
                {categoryDesc(cat)}
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

function categoryDesc(cat: GrammarCategory): string {
  const m: Record<GrammarCategory, string> = {
    conjugation: 'Verbformen im Präsens — regelmäßig & unregelmäßig',
    modal: 'können, müssen, wollen, dürfen, möchten',
    accusative: 'Artikel im Akkusativ — den, einen, kein…',
    possessive: 'mein/meine, dein, sein, ihr, unser…',
    negation: 'nicht vs. kein — richtige Verneinung',
    separable: 'Trennbare Verben — Präfix ans Satzende',
    imperative: 'Befehle & Bitten — du / Sie-Form',
  };
  return m[cat];
}

// ── Main Component ────────────────────────────────────────────────

export function GrammarQuiz({ onBack, level = 'A1' }: GrammarQuizProps) {
  const fillInQuestions = getFillInForLevel(level);
  const [category, setCategory] = useState<GrammarCategory | 'all' | null>(null);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const [categoryScores, setCategoryScores] = useState<Record<string, { correct: number; total: number }>>({});

  const questions = useMemo(() => {
    if (!category) return [];
    const pool = category === 'all'
      ? fillInQuestions
      : fillInQuestions.filter(q => q.category === category);
    return shuffle(pool).slice(0, QUESTIONS_PER_SESSION);
  }, [category]);

  const question = questions[questionIdx];
  const total = questions.length;

  function handleSelect(option: string) {
    if (showFeedback) return;
    setSelected(option);
    const isCorrect = option === question.correct;
    if (isCorrect) {
      setScore(s => s + 1);
      setStreak(s => {
        const next = s + 1;
        setMaxStreak(m => Math.max(m, next));
        return next;
      });
    } else {
      setStreak(0);
      // Persist the mistake for weakness analysis
      recordMistake({
        type: 'grammar',
        level: loadActiveLevel(),
        question: question.sentence,
        correct: question.correct,
        wrong: option,
        category: question.category,
      });
    }
    setCategoryScores(prev => {
      const cat = question.category;
      const existing = prev[cat] || { correct: 0, total: 0 };
      return {
        ...prev,
        [cat]: { correct: existing.correct + (isCorrect ? 1 : 0), total: existing.total + 1 },
      };
    });
    setShowFeedback(true);
  }

  function handleContinue() {
    setShowFeedback(false);
    setSelected(null);
    if (questionIdx < total - 1) {
      setQuestionIdx(i => i + 1);
    } else {
      setFinished(true);
    }
  }

  function restart() {
    setCategory(null);
    setQuestionIdx(0);
    setSelected(null);
    setShowFeedback(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setFinished(false);
    setCategoryScores({});
  }

  const keyHandlerRef = useRef<(e: KeyboardEvent) => void>(() => {});
  keyHandlerRef.current = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (finished || !question) return;
    if (showFeedback) return;
    const num = parseInt(e.key);
    if (!isNaN(num) && num >= 1 && num <= question.options.length) {
      handleSelect(question.options[num - 1]);
    }
  };
  useEffect(() => {
    const fn = (e: KeyboardEvent) => keyHandlerRef.current(e);
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  // ── Category picker ──────────────────────────────────────────
  if (!category) {
    return <CategoryPicker onSelect={setCategory} onBack={onBack} questions={fillInQuestions} level={level} />;
  }

  // ── Finished ─────────────────────────────────────────────────
  if (finished) {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    const cats = Object.entries(categoryScores).sort(([, a], [, b]) => (a.correct / a.total) - (b.correct / b.total));

    return (
      <div className="min-h-dvh flex flex-col bg-exam-bg">
        <div className="bg-white border-b-2 border-card-border px-4 py-3 flex items-center gap-3 shrink-0">
          <button onClick={restart} className="text-gray-400 hover:text-telc transition-colors p-1">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-extrabold text-lg">Ergebnis</h1>
        </div>
        <main className="flex-1 flex flex-col items-center justify-start p-6 gap-5 max-w-lg mx-auto w-full">
          <div className="card !rounded-2xl p-8 text-center w-full bounce-in">
            <div className="text-5xl font-extrabold mb-2">{pct}%</div>
            <div className="text-lg font-bold text-gray-600 mb-4">{score} / {total} richtig</div>
            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-extrabold text-section-hoeren">{maxStreak}</div>
                <div className="text-xs text-gray-400 font-bold">Beste Serie</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-extrabold text-correct">{score}</div>
                <div className="text-xs text-gray-400 font-bold">Richtig</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-extrabold text-wrong">{total - score}</div>
                <div className="text-xs text-gray-400 font-bold">Falsch</div>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={restart} className="btn-3d btn-3d-primary">Nochmal</button>
              <button onClick={onBack} className="btn-3d btn-3d-secondary">Zurück</button>
            </div>
          </div>

          {/* Category breakdown */}
          {cats.length > 0 && (
            <div className="card !rounded-2xl p-5 w-full slide-in">
              <h3 className="font-bold text-sm text-gray-600 mb-3">Auswertung nach Kategorie</h3>
              <div className="space-y-2.5">
                {cats.map(([cat, { correct, total: t }]) => {
                  const catPct = Math.round((correct / t) * 100);
                  return (
                    <div key={cat}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[cat as GrammarCategory]}`}>
                          {CATEGORY_LABELS[cat as GrammarCategory]}
                        </span>
                        <span className={`text-xs font-bold ${catPct >= 80 ? 'text-correct' : catPct >= 60 ? 'text-section-lesen-dark' : 'text-wrong'}`}>
                          {correct}/{t} ({catPct}%)
                        </span>
                      </div>
                      <div className="progress-track !h-1.5">
                        <div
                          className={`progress-fill ${catPct >= 80 ? 'bg-correct' : catPct >= 60 ? 'bg-section-lesen' : 'bg-wrong'}`}
                          style={{ width: `${catPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  if (!question) return null;

  const isCorrect = selected === question.correct;
  const progressPct = total > 0 ? ((questionIdx + 1) / total) * 100 : 0;

  // Highlight blank in sentence
  const parts = question.sentence.split('___');

  return (
    <div className="min-h-dvh flex flex-col bg-exam-bg">
      {/* Header */}
      <div className="bg-white border-b-2 border-card-border px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={restart} className="text-gray-400 hover:text-telc transition-colors p-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-extrabold text-lg">Grammatik-Quiz</h1>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[question.category]}`}>
          {CATEGORY_LABELS[question.category]}
        </span>
        <div className="flex-1" />
        {streak >= 2 && (
          <span className="section-strip bg-section-lesen-light text-section-lesen-dark">
            <Zap size={12} /> {streak}x
          </span>
        )}
        <span className="text-xs font-bold bg-telc-light text-telc-dark px-2.5 py-1 rounded-full">
          {questionIdx + 1} / {total}
        </span>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 flex flex-col gap-6">
        {/* Progress */}
        <div className="progress-track !h-2">
          <div className="progress-fill bg-telc" style={{ width: `${progressPct}%` }} />
        </div>

        {/* Question */}
        <div className="card !rounded-2xl p-8 text-center fade-in">
          <div className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-3">Ergänze den Satz:</div>
          <div className="text-xl font-bold text-gray-800 leading-relaxed">
            {parts[0]}
            <span className={`inline-block min-w-[80px] mx-1 px-3 py-0.5 rounded-lg border-2 font-extrabold align-middle ${
              showFeedback
                ? isCorrect
                  ? 'border-correct bg-correct/10 text-correct'
                  : 'border-wrong bg-wrong/10 text-wrong'
                : selected
                  ? 'border-telc bg-telc-light text-telc-dark'
                  : 'border-dashed border-gray-300 text-gray-400'
            }`}>
              {selected || '___'}
            </span>
            {parts[1] || ''}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2">
          {question.options.map((opt, i) => {
            let extraClass = '';
            if (showFeedback) {
              if (opt === question.correct) extraClass = 'selected';
              else if (opt === selected && !isCorrect) extraClass = '!border-wrong !bg-wrong/5';
            } else if (selected === opt) {
              extraClass = 'selected';
            }
            return (
              <button
                key={`${questionIdx}-${i}`}
                onClick={() => handleSelect(opt)}
                disabled={showFeedback}
                className={`option-card w-full ${extraClass}`}
              >
                <span className="kbd-hint shrink-0">{i + 1}</span>
                <span className="font-bold flex-1 text-center">{opt}</span>
              </button>
            );
          })}
        </div>
      </main>

      {showFeedback && (
        <AnswerFeedback
          isCorrect={isCorrect}
          correctAnswer={`${question.correct} — ${question.explanation}`}
          correctAnswerEn={question.explanationEn}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
}
