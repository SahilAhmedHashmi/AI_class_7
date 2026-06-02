import { useEffect, useRef } from 'react';
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
    phase,
    points,
    addPoint,
    status,
    m,
    b,
    predictionX,
    setPredictionX,
    predictedY,
    errorMessage,
    clearError,
    showTransitionMessage,
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
      {/* TRAINING PHASE */}
      {phase === 'TRAINING_PHASE' && (
        <>
          <div className="terminal-panel">
            <div>
              <div className="terminal-title">TRAINING PHASE</div>
              <div className="terminal-subtitle">
                An AI is learning how Study Hours affect Marks.
              </div>
              <div className="terminal-subtitle" style={{ marginTop: '12px' }}>
                Create 6 examples to help train the AI. Click anywhere inside the graph to add a training example.
              </div>
            </div>
            <div className={`training-counter`}>
              <div style={{ color: '#8fd5ff', fontSize: '0.8rem', letterSpacing: '0.14em' }}>TRAINING EXAMPLES</div>
              <div style={{ fontSize: '1.5rem', color: '#eefcff', fontWeight: 700 }}>{points.length} / 6</div>
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

          <div className="regression-main-grid">
            <div className={`optimized-overlay ${status === 'MODEL OPTIMIZED' ? 'active' : ''}`} aria-hidden>
              <div className="optimized-check">
                <svg viewBox="0 0 64 64" width="72" height="72" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="32" r="30" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
                  <path className="checkmark" d="M18 34 L28 44 L46 22" stroke="#07131d" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
            </div>
            <RegressionGraph 
              points={points} 
              m={m} 
              b={b} 
              onAddPoint={(point) => { addPoint(point); playSound('click'); }} 
              phase={phase}
            />
          </div>
        </>
      )}

      {/* TRANSITION MESSAGE */}
      {showTransitionMessage && (
        <div className="transition-overlay">
          <div className="transition-message">
            <div style={{ fontSize: '1.5rem', color: '#56ccff', marginBottom: '12px' }}>Training Complete</div>
            <div style={{ color: '#b7e9ff' }}>The AI has learned from the examples.</div>
          </div>
        </div>
      )}

      {/* TESTING PHASE */}
      {phase === 'TESTING_PHASE' && (
        <>
          <div className="terminal-panel">
            <div>
              <div className="terminal-title">TESTING PHASE</div>
              <div className="terminal-subtitle">
                The AI is now ready to make predictions.
              </div>
              <div className="terminal-subtitle" style={{ marginTop: '12px' }}>
                Enter the number of Study Hours, and the AI will predict the expected Marks.
              </div>
            </div>
          </div>

          <div className="regression-main-grid">
            <RegressionGraph 
              points={[]} 
              m={m} 
              b={b} 
              onAddPoint={() => {}} 
              phase={phase}
              predictionX={predictionX}
              predictedY={predictedY}
            />

            <div className="regression-side-panel">
              <PredictionPanel
                predictionX={predictionX}
                predictedY={predictedY}
                onPredictionXChange={(value) => setPredictionX(value)}
                hasPoints={true}
                phase={phase}
              />

              <button className="complete-button" type="button" onClick={onComplete}>
                Continue to Next Activity
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
