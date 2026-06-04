import type { MouseEvent } from 'react';
import type { RegressionPoint } from './useGradientDescent';

interface RegressionGraphProps {
  points: RegressionPoint[];
  m: number;
  b: number;
  onAddPoint: (point: { x: number; y: number }) => void;
  canAddPoints: boolean;
  predictionPoint?: { x: number; y: number } | null;
}

const VIEW_WIDTH = 560;
const VIEW_HEIGHT = 520;
const MARGIN = 48;
const X_MAX = 12;
const Y_MAX = 100;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const xToSvg = (x: number) => MARGIN + (clamp(x, 0, X_MAX) / X_MAX) * (VIEW_WIDTH - MARGIN * 2);
const yToSvg = (y: number) => MARGIN + ((Y_MAX - clamp(y, 0, Y_MAX)) / Y_MAX) * (VIEW_HEIGHT - MARGIN * 2);

export function RegressionGraph({ points, m, b, onAddPoint, canAddPoints, predictionPoint }: RegressionGraphProps) {
  const handleClick = (event: MouseEvent<SVGSVGElement>) => {
    if (!canAddPoints) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const svgX = ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH;
    const svgY = ((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT;

    if (svgX < MARGIN || svgX > VIEW_WIDTH - MARGIN || svgY < MARGIN || svgY > VIEW_HEIGHT - MARGIN) return;

    const x = clamp(((svgX - MARGIN) / (VIEW_WIDTH - MARGIN * 2)) * X_MAX, 0, X_MAX);
    const y = clamp(Y_MAX - ((svgY - MARGIN) / (VIEW_HEIGHT - MARGIN * 2)) * Y_MAX, 0, Y_MAX);
    onAddPoint({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 });
  };

  const linePointA = { x: 0, y: m * 0 + b };
  const linePointB = { x: X_MAX, y: m * X_MAX + b };

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

        {[...Array(X_MAX + 1).keys()].map((tick) => (
          <line
            key={`v-${tick}`}
            x1={xToSvg(tick)}
            y1={MARGIN}
            x2={xToSvg(tick)}
            y2={VIEW_HEIGHT - MARGIN}
            className="graph-grid-line"
          />
        ))}
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
          x2={xToSvg(X_MAX)}
          y2={yToSvg(0)}
          className="graph-axis"
        />
        <line
          x1={xToSvg(0)}
          y1={yToSvg(0)}
          x2={xToSvg(0)}
          y2={yToSvg(Y_MAX)}
          className="graph-axis"
        />

        {[0, 3, 6, 9, 12].map((tick) => (
          <g key={`x-label-${tick}`}>
            <text x={xToSvg(tick)} y={VIEW_HEIGHT - 16} className="graph-label" textAnchor="middle">
              {tick}
            </text>
          </g>
        ))}
        {[0, 25, 50, 75, 100].map((tick) => (
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

        {points.map((point) => {
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

        {predictionPoint && (
          <g className="prediction-point-group">
            <circle
              cx={xToSvg(predictionPoint.x)}
              cy={yToSvg(predictionPoint.y)}
              r="15"
              className="prediction-point-pulse"
            />
            <circle
              cx={xToSvg(predictionPoint.x)}
              cy={yToSvg(predictionPoint.y)}
              r="8"
              className="prediction-point"
            />
          </g>
        )}
      </svg>
      <div className="graph-caption">
        {canAddPoints ? 'Click anywhere inside the graph to create a training example.' : 'The learned line stays visible for testing.'}
      </div>
    </div>
  );
}
