import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useNotifications } from "@/hooks/use-notifications";
import { triggerHaptic } from "@/hooks/use-haptics";
import { Button } from "@/components/ui/button";
import { 
  Bell, Clock, Package, Battery, Users, Check, ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PreferenceCheckboxProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function PreferenceCheckbox({ label, description, icon, checked, onChange }: PreferenceCheckboxProps) {
  const handleToggle = () => {
    triggerHaptic('light');
    onChange(!checked);
  };

  return (
    <motion.button
      onClick={handleToggle}
      className="flex w-full items-center gap-4 py-4"
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-caption">{description}</p>
      </div>
      <div className={cn(
        "flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all",
        checked 
          ? "border-primary bg-primary" 
          : "border-muted-foreground/30 bg-transparent"
      )}>
        {checked && <Check className="h-4 w-4 text-primary-foreground" />}
      </div>
    </motion.button>
  );
}

export default function ReminderPreferences() {
  const navigate = useNavigate();
  const { 
    notificationPreferences, 
    setNotificationPreferences,
    setHasEnabledNotifications 
  } = useOnboarding();
  const { requestPermission, permissionGranted } = useNotifications();

  const [localPrefs, setLocalPrefs] = useState({
    doseReminders: notificationPreferences.doseReminders,
    lateDoseAlerts: notificationPreferences.lateDoseAlerts,
    refillAlerts: notificationPreferences.refillAlerts,
    lowBatteryAlerts: notificationPreferences.lowBatteryAlerts,
    caregiverSharingAlerts: notificationPreferences.caregiverSharingAlerts,
  });

  const hasAnySelected = Object.values(localPrefs).some(v => v);

  const handleSave = async () => {
    triggerHaptic('medium');
    
    // Request notification permission if any alerts are selected
    if (hasAnySelected && !permissionGranted) {
      const granted = await requestPermission();
      if (!granted) {
        // User denied permission, but we still save their preferences
        console.log('Notification permission denied');
      }
    }

    setNotificationPreferences(localPrefs);
    setHasEnabledNotifications(hasAnySelected);
    navigate(-1);
  };

  const updatePref = (key: keyof typeof localPrefs, value: boolean) => {
    setLocalPrefs(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AnimatedPage>
      <div className="page-padding">
        <div className="flex items-center gap-3 pb-4">
          <motion.button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </motion.button>
          <div>
            <h1 className="text-title-large text-foreground">Reminder Preferences</h1>
            <p className="text-caption">Choose which notifications to receive</p>
          </div>
        </div>

        <div className="section-gap">
          <FadeIn delay={0.1}>
            <p className="text-sm text-muted-foreground mb-4">
              Select the types of notifications you'd like to receive. Only selected categories will trigger alerts on your device.
            </p>
          </FadeIn>

          <StaggerContainer>
            <section className="card-tarva">
              <div className="divide-y divide-border">
                <StaggerItem>
                  <PreferenceCheckbox
                    label="Dose Reminders"
                    description="Get notified when it's time to take your medication"
                    icon={<Bell className="h-5 w-5 text-primary" />}
                    checked={localPrefs.doseReminders}
                    onChange={(v) => updatePref('doseReminders', v)}
                  />
                </StaggerItem>
                <StaggerItem>
                  <PreferenceCheckbox
                    label="Late Dose Alerts"
                    description="Notified if you haven't taken a dose on time"
                    icon={<Clock className="h-5 w-5 text-warning" />}
                    checked={localPrefs.lateDoseAlerts}
                    onChange={(v) => updatePref('lateDoseAlerts', v)}
                  />
                </StaggerItem>
                <StaggerItem>
                  <PreferenceCheckbox
                    label="Refill Alerts"
                    description="Reminded when 2 doses remaining in case"
                    icon={<Package className="h-5 w-5 text-primary" />}
                    checked={localPrefs.refillAlerts}
                    onChange={(v) => updatePref('refillAlerts', v)}
                  />
                </StaggerItem>
                <StaggerItem>
                  <PreferenceCheckbox
                    label="Low Battery Alerts"
                    description="Warned when case battery is low"
                    icon={<Battery className="h-5 w-5 text-warning" />}
                    checked={localPrefs.lowBatteryAlerts}
                    onChange={(v) => updatePref('lowBatteryAlerts', v)}
                  />
                </StaggerItem>
                <StaggerItem>
                  <PreferenceCheckbox
                    label="Caregiver Notifications"
                    description="Updates when caregivers are notified"
                    icon={<Users className="h-5 w-5 text-primary" />}
                    checked={localPrefs.caregiverSharingAlerts}
                    onChange={(v) => updatePref('caregiverSharingAlerts', v)}
                  />
                </StaggerItem>
              </div>
            </section>
          </StaggerContainer>

          <FadeIn delay={0.3}>
            <div className="mt-6">
              <Button
                onClick={handleSave}
                className="w-full bg-gradient-primary text-primary-foreground h-12 rounded-xl font-semibold"
              >
                {hasAnySelected ? 'Save Preferences' : 'Skip for Now'}
              </Button>
              {!hasAnySelected && (
                <p className="text-center text-caption mt-3">
                  You can enable notifications later in Settings
                </p>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </AnimatedPage>
  );
}