import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { format, startOfWeek, addDays, addWeeks, isSameDay } from "date-fns";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useHaptics } from "@/hooks/use-haptics";

interface DoseStatus {
  status: "taken" | "missed" | "pending" | "skipped" | "snoozed";
}

interface WeekPickerProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  navigateToCalendar?: boolean;
  getDosesForDate?: (date: Date) => DoseStatus[];
}

export function WeekPicker({ selectedDate, onSelectDate, navigateToCalendar, getDosesForDate }: WeekPickerProps) {
  const navigate = useNavigate();
  const { trigger } = useHaptics();
  const [direction, setDirection] = useState(0);
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleDayClick = (day: Date) => {
    onSelectDate(day);
    if (navigateToCalendar) {
      navigate(`/calendar?date=${format(day, 'yyyy-MM-dd')}`);
    }
  };

  const handleSwipe = useCallback((_: any, info: PanInfo) => {
    const threshold = 50;
    if (Math.abs(info.offset.x) < threshold) return;

    if (info.offset.x > 0) {
      setDirection(-1);
      const newDate = addWeeks(selectedDate, -1);
      onSelectDate(newDate);
      trigger("light");
    } else {
      setDirection(1);
      const newDate = addWeeks(selectedDate, 1);
      onSelectDate(newDate);
      trigger("light");
    }
  }, [selectedDate, onSelectDate, trigger]);

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  const getDotColor = (status: string, isSelected: boolean) => {
    switch (status) {
      case "taken": return isSelected ? "bg-primary-foreground" : "bg-success";
      case "missed": return isSelected ? "bg-primary-foreground/70" : "bg-destructive";
      case "skipped": return isSelected ? "bg-primary-foreground/50" : "bg-muted-foreground";
      case "pending": return isSelected ? "bg-primary-foreground/40" : "bg-primary/40";
      default: return isSelected ? "bg-primary-foreground/40" : "bg-muted-foreground/40";
    }
  };

  return (
    <div className="overflow-hidden">
      <AnimatePresence mode="popLayout" custom={direction} initial={false}>
        <motion.div
          key={weekStart.toISOString()}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleSwipe}
          className="flex items-center justify-between gap-1"
        >
          {days.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const doses = getDosesForDate ? getDosesForDate(day) : [];
            // Show up to 3 dots max
            const displayDoses = doses.slice(0, 3);

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
                {displayDoses.length > 0 && (
                  <div className="flex items-center gap-[3px] mt-0.5">
                    {displayDoses.map((dose, i) => (
                      <span
                        key={i}
                        className={cn(
                          "h-[5px] w-[5px] rounded-full transition-colors",
                          getDotColor(dose.status, isSelected)
                        )}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
