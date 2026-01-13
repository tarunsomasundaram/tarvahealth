import { Pill, Check, X, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Medication {
  id: string;
  name: string;
  strength: string;
  instructions?: string;
  scheduledTime: string;
  status: "pending" | "taken" | "missed" | "skipped" | "late";
  takenTime?: string;
  source?: "case" | "manual";
}

interface MedicationCardProps {
  medication: Medication;
  onMarkTaken?: () => void;
  onSkip?: () => void;
  showActions?: boolean;
}

export function MedicationCard({
  medication,
  onMarkTaken,
  onSkip,
  showActions = true,
}: MedicationCardProps) {
  const { name, strength, instructions, scheduledTime, status, takenTime, source } = medication;

  const isPending = status === "pending";

  return (
    <div className="card-tarva animate-slide-up">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent">
          <Pill className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground">{name}</h3>
              <p className="text-caption">{strength}</p>
            </div>
            <span className="badge-time shrink-0">{scheduledTime}</span>
          </div>
          {instructions && (
            <p className="mt-1 text-small">{instructions}</p>
          )}
          
          {status === "taken" && (
            <div className="mt-2 flex items-center gap-2">
              <span className="badge-taken">
                <Check className="h-3 w-3" />
                Taken at {takenTime}
              </span>
              {source === "case" && (
                <span className="badge-pill text-xs">
                  <Smartphone className="h-3 w-3" />
                  Case
                </span>
              )}
            </div>
          )}
          
          {status === "late" && (
            <span className="badge-late mt-2 inline-flex">
              Late
            </span>
          )}
          
          {status === "missed" && (
            <span className="badge-missed mt-2 inline-flex">
              Missed
            </span>
          )}
        </div>
      </div>

      {showActions && isPending && (
        <div className="mt-4 flex gap-3">
          <button onClick={onSkip} className="btn-secondary flex-1">
            <X className="h-4 w-4" />
            Skip
          </button>
          <button onClick={onMarkTaken} className="btn-primary flex-1">
            <Check className="h-4 w-4" />
            Mark Taken
          </button>
        </div>
      )}
    </div>
  );
}
