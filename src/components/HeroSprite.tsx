interface HeroSpriteProps {
  charging: boolean;
  damaged: boolean;
  final: boolean;
}

export function HeroSprite({ charging, damaged, final }: HeroSpriteProps) {
  return (
    <div className={`hero-sprite ${charging ? 'charging' : ''} ${damaged ? 'hurt' : ''} ${final ? 'final-charge' : ''}`}>
      <div className="hero-armor">
        <div className="hero-head">
          <div className="hero-visor" />
        </div>
        <div className="hero-body">
          <div className="hero-chest" />
          <div className="hero-arm left-arm" />
          <div className="hero-arm right-arm" />
        </div>
      </div>
      <div className="hero-legs">
        <span />
        <span />
      </div>
    </div>
  );
}
