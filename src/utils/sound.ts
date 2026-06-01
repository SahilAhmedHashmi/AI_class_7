const AudioContextClass = typeof window !== 'undefined' ? (window.AudioContext || (window as any).webkitAudioContext) : null;
const audioContext = AudioContextClass ? new AudioContextClass() : null;

function createTone(frequency: number, duration = 0.12, type: OscillatorType = 'sine') {
  if (!audioContext) return;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration + 0.02);
}

export function playSound(type: 'click' | 'success' | 'error' | 'drop' | 'boss' | 'power') {
  if (!audioContext) return;

  switch (type) {
    case 'click':
      createTone(520, 0.06, 'triangle');
      break;
    case 'success':
      createTone(880, 0.14, 'sine');
      setTimeout(() => createTone(1040, 0.10, 'sine'), 80);
      break;
    case 'error':
      createTone(220, 0.16, 'square');
      break;
    case 'drop':
      createTone(400, 0.08, 'triangle');
      break;
    case 'boss':
      createTone(280, 0.10, 'sawtooth');
      break;
    case 'power':
      createTone(620, 0.10, 'triangle');
      break;
    default:
      break;
  }
}
