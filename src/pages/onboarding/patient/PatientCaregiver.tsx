import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Share2 } from "lucide-react";
import { triggerHaptic } from "@/hooks/use-haptics";

export default function PatientCaregiver() {
  const navigate = useNavigate();

  const handleBack = () => {
    triggerHaptic('light');
    navigate("/onboarding/patient/medication");
  };

  const handleInvite = () => {
    triggerHaptic('medium');
    navigate("/onboarding/complete");
  };

  const handleSkip = () => {
    triggerHaptic('light');
    navigate("/onboarding/complete");
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
              className="h-1.5 w-6 rounded-full bg-primary"
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
          <Users className="h-12 w-12 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 text-center"
        >
          <h1 className="text-title-large text-foreground">
            Share with a caregiver?
          </h1>
          <p className="mt-3 text-body text-muted-foreground max-w-xs">
            They can view your schedule and adherence, and get alerts if you allow it.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 w-full rounded-2xl bg-card p-5"
        >
          <p className="text-sm font-medium text-foreground mb-4">Choose what they can access</p>
          
          <div className="space-y-3">
            {[
              "View calendar",
              "View adherence",
              "Missed dose alerts",
              "Refill alerts",
              "Low battery alerts",
            ].map((permission) => (
              <div key={permission} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{permission}</span>
                <div className="h-5 w-9 rounded-full bg-muted">
                  <div className="h-4 w-4 translate-x-0.5 translate-y-0.5 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            You can change this later.
          </p>
        </motion.div>
      </div>

      {/* Bottom buttons */}
      <div className="px-6 pb-10 pt-4">
        <motion.button
          onClick={handleInvite}
          className="btn-primary w-full py-4 flex items-center justify-center gap-2"
          whileTap={{ scale: 0.98 }}
        >
          <Share2 className="h-5 w-5" />
          Invite caregiver
        </motion.button>

        <button
          onClick={handleSkip}
          className="mt-4 w-full text-center text-sm font-medium text-muted-foreground"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
