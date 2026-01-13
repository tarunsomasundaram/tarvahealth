import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
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
                title="Adherence Rate"
                value="89%"
                subtitle="doses taken"
                icon={<Target className="h-5 w-5 text-primary" />}
                trend="up"
                trendValue="+5%"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="On-time Rate"
                value="76%"
                subtitle="within window"
                icon={<Clock className="h-5 w-5 text-primary" />}
                trend="neutral"
                trendValue="same"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Current Streak"
                value="12"
                subtitle="days"
                icon={<Zap className="h-5 w-5 text-primary" />}
                trend="up"
                trendValue="best yet!"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Avg. Delay"
                value="8m"
                subtitle="minutes late"
                icon={<AlertTriangle className="h-5 w-5 text-primary" />}
                trend="down"
                trendValue="-3m"
              />
            </StaggerItem>
          </StaggerContainer>

          <FadeIn delay={0.35}>
            <AdherenceChart data={weeklyData} />
          </FadeIn>

          <StaggerContainer className="grid grid-cols-2 gap-3">
            <StaggerItem>
              <StatCard
                title="Case Detection"
                value="94%"
                subtitle="auto-detected"
                icon={<Smartphone className="h-5 w-5 text-primary" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Refill Rate"
                value="100%"
                subtitle="on time"
                icon={<RefreshCw className="h-5 w-5 text-primary" />}
              />
            </StaggerItem>
          </StaggerContainer>

          <FadeIn delay={0.45}>
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
          </FadeIn>

          <section>
            <FadeIn delay={0.5}>
              <h3 className="text-section text-foreground mb-3">Connect Health Trackers</h3>
            </FadeIn>
            <StaggerContainer className="grid grid-cols-2 gap-3">
              {[
                { name: "Apple Health", connected: true },
                { name: "Apple Watch", connected: false },
                { name: "Fitbit", connected: false },
                { name: "Whoop", connected: false },
              ].map((tracker) => (
                <StaggerItem key={tracker.name}>
                  <motion.button
                    className="card-tarva-interactive flex items-center gap-3 w-full"
                    whileTap={{ scale: 0.97 }}
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
                  </motion.button>
                </StaggerItem>
              ))}
            </StaggerContainer>
            <FadeIn delay={0.6}>
              <p className="mt-3 text-caption text-center">
                Use activity/sleep context to improve reminders
              </p>
            </FadeIn>
          </section>
        </div>
      </div>
    </AnimatedPage>
  );
}
