interface BossSpriteProps {
  charging: boolean;
  damaged: boolean;
  final: boolean;
}

export function BossSprite({ charging, damaged, final }: BossSpriteProps) {
  return (
    <div className={`boss-sprite ${charging ? 'charging' : ''} ${damaged ? 'hurt' : ''} ${final ? 'final-power' : ''}`}>
      <div className="boss-head">
        <span className="boss-eye left" />
        <span className="boss-eye right" />
        <div className="boss-core" />
      </div>
      <div className="boss-body">
        <div className="boss-arms">
          <span className="boss-claw left" />
          <span className="boss-claw right" />
        </div>
        <div className="boss-chest" />
        <div className="boss-tubes">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
