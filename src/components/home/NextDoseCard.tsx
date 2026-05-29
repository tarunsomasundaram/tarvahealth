import { motion } from "framer-motion";
import { Pill, Check, Clock } from "lucide-react";
import { triggerHaptic } from "@/hooks/use-haptics";
import { formatDistanceToNowStrict, isPast } from "date-fns";
import { useEffect, useState } from "react";

interface NextDoseCardProps {
  medicationName: string;
  strength: string;
  scheduledTime: Date;
  displayTime: string;
  count?: number; // number of meds in this slot (for stacked)
  onMarkTaken: () => void;
}

export function NextDoseCard({
  medicationName,
  strength,
  scheduledTime,
  displayTime,
  count = 1,
  onMarkTaken,
}: NextDoseCardProps) {
  const [, force] = useState(0);

  // Re-render every 30s so "in 5m" stays fresh
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const due = isPast(scheduledTime);
  const relative = due
    ? `${formatDistanceToNowStrict(scheduledTime)} late`
    : `in ${formatDistanceToNowStrict(scheduledTime)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[20px] border border-border bg-gradient-to-br from-primary/15 via-card to-card p-5 shadow-sm"
    >
      <div
        className={`absolute top-0 left-0 right-0 h-[3px] ${due ? "bg-warning" : "bg-primary"}`}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Next Dose
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-background/60 px-2.5 py-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">{displayTime}</span>
        </div>
      </div>

      <div className="flex items-start gap-4 mb-5">
        <motion.div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20"
          whileHover={{ scale: 1.05 }}
        >
          <Pill className="h-7 w-7 text-primary" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-foreground leading-tight">
            {count > 1 ? `${count} medications` : medicationName}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {count > 1 ? `Due together at ${displayTime}` : strength}
          </p>
          <p className={`mt-1.5 text-xs font-medium ${due ? "text-warning" : "text-primary"}`}>
            {relative}
          </p>
        </div>
      </div>

      <motion.button
        onClick={() => {
          triggerHaptic("success");
          onMarkTaken();
        }}
        className="btn-primary w-full py-3.5 text-base font-semibold"
        whileTap={{ scale: 0.97 }}
      >
        <Check className="h-5 w-5" />
        {count > 1 ? `Mark all ${count} taken` : "Mark Taken"}
      </motion.button>
    </motion.div>
  );
}
