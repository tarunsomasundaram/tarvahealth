import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pill, Plus } from "lucide-react";
import { triggerHaptic } from "@/hooks/use-haptics";

export default function PatientMedication() {
  const navigate = useNavigate();

  const handleBack = () => {
    triggerHaptic('light');
    navigate("/onboarding/patient/case");
  };

  const handleAddMedication = () => {
    triggerHaptic('medium');
    // For now, skip to caregiver step
    navigate("/onboarding/patient/caregiver");
  };

  const handleSkip = () => {
    triggerHaptic('light');
    navigate("/onboarding/patient/caregiver");
  };

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
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full ${
                i <= 3 ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        
        <div className="w-10" />
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
            Add your first medication
          </h1>
          <p className="mt-3 text-body text-muted-foreground max-w-xs">
            Choose from a verified list of US generic medications.
          </p>
        </motion.div>

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
            <span className="text-lg font-semibold text-primary">Add medication</span>
          </motion.button>
        </motion.div>

        <p className="mt-6 text-xs text-muted-foreground text-center">
          You can add more anytime from the Add button.
        </p>
      </div>

      {/* Bottom buttons */}
      <div className="px-6 pb-10 pt-4">
        <button
          onClick={handleSkip}
          className="w-full text-center text-sm font-medium text-muted-foreground"
        >
          Do this later
        </button>
      </div>
    </div>
  );
}
