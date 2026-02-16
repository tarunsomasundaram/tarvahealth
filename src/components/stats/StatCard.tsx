import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  iconBgClassName?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  accentColor?: "success" | "primary" | "warning" | "destructive";
  qualityColor?: "success" | "warning" | "destructive";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBgClassName,
  trend,
  trendValue,
  className,
  accentColor,
  qualityColor,
}: StatCardProps) {
  // Use qualityColor for card chrome (accent bar, glow, value text), keep icon colors unchanged
  const cardColor = qualityColor || accentColor;
  return (
    <div
      className={cn(
        "card-tarva relative overflow-hidden h-full",
        className
      )}
    >
      {/* Top accent bar */}
      {cardColor && (
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-[3px] rounded-t-[18px]",
            cardColor === "success" && "bg-success",
            cardColor === "primary" && "bg-primary",
            cardColor === "warning" && "bg-warning",
            cardColor === "destructive" && "bg-destructive",
          )}
        />
      )}
      {/* Subtle background glow */}
      {cardColor && (
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-16 opacity-[0.07] pointer-events-none",
            cardColor === "success" && "bg-gradient-to-b from-success to-transparent",
            cardColor === "primary" && "bg-gradient-to-b from-primary to-transparent",
            cardColor === "warning" && "bg-gradient-to-b from-warning to-transparent",
            cardColor === "destructive" && "bg-gradient-to-b from-destructive to-transparent",
          )}
        />
      )}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-caption uppercase tracking-wider text-[11px] font-semibold">{title}</p>
          <p className={cn(
            "mt-1.5 text-[28px] font-bold leading-none",
            cardColor === "success" && "text-success",
            cardColor === "primary" && "text-primary",
            cardColor === "warning" && "text-warning",
            cardColor === "destructive" && "text-destructive",
            !cardColor && "text-foreground",
          )}>{value}</p>
          {subtitle && <p className="mt-1 text-small">{subtitle}</p>}
          {trend && trendValue && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                  "text-xs font-medium px-1.5 py-0.5 rounded-md",
                  trend === "up" && "text-success bg-success/10",
                  trend === "down" && "text-destructive bg-destructive/10",
                  trend === "neutral" && "text-muted-foreground bg-muted"
                )}
              >
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            iconBgClassName || "bg-accent"
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
