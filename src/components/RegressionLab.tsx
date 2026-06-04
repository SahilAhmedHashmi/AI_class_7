import { useEffect, useRef, useState } from 'react';
import { playSound } from '../utils/sound';
import { useGradientDescent } from './useGradientDescent';
import { RegressionGraph } from './RegressionGraph';
import { PredictionPanel } from './PredictionPanel';
import './regression.css';

interface RegressionLabProps {
  onComplete: () => void;
}

export function RegressionLab({ onComplete }: RegressionLabProps) {
  const {
    points,
    addPoint,
    clearData,
    status,
    m,
    b,
    predict,
    errorMessage,
    clearError,
    maxTrainingPoints,
  } = useGradientDescent();

  const [phase, setPhase] = useState<'training' | 'testing'>('training');
  const [studyHours, setStudyHours] = useState<number>(6);
  const [predictionPoint, setPredictionPoint] = useState<{ x: number; y: number } | null>(null);
  const previousStatus = useRef(status);
  const isTrainingActive = phase === 'training' && status === 'LEARNING' && points.length >= maxTrainingPoints;
  const isTrainingFinishing = phase === 'training' && status === 'TRAINING COMPLETE';
  const friendlyStatus =
    phase === 'testing'
      ? 'Ready to make predictions'
      : status === 'TRAINING COMPLETE'
        ? 'Ready for testing'
        : points.length >= maxTrainingPoints
          ? 'AI is learning...'
          : `Add ${maxTrainingPoints - points.length} more examples to teach the AI`;

  useEffect(() => {
    if (status === 'TRAINING COMPLETE' && previousStatus.current !== 'TRAINING COMPLETE') {
      playSound('success');
      const transition = window.setTimeout(() => {
        setPhase('testing');
        setPredictionPoint(null);
      }, 1400);

      previousStatus.current = status;
      return () => window.clearTimeout(transition);
    }

    previousStatus.current = status;
  }, [status]);

  const handleResetTraining = () => {
    clearData();
    setPhase('training');
    setPredictionPoint(null);
    setStudyHours(6);
  };

  const handlePredict = () => {
    const result = predict(studyHours);
    setStudyHours(result.x);
    setPredictionPoint(result);
    playSound('click');
  };

  return (
    <div className="regression-shell">
      <div className="terminal-panel">
        <div>
          <div className="terminal-title">NEURAL PREDICTION TERMINAL</div>
          <div className="terminal-subtitle">
            {phase === 'training'
              ? 'An AI is learning how Study Hours affect Marks.'
              : 'The AI has learned from the examples.'}
          </div>
        </div>
        <div className={`status-pill ${status === 'TRAINING COMPLETE' ? 'optimized' : status === 'LEARNING' ? 'training' : 'waiting'}`}>
          <span className="status-key">Next Step</span>
          <strong>{friendlyStatus}</strong>
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

      {phase === 'training' ? (
        <div className="stat-grid training-stats">
          <div className="stat-card">
            <div className="stat-label">Training Examples</div>
            <div className="stat-value">{points.length} / {maxTrainingPoints}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Goal</div>
            <div className="stat-value">{points.length < maxTrainingPoints ? 'Add Examples' : 'Training'}</div>
          </div>
        </div>
      ) : (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">Testing Phase</div>
            <div className="stat-value">Ready</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Input</div>
            <div className="stat-value">0-12</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Output</div>
            <div className="stat-value">Marks</div>
          </div>
        </div>
      )}

      <div className="regression-main-grid">
        <div className={`optimized-overlay ${status === 'TRAINING COMPLETE' && phase === 'training' ? 'active' : ''}`} aria-hidden>
          <div className="optimized-check">
            <svg viewBox="0 0 64 64" width="72" height="72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="30" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
              <path className="checkmark" d="M18 34 L28 44 L46 22" stroke="#07131d" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
        </div>

        {(isTrainingActive || isTrainingFinishing) && (
          <div className="training-feedback" role="status" aria-live="polite">
            <div className="training-spinner" aria-hidden />
            <div>
              <div className="training-feedback-title">
                {isTrainingFinishing ? 'Finding the pattern in the data...' : 'AI is learning from your examples...'}
              </div>
              <div className="training-feedback-copy">
                {isTrainingFinishing ? 'Training is almost done.' : 'Training the model...'}
              </div>
            </div>
          </div>
        )}

        <RegressionGraph
          points={phase === 'training' ? points : []}
          m={m}
          b={b}
          canAddPoints={phase === 'training' && points.length < maxTrainingPoints}
          predictionPoint={phase === 'testing' ? predictionPoint : null}
          onAddPoint={(point) => {
            addPoint(point);
            playSound('click');
          }}
        />

        <div className="regression-side-panel">
          {phase === 'training' ? (
            <>
              <div className="control-panel">
                <div className="prediction-header">
                  <div className="prediction-title">TRAINING PHASE</div>
                  <div className="prediction-subtitle">Help train the AI by creating 6 examples.</div>
                </div>
                <div className="prediction-note">Click anywhere inside the graph to create a training example.</div>
                <div className="prediction-result">
                  <div className="prediction-label">Training Examples</div>
                  <div className="prediction-value">{points.length} / {maxTrainingPoints}</div>
                </div>
              </div>
              <div className="formula-card">
                <div className="formula-label">{status === 'TRAINING COMPLETE' ? 'Training Complete' : 'Learning'}</div>
                <div className="formula-value">
                  {status === 'TRAINING COMPLETE'
                    ? 'The AI has learned from the examples.'
                    : 'The line updates after every example.'}
                </div>
              </div>
              <button className="ghost-button" type="button" onClick={handleResetTraining}>
                Start Over
              </button>
            </>
          ) : (
            <>
              <PredictionPanel
                studyHours={studyHours}
                predictedMarks={predictionPoint?.y ?? null}
                onStudyHoursChange={(value) => {
                  setStudyHours(Number.isFinite(value) ? Math.min(Math.max(value, 0), 12) : 0);
                  setPredictionPoint(null);
                }}
                onPredict={handlePredict}
              />
              <button className="ghost-button" type="button" onClick={handleResetTraining}>
                Train Again
              </button>
              <button className="complete-button" type="button" disabled={predictionPoint === null} onClick={onComplete}>
                Power Next District
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
