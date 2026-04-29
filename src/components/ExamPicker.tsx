import { ArrowLeft, Play, Headphones, BookOpen, PenTool, MessageSquare } from 'lucide-react';
import type { TelcTest } from '../types';
import { LEVEL_CONFIGS } from '../levelConfig';

interface ExamPickerProps {
  tests: TelcTest[];
  onStart: (testId: number) => void;
  onBack: () => void;
}

export function ExamPicker({ tests, onStart, onBack }: ExamPickerProps) {
  const level = tests[0]?.level ?? 'A1';
  const cfg = LEVEL_CONFIGS[level];

  return (
    <div className="min-h-dvh flex flex-col bg-exam-bg">
      <div className="bg-white border-b-2 border-card-border px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="text-gray-400 hover:text-telc transition-colors p-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-extrabold text-lg">Prüfungsmodus</h1>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.bgLight} ${cfg.colorClass}`}>
          {cfg.label}
        </span>
        <div className="flex-1" />
        <img src="/logo.png" alt="" className="w-8 h-8 rounded-xl shadow-sm" />
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-4">
        <p className="text-sm text-gray-500 font-medium text-center">
          Wähle einen Übungstest — alle 4 Teile mit Zeitlimit
        </p>

        {/* Section overview */}
        <div className="card !rounded-2xl p-4 flex justify-around text-center text-xs text-gray-500 font-bold">
          {[
            { icon: Headphones, label: 'Hören', pts: `${cfg.sectionMax} Pkt.`, color: 'text-section-hoeren' },
            { icon: BookOpen, label: 'Lesen', pts: `${cfg.sectionMax} Pkt.`, color: 'text-section-lesen-dark' },
            { icon: PenTool, label: 'Schreiben', pts: `${cfg.sectionMax} Pkt.`, color: 'text-section-schreiben' },
            { icon: MessageSquare, label: 'Sprechen', pts: `${cfg.sectionMax} Pkt.`, color: 'text-telc' },
          ].map(({ icon: Icon, label, pts, color }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <Icon size={18} className={color} />
              <span className={`font-extrabold ${color}`}>{label}</span>
              <span className="text-gray-400">{pts}</span>
            </div>
          ))}
        </div>

        {/* Test cards */}
        {tests.map((t, i) => (
          <button
            key={t.id}
            onClick={() => onStart(t.id)}
            className="card card-interactive w-full !rounded-2xl p-5 text-left group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm shrink-0 font-extrabold text-2xl text-white ${
                i === 0 ? 'bg-telc' : i === 1 ? 'bg-section-hoeren' : 'bg-section-schreiben'
              }`}>
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="font-extrabold text-gray-800 group-hover:text-telc transition-colors">{t.name}</div>
                <div className="text-sm text-gray-500 mt-0.5">
                  {t.hoeren.teil1.items.length + t.hoeren.teil2.items.length + t.hoeren.teil3.items.length} Hör-Aufgaben ·{' '}
                  {t.lesen.teil1.items.length + t.lesen.teil2.items.length + t.lesen.teil3.items.length} Lese-Aufgaben
                </div>
                <div className="flex gap-1.5 mt-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-telc-light text-telc-dark">
                    {cfg.maxPoints} Punkte
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    ~60 Min.
                  </span>
                </div>
              </div>
              <Play size={20} className="text-gray-300 group-hover:text-telc transition-colors shrink-0" />
            </div>
          </button>
        ))}

        {tests.length === 0 && (
          <div className="card !rounded-2xl p-8 text-center !border-dashed">
            <div className="text-3xl mb-2">🚧</div>
            <div className="font-bold text-gray-500">Noch keine Tests für {cfg.label} verfügbar</div>
          </div>
        )}
      </main>
    </div>
  );
}
