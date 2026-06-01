import React from 'react';

interface AchievementToastProps {
  badge: string;
}

export function AchievementToast({ badge }: AchievementToastProps) {
  return (
    <div className="achievement-toast animation-pop">
      <strong>Badge unlocked</strong>
      <p>{badge}</p>
    </div>
  );
}
