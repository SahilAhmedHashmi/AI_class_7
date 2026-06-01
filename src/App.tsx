import { useEffect, useMemo, useRef, useState } from 'react';
import {
  aiDomainPrompts,
  aiExamples,
  classificationCards,
  clusteringItems,
  dataScienceCards,
  datasetTypes,
  finalMissionTasks,
  languagePairs,
  predictionHistory,
  sections,
  structureExamples,
  trainingCards,
  workflowSteps,
  SectionKey,
} from './data/content';
import { playSound } from './utils/sound';
import { TopBar } from './components/TopBar';
import { MissionMap } from './components/MissionMap';
import { AchievementToast } from './components/AchievementToast';
import { VictoryScreen } from './components/VictoryScreen';
import { CityBackground } from './components/CityBackground';
import { BossBattle } from './components/BossBattle';
import { ChatGuide } from './components/ChatGuide';
import { Notebook } from './components/Notebook';

// ─── Nova Gate & hook ───────────────────────────────────────────────
function useNovaGate(initial = false) {
  const [gateOpen, setGateOpen] = useState(initial);
  return { gateOpen, setGateOpen };
}

type NovaGateProps = {
  lines: string[];
  onDone: () => void;
};

function NovaGate({ lines, onDone }: NovaGateProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (lineIndex >= lines.length) {
      setDone(true);
      return;
    }
    const line = lines[lineIndex];
    let i = 0;
    setDisplayed('');
    const t = window.setInterval(() => {
      setDisplayed((p) => p + line[i]);
      i++;
      if (i >= line.length) {
        clearInterval(t);
        setTimeout(() => setLineIndex((prev) => prev + 1), 700);
      }
    }, 28);
    return () => clearInterval(t);
  }, [lineIndex, lines]);

  return (
    <div className="nova-gate card">
      <div className="nova-avatar">🚀</div>
      <div className="nova-bubble">
        <span className="nova-name">Captain Nova</span>
        <p className="nova-text">{displayed}<span className="cursor">▌</span></p>
      </div>
      {done && (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="button-primary nova-go" onClick={onDone}>Let's Go →</button>
        </div>
      )}
    </div>
  );
}

function InsightCard({ hours, sleep, predicted, locked }: { hours: number; sleep: number; predicted: number; locked: boolean }) {
  const [open, setOpen] = useState(false);
  const baselineHours = 3;
  const baselineSleep = 4;
  const baseline = 30 + baselineHours * 4 + baselineSleep * 2;
  const diff = predicted - baseline;

  const summary = `${predicted} marks — ${diff >= 0 ? `+${diff}` : diff} vs baseline`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontWeight: 600 }}>{summary}</div>
      <div className="small-note">Model note: each extra study hour ≈ +4 marks; each extra sleep day ≈ +2 marks.</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
        <button className="small-button" onClick={() => { setOpen((o) => !o); playSound('click'); }}>{open ? 'Hide' : 'Explain'}</button>
        <button className="small-button" onClick={() => { navigator.clipboard?.writeText(`${predicted} marks`); playSound('power'); }}>Copy</button>
      </div>
      {open && (
        <div style={{ marginTop: 8, background: 'rgba(10,20,40,0.35)', padding: 10, borderRadius: 8 }}>
          <div className="small-note">Explanation:</div>
          <div style={{ fontSize: '0.9rem', marginTop: 6 }}>
            The simple linear model estimates marks by adding a base score and linear contributions from `hours` and `sleep`. Increasing study hours by 1 adds about 4 marks, while one extra good sleep day adds about 2 marks.
          </div>
        </div>
      )}
    </div>
  );
}

type DomainState = Record<string, string[]>;

type PlacementMap = Record<string, string>;

const order = sections.map((section) => section.key);

function useCountUp(target: number, duration = 500) {
  const [display, setDisplay] = useState(target);
  const previous = useRef(target);

  useEffect(() => {
    const start = previous.current;
    const change = target - start;
    if (change === 0) {
      setDisplay(target);
      return;
    }
    const startTime = performance.now();
    let frame = 0;

    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      setDisplay(Math.round(start + change * progress));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        previous.current = target;
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return display;
}

function App() {
  const [currentSection, setCurrentSection] = useState<SectionKey>('landing');
  const [completed, setCompleted] = useState<SectionKey[]>(['landing']);
  const [xp, setXp] = useState(150);
  const [achievement, setAchievement] = useState('Explorer Initiate');
  const [recentBadge, setRecentBadge] = useState<string | null>(null);
  const [showBadge, setShowBadge] = useState(false);
  const [finished, setFinished] = useState(false);
  const [xpBurst, setXpBurst] = useState(false);
  const [xpGain, setXpGain] = useState(0);
  const animatedXp = useCountUp(xp);

  const currentIndex = order.indexOf(currentSection);
  const progress = ((currentIndex + 1) / order.length) * 100;

  const section = useMemo(
    () => sections.find((item) => item.key === currentSection) ?? sections[0],
    [currentSection]
  );

  useEffect(() => {
    if (!showBadge) return;
    const timeout = window.setTimeout(() => setShowBadge(false), 2400);
    return () => window.clearTimeout(timeout);
  }, [showBadge]);

  const completeSection = (section: SectionKey, bonus = 30) => {
    if (!completed.includes(section)) {
      const badge = sections.find((item) => item.key === section)?.badge ?? achievement;
      setCompleted((prev) => [...prev, section]);
      setXp((prev) => prev + bonus);
      setXpGain(bonus);
      setXpBurst(true);
      setTimeout(() => setXpBurst(false), 900);
      setAchievement(badge);
      setRecentBadge(badge);
      setShowBadge(true);
    }
    if (section === 'finalMission') {
      setFinished(true);
      return;
    }
    const nextIndex = order.indexOf(section) + 1;
    const next = nextIndex < order.length ? order[nextIndex] : section;
    if (next !== section) setCurrentSection(next);
  };

  return (
    <div className="app-shell">
      <CityBackground />
      <aside className="card glow-card sidebar-panel">
        <TopBar
          xp={animatedXp}
          level={Math.floor(xp / 100) + 1}
          progress={progress}
          completed={completed.length}
          total={order.length}
          title={section.title}
          subtitle={section.subtitle}
        />
        <MissionMap
          sections={sections}
          completed={completed}
          currentSection={currentSection}
          onSelect={(key) => { if (!finished) setCurrentSection(key); }}
        />
        <div className="card-grid" style={{ marginTop: 24 }}>
          <div className="card">
            <p className="metric-label">Achievement</p>
            <h3 className="h2">{achievement}</h3>
          </div>
          <div className="card">
            <p className="metric-label">Progress</p>
            <div className="progress-pill" style={{ width: '100%', justifyContent: 'space-between' }}>
              <span>{Math.round(progress)}%</span>
              <span>{completed.length}/{order.length}</span>
            </div>
          </div>
        </div>
        <Notebook completed={completed} sections={sections} />
      </aside>

      <main className="main-content">
        {showBadge && recentBadge && <AchievementToast badge={recentBadge} />}
        {xpBurst && <div className="xp-float">+{xpGain} XP</div>}
        {finished ? (
          <VictoryScreen xp={xp} onRestart={() => {
            setCurrentSection('landing');
            setCompleted(['landing']);
            setFinished(false);
            setXp(150);
            setAchievement('Explorer Initiate');
          }} />
        ) : currentSection === 'landing' ? (
          <LandingScreen onStart={() => setCurrentSection('whatIsAI')} xp={xp} />
        ) : (
          <SectionScreen
            key={currentSection}
            section={section.key}
            onComplete={completeSection}
          />
        )}
      </main>
      <div className="mobile-status-bar">
        <div>
          <p>XP</p>
          <strong>{animatedXp}</strong>
        </div>
        <div>
          <p>Mission</p>
          <strong>{section.subtitle}</strong>
        </div>
        <div>
          <p>Progress</p>
          <strong>{Math.round(progress)}%</strong>
        </div>
      </div>
    </div>
  );
}

function LandingScreen({ onStart, xp }: { onStart: () => void; xp: number }) {
  const lines = [
    'Junior Explorer, this is Captain Nova.',
    'The city is dimming and only your AI instincts can reboot our systems.',
    'Follow me through each district and restore NeoCity’s intelligence.'
  ];
  const [currentLine, setCurrentLine] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (currentLine >= lines.length) {
      setReady(true);
      return;
    }
    const line = lines[currentLine];
    let index = 0;
    const interval = window.setInterval(() => {
      setDisplayText((prev) => prev + line[index]);
      index += 1;
      if (index >= line.length) {
        window.clearInterval(interval);
        setTimeout(() => {
          if (currentLine < lines.length - 1) {
            setDisplayText('');
            setCurrentLine(currentLine + 1);
          } else {
            setReady(true);
          }
        }, 600);
      }
    }, 30);

    return () => window.clearInterval(interval);
  }, [currentLine]);

  return (
    <section className="card hero-panel">
      <div className="section-header">
        <p className="metric-label">Incoming transmission</p>
        <h1 className="h1">NeoCity’s central AI has faltered.</h1>
        <p className="p-muted">{displayText || 'Captain Nova is connecting...'}</p>
      </div>
      <ChatGuide section="landing" />
      <div className="floating-badge">
        <p className="small-note">Current XP</p>
        <strong>{xp}</strong>
      </div>
      <div style={{ display: 'grid', gap: 18, marginTop: 24 }}>
        <div className="card" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <h3 className="h2">NeoCity Mission</h3>
          <p className="small-note">Each district holds a challenge. Complete them to reconnect the AI core.</p>
        </div>
        <button className="button-primary" onClick={onStart} disabled={!ready}>
          {ready ? 'Start the Adventure' : 'Waiting for Nova...'}
        </button>
      </div>
      <div className="hero-decor"></div>
    </section>
  );
}

function ReviewPanel({ description, realWorld, onAdvance, ready }: { description: string; realWorld: string; onAdvance: () => void; ready: boolean }) {
  if (!ready) return null;
  return (
    <div className="card concept-review">
      <p className="metric-label">Concept unlocked</p>
      <h3 className="h2">What you just learned</h3>
      <p className="p-muted">{description}</p>
      <p className="small-note">Real-world connection: {realWorld}</p>
      <button className="button-primary" onClick={onAdvance}>Proceed to next district</button>
    </div>
  );
}

function SectionScreen({ section, onComplete }: { section: SectionKey; onComplete: (key: SectionKey) => void }) {
  return (
    <div className="section-wrapper">
      {renderSection(section, onComplete)}
    </div>
  );
}

function renderSection(section: SectionKey, onComplete: (key: SectionKey) => void) {
  switch (section) {
    case 'whatIsAI':
      return <WhatIsAISection onComplete={() => onComplete('whatIsAI')} />;
    case 'aiDomains':
      return <AiDomainsSection onComplete={() => onComplete('aiDomains')} />;
    case 'dataScience':
      return <DataScienceSection onComplete={() => onComplete('dataScience')} />;
    case 'computerVision':
      return <ComputerVisionSection onComplete={() => onComplete('computerVision')} />;
    case 'languageHarbor':
      return <LanguageHarborSection onComplete={() => onComplete('languageHarbor')} />;
    case 'predictionLab':
      return <PredictionLabSection onComplete={() => onComplete('predictionLab')} />;
    case 'classificationFactory':
      return <ClassificationFactorySection onComplete={() => onComplete('classificationFactory')} />;
    case 'regressionObservatory':
      return <RegressionObservatorySection onComplete={() => onComplete('regressionObservatory')} />;
    case 'clusteringForest':
      return <ClusteringForestSection onComplete={() => onComplete('clusteringForest')} />;
    case 'datasetVault':
      return <DatasetVaultSection onComplete={() => onComplete('datasetVault')} />;
    case 'dataTypeSort':
      return <DataTypeSortSection onComplete={() => onComplete('dataTypeSort')} />;
    case 'trainingArena':
      return <TrainingArenaSection onComplete={() => onComplete('trainingArena')} />;
    case 'workflowMachine':
      return <WorkflowMachineSection onComplete={() => onComplete('workflowMachine')} />;
    case 'finalMission':
      return <FinalMissionSection onComplete={() => onComplete('finalMission')} />;
    default:
      return <div>Section unavailable.</div>;
  }
}

function WhatIsAISection({ onComplete }: { onComplete: () => void }) {
  const sectionData = sections.find((item) => item.key === 'whatIsAI')!;
  const [gateOpen, setGateOpen] = useState(false);

  const devices = [
    { id: 'siri', icon: '🎙️', label: 'Siri', group: 'AI', hint: 'Siri learns your voice and adapts.' },
    { id: 'chess', icon: '♟️', label: 'Chess Robot', group: 'AI', hint: 'A chess robot can learn strategies from games.' },
    { id: 'calc', icon: '🔢', label: 'Calculator', group: 'Not AI', hint: 'A calculator always follows fixed rules.' },
    { id: 'spam', icon: '📧', label: 'Spam Filter', group: 'AI', hint: 'Spam filters learn from examples of spam.' },
    { id: 'therm', icon: '🌡️', label: 'Thermostat', group: 'Not AI', hint: 'A simple thermostat may follow set rules.' },
    { id: 'trans', icon: '🌐', label: 'Translator App', group: 'AI', hint: 'Translators improve with more language data.' },
  ];

  const [selected, setSelected] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [statusMsg, setStatusMsg] = useState('Tap a device, then tap a zone.');
  const [itemState, setItemState] = useState<Record<string, 'idle' | 'correct' | 'error'>>({});
  const [lastHint, setLastHint] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const total = devices.length;
  const correctCount = devices.filter((d) => placed[d.label] === d.group).length;
  const completed = correctCount === total;

  const handleSelect = (label: string) => {
    if (placed[label]) return;
    setSelected(label);
    setStatusMsg('Now tap a zone to place the device.');
    playSound('click');
  };

  const handlePlace = (zone: string) => {
    if (!selected) return;
    const device = devices.find((d) => d.label === selected)!;
    setSelected(null);
    if (device.group === zone) {
      setPlaced((p) => ({ ...p, [device.label]: zone }));
      setItemState((s) => ({ ...s, [device.label]: 'correct' }));
      setLastHint(device.hint);
      playSound('drop');
      setTimeout(() => setItemState((s) => ({ ...s, [device.label]: 'idle' })), 700);
      setTimeout(() => setLastHint(null), 1600);
      if (correctCount + 1 === total) {
        setTimeout(() => {
          setStatusMsg('SCAN COMPLETE ⚡');
          playSound('success');
        }, 400);
      }
    } else {
      setItemState((s) => ({ ...s, [device.label]: 'error' }));
      const hint = device.label === 'Calculator' ? 'Hmm! A calculator always does 2+2=4. It never learns. Try again!' : `Hmm! ${device.label} is not a learning system.`;
      setStatusMsg(hint);
      playSound('error');
      setTimeout(() => {
        setItemState((s) => ({ ...s, [device.label]: 'idle' }));
        setStatusMsg('Tap a device, then tap a zone.');
      }, 800);
    }
  };

  const handleSubmit = () => {
    if (completed) {
      if (reviewOpen) {
        onComplete();
        return;
      }
      setReviewOpen(true);
    } else {
      setStatusMsg('Some devices are still unsorted. Keep going!');
      playSound('error');
    }
  };

  if (!gateOpen) return (
    <NovaGate
      lines={[
        'Welcome to NeoCity! Something strange is happening — machines are everywhere but only SOME of them are truly intelligent.',
        'Your first mission: can you figure out which ones have a BRAIN... and which ones are just following boring old instructions?',
        'Tap each device below and sort it. AI learns from data — non-AI just follows rules.',
      ]}
      onDone={() => setGateOpen(true)}
    />
  );
  return (
    <div className="task-grid">
      <div className="card">
        <p className="metric-label">Devices</p>
        <div className="grid-2">
          {devices.map((d) => {
            const isSelected = selected === d.label;
            const state = itemState[d.label] || 'idle';
            const placedHere = placed[d.label];
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => handleSelect(d.label)}
                className={`device-card small-button ${isSelected ? 'card-selected' : ''} ${state === 'correct' ? 'card-correct' : ''} ${state === 'error' ? 'card-error' : ''}`}
                disabled={!!placedHere}
              >
                <div style={{ fontSize: '1.8rem' }}>{d.icon}</div>
                <div style={{ marginTop: 6 }}>{d.label}</div>
                <div style={{ marginTop: 6 }}>{placedHere ? '✅' : ''}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card">
        <p className="metric-label">Zones</p>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <div className={`drop-zone-big zone-ai ${selected ? 'zone-active' : ''}`} onClick={() => handlePlace('AI')}>
            <h3 className="h2">🧠 Has a Brain (AI)</h3>
            <p className="small-note">{Object.entries(placed).filter(([, v]) => v === 'AI').map(([k]) => k).join(', ') || 'Empty'}</p>
          </div>

          <div className={`drop-zone-big zone-notai ${selected ? 'zone-active' : ''}`} onClick={() => handlePlace('Not AI')}>
            <h3 className="h2">⚙️ Just Rules (Not AI)</h3>
            <p className="small-note">{Object.entries(placed).filter(([, v]) => v === 'Not AI').map(([k]) => k).join(', ') || 'Empty'}</p>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="small-note">{correctCount} / {total} correctly sorted</div>
          <div className="core-meter" aria-hidden>
            <div className="core-fill" style={{ width: `${(correctCount / total) * 100}%` }} />
          </div>
          {lastHint && <div className="nova-hint">{lastHint}</div>}
        </div>
      </div>

      <div className="card">
        <p className={`status-chip ${completed ? 'success-state' : ''}`}>{completed ? 'SCAN COMPLETE ⚡' : statusMsg}</p>
        {completed ? (
          <button className="button-primary button-ready" onClick={handleSubmit}>{reviewOpen ? 'Proceed to next district' : 'Complete Mission'}</button>
        ) : (
          <button className="button-primary" onClick={() => playSound('click')}>Complete Mission</button>
        )}
      </div>

      <ReviewPanel
        description={sectionData.description}
        realWorld={sectionData.realWorld}
        onAdvance={onComplete}
        ready={reviewOpen}
      />
    </div>
  );
}

function AiDomainsSection({ onComplete }: { onComplete: () => void }) {
  const sectionData = sections.find((item) => item.key === 'aiDomains')!;
  const [gateOpen, setGateOpen] = useState(false);
  const towers = [
    { id: 'cv', name: 'Computer Vision', icon: '📷' },
    { id: 'nlp', name: 'NLP', icon: '🗣️' },
    { id: 'robot', name: 'Robotics', icon: '🤖' },
    { id: 'ds', name: 'Data Science', icon: '📊' },
    { id: 'ml', name: 'Machine Learning', icon: '🧠' },
  ];

  const scenarios = [
    { text: 'A traffic camera detects a broken traffic light and reports it automatically.', correct: 'Computer Vision' },
    { text: "A chatbot reads your complaint email and replies in your language.", correct: 'NLP' },
    { text: 'A drone robot delivers medicine to a hospital roof.', correct: 'Robotics' },
    { text: "The city's data team finds which district uses the most power each month.", correct: 'Data Science' },
    { text: "NeoCity's music app learns which songs you skip and stops suggesting them.", correct: 'Machine Learning' },
  ];

  const [index, setIndex] = useState(0);
  const [unlocked, setUnlocked] = useState<Record<string, boolean>>({});
  const [shaking, setShaking] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const current = scenarios[index];

  const handleTowerTap = (name: string) => {
    if (!current) return;
    if (name === current.correct) {
      setUnlocked((s) => ({ ...s, [name]: true }));
      playSound('drop');
      setTimeout(() => {
        const next = index + 1;
        if (next >= scenarios.length) {
          setReviewOpen(true);
        } else {
          setIndex(next);
        }
      }, 420);
    } else {
      setShaking(name);
      playSound('error');
      setTimeout(() => setShaking(null), 600);
    }
  };

  if (!gateOpen) return (
    <NovaGate
      lines={[
        'NeoCity has five AI Towers, each one specialising in a different superpower.',
        "I'll describe a situation happening in the city RIGHT NOW. You tap the tower whose AI is handling it.",
        'Get them all right and the towers light up. Ready?',
      ]}
      onDone={() => setGateOpen(true)}
    />
  );
  return (
    <div className="task-grid">
      <div className="card scenario-card">
        <p className="metric-label">Scenario</p>
        <h3 className="h2">{current?.text}</h3>
        <div className="small-note">Tower {Math.min(index + 1, scenarios.length)} of {scenarios.length}</div>
      </div>

      <div className="grid-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {towers.map((t) => {
          const open = !!unlocked[t.name];
          const isShaking = shaking === t.name;
          return (
            <button
              key={t.id}
              type="button"
              className={`card door-card ${open ? 'door-open' : ''} ${isShaking ? 'shake' : ''}`}
              onClick={() => handleTowerTap(t.name)}
            >
              <div style={{ fontSize: '1.8rem' }}>{t.icon}</div>
              <div>
                <div className="h2">{t.name}</div>
                <div className="small-note">{open ? 'Online ✅' : 'Locked 🔒'}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="card">
        <p className="status-chip">Tap the tower that fits the scenario.</p>
        <button className="button-primary" onClick={() => { if (reviewOpen) { onComplete(); } else { playSound('click'); } }}>{reviewOpen ? 'Proceed to next district' : 'Keep going'}</button>
      </div>

      <ReviewPanel
        description={sectionData.description}
        realWorld={sectionData.realWorld}
        onAdvance={onComplete}
        ready={reviewOpen}
      />
    </div>
  );
}

function DataScienceSection({ onComplete }: { onComplete: () => void }) {
  const sectionData = sections.find((item) => item.key === 'dataScience')!;
  const [gateOpen, setGateOpen] = useState(false);
  const [placed, setPlaced] = useState<PlacementMap>({});
  const [status, setStatus] = useState('Group related data to reveal patterns.');
  const [selected, setSelected] = useState<string | null>(null);
  const [patternVisible, setPatternVisible] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const categories = ['marks', 'weather', 'sports'] as const;
  const categoryEmojis = { marks: '📝', weather: '🌦️', sports: '🏅' };
  const categoryHints = {
    marks: 'School test scores and grades',
    weather: 'Temperature, rainfall, wind data',
    sports: 'Game stats and athletic records',
  };

  const handleDrop = (group: string) => {
    if (!selected) return;
    const item = dataScienceCards.find((card) => card.label === selected);
    if (item) {
      setPlaced((prev) => ({ ...prev, [selected]: group }));
      playSound('drop');
    }
    setSelected(null);
  };

  const handleSelect = (label: string) => {
    setSelected(label);
    playSound('click');
  };

  const correct = dataScienceCards.every((card) => placed[card.label] === card.type);
  const completed = Object.keys(placed).length === dataScienceCards.length && correct;

  if (!gateOpen) return (
    <NovaGate
      lines={[
        "The city's data centre is overflowing with messy, unsorted information!",
        'Data scientists group similar data together so patterns can emerge.',
        'Sort these data items into the right buckets — and watch what patterns appear.',
      ]}
      onDone={() => setGateOpen(true)}
    />
  );
  return (
    <div className="task-grid">
      <div className="card">
        <p className="metric-label">Data Cards</p>
        <div className="grid-2">
          {dataScienceCards.map((card) => (
            <button
              key={card.id}
              className={`draggable-card${selected === card.label ? ' selected' : ''}`}
              onClick={() => handleSelect(card.label)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{ fontSize: '1.4rem' }}>{card.icon}</div>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div>{card.label}</div>
                <div className="small-note">{placed[card.label] ?? 'Unsorted'}</div>
              </div>
              {placed[card.label] && <div>✓</div>}
            </button>
          ))}
        </div>
      </div>
      
      <div className="card">
        <p className="metric-label">Categories</p>
        <div className="grid-3">
          {categories.map((group) => (
            <div
              key={group}
              className={`drop-zone${selected ? ' active' : ''}`}
              onClick={() => handleDrop(group)}
              style={{
                padding: 12,
                borderRadius: 8,
                border: '2px dashed rgba(75, 155, 255, 0.4)',
                background: 'rgba(75, 155, 255, 0.05)',
                cursor: selected ? 'pointer' : 'default',
                transition: 'all 200ms ease',
              }}
            >
              <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>{categoryEmojis[group as keyof typeof categoryEmojis]}</div>
              <h3 className="h2" style={{ margin: '4px 0', textTransform: 'capitalize' }}>{group}</h3>
              <p className="small-note">{categoryHints[group as keyof typeof categoryHints]}</p>
              <div className="small-note" style={{ marginTop: 8 }}>
                {Object.entries(placed)
                  .filter(([, value]) => value === group)
                  .map(([label]) => label)
                  .join(', ') || 'Empty'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <p className="small-note">{Object.keys(placed).length} / {dataScienceCards.length} items sorted</p>
        <div className="core-meter">
          <div className="core-fill" style={{ width: `${(Object.keys(placed).length / dataScienceCards.length) * 100}%` }} />
        </div>
        <p className={`status-chip ${completed ? 'success-state' : ''}`}>{completed ? 'Patterns unlocked! Data science finds patterns.' : status}</p>
        <button
          className="button-primary"
          onClick={() => {
            if (completed) {
              if (reviewOpen) {
                onComplete();
                return;
              }
              setPatternVisible(true);
              setReviewOpen(true);
              setStatus('Pattern revealed! Review the concept and continue.');
              playSound('success');
            } else {
              setStatus('You need to sort all cards correctly.');
              playSound('error');
            }
          }}
        >
          {reviewOpen ? 'Proceed to next district' : 'Complete Mission'}
        </button>
      </div>

      {patternVisible ? (
        <div className="card pattern-graph">
          <p className="metric-label">Pattern Distribution</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, justifyContent: 'center', marginTop: 20 }}>
            {categories.map((cat, i) => {
                const counts = categories.map((c) => dataScienceCards.filter((card) => placed[card.label] === c).length);
                const maxCount = Math.max(...counts, 1);
                const heights = counts.map((c) => 40 + Math.round((c / maxCount) * 120));
                return (
                  <div key={cat} style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: 40,
                        height: `${heights[i]}px`,
                        background: `linear-gradient(180deg, rgba(75, 155, 255, 0.8), rgba(75, 155, 255, 0.3))`,
                        borderRadius: '8px 8px 0 0',
                        marginBottom: 8,
                        animation: patternVisible ? `growBar 600ms cubic-bezier(.2,.9,.26,1) forwards` : 'none',
                        animationDelay: `${i * 100}ms`,
                        transformOrigin: 'bottom',
                      }}
                    />
                    <div style={{ fontSize: '1.2rem' }}>{categoryEmojis[cat as keyof typeof categoryEmojis]}</div>
                    <div className="small-note" style={{ marginTop: 4, textTransform: 'capitalize' }}>{cat}</div>
                  </div>
                );
              })}
          </div>
        </div>
      ) : null}

      <ReviewPanel
        description={sectionData.description}
        realWorld={sectionData.realWorld}
        onAdvance={onComplete}
        ready={reviewOpen}
      />
    </div>
  );
}

function ComputerVisionSection({ onComplete }: { onComplete: () => void }) {
  const sectionData = sections.find((item) => item.key === 'computerVision')!;
  const [gateOpen, setGateOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, 'idle' | 'correct' | 'wrong'>>({});
  const [scanComplete, setScanComplete] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  
  const livingThings = ['Panda', 'Bird', 'Tree'];
  const sceneObjects = [
    { label: 'Panda', icon: '🐼' },
    { label: 'Car', icon: '🚗' },
    { label: 'Bird', icon: '🐦' },
    { label: 'Signal', icon: '🚦' },
    { label: 'Tree', icon: '🌳' },
    { label: 'House', icon: '🏠' },
  ];

  const handleTapObject = (label: string) => {
    if (scanComplete) return;
    const isCorrect = livingThings.includes(label);
    setSelected((prev) => ({ ...prev, [label]: isCorrect ? 'correct' : 'wrong' }));
    playSound(isCorrect ? 'drop' : 'error');
    
    if (!isCorrect) {
      setTimeout(() => setSelected((prev) => ({ ...prev, [label]: 'idle' })), 800);
    }
  };

  useEffect(() => {
    const correctCountNow = Object.values(selected).filter((s) => s === 'correct').length;
    if (correctCountNow === livingThings.length && !scanComplete) {
      // Small delay so the UI can show the last tick
      setTimeout(() => {
        handleScanComplete();
      }, 350);
    }
  }, [selected]);

  const correctCount = Object.values(selected).filter((s) => s === 'correct').length;
  const allCorrect = correctCount === livingThings.length;

  const handleScanComplete = () => {
    if (allCorrect) {
      setScanComplete(true);
      playSound('success');
      setTimeout(() => setReviewOpen(true), 600);
    } else {
      playSound('error');
    }
  };

  if (!gateOpen) return (
    <NovaGate
      lines={[
        "The security cameras in NeoCity have gone offline. The AI can't tell what's in each frame!",
        "You are the AI. I'll show you a scene. Tap every LIVING THING — animals, plants, people.",
        "Tap non-living things and the alarm goes off. Focus, Explorer!",
      ]}
      onDone={() => setGateOpen(true)}
    />
  );
  return (
    <div className="task-grid">
      <div className="card">
        <p className="metric-label">Scanner Frame</p>
        <p className="small-note">👾 Captain Nova says: Tap every living creature in the scene. The AI must detect them.</p>
        <div style={{
          position: 'relative',
          marginTop: 20,
          padding: 20,
          border: '2px solid rgba(75, 155, 255, 0.5)',
          borderRadius: 12,
          background: 'linear-gradient(180deg, rgba(10,30,80,0.3), rgba(8,12,22,0.3))',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: scanComplete ? '#5efca2' : 'linear-gradient(90deg, transparent, #4bffa5, transparent)',
            animation: scanComplete ? 'none' : 'scanLine 2s linear infinite',
          }} />
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 8 }}>
            {sceneObjects.map((obj) => {
              const status = selected[obj.label] || 'idle';
              const isCorrect = livingThings.includes(obj.label);
              return (
                <button
                  key={obj.label}
                  type="button"
                  onClick={() => handleTapObject(obj.label)}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    background: status === 'correct' ? 'rgba(94, 252, 130, 0.15)' : 'rgba(75, 155, 255, 0.1)',
                    border: status === 'correct' ? '2px solid rgba(94, 252, 130, 0.8)' : status === 'wrong' ? '2px solid rgba(255, 100, 100, 0.8)' : '1px solid rgba(75, 155, 255, 0.3)',
                    cursor: scanComplete ? 'default' : 'pointer',
                    opacity: scanComplete && status !== 'correct' ? 0.5 : 1,
                    transition: 'all 200ms ease',
                    textAlign: 'center',
                  }}
                  disabled={scanComplete}
                >
                  <div style={{ fontSize: '2rem' }}>{obj.icon}</div>
                  <div style={{ fontSize: '0.9rem', marginTop: 4 }}>{obj.label}</div>
                  {status === 'correct' && <div style={{ marginTop: 4 }}>✅</div>}
                  {status === 'wrong' && <div style={{ marginTop: 4 }}>❌</div>}
                </button>
              );
            })}
          </div>
        </div>

        {scanComplete && (
          <div style={{
            marginTop: 16,
            padding: 12,
            background: 'rgba(94, 252, 130, 0.2)',
            border: '2px solid rgba(94, 252, 130, 0.6)',
            borderRadius: 8,
            textAlign: 'center',
            animation: 'slideInRight 400ms ease',
          }}>
            <h3 className="h2" style={{ margin: 0 }}>🎯 SCAN COMPLETE</h3>
          </div>
        )}
      </div>

      <div className="card">
        <p className="small-note">{correctCount} / {livingThings.length} living creatures detected</p>
        <div className="core-meter">
          <div className="core-fill" style={{ width: `${(correctCount / livingThings.length) * 100}%` }} />
        </div>
        <p className={`status-chip ${scanComplete ? 'success-state' : ''}`}>
          {scanComplete ? 'Vision scan complete! AI sees the living things.' : 'Tap all living creatures to scan the scene.'}
        </p>
        <button
          className="button-primary"
          onClick={() => {
            if (scanComplete) {
              if (reviewOpen) {
                onComplete();
              } else {
                setReviewOpen(true);
              }
            } else if (allCorrect) {
              handleScanComplete();
            } else {
              playSound('error');
            }
          }}
        >
          {scanComplete ? (reviewOpen ? 'Proceed to next district' : 'Lock Scan') : 'Complete Mission'}
        </button>
      </div>

      <ReviewPanel
        description={sectionData.description}
        realWorld={sectionData.realWorld}
        onAdvance={onComplete}
        ready={reviewOpen}
      />
    </div>
  );
}

function LanguageHarborSection({ onComplete }: { onComplete: () => void }) {
  const sectionData = sections.find((item) => item.key === 'languageHarbor')!;
  const [gateOpen, setGateOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [robotShaking, setRobotShaking] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const currentPair = languagePairs[currentIndex];
  const allLanguagePairs = languagePairs;
  
  // Create 4 options: 1 correct + 3 random distractors (useMemo so options don't reshuffle on rerenders)
  const options = useMemo(() => {
    const correct = currentPair.match;
    const others = allLanguagePairs.filter((_, i) => i !== currentIndex).map((p) => p.match);
    const distractors = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
    return [correct, ...distractors].sort(() => Math.random() - 0.5);
  }, [currentIndex]);

  const handleSelect = (match: string) => {
    playSound('click');
    setSelectedMatch(match);
  };

  const handleCheck = () => {
    if (!selectedMatch) return;
    
    const correct = selectedMatch === currentPair.match;
    setIsCorrect(correct);
    playSound(correct ? 'success' : 'error');
    
    if (!correct) {
      setRobotShaking(true);
      setTimeout(() => setRobotShaking(false), 600);
    } else {
      // Move to next pair or finish
      if (currentIndex < languagePairs.length - 1) {
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
          setSelectedMatch('');
          setIsCorrect(null);
        }, 800);
      } else {
        setTimeout(() => setReviewOpen(true), 800);
      }
    }
  };

  const progressDots = Array.from({ length: languagePairs.length }, (_, i) => i < currentIndex || (currentIndex === i && isCorrect) ? '●' : '○').join('');

  if (!gateOpen) return (
    <NovaGate
      lines={[
        'Welcome to Language Harbor — where ships of words arrive from all over the world!',
        "Our translation robot has been scrambled. It's mixing up meanings.",
        "Help it learn! I'll show you a phrase — pick the correct meaning from four options.",
      ]}
      onDone={() => setGateOpen(true)}
    />
  );
  return (
    <div className="task-grid">
      <div className="card">
        <p className="metric-label">Progress</p>
        <div style={{ fontSize: '1.8rem', letterSpacing: '0.2em', textAlign: 'center' }}>{progressDots}</div>
      </div>

      <div className="card">
        <p className="metric-label">Robot Translation Duel</p>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginTop: 16,
        }}>
          <div style={{
            fontSize: isCorrect === true ? '3rem' : '3rem',
            animation: robotShaking ? 'shake 400ms ease' : 'none',
            textAlign: 'center',
          }}>
            {isCorrect === true ? '🤖✅' : isCorrect === false ? '🤖❌' : '🤖'}
          </div>
          
          <div style={{
            flex: 1,
            background: isCorrect === true ? 'rgba(94, 252, 130, 0.15)' : isCorrect === false ? 'rgba(255, 100, 100, 0.15)' : 'rgba(75, 155, 255, 0.15)',
            border: isCorrect === true ? '2px solid rgba(94, 252, 130, 0.6)' : isCorrect === false ? '2px solid rgba(255, 100, 100, 0.6)' : '2px solid rgba(75, 155, 255, 0.6)',
            borderRadius: 12,
            padding: 16,
            position: 'relative',
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
              {currentPair.phrase}
            </div>
            {isCorrect === true && (
              <div style={{ marginTop: 8, color: '#5efca2', fontSize: '0.9rem' }}>
                ✓ Processing complete! I learned that.
              </div>
            )}
            {isCorrect === false && (
              <div style={{ marginTop: 8, color: '#ff6464', fontSize: '0.9rem' }}>
                ✗ Error! That doesn't match my training data.
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <p className="small-note">Select the best translation:</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 12 }}>
            {options.map((choice) => (
              <button
                key={choice}
                type="button"
                className={`small-button${selectedMatch === choice ? ' selected' : ''}`}
                onClick={() => handleSelect(choice)}
                disabled={isCorrect !== null}
                style={{
                  opacity: isCorrect !== null && selectedMatch !== choice ? 0.5 : 1,
                }}
              >
                {choice}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <button
          className="button-primary"
          onClick={handleCheck}
          disabled={!selectedMatch || isCorrect !== null}
        >
          {currentIndex >= languagePairs.length - 1 && isCorrect === true ? 'Finish Harbor' : 'Check Answer'}
        </button>
      </div>

      <ReviewPanel
        description={sectionData.description}
        realWorld={sectionData.realWorld}
        onAdvance={onComplete}
        ready={reviewOpen}
      />
    </div>
  );
}

function PredictionLabSection({ onComplete }: { onComplete: () => void }) {
  const sectionData = sections.find((item) => item.key === 'predictionLab')!;
  const [gateOpen, setGateOpen] = useState(false);
  const [choice, setChoice] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);

  const correctTemp = '30°C';
  const chartWidth = 320;
  const chartHeight = 200;
  const padding = 40;
  const graphWidth = chartWidth - padding * 2;
  const graphHeight = chartHeight - padding * 2;

  const minTemp = 20;
  const maxTemp = 35;
  const tempRange = maxTemp - minTemp;

  const pointData = predictionHistory.map((day, i) => {
    const x = padding + (i / (predictionHistory.length - 1)) * graphWidth;
    const y = padding + graphHeight - ((day.temp - minTemp) / tempRange) * graphHeight;
    return { x, y, temp: day.temp, day: day.day };
  });

  const polylinePoints = pointData.map((p) => `${p.x},${p.y}`).join(' ');

  const drawPredictionLine = (tempChoice: string) => {
    if (!tempChoice || !pointData.length) return '';
    const choiceNum = parseInt(tempChoice);
    const lastPoint = pointData[pointData.length - 1];
    const nextX = padding + graphWidth + 30;
    const nextY = padding + graphHeight - ((choiceNum - minTemp) / tempRange) * graphHeight;
    return `${lastPoint.x},${lastPoint.y} ${nextX},${nextY}`;
  };

  const handlePredict = () => {
    if (!choice) return;
    if (choice === correctTemp) {
      setResult('✅ Correct! The AI predicted 30°C based on the rising trend.');
      playSound('success');
      setShowAiSuggestion(false);
      setTimeout(() => {
        onComplete();
      }, 1200);
    } else {
      setResult("🤖 The AI predicts 30°C based on the pattern. Here's why: the temperature has been rising each day.");
      playSound('error');
      setShowAiSuggestion(true);
    }
  };

  if (!gateOpen) return (
    <NovaGate
      lines={[
        'The weather tower is offline! Without temperature predictions, NeoCity will overheat.',
        "Look at this week's temperature chart carefully. Can you spot the pattern?",
        'Once you see it — make your prediction. Then see if the AI agrees!',
      ]}
      onDone={() => setGateOpen(true)}
    />
  );
  return (
    <div className="task-grid">
      <div className="card">
        <p className="metric-label">Weather History</p>
        <svg width={chartWidth} height={chartHeight} style={{ border: '1px solid rgba(75, 155, 255, 0.3)', borderRadius: 8, background: 'rgba(10, 30, 80, 0.2)' }}>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={`hline-${i}`}
              x1={padding}
              y1={padding + (i / 4) * graphHeight}
              x2={chartWidth - padding}
              y2={padding + (i / 4) * graphHeight}
              stroke="rgba(75, 155, 255, 0.1)"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          ))}
          
          {/* Historical data line */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="rgba(75, 155, 255, 0.8)"
            strokeWidth="2"
          />
          
          {/* Data points */}
          {pointData.map((p, i) => (
            <g key={`point-${i}`}>
              <circle cx={p.x} cy={p.y} r="4" fill="rgba(75, 155, 255, 0.8)" />
              <text x={p.x} y={chartHeight - 8} textAnchor="middle" fontSize="12" fill="rgba(169, 192, 221, 0.8)">
                {p.day}
              </text>
            </g>
          ))}

          {/* Prediction line (dashed) */}
          {choice && (
            <polyline
              points={drawPredictionLine(choice)}
              fill="none"
              stroke={choice === correctTemp ? 'rgba(94, 252, 130, 0.6)' : 'rgba(255, 150, 80, 0.6)'}
              strokeWidth="2"
              strokeDasharray="5,5"
              style={{ animation: choice ? 'dashMove 900ms linear forwards' : 'none' }}
            />
          )}

          {/* Y-axis label */}
          <text x="15" y={padding + 10} fontSize="12" fill="rgba(169, 192, 221, 0.8)">
            35°C
          </text>
          <text x="15" y={chartHeight - 10} fontSize="12" fill="rgba(169, 192, 221, 0.8)">
            20°C
          </text>
        </svg>
      </div>

      <div className="card">
        <p className="metric-label">Predict Tomorrow's Temperature</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {['28°C', '30°C', '32°C'].map((option) => (
            <button
              key={option}
              type="button"
              className={`small-button${choice === option ? ' selected' : ''}`}
              onClick={() => {
                setChoice(option);
                setResult('');
                playSound('click');
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <p className={`status-chip ${result.includes('✅') ? 'success-state' : result ? '' : ''}`}>
          {result || 'Look at the trend and predict tomorrow\'s temperature!'}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="button-primary" onClick={handlePredict} disabled={!choice}>
            Confirm Prediction
          </button>
          {showAiSuggestion && (
            <button
              className="small-button"
              onClick={() => {
                playSound('power');
                setResult('✅ Accepted AI suggestion: 30°C. Proceeding...');
                setTimeout(() => onComplete(), 800);
              }}
            >
              Accept AI suggestion
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ClassificationFactorySection({ onComplete }: { onComplete: () => void }) {
  const [placed, setPlaced] = useState<PlacementMap>({});
  const [gateOpen, setGateOpen] = useState(false);
  const categories = ['Fruit', 'Animal', 'Vehicle'];
  const [queueIndex, setQueueIndex] = useState(0);
  const [status, setStatus] = useState('Items move on the conveyor. Sort each one as it appears.');

  const currentCard = classificationCards[queueIndex];

  const handlePlaceCurrent = (category: string) => {
    if (!currentCard) return;
    setPlaced((prev) => ({ ...prev, [currentCard.label]: category }));
    playSound('drop');
    // advance conveyor after short delay
    setTimeout(() => {
      if (queueIndex < classificationCards.length - 1) {
        setQueueIndex((i) => i + 1);
      } else {
        // All placed: check correctness
        const correct = classificationCards.every((card) => placed[card.label] === card.category || card.label === currentCard.label && category === card.category);
        if (correct) {
          playSound('success');
          onComplete();
        } else {
          setStatus('Some items were sorted incorrectly. Review and try again.');
          playSound('error');
        }
      }
    }, 420);
  };

  const placedCount = Object.keys(placed).length + (currentCard && placed[currentCard.label] ? 0 : 0);

  if (!gateOpen) return (
    <NovaGate
      lines={[
        "The NeoCity sorting factory has broken down. Items are piling up on the conveyor belt!",
        "Your job: tap an item, then tap the correct bin. Fruits, Animals, or Vehicles.",
        'The factory robot is watching — it will learn YOUR sorting rule!',
      ]}
      onDone={() => setGateOpen(true)}
    />
  );
  return (
    <div className="task-grid">
      <div className="card">
        <p className="metric-label">Conveyor Belt</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 140 }}>
          {currentCard ? (
            <div className="draggable-card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: '1.4rem' }}>{currentCard.icon}</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700 }}>{currentCard.label}</div>
                <div className="small-note">Tap a bin to place this item</div>
              </div>
            </div>
          ) : (
            <div className="small-note">No more items on the belt.</div>
          )}
        </div>
      </div>

      <div className="grid-3">
        {categories.map((category) => (
          <div key={category} className="drop-zone" onClick={() => handlePlaceCurrent(category)}>
            <h3 className="h2">{category}</h3>
            <p className="small-note">Tap to place current item</p>
            <div className="small-note">{Object.entries(placed).filter(([, value]) => value === category).map(([label]) => label).join(', ')}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <p className={`status-chip`}>{status}</p>
        <p className="small-note">{Object.keys(placed).length} / {classificationCards.length} sorted</p>
      </div>
    </div>
  );
}

function RegressionObservatorySection({ onComplete }: { onComplete: () => void }) {
  const sectionData = sections.find((item) => item.key === 'regressionObservatory')!;
  const [gateOpen, setGateOpen] = useState(false);
  const [hours, setHours] = useState(3);
  const [sleep, setSleep] = useState(4);
  const [locked, setLocked] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const predicted = 30 + hours * 4 + sleep * 2;

  const scatterData = [
    { hours: 1, marks: 38 },
    { hours: 2, marks: 42 },
    { hours: 3, marks: 50 },
    { hours: 4, marks: 56 },
    { hours: 5, marks: 64 },
    { hours: 6, marks: 72 },
    { hours: 7, marks: 78 },
    { hours: 8, marks: 84 },
  ];

  const chartWidth = 300;
  const chartHeight = 220;
  const padding = 40;
  const graphWidth = chartWidth - padding * 2;
  const graphHeight = chartHeight - padding * 2;

  const minHours = 0;
  const maxHours = 9;
  const minMarks = 30;
  const maxMarks = 90;

  const scaleX = graphWidth / (maxHours - minHours);
  const scaleY = graphHeight / (maxMarks - minMarks);

  const regressionLine = {
    x1: padding + (1 - minHours) * scaleX,
    y1: padding + graphHeight - (38 - minMarks) * scaleY,
    x2: padding + (8 - minHours) * scaleX,
    y2: padding + graphHeight - (84 - minMarks) * scaleY,
  };

  const predictionPointX = padding + (hours - minHours) * scaleX;
  const predictionPointY = padding + graphHeight - ((predicted - minMarks) / (maxMarks - minMarks)) * graphHeight;

  const handleSubmit = () => {
    setLocked(true);
    playSound('success');
    setTimeout(() => setReviewOpen(true), 600);
  };

  if (!gateOpen) return (
    <NovaGate
      lines={[
        "The Observatory tracks how study habits affect exam marks.",
        "Drag the sliders to change study hours and sleep. Watch how the AI's prediction changes — live on the chart!",
        'This is Regression: the AI predicts a NUMBER, not just a category.',
      ]}
      onDone={() => setGateOpen(true)}
    />
  );
  return (
    <div className="task-grid">
      <div className="card">
        <p className="metric-label">Study Hours vs Marks (SVG Chart)</p>
        <svg width={chartWidth} height={chartHeight} style={{ border: '1px solid rgba(75, 155, 255, 0.3)', borderRadius: 8, background: 'rgba(10, 30, 80, 0.2)' }}>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line
              key={`hline-${i}`}
              x1={padding}
              y1={padding + (i / 5) * graphHeight}
              x2={chartWidth - padding}
              y2={padding + (i / 5) * graphHeight}
              stroke="rgba(75, 155, 255, 0.1)"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          ))}

          {/* Regression line */}
          <line
            x1={regressionLine.x1}
            y1={regressionLine.y1}
            x2={regressionLine.x2}
            y2={regressionLine.y2}
            stroke={locked ? 'rgba(94, 252, 130, 0.8)' : 'rgba(75, 155, 255, 0.5)'}
            strokeWidth="2"
            opacity={locked ? 1 : 0.4}
            style={{ transition: 'all 400ms ease' }}
          />

          {/* Data points */}
          {scatterData.map((point, i) => {
            const px = padding + (point.hours - minHours) * scaleX;
            const py = padding + graphHeight - ((point.marks - minMarks) / (maxMarks - minMarks)) * graphHeight;
            return (
              <circle key={`point-${i}`} cx={px} cy={py} r="3" fill="rgba(75, 155, 255, 0.8)" />
            );
          })}

          {/* Prediction point */}
          {!locked && (
            <circle cx={predictionPointX} cy={predictionPointY} r="5" fill="rgba(255, 150, 80, 0.8)" style={{ filter: 'drop-shadow(0 0 4px rgba(255, 150, 80, 0.8))' }} />
          )}
          {locked && (
            <circle cx={predictionPointX} cy={predictionPointY} r="5" fill="rgba(94, 252, 130, 0.8)" style={{ filter: 'drop-shadow(0 0 4px rgba(94, 252, 130, 0.8))' }} />
          )}

          {/* Axes */}
          <line x1={padding} y1={padding + graphHeight} x2={chartWidth - padding} y2={padding + graphHeight} stroke="rgba(75, 155, 255, 0.4)" strokeWidth="1" />
          <line x1={padding} y1={padding} x2={padding} y2={padding + graphHeight} stroke="rgba(75, 155, 255, 0.4)" strokeWidth="1" />

          {/* Labels */}
          <text x={padding - 30} y={padding + 10} fontSize="11" fill="rgba(169, 192, 221, 0.8)">90</text>
          <text x={padding - 30} y={padding + graphHeight + 5} fontSize="11" fill="rgba(169, 192, 221, 0.8)">30</text>
          <text x={chartWidth - 20} y={padding + graphHeight + 15} fontSize="11" fill="rgba(169, 192, 221, 0.8)">8h</text>
        </svg>
      </div>

      <div className="card">
        <p className="metric-label">Study Hours</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type="range"
            min="1"
            max="8"
            value={hours}
            onChange={(e) => {
              if (!locked) setHours(Number(e.target.value));
              playSound('power');
            }}
            style={{ flex: 1 }}
          />
          <div style={{ minWidth: 40, textAlign: 'right', fontWeight: 600 }}>{hours}h</div>
        </div>
      </div>

      <div className="card">
        <p className="metric-label">Good Sleep Days</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type="range"
            min="1"
            max="7"
            value={sleep}
            onChange={(e) => {
              if (!locked) setSleep(Number(e.target.value));
              playSound('power');
            }}
            style={{ flex: 1 }}
          />
          <div style={{ minWidth: 40, textAlign: 'right', fontWeight: 600 }}>{sleep} days</div>
        </div>
      </div>

      <div className="card">
        <p className="metric-label">Predicted Marks</p>
        <div style={{ fontSize: '2rem', fontWeight: 600, textAlign: 'center', padding: '16px 0', color: locked ? '#5efca2' : '#ff9650' }}>
          📍 {predicted}
        </div>
        <p className="small-note">Formula: 30 + (hours × 4) + (sleep × 2)</p>
      </div>

      <div className="card">
        <p className="metric-label">Live Insight</p>
        <InsightCard hours={hours} sleep={sleep} predicted={predicted} locked={locked} />
      </div>

      <div className="card">
        <button
          className="button-primary"
          onClick={() => {
            if (!locked) {
              handleSubmit();
            } else if (reviewOpen) {
              onComplete();
            }
          }}
        >
          {locked ? (reviewOpen ? 'Proceed to next district' : 'Analyze Regression') : 'Submit Prediction 🔒'}
        </button>
      </div>

      <ReviewPanel
        description={sectionData.description}
        realWorld={sectionData.realWorld}
        onAdvance={onComplete}
        ready={reviewOpen}
      />
    </div>
  );
}

function ClusteringForestSection({ onComplete }: { onComplete: () => void }) {
  const sectionData = sections.find((item) => item.key === 'clusteringForest')!;
  const [gateOpen, setGateOpen] = useState(false);
  const [placed, setPlaced] = useState<PlacementMap>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const forestItems = [
    { id: 'f1', emoji: '🔺', x: 50,  y: 60,  cluster: 'shapes' },
    { id: 'f2', emoji: '⬛', x: 80,  y: 40,  cluster: 'shapes' },
    { id: 'f3', emoji: '🔵', x: 110, y: 80,  cluster: 'shapes' },
    { id: 'f4', emoji: '🐱', x: 180, y: 50,  cluster: 'animals' },
    { id: 'f5', emoji: '🐶', x: 220, y: 80,  cluster: 'animals' },
    { id: 'f6', emoji: '🦊', x: 200, y: 110, cluster: 'animals' },
    { id: 'f7', emoji: '📦', x: 60,  y: 200, cluster: 'objects' },
    { id: 'f8', emoji: '🪑', x: 100, y: 220, cluster: 'objects' },
    { id: 'f9', emoji: '🎒', x: 140, y: 190, cluster: 'objects' },
  ];

  const clusters = [
    { id: 'shapes', label: 'Red Camp', color: '#ff6464' },
    { id: 'animals', label: 'Green Camp', color: '#5efca2' },
    { id: 'objects', label: 'Blue Camp', color: '#4b9bff' },
  ];

  const canvasSize = 280;

  const handleSelectDot = (itemId: string) => {
    setSelected(itemId);
    playSound('click');
  };

  const handlePlaceDot = (clusterId: string) => {
    if (!selected) return;
    setPlaced((prev) => ({ ...prev, [selected]: clusterId }));
    setSelected(null);
    playSound('drop');
  };

  const correct = forestItems.every((item) => placed[item.id] === item.cluster);
  const allPlaced = forestItems.every((item) => !!placed[item.id]);

  const handleComplete = () => {
    if (correct && allPlaced) {
      setReviewOpen(true);
      playSound('success');
    }
  };

  if (!gateOpen) return (
    <NovaGate
      lines={[
        'Deep in the NeoCity Forest, strange creatures and objects have appeared — all mixed up!',
        'No one told you what the groups are. You have to figure out the pattern yourself.',
        'Tap a dot on the map, then tap a colour camp to assign it. Trust your instincts!',
      ]}
      onDone={() => setGateOpen(true)}
    />
  );
  return (
    <div className="task-grid">
      <div className="card">
        <p className="metric-label">Forest Map (SVG)</p>
        <svg
          width={canvasSize}
          height={canvasSize}
          style={{
            border: '2px solid rgba(75, 155, 255, 0.4)',
            borderRadius: 8,
            background: 'rgba(10, 30, 80, 0.2)',
            cursor: 'pointer',
          }}
        >
          {forestItems.map((item) => {
            const pos = { x: item.x, y: item.y };
            const clusterColor = placed[item.id]
              ? clusters.find((c) => c.id === placed[item.id])?.color || 'rgba(100, 100, 100, 0.5)'
              : 'rgba(200, 200, 200, 0.12)';
            const isSelected = selected === item.id;

            return (
              <g key={item.id} onClick={() => handleSelectDot(item.id)}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? 16 : 12}
                  fill={clusterColor}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                    filter: isSelected ? 'drop-shadow(0 0 8px rgba(75, 155, 255, 0.8))' : 'none',
                    animation: isSelected ? 'pulseRing 1.2s ease-out' : 'none',
                  }}
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dy="0.3em"
                  fontSize="16"
                  style={{ pointerEvents: 'none' }}
                >
                  {item.emoji}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="card">
        <p className="metric-label">Cluster Zones</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {clusters.map((cluster) => {
            const itemsInCluster = forestItems.filter((i) => placed[i.id] === cluster.id);
            return (
              <button
                key={cluster.id}
                type="button"
                onClick={() => handlePlaceDot(cluster.id)}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border: `2px solid ${cluster.color}`,
                  background: `${cluster.color}20`,
                  cursor: selected ? 'pointer' : 'default',
                  opacity: selected ? 1 : 0.6,
                  transition: 'all 200ms ease',
                }}
              >
                <div style={{ fontSize: '1.2rem' }}>{cluster.label}</div>
                <div className="small-note">{itemsInCluster.length} items</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card">
        <p className="small-note">{Object.keys(placed).length} / {forestItems.length} items clustered</p>
        <div className="core-meter">
          <div className="core-fill" style={{ width: `${(Object.keys(placed).length / forestItems.length) * 100}%` }} />
        </div>
        <p className={`status-chip ${correct && allPlaced ? 'success-state' : ''}`}>
          {correct && allPlaced ? 'Clustering complete! Groups revealed.' : 'Tap dots and assign to clusters.'}
        </p>
        <button className="button-primary" onClick={() => {
          if (reviewOpen) {
            onComplete();
          } else {
            handleComplete();
          }
        }} disabled={!correct || !allPlaced}>
          {reviewOpen ? 'Proceed to next district' : 'Complete Mission'}
        </button>
      </div>

      <ReviewPanel
        description={sectionData.description}
        realWorld={sectionData.realWorld}
        onAdvance={onComplete}
        ready={reviewOpen}
      />
    </div>
  );
}

// canvasPositions removed per prompt; ClusteringForest uses hardcoded forestItems

function DatasetVaultSection({ onComplete }: { onComplete: () => void }) {
  const sectionData = sections.find((item) => item.key === 'datasetVault')!;
  const [gateOpen, setGateOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [unlockedRings, setUnlockedRings] = useState<boolean[]>([false, false, false, false]);
  const [shaking, setShaking] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const vaultCodes = [
    { example: 'A table of student names and marks', correct: 'Structured' },
    { example: 'A bunch of photos from Instagram', correct: 'Unstructured' },
    { example: 'Temperature readings every hour for 30 days', correct: 'Time-Series' },
    { example: 'Map coordinates of cities', correct: 'Spatial' },
  ];

  const dialOptions = [
    { icon: '🗂️', label: 'Structured' },
    { icon: '🌊', label: 'Unstructured' },
    { icon: '⏱️', label: 'Time-Series' },
    { icon: '🗺️', label: 'Spatial' },
  ];

  const currentCode = vaultCodes[currentIndex];
  const allUnlocked = unlockedRings.every((r) => r);

  const handleDial = (typeLabel: string) => {
    if (unlockedRings[currentIndex]) return; // Already unlocked
    const isCorrect = typeLabel === currentCode.correct;
    playSound(isCorrect ? 'drop' : 'error');

    if (isCorrect) {
      setUnlockedRings((prev) => {
        const updated = [...prev];
        updated[currentIndex] = true;
        return updated;
      });

      if (currentIndex < vaultCodes.length - 1) {
        setTimeout(() => setCurrentIndex((prev) => prev + 1), 600);
      } else {
        setTimeout(() => setReviewOpen(true), 600);
      }
    } else {
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
    }
  };

  const vaultDiameters = [120, 90, 60, 30];

  if (!gateOpen) return (
    <NovaGate
      lines={[
        "The Dataset Vault holds NeoCity's most valuable data — but it's locked!",
        'Four combination locks, each with a riddle. Crack the code by identifying the data type.',
        "Crack all four and the vault swings open. Let's crack it!",
      ]}
      onDone={() => setGateOpen(true)}
    />
  );
  return (
    <div className="task-grid">
      <div className="card">
        <p className="metric-label">Dataset Code</p>
        <h3 className="h2" style={{ marginTop: 16 }}>{currentCode.example}</h3>
        <p className="small-note">Code {currentIndex + 1} of {vaultCodes.length}</p>
      </div>

      <div className="card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 280 }}>
        <svg
          width={160}
          height={160}
          style={{
            filter: shaking ? 'drop-shadow(0 0 10px rgba(255, 100, 100, 0.8))' : 'drop-shadow(0 0 5px rgba(75, 155, 255, 0.4))',
            animation: shaking ? 'shake 600ms ease' : 'none',
          }}
        >
          {/* Vault rings */}
          {vaultDiameters.map((diameter, i) => (
            <circle
              key={`ring-${i}`}
              cx="80"
              cy="80"
              r={diameter / 2}
              fill="none"
              stroke={unlockedRings[i] ? 'rgba(94, 252, 130, 0.6)' : 'rgba(75, 155, 255, 0.4)'}
              strokeWidth="2"
              className={unlockedRings[i] ? 'vault-rotating vault-unlocked' : 'vault-rotating'}
              style={{ transition: 'stroke 400ms ease', transformOrigin: '80px 80px' }}
            />
          ))}
          {/* Center dot */}
          <circle cx="80" cy="80" r="3" fill="rgba(75, 155, 255, 0.8)" />
        </svg>
      </div>

      <div className="card">
        <p className="metric-label">Dial Options</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {dialOptions.map((option) => (
            <button
              key={option.label}
              type="button"
              className="small-button"
              onClick={() => handleDial(option.label)}
              style={{
                opacity: unlockedRings[currentIndex] ? 0.5 : 1,
                cursor: unlockedRings[currentIndex] ? 'default' : 'pointer',
              }}
              disabled={unlockedRings[currentIndex]}
            >
              <div style={{ fontSize: '1.2rem' }}>{option.icon}</div>
              <div>{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <p className="small-note">{unlockedRings.filter((r) => r).length} / {vaultCodes.length} rings unlocked</p>
        <div className="core-meter">
          <div className="core-fill" style={{ width: `${(unlockedRings.filter((r) => r).length / vaultCodes.length) * 100}%` }} />
        </div>
        <button
          className="button-primary"
          onClick={() => {
            if (reviewOpen) {
              onComplete();
            }
          }}
          disabled={!reviewOpen}
        >
          {reviewOpen ? 'Proceed to next district' : 'Keep Cracking'}
        </button>
      </div>

      <ReviewPanel
        description={sectionData.description}
        realWorld={sectionData.realWorld}
        onAdvance={onComplete}
        ready={reviewOpen}
      />
    </div>
  );
}

function DataTypeSortSection({ onComplete }: { onComplete: () => void }) {
  const sectionData = sections.find((item) => item.key === 'dataTypeSort')!;
  const [gateOpen, setGateOpen] = useState(false);
  const [assigned, setAssigned] = useState<PlacementMap>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const groups = [
    { id: 'Structured', emoji: '🗂️', label: 'Structured', hint: 'Organized in rows and columns', color: 'rgba(75,155,255,0.9)', bg: 'rgba(75,155,255,0.08)' },
    { id: 'Unstructured', emoji: '🌊', label: 'Unstructured', hint: 'No fixed format', color: 'rgba(150,75,255,0.9)', bg: 'rgba(150,75,255,0.08)' },
  ];

  const handleDrop = (group: string) => {
    if (!selected) return;
    const card = structureExamples.find((item) => item.label === selected);
    if (card) {
      setAssigned((prev) => ({ ...prev, [card.label]: group }));
      playSound('drop');
    }
    setSelected(null);
  };

  const correct = structureExamples.every((example) => assigned[example.label] === example.type);
  const completed = Object.keys(assigned).length === structureExamples.length && correct;

  const handleComplete = () => {
    if (completed) {
      setReviewOpen(true);
      playSound('success');
    }
  };

  if (!gateOpen) return (
    <NovaGate
      lines={[
        "The city's data library needs to be reorganised urgently!",
        'Some data is neatly structured like a table. Other data is wild and unstructured.',
        'Sort each file into the right shelf. Structured or Unstructured — go!',
      ]}
      onDone={() => setGateOpen(true)}
    />
  );
  return (
    <div className="task-grid">
      <div className="card">
        <p className="metric-label">Data Examples</p>
        <div className="grid-2">
          {structureExamples.map((example) => (
            <button
              key={example.label}
              type="button"
              className={`draggable-card${selected === example.label ? ' selected' : ''}`}
              onClick={() => {
                setSelected(example.label);
                playSound('click');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{ fontSize: '1.4rem' }}>{example.icon}</div>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div>{example.label}</div>
                <div className="small-note">{assigned[example.label] ?? 'Unsorted'}</div>
              </div>
              {assigned[example.label] && <div>✓</div>}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <p className="metric-label">Data Type Zones</p>
        <div className="grid-2">
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => handleDrop(group.id)}
              style={{
                padding: 16,
                borderRadius: 8,
                border: `2px dashed ${group.color}`,
                background: group.bg,
                cursor: selected ? 'pointer' : 'default',
                transition: 'all 200ms ease',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{group.emoji}</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{group.label}</div>
              <p className="small-note">{group.hint}</p>
              <div className="small-note" style={{ marginTop: 8, color: group.color }}>
                {Object.entries(assigned)
                  .filter(([, value]) => value === group.id)
                  .map(([label]) => label)
                  .join(', ') || 'Empty'}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <p className="small-note">{Object.keys(assigned).length} / {structureExamples.length} examples sorted</p>
        <div className="core-meter">
          <div className="core-fill" style={{ width: `${(Object.keys(assigned).length / structureExamples.length) * 100}%` }} />
        </div>
        <p className={`status-chip ${correct && completed ? 'success-state' : ''}`}>
          {correct && completed ? 'Mastery unlocked! Structured and unstructured data separated.' : 'Sort each example to the right data type.'}
        </p>
        <button
          className="button-primary"
          onClick={() => {
            if (reviewOpen) {
              onComplete();
            } else {
              handleComplete();
            }
          }}
          disabled={!correct || !completed}
        >
          {reviewOpen ? 'Proceed to next district' : 'Complete Mission'}
        </button>
      </div>

      <ReviewPanel
        description={sectionData.description}
        realWorld={sectionData.realWorld}
        onAdvance={onComplete}
        ready={reviewOpen}
      />
    </div>
  );
}

function TrainingArenaSection({ onComplete }: { onComplete: () => void }) {
  const sectionData = sections.find((item) => item.key === 'trainingArena')!;
  const [gateOpen, setGateOpen] = useState(false);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [placingStage, setPlacingStage] = useState<string | null>(null);

  const stages = ['Collect Data', 'Train', 'Test'];
  const correctStageMap = {
    'Collect Data': 'Practice examples',
    'Train': 'Validation set',
    'Test': 'Final exam set',
  };

  const handleSelectToken = (label: string) => {
    setSelected(label);
    playSound('click');
  };

  const handlePlaceToken = (stage: string) => {
    if (!selected) return;
    setChoices((prev) => ({ ...prev, [stage]: selected }));
    setSelected(null);
    playSound('drop');
    setPlacingStage(stage);
    setTimeout(() => setPlacingStage(null), 700);
  };

  const correct = stages.every((stage) => choices[stage] === correctStageMap[stage as keyof typeof correctStageMap]);
  const allChosen = stages.every((stage) => choices[stage]);

  const handleComplete = () => {
    if (correct && allChosen) {
      setComplete(true);
      playSound('success');
      setTimeout(() => setReviewOpen(true), 800);
    }
  };

  if (!gateOpen) return (
    <NovaGate
      lines={[
        "Inside the Training Arena, every AI fighter must go through three rounds before it's ready.",
        "Round 1: Practice on training data. Round 2: Tune using validation data. Round 3: Final test with test data.",
        "Assign the right dataset to the right round. Don't mix them up or the AI will cheat!",
      ]}
      onDone={() => setGateOpen(true)}
    />
  );
  return (
    <div className="task-grid">
      <div className="card">
        <p className="metric-label">Training Pipeline</p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          alignItems: 'center',
          marginTop: 20,
        }}>
          {stages.map((stage, i) => (
            <div key={stage}>
              <button
                type="button"
                className="small-button"
                onClick={() => handlePlaceToken(stage)}
                style={{
                  padding: 16,
                  minHeight: 80,
                  border: choices[stage] ? '2px solid rgba(94, 252, 130, 0.6)' : '2px dashed rgba(75, 155, 255, 0.4)',
                  background: choices[stage] ? 'rgba(94, 252, 130, 0.1)' : 'rgba(75, 155, 255, 0.05)',
                  cursor: selected ? 'pointer' : 'default',
                  transition: 'all 200ms ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <div style={{ fontSize: '1.4rem' }}>
                  {i === 0 ? '📥' : i === 1 ? '🏋️' : '📋'}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{stage}</div>
                <div style={{ fontSize: '0.75rem', color: '#b6c7dc' }}>{i === 0 ? 'Round 1 — Practice' : i === 1 ? 'Round 2 — Tune' : 'Round 3 — Final'}</div>
                {choices[stage] && <div style={{ fontSize: '0.75rem', color: '#5efca2', marginTop: 4 }}>✓ {choices[stage]}</div>}
              </button>
              {placingStage === stage && (
                <div style={{ textAlign: 'center', marginTop: 8, color: '#7ff4b4', fontWeight: 700, animation: 'pulse 700ms ease' }}>PLACED</div>
              )}
              {i < stages.length - 1 && (
                <div style={{
                  textAlign: 'center',
                  marginTop: 12,
                  fontSize: '1.2rem',
                  animation: complete ? 'flowArrow 1.2s ease-in-out infinite' : 'none',
                }}>
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <p className="metric-label">Available Tokens</p>
        <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center' }}>
          {trainingCards.map((card) => {
            const isUsed = Object.values(choices).includes(card.label);
            return (
              <button
                key={card.id}
                type="button"
                className={`small-button${selected === card.label ? ' selected' : ''}`}
                onClick={() => handleSelectToken(card.label)}
                style={{
                  opacity: isUsed ? 0.4 : 1,
                  cursor: isUsed ? 'default' : 'pointer',
                  pointerEvents: isUsed ? 'none' : 'auto',
                  transform: selected === card.label ? 'translateY(-6px) scale(1.03)' : undefined,
                  transition: 'all 220ms ease',
                }}
              >
                <div style={{ fontSize: '1.2rem' }}>{card.icon}</div>
                <div style={{ fontSize: '0.85rem' }}>{card.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card">
        <p className="small-note">{Object.keys(choices).length} / {stages.length} stages assigned</p>
        <div className="core-meter">
          <div className="core-fill" style={{ width: `${(Object.keys(choices).length / stages.length) * 100}%` }} />
        </div>
        <p className={`status-chip ${correct && allChosen ? 'success-state' : ''}`}>
          {correct && allChosen ? '🚀 Training Complete! Pipeline activated.' : 'Assign tokens to each stage.'}
        </p>
        <button
          className="button-primary"
          onClick={() => {
            if (reviewOpen) {
              onComplete();
            } else if (allChosen && correct) {
              handleComplete();
            } else if (!correct) {
              playSound('error');
            }
          }}
          disabled={!correct || !allChosen}
        >
          {reviewOpen ? 'Proceed to next district' : 'Complete Mission'}
        </button>
      </div>

      <ReviewPanel
        description={sectionData.description}
        realWorld={sectionData.realWorld}
        onAdvance={onComplete}
        ready={reviewOpen}
      />
    </div>
  );
}

function WorkflowMachineSection({ onComplete }: { onComplete: () => void }) {
  const sectionData = sections.find((item) => item.key === 'workflowMachine')!;
  const [gateOpen, setGateOpen] = useState(false);
  const [slots, setSlots] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const correct = workflowSteps.every((step, i) => slots[i + 1] === step);
  const allFilled = workflowSteps.every((_, i) => slots[i + 1]);

  const handleSelectCard = (step: string) => {
    setSelected(step);
    playSound('click');
  };

  const handlePlaceCard = (slotNum: number) => {
    if (!selected) return;
    if (slots[slotNum]) return; // Slot already filled
    setSlots((prev) => ({ ...prev, [slotNum]: selected }));
    playSound('drop');
    setSelected(null);
  };

  const handleSlotClick = (slotNum: number) => {
    // If there is a selected step, try to place into this slot
    if (selected && !slots[slotNum]) {
      setSlots((prev) => ({ ...prev, [slotNum]: selected }));
      setSelected(null);
      playSound('drop');
      return;
    }
    // If slot filled and no selection, remove it back to pool
    if (!selected && slots[slotNum]) {
      const removed = slots[slotNum];
      setSlots((prev) => {
        const copy = { ...prev };
        delete copy[slotNum];
        return copy;
      });
      playSound('click');
      // set it back as selected so user can place elsewhere
      setSelected(removed);
    }
  };

  const handleComplete = () => {
    if (correct && allFilled) {
      setComplete(true);
      playSound('success');
      setTimeout(() => setReviewOpen(true), 1500);
    }
  };

  const unplacedSteps = workflowSteps.filter((step) => !Object.values(slots).includes(step));

  if (!gateOpen) return (
    <NovaGate
      lines={[
        "The city's AI Machine has been sabotaged — its process steps are all scrambled!",
        "There's a correct order to build any AI system. Drag the steps into the right slots.",
        'Get the order right and watch the machine roar back to life!',
      ]}
      onDone={() => setGateOpen(true)}
    />
  );
  return (
    <div className="task-grid">
      <div className="card">
        <p className="metric-label">Machine Workflow</p>
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: workflowSteps.length }, (_, i) => i + 1).map((slotNum, i) => (
            <div key={slotNum}>
              <button
                type="button"
                onClick={() => handleSlotClick(slotNum)}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: slots[slotNum] ? '2px solid rgba(94, 252, 130, 0.6)' : '2px dashed rgba(75, 155, 255, 0.4)',
                  background: slots[slotNum] ? 'rgba(94, 252, 130, 0.08)' : 'rgba(75, 155, 255, 0.05)',
                  cursor: selected ? 'pointer' : 'default',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'all 200ms ease',
                  opacity: complete ? 1 : 0.95,
                }}
              >
                <div style={{ fontSize: '1.4rem', minWidth: 30 }}>{slotNum}</div>
                <div>
                  {slots[slotNum] ? (
                    <div style={{ fontWeight: 600 }}>{slots[slotNum]}</div>
                  ) : (
                    <div className="small-note">Empty slot</div>
                  )}
                </div>
              </button>
              {i < 4 && (
                <div style={{
                  textAlign: 'center',
                  padding: '4px 0',
                  fontSize: '1.2rem',
                  animation: complete ? `flowArrow 1.2s ease-in-out infinite` : 'none',
                  animationDelay: complete ? `${i * 200}ms` : 'none',
                }}>
                  ↓
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <p className="metric-label">Available Steps</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 12 }}>
          {unplacedSteps.map((step) => (
            <button
              key={step}
              type="button"
              className={`small-button${selected === step ? ' selected' : ''}`}
              onClick={() => handleSelectCard(step)}
            >
              {step}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <p className="small-note">{Object.keys(slots).length} / {workflowSteps.length} steps placed</p>
        <div className="core-meter">
          <div className="core-fill" style={{ width: `${(Object.keys(slots).length / workflowSteps.length) * 100}%` }} />
        </div>
        <p className={`status-chip ${correct && allFilled ? 'success-state' : ''}`}>
          {correct && allFilled ? '⚙️ Machine workflow activated!' : 'Place steps in the correct order.'}
        </p>
        <button
          className="button-primary"
          onClick={() => {
            if (reviewOpen) {
              onComplete();
            } else if (allFilled && correct) {
              handleComplete();
            }
          }}
          disabled={!correct || !allFilled}
        >
          {reviewOpen ? 'Proceed to next district' : 'Complete Mission'}
        </button>
      </div>

      <ReviewPanel
        description={sectionData.description}
        realWorld={sectionData.realWorld}
        onAdvance={onComplete}
        ready={reviewOpen}
      />
    </div>
  );
}

function FinalMissionSection({ onComplete }: { onComplete: () => void }) {
  const sectionData = sections.find((item) => item.key === 'finalMission')!;
  const [gateOpen, setGateOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<'challenge' | 'battle'>('challenge');
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [launchingBattle, setLaunchingBattle] = useState(false);

  const sensors = [
    { label: 'Door', icon: '🚪', isCorrect: true },
    { label: 'Window', icon: '🪟', isCorrect: false },
    { label: 'Traffic', icon: '🚦', isCorrect: false },
    { label: 'Light', icon: '💡', isCorrect: false },
    { label: 'Temp', icon: '🌡️', isCorrect: false },
    { label: 'Sound', icon: '🔊', isCorrect: false },
  ];

  const patterns = [
    { id: 'A', sequence: '2 → 4 → 6 → 8 → 10', correct: true },
    { id: 'B', sequence: '5 → 10 → 15 → 21 → 25', correct: false, hint: '21 should be 20' },
    { id: 'C', sequence: '3 → 6 → 9 → 12 → 15', correct: true },
  ];

  const dataQuestion = 'A log of temperature readings every hour for 30 days: 22°C, 23°C, 21°C, 24°C...';
  const dataOptions = ['📝 Text Data', '⏱️ Time-Series Data', '🗺️ Spatial Data'];

  const energyTrend = [
    { day: 'Mon', usage: 22 },
    { day: 'Tue', usage: 24 },
    { day: 'Wed', usage: 26 },
    { day: 'Thu', usage: 29 },
  ];

  const handleSensorTap = (label: string) => {
    // Single-select toggle: select a sensor or deselect it
    setAnswers((prev) => ({
      ...prev,
      challenge1: prev.challenge1 === label ? '' : label,
    }));
    playSound('click');
  };

  const challenge1Complete = answers.challenge1 === 'Door';
  const challenge2Complete = answers.challenge2 === '30';
  const challenge3Complete = answers.challenge3 === '⏱️ Time-Series Data';
  const challenge4Complete = answers.challenge4 === 'B';

  const allChallengesComplete = challenge1Complete && challenge2Complete && challenge3Complete && challenge4Complete;

  const handleSubmit = () => {
    if (allChallengesComplete) {
      playSound('power');
      setLaunchingBattle(true);
    } else {
      playSound('error');
      setIncorrectAttempts((prev) => prev + 1);
    }
  };

  if (launchingBattle) return (
    <NovaGate
      lines={[
        'Systems online. Powering up the Guardian AI...',
        'This is it — the Boss Battle begins. Use all your skills and stay sharp!',
      ]}
      onDone={() => { setLaunchingBattle(false); setPhase('battle'); }}
    />
  );

  if (phase === 'battle') {
    return <BossBattle onVictory={onComplete} />;
  }

  if (!gateOpen) return (
    <NovaGate
      lines={[
        'ALERT! The AI Core has 4 corrupted systems. NeoCity is going dark!',
        'Use everything you\'ve learned — Classification, Prediction, Data Types, and Pattern Recognition.',
        'Each challenge restores one system. All 4 correct = Boss Battle unlocked. Go!',
      ]}
      onDone={() => setGateOpen(true)}
    />
  );
  return (
    <div className="task-grid">
      <div className="card">
        <p className="metric-label">🎯 FINAL MISSION</p>
        <h3 className="h2">The AI Core is Corrupted</h3>
        <p className="small-note">Solve all 4 challenges to restore each system. You have one chance per challenge.</p>
        <div style={{ marginTop: 16 }}>
          <p className="small-note">Systems Restored: {[challenge1Complete, challenge2Complete, challenge3Complete, challenge4Complete].filter(Boolean).length} / 4</p>
          <div className="core-meter">
            <div className="core-fill" style={{ width: `${([challenge1Complete, challenge2Complete, challenge3Complete, challenge4Complete].filter(Boolean).length / 4) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Challenge 1: Classify Sensor Alerts */}
      <div className="card">
        <p className="metric-label">Challenge 1: Classify Sensors</p>
        <p>Tap ONLY the DOOR sensors. The system is misfiring.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 12 }}>
          {sensors.map((sensor) => {
            const isSelected = answers.challenge1?.includes(sensor.label);
            return (
              <button
                key={sensor.label}
                type="button"
                onClick={() => handleSensorTap(sensor.label)}
                disabled={challenge1Complete}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border: isSelected ? '2px solid rgba(94, 252, 130, 0.8)' : '2px solid rgba(75, 155, 255, 0.3)',
                  background: isSelected && sensor.isCorrect ? 'rgba(94, 252, 130, 0.15)' : isSelected && !sensor.isCorrect ? 'rgba(255, 100, 100, 0.15)' : 'rgba(75, 155, 255, 0.05)',
                  textAlign: 'center',
                  cursor: challenge1Complete ? 'default' : 'pointer',
                  opacity: challenge1Complete && !isSelected ? 0.5 : 1,
                }}
              >
                <div style={{ fontSize: '1.4rem' }}>{sensor.icon}</div>
                <div style={{ fontSize: '0.85rem' }}>{sensor.label}</div>
                {isSelected && (sensor.isCorrect ? '✓' : '✗')}
              </button>
            );
          })}
        </div>
        {challenge1Complete && <div style={{ marginTop: 8, color: '#5efca2' }}>✓ Challenge 1 Complete</div>}
      </div>

      {/* Challenge 2: Predict Energy Demand */}
      <div className="card">
        <p className="metric-label">Challenge 2: Predict Energy</p>
        <p>Energy trend is rising. Predict tomorrow's demand.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12 }}>
          {['28', '30', '32'].map((option) => (
            <button
              key={option}
              type="button"
              className={`small-button${answers.challenge2 === option ? ' selected' : ''}`}
              onClick={() => { setAnswers((prev) => ({ ...prev, challenge2: option })); playSound('click'); }}
              disabled={challenge2Complete}
            >
              {option} units
            </button>
          ))}
        </div>
        {challenge2Complete && <div style={{ marginTop: 8, color: '#5efca2' }}>✓ Challenge 2 Complete</div>}
      </div>

      {/* Challenge 3: Choose Dataset Type */}
      <div className="card">
        <p className="metric-label">Challenge 3: Identify Data Type</p>
        <p>{dataQuestion}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12 }}>
          {dataOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`small-button${answers.challenge3 === option ? ' selected' : ''}`}
              onClick={() => { setAnswers((prev) => ({ ...prev, challenge3: option })); playSound('click'); }}
              disabled={challenge3Complete}
            >
              {option.split(' ')[0]}
              <br />
              <span style={{ fontSize: '0.85rem' }}>{option.split(' ').slice(1).join(' ')}</span>
            </button>
          ))}
        </div>
        {challenge3Complete && <div style={{ marginTop: 8, color: '#5efca2' }}>✓ Challenge 3 Complete</div>}
      </div>

      {/* Challenge 4: Spot Broken Pattern */}
      <div className="card">
        <p className="metric-label">Challenge 4: Find the Broken Pattern</p>
        <p>One pattern has a broken step. Which one?</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginTop: 12 }}>
          {patterns.map((pattern) => (
            <button
              key={pattern.id}
              type="button"
              onClick={() => { setAnswers((prev) => ({ ...prev, challenge4: pattern.id })); playSound('click'); }}
              disabled={challenge4Complete}
              style={{
                padding: 12,
                borderRadius: 8,
                border: answers.challenge4 === pattern.id ? '2px solid rgba(94, 252, 130, 0.8)' : '2px solid rgba(75, 155, 255, 0.3)',
                background: answers.challenge4 === pattern.id && pattern.correct ? 'rgba(94, 252, 130, 0.15)' : answers.challenge4 === pattern.id && !pattern.correct ? 'rgba(255, 100, 100, 0.15)' : 'rgba(75, 155, 255, 0.05)',
                textAlign: 'left',
                cursor: challenge4Complete ? 'default' : 'pointer',
              }}
            >
              <div style={{ fontWeight: 600 }}>Pattern {pattern.id}: {pattern.sequence}</div>
              {answers.challenge4 === pattern.id && (pattern.correct ? '✓ Correct' : `✗ Broken: ${pattern.hint}`)}
            </button>
          ))}
        </div>
        {challenge4Complete && <div style={{ marginTop: 8, color: '#5efca2' }}>✓ Challenge 4 Complete</div>}
      </div>

      <div className="card">
        <p className={`status-chip ${allChallengesComplete ? 'success-state' : ''}`}>
          {allChallengesComplete ? '⚡ All challenges solved! Ready to face the final guardian.' : incorrectAttempts > 0 ? 'Keep trying. You\'ve got this!' : 'Solve all 4 challenges to restore the core.'}
        </p>
        <button
          className="button-primary"
          onClick={handleSubmit}
          disabled={!allChallengesComplete}
        >
          {allChallengesComplete ? 'Engage Final Battle' : 'Check Answers'}
        </button>
      </div>
    </div>
  );
}

export default App;
