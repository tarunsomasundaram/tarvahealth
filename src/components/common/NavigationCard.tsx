import { ChevronRight } from "lucide-react";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavigationCardProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  to: string;
  iconBg?: string;
}

export function NavigationCard({ title, subtitle, icon, to, iconBg }: NavigationCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className="card-tarva-interactive w-full text-left"
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          iconBg || "bg-accent"
        )}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-foreground">{title}</h4>
          {subtitle && <p className="text-caption">{subtitle}</p>}
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </button>
  );
}
