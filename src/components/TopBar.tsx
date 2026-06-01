import React from 'react';

interface TopBarProps {
  xp: number;
  level: number;
  progress: number;
  completed: number;
  total: number;
  title: string;
  subtitle: string;
}

export function TopBar({ xp, level, progress, completed, total, title, subtitle }: TopBarProps) {
  return (
    <div className="topbar topbar-large">
      <div>
        <p className="metric-label">XP</p>
        <h2 className="h2">{xp}</h2>
      </div>
      <div>
        <p className="metric-label">Current Mission</p>
        <strong>{title}</strong>
        <p className="small-note">{subtitle}</p>
      </div>
      <div className="progress-pill progress-summary">
        <span>Level {level}</span>
        <strong>{Math.round(progress)}%</strong>
      </div>
      <div className="progress-pill progress-summary">
        <span>Districts</span>
        <strong>{completed}/{total}</strong>
      </div>
    </div>
  );
}
