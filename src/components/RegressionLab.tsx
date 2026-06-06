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
  const remainingExamples = Math.max(maxTrainingPoints - points.length, 0);
  const trainingProgress = (points.length / maxTrainingPoints) * 100;
  const friendlyStatus =
    phase === 'testing'
      ? 'Enter study hours, click Predict Marks, and see what the AI predicts.'
      : status === 'TRAINING COMPLETE'
        ? 'Training complete. Testing opens next.'
        : points.length >= maxTrainingPoints
          ? 'AI is learning from your examples...'
          : points.length === 0
            ? 'Add 6 examples to teach the AI.'
            : `${points.length} of ${maxTrainingPoints} examples added.`;

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
        <div className="terminal-copy">
          <div className="terminal-title">{phase === 'training' ? 'TRAINING' : 'TESTING'}</div>
          <div className="terminal-subtitle">{friendlyStatus}</div>
        </div>
        {phase === 'training' && (
          <div className={`training-progress ${isTrainingActive || isTrainingFinishing ? 'training' : ''}`} aria-label={`${points.length} of ${maxTrainingPoints} examples added`}>
            <div className="training-progress-top">
              <span>Training Progress</span>
              <strong>{points.length}/{maxTrainingPoints}</strong>
            </div>
            <div className="training-progress-track">
              <div className="training-progress-fill" style={{ width: `${trainingProgress}%` }} />
            </div>
          </div>
        )}
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
            playSound('regressionPointClick');
          }}
        />

        <div className="regression-side-panel">
          {phase === 'training' ? (
            <>
              <div className="control-panel training-summary">
                <div className="prediction-title">Examples</div>
                <div className="training-count">{points.length} / {maxTrainingPoints}</div>
                <div className="training-summary-text">
                  {points.length < maxTrainingPoints
                    ? `Add ${remainingExamples} more ${remainingExamples === 1 ? 'example' : 'examples'}.`
                    : 'Finding patterns in the data...'}
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
                  if (Number.isFinite(value)) {
                    setStudyHours(Math.min(Math.max(value, 0), 12));
                  }
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
