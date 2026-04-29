import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { getStudyDataForLevel } from '../study-data';
import type { ExamLevel } from '../levelConfig';
import { addXP, XP_VALUES } from '../xpTracking';
import { TopicPicker } from './Flashcards';

interface MemoryMatchProps {
  onBack: () => void;
  level?: ExamLevel;
}

interface Card {
  id: number;
  pairId: number;
  text: string;
  type: 'german' | 'english';
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PAIRS = 8;

export function MemoryMatch({ onBack, level = 'A1' }: MemoryMatchProps) {
  const { vocabulary } = getStudyDataForLevel(level);
  const [topicId, setTopicId] = useState<string | null>(null);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);

  const cards = useMemo((): Card[] => {
    if (!topicId) return [];
    const topic = vocabulary.find(t => t.id === topicId);
    if (!topic) return [];
    const pairs = shuffle(topic.words).slice(0, PAIRS);
    const all: Card[] = [];
    pairs.forEach((w, i) => {
      all.push({ id: i * 2, pairId: i, text: w.article ? `${w.article} ${w.german}` : w.german, type: 'german' });
      all.push({ id: i * 2 + 1, pairId: i, text: w.english, type: 'english' });
    });
    return shuffle(all);
  }, [topicId, vocabulary]);

  // Timer
  useEffect(() => {
    if (!topicId || finished) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 500);
    return () => clearInterval(t);
  }, [topicId, startTime, finished]);

  useEffect(() => {
    if (cards.length > 0 && matched.length === cards.length && !finished) {
      setFinished(true);
      addXP(XP_VALUES.sessionComplete + XP_VALUES.perfectScore);
    }
  }, [matched, cards, finished]);

  function flipCard(cardId: number) {
    if (locked) return;
    if (flipped.includes(cardId) || matched.includes(cardId)) return;
    if (flipped.length === 2) return;

    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped.map(id => cards.find(c => c.id === id)!);
      if (a.pairId === b.pairId) {
        setMatched(m => [...m, a.id, b.id]);
        setFlipped([]);
        addXP(XP_VALUES.correctAnswer);
      } else {
        setLocked(true);
        setTimeout(() => { setFlipped([]); setLocked(false); }, 900);
      }
    }
  }

  function startTopic(id: string) {
    setTopicId(id);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setFinished(false);
    setElapsed(0);
    setStartTime(Date.now());
  }

  if (!topicId) {
    return <TopicPicker topics={vocabulary} onSelect={startTopic} onBack={onBack} title="Memory" subtitle="Wähle ein Thema" />;
  }

  if (finished) {
    const min = Math.floor(elapsed / 60);
    const sec = elapsed % 60;
    return (
      <div className="min-h-dvh flex flex-col bg-exam-bg">
        <div className="bg-white border-b-2 border-card-border px-4 py-3 flex items-center gap-3 shrink-0">
          <button onClick={() => setTopicId(null)} className="text-gray-400 hover:text-telc p-1"><ArrowLeft size={20} /></button>
          <h1 className="font-extrabold text-lg">Memory</h1>
        </div>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="card !rounded-2xl p-8 text-center max-w-sm w-full bounce-in space-y-4">
            <CheckCircle size={48} className="text-correct mx-auto" />
            <div className="text-2xl font-extrabold">Alle Paare gefunden!</div>
            <div className="flex justify-center gap-6">
              <div><div className="text-2xl font-extrabold text-telc">{moves}</div><div className="text-xs text-gray-400">Züge</div></div>
              <div><div className="text-2xl font-extrabold text-section-hoeren">{min > 0 ? `${min}m ` : ''}{sec}s</div><div className="text-xs text-gray-400">Zeit</div></div>
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => startTopic(topicId)} className="btn-3d btn-3d-primary">Nochmal</button>
              <button onClick={() => setTopicId(null)} className="btn-3d btn-3d-secondary">Thema wechseln</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col bg-exam-bg">
      <div className="bg-white border-b-2 border-card-border px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => setTopicId(null)} className="text-gray-400 hover:text-telc p-1"><ArrowLeft size={20} /></button>
        <h1 className="font-extrabold text-lg">Memory</h1>
        <div className="flex-1" />
        <span className="text-xs font-bold text-gray-500">{Math.floor(matched.length / 2)}/{PAIRS} Paare</span>
        <span className="text-xs font-bold bg-telc-light text-telc-dark px-2.5 py-1 rounded-full">{moves} Züge</span>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-3 py-4">
        <div className="grid grid-cols-4 gap-2">
          {cards.map(card => {
            const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
            const isMatched = matched.includes(card.id);
            return (
              <button
                key={card.id}
                onClick={() => flipCard(card.id)}
                disabled={isMatched || locked}
                className={`aspect-square rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center text-center p-1.5 leading-tight ${
                  isMatched
                    ? 'bg-correct/10 border-2 border-correct/30 text-correct cursor-default'
                    : isFlipped
                      ? card.type === 'german'
                        ? 'bg-section-hoeren-light border-2 border-section-hoeren text-section-hoeren'
                        : 'bg-section-lesen-light border-2 border-section-lesen text-section-lesen-dark'
                      : 'bg-white border-2 border-card-border hover:border-telc/40 active:scale-95'
                }`}
              >
                {isFlipped ? card.text : '?'}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
