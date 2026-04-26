import { useState } from 'react';
import type { VocabTopic, GrammarRule } from '../study-data';
import { studyData } from '../study-data';
import {
  BookOpen, Languages, ChevronRight, ChevronDown,
  ArrowLeft, Search, Gamepad2, CreditCard, HelpCircle,
} from 'lucide-react';
import { Flashcards } from './Flashcards';
import { VocabQuiz } from './VocabQuiz';

type Tab = 'games' | 'vocabulary' | 'grammar';

export function Study({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<Tab>('games');
  const [search, setSearch] = useState('');
  const [activeGame, setActiveGame] = useState<'flashcards' | 'quiz' | null>(null);

  // ── Active game screens ─────────────────────────────────────────
  if (activeGame === 'flashcards') {
    return <Flashcards onBack={() => setActiveGame(null)} />;
  }
  if (activeGame === 'quiz') {
    return <VocabQuiz onBack={() => setActiveGame(null)} />;
  }

  return (
    <div className="min-h-dvh flex flex-col bg-exam-bg">
      {/* Header */}
      <div className="bg-white border-b-2 border-card-border px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="text-gray-400 hover:text-telc transition-colors p-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-extrabold text-lg">Lernmaterial</h1>
        <div className="flex-1" />
        <div className="flex gap-1 bg-exam-bg rounded-xl p-1">
          <button
            onClick={() => setTab('games')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === 'games' ? 'bg-telc text-white shadow-sm' : 'text-gray-500 hover:text-telc'
            }`}
          >
            <Gamepad2 size={13} className="inline mr-1" />
            Spiele
          </button>
          <button
            onClick={() => setTab('vocabulary')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === 'vocabulary' ? 'bg-telc text-white shadow-sm' : 'text-gray-500 hover:text-telc'
            }`}
          >
            <Languages size={13} className="inline mr-1" />
            Wortschatz
          </button>
          <button
            onClick={() => setTab('grammar')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === 'grammar' ? 'bg-section-schreiben text-white shadow-sm' : 'text-gray-500 hover:text-section-schreiben'
            }`}
          >
            <BookOpen size={13} className="inline mr-1" />
            Grammatik
          </button>
        </div>
      </div>

      {/* Search (for vocab and grammar tabs) */}
      {tab !== 'games' && (
        <div className="max-w-3xl mx-auto w-full px-4 pt-4">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tab === 'vocabulary' ? 'Wort suchen...' : 'Thema suchen...'}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-4">
        {tab === 'games' && (
          <GamesView
            onFlashcards={() => setActiveGame('flashcards')}
            onQuiz={() => setActiveGame('quiz')}
          />
        )}
        {tab === 'vocabulary' && <VocabularyView search={search} />}
        {tab === 'grammar' && <GrammarView search={search} />}
      </main>
    </div>
  );
}

// ── Games ────────────────────────────────────────────────────────

function GamesView({ onFlashcards, onQuiz }: {
  onFlashcards: () => void;
  onQuiz: () => void;
}) {
  return (
    <div className="space-y-4 fade-in">
      <p className="text-sm text-gray-500 font-medium">
        Lerne spielerisch! Wähle eine Aktivität:
      </p>

      <button
        onClick={onFlashcards}
        className="card card-interactive w-full !rounded-2xl p-5 text-left group"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-section-hoeren text-white flex items-center justify-center shadow-sm shrink-0">
            <CreditCard size={26} />
          </div>
          <div className="flex-1">
            <div className="font-extrabold text-section-hoeren group-hover:text-section-hoeren-dark transition-colors">Karteikarten</div>
            <div className="text-sm text-gray-500">Deutsch-Englisch Vokabeln durchblättern und lernen</div>
            <div className="flex gap-1.5 mt-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-section-hoeren-light text-section-hoeren">Alle Themen</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">435 Wörter</span>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-300 group-hover:text-section-hoeren transition-colors shrink-0" />
        </div>
      </button>

      <button
        onClick={onQuiz}
        className="card card-interactive w-full !rounded-2xl p-5 text-left group"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-section-lesen text-white flex items-center justify-center shadow-sm shrink-0">
            <HelpCircle size={26} />
          </div>
          <div className="flex-1">
            <div className="font-extrabold text-section-lesen-dark group-hover:text-section-lesen transition-colors">Vokabel-Quiz</div>
            <div className="text-sm text-gray-500">Multiple Choice — teste dein Wissen mit Punkten und Serie</div>
            <div className="flex gap-1.5 mt-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-section-lesen-light text-section-lesen-dark">4 Optionen</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Punkte & Serien</span>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-300 group-hover:text-section-lesen transition-colors shrink-0" />
        </div>
      </button>
    </div>
  );
}

// ── Vocabulary ────────────────────────────────────────────────────

function VocabularyView({ search }: { search: string }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const q = search.toLowerCase();

  const topics = studyData.vocabulary.filter((t) => {
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.nameEn.toLowerCase().includes(q) ||
      t.words.some(
        (w) =>
          w.german.toLowerCase().includes(q) ||
          w.english.toLowerCase().includes(q),
      )
    );
  });

  return (
    <div className="space-y-3">
      {topics.map((topic) => (
        <TopicCard
          key={topic.id}
          topic={topic}
          expanded={expanded === topic.id}
          onToggle={() => setExpanded(expanded === topic.id ? null : topic.id)}
          searchQuery={q}
        />
      ))}
      {topics.length === 0 && (
        <p className="text-center text-gray-400 py-8 font-medium">Keine Ergebnisse für &quot;{search}&quot;</p>
      )}
    </div>
  );
}

function TopicCard({
  topic,
  expanded,
  onToggle,
  searchQuery,
}: {
  topic: VocabTopic;
  expanded: boolean;
  onToggle: () => void;
  searchQuery: string;
}) {
  const filteredWords = searchQuery
    ? topic.words.filter(
        (w) =>
          w.german.toLowerCase().includes(searchQuery) ||
          w.english.toLowerCase().includes(searchQuery),
      )
    : topic.words;

  return (
    <div className="card !rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-exam-bg transition-colors"
      >
        <div className="w-11 h-11 rounded-xl bg-telc/10 flex items-center justify-center shrink-0">
          <span className="text-xl">{getTopicEmoji(topic.id)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm">{topic.name}</div>
          <div className="text-xs text-gray-400 font-medium">{topic.nameEn} — {topic.words.length} Wörter</div>
        </div>
        {expanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
      </button>

      {expanded && (
        <div className="border-t border-card-border px-4 py-3 slide-in">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-card-border">
                <th className="pb-2 font-bold">Deutsch</th>
                <th className="pb-2 font-bold">English</th>
              </tr>
            </thead>
            <tbody>
              {filteredWords.map((w, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-exam-bg transition-colors">
                  <td className="py-2.5 pr-4">
                    <span className="font-bold">{w.article ? `${w.article} ` : ''}{w.german}</span>
                    {w.plural && <span className="text-xs text-gray-400 ml-1.5">(Pl. {w.plural})</span>}
                  </td>
                  <td className="py-2.5 text-gray-600">{w.english}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function getTopicEmoji(id: string): string {
  const map: Record<string, string> = {
    personal: '\uD83D\uDC64', daily: '\u2600\uFE0F', food: '\uD83C\uDF7D\uFE0F',
    shopping: '\uD83D\uDED2', housing: '\uD83C\uDFE0', health: '\uD83C\uDFE5',
    travel: '\uD83D\uDE8C', weather: '\u2601\uFE0F', leisure: '\u26BD', work: '\uD83D\uDCBC',
  };
  return map[id] || '\uD83D\uDCD6';
}

// ── Grammar ──────────────────────────────────────────────────────

function GrammarView({ search }: { search: string }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const q = search.toLowerCase();

  const rules = studyData.grammar.filter((r) => {
    if (!q) return true;
    return (
      r.title.toLowerCase().includes(q) ||
      r.titleEn.toLowerCase().includes(q) ||
      r.explanation.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-3">
      {rules.map((rule) => (
        <GrammarCard
          key={rule.id}
          rule={rule}
          expanded={expanded === rule.id}
          onToggle={() => setExpanded(expanded === rule.id ? null : rule.id)}
        />
      ))}
      {rules.length === 0 && (
        <p className="text-center text-gray-400 py-8 font-medium">Keine Ergebnisse für &quot;{search}&quot;</p>
      )}
    </div>
  );
}

function GrammarCard({
  rule,
  expanded,
  onToggle,
}: {
  rule: GrammarRule;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="card !rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-exam-bg transition-colors"
      >
        <div className="w-11 h-11 rounded-xl bg-section-schreiben-light flex items-center justify-center shrink-0">
          <BookOpen size={18} className="text-section-schreiben" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm">{rule.title}</div>
          <div className="text-xs text-gray-400 font-medium">{rule.titleEn}</div>
        </div>
        {expanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
      </button>

      {expanded && (
        <div className="border-t border-card-border px-4 py-4 space-y-4 text-sm slide-in">
          <p className="text-gray-700 leading-relaxed font-medium">{rule.explanation}</p>
          <p className="text-gray-500 text-xs italic">{rule.explanationEn}</p>

          {rule.tables?.map((table, ti) => (
            <div key={ti} className="overflow-x-auto rounded-xl border border-card-border">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {table.headers.map((h, hi) => (
                      <th key={hi} className="text-left px-3 py-2.5 bg-exam-bg text-xs font-bold text-gray-600 border-b border-card-border">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, ri) => (
                    <tr key={ri} className="border-b border-gray-50 last:border-0">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-2 text-gray-700 font-medium">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          <div className="space-y-1.5">
            {rule.examples.map((ex, i) => (
              <div key={i} className="flex gap-3 py-1.5">
                <span className="text-telc font-mono text-sm mt-0.5">{'\u279C'}</span>
                <div>
                  <span className="font-bold">{ex.german}</span>
                  <span className="text-gray-400 ml-2">— {ex.english}</span>
                </div>
              </div>
            ))}
          </div>

          {rule.tip && (
            <div className="bg-section-lesen-light border-2 border-section-lesen/20 rounded-xl p-4 text-xs text-section-lesen-dark font-medium">
              <strong>Tipp:</strong> {rule.tip}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
