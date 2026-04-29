import { useState, useMemo } from 'react';
import { ArrowLeft, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import type { ExamLevel } from '../levelConfig';
import { getPassagesForLevel } from '../lueckentext-data';
import { addXP, XP_VALUES } from '../xpTracking';

interface LueckentextProps {
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

export function Lueckentext({ onBack, level = 'A1' }: LueckentextProps) {
  const passages = useMemo(() => shuffle(getPassagesForLevel(level)), [level]);
  const [passageIdx, setPassageIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const [_score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const passage = passages[passageIdx];

  if (!passage) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-exam-bg p-8">
        <p className="text-gray-500">Keine Texte für dieses Level verfügbar.</p>
        <button onClick={onBack} className="btn-3d btn-3d-secondary mt-4">Zurück</button>
      </div>
    );
  }

  // Render text with blanks replaced by selected answer or placeholder
  function renderText() {
    const parts = passage.text.split(/\{(\d+)\}/);
    return parts.map((part, i) => {
      if (i % 2 === 0) return <span key={i}>{part}</span>;
      const blankIdx = parseInt(part);
      const blank = passage.blanks[blankIdx];
      const answer = answers[blankIdx];
      const isCorrect = answer === blank?.correct;

      if (!checked) {
        return (
          <span key={i} className={`inline-block mx-0.5 px-2 py-0.5 rounded border-b-2 font-bold text-sm align-baseline ${
            answer ? 'border-telc bg-telc-light text-telc-dark' : 'border-dashed border-gray-300 text-gray-400 min-w-[60px]'
          }`}>
            {answer || '___'}
          </span>
        );
      }
      return (
        <span key={i} className={`inline-block mx-0.5 px-2 py-0.5 rounded border-b-2 font-bold text-sm align-baseline ${
          isCorrect ? 'border-correct bg-correct/10 text-correct' : 'border-wrong bg-wrong/10 text-wrong'
        }`}>
          {answer || '___'}
          {!isCorrect && <span className="ml-1 text-gray-600">({blank?.correct})</span>}
        </span>
      );
    });
  }

  function checkAnswers() {
    let correct = 0;
    passage.blanks.forEach(b => {
      if (answers[b.index] === b.correct) { correct++; addXP(XP_VALUES.correctAnswer); }
    });
    setScore(correct);
    setTotalScore(t => t + correct);
    setChecked(true);
  }

  function next() {
    if (passageIdx < passages.length - 1) {
      setPassageIdx(i => i + 1);
      setAnswers({});
      setChecked(false);
      setScore(0);
    } else {
      setFinished(true);
      addXP(XP_VALUES.sessionComplete);
    }
  }

  if (finished) {
    const maxPossible = passages.reduce((s, p) => s + p.blanks.length, 0);
    const pct = Math.round((totalScore / maxPossible) * 100);
    return (
      <div className="min-h-dvh flex flex-col bg-exam-bg">
        <div className="bg-white border-b-2 border-card-border px-4 py-3 flex items-center gap-3 shrink-0">
          <button onClick={onBack} className="text-gray-400 hover:text-telc p-1"><ArrowLeft size={20} /></button>
          <h1 className="font-extrabold text-lg">Lückentext</h1>
        </div>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="card !rounded-2xl p-8 text-center max-w-sm w-full bounce-in space-y-4">
            <div className="text-5xl font-extrabold">{pct}%</div>
            <div className="text-lg text-gray-600 font-bold">{totalScore} / {maxPossible} Lücken richtig</div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setPassageIdx(0); setAnswers({}); setChecked(false); setScore(0); setTotalScore(0); setFinished(false); }} className="btn-3d btn-3d-primary">Nochmal</button>
              <button onClick={onBack} className="btn-3d btn-3d-secondary">Zurück</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const allAnswered = passage.blanks.every(b => answers[b.index] !== undefined);

  return (
    <div className="min-h-dvh flex flex-col bg-exam-bg">
      <div className="bg-white border-b-2 border-card-border px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="text-gray-400 hover:text-telc p-1"><ArrowLeft size={20} /></button>
        <h1 className="font-extrabold text-lg">Lückentext</h1>
        <span className="text-xs text-gray-400 font-medium ml-1">— {passage.title}</span>
        <div className="flex-1" />
        <span className="text-xs font-bold bg-telc-light text-telc-dark px-2.5 py-1 rounded-full">
          {passageIdx + 1} / {passages.length}
        </span>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 flex flex-col gap-4">
        {/* Text with inline blanks */}
        <div className="card !rounded-2xl p-5 text-base leading-loose text-gray-800 font-medium">
          {renderText()}
        </div>

        {/* Option buttons per blank */}
        {!checked && (
          <div className="space-y-3">
            {passage.blanks.map(blank => (
              <div key={blank.index} className="card !rounded-xl p-3">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Lücke {blank.index + 1}</div>
                <div className="flex gap-2 flex-wrap">
                  {blank.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setAnswers(a => ({ ...a, [blank.index]: opt }))}
                      className={`px-3 py-1.5 rounded-lg text-sm font-bold border-2 transition-all ${
                        answers[blank.index] === opt
                          ? 'border-telc bg-telc-light text-telc-dark'
                          : 'border-card-border bg-white text-gray-600 hover:border-telc/40'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Explanations after check */}
        {checked && (
          <div className="space-y-2 slide-in">
            {passage.blanks.map(blank => {
              const ok = answers[blank.index] === blank.correct;
              return (
                <div key={blank.index} className={`card !rounded-xl p-3 ${ok ? '!border-correct/20 !bg-correct/5' : '!border-wrong/20 !bg-wrong/5'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {ok ? <CheckCircle size={14} className="text-correct" /> : <XCircle size={14} className="text-wrong" />}
                    <span className="font-bold text-sm">{blank.correct}</span>
                  </div>
                  <div className="text-xs text-gray-600">{blank.explanation}</div>
                  <div className="text-xs text-gray-400 italic">{blank.explanationEn}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between">
          {!checked ? (
            <button onClick={checkAnswers} disabled={!allAnswered} className="btn-3d btn-3d-primary w-full !py-3">
              Prüfen <CheckCircle size={16} />
            </button>
          ) : (
            <button onClick={next} className="btn-3d btn-3d-primary w-full !py-3">
              {passageIdx < passages.length - 1 ? 'Nächster Text' : 'Fertig'} <ChevronRight size={16} />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
