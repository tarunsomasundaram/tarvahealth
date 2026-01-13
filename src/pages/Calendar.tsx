import { useState } from "react";
import { format } from "date-fns";
import { PageHeader } from "@/components/layout/PageHeader";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { MedicationCard, Medication } from "@/components/home/MedicationCard";
import { Download, Check, X, Clock } from "lucide-react";

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

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showExportMenu, setShowExportMenu] = useState(false);

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
    <div className="page-padding">
      <PageHeader
        title="Schedule"
        rightContent={
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary transition-colors hover:bg-secondary/80"
              aria-label="Export"
            >
              <Download className="h-5 w-5 text-foreground" />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-12 z-50 w-48 rounded-xl bg-card p-2 shadow-card-hover animate-fade-in">
                <p className="px-3 py-2 text-xs font-medium text-muted-foreground">Export PDF</p>
                {["Last 1 month", "Last 3 months", "Last 6 months"].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      console.log("Export:", option);
                      setShowExportMenu(false);
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-secondary"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        }
      />

      <div className="section-gap">
        <CalendarGrid
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          dosesByDate={mockDosesByDate}
        />

        <section>
          <h2 className="text-section text-foreground mb-3">
            {format(selectedDate, "EEEE, MMMM d")}
          </h2>
          {medications.length > 0 ? (
            <div className="space-y-3">
              {medications.map((med) => (
                <div key={med.id} className="card-tarva">
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
                </div>
              ))}
            </div>
          ) : (
            <div className="card-tarva text-center py-8">
              <p className="text-muted-foreground">No doses scheduled for this day</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
