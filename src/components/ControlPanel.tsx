interface ControlPanelProps {
  onGenerate: () => void;
  onClear: () => void;
  onPause: () => void;
  onResume: () => void;
  learningRate: number;
  onLearningRateChange: (value: number) => void;
  isRunning: boolean;
}

export function ControlPanel({
  onGenerate,
  onClear,
  onPause,
  onResume,
  learningRate,
  onLearningRateChange,
  isRunning,
}: ControlPanelProps) {
  return (
    <div className="control-panel">
      <div className="control-row">
        <button type="button" className="glow-button" onClick={onGenerate}>
          Generate Sample Data
        </button>
        <button type="button" className="ghost-button" onClick={onClear}>
          Clear Data
        </button>
      </div>
      <div className="control-row">
        {isRunning ? (
          <button type="button" className="ghost-button" onClick={onPause}>
            Pause Training
          </button>
        ) : (
          <button type="button" className="glow-button" onClick={onResume}>
            Resume Training
          </button>
        )}
      </div>
      <div className="control-row control-slider-row">
        <label htmlFor="learning-rate">Learning Rate</label>
        <div className="slider-row">
          <input
            id="learning-rate"
            type="range"
            min="0.0001"
            max="0.1"
            step="0.0001"
            value={learningRate}
            onChange={(event) => onLearningRateChange(Number(event.target.value))}
          />
          <span>{learningRate.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
}
