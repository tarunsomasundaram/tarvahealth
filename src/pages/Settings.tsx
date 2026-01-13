import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerItem } from "@/components/animations";
import { useTheme } from "@/hooks/use-theme";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { triggerHaptic } from "@/hooks/use-haptics";
import { PinSetup } from "@/components/security/PinSetup";
import { 
  Box, Bell, Download, Link, Shield, 
  Bluetooth, Battery, Sliders, Volume2, 
  FileText, Calendar, Lock, Moon, Sun, Monitor,
  ChevronRight, Fingerprint
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SettingToggleProps {
  label: string;
  description?: string;
  icon: React.ReactNode;
  enabled: boolean;
  onToggle: () => void;
}

function SettingToggle({ label, description, icon, enabled, onToggle }: SettingToggleProps) {
  const handleToggle = () => {
    triggerHaptic('light');
    onToggle();
  };

  return (
    <motion.button 
      onClick={handleToggle} 
      className="flex w-full items-center gap-4 py-3"
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="font-medium text-foreground">{label}</p>
        {description && <p className="text-caption">{description}</p>}
      </div>
      <div className={cn(
        "h-6 w-11 rounded-full transition-colors",
        enabled ? "bg-gradient-primary" : "bg-muted"
      )}>
        <motion.div
          className="h-5 w-5 translate-y-0.5 rounded-full bg-white shadow-md"
          animate={{ x: enabled ? 20 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    </motion.button>
  );
}

interface SettingLinkProps {
  label: string;
  description?: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function SettingLink({ label, description, icon, onClick }: SettingLinkProps) {
  const handleClick = () => {
    triggerHaptic('light');
    onClick();
  };

  return (
    <motion.button 
      onClick={handleClick} 
      className="flex w-full items-center gap-4 py-3"
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="font-medium text-foreground">{label}</p>
        {description && <p className="text-caption">{description}</p>}
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </motion.button>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { pinEnabled, faceIdEnabled, setFaceIdEnabled, notificationPreferences } = useOnboarding();
  const [batterySaver, setBatterySaver] = useState(false);
  
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinMode, setPinMode] = useState<"setup" | "change" | "disable">("setup");

  // Count enabled notification categories
  const enabledNotificationCount = [
    notificationPreferences.doseReminders,
    notificationPreferences.lateDoseAlerts,
    notificationPreferences.refillAlerts,
    notificationPreferences.lowBatteryAlerts,
    notificationPreferences.caregiverSharingAlerts,
  ].filter(Boolean).length;

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    triggerHaptic('medium');
    setTheme(newTheme);
  };

  const handlePinSetup = () => {
    setPinMode(pinEnabled ? "change" : "setup");
    setPinModalOpen(true);
  };

  const handleFaceIdToggle = () => {
    if (!pinEnabled) {
      setPinMode("setup");
      setPinModalOpen(true);
    } else {
      setFaceIdEnabled(!faceIdEnabled);
    }
  };

  return (
    <AnimatedPage>
      <div className="page-padding">
        <PageHeader title="Settings" />

        <div className="section-gap">
          {/* Case Settings */}
          <StaggerItem>
            <section className="card-tarva">
              <h3 className="text-section text-foreground mb-2">Case Settings</h3>
              <div className="divide-y divide-border">
                <SettingLink
                  label="Connect Case"
                  description="Bluetooth pairing"
                  icon={<Bluetooth className="h-5 w-5 text-primary" />}
                  onClick={() => console.log("Connect case")}
                />
                <SettingLink
                  label="Sync Frequency"
                  description="Every 5 minutes"
                  icon={<Sliders className="h-5 w-5 text-primary" />}
                  onClick={() => console.log("Sync frequency")}
                />
                <SettingLink
                  label="Calibration"
                  description="Adjust sensor sensitivity"
                  icon={<Box className="h-5 w-5 text-primary" />}
                  onClick={() => console.log("Calibration")}
                />
                <SettingToggle
                  label="Battery Saver"
                  description="Reduce sync frequency"
                  icon={<Battery className="h-5 w-5 text-primary" />}
                  enabled={batterySaver}
                  onToggle={() => setBatterySaver(!batterySaver)}
                />
              </div>
            </section>
          </StaggerItem>

          {/* Notifications */}
          <FadeIn delay={0.15}>
            <section className="card-tarva">
              <h3 className="text-section text-foreground mb-2">Notifications</h3>
              <div className="divide-y divide-border">
                <SettingLink
                  label="Reminder Preferences"
                  description={enabledNotificationCount > 0 ? `${enabledNotificationCount} categories enabled` : 'Configure alerts'}
                  icon={<Bell className="h-5 w-5 text-primary" />}
                  onClick={() => navigate('/reminder-preferences')}
                />
              </div>
            </section>
          </FadeIn>

          {/* Data & Export */}
          <FadeIn delay={0.2}>
            <section className="card-tarva">
              <h3 className="text-section text-foreground mb-2">Data & Export</h3>
              <div className="divide-y divide-border">
                <SettingLink
                  label="Export History"
                  description="Download PDF reports"
                  icon={<Download className="h-5 w-5 text-primary" />}
                  onClick={() => console.log("Export")}
                />
                <SettingLink
                  label="PDF Preferences"
                  description="Customize export format"
                  icon={<FileText className="h-5 w-5 text-primary" />}
                  onClick={() => console.log("PDF preferences")}
                />
              </div>
            </section>
          </FadeIn>

          {/* Integrations */}
          <FadeIn delay={0.25}>
            <section className="card-tarva">
              <h3 className="text-section text-foreground mb-2">Integrations</h3>
              <div className="divide-y divide-border">
                <SettingLink
                  label="Apple Health"
                  description="Connected"
                  icon={<Link className="h-5 w-5 text-primary" />}
                  onClick={() => console.log("Apple Health")}
                />
                <SettingLink
                  label="Calendar Sync"
                  description="iOS Calendar"
                  icon={<Calendar className="h-5 w-5 text-primary" />}
                  onClick={() => console.log("Calendar")}
                />
              </div>
            </section>
          </FadeIn>

          {/* Privacy & Security */}
          <FadeIn delay={0.3}>
            <section className="card-tarva">
              <h3 className="text-section text-foreground mb-2">Privacy & Security</h3>
              <div className="divide-y divide-border">
                <SettingToggle
                  label="Face ID / Touch ID"
                  description={faceIdEnabled ? "Enabled" : "Unlock with biometrics"}
                  icon={<Fingerprint className="h-5 w-5 text-primary" />}
                  enabled={faceIdEnabled}
                  onToggle={handleFaceIdToggle}
                />
                <SettingLink
                  label={pinEnabled ? "Change PIN" : "Set up PIN"}
                  description={pinEnabled ? "Update your 4-digit PIN" : "Lock your app with a PIN"}
                  icon={<Lock className="h-5 w-5 text-primary" />}
                  onClick={handlePinSetup}
                />
              </div>
            </section>
          </FadeIn>

          {/* Appearance */}
          <FadeIn delay={0.35}>
            <section className="card-tarva">
              <h3 className="text-section text-foreground mb-4">Appearance</h3>
              <div className="flex gap-2">
                {[
                  { value: "light" as const, icon: Sun, label: "Light" },
                  { value: "dark" as const, icon: Moon, label: "Dark" },
                  { value: "system" as const, icon: Monitor, label: "System" },
                ].map((option) => {
                  const Icon = option.icon;
                  const isActive = theme === option.value;
                  return (
                    <motion.button
                      key={option.value}
                      onClick={() => handleThemeChange(option.value)}
                      className={cn(
                        "flex flex-1 flex-col items-center gap-2 rounded-xl py-4 transition-all",
                        isActive
                          ? "bg-gradient-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      )}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </section>
          </FadeIn>
        </div>
      </div>

      <PinSetup
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        mode={pinMode}
      />
    </AnimatedPage>
  );
}