import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface RegressionPoint {
  id: string;
  x: number;
  y: number;
}

export type RegressionPhase = 'TRAINING_PHASE' | 'TESTING_PHASE';
export type RegressionStatus = 'AWAITING DATA' | 'TRAINING' | 'PAUSED' | 'MODEL OPTIMIZED';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;
const createId = () => `p-${Math.random().toString(36).slice(2, 9)}`;

const buildSampleData = (): RegressionPoint[] => {
  const baseSlope = -0.6;
  const baseIntercept = 10.4;
  return [1, 2, 3, 4, 5, 6, 7, 8].map((x) => {
    const noise = randomBetween(-0.5, 0.5);
    const y = clamp(baseIntercept + baseSlope * x + noise, 0.6, 12);
    return { id: createId(), x, y: Math.round(y * 100) / 100 };
  });
};

const TRAINING_POINTS_LIMIT = 6;

export function useGradientDescent(initialRate = 0.01) {
  const [phase, setPhase] = useState<RegressionPhase>('TRAINING_PHASE');
  const [points, setPoints] = useState<RegressionPoint[]>([]);
  const [m, setM] = useState<number>(() => randomBetween(-1, 1));
  const [b, setB] = useState<number>(() => randomBetween(-1, 1));
  const [loss, setLoss] = useState<number>(0);
  const [iteration, setIteration] = useState<number>(0);
  const [learningRate, setLearningRate] = useState<number>(() => clamp(initialRate, 0.0001, 0.05));
  const [status, setStatus] = useState<RegressionStatus>('AWAITING DATA');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [predictionX, setPredictionX] = useState<number>(6);
  const [showTransitionMessage, setShowTransitionMessage] = useState<boolean>(false);

  const pointsRef = useRef<RegressionPoint[]>(points);
  const mRef = useRef<number>(m);
  const bRef = useRef<number>(b);
  const lossRef = useRef<number>(Infinity);
  const iterationRef = useRef<number>(iteration);
  const learningRateRef = useRef<number>(learningRate);
  const runningRef = useRef<boolean>(true);
  const statusRef = useRef<RegressionStatus>(status);
  const phaseRef = useRef<RegressionPhase>(phase);
  const stableCountRef = useRef<number>(0);
  const lossIncreaseCountRef = useRef<number>(0);
  const lastValidRef = useRef<{ m: number; b: number }>({ m: mRefValue(m), b: bRefValue(b) });
  const maxUpdatesPerFrame = 3;
  const rafRef = useRef<number | null>(null);

  function mRefValue(val?: number) {
    return typeof val === 'number' ? val : 0;
  }

  function bRefValue(val?: number) {
    return typeof val === 'number' ? val : 0;
  }

  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  useEffect(() => {
    mRef.current = m;
  }, [m]);

  useEffect(() => {
    bRef.current = b;
  }, [b]);

  useEffect(() => {
    lossRef.current = loss;
  }, [loss]);

  useEffect(() => {
    iterationRef.current = iteration;
  }, [iteration]);

  useEffect(() => {
    learningRateRef.current = learningRate;
  }, [learningRate]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const updateStatus = useCallback((nextStatus: RegressionStatus) => {
    if (statusRef.current !== nextStatus) {
      statusRef.current = nextStatus;
      setStatus(nextStatus);
    }
  }, []);

  const addPoint = useCallback((point: Omit<RegressionPoint, 'id'>) => {
    setPoints((prev) => {
      if (prev.length < TRAINING_POINTS_LIMIT) {
        return [...prev, { ...point, id: createId() }];
      }
      return prev;
    });
    stableCountRef.current = 0;
    runningRef.current = true;
    updateStatus('TRAINING');
  }, [updateStatus]);

  const generateSampleData = useCallback(() => {
    // Use the provided dataset example with small random noise around each point
    const base = [
      { x: 2, y: 9 },
      { x: 4, y: 8 },
      { x: 6, y: 7 },
    ];
    const noisy = base.map((p) => ({ id: createId(), x: Math.max(0, Math.min(12, p.x + randomBetween(-0.2, 0.2))), y: Math.max(0, Math.min(12, p.y + randomBetween(-0.3, 0.3))) }));
    setPoints(noisy);
    stableCountRef.current = 0;
    lossRef.current = Infinity;
    iterationRef.current = 0;
    updateStatus('TRAINING');
    setErrorMessage(null);
  }, [updateStatus]);

  const transitionToTesting = useCallback(() => {
    setShowTransitionMessage(true);
    setTimeout(() => {
      setPoints([]); // Clear training points
      setPhase('TESTING_PHASE');
      setShowTransitionMessage(false);
      runningRef.current = false; // Stop gradient descent
    }, 1500);
  }, []);

  const clearData = useCallback(() => {
    setPoints([]);
    const nextM = randomBetween(-1.5, 1.5);
    const nextB = randomBetween(2, 9);
    mRef.current = nextM;
    bRef.current = nextB;
    lossRef.current = Infinity;
    iterationRef.current = 0;
    stableCountRef.current = 0;
    setM(nextM);
    setB(nextB);
    setLoss(0);
    setIteration(0);
    setPredictionX(5);
    updateStatus('AWAITING DATA');
    setErrorMessage(null);
  }, [updateStatus]);

  const clearError = useCallback(() => setErrorMessage(null), []);

  const pauseTraining = useCallback(() => {
    runningRef.current = false;
    updateStatus('PAUSED');
  }, [updateStatus]);

  const resumeTraining = useCallback(() => {
    runningRef.current = true;
    updateStatus(pointsRef.current.length ? 'TRAINING' : 'AWAITING DATA');
  }, [updateStatus]);

  useEffect(() => {
    const tick = () => {
      const pts = pointsRef.current;

      if (pts.length === 0) {
        updateStatus('AWAITING DATA');
        rafRef.current = window.requestAnimationFrame(tick);
        return;
      }

      if (!runningRef.current) {
        // keep the loop alive but idle
        rafRef.current = window.requestAnimationFrame(tick);
        return;
      }

      let updates = 0;
      let converged = false;

      while (updates < maxUpdatesPerFrame && !converged) {
        const currentM = mRef.current;
        const currentB = bRef.current;
        const lr = learningRateRef.current;

        // safety: ensure finite
        if (!Number.isFinite(currentM) || !Number.isFinite(currentB) || Number.isNaN(currentM) || Number.isNaN(currentB)) {
          // revert to last valid and stop
          const last = lastValidRef.current;
          mRef.current = last.m;
          bRef.current = last.b;
          setM(last.m);
          setB(last.b);
          updateStatus('AWAITING DATA');
          setErrorMessage('Numeric instability detected — model reverted to last valid parameters.');
          console.error('Invalid parameter encountered. Reverting to last valid model.');
          runningRef.current = false;
          break;
        }

        let sumError = 0;
        let gradM = 0;
        let gradB = 0;

        pts.forEach(({ x, y }) => {
          const prediction = currentM * x + currentB;
          const error = prediction - y;
          sumError += error * error;
          gradM += error * x;
          gradB += error;
        });

        const n = pts.length;
        const mse = sumError / n;
        const mGradient = (2 / n) * gradM;
        const bGradient = (2 / n) * gradB;

        const nextM = currentM - lr * mGradient;
        const nextB = currentB - lr * bGradient;

        // check for NaN/Infinity
        if (!Number.isFinite(nextM) || !Number.isFinite(nextB)) {
          const last = lastValidRef.current;
          mRef.current = last.m;
          bRef.current = last.b;
          setM(last.m);
          setB(last.b);
          updateStatus('AWAITING DATA');
          setErrorMessage('Non-finite parameter update detected; reverted to last valid model.');
          runningRef.current = false;
          console.error('Non-finite update detected; reverting to last valid model.');
          break;
        }

        const improvement = Math.abs(lossRef.current - mse);

        // detect loss increase
        if (mse > lossRef.current) {
          lossIncreaseCountRef.current += 1;
        } else {
          lossIncreaseCountRef.current = 0;
        }

        if (lossIncreaseCountRef.current >= 20) {
          // reduce learning rate to stabilize
          const halved = clamp(learningRateRef.current * 0.5, 0.0001, 0.05);
          learningRateRef.current = halved;
          setLearningRate(halved);
          lossIncreaseCountRef.current = 0;
        }

        // apply update
        mRef.current = nextM;
        bRef.current = nextB;
        lossRef.current = mse;
        iterationRef.current += 1;

        setM(nextM);
        setB(nextB);
        setLoss(mse);
        setIteration(iterationRef.current);

        // store last valid
        lastValidRef.current = { m: nextM, b: nextB };

        // convergence check
        if (improvement < 0.0001) {
          if (pts.length === TRAINING_POINTS_LIMIT && phaseRef.current === 'TRAINING_PHASE') {
            updateStatus('MODEL OPTIMIZED');
            runningRef.current = false;
            transitionToTesting();
          } else {
            updateStatus('TRAINING');
          }
          converged = true;
          break;
        } else {
          updateStatus('TRAINING');
        }

        updates += 1;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [updateStatus, transitionToTesting]);

  const predictedY = useMemo(() => m * predictionX + b, [m, b, predictionX]);

  return {
    phase,
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
    showTransitionMessage,
    transitionToTesting,
  };
}
