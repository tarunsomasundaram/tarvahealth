import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pill, Check, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMedication, Medication } from "@/contexts/MedicationContext";
import { triggerHaptic } from "@/hooks/use-haptics";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface RefillSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication?: Medication | null;
}

export function RefillSheet({ open, onOpenChange, medication }: RefillSheetProps) {
  const { updateMedication } = useMedication();
  const [refillAmount, setRefillAmount] = useState(30);

  const handleRefill = () => {
    if (!medication) return;
    
    triggerHaptic("success");
    
    const newRemaining = medication.remainingDoses + refillAmount;
    updateMedication(medication.id, { 
      remainingDoses: newRemaining 
    });
    
    onOpenChange(false);
    setRefillAmount(30);
  };

  const adjustAmount = (delta: number) => {
    triggerHaptic("light");
    setRefillAmount(prev => Math.max(1, prev + delta));
  };

  const presetAmounts = [7, 14, 30, 60, 90];

  if (!medication) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-center">Log Refill</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 pb-6">
          {/* Medication Info */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-accent">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
              <Pill className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{medication.genericName}</h4>
              <p className="text-caption">
                {medication.strengthValue}{medication.strengthUnit} • Currently {medication.remainingDoses} doses
              </p>
            </div>
          </div>

          {/* Amount Selector */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Refill Amount</label>
            
            <div className="flex items-center justify-center gap-4">
              <motion.button
                onClick={() => adjustAmount(-10)}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary"
                whileTap={{ scale: 0.9 }}
              >
                <Minus className="h-5 w-5" />
              </motion.button>
              
              <div className="text-center min-w-[100px]">
                <span className="text-4xl font-bold text-foreground">{refillAmount}</span>
                <p className="text-caption">doses</p>
              </div>
              
              <motion.button
                onClick={() => adjustAmount(10)}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary"
                whileTap={{ scale: 0.9 }}
              >
                <Plus className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Preset Amounts */}
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {presetAmounts.map((amount) => (
                <motion.button
                  key={amount}
                  onClick={() => {
                    triggerHaptic("light");
                    setRefillAmount(amount);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    refillAmount === amount
                      ? "bg-gradient-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  {amount}
                </motion.button>
              ))}
            </div>
          </div>

          {/* New Total */}
          <div className="p-4 rounded-xl bg-secondary text-center">
            <p className="text-caption mb-1">New Total</p>
            <p className="text-2xl font-bold text-foreground">
              {medication.remainingDoses + refillAmount} doses
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <motion.button
              onClick={() => onOpenChange(false)}
              className="btn-secondary flex-1"
              whileTap={{ scale: 0.97 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={handleRefill}
              className="btn-primary flex-1"
              whileTap={{ scale: 0.97 }}
            >
              <Check className="h-4 w-4" />
              Confirm Refill
            </motion.button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
