import { useEffect, useRef } from 'react';
import { playSound } from '../utils/sound';
import { useGradientDescent } from './useGradientDescent';
import { RegressionGraph } from './RegressionGraph';
import { ControlPanel } from './ControlPanel';
import { PredictionPanel } from './PredictionPanel';
import './regression.css';

interface RegressionLabProps {
  onComplete: () => void;
}

export function RegressionLab({ onComplete }: RegressionLabProps) {
  const {
    points,
    addPoint,
    generateSampleData,
    clearData,
    pauseTraining,
    resumeTraining,
    learningRate,
    setLearningRate,
    status,
    loss,
    iteration,
    m,
    b,
    predictionX,
    setPredictionX,
    predictedY,
    errorMessage,
    clearError,
  } = useGradientDescent();

  const previousStatus = useRef(status);

  useEffect(() => {
    if (status === 'MODEL OPTIMIZED' && previousStatus.current !== 'MODEL OPTIMIZED') {
      playSound('success');
    }
    previousStatus.current = status;
  }, [status]);

  return (
    <div className="regression-shell">
      <div className="terminal-panel">
        <div>
          <div className="terminal-title">NEURAL PREDICTION TERMINAL</div>
          <div className="terminal-subtitle">
            Train an AI to discover the relationship between Study Time and Sleep Time.
          </div>
        </div>
        <div className={`status-pill ${status === 'MODEL OPTIMIZED' ? 'optimized' : status === 'TRAINING' ? 'training' : status === 'PAUSED' ? 'paused' : 'waiting'}`}>
          <span className="status-key">Model Status</span>
          <strong>{status}</strong>
        </div>
      </div>

        {errorMessage && (
          <div className="error-banner">
            <div className="error-text">{errorMessage}</div>
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                clearError();
                playSound('error');
              }}
            >
              Dismiss
            </button>
          </div>
        )}

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Loss</div>
          <div className="stat-value">{points.length ? loss.toFixed(2) : '---'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Iterations</div>
          <div className="stat-value">{iteration}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Observations</div>
          <div className="stat-value">{points.length}</div>
        </div>
      </div>

      <div className="regression-main-grid">
        <div className={`optimized-overlay ${status === 'MODEL OPTIMIZED' ? 'active' : ''}`} aria-hidden>
          <div className="optimized-check">
            <svg viewBox="0 0 64 64" width="72" height="72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="30" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
              <path className="checkmark" d="M18 34 L28 44 L46 22" stroke="#07131d" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
        </div>
        <RegressionGraph points={points} m={m} b={b} onAddPoint={(point) => { addPoint(point); playSound('click'); }} />

        <div className="regression-side-panel">
          <ControlPanel
            onGenerate={() => { generateSampleData(); playSound('drop'); }}
            onClear={() => clearData()}
            onPause={() => { pauseTraining(); playSound('boss'); }}
            onResume={() => { resumeTraining(); playSound('power'); }}
            learningRate={learningRate}
            onLearningRateChange={(value) => setLearningRate(value)}
            isRunning={status === 'TRAINING'}
          />

          <PredictionPanel
            predictionX={predictionX}
            predictedY={predictedY}
            onPredictionXChange={(value) => setPredictionX(value)}
            hasPoints={points.length > 0}
          />

          <div className="formula-card">
            <div className="formula-label">Model Equation</div>
            <div className="formula-value">Sleep = {m.toFixed(2)} × Study + {b.toFixed(2)}</div>
          </div>

          <button className="complete-button" type="button" disabled={status !== 'MODEL OPTIMIZED'} onClick={onComplete}>
            Power Next District
          </button>
        </div>
      </div>
    </div>
  );
}
