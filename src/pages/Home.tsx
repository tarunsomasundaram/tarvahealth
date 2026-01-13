import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { WeekPicker } from "@/components/home/WeekPicker";
import { ProgressCard } from "@/components/home/ProgressCard";
import { MedicationCard, Medication } from "@/components/home/MedicationCard";
import { PullToRefresh } from "@/components/common/PullToRefresh";
import { SkeletonMedicationCard, SkeletonProgressCard, Skeleton } from "@/components/common/Skeleton";
import { triggerHaptic } from "@/hooks/use-haptics";
import { format } from "date-fns";

const mockMedications: Medication[] = [
  {
    id: "1",
    name: "Lisinopril",
    strength: "10mg",
    instructions: "Take with breakfast",
    scheduledTime: "8:00 AM",
    status: "taken",
    takenTime: "8:05 AM",
    source: "case",
  },
  {
    id: "2",
    name: "Metformin",
    strength: "500mg",
    instructions: "Take after meal",
    scheduledTime: "9:00 AM",
    status: "taken",
    takenTime: "9:12 AM",
    source: "manual",
  },
  {
    id: "3",
    name: "Atorvastatin",
    strength: "20mg",
    instructions: "Take at bedtime",
    scheduledTime: "10:00 PM",
    status: "pending",
  },
  {
    id: "4",
    name: "Omeprazole",
    strength: "20mg",
    instructions: "Take before breakfast",
    scheduledTime: "7:30 AM",
    status: "taken",
    takenTime: "7:35 AM",
    source: "case",
  },
  {
    id: "5",
    name: "Vitamin D3",
    strength: "2000 IU",
    scheduledTime: "12:00 PM",
    status: "pending",
  },
];

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [medications, setMedications] = useState<Medication[]>([]);

  // Simulate initial data load
  useEffect(() => {
    const timer = setTimeout(() => {
      setMedications(mockMedications);
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    // Simulate API refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setMedications(mockMedications);
    setIsLoading(false);
    triggerHaptic('success');
  }, []);

  const upcomingMeds = medications.filter((m) => m.status === "pending");
  const completedMeds = medications.filter((m) => m.status === "taken");
  const takenCount = completedMeds.length;
  const totalCount = medications.length;

  const handleMarkTaken = (id: string) => {
    triggerHaptic('success');
    console.log("Mark taken:", id);
  };

  const handleSkip = (id: string) => {
    triggerHaptic('light');
    console.log("Skip:", id);
  };

  return (
    <AnimatedPage>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="page-padding">
          <PageHeader
            title="TARVA"
            subtitle="Stay on schedule"
            showNotification
            showCalendar
          />

          <div className="section-gap">
            <FadeIn delay={0.1}>
              <div className="mb-2">
                {isLoading ? (
                  <Skeleton className="h-6 w-48" />
                ) : (
                  <p className="text-lg font-semibold text-foreground">
                    {format(selectedDate, "EEEE, MMMM d")}
                  </p>
                )}
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <WeekPicker selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            </FadeIn>

            <FadeIn delay={0.2}>
              {isLoading ? (
                <SkeletonProgressCard />
              ) : (
                <ProgressCard taken={takenCount} total={totalCount} />
              )}
            </FadeIn>

            {isLoading ? (
              <section>
                <FadeIn delay={0.25}>
                  <Skeleton className="h-5 w-24 mb-3" />
                </FadeIn>
                <div className="space-y-3">
                  <SkeletonMedicationCard />
                  <SkeletonMedicationCard />
                </div>
              </section>
            ) : (
              <>
                {upcomingMeds.length > 0 && (
                  <section>
                    <FadeIn delay={0.25}>
                      <h2 className="text-section text-foreground mb-3">Upcoming</h2>
                    </FadeIn>
                    <StaggerContainer className="space-y-3">
                      {upcomingMeds.map((med) => (
                        <StaggerItem key={med.id}>
                          <MedicationCard
                            medication={med}
                            onMarkTaken={() => handleMarkTaken(med.id)}
                            onSkip={() => handleSkip(med.id)}
                          />
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
                  </section>
                )}

                {completedMeds.length > 0 && (
                  <section>
                    <FadeIn delay={0.3}>
                      <h2 className="text-section text-foreground mb-3">Completed Today</h2>
                    </FadeIn>
                    <StaggerContainer className="space-y-3">
                      {completedMeds.map((med) => (
                        <StaggerItem key={med.id}>
                          <MedicationCard
                            medication={med}
                            showActions={false}
                          />
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      </PullToRefresh>
    </AnimatedPage>
  );
}