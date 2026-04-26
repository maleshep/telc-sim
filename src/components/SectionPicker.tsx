import type { Section, Teil } from '../types';
import {
  Headphones, BookOpen, PenTool, MessageSquare,
  ChevronRight, ArrowLeft, Play, Layers,
} from 'lucide-react';

interface SectionPickerProps {
  section: Section;
  onStart: (teil: Teil | 'all') => void;
  onBack: () => void;
}

// ── Section metadata ──────────────────────────────────────────────

const SECTION_META: Record<Section, {
  label: string;
  icon: typeof Headphones;
  color: string;
  colorBg: string;
  colorLight: string;
  colorBorder: string;
  intro: string;
  teile: { teil: Teil; label: string; title: string; desc: string; skills: string[]; questionCount: string }[];
}> = {
  hoeren: {
    label: 'Hören',
    icon: Headphones,
    color: 'bg-section-hoeren',
    colorBg: 'text-section-hoeren',
    colorLight: 'bg-section-hoeren-light',
    colorBorder: 'border-section-hoeren/20',
    intro: 'Im Hörverstehen hörst du kurze Gespräche und Ansagen auf Deutsch. Du musst zeigen, dass du alltägliche Informationen verstehst.',
    teile: [
      {
        teil: 'teil1',
        label: 'Teil 1',
        title: 'Kurze Gespräche',
        desc: 'Du hörst kurze Dialoge aus dem Alltag und wählst die richtige Antwort (a, b oder c).',
        skills: ['Zahlen & Uhrzeiten verstehen', 'Orte & Richtungen erkennen', 'Einfache Informationen erfassen'],
        questionCount: '6 Aufgaben',
      },
      {
        teil: 'teil2',
        label: 'Teil 2',
        title: 'Richtig oder Falsch',
        desc: 'Du hörst kurze Aussagen und entscheidest: Stimmt das oder nicht?',
        skills: ['Aussagen bewerten', 'Details heraushören', 'Ja/Nein-Entscheidungen treffen'],
        questionCount: '4 Aufgaben',
      },
      {
        teil: 'teil3',
        label: 'Teil 3',
        title: 'Längeres Gespräch',
        desc: 'Du hörst ein längeres Gespräch und beantwortest Fragen dazu.',
        skills: ['Zusammenhänge verstehen', 'Mehrere Informationen verbinden', 'Gesprächsinhalt erfassen'],
        questionCount: '5 Aufgaben',
      },
    ],
  },
  lesen: {
    label: 'Lesen',
    icon: BookOpen,
    color: 'bg-section-lesen',
    colorBg: 'text-section-lesen-dark',
    colorLight: 'bg-section-lesen-light',
    colorBorder: 'border-section-lesen/20',
    intro: 'Im Leseverstehen liest du kurze Texte — Schilder, Notizen, E-Mails — und zeigst, dass du den Inhalt verstehst.',
    teile: [
      {
        teil: 'teil1',
        label: 'Teil 1',
        title: 'Alltagstexte',
        desc: 'Du liest kurze Texte aus dem Alltag (Schilder, Anzeigen, Notizen) und wählst die richtige Antwort.',
        skills: ['Schilder & Hinweise verstehen', 'Kurze Nachrichten lesen', 'Informationen zuordnen'],
        questionCount: '5 Aufgaben',
      },
      {
        teil: 'teil2',
        label: 'Teil 2',
        title: 'Richtig oder Falsch',
        desc: 'Du liest kurze Texte und entscheidest, ob Aussagen dazu richtig oder falsch sind.',
        skills: ['Aussagen überprüfen', 'Details im Text finden', 'Textinhalt bewerten'],
        questionCount: '5 Aufgaben',
      },
      {
        teil: 'teil3',
        label: 'Teil 3',
        title: 'Leseverstehen',
        desc: 'Du liest einen längeren Text und beantwortest Multiple-Choice-Fragen dazu.',
        skills: ['Längere Texte verstehen', 'Hauptinformation erkennen', 'Details herauslesen'],
        questionCount: '5 Aufgaben',
      },
    ],
  },
  schreiben: {
    label: 'Schreiben',
    icon: PenTool,
    color: 'bg-section-schreiben',
    colorBg: 'text-section-schreiben',
    colorLight: 'bg-section-schreiben-light',
    colorBorder: 'border-section-schreiben/20',
    intro: 'Im Schreiben füllst du ein Formular aus und schreibst eine kurze Nachricht — beides auf A1-Niveau.',
    teile: [
      {
        teil: 'teil1',
        label: 'Teil 1',
        title: 'Formular ausfüllen',
        desc: 'Du füllst ein einfaches Formular mit persönlichen Angaben aus (Name, Adresse, Geburtsdatum usw.).',
        skills: ['Persönliche Daten eintragen', 'Formulare verstehen', 'Richtige Felder erkennen'],
        questionCount: '5-6 Felder',
      },
      {
        teil: 'teil2',
        label: 'Teil 2',
        title: 'Kurze Nachricht schreiben',
        desc: 'Du schreibst eine kurze Nachricht (E-Mail, SMS, Notiz) zu einer Alltagssituation.',
        skills: ['Anrede & Schluss', 'Alle Punkte behandeln', 'Einfache Sätze bilden'],
        questionCount: 'ca. 30 Wörter',
      },
    ],
  },
  sprechen: {
    label: 'Sprechen',
    icon: MessageSquare,
    color: 'bg-telc',
    colorBg: 'text-telc',
    colorLight: 'bg-telc-light',
    colorBorder: 'border-telc/20',
    intro: 'In der mündlichen Prüfung sprichst du mit einem KI-Prüfer. Du stellst dich vor, sprichst über ein Thema und formulierst Bitten.',
    teile: [
      {
        teil: 'teil1',
        label: 'Teil 1',
        title: 'Sich vorstellen',
        desc: 'Du stellst dich vor: Name, Herkunft, Wohnort, Alter, Sprachen, Hobbys usw.',
        skills: ['Persönliche Informationen geben', 'Einfache Sätze über sich selbst', 'Auf Nachfragen antworten'],
        questionCount: '6-8 Fragen',
      },
      {
        teil: 'teil2',
        label: 'Teil 2',
        title: 'Über ein Thema sprechen',
        desc: 'Du bekommst Wortkarten zu einem Thema und bildest Sätze dazu.',
        skills: ['Wortkarten als Hilfe nutzen', 'Einfache Aussagen machen', 'Zum Thema sprechen'],
        questionCount: '4-5 Wortkarten',
      },
      {
        teil: 'teil3',
        label: 'Teil 3',
        title: 'Bitten formulieren',
        desc: 'Du formulierst höfliche Bitten in Alltagssituationen.',
        skills: ['Höfliche Formen nutzen', '"Können Sie...?"', 'Alltagssituationen meistern'],
        questionCount: '3-4 Situationen',
      },
    ],
  },
};

export function SectionPicker({ section, onStart, onBack }: SectionPickerProps) {
  const meta = SECTION_META[section];
  const Icon = meta.icon;

  return (
    <div className="min-h-dvh flex flex-col bg-exam-bg">
      {/* Header */}
      <div className="bg-white border-b-2 border-card-border px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="text-gray-400 hover:text-telc transition-colors p-1">
          <ArrowLeft size={20} />
        </button>
        <div className={`w-9 h-9 rounded-lg ${meta.color} text-white flex items-center justify-center`}>
          <Icon size={18} />
        </div>
        <h1 className="font-extrabold text-lg">{meta.label}</h1>
        <span className="text-xs text-gray-400 font-medium">Übungsmodus</span>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Section intro */}
        <div className={`${meta.colorLight} border-2 ${meta.colorBorder} rounded-2xl p-5 fade-in`}>
          <p className="text-gray-700 font-medium leading-relaxed">{meta.intro}</p>
        </div>

        {/* All Teile button */}
        <button
          onClick={() => onStart('all')}
          className="btn-3d btn-3d-primary w-full !py-4 !rounded-2xl group fade-in"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Layers size={22} />
              <div className="text-left">
                <div className="font-extrabold">Alle Teile üben</div>
                <div className="text-sm text-white/70 font-normal">
                  {meta.teile.length} Teile nacheinander
                </div>
              </div>
            </div>
            <Play size={20} className="shrink-0" />
          </div>
        </button>

        {/* Individual Teil cards */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-500">Oder wähle einen Teil:</h2>
          {meta.teile.map(({ teil, label, title, desc, skills, questionCount }, i) => (
            <button
              key={teil}
              onClick={() => onStart(teil)}
              className="card card-interactive w-full !rounded-2xl p-5 text-left group fade-in"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${meta.color} text-white flex items-center justify-center font-extrabold text-lg shrink-0 shadow-sm`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className={`font-extrabold ${meta.colorBg}`}>{label}</span>
                      <span className="text-gray-400 mx-2">—</span>
                      <span className="font-bold text-gray-700">{title}</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <span key={s} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.colorLight} ${meta.colorBg}`}>
                        {s}
                      </span>
                    ))}
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      {questionCount}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
