import { ArrowLeft, AlertCircle, BookOpen, Brain, Headphones, PenTool } from 'lucide-react';
import { getMistakes, grammarMistakeSummary } from '../mistakeTracking';
import { getLookedUpWords } from '../vocabTracking';
import { loadHistory, computeStats } from '../history';
import { type ExamLevel, LEVEL_CONFIGS } from '../levelConfig';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../grammar-games-data';
import type { Section } from '../types';

interface WeaknessDetailProps {
  level: ExamLevel;
  onPractice: (section: Section) => void;
  onStudy: () => void;
  onBack: () => void;
}

const SECTION_LABELS: Record<Section, string> = {
  hoeren: 'Hören', lesen: 'Lesen', schreiben: 'Schreiben', sprechen: 'Sprechen',
};

const SECTION_TIPS: Record<Section, { title: string; tips: string[] }> = {
  hoeren: {
    title: 'Was du im Hören üben solltest',
    tips: [
      'Achte auf Zahlen, Uhrzeiten und Datumsangaben — sie sind häufige Fehlerquellen',
      'Konzentriere dich beim ersten Hören auf die Hauptinformation, beim zweiten auf Details',
      'Lies die Frage BEVOR das Audio startet, damit du weißt, worauf du achten musst',
    ],
  },
  lesen: {
    title: 'Was du im Lesen üben solltest',
    tips: [
      'Scanne den Text zuerst nach Schlüsselwörtern aus der Frage',
      'Lies nicht Wort für Wort — suche nach Bedeutungsblöcken',
      'Achte auf Verneinungen (nicht, kein, nie) — sie ändern die Bedeutung komplett',
    ],
  },
  schreiben: {
    title: 'Was du im Schreiben üben solltest',
    tips: [
      'Verbendungen: ich -e, du -st, er/sie -t, wir -en, ihr -t, sie/Sie -en',
      'Akkusativ: maskulin ändert sich (der→den, ein→einen)',
      'Trennbare Verben: Präfix ans Satzende (Ich rufe an. / Mach das Licht an.)',
    ],
  },
  sprechen: {
    title: 'Was du im Sprechen üben solltest',
    tips: [
      'Antworte immer in vollständigen Sätzen, nicht nur mit einem Wort',
      'Nutze Verbindungswörter: und, aber, weil, dann, danach',
      'Sprich langsam und deutlich — Aussprache zählt mehr als Geschwindigkeit',
    ],
  },
};

export function WeaknessDetail({ level, onPractice, onStudy, onBack }: WeaknessDetailProps) {
  const cfg = LEVEL_CONFIGS[level];
  const history = loadHistory().filter(e => (e.level ?? 'A1') === level);
  const stats = computeStats(history);
  const grammarMistakes = grammarMistakeSummary(level);
  const allMistakes = getMistakes(level);
  const lookedUpWords = getLookedUpWords().slice(0, 20);

  // Find weakest sections
  const weakSections = (Object.entries(stats?.sectionAvg ?? {}) as [Section, { passRate: number }][])
    .filter(([, v]) => v.passRate < 80)
    .sort(([, a], [, b]) => a.passRate - b.passRate);

  // Top grammar categories with most mistakes
  const topGrammarWeak = Object.entries(grammarMistakes)
    .sort(([, a], [, b]) => b.wrong - a.wrong)
    .slice(0, 5);

  // Recent wrong Hören/Lesen questions
  const recentMCMistakes = allMistakes
    .filter(e => e.type === 'hoeren' || e.type === 'lesen')
    .slice(0, 10);

  return (
    <div className="min-h-dvh flex flex-col bg-exam-bg">
      <div className="bg-white border-b-2 border-card-border px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="text-gray-400 hover:text-telc p-1"><ArrowLeft size={20} /></button>
        <h1 className="font-extrabold text-lg">Meine Schwachstellen</h1>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.bgLight} ${cfg.colorClass}`}>
          {cfg.label}
        </span>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-5">

        {/* No data yet */}
        {history.length === 0 && allMistakes.length === 0 && (
          <div className="card !rounded-2xl p-8 text-center">
            <AlertCircle size={32} className="text-gray-300 mx-auto mb-3" />
            <div className="font-bold text-gray-500 mb-1">Noch keine Daten</div>
            <div className="text-sm text-gray-400">
              Mache einen Prüfungstest oder das Grammatik-Quiz um Auswertungen zu sehen.
            </div>
          </div>
        )}

        {/* Weak sections from exam history */}
        {weakSections.length > 0 && (
          <section className="card !rounded-2xl p-5 space-y-4">
            <h2 className="font-extrabold text-gray-700 flex items-center gap-2">
              <AlertCircle size={16} className="text-wrong" />
              Prüfungsteile mit Nachholbedarf
            </h2>
            {weakSections.map(([sec, { passRate }]) => {
              const tips = SECTION_TIPS[sec];
              return (
                <div key={sec} className="border-2 border-card-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-700">{SECTION_LABELS[sec]}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        passRate < 40 ? 'bg-wrong/10 text-wrong' : 'bg-section-lesen-light text-section-lesen-dark'
                      }`}>
                        {Math.round(passRate)}% Bestehensquote
                      </span>
                      <button
                        onClick={() => onPractice(sec)}
                        className="btn-3d btn-3d-primary !py-1 !px-3 !text-xs"
                      >
                        Üben
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{tips.title}</div>
                    {tips.tips.map((tip, i) => (
                      <div key={i} className="flex gap-2 text-sm text-gray-600">
                        <span className="text-telc font-bold shrink-0 mt-0.5">→</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Grammar category mistakes */}
        {topGrammarWeak.length > 0 && (
          <section className="card !rounded-2xl p-5 space-y-3">
            <h2 className="font-extrabold text-gray-700 flex items-center gap-2">
              <Brain size={16} className="text-section-schreiben" />
              Grammatik-Schwachstellen
            </h2>
            <div className="space-y-2">
              {topGrammarWeak.map(([cat, { wrong }]) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] ?? 'bg-gray-200 text-gray-600'}`}>
                    {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat}
                  </span>
                  <div className="flex-1 progress-track !h-2">
                    <div
                      className="progress-fill bg-wrong"
                      style={{ width: `${Math.min(100, wrong * 10)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-wrong shrink-0">{wrong}×</span>
                </div>
              ))}
            </div>
            <button
              onClick={onStudy}
              className="btn-3d btn-3d-secondary w-full !py-2 !text-sm mt-2"
            >
              <Brain size={14} /> Grammatik-Quiz starten
            </button>
          </section>
        )}

        {/* Recent wrong MC questions */}
        {recentMCMistakes.length > 0 && (
          <section className="card !rounded-2xl p-5 space-y-3">
            <h2 className="font-extrabold text-gray-700 flex items-center gap-2">
              <Headphones size={16} className="text-section-hoeren" />
              Zuletzt falsch beantwortet
            </h2>
            <div className="space-y-2">
              {recentMCMistakes.map(e => (
                <div key={e.id} className="bg-exam-bg rounded-xl p-3 text-sm">
                  <div className="font-bold text-gray-700 mb-1">{e.question}</div>
                  <div className="flex gap-4">
                    <span className="text-wrong">✗ {e.wrong}</span>
                    <span className="text-correct">✓ {e.correct}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Looked-up vocabulary */}
        {lookedUpWords.length > 0 && (
          <section className="card !rounded-2xl p-5 space-y-3">
            <h2 className="font-extrabold text-gray-700 flex items-center gap-2">
              <BookOpen size={16} className="text-section-lesen-dark" />
              Nachgeschlagene Wörter — übe diese
            </h2>
            <div className="flex flex-wrap gap-2">
              {lookedUpWords.map(w => (
                <span key={w} className="px-3 py-1.5 rounded-lg text-sm font-bold bg-section-lesen-light text-section-lesen-dark border border-section-lesen/20">
                  {w}
                </span>
              ))}
            </div>
            <button onClick={onStudy} className="btn-3d btn-3d-secondary w-full !py-2 !text-sm">
              <PenTool size={14} /> Karteikarten öffnen
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
