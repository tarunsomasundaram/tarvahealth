import { motion, AnimatePresence } from "framer-motion";
import { Pill, Check, X, Clock, MapPin, Bell } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AlarmDose {
  id: string;
  medicationId: string;
  medicationName: string;
  strengthValue: number | null;
  strengthUnit: string | null;
  form: string;
  scheduledTime: Date;
  displayTime: string;
  instructions?: string;
}

interface AlarmOverlayProps {
  isActive: boolean;
  dose: AlarmDose | null;
  onMarkTaken: () => void;
  onSkip: () => void;
  onSnooze: () => void;
  onTakenElsewhere: () => void;
}

export function AlarmOverlay({
  isActive,
  dose,
  onMarkTaken,
  onSkip,
  onSnooze,
  onTakenElsewhere,
}: AlarmOverlayProps) {
  if (!dose) return null;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-background/98 backdrop-blur-xl" />

          {/* Pulsing ring */}
          <motion.div
            className="absolute"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="h-48 w-48 rounded-full border-2 border-primary/30" />
          </motion.div>
          <motion.div
            className="absolute"
            animate={{
              scale: [1, 1.6, 1],
              opacity: [0.2, 0, 0.2],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <div className="h-48 w-48 rounded-full border-2 border-primary/20" />
          </motion.div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center px-8 w-full max-w-sm">
            {/* Icon */}
            <motion.div
              className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-primary mb-8"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ boxShadow: 'var(--shadow-button)' }}
            >
              <Bell className="h-14 w-14 text-white" />
            </motion.div>

            {/* Time */}
            <motion.p
              className="text-caption mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {format(new Date(), 'h:mm a')}
            </motion.p>

            {/* Medication name */}
            <motion.h1
              className="text-title-large text-foreground text-center mb-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {dose.medicationName}
            </motion.h1>

            {/* Strength / form / pill count */}
            <motion.p
              className="text-body text-muted-foreground text-center mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {dose.strengthValue && `${dose.strengthValue}${dose.strengthUnit} `}{dose.form}
              {dose.instructions && /^\d/.test(dose.instructions) && ` · ${dose.instructions.split(' ').slice(0, 2).join(' ')}`}
            </motion.p>

            {/* Instructions */}
            {dose.instructions && (
              <motion.p
                className="text-sm text-primary font-medium text-center mb-2 px-4 py-2 rounded-xl bg-primary/10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                {dose.instructions}
              </motion.p>
            )}

            {/* Scheduled time badge */}
            <motion.div
              className="badge-time mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Clock className="h-3.5 w-3.5" />
              Scheduled for {dose.displayTime}
            </motion.div>

            {/* Primary actions */}
            <motion.div
              className="w-full space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button
                onClick={onMarkTaken}
                className="btn-primary w-full py-4 text-base"
                whileTap={{ scale: 0.96 }}
              >
                <Check className="h-5 w-5" />
                Mark as Taken
              </motion.button>

              <div className="flex gap-3">
                <motion.button
                  onClick={onSnooze}
                  className="btn-secondary flex-1 py-3"
                  whileTap={{ scale: 0.96 }}
                >
                  <Clock className="h-4 w-4" />
                  Snooze
                </motion.button>
                <motion.button
                  onClick={onSkip}
                  className="btn-secondary flex-1 py-3"
                  whileTap={{ scale: 0.96 }}
                >
                  <X className="h-4 w-4" />
                  Skip
                </motion.button>
              </div>

              <motion.button
                onClick={onTakenElsewhere}
                className="btn-ghost w-full py-3 text-sm"
                whileTap={{ scale: 0.96 }}
              >
                <MapPin className="h-4 w-4" />
                Taken elsewhere
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
