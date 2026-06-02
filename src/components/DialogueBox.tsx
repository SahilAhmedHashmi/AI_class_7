interface DialogueBoxProps {
  speaker: string;
  line: string;
  subline?: string;
  className?: string;
}

export function DialogueBox({ speaker, line, subline, className = '' }: DialogueBoxProps) {
  return (
    <div className={`dialogue-box ${className}`}>
      <div className="dialogue-header">
        <span className="dialogue-speaker">{speaker}</span>
      </div>
      <div className="dialogue-line">{line}</div>
      {subline ? <div className="dialogue-subline">{subline}</div> : null}
    </div>
  );
}
