import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DoseMarker {
  id: string;
  status: "taken" | "missed" | "late" | "pending" | "skipped" | "snoozed";
}

interface CalendarGridProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  dosesByDate: Record<string, DoseMarker[]>;
}

export function CalendarGrid({ selectedDate, onSelectDate, dosesByDate }: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getStatusColor = (status: DoseMarker["status"]) => {
    switch (status) {
      case "taken": return "bg-success";
      case "missed": return "bg-destructive";
      case "late": return "bg-warning";
      case "snoozed": return "bg-amber-500";
      default: return "bg-muted-foreground";
    }
  };

  return (
    <div className="card-tarva">
      <div className="flex items-center justify-between mb-4">
        <button onClick={previousMonth} className="btn-ghost p-2">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-section text-foreground">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <button onClick={nextMonth} className="btn-ghost p-2">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const doses = dosesByDate[dateKey] || [];
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-xl p-2 min-h-[52px] transition-all",
                !isCurrentMonth && "opacity-30",
                isSelected && "bg-gradient-primary text-primary-foreground shadow-button",
                !isSelected && isToday && "bg-accent",
                !isSelected && !isToday && "hover:bg-secondary"
              )}
            >
              <span className={cn(
                "text-sm font-medium",
                isSelected ? "text-primary-foreground" : "text-foreground"
              )}>
                {format(day, "d")}
              </span>
              {doses.length > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {doses.slice(0, 3).map((dose, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isSelected ? "bg-primary-foreground/70" : getStatusColor(dose.status)
                      )}
                    />
                  ))}
                  {doses.length > 3 && (
                    <span className={cn(
                      "text-[9px] font-medium",
                      isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      +{doses.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
