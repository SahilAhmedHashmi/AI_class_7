import { useEffect, useMemo, useRef, useState, createContext, useContext } from 'react';
import type { CSSProperties, DragEvent, KeyboardEvent, MutableRefObject, PointerEvent, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { forceCollide, forceManyBody, forceSimulation, forceX, forceY } from 'd3-force';
import type { Simulation } from 'd3-force';
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
type SectionDetail = {
  title: string;
  text?: string;
  sections?: { heading: string; body: string }[];
};

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
  aiWorkflow: 'The AI Pipeline',
  finalMission: 'Restore the AI Core',
};

const regressionBriefing =
  "Captain Nova here! To teach our AI how to predict test scores, it needs examples. Your Mission: Plot data points on the board to show how many hours a student studied, and what score they got. The Rule: Give the AI at least 5 different examples. Once it has enough data, it will try to find the hidden pattern! Ready?";

const sectionDetails: Partial<Record<SectionKey, SectionDetail>> = {
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
    title: 'The Concept: Finding the Trend (Supervised Learning)',
    sections: [
      {
        heading: 'The Real-World Pattern',
        body: "Imagine you notice that studying for 1 hour usually gets you a 50% on a test, and 2 hours gets you a 60%. What score do you think 3 hours of studying will get you? You'd probably guess 70%, right? Your brain just naturally found a pattern!",
      },
      {
        heading: 'How the AI Does It',
        body: 'An AI does the exact same thing, but it uses math. In AI, this is called Supervised Learning. We act as the supervisor by giving the AI a bunch of real examples (like study hours vs. test scores).',
      },
      {
        heading: 'Drawing the Line',
        body: 'Once the AI looks at all the examples scattered on a graph, it draws a straight line right through the middle of them. This is called a Trendline.',
      },
      {
        heading: 'Why is this a superpower?',
        body: 'Once the AI has drawn that perfectly angled line, it doesn\'t just know the past—it can predict the future! You can ask it, "What if someone studies for 10 hours?" and it will follow the line to give you an incredibly accurate guess, even if it has never seen a 10-hour example before!',
      },
    ],
  },
  clustering: {
    title: 'How clustering works',
    text: 'Clustering means finding items that are similar and grouping them together in space. In this activity, you will drag icons around and let the AI notice which groups naturally form.',
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

type FactoryBin = typeof factoryItems[number]['bin'];

const testingCatalogItems: { id: string; icon: string; name: string; bin: FactoryBin }[] = [
  { id: 'test-orange', icon: '🍊', name: 'Orange', bin: 'Fruit' },
  { id: 'test-pear', icon: '🍐', name: 'Pear', bin: 'Fruit' },
  { id: 'test-strawberry', icon: '🍓', name: 'Strawberry', bin: 'Fruit' },
  { id: 'test-lion', icon: '🦁', name: 'Lion', bin: 'Animal' },
  { id: 'test-elephant', icon: '🐘', name: 'Elephant', bin: 'Animal' },
  { id: 'test-penguin', icon: '🐧', name: 'Penguin', bin: 'Animal' },
  { id: 'test-train', icon: '🚆', name: 'Train', bin: 'Vehicle' },
  { id: 'test-bike', icon: '🚲', name: 'Bicycle', bin: 'Vehicle' },
  { id: 'test-rocket', icon: '🚀', name: 'Rocket', bin: 'Vehicle' },
];

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

type WorkflowStep = typeof workflowSteps[number];
type MachineResult = 'idle' | 'running' | 'success' | 'failure';

const workflowCartridgeMeta: Record<WorkflowStep, { icon: string; title: string }> = {
  '🎯 Define the Problem': { icon: '🎯', title: 'Define the Problem' },
  '📥 Collect Data': { icon: '📥', title: 'Collect Data' },
  '🧹 Clean & Prepare Data': { icon: '🧹', title: 'Clean & Prepare Data' },
  '🏋️ Train the Model': { icon: '🏋️', title: 'Train the Model' },
  '🧪 Test & Evaluate': { icon: '🧪', title: 'Test & Evaluate' },
};

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

const novaDetailBackdropStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 90,
  display: 'grid',
  placeItems: 'center',
  padding: 20,
  background: 'rgba(2, 8, 22, 0.78)',
  backdropFilter: 'blur(12px)',
  animation: 'modalFade .22s ease both',
};

const novaDetailModalStyle: CSSProperties = {
  position: 'relative',
  display: 'grid',
  gap: 20,
  width: 'min(760px, 100%)',
  maxHeight: 'min(82vh, 760px)',
  overflowY: 'auto',
  borderRadius: 22,
  border: '1px solid rgba(139, 220, 184, 0.34)',
  background: 'linear-gradient(145deg, rgba(11, 24, 48, 0.82), rgba(5, 13, 31, 0.92))',
  boxShadow: '0 32px 100px rgba(0,0,0,.64), 0 0 46px rgba(75,155,255,.16)',
  color: '#eef7ff',
  padding: '34px clamp(22px, 4vw, 42px)',
  textAlign: 'left',
  fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  animation: 'modalRise .28s cubic-bezier(.16,1,.3,1) both',
};

const novaDetailCloseStyle: CSSProperties = {
  position: 'absolute',
  top: 14,
  right: 14,
  width: 38,
  height: 38,
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,.14)',
  background: 'rgba(255,255,255,.08)',
  color: '#f7fbff',
  fontWeight: 900,
  cursor: 'pointer',
};

const novaDetailTitleStyle: CSSProperties = {
  margin: 0,
  paddingRight: 42,
  color: '#4bffa5',
  fontSize: 'clamp(1.45rem, 3vw, 2.15rem)',
  lineHeight: 1.15,
};

const novaDetailHeadingStyle: CSSProperties = {
  margin: '0 0 8px',
  color: '#9fd9ff',
  fontSize: '1rem',
  fontWeight: 900,
};

const novaDetailBodyStyle: CSSProperties = {
  margin: 0,
  color: '#d8eeff',
  fontSize: '1rem',
  lineHeight: 1.72,
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
      .srOnly {
        position:absolute;
        width:1px;
        height:1px;
        padding:0;
        margin:-1px;
        overflow:hidden;
        clip:rect(0,0,0,0);
        white-space:nowrap;
        border:0;
      }
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
        border-color:rgba(75,255,165,.22) !important;
        background:
          radial-gradient(circle at 50% 50%, rgba(75,155,255,.1), transparent 38%),
          linear-gradient(rgba(75,255,165,.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(75,255,165,.03) 1px, transparent 1px),
          repeating-linear-gradient(45deg, rgba(255,255,255,.02) 0 2px, transparent 2px 5px),
          #07101f;
        background-size:auto, 34px 34px, 34px 34px, auto, auto;
        box-shadow:inset 0 0 90px rgba(75,255,165,.08), 0 24px 70px rgba(0,0,0,.35);
      }
      .camera::before {
        content:''; position:absolute; inset:0; pointer-events:none;
        background:radial-gradient(circle at 50% 50%, transparent 52%, rgba(0,0,0,.34) 100%);
        z-index:1;
      }
      .camera.calibrated {
        box-shadow:inset 0 0 120px rgba(75,255,165,.2), 0 0 44px rgba(75,255,165,.16), 0 24px 70px rgba(0,0,0,.35);
      }
      .scanLine {
        position:absolute; left:0; right:0; top:-24%; height:3px; z-index:2;
        background:#4bffa5; box-shadow:0 0 24px #4bffa5, 0 0 70px rgba(75,255,165,.52);
        animation:scannerSweep 3s linear infinite; will-change:transform;
      }
      .scanLine::before {
        content:''; position:absolute; left:0; right:0; bottom:3px; height:116px;
        background:linear-gradient(0deg, rgba(75,255,165,.23), rgba(75,255,165,.08) 42%, transparent);
        filter:blur(.2px); pointer-events:none;
      }
      .camera.calibrated .scanLine {
        top:50%; animation:calibratedLine 1.15s ease-in-out infinite; transform:translateY(-50%);
      }
      .clusterShell {
        height:min(670px, calc(100vh - 108px));
        max-height:670px;
        overflow:hidden;
        display:grid;
        grid-template-rows:auto minmax(0, 1fr);
        gap:12px;
        margin:-6px;
      }
      .clusterMissionText {
        display:grid;
        gap:4px;
        padding:0 4px;
      }
      .clusterMissionText h2 {
        margin:0;
        font-size:clamp(1.28rem, 2.2vw, 2rem);
        line-height:1.08;
      }
      .clusterMissionText p {
        margin:0;
        color:#d8e9ff;
        font-weight:800;
        line-height:1.35;
      }
      .clusterBoardWrap {
        min-height:0;
        display:grid;
        grid-template-rows:minmax(0, 1fr) auto;
        border-radius:18px;
        overflow:hidden;
        border:1px solid rgba(104, 187, 255, .18);
        background:
          radial-gradient(circle at 18% 18%, rgba(75,155,255,.2), transparent 26%),
          radial-gradient(circle at 78% 72%, rgba(75,255,165,.12), transparent 28%),
          linear-gradient(135deg, #061327 0%, #0a1d36 58%, #06101f 100%);
        box-shadow:inset 0 0 90px rgba(75,155,255,.11), 0 18px 52px rgba(0,0,0,.36);
      }
      .clusterBoard {
        display:block;
        width:100%;
        height:100%;
        min-height:0;
        touch-action:none;
        background:transparent;
      }
      .clusterControlBar {
        min-height:72px;
        display:flex;
        align-items:center;
        gap:10px;
        padding:10px 12px;
        background:rgba(3, 12, 24, .78);
        border-top:1px solid rgba(255,255,255,.08);
        backdrop-filter:blur(14px);
      }
      .clusterControlBar button {
        white-space:nowrap;
      }
      .clusterMessage {
        flex:1;
        min-width:160px;
        color:#d5e8ff;
        font-weight:900;
        line-height:1.25;
      }
      .clusterMessage.success { color:#84ffb7; }
      .clusterMessage.failure { color:#ffd0d8; }
      .clusterNode {
        user-select:none;
        transition:filter .16s ease;
      }
      .clusterNode.dragging {
        filter:drop-shadow(0 0 24px rgba(255,255,255,.32));
      }
      .clusterMistake {
        animation:clusterGlitchShake .38s steps(2, end) 2;
      }
      .clusterPulseBoundary {
        transform-origin:center;
        animation:clusterBoundaryPulse 1.15s ease-in-out infinite;
      }
      @keyframes clusterBoundaryPulse {
        0%,100% { stroke-opacity:.7; filter:drop-shadow(0 0 5px currentColor); }
        50% { stroke-opacity:1; filter:drop-shadow(0 0 18px currentColor); }
      }
      @keyframes clusterGlitchShake {
        0%,100% { transform:translate(0,0); filter:drop-shadow(0 0 0 #ff4f68); }
        20% { transform:translate(-9px,2px); filter:drop-shadow(4px 0 0 #4b9bff); }
        40% { transform:translate(8px,-2px); filter:drop-shadow(-4px 0 0 #5efc82); }
        60% { transform:translate(-6px,1px); filter:drop-shadow(4px 0 0 #ff4f68); }
        80% { transform:translate(6px,-1px); filter:drop-shadow(-4px 0 0 #ffd76a); }
      }
      .camera.calibrated .scanLine::before { height:210px; opacity:.55; }
      .calibratedText {
        position:absolute; left:50%; top:50%; z-index:5; transform:translate(-50%, -50%);
        padding:10px 14px; border-radius:10px; border:1px solid rgba(75,255,165,.56);
        background:rgba(4,21,31,.72); color:#4bffa5; font-size:.82rem; font-weight:900;
        letter-spacing:.12em; text-transform:uppercase; text-shadow:0 0 16px rgba(75,255,165,.75);
        animation:calibratedText .7s ease both;
      }
      .scannerHud {
        position:absolute; right:18px; top:16px; z-index:6;
        display:grid; gap:8px; min-width:190px; padding:12px 14px; border-radius:14px;
        border:1px solid rgba(75,255,165,.26); background:rgba(4,16,28,.72);
        box-shadow:0 0 28px rgba(75,255,165,.1); backdrop-filter:blur(10px);
      }
      .scannerHud .kicker { font-size:.64rem; }
      .scannerHudValue { color:#dfffee; font-weight:900; font-size:.9rem; }
      .scannerHudBar { height:5px; border-radius:99px; background:rgba(255,255,255,.1); overflow:hidden; }
      .scannerHudBar span { display:block; height:100%; border-radius:inherit; background:#4bffa5; box-shadow:0 0 12px #4bffa5; transition:width .28s ease; }
      .cameraFlash {
        position:absolute; inset:0; z-index:8; pointer-events:none; background:#dfffee;
        animation:cameraFlash .52s ease-out both;
      }
      .object {
        position:absolute; width:86px; height:86px; border-radius:18px; background:rgba(255,255,255,.052);
        border:1px solid rgba(255,255,255,.12); display:grid; place-items:center; font-size:2.6rem;
        color:#f7fbff; overflow:visible; z-index:3; box-shadow:0 12px 30px rgba(0,0,0,.28), inset 0 0 24px rgba(75,155,255,.04);
        animation:ambientDrift var(--drift-duration, 8s) ease-in-out infinite alternate, proximityGlow 3s linear infinite;
        animation-delay:var(--drift-delay, 0s), var(--scan-delay, 0s);
        transform:translate3d(0,0,0); will-change:transform, filter;
      }
      .object:hover { border-color:rgba(75,255,165,.42); background:rgba(75,255,165,.08); }
      .object.locked { border-color:rgba(75,255,165,.46); background:rgba(75,255,165,.08); }
      .object.rejecting { animation:rejectShake .32s ease, proximityGlow 3s linear infinite; animation-delay:0s, var(--scan-delay, 0s); }
      .objectIcon { position:relative; z-index:2; filter:drop-shadow(0 0 12px rgba(75,155,255,.28)); }
      .lockRipple {
        position:absolute; inset:-10px; border-radius:50%; border:2px solid rgba(75,255,165,.8);
        animation:targetRipple .48s ease-out both; pointer-events:none; z-index:0;
      }
      .focusReticle, .rejectReticle { position:absolute; inset:-8px; pointer-events:none; z-index:3; }
      .focusReticle { animation:reticleSnap .32s cubic-bezier(.16,1,.3,1) both; }
      .rejectReticle { animation:rejectBox .58s steps(2,end) both; }
      .corner {
        position:absolute; width:19px; height:19px; border-color:#4bffa5; filter:drop-shadow(0 0 8px rgba(75,255,165,.8));
      }
      .rejectReticle .corner { border-color:#ff6464; filter:drop-shadow(0 0 8px rgba(255,100,100,.75)); }
      .corner.tl { left:0; top:0; border-left:3px solid; border-top:3px solid; }
      .corner.tr { right:0; top:0; border-right:3px solid; border-top:3px solid; }
      .corner.bl { left:0; bottom:0; border-left:3px solid; border-bottom:3px solid; }
      .corner.br { right:0; bottom:0; border-right:3px solid; border-bottom:3px solid; }
      .tag {
        position:absolute; top:-35px; left:50%; transform:translateX(-50%); white-space:nowrap; font-size:.68rem;
        background:rgba(5,22,31,.94); color:#4bffa5; border:1px solid rgba(75,255,165,.55);
        padding:5px 8px; border-radius:6px; font-weight:900; letter-spacing:.06em;
        overflow:hidden; max-width:0; animation:typeTag .62s steps(18,end) .08s forwards; z-index:4;
      }
      .tag.rejectTag {
        color:#ff7d7d; border-color:rgba(255,100,100,.65); animation:rejectTag .95s ease both; max-width:none;
      }
      .chatBubble {
        max-width:760px; padding:18px 20px; border-radius:24px 24px 24px 8px;
        background:rgba(75,155,255,.14); border:1px solid rgba(75,155,255,.22); line-height:1.55;
      }
      .typewriterCursor {
        display:inline-block;
        margin-left:3px;
        color:#4bffa5;
        font-weight:900;
        animation:cursorBlink .82s steps(1,end) infinite;
      }
      @keyframes cursorBlink {
        0%, 48% { opacity:1; }
        49%, 100% { opacity:0; }
      }
      .svgBox { width:100%; max-width:460px; height:auto; border-radius:22px; background:rgba(255,255,255,.045); border:1px solid rgba(255,255,255,.08); }
      input[type="range"] { width:100%; accent-color:#4bffa5; min-height:48px; }
      .factory-conveyor.testing-mode {
        position:relative;
        min-height:230px;
        border-style:solid;
        border-color:rgba(75,155,255,.24);
        background:
          radial-gradient(circle at 50% 35%, rgba(75,255,165,.11), transparent 32%),
          repeating-linear-gradient(90deg, rgba(255,255,255,.04) 0 20px, transparent 20px 42px),
          rgba(5,13,27,.72);
      }
      .factory-conveyor.drop-ready {
        border-color:rgba(75,255,165,.72);
        box-shadow:0 0 0 4px rgba(75,255,165,.1), 0 0 34px rgba(75,255,165,.16);
      }
      .factory-conveyor.drag-target-hot .factory-drop-prompt {
        border-color:rgba(75,255,165,.78);
        color:#d9fff0;
        background:rgba(75,255,165,.09);
        animation:dropTargetPulse 1.05s ease-in-out infinite;
      }
      .factory-drop-prompt {
        display:grid;
        place-items:center;
        width:min(360px, 100%);
        min-height:150px;
        border-radius:28px;
        border:1px dashed rgba(75,255,165,.32);
        color:#9fd9ff;
        font-weight:900;
        text-transform:uppercase;
        font-size:.82rem;
        letter-spacing:.12em;
        background:rgba(16,28,46,.5);
      }
      .testing-giant-card {
        position:relative;
        display:grid;
        place-items:center;
        min-height:178px;
        transform-origin:center;
        overflow:hidden;
        animation:factoryExpand .62s cubic-bezier(.16,1,.3,1) both;
        will-change:transform, opacity;
      }
      .testing-card-icon {
        margin:0;
        font-size:6.8rem;
        filter:drop-shadow(0 0 24px rgba(75,155,255,.45));
      }
      .testing-giant-card.processing {
        box-shadow:0 24px 70px rgba(0,0,0,.35), 0 0 34px rgba(75,255,165,.22);
      }
      .factory-scanline {
        position:absolute;
        left:8%;
        right:8%;
        top:0;
        height:4px;
        border-radius:99px;
        background:#4bffa5;
        box-shadow:0 0 22px #4bffa5;
        animation:factoryScan .78s ease-in-out infinite;
      }
      .testing-giant-card.route-Fruit { animation:routeFruit .78s cubic-bezier(.2,.8,.2,1) forwards; }
      .testing-giant-card.route-Animal { animation:routeAnimal .78s cubic-bezier(.2,.8,.2,1) forwards; }
      .testing-giant-card.route-Vehicle { animation:routeVehicle .78s cubic-bezier(.2,.8,.2,1) forwards; }
      .factory-bin.classifying {
        border-color:rgba(75,255,165,.85);
        background:rgba(75,255,165,.13);
        box-shadow:0 0 28px rgba(75,255,165,.22);
        animation:pulseGlow .8s ease infinite;
      }
      .testing-catalog {
        overflow:hidden;
        padding:14px;
        border-radius:22px !important;
        background:linear-gradient(90deg, rgba(7,16,31,.96), rgba(16,28,46,.94)) !important;
      }
      .catalog-track {
        display:flex;
        gap:12px;
        width:max-content;
        animation:catalogDrift 24s linear infinite;
      }
      .testing-catalog:hover .catalog-track { animation-play-state:paused; }
      .testing-catalog.needs-nudge {
        position:relative;
        overflow:visible;
      }
      .testing-catalog.needs-nudge::before {
        content:'';
        position:absolute;
        left:34px;
        top:-20px;
        width:0;
        height:0;
        border-left:11px solid transparent;
        border-right:11px solid transparent;
        border-top:16px solid #4bffa5;
        filter:drop-shadow(0 0 12px rgba(75,255,165,.75));
        animation:nudgeArrow 1.2s ease-in-out infinite;
        z-index:2;
        pointer-events:none;
      }
      .catalog-thumb {
        width:64px;
        height:64px;
        flex:0 0 auto;
        display:grid;
        place-items:center;
        border-radius:18px;
        border:1px solid rgba(255,255,255,.12);
        background:rgba(255,255,255,.07);
        color:#f7fbff;
        cursor:grab;
        transition:transform .16s ease, border-color .16s ease, background .16s ease;
      }
      .catalog-thumb span {
        font-size:2.1rem;
        line-height:1;
        filter:drop-shadow(0 0 13px rgba(75,155,255,.32));
      }
      .catalog-thumb:hover {
        transform:translateY(-3px) scale(1.04);
        border-color:rgba(75,255,165,.5);
        background:rgba(75,155,255,.14);
      }
      .catalog-thumb.first-nudge {
        border-color:rgba(75,255,165,.72);
        box-shadow:0 0 0 3px rgba(75,255,165,.12), 0 0 28px rgba(75,255,165,.32);
        animation:firstThumbPulse 1.2s ease-in-out infinite;
      }
      .catalog-thumb:active { cursor:grabbing; }
      .catalog-thumb:disabled {
        opacity:.46;
        cursor:default;
        transform:none;
      }
      .factory-test-footer {
        display:flex;
        justify-content:space-between;
        gap:16px;
        align-items:center;
        margin-top:14px;
      }
      .factory-test-footer .hint { margin:0; }
      .factory-test-footer button:disabled {
        opacity:.48;
        cursor:not-allowed;
      }
      .training-complete-backdrop {
        position:fixed;
        inset:0;
        z-index:80;
        display:grid;
        place-items:center;
        padding:22px;
        background:rgba(3,8,18,.76);
        backdrop-filter:blur(12px);
        animation:modalFade .22s ease both;
      }
      .training-complete-modal {
        width:min(560px, 100%);
        border-radius:24px;
        border:1px solid rgba(75,255,165,.32);
        background:
          radial-gradient(circle at 50% 0%, rgba(75,255,165,.16), transparent 34%),
          linear-gradient(145deg, rgba(16,28,46,.98), rgba(7,16,31,.98));
        box-shadow:0 28px 90px rgba(0,0,0,.55), 0 0 42px rgba(75,255,165,.16);
        padding:30px;
        text-align:center;
        animation:modalRise .28s cubic-bezier(.16,1,.3,1) both;
      }
      .training-complete-modal h3 {
        margin:0 0 14px;
        color:#4bffa5;
        font-size:clamp(2rem, 4vw, 3.1rem);
        text-shadow:0 0 24px rgba(75,255,165,.45);
      }
      .training-complete-modal p {
        margin:0 auto 24px;
        max-width:470px;
        color:#d8eeff;
        line-height:1.65;
      }
      .pipelineShell {
        height:min(640px, calc(100vh - 138px));
        min-height:520px;
        overflow:hidden;
        display:grid;
        grid-template-columns:minmax(360px, 1.35fr) minmax(260px, .85fr);
        gap:16px;
        padding:16px;
        border-radius:22px;
        border:1px solid rgba(90,177,255,.2);
        background:#07162a;
      }
      .pipelineBlueprint,
      .cartridgeBay {
        min-height:0;
        overflow:hidden;
        border-radius:18px;
        border:1px solid rgba(255,255,255,.09);
        background:rgba(3,10,22,.42);
      }
      .pipelineBlueprint {
        position:relative;
        display:grid;
        grid-template-columns:74px minmax(0, 1fr);
        gap:16px;
        padding:16px;
      }
      .machineRail {
        position:relative;
        display:grid;
        place-items:center;
      }
      .machineRail::before {
        content:'';
        position:absolute;
        top:34px;
        bottom:34px;
        width:8px;
        border-radius:0;
        background:#102642;
        border:1px solid rgba(117,214,255,.2);
      }
      .machineRail.online::before {
        background:#3df49a;
        border-color:rgba(75,255,165,.8);
      }
      .energyPulse {
        position:absolute;
        left:50%;
        width:8px;
        height:70px;
        border-radius:0;
        background:#75d6ff;
        box-shadow:0 0 14px rgba(117,214,255,.9), 0 0 28px rgba(117,214,255,.42);
        z-index:2;
      }
      .pipelineDocks {
        position:relative;
        display:grid;
        grid-template-rows:repeat(5, minmax(0, 1fr));
        gap:10px;
        min-height:0;
      }
      .pipelineDock {
        position:relative;
        display:grid;
        grid-template-columns:48px minmax(0, 1fr);
        align-items:center;
        gap:12px;
        min-height:0;
        padding:9px 10px;
        border-radius:16px;
        border:1px solid rgba(112,174,255,.22);
        background:#0b1a31;
        cursor:pointer;
      }
      .pipelineDock::before {
        content:'';
        position:absolute;
        left:-43px;
        width:44px;
        height:8px;
        border-radius:0;
        background:#102642;
        border:1px solid rgba(112,174,255,.18);
      }
      .pipelineDock.ready {
        border-color:rgba(117,214,255,.86);
        background:#12345a;
      }
      .pipelineDock.checkpoint {
        border-color:rgba(117,214,255,.95);
        background:#15537a;
      }
      .pipelineDock.jammed {
        border-color:rgba(255,104,81,.95);
        background:#51201f;
      }
      .pipelineDock.online {
        border-color:rgba(75,255,165,.82);
        background:#0f3a2d;
      }
      .dockNumber {
        width:40px;
        height:40px;
        border-radius:12px;
        display:grid;
        place-items:center;
        color:#07101e;
        font-weight:900;
        background:#75d6ff;
        border:1px solid rgba(255,255,255,.12);
      }
      .dockEmpty {
        color:#7692b5;
        font-weight:900;
        text-transform:uppercase;
        font-size:.8rem;
        letter-spacing:.08em;
      }
      .cartridge {
        width:100%;
        min-height:62px;
        display:grid;
        grid-template-columns:48px minmax(0, 1fr);
        align-items:center;
        gap:10px;
        border:1px solid rgba(139,205,255,.22);
        border-radius:14px;
        padding:8px 10px;
        color:#f7fbff;
        text-align:left;
        cursor:grab;
        user-select:none;
        background:#185a9d;
      }
      .cartridge:active {
        cursor:grabbing;
        background:#206dbb;
        border-color:rgba(117,214,255,.95);
      }
      .cartridge.selected {
        border-color:rgba(75,255,165,.8);
        background:#176f5a;
      }
      .cartridge.dragging {
        border-color:rgba(117,214,255,.95);
        background:#206dbb;
      }
      .cartridge.lit {
        border-color:rgba(117,214,255,.95);
        background:#1f78c8;
      }
      .cartridgeIcon {
        width:44px;
        height:44px;
        border-radius:12px;
        display:grid;
        place-items:center;
        font-size:1.65rem;
        background:rgba(7,16,31,.42);
        border:1px solid rgba(255,255,255,.12);
      }
      .cartridgeText strong {
        display:block;
        font-size:.95rem;
        line-height:1.12;
      }
      .cartridgeBay {
        display:grid;
        grid-template-rows:auto minmax(0, 1fr) auto;
        gap:12px;
        padding:16px;
      }
      .cartridgeBay h3 {
        margin:0;
        font-size:1rem;
      }
      .cartridgeRack {
        min-height:0;
        display:grid;
        align-content:start;
        gap:10px;
      }
      .machineControls {
        display:grid;
        gap:10px;
      }
      .machineStatus {
        min-height:44px;
        color:#d8eeff;
        font-weight:900;
        line-height:1.25;
      }
      .machineButton {
        min-height:48px;
        min-width:48px;
        border-radius:12px;
        border:1px solid rgba(255,255,255,.14);
        background:#4b9bff;
        color:#03151e;
        cursor:pointer;
        font-weight:900;
        padding:14px 22px;
      }
      .machineButton:hover:not(:disabled) {
        background:#75d6ff;
        border-color:rgba(255,255,255,.24);
      }
      .machineButton:disabled {
        cursor:not-allowed;
        background:#27415f;
        color:#9db9d8;
        border-color:rgba(255,255,255,.08);
      }
      .jamTooltip {
        position:absolute;
        right:16px;
        max-width:min(330px, 48%);
        z-index:5;
        padding:12px 14px;
        border-radius:14px;
        background:rgba(48,16,18,.98);
        border:1px solid rgba(255,118,86,.68);
        color:#ffe6d3;
        font-weight:900;
      }
      .jamTooltip::before {
        content:'';
        position:absolute;
        left:-9px;
        top:18px;
        width:16px;
        height:16px;
        transform:rotate(45deg);
        background:inherit;
        border-left:1px solid rgba(255,118,86,.68);
        border-bottom:1px solid rgba(255,118,86,.68);
      }
      .sparkField {
        position:absolute;
        inset:0;
        pointer-events:none;
        overflow:hidden;
        border-radius:inherit;
      }
      .sparkField i {
        position:absolute;
        left:18%;
        top:50%;
        width:38px;
        height:3px;
        border-radius:999px;
        background:#ffd76a;
        box-shadow:0 0 16px #ff604d;
        transform:rotate(var(--spark-rotate)) translateX(var(--spark-distance));
        animation:sparkBurst .44s ease-out both;
      }
      .successPanel {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        margin-top:10px;
        padding:12px 14px;
        border-radius:16px;
        border:1px solid rgba(75,255,165,.38);
        background:rgba(75,255,165,.1);
      }
      @keyframes sparkBurst {
        from { opacity:1; transform:rotate(var(--spark-rotate)) translateX(0) scaleX(.45); }
        to { opacity:0; transform:rotate(var(--spark-rotate)) translateX(var(--spark-distance)) scaleX(1.2); }
      }
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
      @keyframes scannerSweep { from { transform:translate3d(0, -10%, 0); } to { transform:translate3d(0, 620px, 0); } }
      @keyframes calibratedLine { 0%,100%{opacity:.76;box-shadow:0 0 22px #4bffa5,0 0 54px rgba(75,255,165,.4)} 50%{opacity:1;box-shadow:0 0 36px #4bffa5,0 0 92px rgba(75,255,165,.72)} }
      @keyframes calibratedText { from{opacity:0;transform:translate(-50%, -42%) scale(.96)} to{opacity:1;transform:translate(-50%, -50%) scale(1)} }
      @keyframes cameraFlash { 0%{opacity:0} 14%{opacity:.88} 100%{opacity:0} }
      @keyframes ambientDrift {
        0%{transform:translate3d(0,0,0)}
        35%{transform:translate3d(var(--drift-x, 4px), var(--drift-y, -5px), 0)}
        70%{transform:translate3d(var(--drift-x-alt, -3px), var(--drift-y-alt, 4px), 0)}
        100%{transform:translate3d(1px, -1px, 0)}
      }
      @keyframes proximityGlow {
        0%,18%,100% { filter:brightness(1); border-color:rgba(255,255,255,.12); }
        7% { filter:brightness(1.62) saturate(1.22); border-color:rgba(75,255,165,.68); box-shadow:0 12px 30px rgba(0,0,0,.28), 0 0 28px rgba(75,255,165,.28); }
      }
      @keyframes reticleSnap {
        0%{transform:scale(1.28);opacity:0}
        58%{transform:scale(.96);opacity:1}
        100%{transform:scale(1);opacity:1}
      }
      @keyframes typeTag { from{max-width:0;opacity:1} to{max-width:180px;opacity:1} }
      @keyframes targetRipple { from{transform:scale(.55);opacity:.9} to{transform:scale(1.55);opacity:0} }
      @keyframes rejectShake {
        0%,100%{transform:translateX(0)}
        18%{transform:translateX(-9px)}
        34%{transform:translateX(8px)}
        52%{transform:translateX(-6px)}
        70%{transform:translateX(5px)}
      }
      @keyframes rejectBox {
        0%{opacity:0;clip-path:inset(50% 50% 50% 50%);transform:translateX(-3px)}
        18%{opacity:1;clip-path:inset(0);transform:translateX(4px)}
        42%{opacity:.78;clip-path:inset(0 8% 18% 0);transform:translateX(-5px)}
        68%{opacity:.48;clip-path:inset(24% 0 0 12%);transform:translateX(3px)}
        100%{opacity:0;clip-path:inset(50% 50% 50% 50%);transform:translateX(0)}
      }
      @keyframes rejectTag {
        0%{opacity:0;transform:translate(-50%, 4px)}
        16%,72%{opacity:1;transform:translate(-50%, 0)}
        100%{opacity:0;transform:translate(-50%, -6px)}
      }
      @keyframes drawBorder { from{clip-path:inset(0 100% 100% 0)} to{clip-path:inset(0 0 0 0)} }
      @keyframes confettiFall { to { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
      @keyframes readyPulse { 0%,100%{box-shadow:0 0 0 0 rgba(94,252,130,0.3)} 50%{box-shadow:0 0 0 10px rgba(94,252,130,0)} }
      @keyframes flowDot { from{stroke-dashoffset:100} to{stroke-dashoffset:0} }
      @keyframes radialPulse { 0%{transform:scale(0);opacity:0.8} 100%{transform:scale(2.5);opacity:0} }
      @keyframes timerRun { from { width:100%; } to { width:0%; } }
      @keyframes factoryExpand { from { transform:scale(.22); opacity:.35; } to { transform:scale(1); opacity:1; } }
      @keyframes factoryScan { 0%{top:8%;opacity:.15} 18%{opacity:1} 100%{top:92%;opacity:.2} }
      @keyframes catalogDrift { from { transform:translateX(0); } to { transform:translateX(calc(-33.333% - 8px)); } }
      @keyframes firstThumbPulse { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-4px) scale(1.05)} }
      @keyframes nudgeArrow { 0%,100%{transform:translateY(0);opacity:.72} 50%{transform:translateY(8px);opacity:1} }
      @keyframes dropTargetPulse { 0%,100%{box-shadow:0 0 0 0 rgba(75,255,165,.22), inset 0 0 0 rgba(75,255,165,0)} 50%{box-shadow:0 0 0 10px rgba(75,255,165,0), inset 0 0 28px rgba(75,255,165,.16)} }
      @keyframes modalFade { from { opacity:0; } to { opacity:1; } }
      @keyframes modalRise { from { transform:translateY(16px) scale(.97); opacity:.65; } to { transform:translateY(0) scale(1); opacity:1; } }
      @keyframes routeFruit { to { transform:translate(-34vw, 238px) scale(.32); opacity:.08; } }
      @keyframes routeAnimal { to { transform:translate(0, 238px) scale(.32); opacity:.08; } }
      @keyframes routeVehicle { to { transform:translate(34vw, 238px) scale(.32); opacity:.08; } }
      .sorter-mistake { animation: sorterShake .42s ease-in-out 2; transform-box: fill-box; transform-origin: center; }
      @keyframes sorterShake {
        0%,100% { transform: translateX(0); }
        20% { transform: translateX(-7px); }
        40% { transform: translateX(7px); }
        60% { transform: translateX(-5px); }
        80% { transform: translateX(5px); }
      }
      @media (max-width: 920px) {
        .app { grid-template-columns:1fr; }
        .sidebar { position:relative; height:auto; }
        .content { padding:14px; }
        .stage { min-height:70vh; padding:18px; border-radius:24px; }
        .pipelineShell { height:auto; min-height:0; grid-template-columns:1fr; overflow:visible; }
        .pipelineBlueprint { min-height:470px; }
        .jamTooltip { max-width:calc(100% - 32px); }
        .cols2, .cols3, .cols4 { grid-template-columns:1fr; }
        .sectionHead { display:block; }
        .testing-card-icon { font-size:5.3rem; }
        .factory-test-footer { display:grid; }
        @keyframes routeFruit { to { transform:translate(0, 238px) scale(.32); opacity:.08; } }
        @keyframes routeAnimal { to { transform:translate(0, 362px) scale(.32); opacity:.08; } }
        @keyframes routeVehicle { to { transform:translate(0, 486px) scale(.32); opacity:.08; } }
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
  detail?: SectionDetail;
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
    }, 30);
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
        {!askName && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {detail && (
              <button
                style={{ ...ghostBtn, minWidth: 'auto', padding: '13px 22px', opacity: done ? 1 : 0.5, cursor: done ? 'pointer' : 'not-allowed' }}
                onClick={() => setShowDetail(true)}
                disabled={!done}
              >
                Read in detail about the concept
              </button>
            )}
            {onDone && (
              <button
                style={{ ...primaryBtn, opacity: done ? 1 : 0.5, cursor: done ? 'pointer' : 'not-allowed' }}
                onClick={onDone}
                disabled={!done}
              >
                Let's Go →
              </button>
            )}
          </div>
        )}
      </div>
      {showDetail && detail && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="nova-detail-title"
          style={novaDetailBackdropStyle}
          onClick={() => setShowDetail(false)}
        >
          <div style={novaDetailModalStyle} onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              aria-label="Close concept details"
              style={novaDetailCloseStyle}
              onClick={() => setShowDetail(false)}
            >
              X
            </button>
            <h2 id="nova-detail-title" style={novaDetailTitleStyle}>{detail.title}</h2>
            {detail.sections ? (
              <div style={{ display: 'grid', gap: 18 }}>
                {detail.sections.map((section) => (
                  <section key={section.heading}>
                    <h3 style={novaDetailHeadingStyle}>{section.heading}</h3>
                    <p style={novaDetailBodyStyle}>{section.body}</p>
                  </section>
                ))}
              </div>
            ) : (
              <p style={novaDetailBodyStyle}>{detail.text}</p>
            )}
            <button type="button" style={{ ...primaryBtn, justifySelf: 'start', marginTop: 8 }} onClick={() => setShowDetail(false)}>
              Got it!
            </button>
          </div>
        </div>
      )}
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
  const [counts, setCounts] = useState<Record<FactoryBin, number>>({ Fruit: 0, Animal: 0, Vehicle: 0 });
  const [hint, setHint] = useState('');
  const [wrongBin, setWrongBin] = useState('');
  const [dropActive, setDropActive] = useState(false);
  const [testingItem, setTestingItem] = useState<(typeof testingCatalogItems)[number] | null>(null);
  const [processing, setProcessing] = useState(false);
  const [routingBin, setRoutingBin] = useState<FactoryBin | null>(null);
  const [testedCount, setTestedCount] = useState(0);
  const [showTrainingComplete, setShowTrainingComplete] = useState(false);
  const [testingStarted, setTestingStarted] = useState(false);
  const [catalogTouched, setCatalogTouched] = useState(false);
  const [carouselDragging, setCarouselDragging] = useState(false);
  const deployButtonRef = useRef<HTMLButtonElement | null>(null);

  const done = index >= factoryItems.length;
  const testingPhase = done && testingStarted;
  const current = factoryItems[index];
  const catalogLoop = [...testingCatalogItems, ...testingCatalogItems, ...testingCatalogItems];

  useEffect(() => {
    if (!showTrainingComplete) return;
    deployButtonRef.current?.focus();
  }, [showTrainingComplete]);

  useEffect(() => {
    if (!testingItem) return;

    setProcessing(false);
    setRoutingBin(null);
    const thinkTimer = window.setTimeout(() => setProcessing(true), 700);
    const routeTimer = window.setTimeout(() => {
      setProcessing(false);
      setRoutingBin(testingItem.bin);
    }, 1650);
    const finishTimer = window.setTimeout(() => {
      setCounts((prev) => ({ ...prev, [testingItem.bin]: prev[testingItem.bin] + 1 }));
      setTestedCount((prev) => prev + 1);
      setTestingItem(null);
      setRoutingBin(null);
      setHint('AI classified the raw image by using the rule you trained.');
      playSound('success');
    }, 2450);

    return () => {
      window.clearTimeout(thinkTimer);
      window.clearTimeout(routeTimer);
      window.clearTimeout(finishTimer);
    };
  }, [testingItem]);

  if (!gateOpen) {
    return <NovaGate lines={['The factory conveyor is moving again.', 'Classify each object by its features and the bins will teach the model.']} detail={sectionDetails.classification} onDone={() => setGateOpen(true)} />;
  }

  function choose(bin: FactoryBin) {
    if (!current) return;
    if (current.bin === bin) {
      playSound('drop');
      setCounts((prev) => ({ ...prev, [bin]: prev[bin] + 1 }));
      setIndex((prev) => {
        const next = prev + 1;
        if (next >= factoryItems.length) {
          window.setTimeout(() => {
            setShowTrainingComplete(true);
            playSound('success');
          }, 150);
        }
        return next;
      });
      setHint('');
    } else {
      playSound('error');
      setWrongBin(bin);
      setHint('Look at its features. What category fits best?');
      window.setTimeout(() => setWrongBin(''), 450);
    }
  }

  function handleTestingDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDropActive(false);
    setCarouselDragging(false);
    if (!testingPhase || testingItem) return;
    const itemId = event.dataTransfer.getData('application/x-factory-item');
    const item = testingCatalogItems.find((candidate) => candidate.id === itemId);
    if (!item) return;
    playSound('drop');
    setHint('');
    setTestingItem(item);
  }

  function handleDragStart(event: React.DragEvent<HTMLButtonElement>, itemId: string) {
    setCatalogTouched(true);
    setCarouselDragging(true);
    event.dataTransfer.setData('application/x-factory-item', itemId);
    event.dataTransfer.effectAllowed = 'copy';
  }

  function startTestingPhase() {
    setShowTrainingComplete(false);
    setTestingStarted(true);
    setHint('');
  }

  return (
    <>
      <SectionHeader
        section="classification"
        note={testingPhase ? 'Phase 2: Inference. Drag raw data from the conveyor below into the scanner to test your trained AI.' : 'Sort one item at a time and watch the class counts update.'}
      />
      <div
        className={`conveyor factory-conveyor ${testingPhase ? 'testing-mode' : ''} ${dropActive ? 'drop-ready' : ''} ${carouselDragging && testingPhase && !testingItem ? 'drag-target-hot' : ''}`}
        onDragOver={(event) => {
          if (!testingPhase || testingItem) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = 'copy';
        }}
        onDragEnter={() => testingPhase && !testingItem && setDropActive(true)}
        onDragLeave={() => setDropActive(false)}
        onDrop={handleTestingDrop}
      >
        {!done && current ? (
          <div style={cardStyle} className="itemCard">
            <span className="emoji">{current.icon}</span>
            <h3>{current.name}</h3>
            <p className="small">{current.desc}</p>
          </div>
        ) : testingPhase && testingItem ? (
          <div
            style={cardStyle}
            className={`itemCard testing-giant-card ${processing ? 'processing' : ''} ${routingBin ? `route-${routingBin}` : ''}`}
            aria-label={`Unlabeled ${testingItem.name} image`}
          >
            <span className="emoji testing-card-icon">{testingItem.icon}</span>
            {processing && <span className="factory-scanline" aria-hidden="true" />}
          </div>
        ) : testingPhase ? (
          <div className="factory-drop-prompt">
            <span>Drop raw data here</span>
          </div>
        ) : (
          <div className="factory-drop-prompt">
            <span>Model ready</span>
          </div>
        )}
      </div>
      <div className="grid cols3" style={{ marginTop: 18 }}>
        {(['Fruit', 'Animal', 'Vehicle'] as const).map((bin) => (
          <button
            key={bin}
            className={`tile factory-bin ${wrongBin === bin ? 'shake' : ''} ${routingBin === bin ? 'classifying' : ''}`}
            style={{ position: 'relative' }}
            onClick={() => choose(bin)}
            disabled={done}
          >
            <span className="count">{counts[bin]}</span>
            <span className="emoji">{bin === 'Fruit' ? '🍎' : bin === 'Animal' ? '🐾' : '🚗'}</span>
            <b>{bin}</b>
          </button>
        ))}
      </div>
      {testingPhase ? (
        <>
          <div
            style={{ ...cardStyle, marginTop: 18 }}
            className={`testing-catalog ${!catalogTouched ? 'needs-nudge' : ''}`}
            aria-label="Raw testing image catalog"
          >
            <div className="catalog-track">
              {catalogLoop.map((item, loopIndex) => (
                <button
                  key={`${item.id}-${loopIndex}`}
                  className={`catalog-thumb ${!catalogTouched && loopIndex === 0 ? 'first-nudge' : ''}`}
                  draggable={!testingItem}
                  onPointerDown={() => setCatalogTouched(true)}
                  onDragStart={(event) => handleDragStart(event, item.id)}
                  onDragEnd={() => {
                    setCarouselDragging(false);
                    setDropActive(false);
                  }}
                  disabled={!!testingItem}
                  aria-label={`Drag unlabeled ${item.name} image to conveyor`}
                >
                  <span>{item.icon}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="factory-test-footer">
            <p className="hint">{hint || (testingItem ? 'AI is reading image features...' : 'Choose any tiny image and drop it onto the conveyor.')}</p>
            <button style={primaryBtn} onClick={onComplete} disabled={testedCount === 0}>
              Power Next District
            </button>
          </div>
        </>
      ) : (
        <div style={{ ...cardStyle, marginTop: 18 }}>
          <p className="hint">{hint}</p>
        </div>
      )}
      {showTrainingComplete && (
        <div className="training-complete-backdrop" role="presentation">
          <div
            className="training-complete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="training-complete-title"
            aria-describedby="training-complete-desc"
          >
            <h3 id="training-complete-title">Training Complete!</h3>
            <p id="training-complete-desc">
              Excellent work. The AI has analyzed your examples and built its classification model. Now, let's deploy it. Your next mission is to test the AI with raw, unlabeled data to see what it learned.
            </p>
            <button ref={deployButtonRef} style={primaryBtn} onClick={startTestingPhase}>
              Deploy AI
            </button>
          </div>
        </div>
      )}
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
  const [feedback, setFeedback] = useState<{ id: string; key: number } | null>(null);
  const [completeFlash, setCompleteFlash] = useState(false);

  if (!gateOpen) {
    return <NovaGate lines={['The vision grid is scanning the city.', 'Detect living things only so NeoCity can protect parks and pedestrians.']} detail={sectionDetails.computerVision} onDone={() => setGateOpen(true)} />;
  }

  const objects = [
    { id: 'panda', icon: '🐼', x: 8, y: 15, living: true, label: 'Animal', tag: '[ LIVING: 99% ]', driftX: '4px', driftY: '-5px', driftXAlt: '-3px', driftYAlt: '3px', driftDuration: '8.4s', driftDelay: '-1.6s' },
    { id: 'car', icon: '🚗', x: 43, y: 42, living: false, label: 'car', tag: '[ 0% MATCH ]', driftX: '-5px', driftY: '3px', driftXAlt: '4px', driftYAlt: '-4px', driftDuration: '9.2s', driftDelay: '-3.1s' },
    { id: 'bird', icon: '🐦', x: 76, y: 18, living: true, label: 'Animal', tag: '[ ENTITY DETECTED ]', driftX: '3px', driftY: '5px', driftXAlt: '-4px', driftYAlt: '-2px', driftDuration: '7.8s', driftDelay: '-.7s' },
    { id: 'tree', icon: '🌳', x: 16, y: 70, living: true, label: 'Plant', tag: '[ LIVING: 99% ]', driftX: '-4px', driftY: '-3px', driftXAlt: '5px', driftYAlt: '4px', driftDuration: '10.1s', driftDelay: '-4.5s' },
    { id: 'light', icon: '🚦', x: 70, y: 57, living: false, label: 'traffic light', tag: '[ NON-LIVING ]', driftX: '5px', driftY: '-4px', driftXAlt: '-2px', driftYAlt: '5px', driftDuration: '8.9s', driftDelay: '-2.4s' },
    { id: 'house', icon: '🏠', x: 82, y: 76, living: false, label: 'house', tag: '[ NON-LIVING ]', driftX: '-3px', driftY: '4px', driftXAlt: '3px', driftYAlt: '-5px', driftDuration: '9.7s', driftDelay: '-5.2s' },
  ];
  const done = found.length === 3;

  function detect(item: typeof objects[number]) {
    if (item.living) {
      if (!found.includes(item.id)) {
        playSound('success');
        setFound((prev) => {
          const next = [...prev, item.id];
          if (next.length === 3) {
            setCompleteFlash(true);
            window.setTimeout(() => setCompleteFlash(false), 620);
          }
          return next;
        });
        setHint('');
      }
    } else {
      playSound('error');
      setFeedback({ id: item.id, key: Date.now() });
      setHint(`A ${item.label} isn't alive, so the AI would not flag it as a living creature.`);
      window.setTimeout(() => setFeedback(null), 1000);
    }
  }

  return (
    <>
      <SectionHeader section="computerVision" note="The AI camera needs to detect every living thing. Tap them." />
      <div style={cardStyle} className={`camera ${done ? 'calibrated' : ''}`}>
        <div className="scannerHud" aria-live="polite">
          <div className="kicker">Telemetry HUD</div>
          <div className="scannerHudValue">Targets Locked: {found.length} / 3</div>
          <div className="scannerHudBar"><span style={{ width: `${(found.length / 3) * 100}%` }} /></div>
        </div>
        <div className="scanLine" />
        {done && <div className="calibratedText">System Calibrated</div>}
        {completeFlash && <div className="cameraFlash" />}
        {objects.map((item) => {
          const locked = found.includes(item.id);
          const rejected = feedback?.id === item.id;
          const objectStyle = {
            left: `${item.x}%`,
            top: `${item.y}%`,
            '--scan-delay': `${-(item.y / 100) * 3}s`,
            '--drift-x': item.driftX,
            '--drift-y': item.driftY,
            '--drift-x-alt': item.driftXAlt,
            '--drift-y-alt': item.driftYAlt,
            '--drift-duration': item.driftDuration,
            '--drift-delay': item.driftDelay,
          } as CSSProperties & Record<string, string>;

          return (
            <button
              key={item.id}
              className={`object ${locked ? 'locked' : ''} ${rejected ? 'rejecting' : ''}`}
              style={objectStyle}
              onClick={() => detect(item)}
              aria-label={`${item.label} target`}
            >
              <span className="objectIcon">{item.icon}</span>
              {locked && (
                <>
                  <span className="lockRipple" />
                  <span className="focusReticle">
                    <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
                  </span>
                  <span className="tag">{item.tag}</span>
                </>
              )}
              {rejected && (
                <span key={feedback?.key ?? item.id}>
                  <span className="rejectReticle">
                    <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
                  </span>
                  <span className="tag rejectTag">{item.tag}</span>
                </span>
              )}
            </button>
          );
        })}
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
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const done = index >= sentimentMessages.length;
  const current = sentimentMessages[index];

  useEffect(() => {
    if (!gateOpen || done || !current) {
      setTypedText('');
      setIsTyping(false);
      return;
    }

    setTypedText('');
    setIsTyping(true);

    let nextLength = 0;
    const typingInterval = window.setInterval(() => {
      nextLength += 1;
      setTypedText(current.text.slice(0, nextLength));

      if (nextLength >= current.text.length) {
        window.clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 38);

    return () => window.clearInterval(typingInterval);
  }, [current, done, gateOpen]);

  if (!gateOpen) {
    return <NovaGate lines={['Language Harbor is full of scrambled messages.', 'Tag the feeling in each sentence and train the NLP beacon.']} detail={sectionDetails.nlp} onDone={() => setGateOpen(true)} />;
  }

  function choose(sentiment: Sentiment) {
    if (!current || isTyping) return;
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
            <div className={`chatBubble ${shake ? 'shake' : ''}`}>
              <span className="srOnly">{current.text}</span>
              <span aria-hidden="true">{typedText}</span>
              <span className="typewriterCursor" aria-hidden="true">|</span>
            </div>
            <div className="grid cols3">
              {(['Positive', 'Neutral', 'Negative'] as const).map((sentiment) => (
                <button key={sentiment} style={ghostBtn} onClick={() => choose(sentiment)} disabled={isTyping}>
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
        lines={[regressionBriefing]}
        detail={sectionDetails.regression}
        onDone={() => setGateOpen(true)}
      />
    );
  }

  return (
    <>
      <SectionHeader section="regression" note="Click on the graph to add 6 data points and teach the AI how study hours affect marks." />
      <RegressionLab onComplete={onComplete} />
    </>
  );
}

type Point = { x: number; y: number };
type ClusterGroup = 'animal' | 'fruit' | 'vehicle';
type ClusterStatus = 'playing' | 'success' | 'failure';
type ClusterDot = { id: string; icon: string; label: string; x: number; y: number; group: ClusterGroup };
type ClusterNode = ClusterDot & { radius: number; vx?: number; vy?: number; fx?: number | null; fy?: number | null; index?: number };
type ClusterComponent = { id: number; nodes: ClusterNode[]; pure: boolean; group: ClusterGroup | 'mixed'; color: string };

const CLUSTER_FIELD_WIDTH = 940;
const CLUSTER_FIELD_HEIGHT = 430;
const CLUSTER_NODE_RADIUS = 34;
const CLUSTER_ICON_WIDTH = CLUSTER_NODE_RADIUS * 2;
const CLUSTER_WALL_PADDING = CLUSTER_NODE_RADIUS + 4;
const CLUSTER_SNAP_RADIUS = 156;
const CLUSTER_LINK_DISTANCE = CLUSTER_SNAP_RADIUS;
const CLUSTER_VERIFY_DISTANCE = 120;
const CLUSTER_VERIFY_TOLERANCE = 8;
const CLUSTER_VERIFY_RADIUS = CLUSTER_VERIFY_DISTANCE + CLUSTER_VERIFY_TOLERANCE;
const CLUSTER_MIXED_REPEL_RADIUS = 146;
const CLUSTER_INITIAL_HINT = 'Drag similar items together into groups. Matching items gently pull together; different kinds bounce apart.';
const clusterGroups: ClusterGroup[] = ['animal', 'fruit', 'vehicle'];
const successClusterColors: Record<ClusterGroup, string> = { animal: '#ff6464', fruit: '#5efc82', vehicle: '#4b9bff' };
const clusterLabels: Record<ClusterGroup, string> = { animal: 'Animals', fruit: 'Fruits', vehicle: 'Vehicles' };

const clusteringDots: ClusterDot[] = [
  { id: 'cat', icon: '🐱', label: 'Cat', x: 86, y: 74, group: 'animal' },
  { id: 'dog', icon: '🐶', label: 'Dog', x: 782, y: 106, group: 'animal' },
  { id: 'lion', icon: '🦁', label: 'Lion', x: 418, y: 74, group: 'animal' },
  { id: 'frog', icon: '🐸', label: 'Frog', x: 226, y: 304, group: 'animal' },
  { id: 'apple', icon: '🍎', label: 'Apple', x: 228, y: 112, group: 'fruit' },
  { id: 'banana', icon: '🍌', label: 'Banana', x: 846, y: 320, group: 'fruit' },
  { id: 'grapes', icon: '🍇', label: 'Grapes', x: 520, y: 344, group: 'fruit' },
  { id: 'orange', icon: '🍊', label: 'Orange', x: 646, y: 86, group: 'fruit' },
  { id: 'car', icon: '🚗', label: 'Car', x: 706, y: 222, group: 'vehicle' },
  { id: 'train', icon: '🚆', label: 'Train', x: 354, y: 246, group: 'vehicle' },
  { id: 'rocket', icon: '🚀', label: 'Rocket', x: 112, y: 372, group: 'vehicle' },
  { id: 'plane', icon: '✈️', label: 'Plane', x: 542, y: 178, group: 'vehicle' },
];

const successClusterCenters: Record<ClusterGroup, Point> = {
  animal: { x: 230, y: 222 },
  fruit: { x: 470, y: 222 },
  vehicle: { x: 710, y: 222 },
};

function makeClusterNodes() {
  return clusteringDots.map((dot) => ({ ...dot, radius: CLUSTER_NODE_RADIUS, vx: 0, vy: 0 }));
}

function makeScatteredClusterNodes() {
  const columns = 4;
  const xGap = (CLUSTER_FIELD_WIDTH - CLUSTER_WALL_PADDING * 2) / (columns - 1);
  const yGap = (CLUSTER_FIELD_HEIGHT - CLUSTER_WALL_PADDING * 2) / 2;
  return clusteringDots.map((dot, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const jitterX = (Math.random() - 0.5) * 58;
    const jitterY = (Math.random() - 0.5) * 48;
    return {
      ...dot,
      radius: CLUSTER_NODE_RADIUS,
      x: clamp(CLUSTER_WALL_PADDING + column * xGap + jitterX, CLUSTER_WALL_PADDING, CLUSTER_FIELD_WIDTH - CLUSTER_WALL_PADDING),
      y: clamp(CLUSTER_WALL_PADDING + row * yGap + jitterY, CLUSTER_WALL_PADDING, CLUSTER_FIELD_HEIGHT - CLUSTER_WALL_PADDING),
      vx: 0,
      vy: 0,
      fx: null,
      fy: null,
    };
  });
}

function getClusterComponents(nodes: ClusterNode[], distance = CLUSTER_VERIFY_DISTANCE) {
  const visited = new Set<string>();
  const components: ClusterNode[][] = [];
  nodes.forEach((node) => {
    if (visited.has(node.id)) return;
    const queue = [node];
    const component: ClusterNode[] = [];
    visited.add(node.id);
    while (queue.length) {
      const current = queue.shift()!;
      component.push(current);
      nodes.forEach((candidate) => {
        if (visited.has(candidate.id)) return;
        const dist = Math.hypot((current.x ?? 0) - (candidate.x ?? 0), (current.y ?? 0) - (candidate.y ?? 0));
        if (dist <= distance) {
          visited.add(candidate.id);
          queue.push(candidate);
        }
      });
    }
    components.push(component);
  });
  return components;
}

function decorateClusterComponents(components: ClusterNode[][]): ClusterComponent[] {
  return components
    .filter((component) => component.length > 1)
    .map((nodes, id) => {
      const firstGroup = nodes[0].group;
      const pure = nodes.every((node) => node.group === firstGroup);
      return { id, nodes, pure, group: pure ? firstGroup : 'mixed', color: pure ? successClusterColors[firstGroup] : '#ff4f68' };
    });
}

function getLinkedPairs(nodes: ClusterNode[]) {
  const pairs: { a: ClusterNode; b: ClusterNode }[] = [];
  nodes.forEach((a, index) => {
    nodes.slice(index + 1).forEach((b) => {
      const distance = Math.hypot((a.x ?? 0) - (b.x ?? 0), (a.y ?? 0) - (b.y ?? 0));
      if (a.group === b.group && distance <= CLUSTER_LINK_DISTANCE) pairs.push({ a, b });
    });
  });
  return pairs;
}

function getComponentMistakes(components: ClusterNode[][]) {
  const mistakes = new Set<string>();
  components.forEach((component) => {
    if (component.length <= 1) return;
    const counts = clusterGroups.map((group) => ({ group, count: component.filter((node) => node.group === group).length }));
    const main = counts.reduce((best, current) => (current.count > best.count ? current : best), counts[0]);
    component.filter((node) => node.group !== main.group).forEach((node) => mistakes.add(node.id));
  });
  return mistakes;
}

function cloneClusterSnapshot(nodes: ClusterNode[]) {
  return nodes.map((node) => ({
    ...node,
    x: node.x ?? 0,
    y: node.y ?? 0,
    vx: 0,
    vy: 0,
    fx: null,
    fy: null,
  }));
}

function hasCorrectClusters(components: ClusterNode[][]) {
  const groupedComponents = components.filter((component) => component.length > 1);
  if (groupedComponents.length !== 3) return false;
  const found = new Set<ClusterGroup>();
  return groupedComponents.every((component) => {
    if (component.length !== 4) return false;
    const group = component[0].group;
    const pure = component.every((node) => node.group === group);
    if (pure) found.add(group);
    return pure;
  }) && found.size === 3;
}

function hasCorrectClusterLayout(nodes: ClusterNode[]) {
  const components = getClusterComponents(nodes, CLUSTER_VERIFY_RADIUS);
  if (!hasCorrectClusters(components)) return false;

  return clusterGroups.every((group) => {
    const groupNodes = nodes.filter((node) => node.group === group);
    return groupNodes.length === 4 && groupNodes.every((node) => {
      const nearbySameGroupNodes = groupNodes.filter((candidate) => {
        if (candidate.id === node.id) return false;
        const distance = Math.hypot((node.x ?? 0) - (candidate.x ?? 0), (node.y ?? 0) - (candidate.y ?? 0));
        return distance <= CLUSTER_VERIFY_RADIUS;
      });
      return nearbySameGroupNodes.length > 0;
    });
  });
}

function computeSuccessTargets() {
  const targets: Record<string, Point> = {};
  clusterGroups.forEach((group) => {
    const groupNodes = clusteringDots.filter((dot) => dot.group === group);
    const center = successClusterCenters[group];
    groupNodes.forEach((dot, index) => {
      const angle = (Math.PI * 2 * index) / groupNodes.length - Math.PI / 2;
      const ring = index === 0 ? 0 : CLUSTER_ICON_WIDTH;
      targets[dot.id] = { x: center.x + Math.cos(angle) * ring, y: center.y + Math.sin(angle) * ring };
    });
  });
  return targets;
}

function getSameGroupCluster(nodes: ClusterNode[], rootId: string) {
  const root = nodes.find((node) => node.id === rootId);
  if (!root) return [];
  const visited = new Set<string>([root.id]);
  const queue = [root];
  const cluster: ClusterNode[] = [];
  while (queue.length) {
    const current = queue.shift()!;
    cluster.push(current);
    nodes.forEach((candidate) => {
      if (visited.has(candidate.id) || candidate.group !== root.group) return;
      const distance = Math.hypot((current.x ?? 0) - (candidate.x ?? 0), (current.y ?? 0) - (candidate.y ?? 0));
      if (distance <= CLUSTER_LINK_DISTANCE) {
        visited.add(candidate.id);
        queue.push(candidate);
      }
    });
  }
  return cluster;
}

function clusteringMagnetForce(targetsRef: MutableRefObject<Record<string, Point> | null>) {
  let nodes: ClusterNode[] = [];
  function force(alpha: number) {
    const targets = targetsRef.current;
    nodes.forEach((node, index) => {
      if (!targets) {
        node.vx = (node.vx ?? 0) + Math.sin(Date.now() * 0.0007 + index) * 0.0008;
        node.vy = (node.vy ?? 0) + Math.cos(Date.now() * 0.0006 + index * 1.7) * 0.0008;
      } else {
        const target = targets[node.id];
        if (target) {
          node.vx = (node.vx ?? 0) + (target.x - (node.x ?? 0)) * 0.18 * alpha;
          node.vy = (node.vy ?? 0) + (target.y - (node.y ?? 0)) * 0.18 * alpha;
        }
      }
    });

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = (b.x ?? 0) - (a.x ?? 0);
        const dy = (b.y ?? 0) - (a.y ?? 0);
        const distance = Math.max(1, Math.hypot(dx, dy));
        const nx = dx / distance;
        const ny = dy / distance;
        if (a.group === b.group && distance < CLUSTER_SNAP_RADIUS) {
          const correction = (distance - CLUSTER_ICON_WIDTH) * 0.38 * alpha;
          if (a.fx == null) {
            a.x = (a.x ?? 0) + nx * correction;
            a.y = (a.y ?? 0) + ny * correction;
          }
          if (b.fx == null) {
            b.x = (b.x ?? 0) - nx * correction;
            b.y = (b.y ?? 0) - ny * correction;
          }
          const pull = (distance - CLUSTER_ICON_WIDTH) * 0.22 * alpha;
          a.vx = ((a.vx ?? 0) + nx * pull) * 0.62;
          a.vy = ((a.vy ?? 0) + ny * pull) * 0.62;
          b.vx = ((b.vx ?? 0) - nx * pull) * 0.62;
          b.vy = ((b.vy ?? 0) - ny * pull) * 0.62;
        }
        if (a.group !== b.group && distance < CLUSTER_MIXED_REPEL_RADIUS) {
          const push = (CLUSTER_MIXED_REPEL_RADIUS - distance) * 0.11 * alpha;
          a.vx = (a.vx ?? 0) - nx * push;
          a.vy = (a.vy ?? 0) - ny * push;
          b.vx = (b.vx ?? 0) + nx * push;
          b.vy = (b.vy ?? 0) + ny * push;
        }
      }
    }
  }
  force.initialize = (newNodes: ClusterNode[]) => { nodes = newNodes; };
  return force;
}

function bounceClusterNodeOffWalls(node: ClusterNode) {
  const minX = CLUSTER_WALL_PADDING;
  const maxX = CLUSTER_FIELD_WIDTH - CLUSTER_WALL_PADDING;
  const minY = CLUSTER_WALL_PADDING;
  const maxY = CLUSTER_FIELD_HEIGHT - CLUSTER_WALL_PADDING;
  const bounce = 0.46;

  if ((node.x ?? 0) < minX) {
    node.x = minX;
    node.vx = Math.abs(node.vx ?? 0) * bounce;
  } else if ((node.x ?? 0) > maxX) {
    node.x = maxX;
    node.vx = -Math.abs(node.vx ?? 0) * bounce;
  }

  if ((node.y ?? 0) < minY) {
    node.y = minY;
    node.vy = Math.abs(node.vy ?? 0) * bounce;
  } else if ((node.y ?? 0) > maxY) {
    node.y = maxY;
    node.vy = -Math.abs(node.vy ?? 0) * bounce;
  }
}

function ClusteringSection({ onComplete }: { onComplete: CompleteHandler }) {
  const [gateOpen, setGateOpen] = useState(false);
  const [nodes, setNodes] = useState<ClusterNode[]>(() => makeClusterNodes());
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hint, setHint] = useState(CLUSTER_INITIAL_HINT);
  const [status, setStatus] = useState<ClusterStatus>('playing');
  const [mistakeIds, setMistakeIds] = useState<Set<string>>(new Set());
  const svgRef = useRef<SVGSVGElement | null>(null);
  const nodesRef = useRef<ClusterNode[]>([]);
  const simulationRef = useRef<Simulation<ClusterNode, undefined> | null>(null);
  const targetsRef = useRef<Record<string, Point> | null>(null);
  const dragClusterOffsetsRef = useRef<{ node: ClusterNode; dx: number; dy: number }[]>([]);

  useEffect(() => {
    if (!gateOpen) return;
    const liveNodes = makeClusterNodes();
    nodesRef.current = liveNodes;
    const simulation = forceSimulation<ClusterNode>(liveNodes)
      .alpha(0.92)
      .alphaDecay(0.055)
      .alphaMin(0.004)
      .velocityDecay(0.72)
      .force('charge', forceManyBody<ClusterNode>().strength(-10))
      .force('collide', forceCollide<ClusterNode>().radius((node) => node.radius + 3).strength(1).iterations(8))
      .force('x', forceX<ClusterNode>(CLUSTER_FIELD_WIDTH / 2).strength(0.0008))
      .force('y', forceY<ClusterNode>(CLUSTER_FIELD_HEIGHT / 2).strength(0.0008))
      .force('magnet', clusteringMagnetForce(targetsRef))
      .on('tick', () => {
        liveNodes.forEach(bounceClusterNodeOffWalls);
        setNodes(liveNodes.map((node) => ({ ...node })));
      });
    simulationRef.current = simulation;
    return () => {
      simulation.stop();
    };
  }, [gateOpen]);

  const components = useMemo(() => getClusterComponents(nodes), [nodes]);
  const visibleComponents = useMemo(() => decorateClusterComponents(components), [components]);
  const linkedPairs = useMemo(() => getLinkedPairs(nodes), [nodes]);

  if (!gateOpen) {
    return <NovaGate lines={['The AI Smart Sorter found a messy room.', 'Drag similar items together so natural clusters appear.']} detail={sectionDetails.clustering} onDone={() => setGateOpen(true)} />;
  }

  function getSvgPoint(event: PointerEvent<Element>) {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    return {
      x: clamp(((event.clientX - rect.left) / rect.width) * CLUSTER_FIELD_WIDTH, CLUSTER_WALL_PADDING, CLUSTER_FIELD_WIDTH - CLUSTER_WALL_PADDING),
      y: clamp(((event.clientY - rect.top) / rect.height) * CLUSTER_FIELD_HEIGHT, CLUSTER_WALL_PADDING, CLUSTER_FIELD_HEIGHT - CLUSTER_WALL_PADDING),
    };
  }

  function clearFeedback() {
    if (status !== 'playing') setStatus('playing');
    if (mistakeIds.size) setMistakeIds(new Set());
  }

  function clearValidationState(nextHint = CLUSTER_INITIAL_HINT) {
    setStatus('playing');
    setMistakeIds(new Set());
    setHint(nextHint);
  }

  function handlePointerDown(id: string, event: PointerEvent<SVGGElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    clearFeedback();
    setDraggingId(id);
    const point = getSvgPoint(event);
    const node = nodesRef.current.find((item) => item.id === id);
    if (node && point) {
      const dragCluster = getSameGroupCluster(nodesRef.current, id);
      dragClusterOffsetsRef.current = dragCluster.map((clusterNode) => ({
        node: clusterNode,
        dx: (clusterNode.x ?? point.x) - (node.x ?? point.x),
        dy: (clusterNode.y ?? point.y) - (node.y ?? point.y),
      }));
      dragClusterOffsetsRef.current.forEach(({ node: clusterNode, dx, dy }) => {
        clusterNode.fx = point.x + dx;
        clusterNode.fy = point.y + dy;
        clusterNode.vx = 0;
        clusterNode.vy = 0;
      });
    }
    simulationRef.current?.alphaTarget(0.24).restart();
    playSound('click');
  }

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    if (!draggingId) return;
    const point = getSvgPoint(event);
    const node = nodesRef.current.find((item) => item.id === draggingId);
    if (node && point) {
      dragClusterOffsetsRef.current.forEach(({ node: clusterNode, dx, dy }) => {
        clusterNode.fx = point.x + dx;
        clusterNode.fy = point.y + dy;
        clusterNode.x = point.x + dx;
        clusterNode.y = point.y + dy;
        clusterNode.vx = 0;
        clusterNode.vy = 0;
      });
      simulationRef.current?.alpha(0.34).restart();
    }
  }

  function handlePointerUp(event: PointerEvent<SVGSVGElement>) {
    if (!draggingId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragClusterOffsetsRef.current.forEach(({ node }) => {
      node.fx = null;
      node.fy = null;
      node.vx = 0;
      node.vy = 0;
    });
    dragClusterOffsetsRef.current = [];
    setDraggingId(null);
    simulationRef.current?.alpha(0.24).alphaTarget(0.015).restart();
    playSound('drop');
  }

  function verifyClusters() {
    clearValidationState('');
    const sourceNodes = nodesRef.current.length ? nodesRef.current : nodes;
    const liveNodes = cloneClusterSnapshot(sourceNodes);
    const liveComponents = getClusterComponents(liveNodes, CLUSTER_VERIFY_RADIUS);
    if (hasCorrectClusterLayout(liveNodes)) {
      targetsRef.current = computeSuccessTargets();
      setStatus('success');
      setMistakeIds(new Set());
      setHint('Awesome! You successfully clustered the data!');
      simulationRef.current?.alpha(0.72).alphaTarget(0.08).restart();
      window.setTimeout(() => simulationRef.current?.alphaTarget(0.006), 450);
      playSound('success');
      return;
    }

    const mistakes = getComponentMistakes(liveComponents);
    targetsRef.current = null;
    setStatus('failure');
    setMistakeIds(mistakes.size ? mistakes : new Set([liveNodes[0]?.id].filter(Boolean) as string[]));
    setHint(mistakes.size ? "Oops! Look closely. Something in this cluster doesn't belong here!" : 'Almost. Make exactly three close groups: animals, fruits, and vehicles.');
    simulationRef.current?.alpha(0.42).restart();
    playSound('error');
  }

  function resetField() {
    targetsRef.current = null;
    const fresh = makeScatteredClusterNodes();
    const simulation = simulationRef.current;
    const liveNodes = simulation?.nodes() ?? nodesRef.current;
    liveNodes.forEach((node) => {
      const resetNode = fresh.find((item) => item.id === node.id);
      node.fx = null;
      node.fy = null;
      node.x = resetNode?.x ?? node.x;
      node.y = resetNode?.y ?? node.y;
      node.vx = 0;
      node.vy = 0;
    });
    nodesRef.current = liveNodes;
    dragClusterOffsetsRef.current = [];
    simulation?.nodes(liveNodes).alpha(0.82).alphaTarget(0.015).restart();
    window.setTimeout(() => simulationRef.current?.alphaTarget(0.004), 350);
    setNodes(liveNodes.map((node) => ({ ...node })));
    setDraggingId(null);
    clearValidationState();
  }

  return (
    <div className="clusterShell">
      <div className="clusterMissionText">
        <div className="kicker">Mission: Clustering!</div>
        <h2>The AI needs your help to find patterns.</h2>
        <p>Drag similar items together into groups to form Clusters.</p>
      </div>
      <div className="clusterBoardWrap">
        <ClusterSandboxSvg
          svgRef={svgRef}
          nodes={nodes}
          links={linkedPairs}
          components={visibleComponents}
          status={status}
          mistakeIds={mistakeIds}
          draggingId={draggingId}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
        <div className="clusterControlBar">
          <button style={primaryBtn} onClick={verifyClusters}>Verify Clusters!</button>
          <button style={ghostBtn} onClick={resetField}>Reset</button>
          <span className={`clusterMessage ${status}`}>{hint}</span>
          {status === 'success' && <button style={primaryBtn} onClick={onComplete}>Power Next District</button>}
        </div>
      </div>
    </div>
  );
}

function ClusterSandboxSvg({
  svgRef,
  nodes,
  links,
  components,
  status,
  mistakeIds,
  draggingId,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  svgRef: MutableRefObject<SVGSVGElement | null>;
  nodes: ClusterNode[];
  links: { a: ClusterNode; b: ClusterNode }[];
  components: ClusterComponent[];
  status: ClusterStatus;
  mistakeIds: Set<string>;
  draggingId: string | null;
  onPointerDown: (id: string, event: PointerEvent<SVGGElement>) => void;
  onPointerMove: (event: PointerEvent<SVGSVGElement>) => void;
  onPointerUp: (event: PointerEvent<SVGSVGElement>) => void;
}) {
  return (
    <svg
      ref={svgRef}
      className="clusterBoard"
      viewBox={`0 0 ${CLUSTER_FIELD_WIDTH} ${CLUSTER_FIELD_HEIGHT}`}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="application"
      aria-label="Magnetic clustering sandbox"
    >
      <defs>
        <pattern id="neoClusterGrid" width="38" height="38" patternUnits="userSpaceOnUse">
          <path d="M 38 0 L 0 0 0 38" fill="none" stroke="#d7ecff" strokeWidth="1" opacity=".05" />
        </pattern>
        <filter id="clusterGlow" x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width={CLUSTER_FIELD_WIDTH} height={CLUSTER_FIELD_HEIGHT} fill="url(#neoClusterGrid)" />
      {status === 'success' && components.filter((component) => component.pure).map((component) => {
        const points = component.nodes.map((node) => ({ x: node.x ?? 0, y: node.y ?? 0 }));
        const minX = Math.min(...points.map((point) => point.x)) - 54;
        const maxX = Math.max(...points.map((point) => point.x)) + 54;
        const minY = Math.min(...points.map((point) => point.y)) - 50;
        const maxY = Math.max(...points.map((point) => point.y)) + 50;
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;
        const rx = Math.max(58, (maxX - minX) / 2);
        const ry = Math.max(54, (maxY - minY) / 2);
        return (
          <g key={component.id} filter={component.pure ? 'url(#clusterGlow)' : undefined}>
            <ellipse
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill={component.color}
              fillOpacity=".16"
              stroke={component.color}
              strokeWidth="4"
              className="clusterPulseBoundary"
            />
            <text x={cx} y={cy + ry + 24} textAnchor="middle" fill={component.color} fontSize="15" fontWeight="900">
              {clusterLabels[component.group as ClusterGroup]}
            </text>
          </g>
        );
      })}
      {links.map(({ a, b }) => (
        <line
          key={`${a.id}-${b.id}`}
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke={successClusterColors[a.group]}
          strokeWidth="3"
          strokeLinecap="round"
          strokeOpacity=".72"
        />
      ))}
      {nodes.map((node) => {
        const isMistake = mistakeIds.has(node.id);
        const x = node.x ?? 0;
        const y = node.y ?? 0;
        const tooltipX = clamp(x + 44, 12, CLUSTER_FIELD_WIDTH - 310);
        const tooltipY = clamp(y - 55, 14, CLUSTER_FIELD_HEIGHT - 48);
        return (
          <g
            key={node.id}
            className={`clusterNode ${draggingId === node.id ? 'dragging' : ''} ${isMistake ? 'clusterMistake' : ''}`}
            transform={`translate(${x} ${y})`}
            onPointerDown={(event) => onPointerDown(node.id, event)}
            aria-label={`${node.label}, ${clusterLabels[node.group]}`}
            style={{ cursor: draggingId === node.id ? 'grabbing' : 'grab' }}
          >
            <circle r="35" fill="rgba(10, 24, 44, .9)" stroke={isMistake ? '#ff4f68' : successClusterColors[node.group]} strokeWidth="3" />
            <circle r="43" fill="none" stroke={isMistake ? '#ff4f68' : successClusterColors[node.group]} strokeOpacity=".18" strokeWidth="8" />
            <text y="16" textAnchor="middle" fontSize="44">{node.icon}</text>
            {isMistake && (
              <g transform={`translate(${tooltipX - x} ${tooltipY - y})`}>
                <rect width="298" height="38" rx="9" fill="rgba(24, 8, 18, .96)" stroke="#ff4f68" />
                <text x="149" y="24" textAnchor="middle" fontSize="13" fontWeight="900" fill="#ffd7de">
                  Oops! Look closely. Something doesn't belong here!
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
function LegacyClusteringSection({ onComplete }: { onComplete: CompleteHandler }) {
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
      <div className="grid cols2" style={{ display: 'none' }} aria-hidden="true">
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
      {false && correct && checked && (
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
  const [selected, setSelected] = useState<WorkflowStep | null>(null);
  const [dragging, setDragging] = useState<WorkflowStep | null>(null);
  const [hoveredDock, setHoveredDock] = useState<number | null>(null);
  const [slots, setSlots] = useState<(WorkflowStep | null)[]>([null, null, null, null, null]);
  const [result, setResult] = useState<MachineResult>('idle');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [jamIndex, setJamIndex] = useState<number | null>(null);
  const learningHint = "Hint: An AI can't learn until it has information. What should come first?";
  const [hint, setHint] = useState(learningHint);

  if (!gateOpen) {
    return <NovaGate lines={['The pipeline machine is out of order.', 'Place the steps in sequence so energy can flow.']} detail={sectionDetails.aiWorkflow} onDone={() => setGateOpen(true)} />;
  }

  const correct = slots.every((step, index) => step === workflowSteps[index]);
  const pool = [...workflowSteps].filter((step) => !slots.includes(step));
  const machineLocked = result === 'running';

  function placeStep(slot: number, step: WorkflowStep | null) {
    if (!step || machineLocked) {
      if (!step) setHint(learningHint);
      return;
    }
    playSound('drop');
    setSlots((prev) => prev.map((value, index) => {
      if (value === step) return null;
      if (index === slot) return step;
      return value;
    }));
    setSelected(null);
    setDragging(null);
    setHoveredDock(null);
    setResult('idle');
    setActiveIndex(null);
    setJamIndex(null);
    setHint(learningHint);
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>, slot: number) {
    event.preventDefault();
    const dropped = event.dataTransfer.getData('text/workflow-step') as WorkflowStep;
    placeStep(slot, dropped || dragging);
  }

  function getJamMessage(index: number) {
    const step = slots[index];
    const expected = workflowSteps[index];
    if (!step) return `Error! Dock ${index + 1} is empty, so the energy pulse has nowhere to go.`;
    if (step === '🧹 Clean & Prepare Data' && !slots.slice(0, index).includes('📥 Collect Data')) {
      return "Error! You can't clean data if you haven't collected it yet! Check your sequence.";
    }
    if (step === '🏋️ Train the Model' && !slots.slice(0, index).includes('🧹 Clean & Prepare Data')) {
      return 'Error! Training needs prepared data first. Clean the data before the model learns from it.';
    }
    if (step === '🧪 Test & Evaluate' && !slots.slice(0, index).includes('🏋️ Train the Model')) {
      return "Error! You can't test a model before it has been trained.";
    }
    if (index === 0 && step !== '🎯 Define the Problem') {
      return 'Error! The machine needs a goal first. Define the problem before any data work begins.';
    }
    return `Error! Dock ${index + 1} expected ${workflowCartridgeMeta[expected].title}, but found ${workflowCartridgeMeta[step].title}. Check your sequence.`;
  }

  function activate() {
    if (machineLocked) return;
    const wrongIndex = slots.findIndex((step, index) => step !== workflowSteps[index]);
    setResult('running');
    setJamIndex(null);
    setActiveIndex(null);
    setHint('Checking the order...');
    playSound('power');

    const stopAt = wrongIndex === -1 ? workflowSteps.length - 1 : wrongIndex;
    for (let index = 0; index <= stopAt; index += 1) {
      window.setTimeout(() => {
        setActiveIndex(index);
        playSound(index === wrongIndex ? 'error' : 'power');
      }, 260 + index * 560);
    }

    window.setTimeout(() => {
      if (wrongIndex === -1) {
        setResult('success');
        setActiveIndex(null);
        setHint('Correct! An AI starts with a problem, learns from data, and then gets tested.');
        playSound('success');
      } else {
        setResult('failure');
        setJamIndex(wrongIndex);
        setHint(getJamMessage(wrongIndex));
      }
    }, 260 + stopAt * 560 + 420);
  }

  return (
    <>
      <SectionHeader section="aiWorkflow" note="How does an AI learn? Assemble the steps in the exact order an AI uses to solve a problem." />
      <div className="pipelineShell">
        <div className="pipelineBlueprint" aria-label="Pipeline docks">
          <div className={`machineRail ${result === 'success' ? 'online' : ''}`}>
            <AnimatePresence>
              {activeIndex !== null && (
                <motion.div
                  className="energyPulse"
                  initial={{ top: '7%', opacity: 0, scaleY: 0.35, x: '-50%', y: '-50%' }}
                  animate={{ top: `${8 + activeIndex * 21}%`, opacity: 1, scaleY: [0.8, 1.15, 1], x: '-50%', y: '-50%' }}
                  exit={{ opacity: 0, scaleY: 0.35 }}
                  transition={{ duration: 0.38, ease: 'easeOut' }}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="pipelineDocks">
            {slots.map((slot, index) => {
              const isCheckpoint = activeIndex === index;
              const isJammed = jamIndex === index && result === 'failure';
              const isOnline = result === 'success' && correct;
              return (
                <motion.button
                  key={index}
                  type="button"
                  className={`pipelineDock ${hoveredDock === index ? 'ready' : ''} ${isCheckpoint ? 'checkpoint' : ''} ${isJammed ? 'jammed' : ''} ${isOnline ? 'online' : ''}`}
                  onDragOver={(event) => { event.preventDefault(); setHoveredDock(index); }}
                  onDragLeave={() => setHoveredDock(null)}
                  onDrop={(event) => handleDrop(event, index)}
                  onClick={() => placeStep(index, selected)}
                  animate={isJammed ? { x: [0, -12, 11, -8, 7, 0] } : { x: 0 }}
                  transition={{ duration: 0.42 }}
                >
                  <span className="dockNumber">{index + 1}</span>
                  <AnimatePresence mode="wait">
                    {slot ? (
                      <WorkflowCartridge key={slot} step={slot} docked lit={isCheckpoint || isOnline} />
                    ) : (
                      <motion.span key="empty" className="dockEmpty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        Empty Socket
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isJammed && <SparkField />}
                </motion.button>
              );
            })}
            <AnimatePresence>
              {jamIndex !== null && result === 'failure' && (
                <motion.div
                  className="jamTooltip"
                  style={{ top: `${Math.max(2, 5 + jamIndex * 20)}%` }}
                  initial={{ opacity: 0, x: 18, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 18 }}
                >
                  {hint}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <aside className="cartridgeBay" aria-label="AI learning steps">
          <div>
            <div className="kicker">Available Steps</div>
            <h3>AI Learning Steps</h3>
          </div>
          <motion.div className="cartridgeRack" layout>
            <AnimatePresence>
              {pool.map((step) => (
                <WorkflowCartridge
                  key={step}
                  step={step}
                  selected={selected === step}
                  dragging={dragging === step}
                  onClick={() => {
                    if (machineLocked) return;
                    setSelected(step);
                    playSound('click');
                  }}
                  onNativeDragStart={(event) => {
                    if (machineLocked) return;
                    setDragging(step);
                    event.dataTransfer.setData('text/workflow-step', step);
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragEnd={() => {
                    setDragging(null);
                    setHoveredDock(null);
                  }}
                />
              ))}
            </AnimatePresence>
          </motion.div>
          <div className="machineControls">
            <button className="machineButton" disabled={machineLocked || slots.some((slot) => !slot)} onClick={activate}>
              {machineLocked ? 'Checking...' : 'Activate Machine'}
            </button>
            <div className="machineStatus" role="status">{hint}</div>
            <AnimatePresence>
              {result === 'success' && (
                <motion.div className="successPanel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <span>Correct! The AI workflow is in the right order.</span>
                  <button className="machineButton" onClick={onComplete}>Power Final District</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </div>
    </>
  );
}

function WorkflowCartridge({
  step,
  selected = false,
  dragging = false,
  docked = false,
  lit = false,
  onClick,
  onNativeDragStart,
  onDragEnd,
}: {
  step: WorkflowStep;
  selected?: boolean;
  dragging?: boolean;
  docked?: boolean;
  lit?: boolean;
  onClick?: () => void;
  onNativeDragStart?: (event: DragEvent<HTMLButtonElement>) => void;
  onDragEnd?: () => void;
}) {
  const meta = workflowCartridgeMeta[step];
  return (
    <motion.button
      type="button"
      layout
      draggable={!docked}
      className={`cartridge ${selected ? 'selected' : ''} ${dragging ? 'dragging' : ''} ${lit ? 'lit' : ''}`}
      onClick={onClick}
      onDragStartCapture={onNativeDragStart}
      onDragEnd={onDragEnd}
      initial={{ opacity: 0, scale: 0.92, y: docked ? 0 : 12 }}
      animate={{
        opacity: 1,
        scale: lit ? [1, 1.055, 1] : 1,
        y: 0,
        borderColor: lit ? 'rgba(117,214,255,.95)' : undefined,
        backgroundColor: lit ? '#1f78c8' : undefined,
      }}
      exit={{ opacity: 0, scale: 0.9, y: 8 }}
      transition={{ type: 'spring', stiffness: 520, damping: 34 }}
    >
      <span className="cartridgeIcon">{meta.icon}</span>
      <span className="cartridgeText">
        <strong>{meta.title}</strong>
      </span>
    </motion.button>
  );
}

function SparkField() {
  return (
    <span className="sparkField" aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => (
        <i
          key={index}
          style={{
            '--spark-rotate': `${index * 45}deg`,
            '--spark-distance': `${26 + (index % 3) * 12}px`,
            animationDelay: `${index * 0.025}s`,
          } as CSSProperties}
        />
      ))}
    </span>
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

