import { CheckCircle, XCircle } from 'lucide-react';

interface AnswerFeedbackProps {
  isCorrect: boolean;
  correctAnswer: string;
  onContinue: () => void;
}

export function AnswerFeedback({ isCorrect, correctAnswer, onContinue }: AnswerFeedbackProps) {
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 bounce-in ${
      isCorrect ? 'bg-correct' : 'bg-wrong'
    }`}>
      <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3 text-white">
          {isCorrect ? (
            <>
              <CheckCircle size={28} className="shrink-0" />
              <div>
                <div className="font-extrabold text-lg">Richtig!</div>
                <div className="text-sm text-white/80 font-medium">Weiter so!</div>
              </div>
            </>
          ) : (
            <>
              <XCircle size={28} className="shrink-0" />
              <div>
                <div className="font-extrabold text-lg">Falsch</div>
                <div className="text-sm text-white/80 font-medium">
                  Richtige Antwort: <strong className="text-white">{correctAnswer}</strong>
                </div>
              </div>
            </>
          )}
        </div>
        <button
          onClick={onContinue}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
            isCorrect
              ? 'bg-white text-correct hover:bg-white/90'
              : 'bg-white text-wrong hover:bg-white/90'
          }`}
        >
          Weiter
        </button>
      </div>
    </div>
  );
}
