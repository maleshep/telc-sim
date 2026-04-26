import { useState } from 'react';
import type { TelcTest, Section } from '../types';
import {
  Headphones, BookOpen, PenTool, MessageSquare,
  ChevronRight, Play, BookMarked, GraduationCap, Languages,
  Sparkles, Award, AlertCircle,
} from 'lucide-react';
import { isTTSAvailable, isSTTAvailable, isUsingFallbackTTS } from '../speech';
import { isLLMConfigured } from '../llm';
import { loadHistory, computeStats } from '../history';

interface HomeProps {
  tests: TelcTest[];
  onStartExam: (testId: number) => void;
  onPractice: (testId: number, section: Section) => void;
  onStudy: () => void;
  onHistory: () => void;
}

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

export function Home({ tests, onStartExam, onPractice, onStudy, onHistory }: HomeProps) {
  const [selectedTest, setSelectedTest] = useState(tests[0]?.id ?? 1);
  const tts = isTTSAvailable();
  const stt = isSTTAvailable();
  const llm = isLLMConfigured();
  const history = loadHistory();
  const stats = computeStats(history);

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
      {/* Hero Header */}
      <header className="bg-gradient-to-br from-telc via-telc-dark to-telc-darker text-white py-10 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-8 w-24 h-24 rounded-full bg-white/20 blur-xl" />
          <div className="absolute bottom-2 right-12 w-32 h-32 rounded-full bg-white/15 blur-2xl" />
        </div>
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <Sparkles size={14} />
            Prüfungssimulator
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            telc Deutsch A1
          </h1>
          <p className="mt-2 text-white/70 text-sm">
            Bereite dich auf die Prüfung vor — mit KI-gestützter Bewertung
          </p>
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

        {/* Test selector */}
        <div className="flex gap-2 justify-center fade-in">
          {tests.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTest(t.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                selectedTest === t.id
                  ? 'bg-telc text-white shadow-md shadow-telc/20 scale-105'
                  : 'bg-white text-gray-500 border-2 border-card-border hover:border-telc/40 hover:text-telc'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Full exam start — 3D button style */}
        <button
          onClick={() => onStartExam(selectedTest)}
          className="btn-3d btn-3d-primary w-full !py-5 !px-6 !rounded-2xl !text-lg group fade-in"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <GraduationCap size={24} />
              </div>
              <div className="text-left">
                <div className="font-extrabold text-lg">
                  Prüfungsmodus
                </div>
                <div className="text-sm text-white/70 font-normal">
                  Alle 4 Teile — mit Zeitlimit
                </div>
              </div>
            </div>
            <Play size={22} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

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

        {/* Weak area nudge — shown only when there's a section below 60% pass rate */}
        {weakInfo && weakestSection && (
          <div className="card !rounded-2xl p-4 !border-wrong/25 !bg-wrong/5 fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-wrong/10 flex items-center justify-center shrink-0">
                <AlertCircle size={20} className="text-wrong" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-wrong">Schwachstelle: {weakInfo.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {Math.round(stats!.sectionAvg[weakestSection].passRate)}% Bestehensquote — noch Verbesserungspotential
                </div>
              </div>
              <button
                onClick={() => onPractice(selectedTest, weakestSection)}
                className="btn-3d btn-3d-danger !py-1.5 !px-3 !text-xs shrink-0"
              >
                Jetzt üben
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
            60 Punkte gesamt — bestanden ab 36 Punkten (60%)
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
