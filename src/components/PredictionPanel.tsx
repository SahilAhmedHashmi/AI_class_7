import { useEffect, useState } from 'react';

interface PredictionPanelProps {
  studyHours: number;
  predictedMarks: number | null;
  onStudyHoursChange: (value: number) => void;
  onPredict: () => void;
}

const formatStudyHours = (value: number) => Number(value.toFixed(1)).toString();
const removeLeadingZeros = (value: string) => value.replace(/^0+(?=\d)/, '');

export function PredictionPanel({ studyHours, predictedMarks, onStudyHoursChange, onPredict }: PredictionPanelProps) {
  const [studyHoursInput, setStudyHoursInput] = useState(() => formatStudyHours(studyHours));

  useEffect(() => {
    setStudyHoursInput(formatStudyHours(studyHours));
  }, [studyHours]);

  const handleStudyHoursChange = (value: string) => {
    const normalizedValue = removeLeadingZeros(value);
    setStudyHoursInput(normalizedValue);
    onStudyHoursChange(Number(normalizedValue));
  };

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
          value={studyHoursInput}
          onChange={(event) => handleStudyHoursChange(event.target.value)}
        />
      </div>
      <button type="button" className="glow-button" onClick={onPredict}>
        Predict Marks
      </button>
      <div
        className={`prediction-result ${predictedMarks !== null ? 'prediction-result-highlight' : ''}`}
        key={predictedMarks === null ? 'waiting' : `prediction-${Math.round(predictedMarks)}`}
      >
        <div className="prediction-label">Predicted Marks</div>
        <div className="prediction-value">
          {predictedMarks === null ? '--' : Math.round(predictedMarks)}
        </div>
      </div>
      <div className="prediction-note">The highlighted point shows the AI's prediction.</div>
    </div>
  );
}
