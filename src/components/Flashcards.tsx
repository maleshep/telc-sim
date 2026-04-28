import { useState, useMemo, useEffect, useRef } from 'react';
import type { VocabTopic } from '../study-data';
import { getStudyDataForLevel } from '../study-data';
import {
  ArrowLeft, RotateCcw, ChevronLeft, ChevronRight,
  CheckCircle, Shuffle, Eye,
} from 'lucide-react';
import { markKnown as persistMarkKnown } from '../vocabTracking';
import type { ExamLevel } from '../levelConfig';

interface FlashcardsProps {
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

export function Flashcards({ onBack, level = 'A1' }: FlashcardsProps) {
  const { vocabulary: vocabList } = getStudyDataForLevel(level);
  const [topicId, setTopicId] = useState<string | null>(null);
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set()); // keyed by word.german, not index
  const [shuffled, setShuffled] = useState(false);

  // Reset known + position whenever topic changes
  useEffect(() => {
    setKnown(new Set());
    setCardIdx(0);
    setFlipped(false);
  }, [topicId]);

  const topic = topicId ? vocabList.find(t => t.id === topicId) : null;
  const words = useMemo(() => {
    if (!topic) return [];
    return shuffled ? shuffle(topic.words) : topic.words;
  }, [topic, shuffled]);

  const card = words[cardIdx];
  const total = words.length;
  const knownCount = known.size;

  function nextCard() {
    setFlipped(false);
    if (cardIdx < total - 1) setCardIdx(i => i + 1);
    else setCardIdx(0);
  }

  function prevCard() {
    setFlipped(false);
    if (cardIdx > 0) setCardIdx(i => i - 1);
    else setCardIdx(total - 1);
  }

  function markKnown() {
    if (!card) return;
    setKnown(prev => new Set([...prev, card.german]));
    persistMarkKnown(card.german);
    nextCard();
  }

  function resetDeck() {
    setCardIdx(0);
    setFlipped(false);
    setKnown(new Set());
  }

  function reshuffleDeck() {
    setShuffled(s => !s);
    setCardIdx(0);
    setFlipped(false);
    setKnown(new Set());
  }

  const keyHandlerRef = useRef<(e: KeyboardEvent) => void>(() => {});
  keyHandlerRef.current = (e: KeyboardEvent) => {
    if (!topicId || !card) return;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFlipped(f => !f); }
    else if (e.key === 'ArrowRight') nextCard();
    else if (e.key === 'ArrowLeft') prevCard();
    else if (e.key === 'k' || e.key === 'K') markKnown();
  };
  useEffect(() => {
    const fn = (e: KeyboardEvent) => keyHandlerRef.current(e);
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  // ── Topic Picker ────────────────────────────────────────────────
  if (!topicId) {
    return (
      <TopicPicker
        topics={vocabList}
        onSelect={setTopicId}
        onBack={onBack}
        title="Karteikarten"
        subtitle="Wähle ein Thema"
      />
    );
  }

  if (!card) return null;

  const progressPct = total > 0 ? (knownCount / total) * 100 : 0;

  return (
    <div className="min-h-dvh flex flex-col bg-exam-bg">
      {/* Header */}
      <div className="bg-white border-b-2 border-card-border px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => setTopicId(null)} className="text-gray-400 hover:text-telc transition-colors p-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-extrabold text-lg">Karteikarten</h1>
        <span className="text-xs text-gray-400 font-medium">— {topic?.name}</span>
        <div className="flex-1" />
        <span className="text-xs font-bold bg-correct/10 text-correct px-2.5 py-1 rounded-full">
          {knownCount} / {total} gelernt
        </span>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 flex flex-col items-center gap-6">
        {/* Progress */}
        <div className="w-full progress-track !h-2">
          <div className="progress-fill bg-correct" style={{ width: `${progressPct}%` }} />
        </div>

        {/* Card */}
        <button
          onClick={() => setFlipped(f => !f)}
          className="card !rounded-2xl w-full min-h-[260px] flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all hover:shadow-lg active:scale-[0.98]"
        >
          {!flipped ? (
            <>
              <div className="text-3xl font-extrabold text-gray-800 mb-2">
                {card.article ? `${card.article} ` : ''}{card.german}
              </div>
              {card.plural && (
                <div className="text-sm text-gray-400 font-medium">(Pl. {card.plural})</div>
              )}
              <div className="mt-6 flex items-center gap-1.5 text-sm text-gray-400 font-medium">
                <Eye size={14} />
                Tippen zum Umdrehen
              </div>
            </>
          ) : (
            <div className="bounce-in">
              <div className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-2">English</div>
              <div className="text-2xl font-extrabold text-section-hoeren">
                {card.english}
              </div>
              <div className="mt-4 text-sm text-gray-500">
                {card.article ? `${card.article} ` : ''}{card.german}
                {card.plural && ` (Pl. ${card.plural})`}
              </div>
            </div>
          )}
        </button>

        {/* Card counter */}
        <div className="text-sm font-bold text-gray-500">
          {cardIdx + 1} / {total}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 w-full justify-center">
          <button onClick={prevCard} className="btn-3d btn-3d-secondary !p-3 !rounded-xl">
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={markKnown}
            disabled={known.has(card?.german ?? '')}
            className="btn-3d btn-3d-primary !px-5"
          >
            <CheckCircle size={18} />
            Gewusst!
          </button>

          <button onClick={nextCard} className="btn-3d btn-3d-secondary !p-3 !rounded-xl">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex gap-2">
          <button onClick={reshuffleDeck} className="text-xs font-bold text-gray-400 hover:text-telc px-3 py-1.5 rounded-lg hover:bg-white transition-all flex items-center gap-1">
            <Shuffle size={12} /> Mischen
          </button>
          <button onClick={resetDeck} className="text-xs font-bold text-gray-400 hover:text-telc px-3 py-1.5 rounded-lg hover:bg-white transition-all flex items-center gap-1">
            <RotateCcw size={12} /> Zurücksetzen
          </button>
        </div>
      </main>
    </div>
  );
}

// ── Shared Topic Picker ───────────────────────────────────────────

function getTopicEmoji(id: string): string {
  const map: Record<string, string> = {
    personal: '\uD83D\uDC64', daily: '\u2600\uFE0F', food: '\uD83C\uDF7D\uFE0F',
    shopping: '\uD83D\uDED2', housing: '\uD83C\uDFE0', health: '\uD83C\uDFE5',
    travel: '\uD83D\uDE8C', weather: '\u2601\uFE0F', leisure: '\u26BD', work: '\uD83D\uDCBC',
  };
  return map[id] || '\uD83D\uDCD6';
}

export function TopicPicker({ topics, onSelect, onBack, title, subtitle }: {
  topics: VocabTopic[];
  onSelect: (id: string) => void;
  onBack: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-dvh flex flex-col bg-exam-bg">
      <div className="bg-white border-b-2 border-card-border px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="text-gray-400 hover:text-telc transition-colors p-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-extrabold text-lg">{title}</h1>
        <span className="text-xs text-gray-400 font-medium">— {subtitle}</span>
      </div>
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className="card card-interactive !rounded-2xl p-4 text-center"
            >
              <div className="text-3xl mb-2">{getTopicEmoji(t.id)}</div>
              <div className="font-bold text-sm">{t.name}</div>
              <div className="text-xs text-gray-400 font-medium">{t.words.length} Wörter</div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
