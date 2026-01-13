import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { StepIndicator } from "@/components/add/StepIndicator";
import { Search, Pill, Clock, Box, Check, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = ["Medication", "Strength", "Schedule", "Case", "Save"];

const mockMedications = [
  { id: "1", name: "Lisinopril", alternates: ["Prinivil", "Zestril"] },
  { id: "2", name: "Metformin", alternates: ["Glucophage", "Fortamet"] },
  { id: "3", name: "Atorvastatin", alternates: ["Lipitor"] },
  { id: "4", name: "Omeprazole", alternates: ["Prilosec"] },
  { id: "5", name: "Amlodipine", alternates: ["Norvasc"] },
];

const stepVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 },
};

const stepTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

export default function AddMedication() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMed, setSelectedMed] = useState<typeof mockMedications[0] | null>(null);
  const [strength, setStrength] = useState("");
  const [form, setForm] = useState("Tablet");
  const [instructions, setInstructions] = useState("");
  const [frequency, setFrequency] = useState("Daily");
  const [times, setTimes] = useState(["08:00"]);
  const [reminderWindow, setReminderWindow] = useState("30");
  const [storeInCase, setStoreInCase] = useState(true);
  const [compartment, setCompartment] = useState("1");
  const [refillQuantity, setRefillQuantity] = useState("30");

  const filteredMeds = mockMedications.filter(
    (med) =>
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.alternates.some((alt) => alt.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    console.log("Saving medication...");
    navigate("/");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            key="step-0"
            initial="initial"
            animate="in"
            exit="out"
            variants={stepVariants}
            transition={stepTransition}
            className="section-gap"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search medications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-tarva pl-12"
              />
            </div>
            <StaggerContainer className="space-y-2">
              {filteredMeds.map((med) => (
                <StaggerItem key={med.id}>
                  <motion.button
                    onClick={() => {
                      setSelectedMed(med);
                      nextStep();
                    }}
                    className={cn(
                      "card-tarva-interactive w-full text-left",
                      selectedMed?.id === med.id && "ring-2 ring-primary"
                    )}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                        <Pill className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{med.name}</h4>
                        <p className="text-caption">{med.alternates.join(", ")}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </motion.button>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="step-1"
            initial="initial"
            animate="in"
            exit="out"
            variants={stepVariants}
            transition={stepTransition}
            className="section-gap"
          >
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
                    {["Tablet", "Capsule", "Liquid"].map((f) => (
                      <motion.button
                        key={f}
                        onClick={() => setForm(f)}
                        className={cn(
                          "rounded-xl px-4 py-2 text-sm font-medium transition-all",
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
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step-2"
            initial="initial"
            animate="in"
            exit="out"
            variants={stepVariants}
            transition={stepTransition}
            className="section-gap"
          >
            <div className="card-tarva">
              <h3 className="text-section text-foreground mb-4">Schedule</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Frequency</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["Daily", "Weekly", "Custom", "As-needed"].map((f) => (
                      <motion.button
                        key={f}
                        onClick={() => setFrequency(f)}
                        className={cn(
                          "rounded-xl px-4 py-2 text-sm font-medium transition-all",
                          frequency === f
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
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step-3"
            initial="initial"
            animate="in"
            exit="out"
            variants={stepVariants}
            transition={stepTransition}
            className="section-gap"
          >
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
            <p className="text-caption text-center">
              Add caregiver access later in Profile → Caregivers
            </p>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step-4"
            initial="initial"
            animate="in"
            exit="out"
            variants={stepVariants}
            transition={stepTransition}
            className="section-gap"
          >
            <div className="card-tarva">
              <h3 className="text-section text-foreground mb-4">Summary</h3>
              <div className="space-y-3">
                <motion.div 
                  className="flex items-center gap-4 rounded-xl bg-accent p-4"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
                    <Pill className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{selectedMed?.name}</h4>
                    <p className="text-caption">{strength} • {form}</p>
                  </div>
                </motion.div>
                <StaggerContainer className="grid grid-cols-2 gap-3">
                  <StaggerItem>
                    <div className="rounded-xl bg-secondary p-3">
                      <p className="text-caption">Frequency</p>
                      <p className="font-medium text-foreground">{frequency}</p>
                    </div>
                  </StaggerItem>
                  <StaggerItem>
                    <div className="rounded-xl bg-secondary p-3">
                      <p className="text-caption">Time(s)</p>
                      <p className="font-medium text-foreground">{times.join(", ")}</p>
                    </div>
                  </StaggerItem>
                  {storeInCase && (
                    <>
                      <StaggerItem>
                        <div className="rounded-xl bg-secondary p-3">
                          <p className="text-caption">Compartment</p>
                          <p className="font-medium text-foreground">Slot {compartment}</p>
                        </div>
                      </StaggerItem>
                      <StaggerItem>
                        <div className="rounded-xl bg-secondary p-3">
                          <p className="text-caption">Refill Qty</p>
                          <p className="font-medium text-foreground">{refillQuantity} doses</p>
                        </div>
                      </StaggerItem>
                    </>
                  )}
                </StaggerContainer>
                {instructions && (
                  <FadeIn delay={0.3}>
                    <div className="rounded-xl bg-secondary p-3">
                      <p className="text-caption">Instructions</p>
                      <p className="font-medium text-foreground">{instructions}</p>
                    </div>
                  </FadeIn>
                )}
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatedPage>
      <div className="page-padding">
        <PageHeader title="Add Medication" />

        <FadeIn delay={0.1}>
          <div className="mb-6">
            <StepIndicator steps={steps} currentStep={currentStep} />
          </div>
        </FadeIn>

        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        <motion.div 
          className="fixed bottom-24 left-0 right-0 flex gap-3 bg-background/95 px-5 py-4 backdrop-blur-sm"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.2 }}
        >
          {currentStep > 0 && (
            <motion.button 
              onClick={prevStep} 
              className="btn-secondary flex-1"
              whileTap={{ scale: 0.97 }}
            >
              Back
            </motion.button>
          )}
          {currentStep < steps.length - 1 ? (
            <motion.button
              onClick={nextStep}
              disabled={currentStep === 0 && !selectedMed}
              className={cn("btn-primary flex-1", currentStep === 0 && !selectedMed && "opacity-50")}
              whileTap={{ scale: 0.97 }}
            >
              Continue
            </motion.button>
          ) : (
            <motion.button 
              onClick={handleSave} 
              className="btn-primary flex-1"
              whileTap={{ scale: 0.97 }}
            >
              <Check className="h-4 w-4" />
              Save Medication
            </motion.button>
          )}
        </motion.div>
      </div>
    </AnimatedPage>
  );
}
