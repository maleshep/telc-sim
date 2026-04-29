import { useState } from 'react';
import type { TelcTest, Section } from '../types';
import {
  Headphones, BookOpen, PenTool, MessageSquare,
  ChevronRight, Play, BookMarked, GraduationCap, Languages,
  Sparkles, Award, AlertCircle, CheckCircle2, Lock,
} from 'lucide-react';
import { isTTSAvailable, isSTTAvailable, isUsingFallbackTTS } from '../speech';
import { isLLMConfigured } from '../llm';
import { loadHistory, computeStats, computeLevelProgress } from '../history';
import { type ExamLevel, ALL_LEVELS, LEVEL_CONFIGS } from '../levelConfig';

interface HomeProps {
  tests: TelcTest[];
  level: ExamLevel;
  onLevelChange: (l: ExamLevel) => void;
  onStartExam: () => void;        // goes to ExamPicker
  onPractice: (testId: number, section: Section) => void;
  onStudy: () => void;
  onHistory: () => void;
  onWeakness: () => void;
}

// What each section weakness actually means for the learner
const SECTION_WEAKNESSES: Record<string, string> = {
  hoeren: 'Du übersiehst oft Detailangaben in kurzen Dialogen. Übe aktives Zuhören — konzentriere dich auf Zahlen, Orte und Zeitangaben.',
  lesen: 'Du hast Schwierigkeiten, gezielt Informationen in Texten zu finden. Übe das schnelle Scannen nach Schlüsselwörtern.',
  schreiben: 'Deine Texte enthalten noch grammatische oder formale Fehler. Achte auf Satzstruktur, Verbendungen und Satzzeichen.',
  sprechen: 'Du zögerst bei spontanen Antworten oder verwendest zu einfache Strukturen. Übe freies Sprechen zu Alltagsthemen.',
};

const SECTION_INFO: {
  key: Section;
  icon: typeof Headphones;
  label: string;
  desc: string;
  color: string;
  bgLight: string;
  borderColor: string;
}[] = [
  { key: 'hoeren', icon: Headphones, label: 'Hören', desc: '3 Teile — Audioverstehen', color: 'text-section-hoeren', bgLight: 'bg-section-hoeren-light', borderColor: 'border-section-hoeren/30' },
  { key: 'lesen', icon: BookOpen, label: 'Lesen', desc: '3 Teile — Leseverstehen', color: 'text-section-lesen', bgLight: 'bg-section-lesen-light', borderColor: 'border-section-lesen/30' },
  { key: 'schreiben', icon: PenTool, label: 'Schreiben', desc: '2 Teile — Schriftlicher Ausdruck', color: 'text-section-schreiben', bgLight: 'bg-section-schreiben-light', borderColor: 'border-section-schreiben/30' },
  { key: 'sprechen', icon: MessageSquare, label: 'Sprechen', desc: '3 Teile — Mündliche Prüfung', color: 'text-telc', bgLight: 'bg-telc-light', borderColor: 'border-telc/20' },
];

const SECTION_ICON_BG: Record<string, string> = {
  hoeren: 'bg-section-hoeren',
  lesen: 'bg-section-lesen',
  schreiben: 'bg-section-schreiben',
  sprechen: 'bg-telc',
};

export function Home({ tests, level, onLevelChange, onStartExam, onPractice, onStudy, onHistory, onWeakness }: HomeProps) {
  const [selectedTest] = useState(tests[0]?.id ?? 1);
  const tts = isTTSAvailable();
  const stt = isSTTAvailable();
  const llm = isLLMConfigured();
  const history = loadHistory();
  const stats = computeStats(history.filter(e => (e.level ?? 'A1') === level));
  const levelProgress = computeLevelProgress(history);
  const cfg = LEVEL_CONFIGS[level];

  // Find the single weakest section (lowest pass rate, below 60%)
  const weakestSection = (() => {
    if (!stats) return null;
    const ordered = (['hoeren', 'lesen', 'schreiben', 'sprechen'] as Section[])
      .filter(sec => stats.sectionAvg[sec] && stats.sectionAvg[sec].passRate < 60)
      .sort((a, b) => stats.sectionAvg[a].passRate - stats.sectionAvg[b].passRate);
    return ordered[0] ?? null;
  })();

  const weakInfo = weakestSection ? SECTION_INFO.find(s => s.key === weakestSection) : null;

  return (
    <div className="min-h-dvh flex flex-col bg-exam-bg">
      {/* Compact header */}
      <header className="bg-gradient-to-br from-telc via-telc-dark to-telc-darker text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-8 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
        </div>

        {/* Brand row */}
        <div className="relative flex items-center gap-3 px-4 py-3">
          <img
            src="/logo.png"
            alt="TELC Sim"
            className="w-10 h-10 rounded-xl shadow-lg shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-base leading-tight">TELC Sim</div>
            <div className="text-white/55 text-[10px] font-semibold tracking-widest uppercase">
              {cfg.name} · {cfg.subtitle}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Sparkles size={11} className="text-white/40" />
            <span className="text-[11px] font-semibold text-white/60">Prüfungssimulator</span>
          </div>
        </div>

        {/* Level selector — inside the green header, seamless */}
        <div className="relative flex items-center gap-1 pb-3">
          {ALL_LEVELS.map((lv, i) => {
            const prog = levelProgress[lv];
            const isActive = lv === level;
            const isUnlocked = i === 0 || levelProgress[ALL_LEVELS[i - 1]].badge === 'passed';
            return (
              <div key={lv} className="flex items-center flex-1 min-w-0">
                <button
                  onClick={() => onLevelChange(lv)}
                  className={`flex-1 flex flex-col items-center py-1.5 px-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-white/20 backdrop-blur-sm border border-white/30'
                      : 'hover:bg-white/10 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {prog.badge === 'passed' ? (
                      <CheckCircle2 size={11} className="text-white/90" />
                    ) : !isUnlocked ? (
                      <Lock size={10} className="text-white/30" />
                    ) : null}
                    <span className={`text-xs font-extrabold ${isActive ? 'text-white' : 'text-white/50'}`}>
                      {lv}
                    </span>
                  </div>
                  {prog.tests > 0 ? (
                    <span className="text-[9px] font-bold text-white/50">{Math.round(prog.passRate)}%</span>
                  ) : (
                    <span className="text-[9px] text-white/25">—</span>
                  )}
                </button>
                {i < ALL_LEVELS.length - 1 && (
                  <div className={`w-3 h-px shrink-0 ${prog.badge === 'passed' ? 'bg-white/40' : 'bg-white/15'}`} />
                )}
              </div>
            );
          })}
        </div>
      </header>


      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Capability checks */}
        <div className="flex flex-wrap gap-2 justify-center text-xs fade-in">
          <span className={`px-3 py-1.5 rounded-full font-semibold ${
            tts
              ? isUsingFallbackTTS()
                ? 'bg-section-lesen-light text-section-lesen-dark'
                : 'bg-correct/10 text-correct-dark'
              : 'bg-wrong/10 text-wrong-dark'
          }`}>
            {tts ? (isUsingFallbackTTS() ? '\u26A0 Sprache (Browser)' : '\u2713 Sprache') : '\u2717 Sprache'}
          </span>
          <span className={`px-3 py-1.5 rounded-full font-semibold ${stt ? 'bg-correct/10 text-correct-dark' : 'bg-wrong/10 text-wrong-dark'}`}>
            {stt ? '\u2713' : '\u2717'} Mikrofon
          </span>
          <span className={`px-3 py-1.5 rounded-full font-semibold ${llm ? 'bg-correct/10 text-correct-dark' : 'bg-section-lesen-light text-section-lesen-dark'}`}>
            {llm ? '\u2713' : '\u26A0'} KI-Prüfer
          </span>
        </div>

        {/* No tests for this level yet */}
        {tests.length === 0 && (
          <div className="card !rounded-2xl p-8 text-center fade-in !border-dashed">
            <div className="text-4xl mb-3">🚧</div>
            <div className="font-extrabold text-gray-600 mb-1">{cfg.label} — Inhalt folgt bald</div>
            <div className="text-sm text-gray-400">
              Prüfungsfragen für {cfg.name} werden gerade erstellt.
              In der Zwischenzeit kannst du im Lernmaterial üben.
            </div>
          </div>
        )}

        {/* Prüfungsmodus — no test selector here, that's in ExamPicker */}
        {tests.length > 0 && (
          <button
            onClick={onStartExam}
            className="btn-3d btn-3d-primary w-full !py-5 !px-6 !rounded-2xl !text-lg group fade-in"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <GraduationCap size={24} />
                </div>
                <div className="text-left">
                  <div className="font-extrabold text-lg">Prüfungsmodus</div>
                  <div className="text-sm text-white/70 font-normal">
                    {tests.length} {tests.length === 1 ? 'Test' : 'Tests'} verfügbar — alle 4 Teile
                  </div>
                </div>
              </div>
              <Play size={22} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        )}

        {/* Section browser (Übungsmodus) */}
        <section className="fade-in">
          <div className="flex items-center gap-2 mb-3">
            <BookMarked size={18} className="text-gray-400" />
            <h2 className="font-bold text-gray-700">Übungsmodus</h2>
            <span className="text-xs text-gray-400 ml-1">— Einzelne Teile üben</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SECTION_INFO.map(({ key, icon: Icon, label, desc, color, bgLight, borderColor }) => (
              <button
                key={key}
                onClick={() => onPractice(selectedTest, key)}
                className={`card card-interactive flex items-center gap-4 !rounded-2xl p-4 text-left ${bgLight} border-2 ${borderColor}`}
              >
                <div className={`w-11 h-11 rounded-xl ${SECTION_ICON_BG[key]} text-white flex items-center justify-center shadow-sm`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-bold text-sm ${color}`}>{label}</div>
                  <div className="text-xs text-gray-500 truncate">{desc}</div>
                </div>
                <ChevronRight size={16} className="text-gray-300 shrink-0" />
              </button>
            ))}
          </div>
        </section>

        {/* Weak area nudge — links to full weakness analysis */}
        {weakInfo && weakestSection && stats && (
          <div className="card !rounded-2xl p-4 !border-wrong/25 !bg-wrong/5 fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-wrong/10 flex items-center justify-center shrink-0">
                <AlertCircle size={20} className="text-wrong" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-wrong">Verbesserungspotential — {weakInfo.label}</div>
                <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {SECTION_WEAKNESSES[weakestSection]}
                </div>
              </div>
              <button
                onClick={onWeakness}
                className="btn-3d btn-3d-danger !py-1.5 !px-3 !text-xs shrink-0"
              >
                Analyse
              </button>
            </div>
          </div>
        )}

        {/* Study materials + History row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 fade-in">
          <button
            onClick={onStudy}
            className="card card-interactive flex items-center gap-4 p-4 text-left !rounded-2xl group"
          >
            <div className="w-11 h-11 rounded-xl bg-section-schreiben text-white flex items-center justify-center shadow-sm shrink-0">
              <Languages size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm group-hover:text-section-schreiben transition-colors">Lernmaterial</div>
              <div className="text-xs text-gray-400 truncate">Wortschatz, Grammatik & Spiele</div>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:text-section-schreiben transition-colors shrink-0" />
          </button>

          <button
            onClick={onHistory}
            className="card card-interactive flex items-center gap-4 p-4 text-left !rounded-2xl group"
          >
            <div className="w-11 h-11 rounded-xl bg-telc text-white flex items-center justify-center shadow-sm shrink-0">
              <Award size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm group-hover:text-telc transition-colors">Verlauf</div>
              <div className="text-xs text-gray-400 truncate">
                {stats
                  ? `${stats.totalTests} Einträge — ${Math.round(stats.avgPct)}% Durchschnitt`
                  : 'Noch keine Tests absolviert'
                }
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:text-telc transition-colors shrink-0" />
          </button>
        </div>

        {/* Exam structure info */}
        <section className="card !rounded-2xl p-6 fade-in">
          <h3 className="font-bold text-sm text-gray-600 mb-4">Prüfungsaufbau — telc Deutsch A1</h3>
          <div className="grid grid-cols-4 gap-3 text-center text-xs">
            {SECTION_INFO.map(({ key, icon: Icon, label, color }) => (
              <div key={label} className="p-3 rounded-xl bg-exam-bg">
                <div className={`w-10 h-10 rounded-xl ${SECTION_ICON_BG[key]} text-white flex items-center justify-center mx-auto mb-2 shadow-sm`}>
                  <Icon size={18} />
                </div>
                <div className={`font-bold ${color}`}>{label}</div>
                <div className="text-gray-400 mt-0.5">15 Pkt.</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-400 text-center mt-4 pt-3 border-t border-card-border">
            {cfg.maxPoints} Punkte gesamt — bestanden ab {cfg.passPoints} Punkten (60%)
          </div>
        </section>

        {/* Browser hint */}
        {!stt && (
          <div className="bg-section-lesen-light border-2 border-section-lesen/20 rounded-2xl p-4 text-xs text-section-lesen-dark font-medium fade-in">
            <strong>Hinweis:</strong> Spracherkennung ist in diesem Browser nicht verfügbar.
            Sprechen funktioniert am besten in Chrome oder Edge.
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-gray-400 py-4">
        Nur zu Übungszwecken — kein offizielles telc-Produkt.
      </footer>
    </div>
  );
}
