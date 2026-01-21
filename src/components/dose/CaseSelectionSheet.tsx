import { motion } from "framer-motion";
import { Pill, Smartphone } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { triggerHaptic } from "@/hooks/use-haptics";
import type { ScheduledDose } from "@/contexts/DataContext";
import { format } from "date-fns";

interface CaseSelectionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doses: ScheduledDose[];
  onSelect: (dose: ScheduledDose) => void | Promise<void>;
}

export function CaseSelectionSheet({ 
  open, 
  onOpenChange, 
  doses, 
  onSelect 
}: CaseSelectionSheetProps) {
  const handleSelect = async (dose: ScheduledDose) => {
    triggerHaptic('success');
    await onSelect(dose);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <SheetTitle>Case opened</SheetTitle>
              <SheetDescription>
                Which medication did you take?
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-2 pb-6">
          {doses.map((dose) => (
            <motion.button
              key={dose.id}
              onClick={() => handleSelect(dose)}
              className="flex w-full items-center gap-4 rounded-2xl bg-secondary p-4 text-left transition-colors hover:bg-secondary/80"
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                <Pill className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  {dose.medicationName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {dose.strengthValue}{dose.strengthUnit}
                </p>
              </div>
              <span className="badge-time">{format(dose.scheduledTime, "h:mm a")}</span>
            </motion.button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
