import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { format, startOfWeek, addDays, addWeeks, isSameDay } from "date-fns";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useHaptics } from "@/hooks/use-haptics";

interface WeekPickerProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  navigateToCalendar?: boolean;
}

export function WeekPicker({ selectedDate, onSelectDate, navigateToCalendar }: WeekPickerProps) {
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
      // Swipe right → previous week
      setDirection(-1);
      const newDate = addWeeks(selectedDate, -1);
      onSelectDate(newDate);
      trigger("light");
    } else {
      // Swipe left → next week
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
