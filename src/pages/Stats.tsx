import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { FilterChips } from "@/components/common/FilterChips";
import { StatCard } from "@/components/stats/StatCard";
import { AdherenceChart } from "@/components/stats/AdherenceChart";
import { AdherenceRing } from "@/components/stats/AdherenceRing";
import { Target, Clock, Zap, AlertTriangle, Moon } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { subDays, subMonths, subYears, format, eachDayOfInterval } from "date-fns";

const timeFilters = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "1y", label: "1Y" },
];

export default function Stats() {
  const [timeFilter, setTimeFilter] = useState("7d");
  const { getAdherenceRate, getOnTimeRate, getScheduledDosesForDate, doseLogs } = useData();

  const dateRange = useMemo(() => {
    const endDate = new Date();
    let startDate: Date;
    switch (timeFilter) {
      case "7d": startDate = subDays(endDate, 7); break;
      case "30d": startDate = subDays(endDate, 30); break;
      case "90d": startDate = subMonths(endDate, 3); break;
      case "1y": startDate = subYears(endDate, 1); break;
      default: startDate = subDays(endDate, 7);
    }
    return { startDate, endDate };
  }, [timeFilter]);

  const adherenceRate = getAdherenceRate(dateRange.startDate, dateRange.endDate);
  const onTimeRate = getOnTimeRate(dateRange.startDate, dateRange.endDate);

  const currentStreak = useMemo(() => {
    let streak = 0;
    let date = new Date();
    for (let i = 0; i < 365; i++) {
      const doses = getScheduledDosesForDate(date);
      const hasDoses = doses.length > 0;
      const allTaken = doses.every(d => d.status === 'taken');
      if (hasDoses && allTaken) { streak++; date = subDays(date, 1); }
      else if (hasDoses) { break; }
      else { date = subDays(date, 1); }
    }
    return streak;
  }, [getScheduledDosesForDate]);

  const avgDelay = useMemo(() => {
    const takenLogs = doseLogs.filter(l => l.event_type === 'taken' && l.status === 'late');
    if (takenLogs.length === 0) return 0;
    const totalDelay = takenLogs.reduce((sum, log) => {
      const scheduled = new Date(log.scheduled_datetime);
      const actual = new Date(log.event_datetime);
      return sum + (actual.getTime() - scheduled.getTime()) / (1000 * 60);
    }, 0);
    return Math.round(totalDelay / takenLogs.length);
  }, [doseLogs]);

  const weeklyData = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
    return days.map(day => {
      const doses = getScheduledDosesForDate(day);
      const takenCount = doses.filter(d => d.status === 'taken').length;
      const totalCount = doses.filter(d => d.status !== 'pending').length;
      const adherence = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100;
      return { day: format(day, 'EEE'), adherence };
    });
  }, [getScheduledDosesForDate]);

  const caseDetectionRate = useMemo(() => {
    const takenLogs = doseLogs.filter(l => l.event_type === 'taken');
    if (takenLogs.length === 0) return 0;
    const caseCount = takenLogs.filter(l => l.source === 'case').length;
    return Math.round((caseCount / takenLogs.length) * 100);
  }, [doseLogs]);

  const adherenceLabel = adherenceRate >= 90 ? "Excellent" : adherenceRate >= 70 ? "Good" : adherenceRate >= 50 ? "Fair" : "Needs Work";

  // Quality color logic: green=good, yellow=medium, red=bad
  const adherenceQuality: "success" | "warning" | "destructive" = 
    adherenceRate >= 80 ? "success" : adherenceRate >= 50 ? "warning" : "destructive";
  const onTimeQuality: "success" | "warning" | "destructive" = 
    onTimeRate >= 80 ? "success" : onTimeRate >= 50 ? "warning" : "destructive";
  const streakQuality: "success" | "warning" | "destructive" = 
    currentStreak >= 7 ? "success" : currentStreak >= 3 ? "warning" : "destructive";
  const delayQuality: "success" | "warning" | "destructive" = 
    avgDelay <= 5 ? "success" : avgDelay <= 15 ? "warning" : "destructive";

  return (
    <AnimatedPage>
      <div className="page-padding">
        <PageHeader title="Stats" subtitle="Your adherence insights" />

        <div className="section-gap">
          <FadeIn delay={0.1}>
            <FilterChips
              options={timeFilters}
              selected={timeFilter}
              onSelect={setTimeFilter}
            />
          </FadeIn>

          <StaggerContainer className="grid grid-cols-2 gap-3">
            <StaggerItem>
              <StatCard
                title="Adherence"
                value={`${adherenceRate}%`}
                subtitle="doses taken"
                icon={<Target className="h-5 w-5 text-success" />}
                iconBgClassName="bg-success/15"
                trend={adherenceRate >= 80 ? "up" : "down"}
                trendValue={adherenceRate >= 80 ? "Good" : "Needs work"}
                accentColor="success"
                qualityColor={adherenceQuality}
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="On-time"
                value={`${onTimeRate}%`}
                subtitle="within window"
                icon={<Clock className="h-5 w-5 text-primary" />}
                iconBgClassName="bg-primary/15"
                trend={onTimeRate >= 70 ? "up" : "neutral"}
                trendValue={onTimeRate >= 70 ? "Great" : "Improve"}
                accentColor="primary"
                qualityColor={onTimeQuality}
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Streak"
                value={`${currentStreak}`}
                subtitle="days"
                icon={<Zap className="h-5 w-5 text-warning" />}
                iconBgClassName="bg-warning/15"
                trend="up"
                trendValue={currentStreak > 7 ? "Best yet!" : "Keep going"}
                accentColor="warning"
                qualityColor={streakQuality}
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Avg. Delay"
                value={`${avgDelay}m`}
                subtitle="minutes late"
                icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
                iconBgClassName="bg-destructive/15"
                trend={avgDelay <= 10 ? "down" : "up"}
                trendValue={avgDelay <= 10 ? "On track" : "Late"}
                accentColor="destructive"
                qualityColor={delayQuality}
              />
            </StaggerItem>
          </StaggerContainer>

          <FadeIn delay={0.35}>
            <AdherenceChart data={weeklyData} />
          </FadeIn>

          <FadeIn delay={0.45}>
            <div className="card-tarva relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-warning rounded-t-[18px]" />
              <h3 className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Most Missed Time</h3>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/15">
                  <Moon className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Evening doses</p>
                  <p className="text-caption">10:00 PM slot has the most misses</p>
                </div>
              </div>
            </div>
          </FadeIn>

        </div>
      </div>
    </AnimatedPage>
  );
}
