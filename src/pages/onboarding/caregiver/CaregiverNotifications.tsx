import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, AlertCircle, Package, Check } from "lucide-react";
import { triggerHaptic } from "@/hooks/use-haptics";
import { useOnboarding } from "@/contexts/OnboardingContext";

export default function CaregiverNotifications() {
  const navigate = useNavigate();
  const { setHasEnabledNotifications } = useOnboarding();

  const handleBack = () => {
    triggerHaptic('light');
    navigate("/onboarding/caregiver/profile");
  };

  const handleEnable = () => {
    triggerHaptic('medium');
    setHasEnabledNotifications(true);
    navigate("/onboarding/caregiver/link");
  };

  const handleSkip = () => {
    triggerHaptic('light');
    setHasEnabledNotifications(false);
    navigate("/onboarding/caregiver/link");
  };

  const features = [
    { icon: AlertCircle, text: "Missed dose notifications" },
    { icon: Package, text: "Refill and low battery alerts" },
  ];

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
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full ${
                i <= 1 ? "bg-primary" : "bg-muted"
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
          <Bell className="h-12 w-12 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 text-center"
        >
          <h1 className="text-title-large text-foreground">
            Enable alerts?
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 w-full space-y-3"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-4 rounded-xl bg-card p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium text-foreground">{feature.text}</span>
                <Check className="ml-auto h-5 w-5 text-success" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Bottom buttons */}
      <div className="px-6 pb-10 pt-4">
        <motion.button
          onClick={handleEnable}
          className="btn-primary w-full py-4"
          whileTap={{ scale: 0.98 }}
        >
          Enable notifications
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
