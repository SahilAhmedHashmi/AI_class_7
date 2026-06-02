import { BossSprite } from './BossSprite';
import { HeroSprite } from './HeroSprite';

interface BossArenaProps {
  phase: string;
  bossHealth: number;
  heroHealth: number;
  finalAttack: boolean;
  bossDamaged: boolean;
  heroDamaged: boolean;
}

export function BossArena({ phase, bossHealth, heroHealth, finalAttack, bossDamaged, heroDamaged }: BossArenaProps) {
  return (
    <div className={`boss-arena stage-${phase} ${finalAttack ? 'final-beam' : ''}`}>
      <div className="arena-glow" />
      <div className="arena-grid">
        <div className={`arena-column hero-column ${heroDamaged ? 'hurt' : ''}`}>
          <div className="arena-label">HERO DEPLOYED</div>
          <HeroSprite charging={phase === 'heroAttack' || phase === 'finalCharge' || phase === 'finalBlast'} damaged={heroDamaged} final={finalAttack} />
          <div className="arena-stat">{heroHealth}%</div>
        </div>
        <div className="arena-center-panel">
          <div className="arena-core">AI LAB CORE</div>
          <div className="arena-tubes">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className={`arena-column boss-column ${bossDamaged ? 'hurt' : ''}`}>
          <div className="arena-label">AETHERION</div>
          <BossSprite charging={phase === 'bossAttack'} damaged={bossDamaged} final={finalAttack} />
          <div className="arena-stat">{bossHealth}%</div>
        </div>
      </div>
    </div>
  );
}
