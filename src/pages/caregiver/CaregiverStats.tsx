import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { PatientSelector } from "@/components/caregiver/PatientSelector";
import { FilterChips } from "@/components/common/FilterChips";
import { StatCard } from "@/components/stats/StatCard";
import { AdherenceChart } from "@/components/stats/AdherenceChart";
import { Target, Clock, Zap, AlertTriangle, Eye } from "lucide-react";

const mockPatients = [
  { id: "1", name: "John Smith", lastActive: "5 min ago" },
];

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

export default function CaregiverStats() {
  const [selectedPatientId, setSelectedPatientId] = useState(mockPatients[0]?.id || "");
  const [timeFilter, setTimeFilter] = useState("7d");

  return (
    <AnimatedPage>
      <div className="page-padding">
        <PageHeader title="Stats" subtitle="Patient adherence insights" />

        <div className="section-gap">
          <FadeIn delay={0.1}>
            <PatientSelector
              patients={mockPatients}
              selectedPatientId={selectedPatientId}
              onSelectPatient={setSelectedPatientId}
            />
          </FadeIn>

          {/* View-only badge */}
          <FadeIn delay={0.12}>
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg w-fit">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">View-only access</span>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
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
                icon={<Target className="h-5 w-5 text-success" />}
                iconBgClassName="bg-success/15"
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
                iconBgClassName="bg-primary/15"
                trend="neutral"
                trendValue="same"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Current Streak"
                value="12"
                subtitle="days"
                icon={<Zap className="h-5 w-5 text-warning" />}
                iconBgClassName="bg-warning/15"
                trend="up"
                trendValue="best yet!"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Avg. Delay"
                value="8m"
                subtitle="minutes late"
                icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
                iconBgClassName="bg-destructive/15"
                trend="down"
                trendValue="-3m"
              />
            </StaggerItem>
          </StaggerContainer>

          <FadeIn delay={0.35}>
            <AdherenceChart data={weeklyData} />
          </FadeIn>

          <FadeIn delay={0.45}>
            <div className="card-tarva text-center py-6">
              <p className="text-muted-foreground text-sm">
                Viewing {mockPatients.find(p => p.id === selectedPatientId)?.name}'s statistics
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </AnimatedPage>
  );
}
