import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { WeekPicker } from "@/components/home/WeekPicker";
import { ProgressCard } from "@/components/home/ProgressCard";
import { PullToRefresh } from "@/components/common/PullToRefresh";
import { SnoozeSheet } from "@/components/dose/SnoozeSheet";
import { CaseSelectionSheet } from "@/components/dose/CaseSelectionSheet";
import { FinishProfileCard } from "@/components/profile/FinishProfileCard";
import { AlarmOverlay } from "@/components/alarm/AlarmOverlay";
import { triggerHaptic } from "@/hooks/use-haptics";
import { useAlarm } from "@/hooks/use-alarm";
import { useNotifications } from "@/hooks/use-notifications";
import { useCaseDevice } from "@/hooks/use-case-device";
import { format } from "date-fns";
import { useData, ScheduledDose } from "@/contexts/DataContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Pill, Check, X, Smartphone, Clock, Bell, MoreVertical, MapPin, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DoseCardDose {
  id: string;
  medicationId: string;
  medicationName: string;
  strengthValue: number | null;
  strengthUnit: string | null;
  form: string;
  scheduledTime: Date;
  displayTime: string;
  status: 'pending' | 'taken' | 'skipped' | 'missed' | 'snoozed';
  eventTime?: Date;
  isLate?: boolean;
  source?: 'case' | 'manual';
  instructions?: string;
  snoozeUntil?: Date;
}

function DoseCard({ 
  dose, 
  onMarkTaken, 
  onSkip,
  onSnooze,
  onTakenElsewhere,
  showActions = true 
}: { 
  dose: DoseCardDose; 
  onMarkTaken?: () => void; 
  onSkip?: () => void;
  onSnooze?: () => void;
  onTakenElsewhere?: () => void;
  showActions?: boolean;
}) {
  const isPending = dose.status === 'pending';
  const isSkipped = dose.status === 'skipped';
  const isSnoozed = dose.status === 'snoozed';
  const isTaken = dose.status === 'taken';

  return (
    <motion.div 
      className="card-tarva relative overflow-hidden"
      whileTap={{ scale: 0.98 }}
      layout
    >
      {/* Status accent bar */}
      {isTaken && <div className="absolute top-0 left-0 right-0 h-[3px] bg-success rounded-t-[18px]" />}
      {isSkipped && <div className="absolute top-0 left-0 right-0 h-[3px] bg-muted-foreground rounded-t-[18px]" />}
      {isSnoozed && <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary rounded-t-[18px]" />}
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
              <h3 className="font-semibold text-foreground">{dose.medicationName}</h3>
              <p className="text-caption">
                {dose.strengthValue}{dose.strengthUnit} {dose.form}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <span className="badge-time shrink-0">{dose.displayTime}</span>
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
          {dose.instructions && (
            <p className="mt-1 text-small">{dose.instructions}</p>
          )}
          
          {isTaken && (
            <motion.div 
              className="mt-2 flex items-center gap-2"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className={cn("badge-taken", dose.isLate && "badge-late")}>
                <Check className="h-3 w-3" />
                {dose.isLate ? 'Late' : 'Taken'} at {dose.eventTime ? format(dose.eventTime, 'h:mm a') : ''}
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
                Skipped {dose.eventTime ? `at ${format(dose.eventTime, 'h:mm a')}` : ''}
              </span>
            </motion.div>
          )}

          {isSnoozed && dose.snoozeUntil && (
            <motion.div 
              className="mt-2 flex items-center gap-2"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
                <Bell className="h-3 w-3" />
                Snoozed until {format(dose.snoozeUntil, 'h:mm a')}
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
  const [selectedDoseForSnooze, setSelectedDoseForSnooze] = useState<DoseCardDose | null>(null);
  const [showFinishProfile, setShowFinishProfile] = useState(true);
  
  const { 
    getScheduledDosesForDate,
    logDose,
    medications,
    getProfileCompletionPercentage,
    profile,
    createNotification,
    refreshMedications,
  } = useData();
  
  const { patientProfile } = useOnboarding();
  const { scheduleSnoozeReminder, cancelNotification } = useNotifications();
  const { 
    pendingCaseSelection, 
    confirmCaseSelection, 
    cancelCaseSelection 
  } = useCaseDevice();
  const {
    alarmDose,
    isAlarmActive,
    triggerAlarm,
    dismissAlarm,
    checkForDueAlarms,
  } = useAlarm();
  
  const firstName = profile?.full_name?.split(' ')[0] || patientProfile?.fullName?.split(' ')[0] || 'User';
  const profileCompletion = getProfileCompletionPercentage();
  const showProfileCard = showFinishProfile && profileCompletion < 100;

  // Get scheduled doses and transform to DoseCardDose format
  const scheduledDoses = useMemo(() => {
    const rawDoses = getScheduledDosesForDate(selectedDate);
    return rawDoses.map((dose): DoseCardDose => {
      const med = medications.find(m => m.id === dose.medicationId);
      return {
        id: dose.id,
        medicationId: dose.medicationId,
        medicationName: dose.medicationName,
        strengthValue: dose.strengthValue,
        strengthUnit: dose.strengthUnit,
        form: dose.form,
        scheduledTime: dose.scheduledTime,
        displayTime: format(dose.scheduledTime, 'h:mm a'),
        status: dose.status,
        eventTime: dose.eventTime,
        isLate: dose.isLate,
        source: dose.source,
        instructions: med?.instructions || undefined,
      };
    });
  }, [getScheduledDosesForDate, selectedDate, medications]);

  const upcomingDoses = scheduledDoses.filter(d => d.status === 'pending' || d.status === 'snoozed');
  const completedDoses = scheduledDoses.filter(d => d.status === 'taken' || d.status === 'skipped');
  
  const takenCount = scheduledDoses.filter(d => d.status === 'taken').length;
  const totalCount = scheduledDoses.filter(d => d.status !== 'skipped').length;

  // Check for due alarms every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      checkForDueAlarms(upcomingDoses);
    }, 10000);
    // Check immediately too
    checkForDueAlarms(upcomingDoses);
    return () => clearInterval(interval);
  }, [upcomingDoses, checkForDueAlarms]);

  // Alarm action handlers
  const handleAlarmTaken = async () => {
    if (!alarmDose) return;
    await handleMarkTaken(alarmDose as DoseCardDose);
    dismissAlarm();
  };

  const handleAlarmSkip = async () => {
    if (!alarmDose) return;
    await handleSkip(alarmDose as DoseCardDose);
    dismissAlarm();
  };

  const handleAlarmSnooze = () => {
    if (!alarmDose) return;
    setSelectedDoseForSnooze(alarmDose as DoseCardDose);
    dismissAlarm();
    setSnoozeSheetOpen(true);
  };

  const handleAlarmTakenElsewhere = async () => {
    if (!alarmDose) return;
    await handleTakenElsewhere(alarmDose as DoseCardDose);
    dismissAlarm();
  };

  // Test alarm trigger (for preview testing)
  const handleTestAlarm = () => {
    const testDose = upcomingDoses[0] || {
      id: 'test',
      medicationId: 'test',
      medicationName: 'Test Medication',
      strengthValue: 500,
      strengthUnit: 'mg',
      form: 'Tablet',
      scheduledTime: new Date(),
      displayTime: format(new Date(), 'h:mm a'),
    };
    triggerAlarm(testDose);
  };

  const handleRefresh = useCallback(async () => {
    await refreshMedications();
    triggerHaptic('success');
  }, [refreshMedications]);

  const handleMarkTaken = async (dose: DoseCardDose) => {
    const now = new Date();
    const scheduledTime = new Date(dose.scheduledTime);
    const diffMinutes = (now.getTime() - scheduledTime.getTime()) / (1000 * 60);
    const isLate = diffMinutes > 30; // 30 min window
    
    await logDose(
      dose.medicationId,
      dose.scheduledTime,
      'taken',
      { status: isLate ? 'late' : 'on_time', source: 'manual' }
    );
    
    await cancelNotification(dose.medicationId, dose.scheduledTime.toISOString());
    
    await createNotification('dose_taken', {
      medication_id: dose.medicationId,
      scheduled_datetime: dose.scheduledTime,
      metadata: { medicationName: dose.medicationName, source: 'manual' }
    });
    
    triggerHaptic('success');
  };

  const handleTakenElsewhere = async (dose: DoseCardDose) => {
    const now = new Date();
    const scheduledTime = new Date(dose.scheduledTime);
    const diffMinutes = (now.getTime() - scheduledTime.getTime()) / (1000 * 60);
    const isLate = diffMinutes > 30;
    
    await logDose(
      dose.medicationId,
      dose.scheduledTime,
      'taken',
      { status: isLate ? 'late' : 'on_time', source: 'manual' }
    );
    
    await cancelNotification(dose.medicationId, dose.scheduledTime.toISOString());
    
    await createNotification('dose_taken', {
      medication_id: dose.medicationId,
      scheduled_datetime: dose.scheduledTime,
      metadata: { medicationName: dose.medicationName, source: 'manual', takenElsewhere: true }
    });
    
    triggerHaptic('success');
  };

  const handleSkip = async (dose: DoseCardDose) => {
    await logDose(
      dose.medicationId,
      dose.scheduledTime,
      'skipped'
    );
    triggerHaptic('light');
  };

  const handleOpenSnooze = (dose: DoseCardDose) => {
    setSelectedDoseForSnooze(dose);
    setSnoozeSheetOpen(true);
  };

  const handleSnooze = async (minutes: number) => {
    if (!selectedDoseForSnooze) return;
    
    await logDose(
      selectedDoseForSnooze.medicationId,
      selectedDoseForSnooze.scheduledTime,
      'snoozed'
    );
    
    const med = medications.find(m => m.id === selectedDoseForSnooze.medicationId);
    if (med) {
      await scheduleSnoozeReminder(
        { genericName: med.generic_name, id: med.id } as any, 
        selectedDoseForSnooze.scheduledTime.toISOString(), 
        minutes
      );
    }
    
    await createNotification('reminder_snoozed', {
      medication_id: selectedDoseForSnooze.medicationId,
      scheduled_datetime: selectedDoseForSnooze.scheduledTime,
      metadata: { minutes }
    });
    
    triggerHaptic('light');
    setSelectedDoseForSnooze(null);
    setSnoozeSheetOpen(false);
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
              <WeekPicker selectedDate={selectedDate} onSelectDate={setSelectedDate} navigateToCalendar />
            </FadeIn>

            <FadeIn delay={0.2}>
              <ProgressCard taken={takenCount} total={totalCount} />
            </FadeIn>

            {/* Test Alarm Button */}
            <FadeIn delay={0.22}>
              <motion.button
                onClick={handleTestAlarm}
                className="btn-secondary w-full py-3 gap-2"
                whileTap={{ scale: 0.96 }}
              >
                <Volume2 className="h-4 w-4" />
                Test Alarm
              </motion.button>
            </FadeIn>

            {showProfileCard && (
              <FadeIn delay={0.25}>
                <FinishProfileCard onDismiss={() => setShowFinishProfile(false)} />
              </FadeIn>
            )}


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

            {scheduledDoses.length === 0 && (
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
        dose={selectedDoseForSnooze as any}
        onSnooze={handleSnooze}
      />

      {/* Case Selection Sheet */}
      <CaseSelectionSheet
        open={!!pendingCaseSelection}
        onOpenChange={(open) => !open && cancelCaseSelection()}
        doses={pendingCaseSelection || []}
        onSelect={confirmCaseSelection}
      />

      {/* Alarm Overlay */}
      <AlarmOverlay
        isActive={isAlarmActive}
        dose={alarmDose}
        onMarkTaken={handleAlarmTaken}
        onSkip={handleAlarmSkip}
        onSnooze={handleAlarmSnooze}
        onTakenElsewhere={handleAlarmTakenElsewhere}
      />
    </AnimatedPage>
  );
}
