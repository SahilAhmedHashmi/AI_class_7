import { useEffect, useMemo, useRef, useState, createContext, useContext } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { BossBattle, BossQuestion } from './components/BossBattle';
import { RegressionLab } from './components/RegressionLab';

export const PlayerContext = createContext<string>('');

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
  | 'finalMission';

type MissionKey = Exclude<SectionKey, 'landing'>;
type SoundType = 'click' | 'drop' | 'success' | 'error' | 'power';
type CompleteHandler = () => void;
type Sentiment = 'Positive' | 'Neutral' | 'Negative';

const sectionOrder: SectionKey[] = [
  'landing',
  'whatIsAI',
  'classification',
  'trainingData',
  'computerVision',
  'nlp',
  'regression',
  'clustering',
  'dataTypes',
  'aiWorkflow',
  'finalMission',
];

const missionKeys = sectionOrder.filter((key): key is MissionKey => key !== 'landing');

const sectionTitles: Record<SectionKey, string> = {
  landing: 'Launch',
  whatIsAI: 'What is AI?',
  classification: 'Classification Factory',
  trainingData: 'Training the AI',
  computerVision: 'Computer Vision Scanner',
  nlp: 'Language Harbor',
  regression: 'Regression Observatory',
  clustering: 'Clustering Forest',
  dataTypes: 'The Data Vault',
  aiWorkflow: 'The AI Pipeline Machine',
  finalMission: 'Restore the AI Core',
};

const sectionDetails: Partial<Record<SectionKey, { title: string; text: string }>> = {
  classification: {
    title: 'Why classification matters',
    text: 'Classification is how AI puts things into categories based on their features. In the activity ahead, you will teach the model to sort items into Fruit, Animal, and Vehicle bins. This is the same idea behind email filters, image tagging, and medical diagnosis systems.',
  },
  trainingData: {
    title: 'What is training data?',
    text: 'Training data is a set of examples that teach an AI model how to make decisions. The more good examples you give it, the better it becomes at recognizing patterns. In this activity, you will label images so the model learns from your choices.',
  },
  computerVision: {
    title: 'How computer vision works',
    text: 'Computer vision lets AI understand pictures and video. It looks for shapes, colors, and objects to decide what it sees. In this activity, you will find living things in the scene to help the vision system learn what counts as life.',
  },
  nlp: {
    title: 'What is NLP?',
    text: 'Natural language processing (NLP) helps computers read and understand human language. It can tell whether a sentence is happy, sad, or neutral. In this activity, you will teach the AI to recognize sentiment in text and then try it yourself.',
  },
  regression: {
    title: 'What is regression?',
    text: 'Regression is a way for AI to predict a number based on other data. For example, it can estimate test scores from study hours and sleep. In this activity, you will move the sliders and see how the prediction changes.',
  },
  clustering: {
    title: 'What is clustering?',
    text: 'Clustering groups items that are similar without using labels. It helps AI discover patterns on its own. In this activity, you will assign dots to camps based on their natural groups so the AI can form clusters.',
  },
  dataTypes: {
    title: 'Why data types matter',
    text: 'Different kinds of data need different handling. Structured data has rows and columns, while unstructured data is free-form like photos or text. This activity asks you to identify the right data type for each example.',
  },
  aiWorkflow: {
    title: 'The AI workflow',
    text: 'Every AI system follows a series of steps: define the problem, collect data, clean it, train the model, then test it. In this activity, you will put these steps in the correct order so the AI pipeline can run smoothly.',
  },
  finalMission: {
    title: 'The final mission',
    text: 'The final mission brings together everything you learned: classification, training data, vision, language, regression, clustering, and workflow. Solve each system challenge and get ready for the final boss battle.',
  },
};

const aiItems = [
  { id: 'siri', icon: '🎙️', name: 'Siri', kind: 'ai', hint: 'Siri learns speech patterns from millions of voice examples.' },
  { id: 'chess', icon: '♟️', name: 'Chess Robot', kind: 'ai', hint: 'A strong chess robot improves by searching and learning from games.' },
  { id: 'calculator', icon: '🔢', name: 'Calculator', kind: 'rules', hint: 'A calculator follows exact arithmetic rules. It does not learn from examples.' },
  { id: 'spam', icon: '📧', name: 'Spam Filter', kind: 'ai', hint: 'Spam filters learn from labelled emails and sender patterns.' },
  { id: 'thermostat', icon: '🌡️', name: 'Thermostat', kind: 'rules', hint: 'A simple thermostat follows a fixed temperature rule.' },
  { id: 'translator', icon: '🌐', name: 'Translator', kind: 'ai', hint: 'Translators learn from huge collections of paired sentences.' },
  { id: 'car', icon: '🚗', name: 'Self-driving car', kind: 'ai', hint: 'Self-driving cars learn from sensor, camera, and road data.' },
  { id: 'alarm', icon: '⏰', name: 'Alarm Clock', kind: 'rules', hint: 'An alarm clock follows the time you set.' },
  { id: 'music', icon: '🎵', name: 'Music Recommender', kind: 'ai', hint: 'Music recommenders learn from listening history and similar users.' },
] as const;

const factoryItems = [
  { icon: '🍎', name: 'Apple', desc: 'Sweet, grows on trees, has seeds.', bin: 'Fruit' },
  { icon: '🐕', name: 'Dog', desc: 'Four legs, barks, has fur.', bin: 'Animal' },
  { icon: '🚌', name: 'Bus', desc: 'Carries people on roads.', bin: 'Vehicle' },
  { icon: '🍇', name: 'Grapes', desc: 'Small juicy fruits in bunches.', bin: 'Fruit' },
  { icon: '🐦', name: 'Parrot', desc: 'Feathers, wings, can fly.', bin: 'Animal' },
  { icon: '🚗', name: 'Car', desc: 'Four wheels and an engine.', bin: 'Vehicle' },
  { icon: '🍌', name: 'Banana', desc: 'Yellow fruit with a peel.', bin: 'Fruit' },
  { icon: '🐈', name: 'Cat', desc: 'Whiskers, paws, meows.', bin: 'Animal' },
  { icon: '🚕', name: 'Taxi', desc: 'A paid road vehicle.', bin: 'Vehicle' },
] as const;

const trainingRounds = [
  { icon: '🐶', label: 'Dog' },
  { icon: '🐱', label: 'Cat' },
  { icon: '🐦', label: 'Bird' },
  { icon: '🐶', label: 'Dog' },
  { icon: '🐱', label: 'Cat' },
  { icon: '🐦', label: 'Bird' },
] as const;

const sentimentMessages: { text: string; sentiment: Sentiment; hint: string }[] = [
  { text: 'I absolutely love this new phone! Best purchase ever.', sentiment: 'Positive', hint: 'Words like love and best show a happy opinion.' },
  { text: 'The train arrives at 3pm.', sentiment: 'Neutral', hint: 'This is a fact. It does not show a feeling.' },
  { text: 'This movie was a complete waste of time.', sentiment: 'Negative', hint: 'Waste of time signals disappointment.' },
  { text: 'The weather today is partly cloudy.', sentiment: 'Neutral', hint: 'Weather facts are usually neutral.' },
  { text: 'Captain Nova saved NeoCity and it was incredible!', sentiment: 'Positive', hint: 'Incredible is a strong positive word.' },
  { text: "The system crashed again. I'm so frustrated.", sentiment: 'Negative', hint: 'Frustrated is a negative emotion.' },
];

const workflowSteps = [
  '🎯 Define the Problem',
  '📥 Collect Data',
  '🧹 Clean & Prepare Data',
  '🏋️ Train the Model',
  '🧪 Test & Evaluate',
] as const;

const cardStyle: CSSProperties = {
  borderRadius: 28,
  border: '1px solid rgba(255,255,255,0.08)',
  backdropFilter: 'blur(16px)',
  background: 'rgba(16, 28, 46, 0.95)',
  padding: 24,
  boxShadow: '0 24px 70px rgba(0,0,0,0.35)',
};

const primaryBtn: CSSProperties = {
  borderRadius: 16,
  padding: '14px 28px',
  background: 'linear-gradient(135deg, #4b9bff, #8bdcb8)',
  color: '#03151e',
  fontWeight: 800,
  minHeight: 48,
  minWidth: 48,
  border: 0,
  cursor: 'pointer',
};

const ghostBtn: CSSProperties = {
  borderRadius: 16,
  padding: '13px 18px',
  background: 'rgba(255,255,255,0.075)',
  color: '#f7fbff',
  border: '1px solid rgba(255,255,255,0.1)',
  minHeight: 48,
  minWidth: 48,
  cursor: 'pointer',
};

const novaGateStyle: CSSProperties = {
  minHeight: 'calc(100vh - 104px)',
  display: 'grid',
  placeItems: 'center',
  textAlign: 'center',
};

const typingSoundUrl = new URL('../soundreality-keyboard-typing-sfx-525007.mp3', import.meta.url).href;

const novaBubbleStyle: CSSProperties = {
  ...cardStyle,
  width: 'min(900px, 90vw)',
  maxWidth: 900,
  textAlign: 'left',
  border: '1px solid rgba(75,255,165,0.24)',
  paddingLeft: 32,
  paddingRight: 24,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
};

const novaNameStyle: CSSProperties = {
  display: 'block',
  color: '#4bffa5',
  fontWeight: 900,
  marginBottom: 10,
};

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function playSound(type: SoundType) {
  try {
    const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextCtor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const configs = {
      click: { freq: 880, type: 'sine', duration: 0.08, vol: 0.15 },
      drop: { freq: 523, type: 'sine', duration: 0.18, vol: 0.2 },
      success: { freq: 659, type: 'triangle', duration: 0.35, vol: 0.25 },
      error: { freq: 220, type: 'sawtooth', duration: 0.2, vol: 0.15 },
      power: { freq: 440, type: 'square', duration: 0.12, vol: 0.1 },
    } as const;
    const c = configs[type];
    osc.type = c.type;
    osc.frequency.setValueAtTime(c.freq, ctx.currentTime);
    gain.gain.setValueAtTime(c.vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + c.duration);
    osc.start();
    osc.stop(ctx.currentTime + c.duration);
  } catch {
    // Audio is optional. Some browsers block it until a user gesture.
  }
}

function useCountUp(value: number) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const start = display;
    const diff = value - start;
    if (diff === 0) return;
    let frame = 0;
    const total = 22;
    const id = window.setInterval(() => {
      frame += 1;
      const eased = 1 - Math.pow(1 - frame / total, 3);
      setDisplay(Math.round(start + diff * eased));
      if (frame >= total) window.clearInterval(id);
    }, 18);
    return () => window.clearInterval(id);
  }, [value]);

  return display;
}

function GlobalStyles() {
  return (
    <style>{`
      * { box-sizing: border-box; }
      html, body, #root { min-height: 100%; margin: 0; }
      body {
        background:
          radial-gradient(circle at 18% 12%, rgba(75,155,255,.25), transparent 28%),
          radial-gradient(circle at 86% 75%, rgba(75,255,165,.14), transparent 26%),
          linear-gradient(135deg, #07101e 0%, #0b172d 54%, #08101f 100%);
        color: #f7fbff;
        font-family: "Trebuchet MS", "Avenir Next", Verdana, sans-serif;
      }
      button, input { font: inherit; }
      button { transition: transform .18s ease, filter .18s ease, border-color .18s ease; }
      button:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.08); }
      button:disabled { cursor: default; opacity: .55; }
      .app { min-height: 100vh; display: grid; grid-template-columns: 292px 1fr; }
      .sidebar {
        position: sticky; top: 0; height: 100vh; overflow: auto; padding: 22px 18px;
        border-right: 1px solid rgba(255,255,255,.09);
        background: rgba(7,16,31,.88); backdrop-filter: blur(18px); z-index: 5;
      }
      .brand { display:flex; gap:12px; align-items:center; margin-bottom:22px; }
      .brandMark {
        width:52px; height:52px; border-radius:18px; display:grid; place-items:center;
        background: conic-gradient(from 180deg, #4bffa5, #4b9bff, #b989ff, #4bffa5);
        box-shadow: 0 0 36px rgba(75,155,255,.34); color:#06111f; font-size:1.6rem;
      }
      .content { min-width:0; padding:28px; }
      .stage {
        min-height: calc(100vh - 56px); position:relative; overflow:hidden;
        border: 1px solid rgba(255,255,255,.08); border-radius:30px; padding:26px;
        background:
          linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px),
          rgba(7,16,31,.52);
        background-size:44px 44px;
        box-shadow: inset 0 0 110px rgba(75,155,255,.09);
      }
      .grid { display:grid; gap:16px; }
      .cols2 { grid-template-columns: repeat(2, minmax(0,1fr)); }
      .cols3 { grid-template-columns: repeat(3, minmax(0,1fr)); }
      .cols4 { grid-template-columns: repeat(4, minmax(0,1fr)); }
      .sectionHead { display:flex; justify-content:space-between; gap:18px; align-items:flex-start; margin-bottom:20px; }
      .kicker { color:#4bffa5; text-transform:uppercase; letter-spacing:.12em; font-size:.76rem; font-weight:900; }
      h1, h2, h3 { letter-spacing:0; }
      h2 { margin:5px 0 0; font-size:clamp(1.8rem,3vw,3.1rem); line-height:1.03; }
      .sub { color:#b6c7dc; line-height:1.55; }
      .small { color:#b6c7dc; font-size:.92rem; line-height:1.45; }
      .tile {
        min-height:104px; min-width:48px; border-radius:22px; border:1px solid rgba(255,255,255,.1);
        color:#f7fbff; background:linear-gradient(145deg, rgba(255,255,255,.11), rgba(255,255,255,.035));
        display:grid; place-items:center; text-align:center; padding:14px; cursor:pointer;
      }
      .tile.selected { border-color:rgba(75,255,165,.7); background:rgba(75,155,255,.16); }
      .emoji { display:block; font-size:2.45rem; margin-bottom:8px; }
      .bar { height:12px; border-radius:99px; background:rgba(255,255,255,.09); overflow:hidden; }
      .bar span { display:block; height:100%; width:0%; border-radius:inherit; background:linear-gradient(90deg,#4b9bff,#4bffa5); transition:width .45s ease; }
      .banner {
        display:inline-flex; align-items:center; gap:10px; padding:12px 18px; border-radius:16px;
        background:rgba(94,252,130,.15); border:1px solid rgba(94,252,130,.42);
        color:#4bffa5; font-weight:900; animation: slideUp .4s ease both, readyPulse 1.4s ease infinite;
      }
      .hint { min-height:28px; color:#ffd76a; margin-top:12px; font-weight:800; }
      .map { display:grid; gap:8px; margin-top:12px; }
      .map button {
        width:100%; display:grid; grid-template-columns:24px 1fr auto; gap:8px; align-items:center;
        padding:10px 12px; border-radius:16px; background:rgba(255,255,255,.045);
        border:1px solid transparent; color:#b6c7dc; text-align:left; min-height:48px; cursor:pointer;
      }
      .map button.current { border-color:rgba(75,155,255,.55); color:#f7fbff; background:rgba(75,155,255,.12); }
      .map button.done { color:#4bffa5; }
      .map button.locked { opacity:.42; cursor:default; }
      .conveyor {
        min-height:190px; display:grid; place-items:center; border-radius:24px;
        border:1px dashed rgba(255,255,255,.16);
        background:repeating-linear-gradient(90deg, rgba(255,255,255,.035) 0 20px, transparent 20px 42px);
        overflow:hidden;
      }
      .itemCard { width:min(360px, 100%); animation:slideInLeft .45s ease both; }
      .count {
        position:absolute; top:12px; right:12px; width:34px; height:34px; border-radius:50%;
        background:#4b9bff; color:#06111f; display:grid; place-items:center; font-weight:900;
      }
      .camera {
        position:relative; min-height:430px; overflow:hidden;
        background:radial-gradient(circle at 50% 50%, rgba(75,155,255,.08), transparent 38%),
          repeating-linear-gradient(45deg, rgba(255,255,255,.02) 0 2px, transparent 2px 5px), #07101f;
      }
      .scanLine { position:absolute; left:0; right:0; top:0; height:3px; background:#4bffa5; box-shadow:0 0 24px #4bffa5; animation:scanLine 2s linear infinite; }
      .object {
        position:absolute; width:86px; height:86px; border-radius:22px; background:rgba(255,255,255,.05);
        border:1px solid rgba(255,255,255,.09); display:grid; place-items:center; font-size:2.6rem;
      }
      .boxLock { position:absolute; inset:-4px; border:3px solid #4bffa5; border-radius:24px; animation:drawBorder .4s ease both; pointer-events:none; }
      .tag {
        position:absolute; top:-27px; left:0; white-space:nowrap; font-size:.72rem;
        background:#4bffa5; color:#04151f; padding:5px 8px; border-radius:8px; font-weight:900;
      }
      .chatBubble {
        max-width:760px; padding:18px 20px; border-radius:24px 24px 24px 8px;
        background:rgba(75,155,255,.14); border:1px solid rgba(75,155,255,.22); line-height:1.55;
      }
      .svgBox { width:100%; max-width:460px; height:auto; border-radius:22px; background:rgba(255,255,255,.045); border:1px solid rgba(255,255,255,.08); }
      input[type="range"] { width:100%; accent-color:#4bffa5; min-height:48px; }
      .shake { animation:shake .42s ease; }
      .celebrate { animation:celebrate .45s ease; }
      .timer span { animation:timerRun 15s linear forwards; }
      .confetti {
        position:fixed; top:-20px; width:10px; height:16px; z-index:50;
        animation:confettiFall 4s linear forwards; pointer-events:none;
      }
      @keyframes float { from { transform: translateY(0); } to { transform: translateY(-20px); } }
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
      @keyframes timerRun { from { width:100%; } to { width:0%; } }
      @media (max-width: 920px) {
        .app { grid-template-columns:1fr; }
        .sidebar { position:relative; height:auto; }
        .content { padding:14px; }
        .stage { min-height:70vh; padding:18px; border-radius:24px; }
        .cols2, .cols3, .cols4 { grid-template-columns:1fr; }
        .sectionHead { display:block; }
      }
    `}</style>
  );
}

function NovaGate({
  lines,
  onDone,
  askName,
  onNameSubmit,
  detail,
}: {
  lines: string[];
  onDone?: () => void;
  askName?: boolean;
  onNameSubmit?: (name: string) => void;
  detail?: { title: string; text: string };
}) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);
  const [name, setName] = useState('');
  const [lineKey, setLineKey] = useState(() => lines.join('\n'));
  const [showDetail, setShowDetail] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const newKey = lines.join('\n');
    if (newKey !== lineKey) {
      setLineKey(newKey);
      setIdx(0);
      setText('');
      setDone(false);
      setShowDetail(false);
      if (!askName) setName('');
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [lines, askName, lineKey]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(typingSoundUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.22;
    }
    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;
    void audio.play().catch(() => {});
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [lineKey]);

  useEffect(() => {
    if (done && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [done]);

  useEffect(() => {
    if (idx >= lines.length) {
      setDone(true);
      return;
    }
    let i = 0;
    setText('');
    const currentLine = lines[idx] || '';
    const t = window.setInterval(() => {
      if (i >= currentLine.length) {
        window.clearInterval(t);
        window.setTimeout(() => setIdx((p) => p + 1), 700);
        return;
      }
      setText(currentLine.slice(0, i + 1));
      i += 1;
    }, 75);
    return () => window.clearInterval(t);
  }, [idx, lineKey, lines]);

  return (
    <div style={novaGateStyle}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 18 }}>
        <div style={{ fontSize: '3.5rem', animation: 'float 3s ease-in-out infinite alternate' }}>🚀</div>
        <div style={novaBubbleStyle}>
          <span style={novaNameStyle}>Captain Nova</span>
          <p style={{ margin: 0, color: '#d8eeff', fontSize: '1.05rem', lineHeight: 1.7, minHeight: '5rem' }}>
            {text}
            <span style={{ animation: 'blink 0.9s step-end infinite', color: '#4bffa5' }}>▌</span>
          </p>
          {showDetail && detail && (
            <div style={{ marginTop: 18, color: '#c7d8f0', fontSize: '0.98rem', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
              <strong>{detail.title}</strong>
              <p style={{ margin: '12px 0 0' }}>{detail.text}</p>
            </div>
          )}
          {askName && done && (
            <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                style={{ width: '100%', minHeight: 48, borderRadius: 16, border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.08)', color: '#f7fbff', padding: '0 14px' }}
              />
              <button
                style={primaryBtn}
                onClick={() => {
                  if (!name.trim()) return;
                  onNameSubmit?.(name.trim());
                }}
                disabled={!name.trim()}
              >
                Continue
              </button>
            </div>
          )}
        </div>
        {!askName && done && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {detail && !showDetail && (
              <button
                style={{ ...ghostBtn, minWidth: 'auto', padding: '13px 22px' }}
                onClick={() => setShowDetail(true)}
              >
                Read in detail about the concept
              </button>
            )}
            {onDone && (
              <button style={primaryBtn} onClick={onDone}>
                {showDetail ? 'Continue' : "Let's Go →"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ section, note }: { section: MissionKey; note: string }) {
  return (
    <div className="sectionHead">
      <div>
        <div className="kicker">Mission {missionKeys.indexOf(section) + 1}</div>
        <h2>{sectionTitles[section]}</h2>
        <p className="sub" style={{ maxWidth: 760, marginTop: 8 }}>{note}</p>
      </div>
      <div className="banner">NeoCity Link Active</div>
    </div>
  );
}

function ProgressBar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="bar">
      <span style={{ width: `${clamp(value)}%`, background: color }} />
    </div>
  );
}

function StatCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ ...cardStyle, padding: 16, marginBottom: 14, borderRadius: 24 }}>
      <div className="kicker" style={{ color: '#b6c7dc', fontSize: '.72rem' }}>{label}</div>
      {children}
    </div>
  );
}

function Sidebar({
  xp,
  completed,
  currentSection,
  onNavigate,
}: {
  xp: number;
  completed: MissionKey[];
  currentSection: SectionKey;
  onNavigate: (section: SectionKey) => void;
}) {
  const shownXp = useCountUp(xp);
  const doneCount = completed.length;
  const progress = (doneCount / missionKeys.length) * 100;
  const badge = doneCount >= 10 ? 'Core Hero' : doneCount >= 6 ? 'Model Maker' : doneCount >= 3 ? 'Data Ranger' : 'Junior Explorer';

  function unlocked(section: SectionKey) {
    if (section === 'landing') return true;
    const index = sectionOrder.indexOf(section);
    const prev = sectionOrder[index - 1];
    return prev === 'landing' || completed.includes(prev as MissionKey) || completed.includes(section as MissionKey);
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brandMark">⚡</div>
        <div>
          <h1 style={{ fontSize: '1.05rem', margin: 0 }}>NeoCity AI Adventure</h1>
          <p className="small" style={{ margin: '3px 0 0' }}>CBSE Class 7 Mission Deck</p>
        </div>
      </div>
      <StatCard label="XP">
        <div style={{ fontSize: '2.3rem', fontWeight: 900, color: '#4bffa5', marginTop: 8 }}>{shownXp}</div>
      </StatCard>
      <StatCard label="City Power">
        <div style={{ marginTop: 10 }}><ProgressBar value={progress} /></div>
        <p className="small">{Math.round(progress)}% restored</p>
      </StatCard>
      <StatCard label="Badge">
        <h3 style={{ margin: '8px 0 0' }}>{badge}</h3>
      </StatCard>
      <StatCard label="Mission Map">
        <div className="map">
          {sectionOrder.map((section, index) => {
            const isDone = section !== 'landing' && completed.includes(section as MissionKey);
            const isUnlocked = unlocked(section);
            return (
              <button
                key={section}
                className={`${currentSection === section ? 'current' : ''} ${isDone ? 'done' : ''} ${!isUnlocked ? 'locked' : ''}`}
                disabled={!isUnlocked}
                onClick={() => onNavigate(section)}
              >
                <span>{isDone ? '✓' : isUnlocked ? '●' : '🔒'}</span>
                <span>{sectionTitles[section]}</span>
                <small>{index || ''}</small>
              </button>
            );
          })}
        </div>
      </StatCard>
    </aside>
  );
}

function LandingScreen({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ minHeight: 'calc(100vh - 108px)', display: 'grid', alignContent: 'center', gap: 22, maxWidth: 980 }}>
      <div className="kicker">Captain Nova Transmission</div>
      <h2 style={{ fontSize: 'clamp(3.2rem, 8vw, 6.6rem)', margin: 0 }}>Restore the broken AI city.</h2>
      <p className="sub" style={{ fontSize: '1.15rem', maxWidth: 820 }}>
        NeoCity's smart systems are offline. Travel district by district, train models, detect patterns, decode language, and bring the AI Core back to life.
      </p>
      <div>
        <button style={primaryBtn} onClick={onStart}>Start Mission</button>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {['🧠 Classify', '👁️ Detect', '💬 Read language', '📈 Predict', '🧩 Cluster'].map((tag) => (
          <span key={tag} className="banner" style={{ animation: 'slideUp .4s ease both' }}>{tag}</span>
        ))}
      </div>
    </div>
  );
}

function WhatIsAISection({ onComplete, onNameCaptured }: { onComplete: CompleteHandler, onNameCaptured: (name: string) => void }) {
  const playerName = useContext(PlayerContext);
  const [gateOpen, setGateOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [labelled, setLabelled] = useState<Record<string, true>>({});
  const [confidence, setConfidence] = useState(20);
  const [hint, setHint] = useState('');
  const [shakeId, setShakeId] = useState('');

  if (!playerName) {
    return <NovaGate lines={["Greetings, explorer. I am Captain Nova.", "NeoCity needs your help.", "What should I call you?"]} askName onNameSubmit={onNameCaptured} />;
  }

  if (!gateOpen) {
    return <NovaGate lines={[`Alright, ${playerName}.`, "NeoCity's recommendation engines are confused.", 'Label tools as AI or fixed rules so the city classifier can learn.']} onDone={() => setGateOpen(true)} />;
  }

  const remaining = aiItems.filter((item) => !labelled[item.id]);
  const trained = Object.keys(labelled).length === aiItems.length;

  function label(kind: 'ai' | 'rules') {
    if (!selected) {
      setHint('Select a card first.');
      return;
    }
    const item = aiItems.find((entry) => entry.id === selected);
    if (!item) return;
    if (item.kind === kind) {
      playSound('drop');
      setLabelled((prev) => ({ ...prev, [item.id]: true }));
      setSelected(null);
      setHint('');
      setConfidence(Object.keys(labelled).length + 1 === aiItems.length ? 100 : clamp(confidence + 10));
    } else {
      playSound('error');
      setShakeId(item.id);
      setHint(item.hint);
      setConfidence((prev) => clamp(prev - 5));
      window.setTimeout(() => setShakeId(''), 450);
    }
  }

  return (
    <>
      <SectionHeader section="whatIsAI" note="Tap an item, then choose whether it learns from data or follows fixed rules." />
      <div className="grid cols3">
        {remaining.map((item) => (
          <button
            key={item.id}
            className={`tile ${selected === item.id ? 'selected' : ''} ${shakeId === item.id ? 'shake' : ''}`}
            onClick={() => {
              setSelected(item.id);
              playSound('click');
            }}
          >
            <span className="emoji">{item.icon}</span>
            <b>{item.name}</b>
          </button>
        ))}
      </div>
      <div className="grid cols2" style={{ marginTop: 18 }}>
        <button className={`tile ${trained ? 'celebrate' : ''}`} style={{ borderColor: 'rgba(94,252,130,.35)' }} onClick={() => label('ai')}>
          <span className="emoji">🧠</span><b>Learns from data</b><span className="small">AI</span>
        </button>
        <button className={`tile ${trained ? 'celebrate' : ''}`} style={{ borderColor: 'rgba(75,155,255,.35)' }} onClick={() => label('rules')}>
          <span className="emoji">⚙️</span><b>Follows fixed rules</b><span className="small">Not AI</span>
        </button>
      </div>
      <div style={{ ...cardStyle, marginTop: 18 }}>
        <b>AI model confidence: {confidence}%</b>
        <div style={{ marginTop: 10 }}><ProgressBar value={confidence} /></div>
        {trained ? (
          <>
            <p className="banner" style={{ marginTop: 16 }}>🤖 AI TRAINED!</p>
            <p className="small">You just trained an AI classifier. That's exactly how YouTube learns to recommend videos.</p>
            <button style={primaryBtn} onClick={onComplete}>Power Next District</button>
          </>
        ) : <p className="hint">{hint}</p>}
      </div>
    </>
  );
}

function ClassificationSection({ onComplete }: { onComplete: CompleteHandler }) {
  const [gateOpen, setGateOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [counts, setCounts] = useState<Record<'Fruit' | 'Animal' | 'Vehicle', number>>({ Fruit: 0, Animal: 0, Vehicle: 0 });
  const [hint, setHint] = useState('');
  const [wrongBin, setWrongBin] = useState('');

  if (!gateOpen) {
    return <NovaGate lines={['The factory conveyor is moving again.', 'Classify each object by its features and the bins will teach the model.']} detail={sectionDetails.classification} onDone={() => setGateOpen(true)} />;
  }

  const done = index >= factoryItems.length;
  const current = factoryItems[index];

  function choose(bin: 'Fruit' | 'Animal' | 'Vehicle') {
    if (!current) return;
    if (current.bin === bin) {
      playSound('drop');
      setCounts((prev) => ({ ...prev, [bin]: prev[bin] + 1 }));
      setIndex((prev) => prev + 1);
      setHint('');
    } else {
      playSound('error');
      setWrongBin(bin);
      setHint('Look at its features. What category fits best?');
      window.setTimeout(() => setWrongBin(''), 450);
    }
  }

  return (
    <>
      <SectionHeader section="classification" note="Sort one item at a time and watch the class counts update." />
      <div className="conveyor">
        {done ? <div className="banner">Factory bins open!</div> : (
          <div style={cardStyle} className="itemCard">
            <span className="emoji">{current.icon}</span>
            <h3>{current.name}</h3>
            <p className="small">{current.desc}</p>
          </div>
        )}
      </div>
      <div className="grid cols3" style={{ marginTop: 18 }}>
        {(['Fruit', 'Animal', 'Vehicle'] as const).map((bin) => (
          <button key={bin} className={`tile ${wrongBin === bin ? 'shake' : ''}`} style={{ position: 'relative' }} onClick={() => choose(bin)} disabled={done}>
            <span className="count">{counts[bin]}</span>
            <span className="emoji">{bin === 'Fruit' ? '🍎' : bin === 'Animal' ? '🐾' : '🚗'}</span>
            <b>{bin}</b>
          </button>
        ))}
      </div>
      <div style={{ ...cardStyle, marginTop: 18 }}>
        {done ? (
          <>
            <BarChart counts={counts} />
            <p className="small">The AI learned your sorting rule. It can now classify new items it's never seen.</p>
            <button style={primaryBtn} onClick={onComplete}>Power Next District</button>
          </>
        ) : <p className="hint">{hint}</p>}
      </div>
    </>
  );
}

function BarChart({ counts }: { counts: Record<string, number> }) {
  const max = Math.max(...Object.values(counts), 1);
  return (
    <svg className="svgBox" viewBox="0 0 360 190" role="img" aria-label="Category counts">
      {Object.entries(counts).map(([key, value], index) => {
        const height = (value / max) * 110;
        const fill = index === 0 ? '#5efc82' : index === 1 ? '#4b9bff' : '#ffd76a';
        return (
          <g key={key}>
            <rect x={55 + index * 100} y={145 - height} width="54" height={height} rx="8" fill={fill} />
            <text x={82 + index * 100} y="168" textAnchor="middle" fill="#f7fbff">{key}</text>
            <text x={82 + index * 100} y={135 - height} textAnchor="middle" fill="#f7fbff">{value}</text>
          </g>
        );
      })}
    </svg>
  );
}

function TrainingDataSection({ onComplete }: { onComplete: CompleteHandler }) {
  const [gateOpen, setGateOpen] = useState(false);
  const [round, setRound] = useState(0);
  const [points, setPoints] = useState<{ label: string }[]>([]);
  const [hint, setHint] = useState('');
  const [learning, setLearning] = useState(false);

  if (!gateOpen) {
    return <NovaGate lines={['The image model is empty.', 'Become the trainer: label examples and watch confidence grow.']} detail={sectionDetails.trainingData} onDone={() => setGateOpen(true)} />;
  }

  const done = round >= trainingRounds.length;
  const current = trainingRounds[Math.min(round, trainingRounds.length - 1)];
  const confidence = done ? 95 : points.length >= 3 ? 81 + points.length * 2 : points.length * 15;

  function label(choice: string) {
    if (choice === current.label) {
      playSound('click');
      setLearning(true);
      setPoints((prev) => [...prev, { label: choice }]);
      setHint('AI is learning from your label.');
      window.setTimeout(() => {
        setRound((prev) => prev + 1);
        setLearning(false);
      }, points.length >= 2 ? 700 : 250);
    } else {
      playSound('error');
      setHint('Match the animal in the camera frame before adding it to training data.');
    }
  }

  return (
    <>
      <SectionHeader section="trainingData" note="Label camera examples to create training data." />
      <div className="grid cols2">
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <div className="small">Camera frame</div>
          <div style={{ fontSize: '7rem', filter: 'drop-shadow(0 0 24px rgba(75,155,255,.45))' }}>{done ? '✅' : current.icon}</div>
          <div className="grid cols3">
            {['Dog', 'Cat', 'Bird'].map((labelName) => (
              <button key={labelName} style={ghostBtn} onClick={() => label(labelName)} disabled={done}>
                {labelName === 'Dog' ? '🐶' : labelName === 'Cat' ? '🐱' : '🐦'} {labelName}
              </button>
            ))}
          </div>
          <p className="hint">{hint}</p>
        </div>
        <div style={cardStyle}>
          <h3>Training Chart</h3>
          <TrainingChart points={points} />
          {learning && <p className="banner" style={{ marginTop: 12 }}>AI is learning...</p>}
          <div style={{ marginTop: 16 }}><ProgressBar value={confidence} /></div>
          <p><b>{done ? 'TRAINING COMPLETE ✅' : points.length >= 3 ? `AI says: ${current.icon} ${current.label} - ${confidence}% confident` : 'Add 3 labels to wake the model.'}</b></p>
          {done && (
            <>
              <p className="small">This is exactly how Google's image recognition was trained: by humans labelling millions of images.</p>
              <button style={primaryBtn} onClick={onComplete}>Power Next District</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function TrainingChart({ points }: { points: { label: string }[] }) {
  const color: Record<string, string> = { Dog: '#5efc82', Cat: '#4b9bff', Bird: '#ffd76a' };
  return (
    <svg className="svgBox" viewBox="0 0 360 220">
      {[0, 1, 2, 3].map((i) => <line key={i} x1="30" x2="330" y1={40 + i * 40} y2={40 + i * 40} stroke="rgba(255,255,255,.08)" />)}
      {points.map((point, index) => (
        <circle
          key={`${point.label}-${index}`}
          cx={60 + index * 45}
          cy={70 + (point.label === 'Dog' ? 0 : point.label === 'Cat' ? 45 : 90) + (index % 2) * 12}
          r="10"
          fill={color[point.label]}
        >
          <animate attributeName="r" from="0" to="10" dur=".25s" />
        </circle>
      ))}
    </svg>
  );
}

function ComputerVisionSection({ onComplete }: { onComplete: CompleteHandler }) {
  const [gateOpen, setGateOpen] = useState(false);
  const [found, setFound] = useState<string[]>([]);
  const [hint, setHint] = useState('');
  const [flash, setFlash] = useState('');

  if (!gateOpen) {
    return <NovaGate lines={['The vision grid is scanning the city.', 'Detect living things only so NeoCity can protect parks and pedestrians.']} detail={sectionDetails.computerVision} onDone={() => setGateOpen(true)} />;
  }

  const objects = [
    { id: 'panda', icon: '🐼', x: 8, y: 15, living: true, label: 'Animal' },
    { id: 'car', icon: '🚗', x: 43, y: 42, living: false, label: 'car' },
    { id: 'bird', icon: '🐦', x: 76, y: 18, living: true, label: 'Animal' },
    { id: 'tree', icon: '🌳', x: 16, y: 70, living: true, label: 'Plant' },
    { id: 'light', icon: '🚦', x: 70, y: 57, living: false, label: 'traffic light' },
    { id: 'house', icon: '🏠', x: 82, y: 76, living: false, label: 'house' },
  ];
  const done = found.length === 3;

  function detect(item: typeof objects[number]) {
    if (item.living) {
      if (!found.includes(item.id)) {
        playSound('success');
        setFound((prev) => [...prev, item.id]);
        setHint('');
      }
    } else {
      playSound('error');
      setFlash(item.id);
      setHint(`A ${item.label} isn't alive, so the AI would not flag it as a living creature.`);
      window.setTimeout(() => setFlash(''), 500);
    }
  }

  return (
    <>
      <SectionHeader section="computerVision" note="The AI camera needs to detect every living thing. Tap them." />
      <div style={cardStyle} className="camera">
        <div className="scanLine" style={done ? { background: '#5efc82', boxShadow: '0 0 32px #5efc82' } : undefined} />
        {objects.map((item) => (
          <button
            key={item.id}
            className={`object ${flash === item.id ? 'shake' : ''}`}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            onClick={() => detect(item)}
          >
            {flash === item.id ? '❌' : item.icon}
            {found.includes(item.id) && <span className="boxLock"><span className="tag">DETECTED: {item.label} 🐾</span></span>}
          </button>
        ))}
      </div>
      <div style={{ ...cardStyle, marginTop: 18 }}>
        {done ? (
          <>
            <div className="banner">VISION LOCK ✅</div>
            <p className="small">Computer vision is how self-driving cars detect pedestrians, and how Instagram detects faces in your photos.</p>
            <button style={primaryBtn} onClick={onComplete}>Power Next District</button>
          </>
        ) : <p className="hint">{hint}</p>}
      </div>
    </>
  );
}

function NLPSection({ onComplete }: { onComplete: CompleteHandler }) {
  const [gateOpen, setGateOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [confidence, setConfidence] = useState(40);
  const [hint, setHint] = useState('');
  const [demo, setDemo] = useState('');
  const [shake, setShake] = useState(false);

  if (!gateOpen) {
    return <NovaGate lines={['Language Harbor is full of scrambled messages.', 'Tag the feeling in each sentence and train the NLP beacon.']} detail={sectionDetails.nlp} onDone={() => setGateOpen(true)} />;
  }

  const done = index >= sentimentMessages.length;
  const current = sentimentMessages[index];

  function choose(sentiment: Sentiment) {
    if (!current) return;
    if (sentiment === current.sentiment) {
      playSound('click');
      setConfidence(index + 1 === sentimentMessages.length ? 100 : confidence + 10);
      setHint('');
      window.setTimeout(() => setIndex((prev) => prev + 1), 400);
    } else {
      playSound('error');
      setShake(true);
      setHint(current.hint);
      window.setTimeout(() => setShake(false), 450);
    }
  }

  return (
    <>
      <SectionHeader section="nlp" note="Classify sentiment and then try the live NLP simulator." />
      <div style={cardStyle}>
        <b>NLP Confidence: {done ? 100 : confidence}%</b>
        <div style={{ marginTop: 10 }}><ProgressBar value={done ? 100 : confidence} /></div>
      </div>
      <div style={{ ...cardStyle, marginTop: 18, minHeight: 220, display: 'grid', alignContent: 'center', gap: 14 }}>
        {done ? (
          <>
            <h3>NLP in action</h3>
            <input
              value={demo}
              onChange={(event) => setDemo(event.target.value)}
              placeholder="Type any sentence..."
              style={{ minHeight: 52, borderRadius: 16, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.08)', color: '#f7fbff', padding: '0 14px' }}
            />
            <p className="banner">AI says: {demoSentiment(demo)}</p>
            <p className="small">NLP is how Gmail filters spam, how Siri understands you, and how Google Translate works.</p>
            <button style={primaryBtn} onClick={onComplete}>Power Next District</button>
          </>
        ) : (
          <>
            <div className={`chatBubble ${shake ? 'shake' : ''}`}>{current.text}</div>
            <div className="grid cols3">
              {(['Positive', 'Neutral', 'Negative'] as const).map((sentiment) => (
                <button key={sentiment} style={ghostBtn} onClick={() => choose(sentiment)}>
                  {sentiment === 'Positive' ? '😊' : sentiment === 'Neutral' ? '😐' : '😠'} {sentiment}
                </button>
              ))}
            </div>
            <p className="hint">{hint}</p>
          </>
        )}
      </div>
    </>
  );
}

function demoSentiment(text: string) {
  const t = text.toLowerCase();
  if (!t.trim()) return 'Neutral 😐';
  if (/(love|best|great|happy|incredible|awesome|good|excellent)/.test(t)) return 'Positive 😊';
  if (/(hate|bad|terrible|waste|crashed|frustrated|angry|awful)/.test(t)) return 'Negative 😠';
  return 'Neutral 😐';
}

function RegressionSection({ onComplete }: { onComplete: CompleteHandler }) {
  const [gateOpen, setGateOpen] = useState(false);

  if (!gateOpen) {
    return (
      <NovaGate
        lines={['The Neural Prediction Terminal is online.', 'Add study and sleep samples to teach the AI the hidden relationship.']}
        detail={sectionDetails.regression}
        onDone={() => setGateOpen(true)}
      />
    );
  }

  return (
    <>
      <SectionHeader section="regression" note="Train the neural predictor by adding observations and watch the line learn." />
      <RegressionLab onComplete={onComplete} />
    </>
  );
}

function ClusteringSection({ onComplete }: { onComplete: CompleteHandler }) {
  const [gateOpen, setGateOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [assigned, setAssigned] = useState<Record<string, string>>({});
  const [hint, setHint] = useState('');
  const [checked, setChecked] = useState(false);

  if (!gateOpen) {
    return <NovaGate lines={['The forest map lost its natural groups.', 'Assign dots to camps by category, then check the clusters.']} detail={sectionDetails.clustering} onDone={() => setGateOpen(true)} />;
  }

  const dots = [
    { id: 'tri', icon: '🔺', x: 45, y: 40, group: 'Red' },
    { id: 'circle', icon: '🔵', x: 85, y: 66, group: 'Red' },
    { id: 'square', icon: '⬛', x: 58, y: 105, group: 'Red' },
    { id: 'cat', icon: '🐱', x: 210, y: 44, group: 'Green' },
    { id: 'dog', icon: '🐶', x: 250, y: 85, group: 'Green' },
    { id: 'fox', icon: '🦊', x: 218, y: 126, group: 'Green' },
    { id: 'rabbit', icon: '🐰', x: 260, y: 152, group: 'Green' },
    { id: 'frog', icon: '🐸', x: 230, y: 188, group: 'Green' },
    { id: 'butterfly', icon: '🦋', x: 194, y: 170, group: 'Green' },
    { id: 'box', icon: '📦', x: 90, y: 190, group: 'Blue' },
    { id: 'chair', icon: '🪑', x: 125, y: 155, group: 'Blue' },
    { id: 'bag', icon: '🎒', x: 63, y: 150, group: 'Blue' },
  ];
  const correct = dots.every((dot) => assigned[dot.id] === dot.group);

  function assign(camp: string) {
    if (!selected) {
      setHint('Tap a forest dot first.');
      return;
    }
    playSound('drop');
    setAssigned((prev) => ({ ...prev, [selected]: camp }));
    setSelected(null);
    setChecked(false);
    setHint('');
  }

  function check() {
    setChecked(true);
    if (correct) {
      playSound('success');
      setHint('');
    } else {
      playSound('error');
      setHint('Look at what the items have in common, not what they look like, but their category.');
    }
  }

  return (
    <>
      <SectionHeader section="clustering" note="Group similar items. Connecting lines appear as clusters form." />
      <div className="grid cols2">
        <div style={cardStyle}><ClusterSvg dots={dots} selected={selected} assigned={assigned} checked={checked} onSelect={setSelected} /></div>
        <div style={cardStyle}>
          <div className="grid">
            {(['Red', 'Green', 'Blue'] as const).map((camp) => (
              <button key={camp} className="tile" onClick={() => assign(camp)}>
                <b>{camp === 'Red' ? '🔴' : camp === 'Green' ? '🟢' : '🔵'} {camp} Camp</b>
                <span className="small">{Object.values(assigned).filter((value) => value === camp).length} assigned</span>
              </button>
            ))}
          </div>
          <p className="hint">{hint}</p>
          <button style={primaryBtn} onClick={check}>Check Clusters</button>
        </div>
      </div>
      {correct && checked && (
        <div style={{ ...cardStyle, marginTop: 18 }}>
          <div className="banner">CLUSTERS FOUND ✅</div>
          <p className="small">Clustering is how Spotify groups listeners with similar taste, and how scientists group stars by type without pre-labelling them.</p>
          <button style={primaryBtn} onClick={onComplete}>Power Next District</button>
        </div>
      )}
    </>
  );
}

function ClusterSvg({
  dots,
  selected,
  assigned,
  checked,
  onSelect,
}: {
  dots: { id: string; icon: string; x: number; y: number; group: string }[];
  selected: string | null;
  assigned: Record<string, string>;
  checked: boolean;
  onSelect: (id: string) => void;
}) {
  const colors: Record<string, string> = { Red: '#ff6464', Green: '#5efc82', Blue: '#4b9bff' };
  const lines: { a: typeof dots[number]; b: typeof dots[number]; color: string }[] = [];
  (['Red', 'Green', 'Blue'] as const).forEach((camp) => {
    const group = dots.filter((dot) => assigned[dot.id] === camp);
    if (group.length >= 3) {
      group.slice(1).forEach((dot) => lines.push({ a: group[0], b: dot, color: colors[camp] }));
    }
  });
  return (
    <svg className="svgBox" viewBox="0 0 320 240">
      {lines.map((line) => (
        <line key={`${line.a.id}-${line.b.id}`} x1={line.a.x} y1={line.a.y} x2={line.b.x} y2={line.b.y} stroke={line.color} strokeWidth="3" opacity=".72">
          <animate attributeName="opacity" from="0" to=".72" dur=".4s" />
        </line>
      ))}
      {dots.map((dot) => {
        const wrong = checked && assigned[dot.id] && assigned[dot.id] !== dot.group;
        return (
          <g key={dot.id} onClick={() => onSelect(dot.id)} style={{ cursor: 'pointer' }} className={wrong ? 'shake' : ''}>
            <circle cx={dot.x} cy={dot.y} r="22" fill={assigned[dot.id] ? colors[assigned[dot.id]] : 'rgba(255,255,255,.08)'} stroke={selected === dot.id ? '#ffd76a' : 'rgba(255,255,255,.18)'} strokeWidth="3" />
            <text x={dot.x} y={dot.y + 7} textAnchor="middle" fontSize="22">{dot.icon}</text>
          </g>
        );
      })}
    </svg>
  );
}

function DataTypesSection({ onComplete }: { onComplete: CompleteHandler }) {
  const [gateOpen, setGateOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [hint, setHint] = useState('');
  const [shake, setShake] = useState(false);

  if (!gateOpen) {
    return <NovaGate lines={['The Data Vault accepts four data signatures.', 'Solve each riddle to rotate a vault ring.']} detail={sectionDetails.dataTypes} onDone={() => setGateOpen(true)} />;
  }

  const riddles = [
    { text: 'A spreadsheet of student names, grades and attendance', answer: 'Structured', hint: 'Rows and columns mean structured data.' },
    { text: 'Thousands of Instagram photos', answer: 'Unstructured', hint: 'Photos are unstructured data.' },
    { text: 'Temperature sensor readings every 10 minutes for 6 months', answer: 'Time-Series', hint: 'Repeated readings over time form time-series data.' },
    { text: 'GPS locations of every delivery in the city', answer: 'Spatial', hint: 'GPS locations are spatial data.' },
  ];
  const done = index >= riddles.length;

  function answer(choice: string) {
    if (choice === riddles[index].answer) {
      playSound('drop');
      setIndex((prev) => prev + 1);
      setHint('');
    } else {
      playSound('error');
      setShake(true);
      setHint(riddles[index].hint);
      window.setTimeout(() => setShake(false), 450);
    }
  }

  return (
    <>
      <SectionHeader section="dataTypes" note="Crack the vault by identifying each data type." />
      <div className="grid cols2">
        <div style={cardStyle} className={shake ? 'shake' : ''}><VaultSvg openRings={index} done={done} /></div>
        <div style={cardStyle}>
          {done ? (
            <>
              <div className="banner">VAULT OPEN 🔓</div>
              <p className="small">AI systems need to know what kind of data they're working with before they can learn from it.</p>
              <button style={primaryBtn} onClick={onComplete}>Power Next District</button>
            </>
          ) : (
            <>
              <h3>{riddles[index].text}</h3>
              <div className="grid">
                {['Structured', 'Unstructured', 'Time-Series', 'Spatial'].map((choice) => <button key={choice} style={ghostBtn} onClick={() => answer(choice)}>{choice}</button>)}
              </div>
              <p className="hint">{hint}</p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function VaultSvg({ openRings, done }: { openRings: number; done: boolean }) {
  return (
    <svg className="svgBox" viewBox="0 0 260 260" style={{ display: 'block', margin: '0 auto' }}>
      {[100, 78, 56, 34].map((radius, index) => (
        <circle
          key={radius}
          cx="130"
          cy="130"
          r={radius}
          fill="none"
          stroke={index < openRings ? '#5efc82' : '#4b9bff'}
          strokeWidth="13"
          strokeDasharray="38 12"
          style={{ transformOrigin: '130px 130px', transform: `rotate(${index < openRings ? 90 : 0}deg)`, transition: '.4s' }}
        />
      ))}
      <circle cx="130" cy="130" r="28" fill={done ? '#ffd76a' : '#142542'} />
      {done && <circle cx="130" cy="130" r="42" fill="rgba(255,215,106,.2)" style={{ transformOrigin: '130px 130px', animation: 'radialPulse 1.4s ease infinite' }} />}
      <text x="130" y="138" textAnchor="middle" fontSize="24">{done ? '🔓' : '🔒'}</text>
    </svg>
  );
}

function AIWorkflowSection({ onComplete }: { onComplete: CompleteHandler }) {
  const [gateOpen, setGateOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null, null, null]);
  const [checked, setChecked] = useState(false);
  const [hint, setHint] = useState('');

  if (!gateOpen) {
    return <NovaGate lines={['The pipeline machine is out of order.', 'Place the steps in sequence so energy can flow.']} detail={sectionDetails.aiWorkflow} onDone={() => setGateOpen(true)} />;
  }

  const correct = slots.every((step, index) => step === workflowSteps[index]);
  const pool = [...workflowSteps].filter((step) => !slots.includes(step));

  function place(slot: number) {
    if (!selected) {
      setHint('Select a step card first.');
      return;
    }
    playSound('drop');
    setSlots((prev) => prev.map((value, index) => (index === slot ? selected : value)));
    setSelected(null);
    setChecked(false);
    setHint('');
  }

  function activate() {
    setChecked(true);
    const wrong = slots.filter((step, index) => step !== workflowSteps[index]).length;
    if (wrong === 0) {
      playSound('power');
      setHint('');
    } else {
      playSound('error');
      setHint(`${wrong} steps are wrong. Think about which comes first: you can't train without data.`);
    }
  }

  return (
    <>
      <SectionHeader section="aiWorkflow" note="Assemble the AI workflow in the correct order." />
      <div className="grid cols2">
        <div style={cardStyle}>
          <div className="grid">
            {slots.map((slot, index) => {
              const ok = slot === workflowSteps[index];
              const wrong = checked && slot && !ok;
              return (
                <button key={index} style={{ ...ghostBtn, display: 'grid', gridTemplateColumns: '42px 1fr', alignItems: 'center', textAlign: 'left', borderColor: ok ? 'rgba(94,252,130,.65)' : wrong ? 'rgba(255,100,100,.65)' : 'rgba(255,255,255,.1)' }} className={wrong ? 'shake' : ''} onClick={() => place(index)}>
                  <b>{index + 1}</b><span>{slot || 'Empty stage'}</span>
                </button>
              );
            })}
          </div>
          <button style={{ ...primaryBtn, marginTop: 16 }} onClick={activate}>Activate Machine</button>
          <p className="hint">{hint}</p>
        </div>
        <div style={cardStyle}>
          <div className="grid">
            {pool.map((step) => <button key={step} className={`tile ${selected === step ? 'selected' : ''}`} onClick={() => { setSelected(step); playSound('click'); }}>{step}</button>)}
          </div>
        </div>
      </div>
      {correct && checked && (
        <div style={{ ...cardStyle, marginTop: 18 }}>
          <div className="banner">MACHINE ONLINE ⚙️</div>
          <PipelineFlow />
          <p className="small">Every AI system ever built, from Alexa to self-driving cars, follows this exact pipeline.</p>
          <button style={primaryBtn} onClick={onComplete}>Power Final District</button>
        </div>
      )}
    </>
  );
}

function PipelineFlow() {
  return (
    <svg className="svgBox" viewBox="0 0 360 90" style={{ marginTop: 14 }}>
      <path d="M30 45 H330" stroke="#5efc82" strokeWidth="8" strokeLinecap="round" strokeDasharray="100" style={{ animation: 'flowDot 1.4s ease infinite' }} />
      {[45, 112, 180, 248, 315].map((x) => <circle key={x} cx={x} cy="45" r="12" fill="#4bffa5" />)}
    </svg>
  );
}

function FinalMissionSection({ onComplete, addBossXp }: { onComplete: CompleteHandler; addBossXp: () => void }) {
  const [gateOpen, setGateOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [bossStarted, setBossStarted] = useState(false);
  const [coreReady, setCoreReady] = useState(false);
  const [hint, setHint] = useState('');

  const bossQuestions: BossQuestion[] = [
    {
      prompt: 'What does classification do?',
      options: ['Predicts a number', 'Puts items into categories', 'Deletes data'],
      correct: 'Puts items into categories',
      explanation: 'Classification groups items by shared features so the AI can separate them into categories.',
    },
    {
      prompt: 'Which data helps a regression model predict a score?',
      options: ['Study hours and sleep', 'Movie genres', 'Color of a shirt'],
      correct: 'Study hours and sleep',
      explanation: 'Regression uses numeric input data, like hours and sleep, to estimate another number such as a score.',
    },
    {
      prompt: 'What does NLP analyze?',
      options: ['Language', 'Temperature', 'Road speed'],
      correct: 'Language',
      explanation: 'NLP is all about understanding text and speech, not physical measurements.',
    },
    {
      prompt: 'What does clustering discover?',
      options: ['Labels provided by humans', 'Natural groups in data', 'Numbers only'],
      correct: 'Natural groups in data',
      explanation: 'Clustering finds similar items without preassigned labels, grouping them by their patterns.',
    },
    {
      prompt: 'What is the final attack mode?',
      options: ['A small pulse', 'A massive beam', 'A defensive shield'],
      correct: 'A massive beam',
      explanation: 'The final attack becomes a huge beam that finishes the boss and ends the battle.',
    },
  ];

  useEffect(() => {
    if (step === 4 && !bossStarted) {
      const id = window.setTimeout(() => setCoreReady(true), 2000);
      return () => window.clearTimeout(id);
    }
  }, [step, bossStarted]);

  if (!gateOpen) {
    return <NovaGate lines={['Only the AI Core remains.', 'Stabilize the systems, then enter AETHERION’s final showdown.']} detail={sectionDetails.finalMission} onDone={() => setGateOpen(true)} />;
  }

  if (bossStarted) {
    return (
      <BossBattle
        questions={bossQuestions}
        onBossDamage={addBossXp}
        onVictory={onComplete}
      />
    );
  }

  const challenges = [
    { title: 'Classification', prompt: '🌧️ Weather sensor data', options: ['📊 Structured', '🌊 Unstructured', '⏱️ Time-Series'], answer: '⏱️ Time-Series' },
    { title: 'Prediction', prompt: 'Mon-Fri energy: 10, 12, 14, 16, ?', options: ['14', '18', '22'], answer: '18' },
    { title: 'Sentiment', prompt: 'The AI core has been failing all week. This is terrible!', options: ['😊 Positive', '😐 Neutral', '😠 Negative'], answer: '😠 Negative' },
    { title: 'Clustering', prompt: 'How many natural clusters do you see?', options: ['1', '2', '3'], answer: '2' },
  ];
  const done = step >= challenges.length;
  const challenge = challenges[Math.min(step, challenges.length - 1)];

  function answer(choice: string) {
    if (choice === challenge.answer) {
      playSound('success');
      setStep((prev) => prev + 1);
      setHint('');
    } else {
      playSound('error');
      setHint('That system still looks unstable. Try the concept this challenge is testing.');
    }
  }

  return (
    <>
      <SectionHeader section="finalMission" note="Restore all four core systems." />
      <div style={cardStyle}>
        <div style={{ display: 'flex', gap: 10, fontSize: '2rem', marginBottom: 16 }}>{[0, 1, 2, 3].map((i) => <span key={i}>{i < step ? '🟢' : '🔴'}</span>)}</div>
        <ProgressBar value={step * 25} />
      </div>
      <div style={{ ...cardStyle, marginTop: 18, animation: 'slideInRight .35s ease both', position: 'relative', overflow: 'hidden' }}>
        {done ? (
          <>
            <div style={{ position: 'absolute', inset: '20% 35%', background: 'rgba(94,252,130,.18)', borderRadius: '50%', animation: 'radialPulse 1.5s ease infinite' }} />
            <div className="banner">⚡ CORE RESTORED</div>
            <p className="small">The core is alive. Boss battle incoming.</p>
            <button style={primaryBtn} disabled={!coreReady} onClick={() => setBossStarted(true)}>{coreReady ? 'Enter Boss Battle' : 'Stabilizing core...'}</button>
          </>
        ) : (
          <>
            <div className="kicker">Challenge {step + 1}: {challenge.title}</div>
            <h3>{challenge.prompt}</h3>
            {challenge.title === 'Prediction' && <MiniLine />}
            {challenge.title === 'Clustering' && <MiniClusters />}
            <div className="grid cols3">{challenge.options.map((option) => <button key={option} style={ghostBtn} onClick={() => answer(option)}>{option}</button>)}</div>
            <p className="hint">{hint}</p>
          </>
        )}
      </div>
    </>
  );
}

function MiniLine() {
  return (
    <svg className="svgBox" viewBox="0 0 260 130" style={{ marginBottom: 14 }}>
      <polyline points="20,95 75,80 130,65 185,50" fill="none" stroke="#4b9bff" strokeWidth="4" />
      <line x1="185" y1="50" x2="240" y2="35" stroke="#5efc82" strokeWidth="4" strokeDasharray="6 6" />
    </svg>
  );
}

function MiniClusters() {
  const left = [[45, 45], [75, 60], [55, 82]];
  const right = [[178, 42], [205, 68], [168, 88]];
  return (
    <svg className="svgBox" viewBox="0 0 260 130" style={{ marginBottom: 14 }}>
      {left.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="13" fill="#ff6464" />)}
      {right.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="13" fill="#4b9bff" />)}
    </svg>
  );
}

function VictoryScreen({ xp, completedCount, onRestart }: { xp: number; completedCount: number; onRestart: () => void }) {
  const confetti = useMemo(() => Array.from({ length: 40 }, (_, index) => ({
    id: index,
    left: `${Math.random() * 100}vw`,
    delay: `${Math.random() * 1.2}s`,
    color: ['#5efc82', '#4b9bff', '#ffd76a', '#ff6464'][index % 4],
  })), []);

  return (
    <div style={{ minHeight: 'calc(100vh - 108px)', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
      {confetti.map((piece) => <div key={piece.id} className="confetti" style={{ left: piece.left, animationDelay: piece.delay, background: piece.color }} />)}
      <div style={{ ...cardStyle, maxWidth: 760 }}>
        <div style={{ fontSize: '5rem' }}>🏆</div>
        <h2>NeoCity Restored!</h2>
        <p className="sub">Total XP earned: <b>{xp}</b>. Sections completed: <b>{completedCount}/10</b>. Badges earned: Junior Explorer, Data Ranger, Model Maker, Core Hero.</p>
        <button style={primaryBtn} onClick={onRestart}>Play Again</button>
      </div>
    </div>
  );
}

function SectionScreen({
  currentSection,
  onComplete,
  addBossXp,
  onNameCaptured,
}: {
  currentSection: SectionKey;
  onComplete: () => void;
  addBossXp: () => void;
  onNameCaptured: (name: string) => void;
}) {
  switch (currentSection) {
    case 'whatIsAI':
      return <WhatIsAISection onComplete={onComplete} onNameCaptured={onNameCaptured} />;
    case 'classification':
      return <ClassificationSection onComplete={onComplete} />;
    case 'trainingData':
      return <TrainingDataSection onComplete={onComplete} />;
    case 'computerVision':
      return <ComputerVisionSection onComplete={onComplete} />;
    case 'nlp':
      return <NLPSection onComplete={onComplete} />;
    case 'regression':
      return <RegressionSection onComplete={onComplete} />;
    case 'clustering':
      return <ClusteringSection onComplete={onComplete} />;
    case 'dataTypes':
      return <DataTypesSection onComplete={onComplete} />;
    case 'aiWorkflow':
      return <AIWorkflowSection onComplete={onComplete} />;
    case 'finalMission':
      return <FinalMissionSection onComplete={onComplete} addBossXp={addBossXp} />;
    case 'landing':
    default:
      return null;
  }
}

function App() {
  const [xp, setXp] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [completed, setCompleted] = useState<MissionKey[]>([]);
  const [currentSection, setCurrentSection] = useState<SectionKey>('landing');
  const [victory, setVictory] = useState(false);

  function completeCurrent() {
    if (currentSection === 'landing') return;
    const mission = currentSection as MissionKey;
    if (!completed.includes(mission)) {
      setCompleted((prev) => [...prev, mission]);
      setXp((prev) => prev + 30);
    }
    if (mission === 'finalMission') {
      setVictory(true);
      return;
    }
    const next = sectionOrder[sectionOrder.indexOf(currentSection) + 1];
    if (next) setCurrentSection(next);
  }

  function restart() {
    setXp(0);
    setPlayerName('');
    setCompleted([]);
    setCurrentSection('landing');
    setVictory(false);
  }

  function canNavigate(section: SectionKey) {
    if (section === 'landing') return true;
    const index = sectionOrder.indexOf(section);
    const prev = sectionOrder[index - 1];
    return prev === 'landing' || completed.includes(prev as MissionKey) || completed.includes(section as MissionKey);
  }

  return (
    <PlayerContext.Provider value={playerName}>
      <GlobalStyles />
      <div className="app">
        <Sidebar
          xp={xp}
          completed={completed}
          currentSection={currentSection}
          onNavigate={(section) => {
            if (canNavigate(section)) setCurrentSection(section);
          }}
        />
        <main className="content">
          <section className="stage">
            {victory ? (
              <VictoryScreen xp={xp} completedCount={completed.length} onRestart={restart} />
            ) : currentSection === 'landing' ? (
              <LandingScreen
                onStart={() => {
                  playSound('power');
                  setCurrentSection('whatIsAI');
                }}
              />
            ) : (
              <SectionScreen
                currentSection={currentSection}
                onComplete={completeCurrent}
                addBossXp={() => setXp((prev) => prev + 10)}
                onNameCaptured={(name) => setPlayerName(name)}
              />
            )}
          </section>
        </main>
      </div>
    </PlayerContext.Provider>
  );
}

export default App;
