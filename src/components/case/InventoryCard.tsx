import { Pill, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface InventoryCardProps {
  medicationName: string;
  strength: string;
  remaining: number;
  refillThreshold: number;
}

export function InventoryCard({
  medicationName,
  strength,
  remaining,
  refillThreshold,
}: InventoryCardProps) {
  const isLow = remaining <= refillThreshold;
  const isCritical = remaining <= Math.ceil(refillThreshold / 2);
  const maxDoses = 30; // Assumed max for meter display
  const percentage = Math.min((remaining / maxDoses) * 100, 100);

  return (
    <div className="card-tarva">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent">
          <Pill className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-foreground">{medicationName}</h4>
              <p className="text-caption">{strength}</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-foreground">{remaining}</span>
              <p className="text-small">doses left</p>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="meter-bar">
              <div
                className={cn(
                  "meter-fill",
                  isCritical && "critical",
                  isLow && !isCritical && "low"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="mt-1 text-small">Refill threshold: {refillThreshold} doses</p>
          </div>

          {isLow && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Refill soon</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
