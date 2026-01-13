import { BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProgressCardProps {
  taken: number;
  total: number;
}

export function ProgressCard({ taken, total }: ProgressCardProps) {
  const navigate = useNavigate();
  const percentage = total > 0 ? Math.round((taken / total) * 100) : 0;

  return (
    <div className="card-hero animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">Today's Progress</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-5xl font-bold">{taken}</span>
            <span className="text-2xl text-white/70">/ {total}</span>
          </div>
          <p className="mt-1 text-sm text-white/70">doses completed</p>
        </div>
        <button
          onClick={() => navigate("/stats")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/30"
          aria-label="View stats"
        >
          <BarChart3 className="h-5 w-5 text-white" />
        </button>
      </div>
      <div className="mt-5">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="mt-2 text-right text-sm text-white/70">{percentage}% complete</p>
      </div>
    </div>
  );
}
