import { useEffect, useState } from 'react';
import { playSound } from '../utils/sound';

interface BossBattleProps {
  onVictory: () => void;
}

export function BossBattle({ onVictory }: BossBattleProps) {
  const [charge, setCharge] = useState(0);
  const [message, setMessage] = useState('Stabilize the core with rapid power taps.');

  useEffect(() => {
    if (charge >= 100) {
      setMessage('Core stabilized! Prepare to restore NeoCity.');
    }
  }, [charge]);

  const addCharge = () => {
    const next = Math.min(100, charge + 18 + Math.floor(Math.random() * 10));
    setCharge(next);
    playSound('boss');
    if (next >= 100) {
      setTimeout(() => onVictory(), 600);
    }
  };

  return (
    <div className="task-grid">
      <div className="card glow-card">
        <p className="metric-label">AI Core Battle</p>
        <h3 className="h2">Defeat the overload guardian</h3>
        <p className="p-muted">Tap the pulse beam to stabilize the ancient NeoCity core.</p>
        <div className="core-meter">
          <div className="core-fill" style={{ width: `${charge}%` }} />
          <span>{charge}%</span>
        </div>
      </div>
      <div className="card">
        <p className="status-chip">{message}</p>
        <button className="button-primary" onClick={addCharge} disabled={charge >= 100}>
          Charge Pulse
        </button>
      </div>
    </div>
  );
}
