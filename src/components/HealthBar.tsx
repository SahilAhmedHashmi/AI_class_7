interface HealthBarProps {
  label: string;
  current: number;
  max: number;
  color: string;
}

export function HealthBar({ label, current, max, color }: HealthBarProps) {
  const percent = Math.max(0, Math.min(100, Math.round((current / max) * 100)));
  return (
    <div className="health-bar-panel">
      <div className="health-bar-label">{label}</div>
      <div className="health-bar-frame">
        <div className="health-bar-fill" style={{ width: `${percent}%`, background: color }} />
      </div>
      <div className="health-bar-percent">{current}/{max}</div>
    </div>
  );
}
