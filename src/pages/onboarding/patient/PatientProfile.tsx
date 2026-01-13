import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { triggerHaptic } from "@/hooks/use-haptics";
import { useOnboarding } from "@/contexts/OnboardingContext";

export default function PatientProfile() {
  const navigate = useNavigate();
  const { setPatientProfile } = useOnboarding();
  
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [allergies, setAllergies] = useState("");
  const [error, setError] = useState("");

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleBack = () => {
    triggerHaptic('light');
    navigate("/role-select");
  };

  const handleContinue = () => {
    triggerHaptic('medium');
    setError("");

    if (!fullName.trim()) {
      setError("Enter your name to continue.");
      return;
    }

    setPatientProfile({
      fullName: fullName.trim(),
      timezone,
      dateOfBirth: dateOfBirth || undefined,
      allergies: allergies || undefined,
    });

    navigate("/onboarding/patient/passcode");
  };

  const handleSkip = () => {
    triggerHaptic('light');
    setPatientProfile({
      fullName: "User",
      timezone,
    });
    navigate("/onboarding/patient/passcode");
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
                i === 0 ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col px-6 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-title-large text-foreground">
            Set up your profile
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 space-y-5"
        >
          <div>
            <label className="text-sm font-medium text-foreground">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-tarva mt-1.5"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Time zone</label>
            <input
              type="text"
              value={timezone}
              disabled
              className="input-tarva mt-1.5 bg-muted text-muted-foreground"
            />
          </div>

          <div className="pt-4">
            <p className="text-sm font-medium text-muted-foreground mb-4">Optional</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Date of birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="input-tarva mt-1.5"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Allergies</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="input-tarva mt-1.5"
                  placeholder="Penicillin"
                />
              </div>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive"
            >
              {error}
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* Bottom buttons */}
      <div className="px-6 pb-10 pt-4">
        <motion.button
          onClick={handleContinue}
          className="btn-primary w-full py-4"
          whileTap={{ scale: 0.98 }}
        >
          Continue
        </motion.button>

        <button
          onClick={handleSkip}
          className="mt-4 w-full text-center text-sm font-medium text-muted-foreground"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
