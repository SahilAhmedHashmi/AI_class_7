interface PredictionPanelProps {
  studyHours: number;
  predictedMarks: number | null;
  onStudyHoursChange: (value: number) => void;
  onPredict: () => void;
}

export function PredictionPanel({ studyHours, predictedMarks, onStudyHoursChange, onPredict }: PredictionPanelProps) {
  return (
    <div className="prediction-panel">
      <div className="prediction-header">
        <div className="prediction-title">MODEL OUTPUT</div>
        <div className="prediction-subtitle">The AI is now ready to make predictions.</div>
      </div>
      <div className="prediction-row">
        <label htmlFor="study-hours">Study Hours</label>
        <input
          id="study-hours"
          type="number"
          min="0"
          max="12"
          step="0.1"
          value={studyHours}
          onChange={(event) => onStudyHoursChange(Number(event.target.value))}
        />
      </div>
      <button type="button" className="glow-button" onClick={onPredict}>
        Predict Marks
      </button>
      <div className="prediction-result">
        <div className="prediction-label">Predicted Marks</div>
        <div className="prediction-value">
          {predictedMarks === null ? '--' : Math.round(predictedMarks)}
        </div>
      </div>
      <div className="prediction-note">The highlighted point shows the AI's prediction.</div>
    </div>
  );
}
