import { useState, useEffect, useRef } from 'react';
import type { LesenTeil, Answer, Teil } from '../types';
import { ChevronRight, BookOpen } from 'lucide-react';
import { Timer } from './Timer';
import { AnswerFeedback } from './AnswerFeedback';

interface LesenProps {
  data: { teil1: LesenTeil; teil2: LesenTeil; teil3: LesenTeil };
  teile?: Teil[] | null;
  practice?: boolean;
  onComplete: (answers: Answer[]) => void;
}

const ALL_TEILE: Teil[] = ['teil1', 'teil2', 'teil3'];
const TEIL_LABELS: Record<string, string> = { teil1: 'Teil 1', teil2: 'Teil 2', teil3: 'Teil 3' };

function optionValue(opt: string): string {
  const m = opt.match(/^([a-c])\)/);
  return m ? m[1] : opt;
}

function getCorrectLabel(item: { correct: string; options: string[] }): string {
  if (item.correct === 'richtig' || item.correct === 'falsch') return item.correct;
  const opt = item.options.find(o => optionValue(o) === item.correct);
  return opt || item.correct;
}

const LESEN_TIME = 25 * 60;

export function Lesen({ data, teile, practice, onComplete }: LesenProps) {
  const TEILE = teile && teile.length > 0 ? teile : ALL_TEILE;
  const [teilIdx, setTeilIdx] = useState(0);
  const [itemIdx, setItemIdx] = useState(0);
  const [phase, setPhase] = useState<'instruction' | 'item' | 'feedback'>('instruction');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState('');
  const [pendingAnswers, setPendingAnswers] = useState<Answer[]>([]);

  const teil = TEILE[teilIdx];
  const teilData = data[teil];
  const item = teilData.items[itemIdx];
  const totalItems = TEILE.reduce((sum, t) => sum + data[t].items.length, 0);
  const completedItems = TEILE.slice(0, teilIdx).reduce((sum, t) => sum + data[t].items.length, 0) + itemIdx;

  const isRichtigFalsch = item?.options.length === 2
    && item.options.includes('richtig')
    && item.options.includes('falsch');

  // Keep a ref in sync with selected so the keyboard Enter handler fires even
  // when pressed immediately after a number key (before React re-renders).
  const selectedRef = useRef<string | null>(null);
  function pick(val: string | null) {
    selectedRef.current = val;
    setSelected(val);
  }

  const keyHandlerRef = useRef<(e: KeyboardEvent) => void>(() => {});
  keyHandlerRef.current = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (phase === 'feedback') return;
    if (phase === 'instruction') {
      if (e.key === 'Enter') setPhase('item');
      return;
    }
    if (e.key === 'Enter') {
      const cur = selectedRef.current ?? selected;
      if (cur !== null) handleNext(cur);
      return;
    }
    const num = parseInt(e.key);
    if (isNaN(num) || num < 1) return;
    if (isRichtigFalsch) {
      if (num === 1) pick('richtig');
      if (num === 2) pick('falsch');
    } else {
      const vals = item.options.map(optionValue);
      if (num <= vals.length) pick(vals[num - 1]);
    }
  };
  useEffect(() => {
    const fn = (e: KeyboardEvent) => keyHandlerRef.current(e);
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  function handleNext(valueOverride?: string) {
    const val = valueOverride ?? selected;
    if (val === null) return;

    const newAnswer: Answer = {
      section: 'lesen', teil, itemId: item.id, value: val,
    };
    const updated = [...answers, newAnswer];

    if (practice) {
      setLastCorrect(val === item.correct);
      setLastCorrectAnswer(getCorrectLabel(item));
      setPendingAnswers(updated);
      setPhase('feedback');
    } else {
      advance(updated);
    }
  }

  function handleFeedbackContinue() {
    advance(pendingAnswers);
  }

  function advance(updated: Answer[]) {
    if (itemIdx < teilData.items.length - 1) {
      setAnswers(updated);
      setItemIdx(i => i + 1);
      pick(null);
      setPhase('item');
    } else if (teilIdx < TEILE.length - 1) {
      setAnswers(updated);
      setTeilIdx(t => t + 1);
      setItemIdx(0);
      pick(null);
      setPhase('instruction');
    } else {
      onComplete(updated);
    }
  }

  function handleTimeUp() {
    const rest: Answer[] = [];
    for (let t = teilIdx; t < TEILE.length; t++) {
      const td = data[TEILE[t]];
      const startI = t === teilIdx ? itemIdx : 0;
      for (let i = startI; i < td.items.length; i++) {
        const existing = answers.find(a => a.teil === TEILE[t] && a.itemId === td.items[i].id);
        if (!existing) {
          rest.push({ section: 'lesen', teil: TEILE[t], itemId: td.items[i].id, value: '' });
        }
      }
    }
    onComplete([...answers, ...rest]);
  }

  // ── Instruction ─────────────────────────────────────────────────
  if (phase === 'instruction') {
    return (
      <div className="max-w-2xl mx-auto p-6 fade-in">
        <div className="card !rounded-2xl p-8 text-center">
          <div className="section-strip bg-section-lesen-light text-section-lesen-dark mb-6">
            <BookOpen size={14} />
            Lesen — {TEIL_LABELS[teil]}
          </div>
          <p className="text-gray-700 text-lg leading-relaxed mb-8 max-w-lg mx-auto">
            {teilData.instruction}
          </p>
          <button
            onClick={() => setPhase('item')}
            className="btn-3d btn-3d-primary"
          >
            Starten <ChevronRight size={18} className="inline ml-1" />
          </button>
        </div>
      </div>
    );
  }

  // ── Item ────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto p-6 fade-in">
      {/* Header with timer */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">
          <span className="text-section-lesen-dark">Lesen</span> — {TEIL_LABELS[teil]} — Aufgabe {itemIdx + 1}/{teilData.items.length}
        </span>
        <Timer seconds={LESEN_TIME} onExpired={handleTimeUp} paused={phase === 'feedback'} />
      </div>
      <div className="progress-track mb-6">
        <div
          className="progress-fill bg-section-lesen"
          style={{ width: `${((completedItems + 1) / totalItems) * 100}%` }}
        />
      </div>

      <div className="card !rounded-2xl p-6 md:p-8 space-y-5">
        {/* Reading text panel */}
        <div className="reading-panel">
          {item.text}
        </div>

        {/* Question */}
        <div className="font-bold text-lg pt-1">{item.question}</div>

        {/* Options: richtig/falsch toggle OR regular radio cards */}
        {isRichtigFalsch ? (
          <div className="flex justify-center py-2">
            <div className="rf-toggle">
              <button
                type="button"
                onClick={() => phase !== 'feedback' && pick('richtig')}
                className={selected === 'richtig' ? 'active-richtig' : ''}
              >
                <span className="kbd-hint">1</span> Richtig
              </button>
              <button
                type="button"
                onClick={() => phase !== 'feedback' && pick('falsch')}
                className={selected === 'falsch' ? 'active-falsch' : ''}
              >
                <span className="kbd-hint">2</span> Falsch
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {item.options.map((opt, i) => {
              const val = optionValue(opt);
              const isSelected = selected === val;
              return (
                <label
                  key={opt}
                  onClick={() => phase !== 'feedback' && pick(val)}
                  className={`option-card ${isSelected ? 'selected-amber' : ''}`}
                >
                  <input
                    type="radio"
                    name="lesen-answer"
                    value={val}
                    checked={isSelected}
                    onChange={() => phase !== 'feedback' && pick(val)}
                  />
                  <span className="kbd-hint shrink-0">{i + 1}</span>
                  <span className={isSelected ? 'font-bold' : ''}>{opt}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* Next (hide during feedback) */}
        {phase !== 'feedback' && (
          <div className="flex justify-end pt-2">
            <button
              onClick={() => handleNext()}
              disabled={selected === null}
              className="btn-3d btn-3d-primary"
            >
              Weiter <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Feedback banner */}
      {phase === 'feedback' && (
        <AnswerFeedback
          isCorrect={lastCorrect}
          correctAnswer={lastCorrectAnswer}
          onContinue={handleFeedbackContinue}
        />
      )}
    </div>
  );
}
