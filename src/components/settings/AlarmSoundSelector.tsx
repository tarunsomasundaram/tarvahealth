import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Check, Play, Square, Clock } from 'lucide-react';
import { alarmSounds, getSelectedAlarmId, setSelectedAlarmId, previewAlarmSound, EARLY_ALARM_OPTIONS, getEarlyAlarmMinutes, setEarlyAlarmMinutes, type EarlyAlarmMinutes } from '@/data/alarmSounds';
import { triggerHaptic } from '@/hooks/use-haptics';
import { cn } from '@/lib/utils';

interface AlarmSoundSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AlarmSoundSelector({ open, onOpenChange }: AlarmSoundSelectorProps) {
  const [selected, setSelected] = useState(getSelectedAlarmId);
  const [earlyMinutes, setEarlyMinutes] = useState<EarlyAlarmMinutes>(getEarlyAlarmMinutes);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  // Cleanup on close
  useEffect(() => {
    if (!open) {
      stopRef.current?.();
      stopRef.current = null;
      setPlayingId(null);
    }
  }, [open]);

  const handlePreview = (id: string) => {
    triggerHaptic('light');
    // Stop current preview
    stopRef.current?.();
    stopRef.current = null;

    if (playingId === id) {
      setPlayingId(null);
      return;
    }

    const sound = alarmSounds.find(s => s.id === id);
    if (!sound) return;

    const stop = previewAlarmSound(sound);
    stopRef.current = stop;
    setPlayingId(id);

    // Auto-stop after the pattern plays once
    const totalDuration = sound.pattern.frequencies.length * (sound.pattern.noteDuration + sound.pattern.noteGap) + 200;
    setTimeout(() => {
      setPlayingId(prev => prev === id ? null : prev);
    }, totalDuration);
  };

  const handleSelect = (id: string) => {
    triggerHaptic('medium');
    setSelected(id);
    setSelectedAlarmId(id);
  };
  const handleEarlyChange = (min: EarlyAlarmMinutes) => {
    triggerHaptic('light');
    setEarlyMinutes(min);
    setEarlyAlarmMinutes(min);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh]">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-center">Alarm Sound</SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto max-h-[60vh] -mx-2 px-2 space-y-4 pb-6">
          {/* Early Alarm Setting */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Early Alarm</p>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Alert before the scheduled dose time</p>
            <div className="flex flex-wrap gap-2">
              {EARLY_ALARM_OPTIONS.map((min) => (
                <motion.button
                  key={min}
                  onClick={() => handleEarlyChange(min)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-sm font-medium transition-colors",
                    earlyMinutes === min
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  {min === 0 ? 'At time' : `${min} min`}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <p className="text-sm font-medium text-foreground mb-2">Alarm Sound</p>
          </div>

          {alarmSounds.map((sound) => {
            const isSelected = selected === sound.id;
            const isPlaying = playingId === sound.id;

            return (
              <motion.div
                key={sound.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-2xl transition-colors cursor-pointer",
                  isSelected
                    ? "bg-primary/10 border border-primary/20"
                    : "bg-secondary/50 border border-transparent hover:bg-secondary"
                )}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(sound.id)}
              >
                {/* Play/Stop button */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview(sound.id);
                  }}
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                    isPlaying ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground"
                  )}
                  whileTap={{ scale: 0.9 }}
                >
                  {isPlaying ? (
                    <Square className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 ml-0.5" />
                  )}
                </motion.button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{sound.name}</p>
                  <p className="text-xs text-muted-foreground">{sound.description}</p>
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary"
                  >
                    <Check className="h-3.5 w-3.5 text-primary-foreground" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
