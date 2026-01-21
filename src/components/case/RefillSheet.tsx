import { useState } from "react";
import { motion } from "framer-motion";
import { Pill, Check, Plus, Minus, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useData, Medication } from "@/contexts/DataContext";
import { triggerHaptic } from "@/hooks/use-haptics";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { RefillHistorySheet } from "./RefillHistorySheet";

interface RefillSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication?: Medication | null;
}

export function RefillSheet({ open, onOpenChange, medication }: RefillSheetProps) {
  const { logRefill, getRefillLogsForMedication, getInventoryForMedication } = useData();
  const [refillAmount, setRefillAmount] = useState(30);
  const [historyOpen, setHistoryOpen] = useState(false);

  const refillCount = medication ? getRefillLogsForMedication(medication.id).length : 0;
  const remainingDoses = medication ? (getInventoryForMedication(medication.id)?.doses_remaining ?? 0) : 0;

  const handleRefill = () => {
    if (!medication) return;
    
    triggerHaptic("success");
    
    const previousQuantity = remainingDoses;
    const newQuantity = remainingDoses + refillAmount;
    logRefill(medication.id, refillAmount, previousQuantity, newQuantity);
    
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
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">{medication.generic_name}</h4>
              <p className="text-caption">
                {medication.strength_value ?? ""}{medication.strength_unit ?? ""} • Currently {remainingDoses} doses
              </p>
            </div>
            {refillCount > 0 && (
              <motion.button
                onClick={() => setHistoryOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium text-foreground"
                whileTap={{ scale: 0.95 }}
              >
                <History className="h-4 w-4" />
                {refillCount}
              </motion.button>
            )}
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
              {remainingDoses + refillAmount} doses
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

          {/* View History Link */}
          <motion.button
            onClick={() => setHistoryOpen(true)}
            className="w-full text-center text-sm text-primary font-medium py-2"
            whileTap={{ scale: 0.98 }}
          >
            <History className="h-4 w-4 inline mr-1.5" />
            View Refill History
          </motion.button>
        </div>
      </SheetContent>

      {/* Refill History Sheet */}
      <RefillHistorySheet
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        medication={medication}
      />
    </Sheet>
  );
}
