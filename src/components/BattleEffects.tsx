interface BattleEffectsProps {
  phase: string;
  bossDamage: boolean;
  heroDamage: boolean;
  finalBlast: boolean;
}

export function BattleEffects({ phase, bossDamage, heroDamage, finalBlast }: BattleEffectsProps) {
  return (
    <div className={`battle-effects ${phase} ${finalBlast ? 'final-blast' : ''}`}>
      {phase === 'heroAttack' && <div className="charge-ring hero-charge" />}
      {phase === 'bossAttack' && <div className="charge-ring boss-charge" />}
      {bossDamage && <div className="damage-flash boss-hit" />}
      {heroDamage && <div className="damage-flash hero-hit" />}
      {finalBlast && <div className="final-beam" />}
    </div>
  );
}
