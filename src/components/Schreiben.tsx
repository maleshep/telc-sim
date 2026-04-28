import { useState, useRef } from 'react';
import type { SchreibenTeil1, SchreibenTeil2, Answer, Teil } from '../types';
import { ChevronRight, PenTool, CheckCircle } from 'lucide-react';
import { Timer } from './Timer';

interface SchreibenProps {
  data: { teil1: SchreibenTeil1; teil2: SchreibenTeil2 };
  teile?: Teil[] | null;
  onComplete: (answers: Answer[]) => void;
}

const SCHREIBEN_TIME = 20 * 60; // 20 minutes

export function Schreiben({ data, teile, onComplete }: SchreibenProps) {
  const hasTeil1 = !teile || teile.includes('teil1');
  const hasTeil2 = !teile || teile.includes('teil2');
  const startPhase: 'instruction1' | 'instruction2' = hasTeil1 ? 'instruction1' : 'instruction2';
  const [phase, setPhase] = useState<'instruction1' | 'form' | 'instruction2' | 'text'>(startPhase);
  const [formValues, setFormValues] = useState<Record<number, string>>({});
  const [messageText, setMessageText] = useState('');
  // Single clock for the whole Schreiben section — never remounted
  const sectionStartRef = useRef<number>(Date.now());
  function getRemainingSeconds(): number {
    return Math.max(0, SCHREIBEN_TIME - Math.floor((Date.now() - sectionStartRef.current) / 1000));
  }

  function handleFormField(idx: number, value: string) {
    setFormValues(prev => ({ ...prev, [idx]: value }));
  }

  // Letter mode (B1+): Teil 1 is free-text letter, stored as teil1/itemId:0
  const [letterText, setLetterText] = useState('');
  const isLetterMode = data.teil1.mode === 'letter';
  const t1MinWords = data.teil1.minWords ?? 0;
  const letterWordCount = letterText.trim().split(/\s+/).filter(Boolean).length;

  function submitForm() {
    if (isLetterMode) {
      // Letter mode: store free text as the T1 answer
      const answers: Answer[] = [
        { section: 'schreiben', teil: 'teil1', itemId: 0, value: letterText },
      ];
      if (hasTeil2) { setPhase('instruction2'); }
      else { onComplete(answers); }
      return;
    }
    if (hasTeil2) {
      setPhase('instruction2');
    } else {
      const answers: Answer[] = [];
      data.teil1.fields.forEach((_field, idx) => {
        answers.push({ section: 'schreiben', teil: 'teil1', itemId: idx, value: formValues[idx] || '' });
      });
      onComplete(answers);
    }
  }

  function submitMessage() {
    const answers: Answer[] = [];

    if (hasTeil1) {
      if (isLetterMode) {
        answers.push({ section: 'schreiben', teil: 'teil1', itemId: 0, value: letterText });
      } else {
        data.teil1.fields.forEach((_field, idx) => {
          answers.push({ section: 'schreiben', teil: 'teil1', itemId: idx, value: formValues[idx] || '' });
        });
      }
    }

    answers.push({ section: 'schreiben', teil: 'teil2', itemId: 0, value: messageText });
    onComplete(answers);
  }

  function handleTimeUp() {
    const answers: Answer[] = [];
    if (hasTeil1) {
      if (isLetterMode) {
        answers.push({ section: 'schreiben', teil: 'teil1', itemId: 0, value: letterText });
      } else {
        data.teil1.fields.forEach((_field, idx) => {
          answers.push({ section: 'schreiben', teil: 'teil1', itemId: idx, value: formValues[idx] || '' });
        });
      }
    }
    if (hasTeil2) {
      answers.push({ section: 'schreiben', teil: 'teil2', itemId: 0, value: messageText });
    }
    onComplete(answers);
  }

  const wordCount = messageText.trim().split(/\s+/).filter(Boolean).length;
  const meetsMinWords = wordCount >= data.teil2.minWords;

  // ── Teil 1 Instruction ──────────────────────────────────────────
  if (phase === 'instruction1') {
    return (
      <div className="max-w-2xl mx-auto p-6 fade-in">
        <div className="card !rounded-2xl p-8 text-center">
          <div className="section-strip bg-section-schreiben-light text-section-schreiben mb-6">
            <PenTool size={14} />
            Schreiben — Teil 1
          </div>
          <p className="text-gray-700 text-lg leading-relaxed mb-8 max-w-lg mx-auto">
            {data.teil1.instruction}
          </p>
          <button
            onClick={() => setPhase('form')}
            className="btn-3d btn-3d-primary"
          >
            Starten <ChevronRight size={18} className="inline ml-1" />
          </button>
        </div>
      </div>
    );
  }

  // ── Teil 1 Form ─────────────────────────────────────────────────
  if (phase === 'form') {
    return (
      <div className="max-w-2xl mx-auto p-6 fade-in">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold">
            <span className="text-section-schreiben">Schreiben</span> — Teil 1
          </span>
          <Timer seconds={getRemainingSeconds()} onExpired={handleTimeUp} />
        </div>

        {/* Person information card */}
        {data.teil1.personCard.length > 0 && (
          <div className="mb-4 bg-section-schreiben-light border-2 border-section-schreiben/20 rounded-2xl p-5">
            <p className="text-xs font-extrabold text-section-schreiben uppercase tracking-wider mb-3">
              Informationen
            </p>
            <div className="space-y-1.5">
              {data.teil1.personCard.map((line, i) => (
                <p key={i} className="text-sm font-medium text-gray-700 font-mono">{line}</p>
              ))}
            </div>
          </div>
        )}

        <div className="card !rounded-2xl p-6 md:p-8 space-y-6">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <PenTool size={20} className="text-section-schreiben" />
            {data.teil1.formTitle}
          </h3>

          {isLetterMode ? (
            /* Letter mode — free text */
            <div>
              <textarea
                value={letterText}
                onChange={e => setLetterText(e.target.value)}
                placeholder="Schreiben Sie hier Ihren Brief oder Ihre E-Mail..."
                rows={10}
                className="w-full px-4 py-3 leading-relaxed text-base"
              />
              {t1MinWords > 0 && (
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className={`flex items-center gap-1.5 font-bold ${letterWordCount >= t1MinWords ? 'text-correct' : 'text-gray-400'}`}>
                    {letterWordCount >= t1MinWords && <CheckCircle size={14} />}
                    {letterWordCount} / {t1MinWords} Wörter
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Standard form mode */
            <div className="space-y-4">
              {data.teil1.fields.map((field, idx) => (
                <div key={idx}>
                  <label className="block text-sm font-bold text-gray-600 mb-1.5">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={formValues[idx] || ''}
                    onChange={e => handleFormField(idx, e.target.value)}
                    placeholder={field.hint || ''}
                    className="w-full px-4 py-3 text-base"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={submitForm}
              className="btn-3d btn-3d-primary"
            >
              {hasTeil2 ? <>Weiter zu Teil 2 <ChevronRight size={18} /></> : <>Abgeben <ChevronRight size={18} /></>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Teil 2 Instruction ──────────────────────────────────────────
  if (phase === 'instruction2') {
    return (
      <div className="max-w-2xl mx-auto p-6 fade-in">
        <div className="card !rounded-2xl p-8 text-center">
          <div className="section-strip bg-section-schreiben-light text-section-schreiben mb-6">
            <PenTool size={14} />
            Schreiben — Teil 2
          </div>
          <p className="text-gray-700 text-lg leading-relaxed mb-8 max-w-lg mx-auto">
            {data.teil2.instruction}
          </p>
          <button
            onClick={() => setPhase('text')}
            className="btn-3d btn-3d-primary"
          >
            Starten <ChevronRight size={18} className="inline ml-1" />
          </button>
        </div>
      </div>
    );
  }

  // ── Teil 2 Free text ────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto p-6 fade-in">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold">
          <span className="text-section-schreiben">Schreiben</span> — Teil 2
        </span>
        <Timer seconds={getRemainingSeconds()} onExpired={handleTimeUp} />
      </div>

      <div className="card !rounded-2xl p-6 md:p-8 space-y-6">
        {/* Situation */}
        <div className="bg-section-schreiben-light rounded-xl p-5 border-2 border-section-schreiben/15">
          <p className="text-gray-800 leading-relaxed font-medium">{data.teil2.situation}</p>
        </div>

        {/* Bullets */}
        <div>
          <p className="text-sm font-bold text-gray-600 mb-2">Schreiben Sie etwas zu diesen Punkten:</p>
          <ul className="space-y-1.5">
            {data.teil2.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700">
                <span className="text-section-schreiben font-bold mt-0.5">•</span>
                <span className="font-medium">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Text area */}
        <div>
          <textarea
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            placeholder="Schreiben Sie hier Ihre Nachricht..."
            rows={8}
            className="w-full px-4 py-3 leading-relaxed text-base"
          />
          <div className="flex justify-between items-center text-sm mt-2">
            <span className={`flex items-center gap-1.5 font-bold ${meetsMinWords ? 'text-correct' : 'text-gray-400'}`}>
              {meetsMinWords && <CheckCircle size={14} />}
              {wordCount} / {data.teil2.minWords} Wörter
            </span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            onClick={submitMessage}
            className="btn-3d btn-3d-primary"
          >
            Abgeben <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
