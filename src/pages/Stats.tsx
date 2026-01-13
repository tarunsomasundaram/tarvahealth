import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { FilterChips } from "@/components/common/FilterChips";
import { StatCard } from "@/components/stats/StatCard";
import { AdherenceChart } from "@/components/stats/AdherenceChart";
import { Target, Clock, Zap, AlertTriangle, Smartphone, RefreshCw, Moon, Watch } from "lucide-react";

const timeFilters = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "1y", label: "1Y" },
];

const weeklyData = [
  { day: "Mon", adherence: 100 },
  { day: "Tue", adherence: 80 },
  { day: "Wed", adherence: 100 },
  { day: "Thu", adherence: 60 },
  { day: "Fri", adherence: 100 },
  { day: "Sat", adherence: 100 },
  { day: "Sun", adherence: 80 },
];

export default function Stats() {
  const [timeFilter, setTimeFilter] = useState("7d");

  return (
    <div className="page-padding">
      <PageHeader title="Stats" subtitle="Your adherence insights" />

      <div className="section-gap">
        <FilterChips
          options={timeFilters}
          selected={timeFilter}
          onSelect={setTimeFilter}
        />

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="Adherence Rate"
            value="89%"
            subtitle="doses taken"
            icon={<Target className="h-5 w-5 text-primary" />}
            trend="up"
            trendValue="+5%"
          />
          <StatCard
            title="On-time Rate"
            value="76%"
            subtitle="within window"
            icon={<Clock className="h-5 w-5 text-primary" />}
            trend="neutral"
            trendValue="same"
          />
          <StatCard
            title="Current Streak"
            value="12"
            subtitle="days"
            icon={<Zap className="h-5 w-5 text-primary" />}
            trend="up"
            trendValue="best yet!"
          />
          <StatCard
            title="Avg. Delay"
            value="8m"
            subtitle="minutes late"
            icon={<AlertTriangle className="h-5 w-5 text-primary" />}
            trend="down"
            trendValue="-3m"
          />
        </div>

        <AdherenceChart data={weeklyData} />

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="Case Detection"
            value="94%"
            subtitle="auto-detected"
            icon={<Smartphone className="h-5 w-5 text-primary" />}
          />
          <StatCard
            title="Refill Rate"
            value="100%"
            subtitle="on time"
            icon={<RefreshCw className="h-5 w-5 text-primary" />}
          />
        </div>

        <div className="card-tarva">
          <h3 className="text-section text-foreground mb-2">Most Missed Time</h3>
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

        <section>
          <h3 className="text-section text-foreground mb-3">Connect Health Trackers</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Apple Health", connected: true },
              { name: "Apple Watch", connected: false },
              { name: "Fitbit", connected: false },
              { name: "Whoop", connected: false },
            ].map((tracker) => (
              <button
                key={tracker.name}
                className="card-tarva-interactive flex items-center gap-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                  <Watch className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{tracker.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {tracker.connected ? "Connected" : "Tap to connect"}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <p className="mt-3 text-caption text-center">
            Use activity/sleep context to improve reminders
          </p>
        </section>
      </div>
    </div>
  );
}
