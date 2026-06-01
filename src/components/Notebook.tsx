import React from 'react';
import { SectionData, SectionKey } from '../data/content';

interface NotebookProps {
  completed: SectionKey[];
  sections: SectionData[];
}

export function Notebook({ completed, sections }: NotebookProps) {
  const notes = sections.filter((section) => completed.includes(section.key) && section.key !== 'landing');

  return (
    <div className="card notebook-panel">
      <p className="metric-label">AI Codex</p>
      <h3 className="h2">Completed Concepts</h3>
      {notes.length === 0 ? (
        <p className="small-note">Complete a district to unlock its notebook entry.</p>
      ) : (
        <div className="note-list">
          {notes.map((section) => (
            <article key={section.key} className="note-card">
              <strong>{section.title}</strong>
              <p className="small-note">{section.realWorld}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
