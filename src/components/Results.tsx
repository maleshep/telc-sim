import type { ExamResult, SectionScore } from '../types';
import { CheckCircle, XCircle, RotateCcw, Home as HomeIcon, Award, Trophy } from 'lucide-react';

interface ResultsProps {
  result: ExamResult;
  mode?: 'exam' | 'practice';
  onRestart: () => void;
  onHome: () => void;
}

const SECTION_LABELS: Record<string, string> = {
  hoeren: 'Hören',
  lesen: 'Lesen',
  schreiben: 'Schreiben',
  sprechen: 'Sprechen',
};

const SECTION_COLORS: Record<string, string> = {
  hoeren: 'bg-section-hoeren',
  lesen: 'bg-section-lesen',
  schreiben: 'bg-section-schreiben',
  sprechen: 'bg-telc',
};

const SECTION_TEXT_COLORS: Record<string, string> = {
  hoeren: 'text-section-hoeren',
  lesen: 'text-section-lesen-dark',
  schreiben: 'text-section-schreiben',
  sprechen: 'text-telc',
};

function SectionCard({ score }: { score: SectionScore }) {
  const pct = score.maxPoints > 0 ? (score.points / score.maxPoints) * 100 : 0;
  const color = SECTION_COLORS[score.section] || 'bg-gray-500';
  const textColor = SECTION_TEXT_COLORS[score.section] || 'text-gray-600';

  return (
    <div className={`card !rounded-2xl p-5 slide-in ${score.passed ? '' : 'border-wrong/30'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`font-extrabold ${textColor}`}>{SECTION_LABELS[score.section]}</span>
        {score.passed ? (
          <span className="bg-correct/10 text-correct p-1.5 rounded-full">
            <CheckCircle size={18} />
          </span>
        ) : (
          <span className="bg-wrong/10 text-wrong p-1.5 rounded-full">
            <XCircle size={18} />
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="progress-track !h-3 mb-3">
        <div
          className={`progress-fill ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-gray-500 font-medium">
          {score.correct !== undefined && score.total !== undefined && score.total > 0
            ? `${score.correct}/${score.total} richtig`
            : ''}
        </span>
        <span className="font-extrabold">
          {score.points.toFixed(1)} / {score.maxPoints} Pkt.
        </span>
      </div>
    </div>
  );
}

function getGrade(points: number): { grade: string; label: string } {
  if (points >= 54) return { grade: 'sehr gut', label: '1 — sehr gut' };
  if (points >= 48) return { grade: 'gut', label: '2 — gut' };
  if (points >= 42) return { grade: 'befriedigend', label: '3 — befriedigend' };
  if (points >= 36) return { grade: 'ausreichend', label: '4 — ausreichend' };
  return { grade: 'nicht bestanden', label: '5 — nicht bestanden' };
}

export function Results({ result, mode = 'exam', onRestart, onHome }: ResultsProps) {
  const totalPct = result.maxPoints > 0
    ? Math.round((result.totalPoints / result.maxPoints) * 100)
    : 0;
  const grade = getGrade(result.totalPoints);
  const isPractice = mode === 'practice';

  const bannerTitle = isPractice
    ? result.passed ? 'Gut gemacht!' : 'Weiter üben!'
    : result.passed ? 'Bestanden!' : 'Nicht bestanden';

  return (
    <div className="min-h-dvh bg-exam-bg">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Overall result */}
        <div className={`card !rounded-2xl p-8 text-center bounce-in ${
          result.passed ? '!border-correct/30 !bg-correct/5' : '!border-wrong/30 !bg-wrong/5'
        }`}>
          {isPractice && (
            <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-section-lesen-light text-section-lesen-dark mb-4">
              Übungsergebnis
            </div>
          )}
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
            result.passed ? 'bg-correct/10' : 'bg-wrong/10'
          }`}>
            {result.passed ? (
              <Trophy size={44} className="text-correct" />
            ) : (
              <XCircle size={44} className="text-wrong" />
            )}
          </div>
          <h2 className="text-3xl font-extrabold mb-2">{bannerTitle}</h2>
          <div className="text-5xl font-extrabold mb-2">
            {result.totalPoints.toFixed(1)} <span className="text-2xl text-gray-400">/ {result.maxPoints}</span>
          </div>
          {!isPractice && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <Award size={18} className={result.passed ? 'text-correct' : 'text-gray-400'} />
              <span className="font-bold text-gray-700 text-lg">{grade.label}</span>
            </div>
          )}
          <div className="text-sm text-gray-500 mt-1 font-medium">
            {isPractice
              ? `${totalPct}% — Bestehensgrenze für diese Sektion: 60%`
              : `${totalPct}% — Bestehensgrenze: 60% (36/60 Punkte)`
            }
          </div>
        </div>

        {/* Section breakdown */}
        <div className={result.sections.length === 1 ? '' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
          {result.sections.map(score => (
            <SectionCard key={score.section} score={score} />
          ))}
        </div>

        {/* Sprechen feedback */}
        {result.sprechenFeedback && (
          <div className="card !rounded-2xl p-6">
            <h3 className="font-bold mb-2 text-telc">Feedback — Sprechen</h3>
            <p className="text-gray-700 leading-relaxed">{result.sprechenFeedback}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={onRestart}
            className="btn-3d btn-3d-primary"
          >
            <RotateCcw size={18} />
            {isPractice ? 'Nochmal üben' : 'Nochmal versuchen'}
          </button>
          <button
            onClick={onHome}
            className="btn-3d btn-3d-secondary"
          >
            <HomeIcon size={18} />
            Zur Startseite
          </button>
        </div>
      </div>
    </div>
  );
}
