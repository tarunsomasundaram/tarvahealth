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

  const accentColor = isCritical ? "bg-destructive" : isLow ? "bg-warning" : "bg-success";

  return (
    <div className="card-tarva relative overflow-hidden">
      <div className={cn("absolute top-0 left-0 right-0 h-[3px] rounded-t-[18px]", accentColor)} />
      <div className="flex items-start gap-4">
        <div className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          isCritical ? "bg-destructive/15" : isLow ? "bg-warning/15" : "bg-success/15"
        )}>
          <Pill className={cn("h-5 w-5", isCritical ? "text-destructive" : isLow ? "text-warning" : "text-success")} />
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
                isCritical ? "text-destructive" : isLow ? "text-warning" : "text-success"
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
                <span className={cn("text-xs font-medium", isCritical ? "text-destructive" : "text-warning")}>
                  {isCritical ? "Refill now" : "Tap to refill"}
                </span>
              )}
            </div>
          </div>

          {isCritical && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">Critical - refill now</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
