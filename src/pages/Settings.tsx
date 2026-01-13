import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { 
  Box, Bell, Download, Link, Shield, Palette, 
  Bluetooth, Battery, Sliders, Volume2, 
  FileText, Calendar, Lock, Moon, Sun, Monitor,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingToggleProps {
  label: string;
  description?: string;
  icon: React.ReactNode;
  enabled: boolean;
  onToggle: () => void;
}

function SettingToggle({ label, description, icon, enabled, onToggle }: SettingToggleProps) {
  return (
    <button onClick={onToggle} className="flex w-full items-center gap-4 py-3">
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
        <div className={cn(
          "h-5 w-5 translate-y-0.5 rounded-full bg-white shadow-md transition-transform",
          enabled ? "translate-x-5" : "translate-x-0.5"
        )} />
      </div>
    </button>
  );
}

interface SettingLinkProps {
  label: string;
  description?: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function SettingLink({ label, description, icon, onClick }: SettingLinkProps) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-4 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="font-medium text-foreground">{label}</p>
        {description && <p className="text-caption">{description}</p>}
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </button>
  );
}

export default function Settings() {
  const [doseReminders, setDoseReminders] = useState(true);
  const [refillAlerts, setRefillAlerts] = useState(true);
  const [lowBatteryAlerts, setLowBatteryAlerts] = useState(true);
  const [batterySaver, setBatterySaver] = useState(false);
  const [faceId, setFaceId] = useState(true);
  const [appearance, setAppearance] = useState<"light" | "dark" | "system">("system");

  return (
    <div className="page-padding">
      <PageHeader title="Settings" />

      <div className="section-gap">
        {/* Case Settings */}
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

        {/* Notifications */}
        <section className="card-tarva">
          <h3 className="text-section text-foreground mb-2">Notifications</h3>
          <div className="divide-y divide-border">
            <SettingToggle
              label="Dose Reminders"
              description="Get notified for each dose"
              icon={<Bell className="h-5 w-5 text-primary" />}
              enabled={doseReminders}
              onToggle={() => setDoseReminders(!doseReminders)}
            />
            <SettingToggle
              label="Refill Alerts"
              description="When 2 doses remaining"
              icon={<Volume2 className="h-5 w-5 text-primary" />}
              enabled={refillAlerts}
              onToggle={() => setRefillAlerts(!refillAlerts)}
            />
            <SettingToggle
              label="Low Battery Alerts"
              description="Case battery warnings"
              icon={<Battery className="h-5 w-5 text-primary" />}
              enabled={lowBatteryAlerts}
              onToggle={() => setLowBatteryAlerts(!lowBatteryAlerts)}
            />
          </div>
        </section>

        {/* Data & Export */}
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

        {/* Integrations */}
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

        {/* Privacy & Security */}
        <section className="card-tarva">
          <h3 className="text-section text-foreground mb-2">Privacy & Security</h3>
          <div className="divide-y divide-border">
            <SettingToggle
              label="Face ID / Touch ID"
              description="Unlock with biometrics"
              icon={<Shield className="h-5 w-5 text-primary" />}
              enabled={faceId}
              onToggle={() => setFaceId(!faceId)}
            />
            <SettingLink
              label="Change PIN"
              description="Update your security PIN"
              icon={<Lock className="h-5 w-5 text-primary" />}
              onClick={() => console.log("Change PIN")}
            />
          </div>
        </section>

        {/* Appearance */}
        <section className="card-tarva">
          <h3 className="text-section text-foreground mb-4">Appearance</h3>
          <div className="flex gap-2">
            {[
              { value: "light" as const, icon: Sun, label: "Light" },
              { value: "dark" as const, icon: Moon, label: "Dark" },
              { value: "system" as const, icon: Monitor, label: "System" },
            ].map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setAppearance(option.value)}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-2 rounded-xl py-4 transition-all",
                    appearance === option.value
                      ? "bg-gradient-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
