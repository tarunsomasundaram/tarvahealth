import { motion } from "framer-motion";
import { Pill, Check, X, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/hooks/use-haptics";

export interface Medication {
  id: string;
  name: string;
  strength: string;
  instructions?: string;
  scheduledTime: string;
  status: "pending" | "taken" | "missed" | "skipped" | "late";
  takenTime?: string;
  source?: "case" | "manual";
}

interface MedicationCardProps {
  medication: Medication;
  onMarkTaken?: () => void;
  onSkip?: () => void;
  showActions?: boolean;
}

export function MedicationCard({
  medication,
  onMarkTaken,
  onSkip,
  showActions = true,
}: MedicationCardProps) {
  const { name, strength, instructions, scheduledTime, status, takenTime, source } = medication;

  const isPending = status === "pending";

  return (
    <motion.div 
      className="card-tarva"
      whileTap={{ scale: 0.98 }}
      layout
    >
      <div className="flex items-start gap-4">
        <motion.div 
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <Pill className="h-6 w-6 text-primary" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground">{name}</h3>
              <p className="text-caption">{strength}</p>
            </div>
            <span className="badge-time shrink-0">{scheduledTime}</span>
          </div>
          {instructions && (
            <p className="mt-1 text-small">{instructions}</p>
          )}
          
          {status === "taken" && (
            <motion.div 
              className="mt-2 flex items-center gap-2"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="badge-taken">
                <Check className="h-3 w-3" />
                Taken at {takenTime}
              </span>
              {source === "case" && (
                <span className="badge-pill text-xs">
                  <Smartphone className="h-3 w-3" />
                  Case
                </span>
              )}
            </motion.div>
          )}
          
          {status === "late" && (
            <motion.span 
              className="badge-late mt-2 inline-flex"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              Late
            </motion.span>
          )}
          
          {status === "missed" && (
            <motion.span 
              className="badge-missed mt-2 inline-flex"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              Missed
            </motion.span>
          )}
        </div>
      </div>

      {showActions && isPending && (
        <motion.div 
          className="mt-4 flex gap-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <motion.button 
            onClick={() => {
              triggerHaptic('light');
              onSkip?.();
            }} 
            className="btn-secondary flex-1"
            whileTap={{ scale: 0.95 }}
          >
            <X className="h-4 w-4" />
            Skip
          </motion.button>
          <motion.button 
            onClick={() => {
              triggerHaptic('success');
              onMarkTaken?.();
            }} 
            className="btn-primary flex-1"
            whileTap={{ scale: 0.95 }}
          >
            <Check className="h-4 w-4" />
            Mark Taken
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
