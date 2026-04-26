import { useState, useRef } from 'react';
import type { Section, Teil, Answer, ExamResult, SectionScore } from './types';
import { evaluateSprechen, evaluateSchreiben, isLLMConfigured, type ChatMessage } from './llm';
import { tests } from './data';
import { Home } from './components/Home';
import { SectionPicker } from './components/SectionPicker';
import { Hoeren } from './components/Hoeren';
import { Lesen } from './components/Lesen';
import { Schreiben } from './components/Schreiben';
import { Sprechen } from './components/Sprechen';
import { Results } from './components/Results';
import { Study } from './components/Study';
import { History } from './components/History';
import { saveResult, savePracticeResult } from './history';

type Screen = 'home' | 'section-picker' | 'hoeren' | 'lesen' | 'schreiben' | 'sprechen' | 'scoring' | 'results' | 'study' | 'history';
type Mode = 'exam' | 'practice';

// Fixed exam sequence
const EXAM_SECTIONS: Screen[] = ['hoeren', 'lesen', 'schreiben', 'sprechen'];
const LABELS: Record<string, string> = {
  hoeren: 'Hören',
  lesen: 'Lesen',
  schreiben: 'Schreiben',
  sprechen: 'Sprechen',
};

function matchField(expected: string, actual: string): boolean {
  if (!actual) return false;
  const norm = (s: string) => s.toLowerCase().trim().replace(/[\s.\-/,;:]+/g, ' ').trim();
  return norm(expected) === norm(actual);
}

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [testId, setTestId] = useState(1);
  const [mode, setMode] = useState<Mode>('practice');
  const [result, setResult] = useState<ExamResult | null>(null);
  const [practiceSection, setPracticeSection] = useState<Section>('hoeren');
  const [practiceTeile, setPracticeTeile] = useState<Teil[] | null>(null); // null = all
  const [abandonConfirm, setAbandonConfirm] = useState(false);
  const answersRef = useRef<Answer[]>([]);

  const test = tests.find(t => t.id === testId) || tests[0];

  // ── Navigation ──────────────────────────────────────────────────

  function handleStartExam(id: number) {
    setTestId(id);
    setMode('exam');
    setPracticeTeile(null);
    answersRef.current = [];
    setResult(null);
    setAbandonConfirm(false);
    setScreen('hoeren');
  }

  function handlePracticeSection(_id: number, section: Section) {
    setPracticeSection(section);
    setMode('practice');
    answersRef.current = [];
    setResult(null);
    setAbandonConfirm(false);
    setScreen('section-picker');
  }

  function handleSectionPickerStart(teil: Teil | 'all') {
    if (teil === 'all') {
      setPracticeTeile(null);
    } else {
      setPracticeTeile([teil]);
    }
    setScreen(practiceSection);
  }

  // Unified session handler — exam advances through the fixed sequence;
  // practice scores the section immediately and shows results.
  async function handleSectionDone(newAnswers: Answer[], next: Screen) {
    answersRef.current = [...answersRef.current, ...newAnswers];

    if (mode === 'exam') {
      setScreen(next);
      return;
    }

    // Practice mode: score this section and surface results
    const section = screen as Section;
    let score: SectionScore;

    if (section === 'hoeren' || section === 'lesen') {
      score = scoreMC(section, newAnswers);
    } else {
      // schreiben — async LLM scoring
      setScreen('scoring');
      score = await scoreSchreibenFn(newAnswers);
    }

    const practiceResult: ExamResult = {
      testId: test.id,
      sections: [score],
      totalPoints: score.points,
      maxPoints: score.maxPoints,
      passed: score.passed,
    };
    savePracticeResult(practiceResult, section);
    setResult(practiceResult);
    setScreen('results');
  }

  async function handleSprechenDone(conversation: ChatMessage[]) {
    setScreen('scoring');
    const spResult = await scoreSprechenFn(conversation);

    const spScore: SectionScore = {
      section: 'sprechen', correct: 0, total: 0,
      points: spResult.score, maxPoints: 15,
      passed: spResult.score >= 9,
    };

    if (mode === 'practice') {
      const practiceResult: ExamResult = {
        testId: test.id,
        sections: [spScore],
        totalPoints: spScore.points,
        maxPoints: spScore.maxPoints,
        passed: spScore.passed,
        sprechenFeedback: spResult.feedback,
      };
      savePracticeResult(practiceResult, 'sprechen');
      setResult(practiceResult);
      setScreen('results');
      return;
    }

    // Full exam: score all sections together
    const all = answersRef.current;
    const hScore = scoreMC('hoeren', all);
    const lScore = scoreMC('lesen', all);
    const sScore = await scoreSchreibenFn(all);
    const sections = [hScore, lScore, sScore, spScore];
    const totalPoints = sections.reduce((s, sec) => s + sec.points, 0);
    const maxPoints = sections.reduce((s, sec) => s + sec.maxPoints, 0);

    const examResult: ExamResult = {
      testId: test.id, sections, totalPoints, maxPoints,
      passed: totalPoints >= maxPoints * 0.6 && sections.every(s => s.passed),
      sprechenFeedback: spResult.feedback,
    };
    saveResult(examResult);
    setResult(examResult);
    setScreen('results');
  }

  function goHome() {
    setAbandonConfirm(false);
    setScreen('home');
  }

  function handleAbandon() {
    setAbandonConfirm(false);
    goHome();
  }

  function restartPractice() {
    answersRef.current = [];
    setResult(null);
    setScreen('section-picker');
  }

  // ── Scoring helpers ─────────────────────────────────────────────

  function scoreMC(section: Section, allAnswers: Answer[]): SectionScore {
    const sData = section === 'hoeren' ? test.hoeren : test.lesen;
    const allItems = [
      ...sData.teil1.items.map(i => ({ teil: 'teil1' as Teil, id: i.id, correct: i.correct })),
      ...sData.teil2.items.map(i => ({ teil: 'teil2' as Teil, id: i.id, correct: i.correct })),
      ...sData.teil3.items.map(i => ({ teil: 'teil3' as Teil, id: i.id, correct: i.correct })),
    ];

    const sectionAnswers = allAnswers.filter(a => a.section === section);
    const answeredTeile = new Set(sectionAnswers.map(a => a.teil));
    const items = answeredTeile.size > 0
      ? allItems.filter(item => answeredTeile.has(item.teil))
      : allItems;

    let correct = 0;
    for (const item of items) {
      const a = sectionAnswers.find(
        ans => ans.teil === item.teil && ans.itemId === item.id,
      );
      if (a && a.value === item.correct) correct++;
    }

    const total = items.length;
    return { section, correct, total, points: correct, maxPoints: total, passed: total > 0 && correct >= total * 0.6 };
  }

  async function scoreSchreibenFn(allAnswers: Answer[]): Promise<SectionScore> {
    const hasT1 = allAnswers.some(a => a.section === 'schreiben' && a.teil === 'teil1');
    const hasT2 = allAnswers.some(a => a.section === 'schreiben' && a.teil === 'teil2');

    let pts = 0;
    let maxPts = 0;
    let t1ok = 0;
    const fields = test.schreiben.teil1.fields;

    if (hasT1) {
      maxPts += 5;
      for (let i = 0; i < fields.length; i++) {
        const a = allAnswers.find(
          ans => ans.section === 'schreiben' && ans.teil === 'teil1' && ans.itemId === i,
        );
        if (a && matchField(fields[i].answer, a.value)) t1ok++;
      }
      pts += fields.length > 0 ? (t1ok / fields.length) * 5 : 0;
    }

    if (hasT2) {
      maxPts += 10;
      const textAns = allAnswers.find(a => a.section === 'schreiben' && a.teil === 'teil2')?.value || '';
      if (isLLMConfigured() && textAns.trim()) {
        const r = await evaluateSchreiben(
          test.schreiben.teil2.situation, test.schreiben.teil2.bullets,
          textAns, test.schreiben.teil2.minWords,
        );
        pts += Math.min(10, r.score);
      } else {
        const wc = textAns.trim().split(/\s+/).filter(Boolean).length;
        pts += Math.round(Math.min(1, wc / Math.max(1, test.schreiben.teil2.minWords)) * 10);
      }
    }

    const effectiveMax = maxPts || 15;
    pts = Math.round(pts * 10) / 10;
    return {
      section: 'schreiben', correct: t1ok, total: hasT1 ? fields.length : 0,
      points: pts, maxPoints: effectiveMax, passed: pts >= effectiveMax * 0.6,
    };
  }

  async function scoreSprechenFn(conv: ChatMessage[]): Promise<{ score: number; feedback: string }> {
    if (isLLMConfigured() && conv.length > 0) {
      const r = await evaluateSprechen(conv);
      return { score: Math.min(15, r.score), feedback: r.feedback };
    }
    const n = conv.filter(m => m.role === 'user').length;
    return {
      score: Math.min(15, n * 2),
      feedback: 'KI-Bewertung nicht verfügbar. Punktzahl basiert auf Anzahl der Antworten.',
    };
  }

  // ── Render ──────────────────────────────────────────────────────

  if (screen === 'home') {
    return (
      <Home
        tests={tests}
        onStartExam={handleStartExam}
        onPractice={handlePracticeSection}
        onStudy={() => setScreen('study')}
        onHistory={() => setScreen('history')}
      />
    );
  }

  if (screen === 'section-picker') {
    return (
      <SectionPicker
        section={practiceSection}
        onStart={handleSectionPickerStart}
        onBack={goHome}
      />
    );
  }

  if (screen === 'study') {
    return <Study onBack={goHome} />;
  }

  if (screen === 'history') {
    return <History onBack={goHome} />;
  }

  if (screen === 'results' && result) {
    return (
      <Results
        result={result}
        mode={mode}
        onRestart={mode === 'exam' ? () => handleStartExam(testId) : restartPractice}
        onHome={goHome}
      />
    );
  }

  if (screen === 'scoring') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-exam-bg">
        <div className="w-16 h-16 border-4 border-telc border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 font-bold text-lg">Ergebnisse werden berechnet...</p>
        <p className="text-gray-400 text-sm font-medium">KI-Bewertung für Schreiben und Sprechen</p>
      </div>
    );
  }

  // Exam/practice section screens
  const screenIdx = EXAM_SECTIONS.indexOf(screen);

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Navigation bar */}
      <div className="bg-white border-b-2 border-card-border px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAbandonConfirm(true)}
            className="text-sm font-bold text-gray-400 hover:text-telc transition-colors"
          >
            &larr; Zurück
          </button>
          <span className="text-gray-200">|</span>
          <span className="text-sm">
            <span className="font-bold text-telc">{test.name}</span>
            <span className="text-gray-300 mx-2">|</span>
            <span className="font-extrabold">{LABELS[screen]}</span>
          </span>
        </div>
        {mode === 'exam' && (
          <div className="hidden sm:flex gap-1.5">
            {EXAM_SECTIONS.map((sec, i) => (
              <span
                key={sec}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                  i === screenIdx
                    ? 'bg-telc text-white shadow-sm'
                    : i < screenIdx
                      ? 'bg-telc-light text-telc-dark'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {LABELS[sec]}
              </span>
            ))}
          </div>
        )}
        {mode === 'practice' && (
          <span className="section-strip bg-section-lesen-light text-section-lesen-dark">
            Übungsmodus
          </span>
        )}
      </div>

      {/* Abandon confirmation modal */}
      {abandonConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 fade-in">
            <p className="font-extrabold text-gray-800 text-lg">Sitzung beenden?</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Dein Fortschritt in dieser Sektion geht verloren und wird nicht gespeichert.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleAbandon}
                className="btn-3d btn-3d-danger flex-1"
              >
                Ja, beenden
              </button>
              <button
                onClick={() => setAbandonConfirm(false)}
                className="btn-3d btn-3d-secondary flex-1"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section content */}
      <div className="flex-1">
        {screen === 'hoeren' && (
          <Hoeren
            data={test.hoeren}
            teile={mode === 'practice' ? practiceTeile : null}
            practice={mode === 'practice'}
            onComplete={a => handleSectionDone(a, 'lesen')}
          />
        )}
        {screen === 'lesen' && (
          <Lesen
            data={test.lesen}
            teile={mode === 'practice' ? practiceTeile : null}
            practice={mode === 'practice'}
            onComplete={a => handleSectionDone(a, 'schreiben')}
          />
        )}
        {screen === 'schreiben' && (
          <Schreiben
            data={test.schreiben}
            teile={mode === 'practice' ? practiceTeile : null}
            onComplete={a => handleSectionDone(a, 'sprechen')}
          />
        )}
        {screen === 'sprechen' && (
          <Sprechen
            data={test.sprechen}
            teile={mode === 'practice' ? practiceTeile : null}
            onComplete={handleSprechenDone}
          />
        )}
      </div>
    </div>
  );
}

export default App;
