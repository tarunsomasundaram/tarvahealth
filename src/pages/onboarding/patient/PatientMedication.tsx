import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Pill, Plus, Check } from "lucide-react";
import { triggerHaptic } from "@/hooks/use-haptics";
import { useData } from "@/contexts/DataContext";
import { InfoButton } from "@/components/onboarding/InfoButton";

export default function PatientMedication() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeMedications } = useData();

  // Check if user just added a medication (coming back from /add)
  const justAdded = location.state?.fromAdd === true;

  const handleBack = () => {
    triggerHaptic('light');
    navigate("/onboarding/patient/conditions");
  };

  const handleAddMedication = () => {
    triggerHaptic('medium');
    // Navigate to the add medication page with onboarding flag
    navigate("/add", { state: { fromOnboarding: true } });
  };

  const handleContinue = () => {
    triggerHaptic('medium');
    navigate("/onboarding/patient/caregiver");
  };

  const handleSkip = () => {
    triggerHaptic('light');
    navigate("/onboarding/patient/caregiver");
  };

  const hasMedications = activeMedications.length > 0;

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <motion.button
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </motion.button>
        
        {/* Progress indicator */}
        <div className="flex gap-1.5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full ${
                i <= 4 ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        
        <InfoButton 
          title="Your Medications"
          description="Add the medications you take regularly. Search our database of US generics and brand names, or add custom entries. Each medication includes dosage, schedule, and optional case storage. You can add, edit, or remove medications anytime from My Medications."
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-primary shadow-lg"
        >
          <Pill className="h-12 w-12 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 text-center"
        >
          <h1 className="text-title-large text-foreground">
            {hasMedications ? "Your medications" : "Add your medications"}
          </h1>
          <p className="mt-3 text-body text-muted-foreground max-w-xs">
            {hasMedications 
              ? `You've added ${activeMedications.length} medication${activeMedications.length > 1 ? 's' : ''}`
              : "Add the medications you take regularly"
            }
          </p>
        </motion.div>

        {/* Show added medications */}
        {hasMedications && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-6 w-full space-y-2"
          >
            {activeMedications.map((med) => (
              <div
                key={med.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-secondary"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{med.generic_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {med.strength_value ?? ""}{med.strength_unit ?? ""} • {med.form || "tablet"}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 w-full"
        >
          <motion.button
            onClick={handleAddMedication}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-6"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <span className="text-lg font-semibold text-primary">
              {hasMedications ? "Add another" : "Add medication"}
            </span>
          </motion.button>
        </motion.div>

        <p className="mt-6 text-xs text-muted-foreground text-center">
          You can add more anytime from the Add button.
        </p>
      </div>

      {/* Bottom buttons */}
      <div className="px-6 pb-10 pt-4">
        {hasMedications ? (
          <motion.button
            onClick={handleContinue}
            className="btn-primary w-full mb-3"
            whileTap={{ scale: 0.98 }}
          >
            Continue
          </motion.button>
        ) : null}
        <button
          onClick={handleSkip}
          className="w-full text-center text-sm font-medium text-muted-foreground"
        >
          {hasMedications ? "Skip adding more" : "Do this later"}
        </button>
      </div>
    </div>
  );
}
