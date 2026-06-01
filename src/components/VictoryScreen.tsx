import React from 'react';

interface VictoryScreenProps {
  xp: number;
  onRestart: () => void;
}

export function VictoryScreen({ xp, onRestart }: VictoryScreenProps) {
  return (
    <section className="card hero-panel victory-screen">
      <div className="section-header">
        <p className="metric-label">NeoCity Restored</p>
        <h1 className="h1">You saved the AI Core!</h1>
        <p className="p-muted">Every district is back online. Your AI journey unlocked new understanding and badges.</p>
      </div>
      <div className="card-grid" style={{ gap: 18 }}>
        <div className="card glow-card">
          <p className="metric-label">Final XP</p>
          <h2 className="h2">{xp}</h2>
        </div>
        <div className="card glow-card">
          <p className="metric-label">Achievement</p>
          <h2 className="h2">NeoCity Guardian</h2>
        </div>
      </div>
      <button className="button-primary" onClick={onRestart}>Start a New Adventure</button>
      <div className="hero-decor"></div>
    </section>
  );
}
