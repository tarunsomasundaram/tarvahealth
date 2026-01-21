import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { Pill, Clock, Box, Check, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/contexts/DataContext";
import { triggerHaptic } from "@/hooks/use-haptics";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function EditMedication() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { medications, schedules, updateMedication, updateSchedule, deleteMedication, getScheduleForMedication } = useData();
  
  const medication = medications.find(m => m.id === id);
  const schedule = medication ? getScheduleForMedication(medication.id) : undefined;

  // Form state
  const [strength, setStrength] = useState("");
  const [strengthUnit, setStrengthUnit] = useState("mg");
  const [form, setForm] = useState<"tablet" | "capsule" | "liquid" | "injection" | "patch" | "other">("tablet");
  const [instructions, setInstructions] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "custom" | "as-needed">("daily");
  const [times, setTimes] = useState<string[]>(["08:00"]);
  const [reminderWindow, setReminderWindow] = useState("30");
  const [storeInCase, setStoreInCase] = useState(false);
  const [compartment, setCompartment] = useState("1");
  const [refillQuantity, setRefillQuantity] = useState("30");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Load medication data
  useEffect(() => {
    if (medication && schedule) {
      setStrength(String(medication.strength_value || ""));
      setStrengthUnit(medication.strength_unit || "mg");
      setForm((medication.form as typeof form) || "tablet");
      setInstructions(medication.instructions || "");
      setFrequency((schedule.frequency_type as typeof frequency) || "daily");
      setTimes(schedule.times_of_day || ["08:00"]);
      setReminderWindow(String(schedule.on_time_window_minutes || 30));
      setStoreInCase(medication.stored_in_case || false);
      setCompartment(String(medication.compartment || "1"));
      setRefillQuantity(String(medication.refill_quantity_doses || 30));
    }
  }, [medication, schedule]);

  if (!medication || !schedule) {
    return (
      <AnimatedPage>
        <div className="page-padding">
          <PageHeader title="Medication Not Found" />
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Pill className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">This medication could not be found.</p>
            <motion.button 
              onClick={() => navigate("/medications")} 
              className="btn-primary mt-6"
              whileTap={{ scale: 0.97 }}
            >
              Back to Medications
            </motion.button>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  const handleSave = async () => {
    triggerHaptic("success");
    
    // Parse strength value
    const strengthVal = parseFloat(strength) || null;

    // Update medication
    await updateMedication(medication.id, {
      strength_value: strengthVal,
      strength_unit: strengthUnit,
      form,
      instructions: instructions || null,
      stored_in_case: storeInCase,
      compartment: storeInCase ? parseInt(compartment) : null,
      refill_quantity_doses: parseInt(refillQuantity) || 30,
    });

    // Update schedule
    if (schedule) {
      await updateSchedule(schedule.id, {
        frequency_type: frequency,
        times_of_day: times,
        on_time_window_minutes: parseInt(reminderWindow) || 30,
      });
    }

    navigate("/medications");
  };

  const handleDelete = async () => {
    triggerHaptic("warning");
    await deleteMedication(medication.id);
    setShowDeleteDialog(false);
    navigate("/medications");
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <AnimatedPage>
      <div className="page-padding pb-36">
        <PageHeader 
          title="Edit Medication" 
          subtitle={medication.generic_name}
        />

        <div className="section-gap">
          {/* Medication Info Card */}
          <FadeIn delay={0.1}>
            <div className="card-tarva">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                  <Pill className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{medication.generic_name}</h3>
                  {medication.alt_names && medication.alt_names.length > 0 && (
                    <p className="text-caption">{medication.alt_names.join(", ")}</p>
                  )}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Strength & Form */}
          <FadeIn delay={0.15}>
            <div className="card-tarva">
              <h3 className="text-section text-foreground mb-4">Strength & Form</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Strength</label>
                  <input
                    type="text"
                    placeholder="e.g., 10mg"
                    value={strength}
                    onChange={(e) => setStrength(e.target.value)}
                    className="input-tarva mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Form</label>
                  <div className="mt-2 flex gap-2">
                    {(["tablet", "capsule", "liquid"] as const).map((f) => (
                      <motion.button
                        key={f}
                        onClick={() => setForm(f)}
                        className={cn(
                          "rounded-xl px-4 py-2 text-sm font-medium transition-all capitalize",
                          form === f
                            ? "bg-gradient-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        )}
                        whileTap={{ scale: 0.95 }}
                      >
                        {f}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Instructions (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Take with food"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="input-tarva mt-1"
                  />
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Schedule */}
          <FadeIn delay={0.2}>
            <div className="card-tarva">
              <h3 className="text-section text-foreground mb-4">Schedule</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Frequency</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["daily", "weekly", "custom", "as-needed"] as const).map((f) => (
                      <motion.button
                        key={f}
                        onClick={() => setFrequency(f)}
                        className={cn(
                          "rounded-xl px-4 py-2 text-sm font-medium transition-all capitalize",
                          frequency === f
                            ? "bg-gradient-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        )}
                        whileTap={{ scale: 0.95 }}
                      >
                        {f === 'as-needed' ? 'As-needed' : f}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Time(s)</label>
                  <div className="mt-2 space-y-2">
                    <AnimatePresence mode="popLayout">
                      {times.map((time, index) => (
                        <motion.div 
                          key={index} 
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                            <Clock className="h-5 w-5 text-primary" />
                          </div>
                          <input
                            type="time"
                            value={time}
                            onChange={(e) => {
                              const newTimes = [...times];
                              newTimes[index] = e.target.value;
                              setTimes(newTimes);
                            }}
                            className="input-tarva flex-1"
                          />
                          {times.length > 1 && (
                            <motion.button
                              onClick={() => setTimes(times.filter((_, i) => i !== index))}
                              className="btn-ghost p-2"
                              whileTap={{ scale: 0.9 }}
                            >
                              <X className="h-4 w-4" />
                            </motion.button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <motion.button
                      onClick={() => setTimes([...times, "12:00"])}
                      className="btn-secondary w-full"
                      whileTap={{ scale: 0.98 }}
                    >
                      Add Another Time
                    </motion.button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">On-time Window</label>
                  <div className="mt-2 flex gap-2">
                    {["10", "30", "60"].map((w) => (
                      <motion.button
                        key={w}
                        onClick={() => setReminderWindow(w)}
                        className={cn(
                          "flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-all",
                          reminderWindow === w
                            ? "bg-gradient-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        )}
                        whileTap={{ scale: 0.95 }}
                      >
                        {w} min
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Case Linking */}
          <FadeIn delay={0.25}>
            <div className="card-tarva">
              <h3 className="text-section text-foreground mb-4">Case Linking</h3>
              <div className="space-y-4">
                <motion.button
                  onClick={() => setStoreInCase(!storeInCase)}
                  className="flex w-full items-center justify-between rounded-xl bg-secondary p-4"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <Box className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">Store in case?</span>
                  </div>
                  <motion.div
                    className={cn(
                      "h-6 w-11 rounded-full transition-colors",
                      storeInCase ? "bg-gradient-primary" : "bg-muted"
                    )}
                    layout
                  >
                    <motion.div
                      className="h-5 w-5 translate-y-0.5 rounded-full bg-white shadow-md"
                      animate={{ x: storeInCase ? 20 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {storeInCase && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div>
                        <label className="text-sm font-medium text-foreground">Compartment</label>
                        <div className="mt-2 flex gap-2">
                          {["1", "2", "3", "4"].map((c) => (
                            <motion.button
                              key={c}
                              onClick={() => setCompartment(c)}
                              className={cn(
                                "flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                                compartment === c
                                  ? "bg-gradient-primary text-primary-foreground"
                                  : "bg-secondary text-secondary-foreground"
                              )}
                              whileTap={{ scale: 0.95 }}
                            >
                              Slot {c}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Refill Quantity</label>
                        <input
                          type="number"
                          value={refillQuantity}
                          onChange={(e) => setRefillQuantity(e.target.value)}
                          className="input-tarva mt-1"
                          placeholder="Number of doses per refill"
                        />
                        <p className="mt-1 text-small">Alert when 2 doses remaining</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </FadeIn>

          {/* Delete Button */}
          <FadeIn delay={0.3}>
            <motion.button
              onClick={() => setShowDeleteDialog(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive"
              whileTap={{ scale: 0.98 }}
            >
              <Trash2 className="h-5 w-5" />
              <span className="font-medium">Delete Medication</span>
            </motion.button>
          </FadeIn>
        </div>

        {/* Fixed Bottom Actions */}
        <motion.div 
          className="fixed bottom-24 left-0 right-0 flex gap-3 bg-background/95 px-5 py-4 backdrop-blur-sm"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.2 }}
        >
          <motion.button 
            onClick={() => navigate("/medications")} 
            className="btn-secondary flex-1"
            whileTap={{ scale: 0.97 }}
          >
            Cancel
          </motion.button>
          <motion.button 
            onClick={handleSave} 
            className="btn-primary flex-1"
            whileTap={{ scale: 0.97 }}
          >
            <Check className="h-4 w-4" />
            Save Changes
          </motion.button>
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medication</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {medication.generic_name}? This action cannot be undone. Your dose history will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AnimatedPage>
  );
}
