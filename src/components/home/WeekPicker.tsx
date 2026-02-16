import { cn } from "@/lib/utils";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { useNavigate } from "react-router-dom";

interface WeekPickerProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  navigateToCalendar?: boolean;
}

export function WeekPicker({ selectedDate, onSelectDate, navigateToCalendar }: WeekPickerProps) {
  const navigate = useNavigate();
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleDayClick = (day: Date) => {
    onSelectDate(day);
    if (navigateToCalendar) {
      navigate(`/calendar?date=${format(day, 'yyyy-MM-dd')}`);
    }
  };

  return (
    <div className="flex items-center justify-between gap-1">
      {days.map((day) => {
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, new Date());

        return (
          <button
            key={day.toISOString()}
            onClick={() => handleDayClick(day)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-2xl py-3 transition-all",
              isSelected
                ? "bg-gradient-primary text-primary-foreground shadow-button"
                : isToday
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-secondary"
            )}
          >
            <span className="text-xs font-medium uppercase">
              {format(day, "EEE")}
            </span>
            <span className={cn("text-lg font-semibold", isSelected && "text-primary-foreground")}>
              {format(day, "d")}
            </span>
          </button>
        );
      })}
    </div>
  );
}
