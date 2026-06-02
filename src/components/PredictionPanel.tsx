interface PredictionPanelProps {
  predictionX: number;
  predictedY: number;
  onPredictionXChange: (value: number) => void;
  hasPoints: boolean;
}

export function PredictionPanel({ predictionX, predictedY, onPredictionXChange, hasPoints }: PredictionPanelProps) {
  return (
    <div className="prediction-panel">
      <div className="prediction-header">
        <div className="prediction-title">MODEL OUTPUT</div>
        <div className="prediction-subtitle">Predicted Sleep Time</div>
      </div>
      <div className="prediction-row">
        <label htmlFor="study-hours">Study Hours =</label>
        <input
          id="study-hours"
          type="number"
          min="0"
          max="12"
          step="0.1"
          value={predictionX}
          onChange={(event) => onPredictionXChange(Number(event.target.value))}
        />
      </div>
      <div className="prediction-result">
        <div className="prediction-label">Predicted Sleep</div>
        <div className="prediction-value">{predictedY.toFixed(2)} hours</div>
      </div>
      <div className="prediction-note">
        {hasPoints ? 'The AI uses current data to estimate sleep time.' : 'Add observations to activate the prediction model.'}
      </div>
    </div>
  );
}
