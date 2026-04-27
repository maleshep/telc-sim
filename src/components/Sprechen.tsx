import { useState, useRef, useEffect } from 'react';
import type { SprechenTeil, Teil } from '../types';
import type { ChatMessage } from '../llm';
import { speak, stopSpeaking, isSTTAvailable, listen } from '../speech';
import { examinerFollowUp, isLLMConfigured } from '../llm';
import { Mic, Volume2, ChevronRight, MessageSquare, RotateCcw } from 'lucide-react';

interface SprechenProps {
  data: { teil1: SprechenTeil; teil2: SprechenTeil; teil3: SprechenTeil };
  teile?: Teil[] | null;
  onComplete: (conversation: ChatMessage[]) => void;
}

const ALL_TEILE: Teil[] = ['teil1', 'teil2', 'teil3'];
const TEIL_LABELS = ['Teil 1 — Sich vorstellen', 'Teil 2 — Um etwas bitten', 'Teil 3 — Auf eine Bitte reagieren'];

export function Sprechen({ data, teile, onComplete }: SprechenProps) {
  const TEILE = teile && teile.length > 0 ? teile : ALL_TEILE;
  const [teilIdx, setTeilIdx] = useState(0);
  const [promptIdx, setPromptIdx] = useState(0);
  const [phase, setPhase] = useState<'instruction' | 'prompt' | 'recording' | 'response' | 'examiner'>('instruction');
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [transcript, setTranscript] = useState('');
  const [examinerText, setExaminerText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [interimText, setInterimText] = useState('');
  const convRef = useRef<ChatMessage[]>([]);

  // Stop any playing audio when the component unmounts
  useEffect(() => () => { stopSpeaking(); }, []);

  const teil = TEILE[teilIdx];
  const teilData = data[teil];
  const prompt = teilData.prompts[promptIdx];
  const hasSTT = isSTTAvailable();
  const hasLLM = isLLMConfigured();

  const totalPrompts = TEILE.reduce((sum, t) => sum + data[t].prompts.length, 0);
  const completedPrompts = TEILE.slice(0, teilIdx).reduce((sum, t) => sum + data[t].prompts.length, 0) + promptIdx;

  async function playInstruction() {
    setIsSpeaking(true);
    try { await speak(teilData.instruction); } catch { /* ignore */ }
    setIsSpeaking(false);
  }

  async function startRecording() {
    if (!hasSTT) return;
    setIsRecording(true);
    setPhase('recording');
    setTranscript('');
    setInterimText('');
    try {
      const text = await listen('de-DE', 30000, (interim) => setInterimText(interim));
      setTranscript(text);
    } catch {
      setTranscript('');
    }
    setIsRecording(false);
    setInterimText('');
    setPhase('response');
  }

  function submitManualInput() {
    setTranscript(manualInput);
    setManualInput('');
    setPhase('response');
  }

  async function confirmResponse() {
    const userMsg: ChatMessage = {
      role: 'user',
      content: `[Teil ${teilIdx + 1}, Aufgabe: ${prompt}] ${transcript}`,
    };
    const updated = [...conversation, userMsg];

    if (hasLLM && transcript.trim()) {
      try {
        const followUp = await examinerFollowUp(teilIdx + 1, prompt, transcript);
        const examinerMsg: ChatMessage = { role: 'assistant', content: followUp };
        const withExaminer = [...updated, examinerMsg];
        setExaminerText(followUp);
        convRef.current = withExaminer;
        setConversation(withExaminer);
        setIsSpeaking(true);
        try { await speak(followUp); } catch { /* ignore */ }
        setIsSpeaking(false);
        setPhase('examiner');
        return;
      } catch { /* fall through to next prompt */ }
    }

    convRef.current = updated;
    setConversation(updated);
    advanceToNext(updated);
  }

  function advanceToNext(conv: ChatMessage[]) {
    if (promptIdx < teilData.prompts.length - 1) {
      setPromptIdx(p => p + 1);
      setTranscript('');
      setExaminerText('');
      setPhase('prompt');
    } else if (teilIdx < TEILE.length - 1) {
      setTeilIdx(t => t + 1);
      setPromptIdx(0);
      setTranscript('');
      setExaminerText('');
      setPhase('instruction');
    } else {
      onComplete(conv);
    }
  }

  function handleExaminerDone() {
    advanceToNext(convRef.current);
  }

  // ── Instruction ─────────────────────────────────────────────────
  if (phase === 'instruction') {
    return (
      <div className="max-w-2xl mx-auto p-6 fade-in">
        <div className="card !rounded-2xl p-8 text-center">
          <div className="section-strip bg-telc-light text-telc-dark mb-6">
            <MessageSquare size={14} />
            Sprechen — {TEIL_LABELS[teilIdx]}
          </div>
          <p className="text-gray-700 text-lg leading-relaxed mb-4 max-w-lg mx-auto">
            {teilData.instruction}
          </p>
          {teilData.exampleResponse && (
            <div className="bg-exam-bg rounded-xl p-4 text-left text-sm text-gray-600 mb-6 max-w-lg mx-auto border-2 border-card-border">
              <span className="font-bold text-gray-700">Beispiel: </span>
              {teilData.exampleResponse}
            </div>
          )}
          <div className="flex justify-center gap-3">
            <button
              onClick={playInstruction}
              disabled={isSpeaking}
              className="btn-3d btn-3d-secondary"
            >
              <Volume2 size={18} />
              Anhören
            </button>
            <button
              onClick={() => { stopSpeaking(); setPhase('prompt'); }}
              className="btn-3d btn-3d-primary"
            >
              Starten <ChevronRight size={18} className="inline ml-1" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Prompt / Recording / Response / Examiner ────────────────────
  return (
    <div className="max-w-2xl mx-auto p-6 fade-in">
      {/* Progress */}
      <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
        <span className="font-semibold">
          <span className="text-telc">Sprechen</span> — {TEIL_LABELS[teilIdx]}
        </span>
        <span className="text-xs font-bold bg-telc-light text-telc-dark px-2.5 py-1 rounded-full">
          {completedPrompts + 1} / {totalPrompts}
        </span>
      </div>
      <div className="progress-track mb-6">
        <div
          className="progress-fill bg-telc"
          style={{ width: `${((completedPrompts + 1) / totalPrompts) * 100}%` }}
        />
      </div>

      <div className="card !rounded-2xl p-6 md:p-8 space-y-6">
        {/* Prompt card */}
        <div className="bg-telc-light border-2 border-telc/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <MessageSquare size={20} className="text-telc shrink-0 mt-0.5" />
            <p className="text-gray-800 font-bold">{prompt}</p>
          </div>
        </div>

        {/* Phase: prompt — show record button */}
        {phase === 'prompt' && (
          <div className="text-center space-y-4 py-2">
            <p className="text-gray-500 text-sm font-medium">
              {hasSTT
                ? 'Klicken Sie auf das Mikrofon und sprechen Sie.'
                : 'Spracherkennung nicht verfügbar — tippen Sie Ihre Antwort.'}
            </p>
            {hasSTT ? (
              <button
                onClick={startRecording}
                className="btn-3d btn-3d-danger !rounded-full !w-20 !h-20 !p-0 mx-auto"
              >
                <Mic size={28} />
              </button>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={manualInput}
                  onChange={e => setManualInput(e.target.value)}
                  placeholder="Ihre Antwort auf Deutsch..."
                  rows={3}
                  className="w-full px-4 py-3 text-base"
                />
                <button
                  onClick={submitManualInput}
                  disabled={!manualInput.trim()}
                  className="btn-3d btn-3d-primary"
                >
                  Antwort senden
                </button>
              </div>
            )}
          </div>
        )}

        {/* Phase: recording */}
        {phase === 'recording' && isRecording && (
          <div className="text-center space-y-4 py-4">
            <div className="w-20 h-20 rounded-full bg-wrong text-white flex items-center justify-center mx-auto animate-pulse-record shadow-lg">
              <Mic size={28} />
            </div>
            <p className="text-wrong font-bold">Aufnahme läuft...</p>
            {/* Live interim transcript */}
            <div className="min-h-[48px] bg-exam-bg border-2 border-dashed border-wrong/30 rounded-xl px-4 py-3 text-left">
              {interimText ? (
                <p className="text-gray-700 font-medium text-sm leading-relaxed">{interimText}<span className="inline-block w-0.5 h-4 bg-wrong ml-0.5 animate-pulse align-middle" /></p>
              ) : (
                <p className="text-gray-400 text-sm italic">Sprechen Sie jetzt...</p>
              )}
            </div>
          </div>
        )}

        {/* Phase: response — show transcript + confirm */}
        {phase === 'response' && (
          <div className="space-y-4 slide-in">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1.5">Ihre Antwort:</label>
              <div className="bg-exam-bg rounded-xl p-4 border-2 border-card-border text-gray-800 min-h-[60px]">
                {transcript || <span className="text-gray-400 italic">Keine Antwort erkannt</span>}
              </div>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setPhase('prompt')}
                className="btn-3d btn-3d-secondary"
              >
                <RotateCcw size={16} />
                Nochmal
              </button>
              <button
                onClick={confirmResponse}
                className="btn-3d btn-3d-primary"
              >
                Bestätigen <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Phase: examiner — show follow-up, then continue */}
        {phase === 'examiner' && (
          <div className="space-y-4 slide-in">
            <div className="bg-section-hoeren-light rounded-xl p-5 border-2 border-section-hoeren/20">
              <p className="text-sm font-bold text-section-hoeren mb-1.5">Prüfer/in:</p>
              <p className="text-gray-800 font-medium">{examinerText}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleExaminerDone}
                className="btn-3d btn-3d-primary"
              >
                Weiter <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
