import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { triggerHaptic } from "@/hooks/use-haptics";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { InfoButton } from "@/components/onboarding/InfoButton";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { OnboardingPageWrapper } from "@/components/onboarding/OnboardingPageWrapper";

export default function CaregiverProfile() {
  const navigate = useNavigate();
  const { setCaregiverProfile } = useOnboarding();
  
  const [fullName, setFullName] = useState("");
  const [relationship, setRelationship] = useState("");
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

    setCaregiverProfile({
      fullName: fullName.trim(),
      timezone,
      relationship: relationship || undefined,
    });

    navigate("/onboarding/caregiver/passcode");
  };

  const handleSkip = () => {
    triggerHaptic('light');
    setCaregiverProfile({
      fullName: "Caregiver",
      timezone,
    });
    navigate("/onboarding/caregiver/passcode");
  };

  return (
    <OnboardingPageWrapper>
      <div className="flex h-full flex-col bg-background">
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
          <OnboardingProgress currentStep={0} totalSteps={3} />
          
          <InfoButton 
            title="Caregiver Profile"
            description="Set up your caregiver profile. Your name helps patients identify you, and the relationship field (optional) clarifies your role (parent, spouse, friend, etc.). After setup, you'll be able to link to patients who invite you."
          />
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
              
              <div>
                <label className="text-sm font-medium text-foreground">Relationship</label>
                <input
                  type="text"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="input-tarva mt-1.5"
                  placeholder="Parent, partner, friend"
                />
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
        <div className="relative z-50 px-6 pb-12 pt-4 bg-background" style={{ paddingBottom: 'max(3rem, env(safe-area-inset-bottom))' }}>
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
    </OnboardingPageWrapper>
  );
}
