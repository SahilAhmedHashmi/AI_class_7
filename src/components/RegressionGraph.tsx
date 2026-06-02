import type { MouseEvent } from 'react';
import type { RegressionPoint } from './useGradientDescent';

interface RegressionGraphProps {
  points: RegressionPoint[];
  m: number;
  b: number;
  onAddPoint: (point: { x: number; y: number }) => void;
}

const VIEW_WIDTH = 560;
const VIEW_HEIGHT = 520;
const MARGIN = 48;
const GRID_MAX = 12;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const xToSvg = (x: number) => MARGIN + (x / GRID_MAX) * (VIEW_WIDTH - MARGIN * 2);
const yToSvg = (y: number) => MARGIN + ((GRID_MAX - y) / GRID_MAX) * (VIEW_HEIGHT - MARGIN * 2);

export function RegressionGraph({ points, m, b, onAddPoint }: RegressionGraphProps) {
  const handleClick = (event: MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const svgX = ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH;
    const svgY = ((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT;

    if (svgX < MARGIN || svgX > VIEW_WIDTH - MARGIN || svgY < MARGIN || svgY > VIEW_HEIGHT - MARGIN) return;

    const x = clamp(((svgX - MARGIN) / (VIEW_WIDTH - MARGIN * 2)) * GRID_MAX, 0, GRID_MAX);
    const y = clamp(GRID_MAX - ((svgY - MARGIN) / (VIEW_HEIGHT - MARGIN * 2)) * GRID_MAX, 0, GRID_MAX);
    onAddPoint({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 });
  };

  const linePointA = { x: 0, y: m * 0 + b };
  const linePointB = { x: GRID_MAX, y: m * GRID_MAX + b };

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

        {[...Array(GRID_MAX + 1).keys()].map((tick) => (
          <line
            key={`v-${tick}`}
            x1={xToSvg(tick)}
            y1={MARGIN}
            x2={xToSvg(tick)}
            y2={VIEW_HEIGHT - MARGIN}
            className="graph-grid-line"
          />
        ))}
        {[...Array(GRID_MAX + 1).keys()].map((tick) => (
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
          x2={xToSvg(GRID_MAX)}
          y2={yToSvg(0)}
          className="graph-axis"
        />
        <line
          x1={xToSvg(0)}
          y1={yToSvg(0)}
          x2={xToSvg(0)}
          y2={yToSvg(GRID_MAX)}
          className="graph-axis"
        />

        {[0, 3, 6, 9, 12].map((tick) => (
          <g key={`x-label-${tick}`}>
            <text x={xToSvg(tick)} y={VIEW_HEIGHT - 16} className="graph-label" textAnchor="middle">
              {tick}
            </text>
          </g>
        ))}
        {[0, 3, 6, 9, 12].map((tick) => (
          <g key={`y-label-${tick}`}>
            <text x={16} y={yToSvg(tick) + 4} className="graph-label" textAnchor="start">
              {tick}
            </text>
          </g>
        ))}

        <text x={VIEW_WIDTH / 2} y={VIEW_HEIGHT - 8} className="graph-axis-label" textAnchor="middle">
          Study Hours Per Day
        </text>
        <text x={18} y={VIEW_HEIGHT / 2} className="graph-axis-label" transform={`rotate(-90 18 ${VIEW_HEIGHT / 2})`}>
          Sleep Hours Per Night
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
      </svg>
      <div className="graph-caption">Click anywhere in the grid to add a new observation.</div>
    </div>
  );
}
