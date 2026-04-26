import { useState } from 'react';
import type { HistoryEntry, HistoryStats } from '../history';
import { loadHistory, clearHistory, computeStats } from '../history';
import {
  ArrowLeft, Trophy, XCircle, TrendingUp,
  Trash2, Calendar, Target, Award,
} from 'lucide-react';

interface HistoryProps {
  onBack: () => void;
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

const SECTION_TEXT: Record<string, string> = {
  hoeren: 'text-section-hoeren',
  lesen: 'text-section-lesen-dark',
  schreiben: 'text-section-schreiben',
  sprechen: 'text-telc',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StatsOverview({ stats }: { stats: HistoryStats }) {
  return (
    <div className="space-y-4 fade-in">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card !rounded-2xl p-4 text-center">
          <div className="text-3xl font-extrabold text-telc">{stats.totalTests}</div>
          <div className="text-xs text-gray-400 font-bold mt-1">Tests</div>
        </div>
        <div className="card !rounded-2xl p-4 text-center">
          <div className="text-3xl font-extrabold text-correct">{stats.passed}</div>
          <div className="text-xs text-gray-400 font-bold mt-1">Bestanden</div>
        </div>
        <div className="card !rounded-2xl p-4 text-center">
          <div className="text-3xl font-extrabold">{Math.round(stats.avgPct)}%</div>
          <div className="text-xs text-gray-400 font-bold mt-1">Durchschnitt</div>
        </div>
      </div>

      {/* Best score + pass rate */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card !rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-correct/10 flex items-center justify-center shrink-0">
            <Trophy size={18} className="text-correct" />
          </div>
          <div>
            <div className="text-lg font-extrabold">{stats.bestScore.toFixed(1)}</div>
            <div className="text-xs text-gray-400 font-bold">Bestnote</div>
          </div>
        </div>
        <div className="card !rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-telc/10 flex items-center justify-center shrink-0">
            <Target size={18} className="text-telc" />
          </div>
          <div>
            <div className="text-lg font-extrabold">
              {stats.totalTests > 0 ? Math.round((stats.passed / stats.totalTests) * 100) : 0}%
            </div>
            <div className="text-xs text-gray-400 font-bold">Bestehensquote</div>
          </div>
        </div>
      </div>

      {/* Per-section averages */}
      <div className="card !rounded-2xl p-5">
        <h3 className="font-bold text-sm text-gray-600 mb-4 flex items-center gap-2">
          <TrendingUp size={14} /> Durchschnitt pro Sektion
        </h3>
        <div className="space-y-3">
          {['hoeren', 'lesen', 'schreiben', 'sprechen'].map(sec => {
            const avg = stats.sectionAvg[sec];
            if (!avg) return null;
            return (
              <div key={sec}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`font-bold text-sm ${SECTION_TEXT[sec]}`}>
                    {SECTION_LABELS[sec]}
                  </span>
                  <span className="text-sm font-extrabold">
                    {avg.avgPoints.toFixed(1)} / 15
                  </span>
                </div>
                <div className="progress-track !h-2.5">
                  <div
                    className={`progress-fill ${SECTION_COLORS[sec]}`}
                    style={{ width: `${avg.avgPct}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1 font-medium">
                  {Math.round(avg.passRate)}% bestanden
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EntryCard({ entry }: { entry: HistoryEntry }) {
  const r = entry.result;
  const pct = r.maxPoints > 0 ? Math.round((r.totalPoints / r.maxPoints) * 100) : 0;

  return (
    <div className={`card !rounded-2xl p-4 slide-in ${r.passed ? '' : 'border-wrong/20'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
          r.passed ? 'bg-correct/10' : 'bg-wrong/10'
        }`}>
          {r.passed
            ? <Trophy size={22} className="text-correct" />
            : <XCircle size={22} className="text-wrong" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-extrabold">{r.totalPoints.toFixed(1)} / {r.maxPoints}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              r.passed ? 'bg-correct/10 text-correct' : 'bg-wrong/10 text-wrong'
            }`}>
              {pct}%
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mt-0.5">
            <Calendar size={11} />
            {formatDate(entry.date)}
          </div>
        </div>
      </div>

      {/* Mini section bars */}
      <div className="grid grid-cols-4 gap-2 mt-3">
        {r.sections.map(s => (
          <div key={s.section} className="text-center">
            <div className="progress-track !h-1.5 mb-1">
              <div
                className={`progress-fill ${SECTION_COLORS[s.section]}`}
                style={{ width: `${s.maxPoints > 0 ? (s.points / s.maxPoints) * 100 : 0}%` }}
              />
            </div>
            <div className="text-[10px] font-bold text-gray-400">
              {SECTION_LABELS[s.section]}
            </div>
            <div className="text-xs font-extrabold">
              {s.points.toFixed(1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function History({ onBack }: HistoryProps) {
  const [entries, setEntries] = useState(() => loadHistory());
  const stats = computeStats(entries);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleClear() {
    clearHistory();
    setEntries([]);
    setShowConfirm(false);
  }

  return (
    <div className="min-h-dvh flex flex-col bg-exam-bg">
      {/* Header */}
      <div className="bg-white border-b-2 border-card-border px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="text-gray-400 hover:text-telc transition-colors p-1">
          <ArrowLeft size={20} />
        </button>
        <Award size={20} className="text-telc" />
        <h1 className="font-extrabold text-lg">Prüfungsverlauf</h1>
        <div className="flex-1" />
        {entries.length > 0 && !showConfirm && (
          <button
            onClick={() => setShowConfirm(true)}
            className="text-gray-400 hover:text-wrong transition-colors p-1"
            title="Verlauf löschen"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-4 space-y-4">
        {/* Delete confirmation */}
        {showConfirm && (
          <div className="card !rounded-2xl p-4 !border-wrong/30 !bg-wrong/5 flex items-center justify-between gap-3 fade-in">
            <span className="text-sm font-bold text-wrong">Gesamten Verlauf löschen?</span>
            <div className="flex gap-2">
              <button onClick={handleClear} className="btn-3d btn-3d-danger !py-1.5 !px-3 !text-xs">
                Löschen
              </button>
              <button onClick={() => setShowConfirm(false)} className="btn-3d btn-3d-secondary !py-1.5 !px-3 !text-xs">
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="card !rounded-2xl p-12 text-center fade-in">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Award size={28} className="text-gray-300" />
            </div>
            <p className="font-bold text-gray-400 text-lg mb-1">Noch keine Tests</p>
            <p className="text-sm text-gray-400">
              Absolviere eine Prüfung im Prüfungsmodus, um deinen Fortschritt zu sehen.
            </p>
          </div>
        ) : (
          <>
            {stats && <StatsOverview stats={stats} />}

            <h3 className="font-bold text-sm text-gray-500 pt-2 flex items-center gap-2">
              <Calendar size={14} /> Letzte Tests
            </h3>

            <div className="space-y-3">
              {entries.map(entry => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
