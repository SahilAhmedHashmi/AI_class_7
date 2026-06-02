import { useState } from 'react';
import type { RegressionPhase } from './useGradientDescent';

interface PredictionPanelProps {
  predictionX: number;
  predictedY: number;
  onPredictionXChange: (value: number) => void;
  hasPoints: boolean;
  phase?: RegressionPhase;
}

export function PredictionPanel({ predictionX, predictedY, onPredictionXChange, hasPoints, phase = 'TESTING_PHASE' }: PredictionPanelProps) {
  const [localValue, setLocalValue] = useState<string>(predictionX.toString());

  const handlePredict = () => {
    const value = parseFloat(localValue);
    if (!isNaN(value) && value >= 0 && value <= 12) {
      onPredictionXChange(value);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePredict();
    }
  };

  return (
    <div className="prediction-panel">
      <div className="prediction-header">
        <div className="prediction-title">MAKE A PREDICTION</div>
      </div>
      <div className="prediction-row">
        <label htmlFor="study-hours-input">Study Hours =</label>
        <input
          id="study-hours-input"
          type="number"
          min="0"
          max="12"
          step="0.1"
          value={localValue}
          onChange={(event) => setLocalValue(event.target.value)}
          onKeyPress={handleKeyPress}
          className="prediction-input"
        />
      </div>
      <button 
        type="button"
        className="glow-button"
        onClick={handlePredict}
        style={{ width: '100%', marginTop: '12px' }}
      >
        Predict Marks
      </button>
      <div className="prediction-result">
        <div className="prediction-label">Predicted Marks</div>
        <div className="prediction-value">{predictedY.toFixed(1)}</div>
      </div>
      <div className="prediction-note">
        {hasPoints ? 'The AI uses the learned pattern to estimate marks.' : 'Add observations to activate the prediction model.'}
      </div>
    </div>
  );
}
