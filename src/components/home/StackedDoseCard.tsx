import { motion } from "framer-motion";
import { Pill, Check, X, Clock, Layers } from "lucide-react";
import { triggerHaptic } from "@/hooks/use-haptics";

interface StackedItem {
  id: string;
  medicationName: string;
  strength: string;
}

interface StackedDoseCardProps {
  displayTime: string;
  items: StackedItem[];
  onMarkAllTaken: () => void;
  onSkipAll: () => void;
}

export function StackedDoseCard({
  displayTime,
  items,
  onMarkAllTaken,
  onSkipAll,
}: StackedDoseCardProps) {
  return (
    <motion.div className="card-tarva relative overflow-hidden" layout whileTap={{ scale: 0.99 }}>
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary rounded-t-[18px]" />

      <div className="flex items-start gap-4">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent">
          <Pill className="h-6 w-6 text-primary" />
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {items.length}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                {items.length} medications due
              </h3>
              <p className="text-caption">All at the same time</p>
            </div>
            <span className="badge-time shrink-0">
              <Clock className="h-3 w-3" />
              {displayTime}
            </span>
          </div>

          <ul className="mt-3 space-y-1.5">
            {items.map((it) => (
              <li
                key={it.id}
                className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2 text-sm"
              >
                <span className="font-medium text-foreground truncate">{it.medicationName}</span>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">{it.strength}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <motion.div
        className="mt-4 flex gap-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.button
          onClick={() => {
            triggerHaptic("light");
            onSkipAll();
          }}
          className="btn-secondary flex-1"
          whileTap={{ scale: 0.95 }}
        >
          <X className="h-4 w-4" />
          Skip all
        </motion.button>
        <motion.button
          onClick={() => {
            triggerHaptic("success");
            onMarkAllTaken();
          }}
          className="btn-primary flex-1"
          whileTap={{ scale: 0.95 }}
        >
          <Check className="h-4 w-4" />
          Mark all taken
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
