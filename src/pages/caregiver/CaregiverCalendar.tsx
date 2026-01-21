import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { PatientSelector } from "@/components/caregiver/PatientSelector";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { Medication } from "@/components/home/MedicationCard";
import { Check, X, Clock, Eye } from "lucide-react";
import { useCaregiverAccessLog } from "@/hooks/use-caregiver-access-log";

const mockPatients = [
  { id: "1", name: "John Smith", lastActive: "5 min ago" },
];

const mockDosesByDate: Record<string, { id: string; status: "taken" | "missed" | "late" | "pending" }[]> = {
  "2026-01-10": [
    { id: "1", status: "taken" },
    { id: "2", status: "taken" },
    { id: "3", status: "taken" },
  ],
  "2026-01-11": [
    { id: "1", status: "taken" },
    { id: "2", status: "missed" },
    { id: "3", status: "taken" },
  ],
  "2026-01-12": [
    { id: "1", status: "taken" },
    { id: "2", status: "taken" },
    { id: "3", status: "late" },
    { id: "4", status: "taken" },
  ],
  "2026-01-13": [
    { id: "1", status: "taken" },
    { id: "2", status: "taken" },
    { id: "3", status: "pending" },
    { id: "4", status: "pending" },
    { id: "5", status: "pending" },
  ],
};

const getMedicationsForDate = (date: Date): Medication[] => {
  const dateKey = format(date, "yyyy-MM-dd");
  const doses = mockDosesByDate[dateKey] || [];
  
  const medications: Medication[] = [
    { id: "1", name: "Lisinopril", strength: "10mg", scheduledTime: "8:00 AM", status: "pending" },
    { id: "2", name: "Metformin", strength: "500mg", scheduledTime: "9:00 AM", status: "pending" },
    { id: "3", name: "Atorvastatin", strength: "20mg", scheduledTime: "10:00 PM", status: "pending" },
    { id: "4", name: "Omeprazole", strength: "20mg", scheduledTime: "7:30 AM", status: "pending" },
    { id: "5", name: "Vitamin D3", strength: "2000 IU", scheduledTime: "12:00 PM", status: "pending" },
  ];

  return medications.map((med) => {
    const dose = doses.find((d) => d.id === med.id);
    return {
      ...med,
      status: dose?.status || "pending",
      takenTime: dose?.status === "taken" ? "8:05 AM" : undefined,
      source: dose?.status === "taken" ? "case" as const : undefined,
    };
  }).slice(0, doses.length || 3);
};

export default function CaregiverCalendar() {
  const [selectedPatientId, setSelectedPatientId] = useState(mockPatients[0]?.id || "");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { logAccess } = useCaregiverAccessLog();
  const hasLoggedAccess = useRef(false);

  // Log access when viewing patient calendar/dose logs
  useEffect(() => {
    if (selectedPatientId && !hasLoggedAccess.current) {
      logAccess({
        patientUserId: selectedPatientId,
        resourceType: 'dose_logs',
        metadata: { viewType: 'calendar' },
      });
      hasLoggedAccess.current = true;
    }
  }, [selectedPatientId, logAccess]);

  const medications = getMedicationsForDate(selectedDate);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "taken": return <Check className="h-3 w-3" />;
      case "missed": return <X className="h-3 w-3" />;
      case "late": return <Clock className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <AnimatedPage>
      <div className="page-padding">
        <PageHeader title="Schedule" subtitle="Patient medication calendar" />

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
            <CalendarGrid
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              dosesByDate={mockDosesByDate}
            />
          </FadeIn>

          <section>
            <FadeIn delay={0.2}>
              <h2 className="text-section text-foreground mb-3">
                {format(selectedDate, "EEEE, MMMM d")}
              </h2>
            </FadeIn>
            {medications.length > 0 ? (
              <StaggerContainer className="space-y-3">
                {medications.map((med) => (
                  <StaggerItem key={med.id}>
                    <motion.div 
                      className="card-tarva"
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                          <span className={`badge-status ${
                            med.status === "taken" ? "badge-taken" :
                            med.status === "missed" ? "badge-missed" :
                            med.status === "late" ? "badge-late" :
                            "badge-pending"
                          }`}>
                            {getStatusIcon(med.status)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">{med.name}</h4>
                            <span className="badge-time">{med.scheduledTime}</span>
                          </div>
                          <p className="text-caption">{med.strength}</p>
                          {med.status === "taken" && med.takenTime && (
                            <p className="text-small mt-1">
                              Taken at {med.takenTime} • {med.source === "case" ? "Case" : "Manual"}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              <FadeIn delay={0.25}>
                <div className="card-tarva text-center py-8">
                  <p className="text-muted-foreground">No doses scheduled for this day</p>
                </div>
              </FadeIn>
            )}
          </section>
        </div>
      </div>
    </AnimatedPage>
  );
}
