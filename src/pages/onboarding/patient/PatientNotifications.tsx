import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Clock, Package, Battery, Users, Check } from "lucide-react";
import { triggerHaptic } from "@/hooks/use-haptics";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { cn } from "@/lib/utils";
import { InfoButton } from "@/components/onboarding/InfoButton";

interface NotificationOption {
  id: keyof typeof defaultPrefs;
  icon: typeof Bell;
  text: string;
}

const defaultPrefs = {
  doseReminders: false,
  lateDoseAlerts: false,
  refillAlerts: false,
  lowBatteryAlerts: false,
  caregiverSharingAlerts: false,
};

export default function PatientNotifications() {
  const navigate = useNavigate();
  const { setHasEnabledNotifications, setNotificationPreferences } = useOnboarding();
  const [selectedPrefs, setSelectedPrefs] = useState(defaultPrefs);

  const handleBack = () => {
    triggerHaptic('light');
    navigate("/onboarding/patient/passcode");
  };

  const handleToggle = (id: keyof typeof defaultPrefs) => {
    triggerHaptic('light');
    setSelectedPrefs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEnable = () => {
    triggerHaptic('medium');
    setNotificationPreferences(selectedPrefs);
    setHasEnabledNotifications(true);
    navigate("/onboarding/patient/case");
  };

  const handleSkip = () => {
    triggerHaptic('light');
    setHasEnabledNotifications(false);
    navigate("/onboarding/patient/case");
  };

  const hasAnySelected = Object.values(selectedPrefs).some(v => v);

  const options: NotificationOption[] = [
    { id: 'doseReminders', icon: Bell, text: "Dose reminders" },
    { id: 'lateDoseAlerts', icon: Clock, text: "Late dose alerts" },
    { id: 'refillAlerts', icon: Package, text: "Refill alerts (at 2 doses)" },
    { id: 'lowBatteryAlerts', icon: Battery, text: "Low battery alerts" },
    { id: 'caregiverSharingAlerts', icon: Users, text: "Caregiver sharing alerts" },
  ];

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 pt-4">
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
              className={`h-1.5 w-5 rounded-full ${
                i <= 2 ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        
        <InfoButton 
          title="Notification Preferences"
          description="Choose which alerts you want to receive. Dose reminders notify you when it's time to take medication. Late alerts trigger if you miss the on-time window. Refill alerts warn when you're running low. You can adjust these anytime in Settings."
        />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="flex flex-col items-center">
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
            Choose your notifications
          </h1>
          <p className="mt-2 text-body text-muted-foreground">
            Select the alerts you want to receive
          </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 w-full space-y-3"
        >
          {options.map((option, index) => {
            const Icon = option.icon;
            const isSelected = selectedPrefs[option.id];
            return (
              <motion.button
                key={option.id}
                onClick={() => handleToggle(option.id)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className={cn(
                  "flex w-full items-center gap-4 rounded-xl p-4 transition-all",
                  isSelected 
                    ? "bg-primary/10 ring-2 ring-primary" 
                    : "bg-card"
                )}
                whileTap={{ scale: 0.98 }}
              >
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                  isSelected ? "bg-primary/20" : "bg-accent"
                )}>
                  <Icon className={cn(
                    "h-5 w-5 transition-colors",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <span className={cn(
                  "flex-1 text-left font-medium transition-colors",
                  isSelected ? "text-foreground" : "text-muted-foreground"
                )}>
                  {option.text}
                </span>
                <div className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all",
                  isSelected 
                    ? "border-primary bg-primary" 
                    : "border-muted-foreground/30 bg-transparent"
                )}>
                  {isSelected && <Check className="h-4 w-4 text-white" />}
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {!hasAnySelected && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-sm text-muted-foreground text-center"
          >
            Select at least one to enable notifications
          </motion.p>
        )}
      </div>

      {/* Bottom buttons - fixed at bottom */}
      <div className="flex-shrink-0 px-6 pb-10 pt-4 bg-background">
        <motion.button
          onClick={handleEnable}
          disabled={!hasAnySelected}
          className={cn(
            "btn-primary w-full py-4 transition-opacity",
            !hasAnySelected && "opacity-50"
          )}
          whileTap={hasAnySelected ? { scale: 0.98 } : undefined}
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
