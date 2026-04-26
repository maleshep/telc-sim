import { useState, useEffect, useRef } from 'react';
import type { HoerenTeil, Answer, Teil } from '../types';
import { speak, stopSpeaking } from '../speech';
import { Volume2, RotateCcw, ChevronRight, Headphones } from 'lucide-react';
import { AnswerFeedback } from './AnswerFeedback';

interface HoerenProps {
  data: { teil1: HoerenTeil; teil2: HoerenTeil; teil3: HoerenTeil };
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

export function Hoeren({ data, teile, practice, onComplete }: HoerenProps) {
  const TEILE = teile && teile.length > 0 ? teile : ALL_TEILE;
  const [teilIdx, setTeilIdx] = useState(0);
  const [itemIdx, setItemIdx] = useState(0);
  const [phase, setPhase] = useState<'instruction' | 'item' | 'feedback'>('instruction');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [replaysUsed, setReplaysUsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
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

  // Keyboard shortcuts — always-fresh ref pattern avoids stale closures
  const keyHandlerRef = useRef<(e: KeyboardEvent) => void>(() => {});
  keyHandlerRef.current = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (phase === 'feedback') return; // AnswerFeedback handles Enter in feedback phase
    if (phase === 'instruction') {
      if (e.key === 'Enter') { setPhase('item'); }
      return;
    }
    if (e.key === 'Enter') {
      if (selected !== null && !isPlaying) handleNext();
      return;
    }
    const num = parseInt(e.key);
    if (isNaN(num) || num < 1) return;
    if (isRichtigFalsch) {
      if (num === 1) setSelected('richtig');
      if (num === 2) setSelected('falsch');
    } else {
      const vals = item.options.map(optionValue);
      if (num <= vals.length) setSelected(vals[num - 1]);
    }
  };
  useEffect(() => {
    const fn = (e: KeyboardEvent) => keyHandlerRef.current(e);
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  async function playAudio() {
    if (!item || isPlaying) return;
    setIsPlaying(true);
    try { await speak(item.audio); } catch { /* TTS unavailable */ }
    setIsPlaying(false);
    setAudioPlayed(true);
  }

  async function replayAudio() {
    if (replaysUsed >= teilData.replays - 1 || isPlaying) return;
    setReplaysUsed(r => r + 1);
    setIsPlaying(true);
    try { await speak(item.audio); } catch { /* ignore */ }
    setIsPlaying(false);
  }

  function handleNext() {
    if (selected === null) return;
    stopSpeaking();

    const newAnswer: Answer = {
      section: 'hoeren', teil, itemId: item.id, value: selected,
    };
    const updated = [...answers, newAnswer];

    if (practice) {
      // Show feedback before advancing
      setLastCorrect(selected === item.correct);
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
      resetItem();
      setPhase('item');
    } else if (teilIdx < TEILE.length - 1) {
      setAnswers(updated);
      setTeilIdx(t => t + 1);
      setItemIdx(0);
      resetItem();
      setPhase('instruction');
    } else {
      onComplete(updated);
    }
  }

  function resetItem() {
    setSelected(null);
    setAudioPlayed(false);
    setReplaysUsed(0);
    setIsPlaying(false);
  }

  // ── Instruction ─────────────────────────────────────────────────
  if (phase === 'instruction') {
    return (
      <div className="max-w-2xl mx-auto p-6 fade-in">
        <div className="card !rounded-2xl p-8 text-center">
          <div className="section-strip bg-section-hoeren-light text-section-hoeren mb-6">
            <Headphones size={14} />
            Hören — {TEIL_LABELS[teil]}
          </div>
          <p className="text-gray-700 text-lg leading-relaxed mb-8 max-w-lg mx-auto">
            {teilData.instruction}
          </p>
          <button
            onClick={() => setPhase('item')}
            className="btn-3d btn-3d-blue"
          >
            Starten <ChevronRight size={18} className="inline ml-1" />
          </button>
        </div>
      </div>
    );
  }

  // ── Item ────────────────────────────────────────────────────────
  const replaysLeft = Math.max(0, teilData.replays - 1 - replaysUsed);

  return (
    <div className="max-w-2xl mx-auto p-6 fade-in">
      {/* Progress */}
      <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
        <span className="font-semibold">
          <span className="text-section-hoeren">Hören</span> — {TEIL_LABELS[teil]} — Aufgabe {itemIdx + 1}/{teilData.items.length}
        </span>
        <span className="text-xs font-bold bg-section-hoeren-light text-section-hoeren px-2.5 py-1 rounded-full">
          {completedItems + 1} / {totalItems}
        </span>
      </div>
      <div className="progress-track mb-6">
        <div
          className="progress-fill bg-section-hoeren"
          style={{ width: `${((completedItems + 1) / totalItems) * 100}%` }}
        />
      </div>

      <div className="card !rounded-2xl p-6 md:p-8 space-y-5">
        {/* Context */}
        {item.context && (
          <div className="section-strip bg-section-hoeren-light text-section-hoeren">
            {item.context}
          </div>
        )}

        {/* Audio controls */}
        <div className="flex flex-col items-center gap-3 py-4">
          <button
            onClick={audioPlayed ? replayAudio : playAudio}
            disabled={isPlaying || (audioPlayed && replaysLeft <= 0) || phase === 'feedback'}
            className="btn-3d btn-3d-blue !rounded-full !w-20 !h-20 !p-0"
          >
            {isPlaying ? (
              <span className="audio-wave text-white">
                <span /><span /><span /><span /><span />
              </span>
            ) : audioPlayed ? (
              <RotateCcw size={28} />
            ) : (
              <Volume2 size={28} />
            )}
          </button>
          <div className="text-sm font-medium text-gray-500">
            {isPlaying ? (
              <span className="text-section-hoeren">Hören Sie zu...</span>
            ) : audioPlayed ? (
              <span>Noch <strong className="text-section-hoeren">{replaysLeft}x</strong> wiederholen</span>
            ) : (
              'Klicken zum Abspielen'
            )}
          </div>
        </div>

        {/* Question */}
        <div className="font-bold text-lg border-t border-card-border pt-5">{item.question}</div>

        {/* Options: richtig/falsch toggle OR regular radio cards */}
        {isRichtigFalsch ? (
          <div className="flex justify-center py-2">
            <div className="rf-toggle">
              <button
                type="button"
                onClick={() => phase !== 'feedback' && setSelected('richtig')}
                className={selected === 'richtig' ? 'active-richtig' : ''}
              >
                <span className="kbd-hint">1</span> Richtig
              </button>
              <button
                type="button"
                onClick={() => phase !== 'feedback' && setSelected('falsch')}
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
                  onClick={() => phase !== 'feedback' && setSelected(val)}
                  className={`option-card ${isSelected ? 'selected-blue' : ''}`}
                >
                  <input
                    type="radio"
                    name="hoeren-answer"
                    value={val}
                    checked={isSelected}
                    onChange={() => phase !== 'feedback' && setSelected(val)}
                  />
                  <span className="kbd-hint shrink-0">{i + 1}</span>
                  <span className={isSelected ? 'font-bold' : ''}>{opt}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* Next (only show when not in feedback phase) */}
        {phase !== 'feedback' && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleNext}
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
