import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, subMonths } from "date-fns";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { Download, Check, X, Clock, Loader2 } from "lucide-react";
import { useMedication } from "@/contexts/MedicationContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { generateAdherencePDF } from "@/lib/pdfExport";
import { toast } from "sonner";

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const { getScheduledDosesForDate, getDoseMarkersForMonth, medications } = useMedication();
  const { patientProfile } = useOnboarding();

  const doses = getScheduledDosesForDate(selectedDate);
  const dosesByDate = getDoseMarkersForMonth(selectedDate.getFullYear(), selectedDate.getMonth());

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "taken": return <Check className="h-3 w-3" />;
      case "missed": return <X className="h-3 w-3" />;
      case "late": return <Clock className="h-3 w-3" />;
      case "skipped": return <Clock className="h-3 w-3" />;
      default: return null;
    }
  };

  const handleExport = async (range: string) => {
    setIsExporting(true);
    setShowExportMenu(false);
    
    try {
      const endDate = new Date();
      let startDate: Date;
      
      switch (range) {
        case "Last 1 month":
          startDate = subMonths(endDate, 1);
          break;
        case "Last 3 months":
          startDate = subMonths(endDate, 3);
          break;
        case "Last 6 months":
          startDate = subMonths(endDate, 6);
          break;
        default:
          startDate = subMonths(endDate, 1);
      }
      
      await generateAdherencePDF({
        patientName: patientProfile?.fullName || 'Patient',
        startDate,
        endDate,
        getDosesForDate: getScheduledDosesForDate,
        medications,
      });
      
      toast.success("PDF ready", {
        description: "Your adherence report is ready for printing or saving."
      });
    } catch (error) {
      toast.error("Export failed", {
        description: "Please allow popups and try again."
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="page-padding">
        <PageHeader
          title="Schedule"
          rightContent={
            <div className="relative">
              <motion.button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary transition-colors hover:bg-secondary/80"
                aria-label="Export"
                whileTap={{ scale: 0.9 }}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="h-5 w-5 text-foreground animate-spin" />
                ) : (
                  <Download className="h-5 w-5 text-foreground" />
                )}
              </motion.button>
              <AnimatePresence>
                {showExportMenu && (
                  <motion.div 
                    className="absolute right-0 top-12 z-50 w-48 rounded-xl bg-card p-2 shadow-card-hover border border-border"
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <p className="px-3 py-2 text-xs font-medium text-muted-foreground">Export PDF</p>
                    {["Last 1 month", "Last 3 months", "Last 6 months"].map((option, index) => (
                      <motion.button
                        key={option}
                        onClick={() => handleExport(option)}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-secondary"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {option}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          }
        />

        <div className="section-gap">
          <FadeIn delay={0.1}>
            <CalendarGrid
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              dosesByDate={dosesByDate}
            />
          </FadeIn>

          <section>
            <FadeIn delay={0.2}>
              <h2 className="text-section text-foreground mb-3">
                {format(selectedDate, "EEEE, MMMM d")}
              </h2>
            </FadeIn>
            {doses.length > 0 ? (
              <StaggerContainer className="space-y-3">
                {doses.map((dose) => (
                  <StaggerItem key={dose.id}>
                    <motion.div 
                      className="card-tarva"
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                          <span className={`badge-status ${
                            dose.displayStatus === "taken" ? "badge-taken" :
                            dose.displayStatus === "missed" ? "badge-missed" :
                            dose.displayStatus === "late" ? "badge-late" :
                            dose.displayStatus === "skipped" ? "badge-pill" :
                            "badge-pending"
                          }`}>
                            {getStatusIcon(dose.displayStatus)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">{dose.medication.genericName}</h4>
                            <span className="badge-time">{dose.scheduledTime}</span>
                          </div>
                          <p className="text-caption">{dose.medication.strengthValue}{dose.medication.strengthUnit}</p>
                          {dose.displayStatus === "taken" && dose.takenTime && (
                            <p className="text-small mt-1">
                              Taken at {dose.takenTime} • {dose.source === "case" ? "Case" : "Manual"}
                            </p>
                          )}
                          {dose.displayStatus === "late" && dose.takenTime && (
                            <p className="text-small mt-1 text-warning">
                              Late - taken at {dose.takenTime}
                            </p>
                          )}
                          {dose.displayStatus === "skipped" && dose.skippedTime && (
                            <p className="text-small mt-1 text-muted-foreground">
                              Skipped at {dose.skippedTime}
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
