import { motion } from "framer-motion";
import { Pill, Plus, Sparkles } from "lucide-react";
import { triggerHaptic } from "@/hooks/use-haptics";

interface EmptyMedicationsStateProps {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  onAdd: () => void;
}

export function EmptyMedicationsState({
  title = "Start in under a minute",
  subtitle = "Add your first medication and we'll handle the reminders, refills, and tracking for you.",
  ctaLabel = "Add your first medication",
  onAdd,
}: EmptyMedicationsStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[20px] border border-border bg-gradient-to-br from-primary/10 via-card to-card p-8 text-center"
    >
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/15 ring-1 ring-primary/20"
        >
          <Pill className="h-10 w-10 text-primary" />
          <motion.div
            className="absolute"
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 15, -10, 0] }}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{ translate: "32px -28px" }}
          >
            <Sparkles className="h-5 w-5 text-primary" />
          </motion.div>
        </motion.div>

        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground leading-relaxed">
          {subtitle}
        </p>

        <motion.button
          onClick={() => {
            triggerHaptic("light");
            onAdd();
          }}
          className="btn-primary mt-6 w-full py-3"
          whileTap={{ scale: 0.97 }}
        >
          <Plus className="h-4 w-4" />
          {ctaLabel}
        </motion.button>

        <p className="mt-3 text-xs text-muted-foreground">Takes about 30 seconds</p>
      </div>
    </motion.div>
  );
}
