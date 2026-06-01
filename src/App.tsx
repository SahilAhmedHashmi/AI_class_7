import React, { useState, useEffect, useRef } from 'react';

// ============================================================================
// CORE DATA TYPES, THEMES, AND CONSTANTS
// ============================================================================
type SectionKey =
  | 'landing'
  | 'whatIsAI'
  | 'classification'
  | 'trainingData'
  | 'computerVision'
  | 'nlp'
  | 'regression'
  | 'clustering'
  | 'dataTypes'
  | 'aiWorkflow'
  | 'finalMission'
  | 'victory';

interface SectionConfig {
  key: SectionKey;
  title: string;
  badge: string;
  xpReward: number;
}

const SECTIONS: SectionConfig[] = [
  { key: 'whatIsAI', title: 'What is AI?', badge: '🧠 Brainwave Initiate', xpReward: 30 },
  { key: 'classification', title: 'Classification Factory', badge: '🗂️ Sorting Strategist', xpReward: 30 },
  { key: 'trainingData', title: 'Training the AI', badge: '🏋️ Master Trainer', xpReward: 30 },
  { key: 'computerVision', title: 'Computer Vision Scanner', badge: '👁️ Cyber Sentinel', xpReward: 30 },
  { key: 'nlp', title: 'Language Harbor', badge: '💬 Phrase Parser', xpReward: 30 },
  { key: 'regression', title: 'Regression Observatory', badge: '📈 Trend Tracer', xpReward: 30 },
  { key: 'clustering', title: 'Clustering Forest', badge: '🌌 Galaxy Grouper', xpReward: 30 },
  { key: 'dataTypes', title: 'The Data Vault', badge: '🔐 Code Cracker', xpReward: 30 },
  { key: 'aiWorkflow', title: 'The AI Pipeline Machine', badge: '⚙️ System Architect', xpReward: 30 },
  { key: 'finalMission', title: 'Restore the AI Core', badge: '⚡ NeoCity Savior', xpReward: 30 },
];

const COLORS = {
  bg: '#08101f',
  cardBg: 'rgba(16, 28, 46, 0.95)',
  accent: '#4b9bff',
  success: '#5efc82',
  error: '#ff6464',
  textPrimary: '#f7fbff',
  textSecondary: '#b6c7dc',
  textMuted: '#8bb0ff',
};

// ============================================================================
// INLINE GLOBAL STYLES & AUDIO SYNTHESIZER
// ============================================================================
function GlobalStyles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      * { box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
      body { margin: 0; background-color: ${COLORS.bg}; color: ${COLORS.textPrimary}; overflow-x: hidden; }
      button { cursor: pointer; transition: all 0.2s ease-in-out; border: none; }
      button:active { transform: scale(0.95) !important; }
      
      @keyframes float { from { transform: translateY(0); } to { transform: translateY(-15px); } }
      @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      @keyframes slideUp { from { transform: translateY(18px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      @keyframes slideInLeft { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
      @keyframes celebrate { 0%{transform:scale(1)} 30%{transform:scale(1.06);box-shadow:0 0 0 6px rgba(94,252,130,0.35)} 60%{transform:scale(0.97)} 100%{transform:scale(1)} }
      @keyframes pulseGlow { 0%,100%{box-shadow:0 0 0 0 rgba(75,155,255,0.4)} 50%{box-shadow:0 0 0 12px rgba(75,155,255,0)} }
      @keyframes scanLine { 0%{top:0%;opacity:0.9} 100%{top:100%;opacity:0} }
      @keyframes drawBorder { from{clip-path:inset(0 100% 100% 0)} to{clip-path:inset(0 0 0 0)} }
      @keyframes confettiFall { to { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
      @keyframes readyPulse { 0%,100%{box-shadow:0 0 0 0 rgba(94,252,130,0.3)} 50%{box-shadow:0 0 0 10px rgba(94,252,130,0)} }
      @keyframes flowDot { from{stroke-dashoffset:100} to{stroke-dashoffset:0} }
      @keyframes radialPulse { 0%{transform:scale(0);opacity:0.8} 100%{transform:scale(2.5);opacity:0} }
      
      .shake { animation: shake 0.4s ease-in-out; }
      .celebrate { animation: celebrate 0.5s ease-in-out; }
    ` }} />
  );
}

function playSound(type: 'click' | 'drop' | 'success' | 'error' | 'power') {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const configs = {
      click:   { freq: 880, type: 'sine',    duration: 0.08, vol: 0.15 },
      drop:    { freq: 523, type: 'sine',    duration: 0.18, vol: 0.2  },
      success: { freq: 659, type: 'triangle',duration: 0.35, vol: 0.25 },
      error:   { freq: 220, type: 'sawtooth',duration: 0.2,  vol: 0.15 },
      power:   { freq: 440, type: 'square',  duration: 0.12, vol: 0.1  },
    };
    const c = configs[type];
    osc.type = c.type as OscillatorType;
    osc.frequency.setValueAtTime(c.freq, ctx.currentTime);
    gain.gain.setValueAtTime(c.vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + c.duration);
    osc.start();
    osc.stop(ctx.currentTime + c.duration);
  } catch {}
}

// ============================================================================
// STYLES & LAYOUT CONSTANTS
// ============================================================================
const cardStyle: React.CSSProperties = {
  backgroundColor: COLORS.cardBg,
  borderRadius: '24px',
  border: '1px solid rgba(255,255,255,0.08)',
  backdropFilter: 'blur(16px)',
  padding: '24px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  animation: 'slideUp 0.5s ease-out forwards',
};

const primaryBtn: React.CSSProperties = {
  borderRadius: '16px',
  padding: '14px 28px',
  background: 'linear-gradient(135deg, #4b9bff, #8bdcb8)',
  color: '#03151e',
  fontWeight: 700,
  fontSize: '1rem',
  minHeight: '48px',
  minWidth: '120px',
  boxShadow: '0 4px 12px rgba(75,155,255,0.3)',
};

const choiceBtn: React.CSSProperties = {
  minHeight: '52px',
  minWidth: '48px',
  padding: '12px 20px',
  borderRadius: '14px',
  backgroundColor: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: COLORS.textPrimary,
  fontWeight: 600,
  fontSize: '0.95rem',
};

const novaGateStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '24px',
  padding: '40px',
  textAlign: 'center',
  maxWidth: '650px',
  margin: '40px auto',
  backgroundColor: 'rgba(11, 24, 44, 0.85)',
  borderRadius: '24px',
  border: '1px solid rgba(75, 155, 255, 0.2)',
};

const novaBubbleStyle: React.CSSProperties = {
  backgroundColor: 'rgba(20, 38, 66, 0.9)',
  borderLeft: `4px solid ${COLORS.accent}`,
  padding: '20px',
  borderRadius: '12px',
  textAlign: 'left',
  width: '100%',
};

const novaNameStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 'bold',
  color: COLORS.accent,
  marginBottom: '8px',
  fontSize: '0.9rem',
  textTransform: 'uppercase',
  letterSpacing: '1px',
};

// ============================================================================
// SHARED UI COMPONENTS
// ============================================================================
function NovaGate({ lines, onDone }: { lines: string[]; onDone: () => void }) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (idx >= lines.length) {
      setDone(true);
      return;
    }
    let i = 0;
    setText('');
    const t = setInterval(() => {
      if (i < lines[idx].length) {
        setText(p => p + lines[idx][i]);
        i++;
      } else {
        clearInterval(t);
        setTimeout(() => setIdx(p => p + 1), 1000);
      }
    }, 20);
    return () => clearInterval(t);
  }, [idx, lines]);

  return (
    <div style={novaGateStyle}>
      <div style={{ fontSize: '3.5rem', animation: 'float 2.5s ease-in-out infinite alternate' }}>🚀</div>
      <div style={novaBubbleStyle}>
        <span style={novaNameStyle}>Captain Nova</span>
        <p style={{ margin: 0, color: '#d8eeff', fontSize: '1.05rem', lineHeight: 1.7 }}>
          {text}<span style={{ animation: 'blink 0.9s step-end infinite', color: '#4bffa5' }}>▋</span>
        </p>
      </div>
      {done && (
        <button style={primaryBtn} onClick={() => { playSound('click'); onDone(); }}>
          Let's Go →
        </button>
      )}
    </div>
  );
}

// Custom Counter Hook Mock to achieve CountUp smoothly
function useCountUp(target: number) {
  const [count, setCount] = useState(target);
  useEffect(() => {
    if (count === target) return;
    const diff = target - count;
    const step = diff > 0 ? Math.ceil(diff / 5) : Math.floor(diff / 5);
    const timer = setTimeout(() => setCount(p => p + step), 40);
    return () => clearTimeout(timer);
  }, [target, count]);
  return count;
}

// ============================================================================
// SECTION 1: WHAT IS AI
// ============================================================================
interface S1Item { id: string; emoji: string; label: string; isAI: boolean; hint: string; }
const S1_ITEMS: S1Item[] = [
  { id: '1', emoji: '🎙️', label: 'Siri', isAI: true, hint: 'Siri continuously translates and reacts to complex human speech patterns!' },
  { id: '2', emoji: '♟️', label: 'Chess Robot', isAI: true, hint: 'Chess engines analyze moves ahead based on vast strategical search models.' },
  { id: '3', emoji: '🔢', label: 'Calculator', isAI: false, hint: 'Calculators use hardwired, fixed mathematical logic circuits. They cannot learn.' },
  { id: '4', emoji: '📧', label: 'Spam Filter', isAI: true, hint: 'Modern spam systems actively adjust filters as novel scam phrasing appears.' },
  { id: '5', emoji: '🌡️', label: 'Thermostat', isAI: false, hint: 'A classic mechanical thermostat simply shuts off when a threshold target is met.' },
  { id: '6', emoji: '🌐', label: 'Translator', isAI: true, hint: 'Language translation handles contextual syntax fluidly from large text corpora.' },
  { id: '7', emoji: '🚗', label: 'Self-Driving', isAI: true, hint: 'Autonomous vehicles process live computer vision frames dynamically to navigate safely.' },
  { id: '8', emoji: '⏰', label: 'Alarm Clock', isAI: false, hint: 'An alarm clock checks the target time against absolute system clock variables.' },
  { id: '9', emoji: '🎵', label: 'Music Recs', isAI: true, hint: 'Streaming engines learn your personal sonic habits to make custom predictions.' },
];

function WhatIsAISection({ onComplete }: { onComplete: () => void }) {
  const [gateOpen, setGateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [items, setItems] = useState<S1Item[]>(S1_ITEMS);
  const [assigned, setAssigned] = useState<Record<string, 'AI' | 'NOT_AI'>>({});
  const [confidence, setConfidence] = useState(20);
  const [novaHint, setNovaHint] = useState<string>('Select an item from the grid, then map it into a target pipeline core below.');
  const [shakeId, setShakeId] = useState<string | null>(null);

  if (!gateOpen) {
    return (
      <NovaGate
        lines={[
          "Welcome to the Outer Rim, Explorer! NeoCity's central classifier grid has crashed.",
          "We need to sort active technologies. Remember: If it relies on fixed rules, it's conventional logic. If it learns dynamically from historical datasets, it's Artificial Intelligence!",
        ]}
        onDone={() => setGateOpen(true)}
      />
    );
  }

  const handleLabel = (zone: 'AI' | 'NOT_AI') => {
    if (!selectedId) return;
    const current = items.find(i => i.id === selectedId);
    if (!current) return;

    const correct = (zone === 'AI' && current.isAI) || (zone === 'NOT_AI' && !current.isAI);
    if (correct) {
      playSound('drop');
      setAssigned(prev => ({ ...prev, [selectedId]: zone }));
      setConfidence(p => Math.min(100, p + 10));
      setNovaHint(`Spot on! ${current.label} successfully classified.`);
      setSelectedId(null);
    } else {
      playSound('error');
      setShakeId(selectedId);
      setConfidence(p => Math.max(0, p - 5));
      setNovaHint(`Not quite! ${current.hint}`);
      setTimeout(() => setShakeId(null), 500);
    }
  };

  const remainingCount = items.filter(i => !assigned[i.id]).length;

  return (
    <div style={cardStyle}>
      <h2 style={{ color: COLORS.accent, margin: '0 0 8px 0' }}>District 1: Neural Classifier Core</h2>
      <p style={{ color: COLORS.textSecondary, marginBottom: '24px' }}>Map items below into their appropriate operative profiles.</p>

      <div style={{ backgroundColor: '#0f1f38', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', borderLeft: '4px solid #ffaa00' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ffaa00', display: 'block', marginBottom: '4px' }}>📡 SYSTEM LOG</span>
        <p style={{ margin: 0, fontSize: '0.95rem', color: COLORS.textPrimary }}>{novaHint}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
        {items.map(item => {
          const isAssigned = !!assigned[item.id];
          const isSelected = selectedId === item.id;
          if (isAssigned) return null;

          return (
            <button
              key={item.id}
              onClick={() => { playSound('click'); setSelectedId(item.id); }}
              className={shakeId === item.id ? 'shake' : ''}
              style={{
                ...choiceBtn,
                height: '80px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4px',
                borderColor: isSelected ? COLORS.accent : 'rgba(255,255,255,0.1)',
                backgroundColor: isSelected ? 'rgba(75, 155, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                transform: isSelected ? 'scale(1.05)' : 'none',
              }}
            >
              <span style={{ fontSize: '1.6rem' }}>{item.emoji}</span>
              <span style={{ fontSize: '0.8rem' }}>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
        <button
          onClick={() => handleLabel('AI')}
          disabled={!selectedId}
          style={{
            ...choiceBtn,
            flex: 1,
            height: '70px',
            background: 'linear-gradient(180deg, rgba(75,155,255,0.1) 0%, rgba(75,155,255,0.2) 100%)',
            border: `2px dashed ${selectedId ? COLORS.accent : 'rgba(255,255,255,0.1)'}`,
            opacity: selectedId ? 1 : 0.6,
          }}
        >
          🧠 Learns From Data (AI)
        </button>
        <button
          onClick={() => handleLabel('NOT_AI')}
          disabled={!selectedId}
          style={{
            ...choiceBtn,
            flex: 1,
            height: '70px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.08) 100%)',
            border: `2px dashed ${selectedId ? '#b6c7dc' : 'rgba(255,255,255,0.1)'}`,
            opacity: selectedId ? 1 : 0.6,
          }}
        >
          ⚙️ Follows Fixed Rules (Not AI)
        </button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
          <span>AI Model Confidence</span>
          <span style={{ color: COLORS.success, fontWeight: 'bold' }}>{confidence}%</span>
        </div>
        <div style={{ width: '100%', height: '12px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ width: `${confidence}%`, height: '100%', background: 'linear-gradient(90deg, #4b9bff, #5efc82)', transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {remainingCount === 0 && (
        <div style={{ textAlign: 'center', marginTop: '24px', animation: 'celebrate 0.6s ease' }}>
          <div style={{ color: COLORS.success, fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '8px' }}>🤖 AI TRAINED SUCCESSFULLY!</div>
          <p style={{ color: COLORS.textSecondary, fontSize: '0.9rem', marginBottom: '16px' }}>
            You just mapped an AI classification structure. This matrix logic underlies recommendation engines like YouTube!
          </p>
          <button style={primaryBtn} onClick={() => { playSound('success'); onComplete(); }}>
            Advance Mission →
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SECTION 2: CLASSIFICATION FACTORY
// ============================================================================
interface S2Item { emoji: string; label: string; desc: string; category: 'Fruit' | 'Animal' | 'Vehicle'; }
const S2_ITEMS: S2Item[] = [
  { emoji: '🍎', label: 'Apple', desc: 'Crisp tree crop containing natural sugars and seeds.', category: 'Fruit' },
  { emoji: '🐕', label: 'Dog', desc: 'Four-legged domesticated mammal that displays canine traits.', category: 'Animal' },
  { emoji: '🚌', label: 'Bus', desc: 'Large high-capacity motor vehicle engineered for public roads.', category: 'Vehicle' },
  { emoji: '🍇', label: 'Grapes', desc: 'Small clustered vine berries used worldwide for juices.', category: 'Fruit' },
  { emoji: '🐦', label: 'Parrot', desc: 'Feathered avian lifeform that can imitate complex acoustic patterns.', category: 'Animal' },
  { emoji: '🚗', label: 'Car', desc: 'Compact internal combustion or electric private passenger transport.', category: 'Vehicle' },
  { emoji: '🍌', label: 'Banana', desc: 'Tropical herbaceous plant product known for rich potassium levels.', category: 'Fruit' },
  { emoji: '🐈', label: 'Cat', desc: 'Carnivorous agile domestic pet specialized in hunt behaviors.', category: 'Animal' },
  { emoji: '🚕', label: 'Taxi', desc: 'Commercial transport car with yellow hazard signaling frames.', category: 'Vehicle' },
];

function ClassificationSection({ onComplete }: { onComplete: () => void }) {
  const [gateOpen, setGateOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [counts, setCounts] = useState({ Fruit: 0, Animal: 0, Vehicle: 0 });
  const [shake, setShake] = useState(false);
  const [novaMessage, setNovaMessage] = useState('Inspect each raw data packet on the belt, and sort it to its categorical bin.');

  if (!gateOpen) {
    return (
      <NovaGate
        lines={[
          "Great job in District 1! Now we have arrived at the Sorting Terminal.",
          "AI structures group unfamiliar data using categorical tagging features. Let's see how raw text definitions map cleanly into high-level categories.",
        ]}
        onDone={() => setGateOpen(true)}
      />
    );
  }

  const handleSort = (chosen: 'Fruit' | 'Animal' | 'Vehicle') => {
    if (currentIndex >= S2_ITEMS.length) return;
    const currentItem = S2_ITEMS[currentIndex];

    if (chosen === currentItem.category) {
      playSound('drop');
      setCounts(p => ({ ...p, [chosen]: p[chosen] + 1 }));
      setNovaMessage(`Perfectly filtered! ${currentItem.label} routed to the ${chosen} hub.`);
      setCurrentIndex(p => p + 1);
    } else {
      playSound('error');
      setShake(true);
      setNovaMessage(`Wait, inspect its properties again. Does that matching profile really fit ${chosen}?`);
      setTimeout(() => setShake(false), 500);
    }
  };

  const finished = currentIndex >= S2_ITEMS.length;

  return (
    <div style={cardStyle}>
      <h2 style={{ color: COLORS.accent, margin: '0 0 8px 0' }}>District 2: Classification Factory</h2>
      <p style={{ color: COLORS.textSecondary, marginBottom: '20px' }}>Process the real-time pipeline feed safely below.</p>

      <div style={{ backgroundColor: '#0f1f38', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px' }}>
        <p style={{ margin: 0, fontSize: '0.95rem', color: COLORS.textPrimary }}>💡 <strong>Nova:</strong> {novaMessage}</p>
      </div>

      {!finished ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#1a3050', borderRadius: '4px', position: 'relative', marginBottom: '20px' }} />
          <div
            className={shake ? 'shake' : ''}
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: `2px solid ${COLORS.accent}`,
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '340px',
              textAlign: 'center',
              animation: 'slideInLeft 0.3s ease-out',
            }}
          >
            <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '8px' }}>{S2_ITEMS[currentIndex].emoji}</span>
            <h3 style={{ margin: '0 0 8px 0', color: COLORS.textPrimary }}>{S2_ITEMS[currentIndex].label}</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: COLORS.textSecondary, lineHeight: 1.5 }}>{S2_ITEMS[currentIndex].desc}</p>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px', animation: 'celebrate 0.5s' }}>
          <h3 style={{ color: COLORS.success, margin: '0 0 16px 0' }}>🌟 CONVEYOR PIPELINE COMPLETED</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', gap: '16px', maxWidth: '400px', margin: '0 auto 24px auto' }}>
            {Object.entries(counts).map(([cat, count]) => (
              <div key={cat} style={{ background: '#10223b', padding: '12px', borderRadius: '14px', flex: 1 }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: COLORS.accent }}>{count}</div>
                <div style={{ fontSize: '0.8rem', color: COLORS.textMuted }}>{cat}s</div>
              </div>
            ))}
          </div>
          <button style={primaryBtn} onClick={() => { playSound('success'); onComplete(); }}>
            Unlock Next Gate →
          </button>
        </div>
      )}

      {!finished && (
        <div style={{ display: 'flex', gap: '16px' }}>
          {(['Fruit', 'Animal', 'Vehicle'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => handleSort(cat)}
              style={{
                ...choiceBtn,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                borderColor: 'rgba(75, 155, 255, 0.3)',
                background: 'rgba(16, 35, 64, 0.6)',
              }}
            >
              <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>{cat.toUpperCase()}</span>
              <span style={{ fontSize: '0.8rem', backgroundColor: COLORS.accent, color: '#fff', padding: '2px 8px', borderRadius: '10px' }}>
                Count: {counts[cat]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SECTION 3: TRAINING DATA
// ============================================================================
interface S3Animal { type: 'Dog' | 'Cat' | 'Bird'; emoji: string; dots: Array<{ x: number; y: number }>; }
const S3_ROUNDS: S3Animal[] = [
  { type: 'Dog', emoji: '🐕', dots: [{ x: 40, y: 160 }, { x: 55, y: 180 }] },
  { type: 'Cat', emoji: '🐈', dots: [{ x: 140, y: 60 }, { x: 155, y: 45 }] },
  { type: 'Bird', emoji: '🐦', dots: [{ x: 240, y: 120 }, { x: 260, y: 140 }] },
  { type: 'Dog', emoji: '🦮', dots: [{ x: 45, y: 145 }] },
  { type: 'Cat', emoji: '🐈‍⬛', dots: [{ x: 160, y: 75 }] },
  { type: 'Bird', emoji: '🦅', dots: [{ x: 250, y: 105 }] },
];

function TrainingDataSection({ onComplete }: { onComplete: () => void }) {
  const [gateOpen, setGateOpen] = useState(false);
  const [round, setRound] = useState(0);
  const [history, setHistory] = useState<Array<{ x: number; y: number; type: string }>>([]);
  const [isLearning, setIsLearning] = useState(false);
  const [modelConfidence, setModelConfidence] = useState(0);
  const [novaMessage, setNovaMessage] = useState('Train the image classifier. Label the central animal structure.');

  if (!gateOpen) {
    return (
      <NovaGate
        lines={[
          "Welcome to the Deep Learning Greenhouse, Explorer!",
          "Algorithms are blank slates until fed structured training examples. Here, you will act as the human labeler to compile a feature set.",
        ]}
        onDone={() => setGateOpen(true)}
      />
    );
  }

  const handleLabel = (label: 'Dog' | 'Cat' | 'Bird') => {
    if (round >= S3_ROUNDS.length || isLearning) return;
    const currentItem = S3_ROUNDS[round];

    if (label === currentItem.type) {
      playSound('click');
      const newDots = currentItem.dots.map(d => ({ ...d, type: label }));
      setHistory(p => [...p, ...newDots]);
      setNovaMessage(`Label accepted! Compiling data points into high-dimensional scatter vector space.`);
      
      setIsLearning(true);
      setTimeout(() => {
        setIsLearning(false);
        setModelConfidence(Math.floor(70 + (round * 4) + Math.random() * 5));
        setRound(p => p + 1);
      }, 900);
    } else {
      playSound('error');
      setNovaMessage(`Mismatched feature vectors! That sample clearly matches typical ${currentItem.type} biome configurations.`);
    }
  };

  const finished = round >= S3_ROUNDS.length;

  return (
    <div style={cardStyle}>
      <h2 style={{ color: COLORS.accent, margin: '0 0 8px 0' }}>District 3: Training Environment</h2>
      <p style={{ color: COLORS.textSecondary, marginBottom: '24px' }}>Feed the neural parameters to increase operational confidence weights.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Left: Camera Frame */}
        <div style={{ backgroundColor: '#0a1626', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.05)', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px', position: 'relative' }}>
          <span style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '0.75rem', color: COLORS.accent, letterSpacing: '1px' }}>🖥️ LIVE CAMERA TARGET</span>
          
          {!finished ? (
            isLearning ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: COLORS.accent, marginBottom: '8px', animation: 'blink 1s infinite' }}>OPTIMIZING WEIGHTS...</div>
                <div style={{ width: '120px', height: '6px', backgroundColor: '#1a3050', borderRadius: '3px', overflow: 'hidden', margin: '0 auto' }}>
                  <div style={{ width: '100%', height: '100%', backgroundColor: COLORS.success, animation: 'readyPulse 1s infinite' }} />
                </div>
              </div>
            ) : (
              <span style={{ fontSize: '4.5rem' }}>{S3_ROUNDS[round].emoji}</span>
            )
          ) : (
            <div style={{ textAlign: 'center', color: COLORS.success }}>
              <span style={{ fontSize: '3rem' }}>✅</span>
              <div style={{ fontWeight: 'bold', fontSize: '1rem', marginTop: '6px' }}>TRAINING COMPLETE</div>
            </div>
          )}
        </div>

        {/* Right: SVG Scatter Plot */}
        <div style={{ backgroundColor: '#091220', borderRadius: '16px', padding: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: '0.75rem', color: COLORS.textMuted, display: 'block', marginBottom: '8px', textAlign: 'center' }}>EMBEDDING SPATIAL MAP</span>
          <svg style={{ width: '100%', height: '160px', backgroundColor: '#040b14', borderRadius: '8px' }}>
            {/* Theoretical clusters rings */}
            <circle cx="50" cy="150" r="25" fill="none" stroke="rgba(255, 100, 100, 0.15)" strokeWidth="1" strokeDasharray="3" />
            <circle cx="150" cy="60" r="25" fill="none" stroke="rgba(94, 252, 130, 0.15)" strokeWidth="1" strokeDasharray="3" />
            <circle cx="250" cy="120" r="25" fill="none" stroke="rgba(75, 155, 255, 0.15)" strokeWidth="1" strokeDasharray="3" />
            
            {history.map((dot, idx) => {
              const color = dot.type === 'Dog' ? '#ff6464' : dot.type === 'Cat' ? '#5efc82' : '#4b9bff';
              return <circle key={idx} cx={dot.x} cy={dot.y} r="5" fill={color} style={{ animation: 'slideUp 0.3s ease' }} />;
            })}
          </svg>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '0.7rem', marginTop: '6px' }}>
            <span style={{ color: '#ff6464' }}>● Dog</span>
            <span style={{ color: '#5efc82' }}>● Cat</span>
            <span style={{ color: '#4b9bff' }}>● Bird</span>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#0f1f38', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: COLORS.textPrimary }}>💡 {novaMessage}</p>
      </div>

      {!finished ? (
        <div style={{ display: 'flex', gap: '12px' }}>
          {(['Dog', 'Cat', 'Bird'] as const).map(animal => (
            <button
              key={animal}
              disabled={isLearning}
              onClick={() => handleLabel(animal)}
              style={{ ...choiceBtn, flex: 1, height: '52px', border: '1px solid rgba(75,155,255,0.2)' }}
            >
              {animal === 'Dog' ? '🐶 Dog' : animal === 'Cat' ? '🐱 Cat' : '🐦 Bird'}
            </button>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '20px', background: 'rgba(94,252,130,0.05)', padding: '12px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.9rem' }}>Final Model Precision:</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: COLORS.success }}>{modelConfidence}%</span>
          </div>
          <button style={primaryBtn} onClick={() => { playSound('success'); onComplete(); }}>
            Initiate District 4 Pipeline →
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SECTION 4: COMPUTER VISION SCANNER
// ============================================================================
interface CVTarget { id: string; emoji: string; name: string; isLiving: boolean; x: string; top: string; }
const CV_TARGETS: CVTarget[] = [
  { id: '1', emoji: '🐼', name: 'Animal 🐾', isLiving: true, x: '15%', top: '25%' },
  { id: '2', emoji: '🚗', name: 'Vehicle', isLiving: false, x: '45%', top: '50%' },
  { id: '3', emoji: '🐦', name: 'Animal 🐾', isLiving: true, x: '75%', top: '15%' },
  { id: '4', emoji: '🌳', name: 'Plant life', isLiving: true, x: '18%', top: '65%' },
  { id: '5', emoji: '🚦', name: 'Signal hardware', isLiving: false, x: '72%', top: '55%' },
  { id: '6', emoji: '🏠', name: 'Structure', isLiving: false, x: '45%', top: '15%' },
];

function ComputerVisionSection({ onComplete }: { onComplete: () => void }) {
  const [gateOpen, setGateOpen] = useState(false);
  const [detected, setDetected] = useState<string[]>([]);
  const [wrongFlashedId, setWrongFlashedId] = useState<string | null>(null);
  const [novaMessage, setNovaMessage] = useState('Identify and lock onto every LIVING organism present in the camera stream frame.');

  if (!gateOpen) {
    return (
      <NovaGate
        lines={[
          "Entering District 4: Computer Vision Observatory.",
          "Self-driving arrays and spatial safety protocols rely on optical grid frames. We need to focus convolutional filters only onto active living obstacles.",
        ]}
        onDone={() => setGateOpen(true)}
      />
    );
  }

  const handleTargetClick = (target: CVTarget) => {
    if (target.isLiving) {
      if (detected.includes(target.id)) return;
      playSound('click');
      setDetected(p => [...p, target.id]);
      setNovaMessage(`Locked onto ${target.name}! Bounding boxes aligned correctly.`);
    } else {
      playSound('error');
      setWrongFlashedId(target.id);
      setNovaMessage(`Target tracking failure: A ${target.name} does not possess biological signatures. Filter rejected.`);
      setTimeout(() => setWrongFlashedId(null), 800);
    }
  };

  const remaining = CV_TARGETS.filter(t => t.isLiving && !detected.includes(t.id)).length;

  return (
    <div style={cardStyle}>
      <h2 style={{ color: COLORS.accent, margin: '0 0 8px 0' }}>District 4: Computer Vision Core</h2>
      <p style={{ color: COLORS.textSecondary, marginBottom: '20px' }}>Tap live target icons to compile anchor matrices.</p>

      <div style={{ backgroundColor: '#0f1f38', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: COLORS.textPrimary }}>📡 {novaMessage}</p>
      </div>

      <div style={{ width: '100%', height: '280px', backgroundColor: '#040d1a', borderRadius: '20px', border: '2px solid rgba(75,155,255,0.15)', position: 'relative', overflow: 'hidden', marginBottom: '24px' }}>
        {/* Continuous Scanline */}
        <div style={{ position: 'absolute', width: '100%', height: '4px', background: 'linear-gradient(90deg, transparent, #5efc82, transparent)', animation: 'scanLine 2.5s linear infinite', zIndex: 2, pointerEvents: 'none' }} />

        {CV_TARGETS.map(t => {
          const isFound = detected.includes(t.id);
          const isWrong = wrongFlashedId === t.id;

          return (
            <div
              key={t.id}
              onClick={() => handleTargetClick(t)}
              style={{
                position: 'absolute',
                left: t.x,
                top: t.top,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                padding: '10px',
                userSelect: 'none',
                minWidth: '48px',
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '2.5rem', transition: 'transform 0.2s', transform: isFound ? 'scale(1.1)' : 'none' }}>{t.emoji}</span>

              {isFound && (
                <div style={{ position: 'absolute', width: '55px', height: '55px', border: `2px solid ${COLORS.success}`, borderRadius: '6px', animation: 'drawBorder 0.4s ease-out forwards', top: '5%', left: '5%' }}>
                  <span style={{ position: 'absolute', top: '-18px', left: '0', backgroundColor: COLORS.success, color: '#000', fontSize: '0.65rem', fontWeight: 'bold', padding: '1px 4px', whiteSpace: 'nowrap', borderRadius: '3px' }}>
                    {t.name}
                  </span>
                </div>
              )}

              {isWrong && (
                <div style={{ position: 'absolute', fontSize: '2rem', color: COLORS.error, animation: 'shake 0.3s ease' }}>❌</div>
              )}
            </div>
          );
        })}
      </div>

      {remaining === 0 && (
        <div style={{ textAlign: 'center', padding: '10px', animation: 'celebrate 0.5s' }}>
          <div style={{ color: COLORS.success, fontWeight: 'bold', marginBottom: '12px' }}>🎯 VISION MATRICES SYNCHRONIZED</div>
          <button style={primaryBtn} onClick={() => { playSound('success'); onComplete(); }}>
            Engage NLP Core →
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SECTION 5: NATURAL LANGUAGE PROCESSING (NLP)
// ============================================================================
interface S5Message { text: string; category: 'pos' | 'neu' | 'neg'; }
const S5_DATA: S5Message[] = [
  { text: "I absolutely love this new phone! Best purchase ever.", category: 'pos' },
  { text: "The train arrives at 3pm.", category: 'neu' },
  { text: "This movie was a complete waste of time.", category: 'neg' },
  { text: "The weather today is partly cloudy.", category: 'neu' },
  { text: "Captain Nova saved NeoCity and it was incredible!", category: 'pos' },
  { text: "The system crashed again. I'm so frustrated.", category: 'neg' },
];

function NLPSection({ onComplete }: { onComplete: () => void }) {
  const [gateOpen, setGateOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [meter, setMeter] = useState(40);
  const [customText, setCustomText] = useState('');
  const [customAnalysis, setCustomAnalysis] = useState<string | null>(null);
  const [isShake, setIsShake] = useState(false);
  const [novaHint, setNovaHint] = useState('Analyze the incoming atmospheric radio feed for semantic weight values.');

  if (!gateOpen) {
    return (
      <NovaGate
        lines={[
          "System locked at the Language Harbor terminal.",
          "Natural Language Processing breaks continuous strings into lexical chunks, determining sentiment weights automatically. Let's benchmark the processor core.",
        ]}
        onDone={() => setGateOpen(true)}
      />
    );
  }

  const handleSentiment = (type: 'pos' | 'neu' | 'neg') => {
    if (index >= S5_DATA.length) return;
    const current = S5_DATA[index];

    if (type === current.category) {
      playSound('drop');
      setMeter(p => Math.min(100, p + 10));
      setNovaHint(`Correct parsing! Metric weights optimized successfully.`);
      setIndex(p => p + 1);
    } else {
      playSound('error');
      setIsShake(true);
      setMeter(p => Math.max(0, p - 5));
      setNovaHint(`Semantic mismatch: Consider contextual keywords within the active message buffer.`);
      setTimeout(() => setIsShake(false), 500);
    }
  };

  const handleCustomTest = (val: string) => {
    setCustomText(val);
    if (!val.trim()) {
      setCustomAnalysis(null);
      return;
    }
    const txt = val.toLowerCase();
    if (txt.includes('good') || txt.includes('great') || txt.includes('love') || txt.includes('happy')) {
      setCustomAnalysis('😊 POSITIVE SENTIMENT LOADED');
    } else if (txt.includes('bad') || txt.includes('sad') || txt.includes('fail') || txt.includes('error') || txt.includes('hate')) {
      setCustomAnalysis('😠 NEGATIVE SENTIMENT SCANNED');
    } else {
      setCustomAnalysis('😐 NEUTRAL MATRIX ALIGNED');
    }
  };

  const finished = index >= S5_DATA.length;

  return (
    <div style={cardStyle}>
      <h2 style={{ color: COLORS.accent, margin: '0 0 4px 0' }}>District 5: Language Harbor</h2>
      <p style={{ color: COLORS.textSecondary, marginBottom: '20px' }}>Evaluate linguistic tensors to configure semantic tracking nodes.</p>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
          <span>NLP Parsing Confidence Indicator</span>
          <span style={{ color: COLORS.accent, fontWeight: 'bold' }}>{meter}%</span>
        </div>
        <div style={{ width: '100%', height: '10px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden' }}>
          <div style={{ width: `${meter}%`, height: '100%', backgroundColor: COLORS.accent, transition: 'width 0.3s ease' }} />
        </div>
      </div>

      <div style={{ backgroundColor: '#0f1f38', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: COLORS.textPrimary }}>💡 <strong>Nova:</strong> {novaHint}</p>
      </div>

      {!finished ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
          <div className={isShake ? 'shake' : ''} style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderLeft: `4px solid ${COLORS.accent}`, padding: '20px', borderRadius: '0 16px 16px 0' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', color: COLORS.textMuted, marginBottom: '6px' }}>INCOMING STREAMING BUFFER:</span>
            <p style={{ margin: 0, fontSize: '1.1rem', fontStyle: 'italic', color: '#fff' }}>"{S5_DATA[index].text}"</p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ ...choiceBtn, flex: 1 }} onClick={() => handleSentiment('pos')}>😊 Positive</button>
            <button style={{ ...choiceBtn, flex: 1 }} onClick={() => handleSentiment('neu')}>😐 Neutral</button>
            <button style={{ ...choiceBtn, flex: 1 }} onClick={() => handleSentiment('neg')}>😠 Negative</button>
          </div>
        </div>
      ) : (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', animation: 'slideUp 0.4s' }}>
          <h4 style={{ color: COLORS.success, margin: '0 0 12px 0' }}>⚡ SANDBOX PARSER DEMO REVEALED</h4>
          <p style={{ fontSize: '0.85rem', color: COLORS.textSecondary, marginBottom: '12px' }}>
            Type any custom testing sequence into the prompt terminal below to observe simulated keyword processing configurations:
          </p>
          <input
            type="text"
            placeholder="Type 'This is amazing' or 'Terrible structural error'..."
            value={customText}
            onChange={(e) => handleCustomTest(e.target.value)}
            style={{ width: '100%', minHeight: '48px', padding: '12px', borderRadius: '10px', backgroundColor: '#07101e', border: `1px solid ${COLORS.accent}`, color: '#fff', marginBottom: '12px' }}
          />
          {customAnalysis && (
            <div style={{ padding: '10px', backgroundColor: 'rgba(75,155,255,0.1)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', color: '#fff', marginBottom: '20px' }}>
              {customAnalysis}
            </div>
          )}
          <button style={{ ...primaryBtn, width: '100%' }} onClick={() => { playSound('success'); onComplete(); }}>
            Route to Regression Observatory →
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SECTION 6: REGRESSION OBSERVATORY
// ============================================================================
function RegressionSection({ onComplete }: { onComplete: () => void }) {
  const [gateOpen, setGateOpen] = useState(false);
  const [hours, setHours] = useState(5);
  const [sleep, setSleep] = useState(3);
  const [locked, setLocked] = useState(false);

  // Constants for fixed baseline coordinates
  const staticPoints = [
    { h: 2, m: 42 }, { h: 3, m: 50 }, { h: 6, m: 65 }, { h: 8, m: 82 }
  ];

  if (!gateOpen) {
    return (
      <NovaGate
        lines={[
          "Welcome to the Celestial Predictor Terminal, District 6.",
          "Regression maps numerical causal configurations along geometric slope intercepts. Let's calibrate continuous score trends instantly based on input variables.",
        ]}
        onDone={() => setGateOpen(true)}
      />
    );
  }

  // Formula: Base Score 30 + (Study Hours * 5) + (Sleep Quality * 4)
  const predicted = Math.min(100, 30 + (hours * 5) + (sleep * 4));

  return (
    <div style={cardStyle}>
      <h2 style={{ color: COLORS.accent, margin: '0 0 4px 0' }}>District 6: Regression Observatory</h2>
      <p style={{ color: COLORS.textSecondary, marginBottom: '20px' }}>Manipulate vector variables to trace numerical dependencies.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* SVG Scatter Plot Chart */}
        <div style={{ backgroundColor: '#050c16', borderRadius: '16px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg style={{ width: '100%', height: '220px', backgroundColor: '#02060d', borderRadius: '8px' }}>
            {/* Grid markers lines */}
            <line x1="30" y1="190" x2="280" y2="190" stroke="#1d2e47" strokeWidth="2" />
            <line x1="30" y1="20" x2="30" y2="190" stroke="#1d2e47" strokeWidth="2" />

            {/* Existing historical telemetry dots */}
            {staticPoints.map((p, idx) => {
              const cx = 30 + (p.h * 24);
              const cy = 190 - (p.m * 1.6);
              return <circle key={idx} cx={cx} cy={cy} r="5" fill="#5b7493" />;
            })}

            {/* Dynamic Interactive Node */}
            <circle
              cx={30 + (hours * 24)}
              cy={190 - (predicted * 1.6)}
              r="8"
              fill={locked ? COLORS.success : '#ff9f43'}
              style={{ transition: 'cx 0.1s, cy 0.1s', animation: 'readyPulse 2s infinite' }}
            />

            {/* Dynamic Calculated Line Vector */}
            <line
              x1="30"
              y1={190 - (30 + (1 * 5) + (sleep * 4)) * 1.6}
              x2="270"
              y2={190 - (Math.min(100, 30 + (10 * 5) + (sleep * 4))) * 1.6}
              stroke={locked ? COLORS.success : COLORS.accent}
              strokeWidth="2"
              strokeDasharray={locked ? '0' : '4'}
              style={{ transition: 'y1 0.1s, y2 0.1s' }}
            />
          </svg>
          <div style={{ fontSize: '0.7rem', color: COLORS.textMuted, marginTop: '4px' }}>
            X: Hours Evaluated | Y: Score Core Output
          </div>
        </div>

        {/* Sliders Console */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: COLORS.textPrimary }}>
              📚 Hours Evaluated: <strong style={{ color: COLORS.accent }}>{hours} hrs</strong>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              disabled={locked}
              value={hours}
              onChange={(e) => { playSound('click'); setHours(Number(e.target.value)); }}
              style={{ width: '100%', accentColor: COLORS.accent }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: COLORS.textPrimary }}>
              😴 Rest Level: <strong style={{ color: COLORS.accent }}>{sleep} / 5</strong>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              disabled={locked}
              value={sleep}
              onChange={(e) => { playSound('click'); setSleep(Number(e.target.value)); }}
              style={{ width: '100%', accentColor: COLORS.accent }}
            />
          </div>

          <div style={{ backgroundColor: '#10223b', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', display: 'block', color: COLORS.textMuted }}>PREDICTED RESULT</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: locked ? COLORS.success : '#ff9f43' }}>
              📍 {predicted} Marks
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', fontSize: '0.85rem', color: COLORS.textSecondary, marginBottom: '20px', fontFamily: 'monospace', textAlign: 'center' }}>
        TENSOR FORMULA Matrix: Base(30) + (Hours×5) + (Rest×4) = {predicted}
      </div>

      {!locked ? (
        <button style={{ ...primaryBtn, width: '100%' }} onClick={() => { playSound('power'); setLocked(true); }}>
          Lock Linear Prediction Weights
        </button>
      ) : (
        <div style={{ textAlign: 'center', animation: 'celebrate 0.5s' }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: COLORS.success }}>
            ✅ Trend Locked! Logistics operators like Swiggy use precisely this methodology to predict package dispatch times.
          </p>
          <button style={{ ...primaryBtn, width: '100%' }} onClick={() => onComplete()}>
            Proceed to Clustering Forest →
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SECTION 7: CLUSTERING FOREST
// ============================================================================
interface ClusterNode { id: string; emoji: string; category: 'Shape' | 'Animal' | 'Tool'; x: number; y: number; }
const S7_NODES: ClusterNode[] = [
  { id: '1', emoji: '🔺', category: 'Shape', x: 50, y: 50 },
  { id: '2', emoji: '🔵', category: 'Shape', x: 80, y: 40 },
  { id: '3', emoji: '⬛', category: 'Shape', x: 65, y: 75 },
  
  { id: '4', emoji: '🦊', category: 'Animal', x: 230, y: 60 },
  { id: '5', emoji: '🐈', category: 'Animal', x: 250, y: 90 },
  { id: '6', emoji: '🐰', category: 'Animal', x: 210, y: 100 },
  
  { id: '7', emoji: '📦', category: 'Tool', x: 140, y: 180 },
  { id: '8', emoji: '🎒', category: 'Tool', x: 170, y: 210 },
  { id: '9', emoji: '🪑', category: 'Tool', x: 120, y: 220 },

  { id: '10', emoji: '🐸', category: 'Animal', x: 240, y: 130 },
];

function ClusteringSection({ onComplete }: { onComplete: () => void }) {
  const [gateOpen, setGateOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Record<string, 'RED' | 'GREEN' | 'BLUE'>>({});
  const [novaMessage, setNovaMessage] = useState('Unlabeled vector elements detected. Group identical types onto common field arrays.');
  const [shakeTrigger, setShakeTrigger] = useState(false);

  if (!gateOpen) {
    return (
      <NovaGate
        lines={[
          "Entering District 7: Clustering Wilderness Canvas.",
          "Unsupervised network routines locate intrinsic patterns without prior human tagging files. Group adjacent structural behaviors to align regional centroids.",
        ]}
        onDone={() => setGateOpen(true)}
      />
    );
  }

  const handleCampAssign = (camp: 'RED' | 'GREEN' | 'BLUE') => {
    if (!selectedNodeId) return;
    playSound('drop');
    setAssignments(p => ({ ...p, [selectedNodeId]: camp }));
    setSelectedNodeId(null);
  };

  const checkValidation = () => {
    // Validate if same category items are in unique distinct camps
    const shapeCamps = S7_NODES.filter(n => n.category === 'Shape').map(n => assignments[n.id]);
    const animalCamps = S7_NODES.filter(n => n.category === 'Animal').map(n => assignments[n.id]);
    const toolCamps = S7_NODES.filter(n => n.category === 'Tool').map(n => assignments[n.id]);

    const allAssigned = S7_NODES.every(n => assignments[n.id]);
    if (!allAssigned) {
      playSound('error');
      setNovaMessage('Unfinished processing! Please distribute every floating node data cluster.');
      return;
    }

    const shapesUniform = shapeCamps.every(v => v && v === shapeCamps[0]);
    const animalsUniform = animalCamps.every(v => v && v === animalCamps[0]);
    const toolsUniform = toolCamps.every(v => v && v === toolCamps[0]);
    
    const uniqueCamps = new Set([shapeCamps[0], animalCamps[0], toolCamps[0]]).size === 3;

    if (shapesUniform && animalsUniform && toolsUniform && uniqueCamps) {
      playSound('success');
      setNovaMessage('CLUSTERS VALIDATED! Unsupervised spatial separation completely functional.');
    } else {
      playSound('error');
      setShakeTrigger(true);
      setNovaMessage('Overlapping vector limits detected! Ensure nodes of different profiles occupy separate color hubs.');
      setTimeout(() => setShakeTrigger(false), 600);
    }
  };

  const isSuccess = novaMessage.startsWith('CLUSTERS VALIDATED');

  return (
    <div style={cardStyle}>
      <h2 style={{ color: COLORS.accent, margin: '0 0 4px 0' }}>District 7: Unsupervised Clustering Forest</h2>
      <p style={{ color: COLORS.textSecondary, marginBottom: '16px' }}>Select an object node element, then isolate it into a camp network cluster.</p>

      <div style={{ backgroundColor: '#0f1f38', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: COLORS.textPrimary }}>💡 {novaMessage}</p>
      </div>

      <div className={shakeTrigger ? 'shake' : ''} style={{ position: 'relative', width: '100%', height: '250px', backgroundColor: '#030a14', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: '20px' }}>
        <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
          {/* Dynamically drawing connection links between shared camps nodes */}
          {S7_NODES.map((n1, i) => 
            S7_NODES.map((n2, j) => {
              if (i >= j) return null;
              const c1 = assignments[n1.id];
              const c2 = assignments[n2.id];
              if (c1 && c1 === c2) {
                const color = c1 === 'RED' ? '#ff6464' : c1 === 'GREEN' ? '#5efc82' : '#4b9bff';
                return (
                  <line
                    key={`${n1.id}-${n2.id}`}
                    x1={n1.x + 12}
                    y1={n1.y + 12}
                    x2={n2.x + 12}
                    y2={n2.y + 12}
                    stroke={color}
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                );
              }
              return null;
            })
          )}
        </svg>

        {S7_NODES.map(n => {
          const camp = assignments[n.id];
          const isSelected = selectedNodeId === n.id;
          let borderCol = 'transparent';
          if (isSelected) borderCol = '#fff';
          else if (camp === 'RED') borderCol = '#ff6464';
          else if (camp === 'GREEN') borderCol = '#5efc82';
          else if (camp === 'BLUE') borderCol = '#4b9bff';

          return (
            <button
              key={n.id}
              onClick={() => { playSound('click'); setSelectedNodeId(n.id); }}
              style={{
                position: 'absolute',
                left: `${n.x}px`,
                top: `${n.y}px`,
                background: 'none',
                border: `2px solid ${borderCol}`,
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                backgroundColor: isSelected ? 'rgba(255,255,255,0.15)' : 'transparent',
                boxShadow: isSelected ? '0 0 10px #fff' : 'none',
              }}
            >
              {n.emoji}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button
          disabled={!selectedNodeId}
          onClick={() => handleCampAssign('RED')}
          style={{ ...choiceBtn, flex: 1, color: '#ff6464', borderColor: '#ff6464', backgroundColor: 'rgba(255,100,100,0.05)' }}
        >
          🔴 Red Camp
        </button>
        <button
          disabled={!selectedNodeId}
          onClick={() => handleCampAssign('GREEN')}
          style={{ ...choiceBtn, flex: 1, color: '#5efc82', borderColor: '#5efc82', backgroundColor: 'rgba(94,252,130,0.05)' }}
        >
          🟢 Green Camp
        </button>
        <button
          disabled={!selectedNodeId}
          onClick={() => handleCampAssign('BLUE')}
          style={{ ...choiceBtn, flex: 1, color: '#4b9bff', borderColor: '#4b9bff', backgroundColor: 'rgba(75,155,255,0.05)' }}
        >
          🔵 Blue Camp
        </button>
      </div>

      {!isSuccess ? (
        <button style={{ ...primaryBtn, width: '100%' }} onClick={checkValidation}>
          Verify K-Means Cluster Boundaries
        </button>
      ) : (
        <div style={{ textAlign: 'center', animation: 'celebrate 0.4s' }}>
          <p style={{ fontSize: '0.85rem', color: COLORS.textSecondary, marginBottom: '12px' }}>
            Excellent data topology separation. Spotify uses unsupervised clustering architectures to compile weekly listener algorithmic playlists!
          </p>
          <button style={primaryBtn} onClick={() => onComplete()}>
            Proceed to Data Vault →
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SECTION 8: DATA TYPES VAULT
// ============================================================================
interface Riddle { q: string; a: 'Structured' | 'Unstructured' | 'Time-Series' | 'Spatial'; hint: string; }
const RIDDLES: Riddle[] = [
  { q: "A spreadsheet array showing structured names, numerical grades, and student counts.", a: 'Structured', hint: "Data residing neatly in formal tables, rows, or tabular data parameters." },
  { q: "Thousands of high-definition Instagram jpeg photographs uploaded without tables.", a: 'Unstructured', hint: "Free-flowing assets like media logs or unstructured video files." },
  { q: "Temperature telemetry recordings logged continuously every 10 minutes over 6 months.", a: 'Time-Series', hint: "Tracking continuous timeline updates ordered explicitly by chronal timestamps." },
  { q: "Live GPS coordinates tracking coordinates of active delivery vessels across the city map.", a: 'Spatial', hint: "Positional telemetry based on absolute geographic coordinate tracking models." },
];

function DataTypesSection({ onComplete }: { onComplete: () => void }) {
  const [gateOpen, setGateOpen] = useState(false);
  const [currentRiddleIdx, setCurrentRiddleIdx] = useState(0);
  const [shake, setShake] = useState(false);
  const [novaMessage, setNovaMessage] = useState('Crack the vault parameters by classifying data storage signatures.');

  if (!gateOpen) {
    return (
      <NovaGate
        lines={[
          "Arrived at District 8: The Central Data Crypt.",
          "Different models demand specific data formats. Let's analyze architecture formats to unlock the security layers.",
        ]}
        onDone={() => setGateOpen(true)}
      />
    );
  }

  const handleAnswer = (ans: 'Structured' | 'Unstructured' | 'Time-Series' | 'Spatial') => {
    if (currentRiddleIdx >= RIDDLES.length) return;
    const current = RIDDLES[currentRiddleIdx];

    if (ans === current.a) {
      playSound('success');
      setNovaMessage(`Security ring unlocked! Access layer confirmed.`);
      setCurrentRiddleIdx(p => p + 1);
    } else {
      playSound('error');
      setShake(true);
      setNovaMessage(`Access Denied! Hint: ${current.hint}`);
      setTimeout(() => setShake(false), 600);
    }
  };

  const finished = currentRiddleIdx >= RIDDLES.length;

  return (
    <div style={cardStyle}>
      <h2 style={{ color: COLORS.accent, margin: '0 0 4px 0' }}>District 8: The Data Crypt Vault</h2>
      <p style={{ color: COLORS.textSecondary, marginBottom: '24px' }}>Decrypt security variables sequentially to unlock the primary files.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px', marginBottom: '24px', alignItems: 'center' }}>
        {/* SVG Concentric Lock Rings Graphics */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <svg style={{ width: '160px', height: '160px' }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke={currentRiddleIdx > 0 ? COLORS.success : '#203a61'} strokeWidth="4" strokeDasharray="10 5" style={{ transformOrigin: '50% 50%', transform: `rotate(${currentRiddleIdx * 45}deg)`, transition: 'transform 0.5s' }} />
            <circle cx="50" cy="50" r="30" fill="none" stroke={currentRiddleIdx > 1 ? COLORS.success : '#2a4d80'} strokeWidth="4" strokeDasharray="6 4" style={{ transformOrigin: '50% 50%', transform: `rotate(-${currentRiddleIdx * 60}deg)`, transition: 'transform 0.5s' }} />
            <circle cx="50" cy="50" r="20" fill="none" stroke={currentRiddleIdx > 2 ? COLORS.success : '#3560a1'} strokeWidth="4" style={{ transformOrigin: '50% 50%', transform: `rotate(${currentRiddleIdx * 90}deg)`, transition: 'transform 0.5s' }} />
            <circle cx="50" cy="50" r="8" fill={finished ? COLORS.success : '#ffbb00'} />
          </svg>
        </div>

        {/* Quest text terminal window */}
        <div className={shake ? 'shake' : ''} style={{ backgroundColor: '#091526', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: '0.75rem', color: COLORS.accent, fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>ENCRYPTED LOCK INTERFACE:</span>
          {!finished ? (
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#fff', lineHeight: 1.5 }}>"{RIDDLES[currentRiddleIdx].q}"</p>
          ) : (
            <p style={{ margin: 0, fontSize: '0.95rem', color: COLORS.success, fontWeight: 'bold' }}>🔓 CRYPT CORE ACCESSED SUCCESSFULLY</p>
          )}
        </div>
      </div>

      <div style={{ backgroundColor: '#0f1f38', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: COLORS.textPrimary }}>📡 {novaMessage}</p>
      </div>

      {!finished ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button style={choiceBtn} onClick={() => handleAnswer('Structured')}>🗂️ Structured</button>
          <button style={choiceBtn} onClick={() => handleAnswer('Unstructured')}>🌊 Unstructured</button>
          <button style={choiceBtn} onClick={() => handleAnswer('Time-Series')}>⏱️ Time-Series</button>
          <button style={choiceBtn} onClick={() => handleAnswer('Spatial')}>🗺️ Spatial</button>
        </div>
      ) : (
        <button style={{ ...primaryBtn, width: '100%' }} onClick={() => onComplete()}>
          Assemble Pipeline Machine →
        </button>
      )}
    </div>
  );
}

// ============================================================================
// SECTION 9: AI WORKFLOW PIPELINE
// ============================================================================
const PIPELINE_STEPS = [
  { id: 'S1', label: 'Define the Problem', emoji: '🎯' },
  { id: 'S2', label: 'Collect Data', emoji: '📥' },
  { id: 'S3', label: 'Clean & Prepare Data', emoji: '🧹' },
  { id: 'S4', label: 'Train the Model', emoji: '🏋️' },
  { id: 'S5', label: 'Test & Evaluate', emoji: '🧪' },
];

function AIWorkflowSection({ onComplete }: { onComplete: () => void }) {
  const [gateOpen, setGateOpen] = useState(false);
  const [slots, setSlots] = useState<Array<string | null>>([null, null, null, null, null]);
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [pool, setPool] = useState<string[]>(['S3', 'S1', 'S5', 'S2', 'S4']); // Shuffled original sequence
  const [isValidated, setIsValidated] = useState(false);
  const [novaMessage, setNovaMessage] = useState('Map lifecycle items into logical sequential pipeline slots.');
  const [shake, setShake] = useState(false);

  if (!gateOpen) {
    return (
      <NovaGate
        lines={[
          "Arrived at District 9: System Pipeline Factory.",
          "Engineering reliable software requires adhering to sequential methodology. You cannot train parameters without parsing training datasets first!",
        ]}
        onDone={() => setGateOpen(true)}
      />
    );
  }

  const handleSlotClick = (slotIdx: number) => {
    if (isValidated) return;
    
    // If a pool item is selected, place it
    if (selectedPoolId) {
      playSound('click');
      const nextSlots = [...slots];
      const occupiedId = nextSlots[slotIdx];
      
      nextSlots[slotIdx] = selectedPoolId;
      setSlots(nextSlots);
      setPool(p => {
        const filtered = p.filter(id => id !== selectedPoolId);
        if (occupiedId) filtered.push(occupiedId);
        return filtered;
      });
      setSelectedPoolId(null);
    } else {
      // Remove from slot back to pool
      const currentId = slots[slotIdx];
      if (!currentId) return;
      playSound('click');
      const nextSlots = [...slots];
      nextSlots[slotIdx] = null;
      setSlots(nextSlots);
      setPool(p => [...p, currentId]);
    }
  };

  const verifyPipeline = () => {
    const sequenceCorrect = slots.every((id, idx) => id === `S${idx + 1}`);
    if (sequenceCorrect) {
      playSound('success');
      setIsValidated(true);
      setNovaMessage('SYSTEM PIPELINE ONLINE! Core deployment matrices finalized.');
    } else {
      playSound('error');
      setShake(true);
      setNovaMessage('Execution runtime failure: Stages sequence broken. Remember, cleansing raw blocks always precedes model optimization weights.');
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={cardStyle}>
      <h2 style={{ color: COLORS.accent, margin: '0 0 4px 0' }}>District 9: The AI Pipeline Machine</h2>
      <p style={{ color: COLORS.textSecondary, marginBottom: '20px' }}>Structure stages sequentially from left to right to build an operational system.</p>

      <div style={{ backgroundColor: '#0f1f38', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: COLORS.textPrimary }}>💡 {novaMessage}</p>
      </div>

      {/* Target Slots Tracks */}
      <div className={shake ? 'shake' : ''} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '24px' }}>
        {slots.map((id, idx) => {
          const stepObj = PIPELINE_STEPS.find(s => s.id === id);
          return (
            <div
              key={idx}
              onClick={() => handleSlotClick(idx)}
              style={{
                minHeight: '90px',
                border: `2px dashed ${id ? COLORS.accent : 'rgba(255,255,255,0.15)'}`,
                borderRadius: '16px',
                backgroundColor: id ? 'rgba(75,155,255,0.06)' : 'transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: '8px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.7rem', color: COLORS.textMuted, marginBottom: '4px' }}>STAGE 0{idx + 1}</div>
              {stepObj ? (
                <>
                  <span style={{ fontSize: '1.4rem' }}>{stepObj.emoji}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{stepObj.label}</span>
                </>
              ) : (
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>[Empty]</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Unallocated Items Pool */}
      {!isValidated && (
        <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '16px', marginBottom: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: COLORS.textMuted, display: 'block', marginBottom: '10px' }}>AVAILABLE LIFECYCLE STAGES MODULES:</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {pool.map(id => {
              const item = PIPELINE_STEPS.find(s => s.id === id)!;
              const isSelected = selectedPoolId === id;
              return (
                <button
                  key={id}
                  onClick={() => { playSound('click'); setSelectedPoolId(isSelected ? null : id); }}
                  style={{
                    ...choiceBtn,
                    flex: '1 1 120px',
                    borderColor: isSelected ? '#fff' : 'rgba(255,255,255,0.1)',
                    backgroundColor: isSelected ? 'rgba(75,155,255,0.2)' : 'rgba(255,255,255,0.04)',
                    boxShadow: isSelected ? '0 0 8px rgba(75,155,255,0.4)' : 'none',
                  }}
                >
                  <span>{item.emoji} {item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!isValidated ? (
        <button style={{ ...primaryBtn, width: '100%' }} onClick={verifyPipeline}>
          Engage Factory Pipeline Systems
        </button>
      ) : (
        <div style={{ textAlign: 'center', animation: 'celebrate 0.5s' }}>
          <p style={{ fontSize: '0.85rem', color: COLORS.success, marginBottom: '16px' }}>
            ✅ Sequence synchronized! This structured lifecycle governs enterprise deployments from autonomous shipping grids to advanced medical AI diagnostics.
          </p>
          <button style={primaryBtn} onClick={() => onComplete()}>
            Proceed to Final Core Nexus →
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SECTION 10: FINAL CORE RESTORATION & BOSS BATTLE
// ============================================================================
interface BossQuestion { q: string; options: string[]; correctIdx: number; }
const BOSS_QUESTIONS: BossQuestion[] = [
  { q: "Which core paradigm learns trends dynamically from historical tracking files instead of hardcoded rules?", options: ["Artificial Intelligence", "Mechanical Thermostat Controllers", "Fixed Matrix Calculators"], correctIdx: 0 },
  { q: "What classification methodology isolates unstructured photos cleanly from tabular arrays?", options: ["Linear Regression Slopes", "Computer Vision & NLP Data Typing", "Conventional Hardware Alarms"], correctIdx: 1 },
  { q: "What does human labeling provide to an initialized model workspace?", options: ["Processor Clock Cycles", "Structured Training Datasets", "Raw Network Bandwidth"], correctIdx: 1 },
  { q: "Swiggy uses which algorithm structure to predict continuous shipment timelines?", options: ["Unsupervised Clustering Matrices", "Linear Regression", "Categorical Language Filtering"], correctIdx: 1 },
  { q: "What stage directly succeeds Data Collection within an automated engineering workflow?", options: ["Immediate Model Evaluation", "Data Cleaning & Preparation", "Live Server Core Deployment"], correctIdx: 1 },
];

function FinalMissionSection({ onComplete }: { onComplete: () => void }) {
  const [gateOpen, setGateOpen] = useState(false);
  
  // Sequence tracker: 'MINI_GAMES' -> 'BOSS_BATTLE'
  const [subStage, setSubStage] = useState<'MINI_GAMES' | 'BOSS_BATTLE'>('MINI_GAMES');
  const [miniStep, setMiniStep] = useState(0);

  // Boss state
  const [bossIdx, setBossIdx] = useState(0);
  const [coreHealth, setCoreHealth] = useState(100);
  const [timeLeft, setTimeLeft] = useState(15);
  const [bossShake, setBossShake] = useState(false);

  // Strict declarations of all functional hooks before gate escape early return triggers
  useEffect(() => {
    if (!gateOpen || subStage !== 'BOSS_BATTLE' || bossIdx >= BOSS_QUESTIONS.length) return;
    
    setTimeLeft(15);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          playSound('error');
          setCoreHealth(h => Math.max(0, h - 20));
          setBossIdx(b => b + 1);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gateOpen, subStage, bossIdx]);

  if (!gateOpen) {
    return (
      <NovaGate
        lines={[
          "ALERT: Reached Core Omega Node, District 10.",
          "The main mainframe core is fluctuating wildly. Complete the 4 rapid hardware overrides to stabilize backup containment arrays, then prepare to override the AI mainframe firewall safeguards!",
        ]}
        onDone={() => setGateOpen(true)}
      />
    );
  }

  // --- SUBSTAGE 1: 4 QUICK CHALLENGES ---
  const handleMiniChallenge = (isCorrect: boolean) => {
    if (isCorrect) {
      playSound('success');
      if (miniStep < 3) {
        setMiniStep(p => p + 1);
      } else {
        setSubStage('BOSS_BATTLE');
      }
    } else {
      playSound('error');
    }
  };

  // --- SUBSTAGE 2: BOSS FIREWALL OVERRIDE ---
  const handleBossAnswer = (selectedIdx: number) => {
    const currentQuestion = BOSS_QUESTIONS[bossIdx];
    if (selectedIdx === currentQuestion.correctIdx) {
      playSound('success');
    } else {
      playSound('error');
      setCoreHealth(h => Math.max(0, h - 20));
      setBossShake(true);
      setTimeout(() => setBossShake(false), 500);
    }
    
    if (bossIdx < BOSS_QUESTIONS.length - 1) {
      setBossIdx(p => p + 1);
      setTimeLeft(15);
    } else {
      // Trigger full experience callback
      onComplete();
    }
  };

  return (
    <div style={cardStyle}>
      <h2 style={{ color: '#ff4b4b', margin: '0 0 4px 0' }}>🚨 FINAL MISSION: Core Nexus Terminal</h2>
      
      {/* Visual Status Indicator Rings Tracker */}
      <div style={{ display: 'flex', gap: '10px', margin: '16px 0' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ flex: 1, height: '10px', borderRadius: '5px', backgroundColor: (subStage === 'BOSS_BATTLE' || miniStep > i) ? COLORS.success : '#551a1a', transition: 'all 0.3s' }} />
        ))}
      </div>

      {subStage === 'MINI_GAMES' ? (
        <div>
          {miniStep === 0 && (
            <div style={{ animation: 'slideInRight 0.3s' }}>
              <h3 style={{ color: COLORS.accent }}>Override 1: Data Type Routing</h3>
              <p style={{ color: COLORS.textSecondary }}>A streaming telemetry array tracking real-time weather logs belongs to which storage core format profile?</p>
              <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                <button style={choiceBtn} onClick={() => handleMiniChallenge(false)}>🗂️ Standard Tabular Structured Matrix</button>
                <button style={choiceBtn} onClick={() => handleMiniChallenge(true)}>⏱️ Continuous Time-Series Vector Pipeline</button>
                <button style={choiceBtn} onClick={() => handleMiniChallenge(false)}>🗺️ Static Geographic Spatial Coordinate Coordinates</button>
              </div>
            </div>
          )}

          {miniStep === 1 && (
            <div style={{ animation: 'slideInRight 0.3s' }}>
              <h3 style={{ color: COLORS.accent }}>Override 2: Regression Intercept Target</h3>
              <p style={{ color: COLORS.textSecondary }}>Review the systematic trend data line below: [Mon: 10, Tue: 12, Wed: 14, Thu: 16]. Calculate the predicted core variable vector target for Friday:</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ ...choiceBtn, flex: 1 }} onClick={() => handleMiniChallenge(false)}>14 Core Units</button>
                <button style={{ ...choiceBtn, flex: 1 }} onClick={() => handleMiniChallenge(true)}>18 Core Units</button>
                <button style={{ ...choiceBtn, flex: 1 }} onClick={() => handleMiniChallenge(false)}>22 Core Units</button>
              </div>
            </div>
          )}

          {miniStep === 2 && (
            <div style={{ animation: 'slideInRight 0.3s' }}>
              <h3 style={{ color: COLORS.accent }}>Override 3: Lexical Sentiment Intercept</h3>
              <p style={{ color: COLORS.textSecondary }}>Linguistic intercept: "The primary mainframe cooling lines have failed completely. This is absolutely disastrous!" Evaluate the semantic balance weight:</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ ...choiceBtn, flex: 1 }} onClick={() => handleMiniChallenge(false)}>😊 Positive Tensor</button>
                <button style={{ ...choiceBtn, flex: 1 }} onClick={() => handleMiniChallenge(false)}>😐 Neutral Balance</button>
                <button style={{ ...choiceBtn, flex: 1 }} onClick={() => handleMiniChallenge(true)}>😠 Negative Backlog</button>
              </div>
            </div>
          )}

          {miniStep === 3 && (
            <div style={{ animation: 'slideInRight 0.3s' }}>
              <h3 style={{ color: COLORS.accent }}>Override 4: Spatial Clusters Count</h3>
              <p style={{ color: COLORS.textSecondary }}>An unsupervised topology map logs 3 tight clusters of geometric shapes alongside 3 separate clusters of biological data vectors. How many distinct natural groups exist?</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ ...choiceBtn, flex: 1 }} onClick={() => handleMiniChallenge(false)}>1 Composite Blob</button>
                <button style={{ ...choiceBtn, flex: 1 }} onClick={() => handleMiniChallenge(true)}>2 Isolated Dense Clusters</button>
                <button style={{ ...choiceBtn, flex: 1 }} onClick={() => handleMiniChallenge(false)}>4 Segmented Spans</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // BOSS BATTLE NODE MODE PANEL
        <div className={bossShake ? 'shake' : ''} style={{ animation: 'slideUp 0.4s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ color: '#ff4b4b', fontWeight: 'bold', fontSize: '0.9rem' }}>🛡️ FIREWALL DEPLOYED MATRIX</span>
            <span style={{ backgroundColor: '#ff4b4b', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              ⏳ SECURITY INTERCEPT DETECTED: {timeLeft}s
            </span>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
              <span>Mainframe Logic Core Health Status</span>
              <span style={{ color: coreHealth > 40 ? COLORS.success : COLORS.error, fontWeight: 'bold' }}>{coreHealth}%</span>
            </div>
            <div style={{ width: '100%', height: '12px', backgroundColor: '#3a1010', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${coreHealth}%`, height: '100%', backgroundColor: coreHealth > 40 ? COLORS.success : COLORS.error, transition: 'width 0.3s' }} />
            </div>
          </div>

          {coreHealth <= 0 ? (
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <p style={{ color: COLORS.error, fontWeight: 'bold' }}>MAIN FRAMEWORK IS CRITICALLY DEGRADED</p>
              <button style={primaryBtn} onClick={() => { setCoreHealth(100); setBossIdx(0); setSubStage('MINI_GAMES'); setMiniStep(0); }}>
                Re-initialize Core Terminals Override Sequences
              </button>
            </div>
          ) : (
            <div>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '16px', marginBottom: '20px', border: '1px solid rgba(255,75,75,0.2)' }}>
                <span style={{ fontSize: '0.75rem', color: '#ff7878', display: 'block', marginBottom: '6px' }}>CHALLENGE COMPILER INTEGRATION {bossIdx + 1} / {BOSS_QUESTIONS.length}:</span>
                <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#fff' }}>{BOSS_QUESTIONS[bossIdx].q}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {BOSS_QUESTIONS[bossIdx].options.map((opt, oIdx) => (
                  <button key={oIdx} style={{ ...choiceBtn, textAlign: 'left', minHeight: '48px' }} onClick={() => handleBossAnswer(oIdx)}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// APP ROOT HOOKS & ARCHITECTURE LAYOUT CONTAINER
// ============================================================================
export default function App() {
  const [xp, setXp] = useState(0);
  const [completed, setCompleted] = useState<SectionKey[]>([]);
  const [currentSection, setCurrentSection] = useState<SectionKey>('landing');

  const displayedXp = useCountUp(xp);

  const handleSectionComplete = () => {
    const currentConf = SECTIONS.find(s => s.key === currentSection);
    if (currentConf && !completed.includes(currentSection)) {
      setXp(p => p + currentConf.xpReward);
      setCompleted(p => [...p, currentSection]);
    }

    const currentIdx = SECTIONS.findIndex(s => s.key === currentSection);
    if (currentIdx !== -1 && currentIdx < SECTIONS.length - 1) {
      setCurrentSection(SECTIONS[currentIdx + 1].key);
    } else {
      setCurrentSection('victory');
    }
  };

  const getActiveBadge = () => {
    if (completed.length === 0) return '🚀 Greenhorn Cadet';
    const lastKey = completed[completed.length - 1];
    const found = SECTIONS.find(s => s.key === lastKey);
    return found ? found.badge : '🚀 Greenhorn Cadet';
  };

  const progressPercent = Math.floor((completed.length / SECTIONS.length) * 100);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GlobalStyles />

      {/* Primary Header Interface Grid */}
      <header style={{ backgroundColor: '#0b1424', padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.8rem' }}>🏙️</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.2rem', letterSpacing: '0.5px', color: COLORS.textPrimary }}>NeoCity AI Adventure</h1>
            <span style={{ fontSize: '0.75rem', color: COLORS.textMuted, textTransform: 'uppercase' }}>Central Administration Mainframe</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: '#10223b', padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(75,155,255,0.2)' }}>
            <span style={{ fontSize: '0.75rem', color: COLORS.textSecondary, display: 'block' }}>EXP METRICS ACCRUE</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: COLORS.success }}>✨ {displayedXp} XP</span>
          </div>
        </div>
      </header>

      {/* Main Framework Partition Columns split */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr', backgroundColor: COLORS.bg }}>
        
        {/* Left Interactive Track Map Sidebar Panel */}
        <aside style={{ backgroundColor: '#0b1321', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: COLORS.textMuted, display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Core Progress</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '6px' }}>System Restored: {progressPercent}%</div>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: COLORS.accent, transition: 'width 0.4s ease' }} />
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: COLORS.textMuted, display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Equipped Clearance Level Badge</span>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '10px', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: COLORS.accent }}>
              {getActiveBadge()}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.75rem', color: COLORS.textMuted, display: 'block', marginBottom: '10px', textTransform: 'uppercase' }}>District Transit Coordinates</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {SECTIONS.map((sec, sIdx) => {
                const isCompleted = completed.includes(sec.key);
                const isActive = currentSection === sec.key;
                let color = 'rgba(255,255,255,0.3)';
                let bg = 'transparent';
                if (isActive) {
                  color = COLORS.accent;
                  bg = 'rgba(75,155,255,0.08)';
                } else if (isCompleted) {
                  color = COLORS.success;
                }

                return (
                  <div
                    key={sec.key}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      fontWeight: isActive || isCompleted ? 'bold' : 'normal',
                      color: color,
                      backgroundColor: bg,
                      border: isActive ? '1px solid rgba(75,155,255,0.2)' : '1px solid transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>{isCompleted ? '✅' : isActive ? '⚡' : '🔒'}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>0{sIdx + 1}: {sec.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Active Dynamic Sandbox Screen Area Viewport Container */}
        <main style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
          
          {currentSection === 'landing' && (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '48px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px', animation: 'float 3s infinite alternate' }}>🛸</div>
              <h2 style={{ fontSize: '2rem', color: '#fff', margin: '0 0 12px 0' }}>NeoCity AI Adventure Terminal Entry</h2>
              <p style={{ color: COLORS.textSecondary, fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 32px auto', lineHeight: 1.6 }}>
                Junior Explorer, NeoCity's central machine intelligence clusters have suffered a total logic crash. We need to travel across the operational districts to reboot the pipelines!
              </p>
              <button style={{ ...primaryBtn, fontSize: '1.1rem', padding: '16px 40px' }} onClick={() => { playSound('power'); setCurrentSection('whatIsAI'); }}>
                Initialize System Override Array Protocols →
              </button>
            </div>
          )}

          {currentSection === 'whatIsAI' && <WhatIsAISection onComplete={handleSectionComplete} />}
          {currentSection === 'classification' && <ClassificationSection onComplete={handleSectionComplete} />}
          {currentSection === 'trainingData' && <TrainingDataSection onComplete={handleSectionComplete} />}
          {currentSection === 'computerVision' && <ComputerVisionSection onComplete={handleSectionComplete} />}
          {currentSection === 'nlp' && <NLPSection onComplete={handleSectionComplete} />}
          {currentSection === 'regression' && <RegressionSection onComplete={handleSectionComplete} />}
          {currentSection === 'clustering' && <ClusteringSection onComplete={handleSectionComplete} />}
          {currentSection === 'dataTypes' && <DataTypesSection onComplete={handleSectionComplete} />}
          {currentSection === 'aiWorkflow' && <AIWorkflowSection onComplete={handleSectionComplete} />}
          {currentSection === 'finalMission' && <FinalMissionSection onComplete={handleSectionComplete} />}

          {currentSection === 'victory' && (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '48px', position: 'relative', overflow: 'hidden' }}>
              {/* Confetti Generation loops block */}
              {Array.from({ length: 40 }).map((_, i) => {
                const left = Math.random() * 100;
                const delay = Math.random() * 3;
                const colorsArr = ['#4b9bff', '#5efc82', '#ff6464', '#ffbb00'];
                const randomColor = colorsArr[Math.floor(Math.random() * colorsArr.length)];
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      width: '8px',
                      height: '8px',
                      backgroundColor: randomColor,
                      top: '-10px',
                      left: `${left}%`,
                      opacity: 0.7,
                      borderRadius: '50%',
                      animation: `confettiFall 4s linear infinite`,
                      animationDelay: `${delay}s`,
                      pointerEvents: 'none',
                    }}
                  />
                );
              })}

              <div style={{ fontSize: '5rem', marginBottom: '16px' }}>👑</div>
              <h2 style={{ fontSize: '2.5rem', color: COLORS.success, margin: '0 0 12px 0' }}>MAINFRAME TOTALLY RESTORED!</h2>
              <p style={{ color: COLORS.textSecondary, fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 32px auto', lineHeight: 1.6 }}>
                Incredible work, Master Explorer! You successfully navigated through text token sentiments, linear regressions, computer vision boundaries, and pipeline optimizations. NeoCity is safe and fully operational!
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', maxWidth: '500px', margin: '0 auto 40px auto' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '16px 24px', borderRadius: '16px', flex: 1 }}>
                  <span style={{ fontSize: '0.8rem', color: COLORS.textMuted, display: 'block' }}>TOTAL SCORE METRICS</span>
                  <span style={{ fontSize: '2rem', fontWeight: 'bold', color: COLORS.accent }}>{xp} XP</span>
                </div>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '16px 24px', borderRadius: '16px', flex: 1 }}>
                  <span style={{ fontSize: '0.8rem', color: COLORS.textMuted, display: 'block' }}>DISTRICT CORES OVERRIDDEN</span>
                  <span style={{ fontSize: '2rem', fontWeight: 'bold', color: COLORS.success }}>10 / 10</span>
                </div>
              </div>

              <button
                style={{ ...primaryBtn, fontSize: '1.1rem', padding: '16px 40px' }}
                onClick={() => {
                  playSound('power');
                  setXp(0);
                  setCompleted([]);
                  setCurrentSection('landing');
                }}
              >
                Reinitialize Simulation Matrix 🔄
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
