import { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle, RotateCcw, ChevronRight } from 'lucide-react';
import { sentenceExercises } from '../grammar-games-data';

interface SentenceBuilderProps {
  onBack: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const EXERCISES_PER_SESSION = 10;

type Phase = 'building' | 'correct' | 'wrong';

export function SentenceBuilder({ onBack }: SentenceBuilderProps) {
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('building');
  const [built, setBuilt] = useState<string[]>([]);   // words placed so far
  const [available, setAvailable] = useState<{ word: string; id: number }[]>([]); // remaining chips
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const exercises = useMemo(() => shuffle(sentenceExercises).slice(0, EXERCISES_PER_SESSION), []);
  const exercise = exercises[exerciseIdx];

  // Initialise chips when exercise changes
  useEffect(() => {
    if (!exercise) return;
    const chips = shuffle(exercise.words).map((w, i) => ({ word: w, id: i }));
    setAvailable(chips);
    setBuilt([]);
    setPhase('building');
  }, [exerciseIdx, exercise]);

  function addWord(chipId: number) {
    if (phase !== 'building') return;
    const chip = available.find(c => c.id === chipId);
    if (!chip) return;
    setBuilt(b => [...b, chip.word]);
    setAvailable(a => a.filter(c => c.id !== chipId));
  }

  function removeWord(idx: number) {
    if (phase !== 'building') return;
    const word = built[idx];
    // Restore chip — find original id from exercise
    const originalChips = exercise.words.map((w, i) => ({ word: w, id: i }));
    const usedIds = new Set(available.map(c => c.id));
    const alreadyPlaced = built.filter((_, i) => i !== idx);
    // Figure out which chip ids are still in available + other placed words
    const placedIds = originalChips
      .filter(c => alreadyPlaced.includes(c.word))
      .map(c => c.id);
    // Find first id for this word that isn't in available or placed
    const restoredId = originalChips.find(
      c => c.word === word && !usedIds.has(c.id) && !placedIds.includes(c.id),
    )?.id ?? chipId(word, originalChips, usedIds, placedIds);
    setBuilt(b => b.filter((_, i) => i !== idx));
    setAvailable(a => [...a, { word, id: restoredId }]);
  }

  // Simple fallback id resolver
  function chipId(word: string, chips: { word: string; id: number }[], usedIds: Set<number>, placedIds: number[]): number {
    return chips.find(c => c.word === word && !usedIds.has(c.id) && !placedIds.includes(c.id))?.id ?? Math.random();
  }

  function check() {
    if (built.length !== exercise.words.length) return;
    const correct = built.join(' ') === exercise.words.join(' ');
    if (correct) {
      setScore(s => s + 1);
      setPhase('correct');
    } else {
      setPhase('wrong');
    }
  }

  function reset() {
    const chips = shuffle(exercise.words).map((w, i) => ({ word: w, id: i }));
    setAvailable(chips);
    setBuilt([]);
    setPhase('building');
  }

  function next() {
    if (exerciseIdx < exercises.length - 1) {
      setExerciseIdx(i => i + 1);
    } else {
      setFinished(true);
    }
  }

  function restart() {
    setExerciseIdx(0);
    setScore(0);
    setFinished(false);
  }

  const keyHandlerRef = useRef<(e: KeyboardEvent) => void>(() => {});
  keyHandlerRef.current = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (e.key === 'Enter') {
      if (phase === 'building' && built.length === exercise?.words.length) { check(); return; }
      if (phase === 'correct' || phase === 'wrong') { next(); return; }
    }
    if (e.key === 'Backspace' && phase === 'building' && built.length > 0) {
      removeWord(built.length - 1);
    }
    if ((e.key === 'r' || e.key === 'R') && phase === 'building') reset();
  };
  useEffect(() => {
    const fn = (e: KeyboardEvent) => keyHandlerRef.current(e);
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  // ── Finished ─────────────────────────────────────────────────
  if (finished) {
    const pct = Math.round((score / EXERCISES_PER_SESSION) * 100);
    return (
      <div className="min-h-dvh flex flex-col bg-exam-bg">
        <div className="bg-white border-b-2 border-card-border px-4 py-3 flex items-center gap-3 shrink-0">
          <button onClick={restart} className="text-gray-400 hover:text-telc p-1"><ArrowLeft size={20} /></button>
          <h1 className="font-extrabold text-lg">Ergebnis</h1>
        </div>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="card !rounded-2xl p-8 text-center max-w-md w-full bounce-in">
            <div className="text-5xl font-extrabold mb-2">{pct}%</div>
            <div className="text-lg font-bold text-gray-600 mb-6">{score} / {EXERCISES_PER_SESSION} richtig</div>
            <div className="flex gap-3 justify-center">
              <button onClick={restart} className="btn-3d btn-3d-primary">Nochmal</button>
              <button onClick={onBack} className="btn-3d btn-3d-secondary">Zurück</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!exercise) return null;

  const progressPct = ((exerciseIdx + 1) / EXERCISES_PER_SESSION) * 100;
  const allPlaced = built.length === exercise.words.length;

  return (
    <div className="min-h-dvh flex flex-col bg-exam-bg">
      {/* Header */}
      <div className="bg-white border-b-2 border-card-border px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="text-gray-400 hover:text-telc p-1"><ArrowLeft size={20} /></button>
        <h1 className="font-extrabold text-lg">Satzpuzzle</h1>
        <span className="text-xs font-bold bg-section-schreiben/15 text-section-schreiben px-2.5 py-1 rounded-full">
          {exercise.focus}
        </span>
        <div className="flex-1" />
        <span className="text-xs font-bold bg-telc-light text-telc-dark px-2.5 py-1 rounded-full">
          {exerciseIdx + 1} / {EXERCISES_PER_SESSION}
        </span>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 flex flex-col gap-5">
        {/* Progress */}
        <div className="progress-track !h-2">
          <div className="progress-fill bg-section-schreiben" style={{ width: `${progressPct}%` }} />
        </div>

        {/* Instruction */}
        <div className="text-sm text-gray-500 font-medium text-center">
          Klicke die Wörter in der richtigen Reihenfolge.
        </div>

        {/* Sentence construction area */}
        <div className={`card !rounded-2xl p-5 min-h-[72px] flex flex-wrap gap-2 items-center transition-all ${
          phase === 'correct' ? '!border-correct/40 !bg-correct/5'
          : phase === 'wrong' ? '!border-wrong/40 !bg-wrong/5'
          : ''
        }`}>
          {built.length === 0 && phase === 'building' && (
            <span className="text-gray-300 text-sm font-medium italic w-full text-center">
              Hier erscheinen die Wörter…
            </span>
          )}
          {built.map((word, i) => (
            <button
              key={i}
              onClick={() => removeWord(i)}
              disabled={phase !== 'building'}
              className={`px-3 py-1.5 rounded-xl text-sm font-bold border-2 transition-all ${
                phase === 'correct'
                  ? 'border-correct bg-correct/10 text-correct cursor-default'
                  : phase === 'wrong'
                    ? 'border-wrong bg-wrong/10 text-wrong cursor-default'
                    : 'border-telc bg-telc-light text-telc-dark hover:bg-wrong/10 hover:border-wrong/40 hover:text-wrong'
              }`}
            >
              {word}
            </button>
          ))}
        </div>

        {/* Result feedback */}
        {phase === 'wrong' && (
          <div className="card !rounded-2xl p-4 !border-section-schreiben/30 !bg-section-schreiben-light slide-in">
            <div className="text-xs font-bold text-section-schreiben uppercase tracking-wider mb-1.5">Richtige Reihenfolge:</div>
            <div className="font-bold text-gray-800">{exercise.words.join(' ')}</div>
            <div className="text-sm text-gray-600 mt-2">{exercise.tip}</div>
          </div>
        )}
        {phase === 'correct' && (
          <div className="card !rounded-2xl p-4 !border-correct/30 !bg-correct/5 slide-in">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-correct" />
              <span className="font-bold text-correct">Richtig!</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">{exercise.tip}</div>
          </div>
        )}

        {/* Word chips */}
        {phase === 'building' && (
          <div className="card !rounded-2xl p-5">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Verfügbare Wörter:</div>
            <div className="flex flex-wrap gap-2">
              {available.map(chip => (
                <button
                  key={chip.id}
                  onClick={() => addWord(chip.id)}
                  className="px-3 py-1.5 rounded-xl text-sm font-bold border-2 border-card-border bg-white hover:border-telc hover:bg-telc-light hover:text-telc-dark transition-all active:scale-95"
                >
                  {chip.word}
                </button>
              ))}
              {available.length === 0 && (
                <span className="text-sm text-gray-400 italic">Alle Wörter platziert</span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center">
          <button
            onClick={reset}
            disabled={phase !== 'building'}
            className="btn-3d btn-3d-secondary !py-2 !px-4 !text-sm"
          >
            <RotateCcw size={14} /> Zurücksetzen
          </button>

          {phase === 'building' ? (
            <button
              onClick={check}
              disabled={!allPlaced}
              className="btn-3d btn-3d-primary !py-2 !px-5 !text-sm"
            >
              Prüfen <CheckCircle size={14} />
            </button>
          ) : (
            <button
              onClick={next}
              className="btn-3d btn-3d-primary !py-2 !px-5 !text-sm"
            >
              Weiter <ChevronRight size={14} />
            </button>
          )}
        </div>

        {/* Keyboard hints */}
        <div className="flex gap-4 justify-center text-xs text-gray-400 font-medium">
          <span><kbd className="kbd-hint">↵</kbd> Prüfen / Weiter</span>
          <span><kbd className="kbd-hint">⌫</kbd> Letztes Wort</span>
          <span><kbd className="kbd-hint">R</kbd> Reset</span>
        </div>
      </main>
    </div>
  );
}
