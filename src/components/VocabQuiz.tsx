import { useState, useMemo } from 'react';
import { studyData } from '../study-data';
import { ArrowLeft, Zap } from 'lucide-react';
import { TopicPicker } from './Flashcards';
import { AnswerFeedback } from './AnswerFeedback';

interface VocabQuizProps {
  onBack: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface QuizQuestion {
  german: string;
  article?: string;
  correctEnglish: string;
  options: string[];
}

function generateQuestions(topicId: string): QuizQuestion[] {
  const topic = studyData.vocabulary.find(t => t.id === topicId);
  if (!topic) return [];

  // Get all english words for wrong answers
  const allEnglish = studyData.vocabulary.flatMap(t => t.words.map(w => w.english));

  return shuffle(topic.words).map(word => {
    // Pick 3 wrong answers from other words
    const wrongAnswers = shuffle(
      allEnglish.filter(e => e !== word.english),
    ).slice(0, 3);

    const options = shuffle([word.english, ...wrongAnswers]);

    return {
      german: word.german,
      article: word.article,
      correctEnglish: word.english,
      options,
    };
  });
}

export function VocabQuiz({ onBack }: VocabQuizProps) {
  const [topicId, setTopicId] = useState<string | null>(null);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [finished, setFinished] = useState(false);

  const questions = useMemo(() => {
    if (!topicId) return [];
    return generateQuestions(topicId);
  }, [topicId]);

  const topic = topicId ? studyData.vocabulary.find(t => t.id === topicId) : null;
  const question = questions[questionIdx];
  const total = questions.length;

  function handleSelect(option: string) {
    if (showFeedback) return;
    setSelected(option);
    const isCorrect = option === question.correctEnglish;
    if (isCorrect) {
      setScore(s => s + 1);
      setStreak(s => {
        const next = s + 1;
        setMaxStreak(m => Math.max(m, next));
        return next;
      });
    } else {
      setStreak(0);
    }
    setShowFeedback(true);
  }

  function handleContinue() {
    setShowFeedback(false);
    setSelected(null);
    if (questionIdx < total - 1) {
      setQuestionIdx(i => i + 1);
    } else {
      setFinished(true);
    }
  }

  function restart() {
    setTopicId(null);
    setQuestionIdx(0);
    setSelected(null);
    setShowFeedback(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setFinished(false);
  }

  // ── Topic picker ────────────────────────────────────────────────
  if (!topicId) {
    return (
      <TopicPicker
        topics={studyData.vocabulary}
        onSelect={setTopicId}
        onBack={onBack}
        title="Vokabel-Quiz"
        subtitle="Wähle ein Thema"
      />
    );
  }

  // ── Finished ────────────────────────────────────────────────────
  if (finished) {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <div className="min-h-dvh flex flex-col bg-exam-bg">
        <div className="bg-white border-b-2 border-card-border px-4 py-3 flex items-center gap-3 shrink-0">
          <button onClick={restart} className="text-gray-400 hover:text-telc transition-colors p-1">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-extrabold text-lg">Ergebnis</h1>
        </div>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="card !rounded-2xl p-8 text-center max-w-md w-full bounce-in">
            <div className="text-5xl font-extrabold mb-2">{pct}%</div>
            <div className="text-lg font-bold text-gray-600 mb-4">{score} / {total} richtig</div>
            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-extrabold text-section-lesen">{maxStreak}</div>
                <div className="text-xs text-gray-400 font-bold">Beste Serie</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-extrabold text-correct">{score}</div>
                <div className="text-xs text-gray-400 font-bold">Richtig</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-extrabold text-wrong">{total - score}</div>
                <div className="text-xs text-gray-400 font-bold">Falsch</div>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={restart} className="btn-3d btn-3d-primary">
                Nochmal spielen
              </button>
              <button onClick={onBack} className="btn-3d btn-3d-secondary">
                Zurück
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!question) return null;

  const isCorrect = selected === question.correctEnglish;
  const progressPct = total > 0 ? ((questionIdx + 1) / total) * 100 : 0;

  return (
    <div className="min-h-dvh flex flex-col bg-exam-bg">
      {/* Header */}
      <div className="bg-white border-b-2 border-card-border px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={restart} className="text-gray-400 hover:text-telc transition-colors p-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-extrabold text-lg">Vokabel-Quiz</h1>
        <span className="text-xs text-gray-400 font-medium">— {topic?.name}</span>
        <div className="flex-1" />
        {streak >= 2 && (
          <span className="section-strip bg-section-lesen-light text-section-lesen-dark">
            <Zap size={12} /> {streak}x Serie
          </span>
        )}
        <span className="text-xs font-bold bg-telc-light text-telc-dark px-2.5 py-1 rounded-full">
          {questionIdx + 1} / {total}
        </span>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 flex flex-col gap-6">
        {/* Progress */}
        <div className="progress-track !h-2">
          <div className="progress-fill bg-telc" style={{ width: `${progressPct}%` }} />
        </div>

        {/* Question */}
        <div className="card !rounded-2xl p-8 text-center fade-in">
          <div className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-2">Was bedeutet:</div>
          <div className="text-3xl font-extrabold text-gray-800">
            {question.article ? `${question.article} ` : ''}{question.german}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2">
          {question.options.map((opt) => {
            let extraClass = '';
            if (showFeedback) {
              if (opt === question.correctEnglish) extraClass = 'selected'; // green
              else if (opt === selected && !isCorrect) extraClass = '!border-wrong !bg-wrong/5';
            } else if (selected === opt) {
              extraClass = 'selected';
            }

            return (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                disabled={showFeedback}
                className={`option-card w-full !justify-center !text-center ${extraClass}`}
              >
                <span className="font-bold">{opt}</span>
              </button>
            );
          })}
        </div>
      </main>

      {/* Feedback */}
      {showFeedback && (
        <AnswerFeedback
          isCorrect={isCorrect}
          correctAnswer={question.correctEnglish}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
}
