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
import { WordLookupProvider } from './components/WordPopup';
import { type ExamLevel, loadActiveLevel, saveActiveLevel } from './levelConfig';
import { ExamPicker } from './components/ExamPicker';
import { WeaknessDetail } from './components/WeaknessDetail';

type Screen = 'home' | 'exam-picker' | 'section-picker' | 'hoeren' | 'lesen' | 'schreiben' | 'sprechen' | 'scoring' | 'results' | 'study' | 'history' | 'weakness';
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
  const [level, setLevel] = useState<ExamLevel>(loadActiveLevel);
  const [testId, setTestId] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>('practice');
  const [result, setResult] = useState<ExamResult | null>(null);
  const [practiceSection, setPracticeSection] = useState<Section>('hoeren');
  const [practiceTeile, setPracticeTeile] = useState<Teil[] | null>(null); // null = all
  const [abandonConfirm, setAbandonConfirm] = useState(false);
  const answersRef = useRef<Answer[]>([]);

  // Tests available for the current level
  const levelTests = tests.filter(t => t.level === level);
  const test = tests.find(t => t.id === testId) ?? levelTests[0] ?? tests[0];

  function handleLevelChange(l: ExamLevel) {
    setLevel(l);
    saveActiveLevel(l);
    setTestId(null); // reset to first test of new level
  }

  // ── Navigation ──────────────────────────────────────────────────

  // Called from Home → go to exam picker first
  function handleGoToExamPicker() {
    setScreen('exam-picker');
  }

  // Called from ExamPicker after choosing a test
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

    let schreibenFeedback: string | undefined;
    if (section === 'hoeren' || section === 'lesen') {
      score = scoreMC(section, newAnswers);
    } else {
      // schreiben — async LLM scoring
      setScreen('scoring');
      const result = await scoreSchreibenFn(newAnswers);
      score = result.score;
      schreibenFeedback = result.feedback || undefined;
    }

    const practiceResult: ExamResult = {
      testId: test.id,
      level,
      sections: [score],
      totalPoints: score.points,
      maxPoints: score.maxPoints,
      passed: score.passed,
      schreibenFeedback,
    };
    savePracticeResult(practiceResult, section, level);
    setResult(practiceResult);
    setScreen('results');
  }

  async function handleSprechenDone(conversation: ChatMessage[]) {
    setScreen('scoring');
    try {
      const spResult = await scoreSprechenFn(conversation);

      const spScore: SectionScore = {
        section: 'sprechen', correct: 0, total: 0,
        points: spResult.score, maxPoints: 15,
        passed: spResult.score >= 9,
      };

      if (mode === 'practice') {
        const practiceResult: ExamResult = {
          testId: test.id,
          level,
          sections: [spScore],
          totalPoints: spScore.points,
          maxPoints: spScore.maxPoints,
          passed: spScore.passed,
          sprechenFeedback: spResult.feedback,
        };
        savePracticeResult(practiceResult, 'sprechen', level);
        setResult(practiceResult);
        setScreen('results');
        return;
      }

      // Full exam: score all sections together
      const all = answersRef.current;
      const hScore = scoreMC('hoeren', all);
      const lScore = scoreMC('lesen', all);
      const { score: sScore, feedback: schreibenFeedback } = await scoreSchreibenFn(all);
      const sections = [hScore, lScore, sScore, spScore];
      const totalPoints = sections.reduce((s, sec) => s + sec.points, 0);
      const maxPoints = sections.reduce((s, sec) => s + sec.maxPoints, 0);

      const examResult: ExamResult = {
        testId: test.id, level, sections, totalPoints, maxPoints,
        passed: totalPoints >= maxPoints * 0.6 && sections.every(s => s.passed),
        sprechenFeedback: spResult.feedback,
        schreibenFeedback: schreibenFeedback || undefined,
      };
      saveResult(examResult, level);
      setResult(examResult);
      setScreen('results');
    } catch (err) {
      console.error('Sprechen scoring failed:', err);
      setScreen('home');
    }
  }

  function goHome() {
    setAbandonConfirm(false);
    setScreen('home');
  }

  function handleAbandon() {
    setAbandonConfirm(false);
    if (mode === 'practice') {
      setScreen('section-picker');
    } else {
      goHome();
    }
  }

  function restartPractice() {
    answersRef.current = [];
    setResult(null);
    // If Teile were pre-selected, skip the picker and go straight back
    if (practiceTeile !== null) {
      setScreen(practiceSection);
    } else {
      setScreen('section-picker');
    }
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

  async function scoreSchreibenFn(allAnswers: Answer[]): Promise<{ score: SectionScore; feedback: string }> {
    const hasT1 = allAnswers.some(a => a.section === 'schreiben' && a.teil === 'teil1');
    const hasT2 = allAnswers.some(a => a.section === 'schreiben' && a.teil === 'teil2');

    let pts = 0;
    let maxPts = 0;
    let t1ok = 0;
    let feedback = '';
    const fields = test.schreiben.teil1.fields;

    if (hasT1) {
      maxPts += 5;
      if (test.schreiben.teil1.mode === 'letter') {
        // Letter mode (B1+): score as free text
        const letterAns = allAnswers.find(a => a.section === 'schreiben' && a.teil === 'teil1' && a.itemId === 0)?.value || '';
        const t1MinWords = test.schreiben.teil1.minWords ?? 50;
        if (isLLMConfigured() && letterAns.trim()) {
          try {
            const r = await evaluateSchreiben(
              test.schreiben.teil1.personCard.join('\n'), [], letterAns, t1MinWords,
            );
            pts += Math.min(5, (r.score / 10) * 5);
            feedback = (feedback ? feedback + '\n\n' : '') + (r.feedback || '');
          } catch {
            const wc = letterAns.trim().split(/\s+/).filter(Boolean).length;
            pts += Math.round(Math.min(1, wc / Math.max(1, t1MinWords)) * 5);
          }
        } else {
          const wc = letterAns.trim().split(/\s+/).filter(Boolean).length;
          pts += Math.round(Math.min(1, wc / Math.max(1, t1MinWords)) * 5);
        }
      } else {
        // Standard form mode (A1/A2): field matching
        for (let i = 0; i < fields.length; i++) {
          const a = allAnswers.find(
            ans => ans.section === 'schreiben' && ans.teil === 'teil1' && ans.itemId === i,
          );
          if (a && matchField(fields[i].answer, a.value)) t1ok++;
        }
        pts += fields.length > 0 ? (t1ok / fields.length) * 5 : 0;
      }
    }

    if (hasT2) {
      maxPts += 10;
      const textAns = allAnswers.find(a => a.section === 'schreiben' && a.teil === 'teil2')?.value || '';
      if (isLLMConfigured() && textAns.trim()) {
        try {
          const r = await evaluateSchreiben(
            test.schreiben.teil2.situation, test.schreiben.teil2.bullets,
            textAns, test.schreiben.teil2.minWords,
          );
          pts += Math.min(10, r.score);
          feedback = r.feedback || '';
        } catch {
          const wc = textAns.trim().split(/\s+/).filter(Boolean).length;
          pts += Math.round(Math.min(1, wc / Math.max(1, test.schreiben.teil2.minWords)) * 10);
        }
      } else {
        const wc = textAns.trim().split(/\s+/).filter(Boolean).length;
        pts += Math.round(Math.min(1, wc / Math.max(1, test.schreiben.teil2.minWords)) * 10);
      }
    }

    const effectiveMax = maxPts || 15;
    pts = Math.round(pts * 10) / 10;
    return {
      score: {
        section: 'schreiben', correct: t1ok, total: hasT1 ? fields.length : 0,
        points: pts, maxPoints: effectiveMax, passed: pts >= effectiveMax * 0.6,
      },
      feedback,
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
        tests={levelTests}
        level={level}
        onLevelChange={handleLevelChange}
        onStartExam={handleGoToExamPicker}
        onPractice={handlePracticeSection}
        onStudy={() => setScreen('study')}
        onHistory={() => setScreen('history')}
        onWeakness={() => setScreen('weakness')}
      />
    );
  }

  if (screen === 'exam-picker') {
    return (
      <ExamPicker
        tests={levelTests}
        onStart={handleStartExam}
        onBack={() => setScreen('home')}
      />
    );
  }

  if (screen === 'weakness') {
    return (
      <WeaknessDetail
        level={level}
        onPractice={(section) => handlePracticeSection(test.id, section)}
        onStudy={() => setScreen('study')}
        onBack={() => setScreen('home')}
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
    return <Study level={level} onBack={goHome} />;
  }

  if (screen === 'history') {
    return <History onBack={goHome} />;
  }

  if (screen === 'results' && !result) {
    setScreen('home');
    return null;
  }

  if (screen === 'results' && result) {
    return (
      <Results
        result={result}
        mode={mode}
        onRestart={mode === 'exam' ? () => handleStartExam(testId ?? test.id) : restartPractice}
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
          {/* Logo — home shortcut */}
          <button
            onClick={() => setAbandonConfirm(true)}
            className="shrink-0"
            title="Zur Startseite"
          >
            <img src="/logo.png" alt="telc sim" style={{width:'36px',height:'36px',filter:'drop-shadow(0 2px 6px rgba(0,0,0,0.4))'}} />
          </button>
          <span className="text-gray-200">|</span>
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
            <p className="font-extrabold text-gray-800 text-lg">
              {mode === 'practice' ? 'Übung beenden?' : 'Prüfung beenden?'}
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              {mode === 'practice'
                ? 'Dein Fortschritt in dieser Übung geht verloren.'
                : 'Dein Fortschritt in dieser Prüfung geht verloren und wird nicht gespeichert.'}
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

      {/* Section content — wrapped in WordLookupProvider in practice mode */}
      <WordLookupProvider enabled={mode === 'practice'}>
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
      </WordLookupProvider>
    </div>
  );
}

export default App;
