import { motion } from "framer-motion";
import { Clock, Bell } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { triggerHaptic } from "@/hooks/use-haptics";
import type { ScheduledDose } from "@/contexts/MedicationContext";

interface SnoozeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dose: ScheduledDose | null;
  onSnooze: (minutes: number) => void;
}

const snoozeOptions = [
  { minutes: 5, label: "5 minutes" },
  { minutes: 10, label: "10 minutes" },
  { minutes: 15, label: "15 minutes" },
  { minutes: 30, label: "30 minutes" },
];

export function SnoozeSheet({ open, onOpenChange, dose, onSnooze }: SnoozeSheetProps) {
  const handleSnooze = (minutes: number) => {
    triggerHaptic('light');
    onSnooze(minutes);
    onOpenChange(false);
  };

  if (!dose) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold">{dose.medication.genericName}</p>
              <p className="text-sm text-muted-foreground font-normal">
                Snooze reminder
              </p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-2 pb-6">
          {snoozeOptions.map((option) => (
            <motion.button
              key={option.minutes}
              onClick={() => handleSnooze(option.minutes)}
              className="flex w-full items-center gap-4 rounded-2xl bg-secondary p-4 text-left transition-colors hover:bg-secondary/80"
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium text-foreground">{option.label}</span>
            </motion.button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
