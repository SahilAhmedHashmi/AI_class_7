import { useCallback, useEffect, useRef, useState } from 'react';

export interface RegressionPoint {
  id: string;
  x: number;
  y: number;
}

export type RegressionStatus = 'AWAITING EXAMPLES' | 'LEARNING' | 'TRAINING COMPLETE';

const MAX_TRAINING_POINTS = 6;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;
const createId = () => `p-${Math.random().toString(36).slice(2, 9)}`;

export function useGradientDescent(initialRate = 0.001) {
  const [points, setPoints] = useState<RegressionPoint[]>([]);
  const [m, setM] = useState<number>(() => randomBetween(1, 8));
  const [b, setB] = useState<number>(() => randomBetween(20, 60));
  const [loss, setLoss] = useState<number>(0);
  const [iteration, setIteration] = useState<number>(0);
  const [learningRate, setLearningRate] = useState<number>(() => clamp(initialRate, 0.00001, 0.005));
  const [status, setStatus] = useState<RegressionStatus>('AWAITING EXAMPLES');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pointsRef = useRef<RegressionPoint[]>(points);
  const mRef = useRef<number>(m);
  const bRef = useRef<number>(b);
  const lossRef = useRef<number>(Infinity);
  const iterationRef = useRef<number>(iteration);
  const learningRateRef = useRef<number>(learningRate);
  const runningRef = useRef<boolean>(false);
  const statusRef = useRef<RegressionStatus>(status);
  const lossIncreaseCountRef = useRef<number>(0);
  const lastValidRef = useRef<{ m: number; b: number }>({ m, b });
  const rafRef = useRef<number | null>(null);
  const maxUpdatesPerFrame = 2;

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

  const updateStatus = useCallback((nextStatus: RegressionStatus) => {
    if (statusRef.current !== nextStatus) {
      statusRef.current = nextStatus;
      setStatus(nextStatus);
    }
  }, []);

  const addPoint = useCallback((point: Omit<RegressionPoint, 'id'>) => {
    if (pointsRef.current.length >= MAX_TRAINING_POINTS) return;

    const graphPoint = {
      id: createId(),
      x: Math.round(clamp(point.x, 0, 12) * 100) / 100,
      y: Math.round(clamp(point.y, 0, 100) * 100) / 100,
    };

    setPoints((prev) => [...prev, graphPoint].slice(0, MAX_TRAINING_POINTS));
    lossRef.current = Infinity;
    lossIncreaseCountRef.current = 0;
    runningRef.current = true;
    updateStatus('LEARNING');
    setErrorMessage(null);
  }, [updateStatus]);

  const clearData = useCallback(() => {
    const nextM = randomBetween(1, 8);
    const nextB = randomBetween(20, 60);

    setPoints([]);
    mRef.current = nextM;
    bRef.current = nextB;
    lossRef.current = Infinity;
    iterationRef.current = 0;
    runningRef.current = false;
    lossIncreaseCountRef.current = 0;
    lastValidRef.current = { m: nextM, b: nextB };
    setM(nextM);
    setB(nextB);
    setLoss(0);
    setIteration(0);
    updateStatus('AWAITING EXAMPLES');
    setErrorMessage(null);
  }, [updateStatus]);

  const clearError = useCallback(() => setErrorMessage(null), []);

  const predict = useCallback((studyHours: number) => {
    const x = clamp(studyHours, 0, 12);
    return {
      x,
      y: clamp(mRef.current * x + bRef.current, 0, 100),
    };
  }, []);

  useEffect(() => {
    const tick = () => {
      const pts = pointsRef.current;

      if (pts.length === 0) {
        updateStatus('AWAITING EXAMPLES');
        rafRef.current = window.requestAnimationFrame(tick);
        return;
      }

      if (!runningRef.current) {
        rafRef.current = window.requestAnimationFrame(tick);
        return;
      }

      let updates = 0;
      let converged = false;

      while (updates < maxUpdatesPerFrame && !converged) {
        const currentM = mRef.current;
        const currentB = bRef.current;
        const lr = learningRateRef.current;

        if (!Number.isFinite(currentM) || !Number.isFinite(currentB)) {
          const last = lastValidRef.current;
          mRef.current = last.m;
          bRef.current = last.b;
          setM(last.m);
          setB(last.b);
          updateStatus('AWAITING EXAMPLES');
          setErrorMessage('The AI had trouble learning from those examples. Try placing the points again.');
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
        const nextM = currentM - lr * ((2 / n) * gradM);
        const nextB = currentB - lr * ((2 / n) * gradB);

        if (!Number.isFinite(nextM) || !Number.isFinite(nextB)) {
          const last = lastValidRef.current;
          mRef.current = last.m;
          bRef.current = last.b;
          setM(last.m);
          setB(last.b);
          updateStatus('AWAITING EXAMPLES');
          setErrorMessage('The AI had trouble learning from those examples. Try placing the points again.');
          runningRef.current = false;
          break;
        }

        const improvement = Math.abs(lossRef.current - mse);

        if (mse > lossRef.current) {
          lossIncreaseCountRef.current += 1;
        } else {
          lossIncreaseCountRef.current = 0;
        }

        if (lossIncreaseCountRef.current >= 20) {
          const halved = clamp(learningRateRef.current * 0.5, 0.00001, 0.005);
          learningRateRef.current = halved;
          setLearningRate(halved);
          lossIncreaseCountRef.current = 0;
        }

        mRef.current = nextM;
        bRef.current = nextB;
        lossRef.current = mse;
        iterationRef.current += 1;
        lastValidRef.current = { m: nextM, b: nextB };

        setM(nextM);
        setB(nextB);
        setLoss(mse);
        setIteration(iterationRef.current);

        if (improvement < 0.00001) {
          runningRef.current = false;
          updateStatus(pts.length >= MAX_TRAINING_POINTS ? 'TRAINING COMPLETE' : 'LEARNING');
          converged = true;
        } else {
          updateStatus('LEARNING');
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
  }, [updateStatus]);

  return {
    points,
    addPoint,
    clearData,
    learningRate,
    setLearningRate,
    status,
    loss,
    iteration,
    m,
    b,
    predict,
    errorMessage,
    clearError,
    maxTrainingPoints: MAX_TRAINING_POINTS,
  };
}
