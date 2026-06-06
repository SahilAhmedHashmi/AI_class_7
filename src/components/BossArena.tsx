interface BossArenaProps {
  phase: string;
  bossHealth: number;
  heroHealth: number;
  finalAttack: boolean;
  bossDamaged: boolean;
  heroDamaged: boolean;
}

export function BossArena({ phase, finalAttack, bossDamaged, heroDamaged }: BossArenaProps) {
  return (
    <div className={`boss-arena stage-${phase} ${finalAttack ? 'final-beam-active' : ''} ${bossDamaged ? 'boss-damaged' : ''} ${heroDamaged ? 'hero-damaged' : ''}`}>
      <img className="boss-arena-image" src="/boss-arena-neocity.svg" alt="NeoCity command deck pixel art viewport" />
      <div className="arena-status-strip" aria-hidden="true">
        <span>HERO LINK</span>
        <span>CORE VIEWPORT</span>
        <span>AETHERION SIGNAL</span>
      </div>
    </div>
  );
}
