import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { WeekPicker } from "@/components/home/WeekPicker";
import { ProgressCard } from "@/components/home/ProgressCard";
import { PullToRefresh } from "@/components/common/PullToRefresh";
import { SnoozeSheet } from "@/components/dose/SnoozeSheet";
import { CaseSelectionSheet } from "@/components/dose/CaseSelectionSheet";
import { triggerHaptic } from "@/hooks/use-haptics";
import { useNotifications } from "@/hooks/use-notifications";
import { useCaseDevice } from "@/hooks/use-case-device";
import { format, addMinutes } from "date-fns";
import { useMedication, ScheduledDose } from "@/contexts/MedicationContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Pill, Check, X, Smartphone, Clock, Bell, MoreVertical, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function DoseCard({ 
  dose, 
  onMarkTaken, 
  onSkip,
  onSnooze,
  onTakenElsewhere,
  showActions = true 
}: { 
  dose: ScheduledDose; 
  onMarkTaken?: () => void; 
  onSkip?: () => void;
  onSnooze?: () => void;
  onTakenElsewhere?: () => void;
  showActions?: boolean;
}) {
  const isPending = dose.displayStatus === 'pending';
  const isSkipped = dose.displayStatus === 'skipped';
  const isSnoozed = dose.displayStatus === 'snoozed';

  return (
    <motion.div 
      className="card-tarva"
      whileTap={{ scale: 0.98 }}
      layout
    >
      <div className="flex items-start gap-4">
        <motion.div 
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
            isSnoozed ? "bg-primary/20" : "bg-accent"
          )}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          {isSnoozed ? (
            <Bell className="h-6 w-6 text-primary" />
          ) : (
            <Pill className="h-6 w-6 text-primary" />
          )}
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground">{dose.medication.genericName}</h3>
              <p className="text-caption">{dose.medication.strengthValue}{dose.medication.strengthUnit}</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="badge-time shrink-0">{dose.scheduledTime}</span>
              {showActions && isPending && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button 
                      className="p-1 rounded-lg hover:bg-secondary"
                      whileTap={{ scale: 0.9 }}
                    >
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-48 bg-popover border border-border rounded-xl shadow-lg z-50"
                  >
                    <DropdownMenuItem 
                      onClick={() => {
                        triggerHaptic('light');
                        onTakenElsewhere?.();
                      }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>Taken elsewhere</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        triggerHaptic('light');
                        onSnooze?.();
                      }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Snooze reminder</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          {dose.medication.instructions && (
            <p className="mt-1 text-small">{dose.medication.instructions}</p>
          )}
          
          {(dose.displayStatus === 'taken' || dose.displayStatus === 'late') && (
            <motion.div 
              className="mt-2 flex items-center gap-2"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className={cn("badge-taken", dose.displayStatus === 'late' && "badge-late")}>
                <Check className="h-3 w-3" />
                {dose.displayStatus === 'late' ? 'Late' : 'Taken'} at {dose.takenTime}
              </span>
              {dose.source === "case" && (
                <span className="badge-pill text-xs">
                  <Smartphone className="h-3 w-3" />
                  Case
                </span>
              )}
              {dose.source === "manual" && (
                <span className="badge-pill text-xs">
                  <MapPin className="h-3 w-3" />
                  Manual
                </span>
              )}
            </motion.div>
          )}
          
          {isSkipped && (
            <motion.div 
              className="mt-2 flex items-center gap-2"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <Clock className="h-3 w-3" />
                Skipped at {dose.skippedTime}
              </span>
            </motion.div>
          )}

          {isSnoozed && dose.snoozeState && (
            <motion.div 
              className="mt-2 flex items-center gap-2"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
                <Bell className="h-3 w-3" />
                Snoozed until {format(new Date(dose.snoozeState.until), 'h:mm a')}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {showActions && (isPending || isSnoozed) && (
        <motion.div 
          className="mt-4 flex gap-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <motion.button 
            onClick={() => {
              triggerHaptic('light');
              onSkip?.();
            }} 
            className="btn-secondary flex-1"
            whileTap={{ scale: 0.95 }}
          >
            <X className="h-4 w-4" />
            Skip
          </motion.button>
          <motion.button 
            onClick={() => {
              triggerHaptic('success');
              onMarkTaken?.();
            }} 
            className="btn-primary flex-1"
            whileTap={{ scale: 0.95 }}
          >
            <Check className="h-4 w-4" />
            Mark Taken
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [snoozeSheetOpen, setSnoozeSheetOpen] = useState(false);
  const [selectedDoseForSnooze, setSelectedDoseForSnooze] = useState<ScheduledDose | null>(null);
  
  const { 
    getUpcomingDoses, 
    getCompletedDoses, 
    markDoseTaken, 
    markDoseSkipped, 
    markDoseSnoozed,
    getScheduledDosesForDate 
  } = useMedication();
  const { patientProfile, addNotification } = useOnboarding();
  const { scheduleSnoozeReminder, cancelNotification } = useNotifications();
  const { 
    pendingCaseSelection, 
    confirmCaseSelection, 
    cancelCaseSelection 
  } = useCaseDevice();
  
  const firstName = patientProfile?.fullName?.split(' ')[0] || 'User';

  const upcomingDoses = getUpcomingDoses(selectedDate);
  const completedDoses = getCompletedDoses(selectedDate);
  const allDoses = getScheduledDosesForDate(selectedDate);
  
  const takenCount = completedDoses.length;
  const totalCount = allDoses.filter(d => d.displayStatus !== 'skipped').length;

  const handleRefresh = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    triggerHaptic('success');
  }, []);

  const handleMarkTaken = async (dose: ScheduledDose) => {
    markDoseTaken(dose, 'manual');
    await cancelNotification(dose.medicationId, dose.scheduledDatetime);
    
    addNotification({
      id: `taken_${dose.id}_${Date.now()}`,
      type: 'dose_taken',
      title: 'Dose marked taken',
      subtitle: 'Manually recorded',
      medicationName: `${dose.medication.genericName} ${dose.medication.strengthValue}${dose.medication.strengthUnit}`,
      timestamp: new Date().toISOString(),
      status: 'sent',
      read: false,
    });
    
    triggerHaptic('success');
  };

  const handleTakenElsewhere = async (dose: ScheduledDose) => {
    // Mark as taken with manual source - does NOT decrement case inventory
    markDoseTaken(dose, 'manual');
    await cancelNotification(dose.medicationId, dose.scheduledDatetime);
    
    addNotification({
      id: `taken_elsewhere_${dose.id}_${Date.now()}`,
      type: 'dose_taken',
      title: 'Dose marked taken',
      subtitle: 'Taken elsewhere (not from case)',
      medicationName: `${dose.medication.genericName} ${dose.medication.strengthValue}${dose.medication.strengthUnit}`,
      timestamp: new Date().toISOString(),
      status: 'sent',
      read: false,
    });
    
    triggerHaptic('success');
  };

  const handleSkip = (dose: ScheduledDose) => {
    markDoseSkipped(dose);
    triggerHaptic('light');
  };

  const handleOpenSnooze = (dose: ScheduledDose) => {
    setSelectedDoseForSnooze(dose);
    setSnoozeSheetOpen(true);
  };

  const handleSnooze = async (minutes: number) => {
    if (!selectedDoseForSnooze) return;
    
    markDoseSnoozed(selectedDoseForSnooze, minutes);
    await scheduleSnoozeReminder(
      selectedDoseForSnooze.medication, 
      selectedDoseForSnooze.scheduledDatetime, 
      minutes
    );
    
    addNotification({
      id: `snoozed_${selectedDoseForSnooze.id}_${Date.now()}`,
      type: 'dose_reminder',
      title: 'Reminder snoozed',
      subtitle: `Will remind in ${minutes} minutes`,
      medicationName: `${selectedDoseForSnooze.medication.genericName}`,
      timestamp: new Date().toISOString(),
      status: 'sent',
      read: true,
    });
    
    triggerHaptic('light');
    setSelectedDoseForSnooze(null);
  };

  return (
    <AnimatedPage>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="page-padding">
          <PageHeader
            title="TARVA"
            subtitle={`Welcome, ${firstName}`}
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

            {upcomingDoses.length > 0 && (
              <section>
                <FadeIn delay={0.25}>
                  <h2 className="text-section text-foreground mb-3">Upcoming</h2>
                </FadeIn>
                <StaggerContainer className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {upcomingDoses.map((dose) => (
                      <StaggerItem key={dose.id}>
                        <DoseCard
                          dose={dose}
                          onMarkTaken={() => handleMarkTaken(dose)}
                          onSkip={() => handleSkip(dose)}
                          onSnooze={() => handleOpenSnooze(dose)}
                          onTakenElsewhere={() => handleTakenElsewhere(dose)}
                        />
                      </StaggerItem>
                    ))}
                  </AnimatePresence>
                </StaggerContainer>
              </section>
            )}

            {completedDoses.length > 0 && (
              <section>
                <FadeIn delay={0.3}>
                  <h2 className="text-section text-foreground mb-3">Completed Today</h2>
                </FadeIn>
                <StaggerContainer className="space-y-3">
                  {completedDoses.map((dose) => (
                    <StaggerItem key={dose.id}>
                      <DoseCard dose={dose} showActions={false} />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </section>
            )}

            {allDoses.length === 0 && (
              <FadeIn delay={0.25}>
                <div className="card-tarva text-center py-8">
                  <Pill className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No doses scheduled for this day</p>
                </div>
              </FadeIn>
            )}
          </div>
        </div>
      </PullToRefresh>

      {/* Snooze Sheet */}
      <SnoozeSheet
        open={snoozeSheetOpen}
        onOpenChange={setSnoozeSheetOpen}
        dose={selectedDoseForSnooze}
        onSnooze={handleSnooze}
      />

      {/* Case Selection Sheet */}
      <CaseSelectionSheet
        open={!!pendingCaseSelection}
        onOpenChange={(open) => !open && cancelCaseSelection()}
        doses={pendingCaseSelection || []}
        onSelect={confirmCaseSelection}
      />
    </AnimatedPage>
  );
}
