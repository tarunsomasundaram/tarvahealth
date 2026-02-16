export interface AlarmSound {
  id: string;
  name: string;
  description: string;
  // Each sound is defined by oscillator parameters
  pattern: {
    frequencies: number[];
    type: OscillatorType;
    noteDuration: number; // ms per note
    noteGap: number; // ms between notes
    cyclePause: number; // ms between full cycles
    gain: number;
  };
}

export const alarmSounds: AlarmSound[] = [
  {
    id: 'gentle-chime',
    name: 'Gentle Chime',
    description: 'Soft ascending tones',
    pattern: {
      frequencies: [523, 659, 784],
      type: 'sine',
      noteDuration: 200,
      noteGap: 100,
      cyclePause: 1200,
      gain: 0.2,
    },
  },
  {
    id: 'morning-bell',
    name: 'Morning Bell',
    description: 'Warm two-tone bell',
    pattern: {
      frequencies: [440, 554],
      type: 'sine',
      noteDuration: 300,
      noteGap: 150,
      cyclePause: 1500,
      gain: 0.25,
    },
  },
  {
    id: 'soft-pulse',
    name: 'Soft Pulse',
    description: 'Rhythmic low pulse',
    pattern: {
      frequencies: [330, 330, 440],
      type: 'sine',
      noteDuration: 150,
      noteGap: 80,
      cyclePause: 1000,
      gain: 0.2,
    },
  },
  {
    id: 'crystal',
    name: 'Crystal',
    description: 'High clarity tones',
    pattern: {
      frequencies: [784, 988, 1175],
      type: 'sine',
      noteDuration: 180,
      noteGap: 120,
      cyclePause: 1400,
      gain: 0.15,
    },
  },
  {
    id: 'bamboo',
    name: 'Bamboo',
    description: 'Natural hollow tone',
    pattern: {
      frequencies: [392, 494, 392],
      type: 'triangle',
      noteDuration: 220,
      noteGap: 100,
      cyclePause: 1300,
      gain: 0.25,
    },
  },
  {
    id: 'ripple',
    name: 'Ripple',
    description: 'Cascading gentle notes',
    pattern: {
      frequencies: [523, 587, 659, 784],
      type: 'sine',
      noteDuration: 140,
      noteGap: 60,
      cyclePause: 1100,
      gain: 0.2,
    },
  },
  {
    id: 'beacon',
    name: 'Beacon',
    description: 'Steady guiding tone',
    pattern: {
      frequencies: [660, 880],
      type: 'sine',
      noteDuration: 250,
      noteGap: 200,
      cyclePause: 1600,
      gain: 0.22,
    },
  },
  {
    id: 'zen',
    name: 'Zen',
    description: 'Calm meditative ping',
    pattern: {
      frequencies: [528],
      type: 'sine',
      noteDuration: 400,
      noteGap: 0,
      cyclePause: 2000,
      gain: 0.18,
    },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Warm rising sweep',
    pattern: {
      frequencies: [349, 440, 523, 659],
      type: 'sine',
      noteDuration: 160,
      noteGap: 80,
      cyclePause: 1200,
      gain: 0.2,
    },
  },
  {
    id: 'alert',
    name: 'Alert',
    description: 'Clear attention tone',
    pattern: {
      frequencies: [880, 1100, 880],
      type: 'sine',
      noteDuration: 120,
      noteGap: 50,
      cyclePause: 600,
      gain: 0.3,
    },
  },
];

export const DEFAULT_ALARM_ID = 'gentle-chime';

export const EARLY_ALARM_OPTIONS = [0, 1, 2, 3, 5, 10, 15] as const;
export type EarlyAlarmMinutes = typeof EARLY_ALARM_OPTIONS[number];

export function getSelectedAlarmId(): string {
  return localStorage.getItem('tarva-alarm-sound') || DEFAULT_ALARM_ID;
}

export function setSelectedAlarmId(id: string): void {
  localStorage.setItem('tarva-alarm-sound', id);
}

export function getEarlyAlarmMinutes(): EarlyAlarmMinutes {
  const val = localStorage.getItem('tarva-early-alarm');
  return val ? (Number(val) as EarlyAlarmMinutes) : 0;
}

export function setEarlyAlarmMinutes(minutes: EarlyAlarmMinutes): void {
  localStorage.setItem('tarva-early-alarm', String(minutes));
}

export function getAlarmSound(id: string): AlarmSound {
  return alarmSounds.find(s => s.id === id) || alarmSounds[0];
}

/** Play a short preview of an alarm sound. Returns a stop function. */
export function previewAlarmSound(sound: AlarmSound): () => void {
  let playing = true;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return () => {};
    const ctx = new AudioCtx();
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
    gainNode.gain.value = sound.pattern.gain;

    const play = async () => {
      for (const freq of sound.pattern.frequencies) {
        if (!playing) break;
        const osc = ctx.createOscillator();
        osc.type = sound.pattern.type;
        osc.frequency.value = freq;
        osc.connect(gainNode);
        osc.start();
        await new Promise(r => setTimeout(r, sound.pattern.noteDuration));
        osc.stop();
        osc.disconnect();
        if (sound.pattern.noteGap > 0) {
          await new Promise(r => setTimeout(r, sound.pattern.noteGap));
        }
      }
    };

    play();

    return () => {
      playing = false;
      try { ctx.close(); } catch { /* ignore */ }
    };
  } catch {
    return () => {};
  }
}
