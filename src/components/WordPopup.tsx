import { useState, useEffect, useRef, useCallback } from 'react';
import { X, BookOpen, CheckCircle } from 'lucide-react';
import { studyData } from '../study-data';
import type { VocabWord } from '../study-data';
import { trackLookedUp, isKnown, markKnown, unmarkKnown } from '../vocabTracking';

interface PopupState {
  word: string;
  x: number;
  y: number;
  match: (VocabWord & { topicName: string }) | null;
}

/**
 * Wrap your practice-mode content in this provider.
 * On double-click anywhere inside, it intercepts the selected word,
 * looks it up in the study vocabulary, and shows a Duolingo-style popup.
 */
export function WordLookupProvider({ children, enabled = true }: { children: React.ReactNode; enabled?: boolean }) {
  const [popup, setPopup] = useState<PopupState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDblClick = useCallback((e: MouseEvent) => {
    if (!enabled) return;

    // Read the selection first
    let sel = window.getSelection()?.toString().trim() ?? '';

    // If selection is a whole line (triple-click), use caretRangeFromPoint instead
    if (sel.includes(' ') && sel.length > 40) {
      const range = document.caretRangeFromPoint?.(e.clientX, e.clientY);
      if (range) {
        (range as any).expand?.('word');
        sel = range.toString().trim();
      }
    }

    // Immediately kill the browser selection — prevents Edge/Chrome toolbar from appearing
    window.getSelection()?.removeAllRanges();

    if (!sel || sel.length < 2 || sel.length > 40) return;

    // Strip articles/punctuation to get the bare word
    const bare = sel.replace(/^(der|die|das|ein|eine|einen|dem|den|des)\s+/i, '').replace(/[.,!?;:()\-]/g, '').trim();
    if (!bare || bare.includes(' ')) return;

    const match = findWord(bare);
    trackLookedUp(bare);

    setPopup({
      word: bare,
      x: e.clientX,
      y: e.clientY,
      match: match || null,
    });
    e.preventDefault();
  }, [enabled]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('dblclick', handleDblClick);
    return () => el.removeEventListener('dblclick', handleDblClick);
  }, [handleDblClick]);

  // Close on outside click
  useEffect(() => {
    if (!popup) return;
    const fn = (e: MouseEvent) => {
      const popupEl = document.getElementById('word-popup');
      if (popupEl && !popupEl.contains(e.target as Node)) setPopup(null);
    };
    window.addEventListener('mousedown', fn, true);
    return () => window.removeEventListener('mousedown', fn, true);
  }, [popup]);

  // Close on Escape
  useEffect(() => {
    if (!popup) return;
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setPopup(null); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [popup]);

  return (
    <div ref={containerRef} className="relative min-h-0 flex-1 flex flex-col allow-select">
      {children}
      {popup && (
        <WordPopupCard
          popup={popup}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}

// ── Lookup logic ─────────────────────────────────────────────────

function findWord(raw: string): (VocabWord & { topicName: string }) | null {
  const norm = (s: string) => s.toLowerCase().replace(/[äÄ]/g, 'a').replace(/[öÖ]/g, 'o').replace(/[üÜ]/g, 'u').replace(/ß/g, 'ss');
  const target = norm(raw);

  for (const topic of studyData.vocabulary) {
    for (const word of topic.words) {
      if (norm(word.german) === target) return { ...word, topicName: topic.name };
      // Also match plural form
      if (word.plural && norm(word.plural) === target) return { ...word, topicName: topic.name };
    }
  }

  // Fuzzy: starts-with match (for inflected forms)
  for (const topic of studyData.vocabulary) {
    for (const word of topic.words) {
      const normWord = norm(word.german);
      if (target.length >= 4 && (normWord.startsWith(target) || target.startsWith(normWord))) {
        return { ...word, topicName: topic.name };
      }
    }
  }

  return null;
}

// ── Popup card UI ────────────────────────────────────────────────

function WordPopupCard({ popup, onClose }: { popup: PopupState; onClose: () => void }) {
  const [known, setKnown] = useState(() => isKnown(popup.word));
  const popupRef = useRef<HTMLDivElement>(null);

  // Position popup: prefer below-right of cursor, flip if near edge
  const style = usePositionedStyle(popup.x, popup.y, popupRef);

  function toggleKnown() {
    if (known) {
      unmarkKnown(popup.word);
      setKnown(false);
    } else {
      markKnown(popup.word);
      setKnown(true);
    }
  }

  return (
    <div
      id="word-popup"
      ref={popupRef}
      className="fixed z-[9999] w-72 bounce-in"
      style={style}
    >
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-card-border overflow-hidden">
        {/* Header */}
        <div className="bg-section-lesen-light px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={14} className="text-section-lesen-dark" />
            <span className="text-xs font-extrabold text-section-lesen-dark uppercase tracking-wider">
              {popup.match?.topicName || 'Wort'}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-4 py-4 space-y-3">
          {popup.match ? (
            <>
              {/* German word + article */}
              <div>
                <div className="text-2xl font-extrabold text-gray-800">
                  {popup.match.article && (
                    <span className="text-section-lesen-dark mr-1">{popup.match.article}</span>
                  )}
                  {popup.match.german}
                </div>
                {popup.match.plural && (
                  <div className="text-xs text-gray-400 font-medium mt-0.5">
                    Plural: {popup.match.plural}
                  </div>
                )}
              </div>

              {/* English translation */}
              <div className="bg-section-hoeren-light rounded-xl px-3 py-2">
                <div className="text-xs font-bold text-section-hoeren uppercase tracking-wide mb-0.5">English</div>
                <div className="font-bold text-gray-800">{popup.match.english}</div>
              </div>

              {/* Example sentence */}
              {popup.match.example && (
                <div className="text-sm text-gray-600 italic leading-relaxed border-l-2 border-section-lesen/30 pl-3">
                  {popup.match.example}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-2">
              <div className="text-lg font-extrabold text-gray-700 mb-1">"{popup.word}"</div>
              <div className="text-xs text-gray-400 font-medium">
                Nicht im A1-Wortschatz gefunden
              </div>
            </div>
          )}

          {/* Mark as known button */}
          <button
            onClick={toggleKnown}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-sm transition-all ${
              known
                ? 'bg-correct/10 text-correct border-2 border-correct/20'
                : 'bg-gray-50 text-gray-500 border-2 border-gray-200 hover:border-correct/30 hover:text-correct hover:bg-correct/5'
            }`}
          >
            <CheckCircle size={15} />
            {known ? 'Gelernt ✓' : 'Als gelernt markieren'}
          </button>
        </div>
      </div>
    </div>
  );
}

function usePositionedStyle(
  x: number,
  y: number,
  ref: React.RefObject<HTMLDivElement | null>,
): React.CSSProperties {
  const [style, setStyle] = useState<React.CSSProperties>({ top: y + 12, left: x + 8, opacity: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top = y + 12;
    let left = x + 8;

    if (left + rect.width > vw - 12) left = x - rect.width - 8;
    if (top + rect.height > vh - 12) top = y - rect.height - 8;
    if (left < 8) left = 8;
    if (top < 8) top = 8;

    setStyle({ top, left, opacity: 1 });
  }, [x, y, ref]);

  return style;
}
