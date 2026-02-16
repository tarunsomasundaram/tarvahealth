import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, subMonths, startOfDay, endOfDay, parseISO } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { Download, Check, X, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";
import { generateAdherencePDF } from "@/lib/pdfExport";

export default function Calendar() {
  const [searchParams] = useSearchParams();
  const initialDate = searchParams.get('date') ? parseISO(searchParams.get('date')!) : new Date();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const { profile, getScheduledDosesForDate, activeMedications } = useData();

  const doses = useMemo(() => {
    return getScheduledDosesForDate(selectedDate);
  }, [getScheduledDosesForDate, selectedDate]);

  // Generate dose markers for the calendar
  const dosesByDate = useMemo(() => {
    const markers: Record<string, { id: string; status: "taken" | "missed" | "late" | "pending" | "skipped" | "snoozed" }[]> = {};
    
    // Get all days with doses in the current month
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayDoses = getScheduledDosesForDate(date);
      
      if (dayDoses.length > 0) {
        const dateStr = format(date, 'yyyy-MM-dd');
        markers[dateStr] = dayDoses.map((d) => ({
          id: d.id,
          status:
            d.status === 'taken' && d.isLate ? 'late' :
            d.status,
        }));
      }
    }
    
    return markers;
  }, [selectedDate, getScheduledDosesForDate]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "taken": return <Check className="h-3 w-3" />;
      case "missed": return <X className="h-3 w-3" />;
      case "skipped": return <Clock className="h-3 w-3" />;
      default: return null;
    }
  };

  // Create a callback wrapper for getDosesForDate to pass to PDF export
  const getDosesForDateCallback = useCallback((date: Date) => {
    return getScheduledDosesForDate(date);
  }, [getScheduledDosesForDate]);

  const handleExport = async (range: string) => {
    setIsExporting(true);
    setShowExportMenu(false);
    
    try {
      const endDate = endOfDay(new Date());
      let startDate: Date;
      
      switch (range) {
        case "Last 1 month":
          startDate = startOfDay(subMonths(new Date(), 1));
          break;
        case "Last 3 months":
          startDate = startOfDay(subMonths(new Date(), 3));
          break;
        case "Last 6 months":
          startDate = startOfDay(subMonths(new Date(), 6));
          break;
        default:
          startDate = startOfDay(subMonths(new Date(), 1));
      }

      await generateAdherencePDF({
        patientName: profile?.full_name || "Patient",
        startDate,
        endDate,
        getDosesForDate: getDosesForDateCallback,
        medications: activeMedications,
      });

      toast.success("PDF report generated!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed. Please allow popups and try again.");
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
                       className="card-tarva relative overflow-hidden"
                      whileTap={{ scale: 0.98 }}
                    >
                      {dose.status === "taken" && <div className="absolute top-0 left-0 right-0 h-[3px] bg-success rounded-t-[18px]" />}
                      {dose.status === "missed" && <div className="absolute top-0 left-0 right-0 h-[3px] bg-destructive rounded-t-[18px]" />}
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl",
                          dose.status === "taken" ? "bg-success/15" :
                          dose.status === "missed" ? "bg-destructive/15" :
                          dose.status === "skipped" ? "bg-muted" :
                          "bg-primary/15"
                        )}>
                          <span className={`badge-status ${
                            dose.status === "taken" ? "badge-taken" :
                            dose.status === "missed" ? "badge-missed" :
                            dose.status === "skipped" ? "badge-pill" :
                            "badge-pending"
                          }`}>
                            {getStatusIcon(dose.status)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">{dose.medicationName}</h4>
                            <span className="badge-time">{format(dose.scheduledTime, 'h:mm a')}</span>
                          </div>
                          <p className="text-caption">{dose.strengthValue}{dose.strengthUnit}</p>
                          {dose.status === "taken" && dose.eventTime && (
                            <p className="text-small mt-1">
                              Taken at {format(dose.eventTime, 'h:mm a')} • {dose.source === "case" ? "Case" : "Manual"}
                            </p>
                          )}
                          {dose.isLate && dose.eventTime && (
                            <p className="text-small mt-1 text-warning">
                              Late - taken at {format(dose.eventTime, 'h:mm a')}
                            </p>
                          )}
                          {dose.status === "skipped" && dose.eventTime && (
                            <p className="text-small mt-1 text-muted-foreground">
                              Skipped at {format(dose.eventTime, 'h:mm a')}
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
