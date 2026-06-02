import type { MouseEvent } from 'react';
import type { RegressionPoint } from './useGradientDescent';
import type { RegressionPhase } from './useGradientDescent';

interface RegressionGraphProps {
  points: RegressionPoint[];
  m: number;
  b: number;
  onAddPoint: (point: { x: number; y: number }) => void;
  phase: RegressionPhase;
  predictionX?: number;
  predictedY?: number;
}

const VIEW_WIDTH = 560;
const VIEW_HEIGHT = 520;
const MARGIN = 48;
const GRID_MAX_X = 12; // Study Hours: 0-12
const GRID_MAX_Y = 100; // Marks: 0-100

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const xToSvg = (x: number) => MARGIN + (x / GRID_MAX_X) * (VIEW_WIDTH - MARGIN * 2);
const yToSvg = (y: number) => MARGIN + ((GRID_MAX_Y - y) / GRID_MAX_Y) * (VIEW_HEIGHT - MARGIN * 2);

export function RegressionGraph({ points, m, b, onAddPoint, phase, predictionX, predictedY }: RegressionGraphProps) {
  const handleClick = (event: MouseEvent<SVGSVGElement>) => {
    if (phase !== 'TRAINING_PHASE') return;

    const rect = event.currentTarget.getBoundingClientRect();
    const svgX = ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH;
    const svgY = ((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT;

    if (svgX < MARGIN || svgX > VIEW_WIDTH - MARGIN || svgY < MARGIN || svgY > VIEW_HEIGHT - MARGIN) return;

    const x = clamp(((svgX - MARGIN) / (VIEW_WIDTH - MARGIN * 2)) * GRID_MAX_X, 0, GRID_MAX_X);
    const y = clamp(GRID_MAX_Y - ((svgY - MARGIN) / (VIEW_HEIGHT - MARGIN * 2)) * GRID_MAX_Y, 0, GRID_MAX_Y);
    onAddPoint({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 });
  };

  // Calculate line endpoints using normalized scales
  const linePointA = { x: 0, y: m * 0 + b };
  const linePointB = { x: GRID_MAX_X, y: m * GRID_MAX_X + b };

  return (
    <div className="regression-graph-shell">
      <svg
        className="regression-graph-svg"
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        onClick={handleClick}
      >
        <defs>
          <linearGradient id="gridGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(86, 204, 255, 0.16)" />
            <stop offset="100%" stopColor="rgba(86, 204, 255, 0.05)" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#gridGradient)" />

        {/* Vertical grid lines for X axis (0-12) */}
        {[...Array(GRID_MAX_X + 1).keys()].map((tick) => (
          <line
            key={`v-${tick}`}
            x1={xToSvg(tick)}
            y1={MARGIN}
            x2={xToSvg(tick)}
            y2={VIEW_HEIGHT - MARGIN}
            className="graph-grid-line"
          />
        ))}
        {/* Horizontal grid lines for Y axis (0-100) */}
        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((tick) => (
          <line
            key={`h-${tick}`}
            x1={MARGIN}
            y1={yToSvg(tick)}
            x2={VIEW_WIDTH - MARGIN}
            y2={yToSvg(tick)}
            className="graph-grid-line"
          />
        ))}

        <line
          x1={xToSvg(0)}
          y1={yToSvg(0)}
          x2={xToSvg(GRID_MAX_X)}
          y2={yToSvg(0)}
          className="graph-axis"
        />
        <line
          x1={xToSvg(0)}
          y1={yToSvg(0)}
          x2={xToSvg(0)}
          y2={yToSvg(GRID_MAX_Y)}
          className="graph-axis"
        />

        {/* X-axis labels (0-12) */}
        {[0, 3, 6, 9, 12].map((tick) => (
          <g key={`x-label-${tick}`}>
            <text x={xToSvg(tick)} y={VIEW_HEIGHT - 16} className="graph-label" textAnchor="middle">
              {tick}
            </text>
          </g>
        ))}
        {/* Y-axis labels (0-100) */}
        {[0, 20, 40, 60, 80, 100].map((tick) => (
          <g key={`y-label-${tick}`}>
            <text x={16} y={yToSvg(tick) + 4} className="graph-label" textAnchor="start">
              {tick}
            </text>
          </g>
        ))}

        <text x={VIEW_WIDTH / 2} y={VIEW_HEIGHT - 8} className="graph-axis-label" textAnchor="middle">
          Study Hours
        </text>
        <text x={18} y={VIEW_HEIGHT / 2} className="graph-axis-label" transform={`rotate(-90 18 ${VIEW_HEIGHT / 2})`}>
          Marks
        </text>

        <line
          x1={xToSvg(linePointA.x)}
          y1={yToSvg(linePointA.y)}
          x2={xToSvg(linePointB.x)}
          y2={yToSvg(linePointB.y)}
          className="regression-line"
        />

        {/* Training data points - only show in training phase */}
        {phase === 'TRAINING_PHASE' && points.map((point) => {
          const predictedY = m * point.x + b;
          return (
            <g key={point.id}>
              <line
                x1={xToSvg(point.x)}
                y1={yToSvg(point.y)}
                x2={xToSvg(point.x)}
                y2={yToSvg(predictedY)}
                className="residual-line"
              />
              <circle
                cx={xToSvg(point.x)}
                cy={yToSvg(point.y)}
                r="7"
                className="data-point"
              />
            </g>
          );
        })}

        {/* Prediction point - only show in testing phase */}
        {phase === 'TESTING_PHASE' && predictionX !== undefined && predictedY !== undefined && (
          <g>
            <circle
              cx={xToSvg(predictionX)}
              cy={yToSvg(predictedY)}
              r="8"
              className="prediction-point"
              fill="#00ff88"
              opacity="0.8"
            />
            <circle
              cx={xToSvg(predictionX)}
              cy={yToSvg(predictedY)}
              r="12"
              className="prediction-point-glow"
              fill="none"
              stroke="#00ff88"
              strokeWidth="2"
              opacity="0.4"
            />
          </g>
        )}
      </svg>
      <div className="graph-caption">
        {phase === 'TRAINING_PHASE' ? 'Click anywhere in the grid to add a training example.' : 'The learned pattern is shown above.'}
      </div>
    </div>
  );
}
