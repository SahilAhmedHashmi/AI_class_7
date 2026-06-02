import { useEffect, useMemo, useRef, useState } from 'react';
import { playSound } from '../utils/sound';
import { BossArena } from './BossArena';
import { HealthBar } from './HealthBar';
import { QuestionPanel } from './QuestionPanel';
import type { BossQuestion } from './QuestionPanel';
import { DialogueBox } from './DialogueBox';
import { BattleEffects } from './BattleEffects';
import './battle.css';

export type { BossQuestion } from './QuestionPanel';

const BOSS_TAUNTS = [
  'You are too late, human.',
  'Logic belongs to me.',
  'Your knowledge is insufficient.',
  'You cannot surpass superior intelligence.',
  'I have already calculated your defeat.',
];

const HERO_LINES = [
  'Hold steady, hero.',
  'This is our last strike!',
  'Aetherion cannot withstand this.',
  'Keep your focus on the core.',
  'One more correct answer will break it.',
];

interface BossBattleProps {
  questions: BossQuestion[];
  onBossDamage?: () => void;
  onVictory?: () => void;
}

export function BossBattle({ questions, onBossDamage, onVictory }: BossBattleProps) {
  const [heroHp, setHeroHp] = useState(100);
  const [bossHp, setBossHp] = useState(100);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'intro' | 'question' | 'heroAttack' | 'bossAttack' | 'finalCharge' | 'finalBlast' | 'bossDeath' | 'heroDefeat'>('intro');
  const [locked, setLocked] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [dialogue, setDialogue] = useState('AETHERION: I will reduce your assessment to ashes.');
  const [bossTaunt, setBossTaunt] = useState(BOSS_TAUNTS[0]);
  const timeoutIds = useRef<number[]>([]);

  const scheduleTimeout = (callback: () => void, delay: number) => {
    const id = window.setTimeout(callback, delay);
    timeoutIds.current.push(id);
    return id;
  };

  useEffect(() => {
    return () => {
      timeoutIds.current.forEach(window.clearTimeout);
      timeoutIds.current = [];
    };
  }, []);

  const currentQuestion = questions[currentIndex];
  const finalQuestion = currentIndex === questions.length - 1;

  useEffect(() => {
    setBossTaunt(BOSS_TAUNTS[Math.floor(Math.random() * BOSS_TAUNTS.length)]);
  }, [currentIndex]);

  useEffect(() => {
    if (phase === 'intro') {
      scheduleTimeout(() => {
        setDialogue('AETHERION: Welcome to your final assessment.');
      }, 900);
      scheduleTimeout(() => {
        setDialogue('Hero: Focus the core, strike with everything you know.');
        setPhase('question');
      }, 2200);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'bossDeath') {
      scheduleTimeout(() => {
        onVictory?.();
      }, 5200);
    }
  }, [phase, onVictory]);

  const handleAnswer = (option: string) => {
    if (locked || phase !== 'question') return;
    setLocked(true);
    setSelectedOption(option);
    setShowExplanation(true);

    const correct = option === currentQuestion.correct;
    if (correct) {
      setFeedback('correct');
      setDialogue(finalQuestion ? 'Hero: This is the final blow!' : 'Hero: Direct hit on the core!');

      if (finalQuestion) {
        setPhase('finalCharge');
        setDialogue('Hero: Core energy is rising. Brace for the final beam!');
        playSound('power');
        scheduleTimeout(() => {
          setPhase('finalBlast');
          setBossHp(0);
          setDialogue('AETHERION: No... this cannot be!');
          playSound('success');
        }, 1800);
        scheduleTimeout(() => {
          setPhase('bossDeath');
        }, 3600);
        return;
      }

      setPhase('heroAttack');
      playSound('power');
      scheduleTimeout(() => {
        setBossHp((prev) => Math.max(0, prev - 25));
        onBossDamage?.();
      }, 900);
      scheduleTimeout(() => {
        setDialogue('AETHERION: Impossible...');
      }, 1400);
      scheduleTimeout(() => {
        setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
        setLocked(false);
        setFeedback(null);
        setShowExplanation(false);
        setPhase('question');
        setDialogue(HERO_LINES[Math.floor(Math.random() * HERO_LINES.length)]);
      }, 2600);
      return;
    }

    setFeedback('incorrect');
    setDialogue('AETHERION: Your logic fails.');
    setPhase('bossAttack');
    playSound('boss');
    scheduleTimeout(() => {
      setHeroHp((prev) => {
        const next = Math.max(0, prev - 20);
        if (next === 0) {
          setPhase('heroDefeat');
          setDialogue('AETHERION: Mission failed. Return to the module and try again.');
        } else {
          setPhase('question');
          setLocked(false);
          setFeedback(null);
          setShowExplanation(false);
          setDialogue(bossTaunt);
        }
        return next;
      });
    }, 1800);
    return;
  };

  const resetBattle = () => {
    setHeroHp(100);
    setBossHp(100);
    setCurrentIndex(0);
    setPhase('intro');
    setLocked(false);
    setSelectedOption(null);
    setFeedback(null);
    setShowExplanation(false);
    setDialogue('AETHERION: You dare challenge me again?');
  };

  const battleClass = `boss-battle-shell ${phase}`;

  const bossSegments = 10;

  return (
    <div className={battleClass}>
      <div className={`cinematic-bars ${phase !== 'question' ? 'show' : ''}`} />
      <div className={`cinematic-bars bottom ${phase !== 'question' ? 'show' : ''}`} />

      <div className="hud">
        <div className="hud-left">
          <div className="player-face">HERO</div>
          <div className="player-hp">HP {heroHp}%</div>
        </div>
        <div className="hud-center">
          <div className="boss-name">AETHERION, THE OVERMIND AI</div>
          <div className="hud-sub">FINAL SHOWDOWN — Question {currentIndex + 1}/{questions.length}</div>
        </div>
        <div className="hud-right">
          <div className="boss-label">CORE</div>
          <div className="hp-segments">
            {Array.from({ length: bossSegments }).map((_, i) => {
              const threshold = Math.round(((i + 1) / bossSegments) * 100);
              const filled = bossHp >= threshold;
              return <span key={i} className={`segment ${filled ? 'filled' : ''}`} />;
            })}
          </div>
        </div>
      </div>

      <BossArena phase={phase} bossHealth={bossHp} heroHealth={heroHp} finalAttack={phase === 'finalBlast'} bossDamaged={phase === 'heroAttack' || phase === 'finalBlast'} heroDamaged={phase === 'bossAttack'} />

      <DialogueBox
        speaker={phase === 'bossAttack' || phase === 'bossDeath' ? 'AETHERION' : 'HERO'}
        line={dialogue}
        subline={
          phase === 'question'
            ? bossTaunt
            : phase === 'finalCharge'
            ? 'Energy spikes across the arena.'
            : phase === 'finalBlast'
            ? 'The beam tears through AETHERION.'
            : undefined
        }
      />

      <QuestionPanel
        question={currentQuestion}
        onSelect={handleAnswer}
        selectedOption={selectedOption}
        locked={locked || phase !== 'question'}
        feedback={feedback}
        showExplanation={showExplanation}
      />

      <BattleEffects phase={phase} bossDamage={phase === 'heroAttack'} heroDamage={phase === 'bossAttack'} finalBlast={phase === 'finalBlast'} />

      {phase === 'bossDeath' && (
        <div className="dialogue-box victory-sequence">
          <div className="dialogue-header">
            <span className="dialogue-speaker">SYSTEM</span>
          </div>
          <div className="dialogue-line">AETHERION DEFEATED — MISSION COMPLETE</div>
          <div className="dialogue-subline">AI MASTER ACHIEVED</div>
        </div>
      )}

      {phase === 'heroDefeat' && (
        <div className="dialogue-box defeat-panel">
          <div className="dialogue-header">
            <span className="dialogue-speaker">SYSTEM</span>
          </div>
          <div className="dialogue-line">MISSION FAILED — AETHERION PREVAILS</div>
          <div className="dialogue-subline">Retry the battle or return to the module.</div>
          <div className="question-options">
            <button className="question-option" onClick={resetBattle}>Retry Battle</button>
            <button className="question-option" onClick={resetBattle}>Return to Module</button>
          </div>
        </div>
      )}
    </div>
  );
}
