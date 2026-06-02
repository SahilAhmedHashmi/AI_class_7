export interface BossQuestion {
  prompt: string;
  options: string[];
  correct: string;
  explanation: string;
}

interface QuestionPanelProps {
  question: BossQuestion;
  onSelect: (option: string) => void;
  selectedOption: string | null;
  locked: boolean;
  feedback: 'correct' | 'incorrect' | null;
  showExplanation: boolean;
}

export function QuestionPanel({ question, onSelect, selectedOption, locked, feedback, showExplanation }: QuestionPanelProps) {
  return (
    <div className="question-panel">
      <div className="question-header">
        <div className="question-title">QUESTION</div>
        <div className="question-prompt">{question.prompt}</div>
      </div>
      <div className="question-options">
        {question.options.map((option) => {
          const isSelected = option === selectedOption;
          const status = feedback && isSelected ? feedback : '';
          return (
            <button
              key={option}
              className={`question-option ${isSelected ? 'selected' : ''} ${status}`}
              onClick={() => onSelect(option)}
              disabled={locked}
            >
              {option}
            </button>
          );
        })}
      </div>
      {showExplanation && (
        <div className={`question-explanation ${feedback || ''}`}>
          <strong>{feedback === 'correct' ? 'Correct!' : feedback === 'incorrect' ? 'Incorrect' : 'Explanation'}:</strong>
          <p>{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
