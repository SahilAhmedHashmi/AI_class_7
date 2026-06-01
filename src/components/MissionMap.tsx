import React from 'react';
import type { SectionKey } from '../data/content';
import type { SectionData } from '../data/content';

interface MissionMapProps {
  sections: SectionData[];
  completed: SectionKey[];
  currentSection: SectionKey;
  onSelect: (key: SectionKey) => void;
}

export function MissionMap({ sections, completed, currentSection, onSelect }: MissionMapProps) {
  return (
    <div className="mission-map">
      {sections.slice(1).map((node, index) => {
        const unlocked = completed.includes(node.key) || sections.findIndex((item) => item.key === node.key) <= sections.findIndex((item) => item.key === currentSection);
        return (
          <button
            key={node.key}
            className={`map-node ${unlocked ? 'active-node' : 'locked-node'}`}
            onClick={() => unlocked && onSelect(node.key)}
          >
            <div className="node-badge">{index + 1}</div>
            <div>
              <strong>{node.title}</strong>
              <p className="small-note">{unlocked ? node.subtitle : 'Locked'}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
