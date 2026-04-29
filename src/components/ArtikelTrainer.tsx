import { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Zap, Timer as TimerIcon } from 'lucide-react';
import { getStudyDataForLevel } from '../study-data';
import type { ExamLevel } from '../levelConfig';
import { addXP, XP_VALUES } from '../xpTracking';

interface ArtikelTrainerProps {
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

const DURATION = 60;

export function ArtikelTrainer({ onBack, level = 'A1' }: ArtikelTrainerProps) {
  const { vocabulary } = getStudyDataForLevel(level);

  // All nouns with articles across all topics
  const nouns = useMemo(() => {
    const all = vocabulary.flatMap(t =>
      t.words.filter(w => w.article && ['der', 'die', 'das'].includes(w.article))
        .map(w => ({ german: w.german, article: w.article!, english: w.english }))
    );
    return shuffle(all);
  }, [vocabulary]);

  const [phase, setPhase] = useState<'ready' | 'playing' | 'done'>('ready');
  const [idx, setIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const word = nouns[idx % nouns.length];

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setPhase('done');
          addXP(XP_VALUES.sessionComplete);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [phase]);

  function guess(article: string) {
    if (feedback) return;
    const correct = article === word.article;
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => { const n = s + 1; setMaxStreak(m => Math.max(m, n)); return n; });
      addXP(XP_VALUES.correctAnswer);
    } else {
      setWrong(w => w + 1);
      setStreak(0);
    }
    setTimeout(() => {
      setFeedback(null);
      setIdx(i => i + 1);
    }, feedback === null ? 500 : 500);
  }

  function start() {
    setPhase('playing');
    setIdx(0);
    setScore(0);
    setWrong(0);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(DURATION);
    setFeedback(null);
  }

  if (nouns.length === 0) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-exam-bg p-8">
        <p className="text-gray-500">Keine Nomen mit Artikeln für dieses Level verfügbar.</p>
        <button onClick={onBack} className="btn-3d btn-3d-secondary mt-4">Zurück</button>
      </div>
    );
  }

  // Ready screen
  if (phase === 'ready') {
    return (
      <div className="min-h-dvh flex flex-col bg-exam-bg">
        <div className="bg-white border-b-2 border-card-border px-4 py-3 flex items-center gap-3 shrink-0">
          <button onClick={onBack} className="text-gray-400 hover:text-telc p-1"><ArrowLeft size={20} /></button>
          <h1 className="font-extrabold text-lg">Artikel-Trainer</h1>
        </div>
        <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6 max-w-sm mx-auto w-full">
          <div className="text-6xl">🪨</div>
          <div className="text-center">
            <h2 className="text-2xl font-extrabold mb-2">der · die · das</h2>
            <p className="text-gray-500 text-sm">Du hast {DURATION} Sekunden. Tippe so schnell wie möglich den richtigen Artikel!</p>
          </div>
          <div className="card !rounded-2xl p-4 w-full text-center">
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{nouns.length} Nomen verfügbar</div>
          </div>
          <button onClick={start} className="btn-3d btn-3d-primary w-full !py-4 !text-lg">
            Los geht's! <Zap size={18} />
          </button>
        </main>
      </div>
    );
  }

  // Done screen
  if (phase === 'done') {
    const total = score + wrong;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <div className="min-h-dvh flex flex-col bg-exam-bg">
        <div className="bg-white border-b-2 border-card-border px-4 py-3 flex items-center gap-3 shrink-0">
          <button onClick={onBack} className="text-gray-400 hover:text-telc p-1"><ArrowLeft size={20} /></button>
          <h1 className="font-extrabold text-lg">Artikel-Trainer</h1>
        </div>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="card !rounded-2xl p-8 text-center max-w-sm w-full bounce-in space-y-4">
            <div className="text-5xl font-extrabold">{pct}%</div>
            <div className="text-lg text-gray-600 font-bold">{score} richtig · {wrong} falsch</div>
            <div className="flex justify-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-extrabold text-section-hoeren">{score}</div>
                <div className="text-xs text-gray-400 font-bold">Richtig</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-extrabold text-section-lesen-dark">{maxStreak}</div>
                <div className="text-xs text-gray-400 font-bold">Beste Serie</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-extrabold text-telc">{total}</div>
                <div className="text-xs text-gray-400 font-bold">Gesamt</div>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={start} className="btn-3d btn-3d-primary">Nochmal</button>
              <button onClick={onBack} className="btn-3d btn-3d-secondary">Zurück</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Playing
  const timerPct = (timeLeft / DURATION) * 100;
  const timerColor = timeLeft > 20 ? 'bg-telc' : timeLeft > 10 ? 'bg-section-lesen' : 'bg-wrong';

  return (
    <div className="min-h-dvh flex flex-col bg-exam-bg">
      <div className="bg-white border-b-2 border-card-border px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="text-gray-400 hover:text-telc p-1"><ArrowLeft size={20} /></button>
        <h1 className="font-extrabold text-lg">Artikel-Trainer</h1>
        <div className="flex-1" />
        {streak >= 3 && (
          <span className="section-strip bg-section-lesen-light text-section-lesen-dark">
            <Zap size={12} /> {streak}x
          </span>
        )}
        <span className="flex items-center gap-1.5 font-bold text-sm">
          <TimerIcon size={14} className={timeLeft <= 10 ? 'text-wrong' : 'text-gray-400'} />
          <span className={timeLeft <= 10 ? 'text-wrong font-extrabold' : 'text-gray-600'}>{timeLeft}s</span>
        </span>
      </div>

      <main className="flex-1 max-w-sm mx-auto w-full px-4 py-6 flex flex-col gap-5">
        {/* Timer bar */}
        <div className="progress-track !h-2">
          <div className={`progress-fill ${timerColor} transition-all duration-1000`} style={{ width: `${timerPct}%` }} />
        </div>

        {/* Score */}
        <div className="flex justify-center gap-8 text-center">
          <div><div className="text-2xl font-extrabold text-correct">{score}</div><div className="text-xs text-gray-400">Richtig</div></div>
          <div><div className="text-2xl font-extrabold text-wrong">{wrong}</div><div className="text-xs text-gray-400">Falsch</div></div>
        </div>

        {/* Word card */}
        <div className={`card !rounded-2xl p-8 text-center transition-all duration-150 ${
          feedback === 'correct' ? '!border-correct/40 !bg-correct/5'
          : feedback === 'wrong' ? '!border-wrong/40 !bg-wrong/5'
          : ''
        }`}>
          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Was ist der Artikel?</div>
          <div className="text-3xl font-extrabold text-gray-800 mb-1">{word.german}</div>
          <div className="text-sm text-gray-400 italic">{word.english}</div>
          {feedback === 'wrong' && (
            <div className="mt-3 text-sm font-bold text-wrong">
              ✗ Richtig: <span className="text-gray-700">{word.article} {word.german}</span>
            </div>
          )}
        </div>

        {/* Article buttons */}
        <div className="grid grid-cols-3 gap-3">
          {(['der', 'die', 'das'] as const).map(art => (
            <button
              key={art}
              onClick={() => guess(art)}
              disabled={!!feedback}
              className={`btn-3d !py-5 !text-xl !font-extrabold !rounded-2xl transition-all ${
                feedback && art === word.article ? 'btn-3d-primary'
                : feedback === 'wrong' && art !== word.article ? 'btn-3d-secondary !opacity-40'
                : 'btn-3d-secondary'
              }`}
            >
              {art}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
