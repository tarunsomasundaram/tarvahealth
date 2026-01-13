import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { WeekPicker } from "@/components/home/WeekPicker";
import { ProgressCard } from "@/components/home/ProgressCard";
import { MedicationCard, Medication } from "@/components/home/MedicationCard";
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

  const upcomingMeds = mockMedications.filter((m) => m.status === "pending");
  const completedMeds = mockMedications.filter((m) => m.status === "taken");
  const takenCount = completedMeds.length;
  const totalCount = mockMedications.length;

  const handleMarkTaken = (id: string) => {
    console.log("Mark taken:", id);
  };

  const handleSkip = (id: string) => {
    console.log("Skip:", id);
  };

  return (
    <AnimatedPage>
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
              <p className="text-lg font-semibold text-foreground">
                {format(selectedDate, "EEEE, MMMM d")}
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <WeekPicker selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          </FadeIn>

          <FadeIn delay={0.2}>
            <ProgressCard taken={takenCount} total={totalCount} />
          </FadeIn>

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
        </div>
      </div>
    </AnimatedPage>
  );
}
