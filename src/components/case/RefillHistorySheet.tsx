import { motion } from "framer-motion";
import { Pill, Package, Calendar, TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useMedication, Medication, RefillLog } from "@/contexts/MedicationContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StaggerContainer, StaggerItem } from "@/components/animations";

interface RefillHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication?: Medication | null;
}

export function RefillHistorySheet({ open, onOpenChange, medication }: RefillHistorySheetProps) {
  const { getRefillLogsForMedication } = useMedication();

  if (!medication) return null;

  const refillHistory = getRefillLogsForMedication(medication.id);

  const formatDate = (datetime: string) => {
    return format(parseISO(datetime), "MMM d, yyyy");
  };

  const formatTime = (datetime: string) => {
    return format(parseISO(datetime), "h:mm a");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[80vh]">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-center">Refill History</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 pb-6 overflow-y-auto max-h-[60vh]">
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

          {/* Stats Summary */}
          {refillHistory.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-secondary text-center">
                <TrendingUp className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-lg font-bold text-foreground">{refillHistory.length}</p>
                <p className="text-xs text-muted-foreground">Total Refills</p>
              </div>
              <div className="p-3 rounded-xl bg-secondary text-center">
                <Package className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-lg font-bold text-foreground">
                  {refillHistory.reduce((sum, log) => sum + log.refillAmount, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Doses Added</p>
              </div>
            </div>
          )}

          {/* History List */}
          {refillHistory.length > 0 ? (
            <StaggerContainer className="space-y-2">
              {refillHistory.map((log) => (
                <StaggerItem key={log.id}>
                  <motion.div
                    className="p-4 rounded-xl bg-card border border-border"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/15">
                          <Package className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            +{log.refillAmount} doses
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(log.refillDatetime)} at {formatTime(log.refillDatetime)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {log.previousDoses} → {log.newTotalDoses}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Package className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">No refills yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Refills will appear here when you log them
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
