import { useState, useMemo } from 'react';
import { ArrowLeft, Volume2, CheckCircle, XCircle, ChevronRight, RotateCcw } from 'lucide-react';
import type { ExamLevel } from '../levelConfig';
import { getDiktatForLevel } from '../diktat-data';
import { speak } from '../speech';
import { addXP, XP_VALUES } from '../xpTracking';

interface DiktatProps {
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

function normalize(s: string): string {
  return s.toLowerCase().trim()
    .replace(/[.,!?;:'"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function compareWords(input: string, target: string): { correct: boolean; markedInput: { word: string; ok: boolean }[] } {
  const inputWords = normalize(input).split(' ').filter(Boolean);
  const targetWords = normalize(target).split(' ').filter(Boolean);
  const correct = normalize(input) === normalize(target);
  const markedInput = inputWords.map((w, i) => ({
    word: w,
    ok: w === (targetWords[i] ?? ''),
  }));
  return { correct, markedInput };
}

const SENTENCES_PER_SESSION = 8;

export function Diktat({ onBack, level = 'A1' }: DiktatProps) {
  const allSentences = getDiktatForLevel(level);
  const sentences = useMemo(() => shuffle(allSentences).slice(0, SENTENCES_PER_SESSION), [allSentences]);

  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<'listen' | 'type' | 'checked' | 'done'>('listen');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<ReturnType<typeof compareWords> | null>(null);

  const sentence = sentences[idx];

  async function playAudio() {
    if (isPlaying) return;
    setIsPlaying(true);
    try { await speak(sentence.text); } catch { /* ignore */ }
    setIsPlaying(false);
    setPlayCount(c => c + 1);
    if (phase === 'listen') setPhase('type');
  }

  function check() {
    if (!input.trim()) return;
    const r = compareWords(input, sentence.text);
    setResult(r);
    setPhase('checked');
    if (r.correct) {
      setScore(s => s + 1);
      addXP(XP_VALUES.correctAnswer);
    }
  }

  function next() {
    if (idx < sentences.length - 1) {
      setIdx(i => i + 1);
      setInput('');
      setPhase('listen');
      setPlayCount(0);
      setResult(null);
    } else {
      setPhase('done');
      addXP(XP_VALUES.sessionComplete);
    }
  }

  if (allSentences.length === 0) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-exam-bg p-8">
        <p className="text-gray-500">Keine Diktat-Sätze für dieses Level verfügbar.</p>
        <button onClick={onBack} className="btn-3d btn-3d-secondary mt-4">Zurück</button>
      </div>
    );
  }

  if (phase === 'done') {
    const pct = Math.round((score / sentences.length) * 100);
    return (
      <div className="min-h-dvh flex flex-col bg-exam-bg">
        <div className="bg-white border-b-2 border-card-border px-4 py-3 flex items-center gap-3 shrink-0">
          <button onClick={onBack} className="text-gray-400 hover:text-telc p-1"><ArrowLeft size={20} /></button>
          <h1 className="font-extrabold text-lg">Diktat</h1>
        </div>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="card !rounded-2xl p-8 text-center max-w-sm w-full bounce-in space-y-4">
            <div className="text-5xl font-extrabold">{pct}%</div>
            <div className="text-lg text-gray-600 font-bold">{score} / {sentences.length} richtig</div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setIdx(0); setInput(''); setPhase('listen'); setPlayCount(0); setResult(null); setScore(0); }} className="btn-3d btn-3d-primary">Nochmal</button>
              <button onClick={onBack} className="btn-3d btn-3d-secondary">Zurück</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const progressPct = ((idx + 1) / sentences.length) * 100;

  return (
    <div className="min-h-dvh flex flex-col bg-exam-bg">
      <div className="bg-white border-b-2 border-card-border px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="text-gray-400 hover:text-telc p-1"><ArrowLeft size={20} /></button>
        <h1 className="font-extrabold text-lg">Diktat</h1>
        <div className="flex-1" />
        <span className="text-xs font-bold bg-telc-light text-telc-dark px-2.5 py-1 rounded-full">{idx + 1} / {sentences.length}</span>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 flex flex-col gap-5">
        <div className="progress-track !h-2">
          <div className="progress-fill bg-telc" style={{ width: `${progressPct}%` }} />
        </div>

        {/* Audio player */}
        <div className="card !rounded-2xl p-6 flex flex-col items-center gap-3">
          <button
            onClick={playAudio}
            disabled={isPlaying}
            className="btn-3d btn-3d-blue !rounded-full !w-20 !h-20 !p-0"
          >
            {isPlaying ? (
              <span className="audio-wave text-white"><span /><span /><span /><span /><span /></span>
            ) : (
              <Volume2 size={28} />
            )}
          </button>
          <div className="text-sm font-medium text-gray-500">
            {phase === 'listen' ? 'Klicken zum Anhören' : isPlaying ? 'Hören Sie zu...' : `Noch ${Math.max(0, 2 - playCount)}× wiederholen`}
          </div>
          {phase === 'checked' && (
            <div className={`text-sm font-bold px-3 py-1.5 rounded-xl ${result?.correct ? 'bg-correct/10 text-correct' : 'bg-wrong/10 text-wrong'}`}>
              {sentence.text}
            </div>
          )}
        </div>

        {/* Input */}
        {phase !== 'listen' && (
          <div className="card !rounded-2xl p-5 space-y-3 slide-in">
            <label className="block text-sm font-bold text-gray-600">Schreiben Sie was Sie hören:</label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={phase === 'checked'}
              placeholder="Tippen Sie den Satz..."
              rows={3}
              className="w-full px-4 py-3 text-base allow-select"
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (phase === 'type') check(); }}}
            />

            {phase === 'checked' && result && !result.correct && (
              <div className="text-sm space-y-1 slide-in">
                <div className="font-bold text-gray-600 text-xs uppercase tracking-wider">Deine Antwort:</div>
                <div className="flex flex-wrap gap-1">
                  {result.markedInput.map((w, i) => (
                    <span key={i} className={`font-bold ${w.ok ? 'text-correct' : 'text-wrong'}`}>{w.word}</span>
                  ))}
                </div>
              </div>
            )}

            {phase === 'checked' && (
              <div className="flex items-center gap-2">
                {result?.correct ? <CheckCircle size={18} className="text-correct" /> : <XCircle size={18} className="text-wrong" />}
                <span className={`font-bold text-sm ${result?.correct ? 'text-correct' : 'text-wrong'}`}>
                  {result?.correct ? 'Richtig!' : 'Nicht ganz — schau dir den Satz oben an.'}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => { setInput(''); }}
                disabled={phase === 'checked'}
                className="btn-3d btn-3d-secondary !py-2 !px-3 !text-sm"
              >
                <RotateCcw size={14} /> Löschen
              </button>
              {phase === 'type' ? (
                <button onClick={check} disabled={!input.trim()} className="btn-3d btn-3d-primary !py-2 !px-5 !text-sm">
                  Prüfen <CheckCircle size={14} />
                </button>
              ) : (
                <button onClick={next} className="btn-3d btn-3d-primary !py-2 !px-5 !text-sm">
                  Weiter <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
