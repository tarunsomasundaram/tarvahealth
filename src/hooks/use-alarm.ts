import { useState, useEffect, useCallback, useRef } from 'react';
import { triggerHaptic } from '@/hooks/use-haptics';
import { getSelectedAlarmId, getAlarmSound, getEarlyAlarmMinutes } from '@/data/alarmSounds';

// Force full reload on HMR to prevent React hook queue corruption
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    window.location.reload();
  });
}

interface AlarmDose {
  id: string;
  medicationId: string;
  medicationName: string;
  strengthValue: number | null;
  strengthUnit: string | null;
  form: string;
  scheduledTime: Date;
  displayTime: string;
}

export function useAlarm() {
  const [alarmDose, setAlarmDose] = useState<AlarmDose | null>(null);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const vibrationInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const checkedTimesRef = useRef<Set<string>>(new Set());

  // Start continuous vibration loop
  const startVibration = useCallback(() => {
    if (vibrationInterval.current) return;
    // Vibrate every 1.5s in a strong pattern
    const vibrate = () => {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([300, 100, 300, 100, 400, 150, 300, 100, 300]);
        } catch { /* ignore */ }
      }
    };
    vibrate();
    vibrationInterval.current = setInterval(vibrate, 1500);
  }, []);

  const stopVibration = useCallback(() => {
    if (vibrationInterval.current) {
      clearInterval(vibrationInterval.current);
      vibrationInterval.current = null;
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(0); } catch { /* ignore */ }
    }
  }, []);

  // Start alarm sound using Web Audio API with selected alarm pattern
  const startSound = useCallback(() => {
    try {
      const sound = getAlarmSound(getSelectedAlarmId());
      const { frequencies, type, noteDuration, noteGap, cyclePause, gain: vol } = sound.pattern;

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);
      gainNode.gain.value = vol;

      let playing = true;

      const playTone = async () => {
        if (!playing) return;
        for (const freq of frequencies) {
          if (!playing) break;
          const osc = ctx.createOscillator();
          osc.type = type;
          osc.frequency.value = freq;
          osc.connect(gainNode);
          osc.start();
          await new Promise(r => setTimeout(r, noteDuration));
          osc.stop();
          osc.disconnect();
          if (noteGap > 0) {
            await new Promise(r => setTimeout(r, noteGap));
          }
        }
        if (playing) {
          setTimeout(playTone, cyclePause);
        }
      };

      playTone();

      // Store cleanup ref
      (audioRef as any)._cleanup = () => {
        playing = false;
        try { ctx.close(); } catch { /* ignore */ }
      };
    } catch {
      console.log('Web Audio not supported');
    }
  }, []);

  const stopSound = useCallback(() => {
    if ((audioRef as any)?._cleanup) {
      (audioRef as any)._cleanup();
      (audioRef as any)._cleanup = null;
    }
  }, []);

  // Trigger alarm for a dose
  const triggerAlarm = useCallback((dose: AlarmDose) => {
    setAlarmDose(dose);
    setIsAlarmActive(true);
    startVibration();
    startSound();
  }, [startVibration, startSound]);

  // Dismiss alarm (called by taken/skip/snooze actions)
  const dismissAlarm = useCallback(() => {
    setIsAlarmActive(false);
    setAlarmDose(null);
    stopVibration();
    stopSound();
    triggerHaptic('success');
  }, [stopVibration, stopSound]);

  // Check scheduled doses and auto-trigger alarm
  const checkForDueAlarms = useCallback((doses: Array<{
    id: string;
    medicationId: string;
    medicationName: string;
    strengthValue: number | null;
    strengthUnit: string | null;
    form: string;
    scheduledTime: Date;
    displayTime: string;
    status: string;
  }>) => {
    if (isAlarmActive) return; // Don't interrupt active alarm

    const now = new Date();
    for (const dose of doses) {
      if (dose.status !== 'pending') continue;
      const key = `${dose.medicationId}_${dose.scheduledTime.toISOString()}`;
      if (checkedTimesRef.current.has(key)) continue;

      const earlyMs = getEarlyAlarmMinutes() * 60000;
      const diffMs = now.getTime() - dose.scheduledTime.getTime();
      // Trigger if dose is due (within early-alarm window to 60s after)
      if (diffMs >= -earlyMs && diffMs < 60000) {
        checkedTimesRef.current.add(key);
        triggerAlarm(dose);
        break;
      }
    }
  }, [isAlarmActive, triggerAlarm]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVibration();
      stopSound();
    };
  }, [stopVibration, stopSound]);

  return {
    alarmDose,
    isAlarmActive,
    triggerAlarm,
    dismissAlarm,
    checkForDueAlarms,
  };
}
