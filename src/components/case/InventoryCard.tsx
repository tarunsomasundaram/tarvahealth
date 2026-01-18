import { Pill, AlertTriangle, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface InventoryCardProps {
  medicationName: string;
  strength: string;
  remaining: number;
  refillThreshold: number;
  compartment?: string;
  refillQuantity?: number;
}

export function InventoryCard({
  medicationName,
  strength,
  remaining,
  refillThreshold,
  compartment,
  refillQuantity = 30,
}: InventoryCardProps) {
  const isLow = remaining <= refillThreshold;
  const isCritical = remaining <= Math.ceil(refillThreshold / 2);
  const maxDoses = refillQuantity;
  const percentage = Math.min((remaining / maxDoses) * 100, 100);

  return (
    <div className="card-tarva">
      <div className="flex items-start gap-4">
        <div className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          isLow ? "bg-warning/15" : "bg-accent"
        )}>
          <Pill className={cn("h-5 w-5", isLow ? "text-warning" : "text-primary")} />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">{medicationName}</h4>
                {compartment && (
                  <span className="badge-pill text-xs">
                    <Package className="h-3 w-3" />
                    Slot {compartment}
                  </span>
                )}
              </div>
              <p className="text-caption">{strength}</p>
            </div>
            <div className="text-right">
              <span className={cn(
                "text-lg font-bold",
                isLow ? "text-warning" : "text-foreground"
              )}>{remaining}</span>
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
            <div className="mt-1 flex items-center justify-between">
              <p className="text-small">Refill at {refillThreshold} doses</p>
              {isLow && (
                <span className="text-xs font-medium text-warning">Tap to refill</span>
              )}
            </div>
          </div>

          {isCritical && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-warning">Critical - refill now</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
