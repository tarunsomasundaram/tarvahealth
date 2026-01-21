import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Share2, Copy, Check, Link2 } from "lucide-react";
import { triggerHaptic } from "@/hooks/use-haptics";
import { useOnboarding, CaregiverPermissions } from "@/contexts/OnboardingContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { InfoButton } from "@/components/onboarding/InfoButton";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { OnboardingPageWrapper } from "@/components/onboarding/OnboardingPageWrapper";

const defaultPermissions: CaregiverPermissions = {
  viewCalendar: false,
  viewAdherence: false,
  missedDoseAlerts: false,
  refillAlerts: false,
  lowBatteryAlerts: false,
};

const permissionLabels: { id: keyof CaregiverPermissions; label: string }[] = [
  { id: 'viewCalendar', label: 'View calendar' },
  { id: 'viewAdherence', label: 'View adherence' },
  { id: 'missedDoseAlerts', label: 'Missed dose alerts' },
  { id: 'refillAlerts', label: 'Refill alerts' },
  { id: 'lowBatteryAlerts', label: 'Low battery alerts' },
];

export default function PatientCaregiver() {
  const navigate = useNavigate();
  const { generateInviteCode, inviteCode } = useOnboarding();
  const [step, setStep] = useState<'main' | 'permissions' | 'invite'>('main');
  const [permissions, setPermissions] = useState<CaregiverPermissions>(defaultPermissions);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleBack = () => {
    triggerHaptic('light');
    if (step === 'permissions') {
      setStep('main');
    } else if (step === 'invite') {
      setStep('permissions');
    } else {
      navigate("/onboarding/patient/medication");
    }
  };

  const handleInvite = () => {
    triggerHaptic('medium');
    setStep('permissions');
  };

  const handleContinueToInvite = () => {
    triggerHaptic('medium');
    const code = generateInviteCode();
    setGeneratedCode(code);
    setStep('invite');
  };

  const handleCopyCode = async () => {
    triggerHaptic('light');
    if (generatedCode) {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      toast.success("Code copied");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareLink = async () => {
    triggerHaptic('medium');
    const link = `https://tarva.health/invite/${generatedCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TARVA Health Invite',
          text: 'Join me on TARVA Health to help track my medications',
          url: link,
        });
      } catch (e) {
        await navigator.clipboard.writeText(link);
        toast.success("Link copied");
      }
    } else {
      await navigator.clipboard.writeText(link);
      toast.success("Link copied");
    }
  };

  const handleDone = () => {
    triggerHaptic('medium');
    navigate("/onboarding/complete");
  };

  const handleSkip = () => {
    triggerHaptic('light');
    navigate("/onboarding/complete");
  };

  const togglePermission = (id: keyof CaregiverPermissions) => {
    triggerHaptic('light');
    setPermissions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Main screen
  if (step === 'main') {
    return (
      <OnboardingPageWrapper>
        <div className="flex h-full flex-col bg-background">
          <div className="flex items-center justify-between px-4 pt-4">
            <motion.button
              onClick={handleBack}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </motion.button>
            
            <OnboardingProgress currentStep={4} totalSteps={5} />
            
            <InfoButton 
              title="Caregiver Sharing"
              description="Invite a trusted caregiver (family member, partner, friend) to monitor your medication adherence. You control exactly what they can see and which alerts they receive. Caregivers get a view-only dashboard. You can manage or revoke access anytime."
            />
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
          </div>

          <div className="relative z-50 px-6 pb-12 pt-4 bg-background" style={{ paddingBottom: 'max(3rem, env(safe-area-inset-bottom))' }}>
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
      </OnboardingPageWrapper>
    );
  }

  // Permissions screen
  if (step === 'permissions') {
    return (
      <OnboardingPageWrapper>
        <div className="flex h-full flex-col bg-background">
          <div className="flex items-center justify-between px-4 pt-4">
            <motion.button
              onClick={handleBack}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </motion.button>
            
            <OnboardingProgress currentStep={4} totalSteps={5} />
            
            <div className="w-10" />
          </div>

          <div className="flex-1 flex flex-col px-6 pt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-title-large text-foreground">
                Choose what they can access
              </h1>
              <p className="mt-2 text-body text-muted-foreground">
                You can change these permissions later
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-8 space-y-3"
            >
              {permissionLabels.map((perm, index) => {
                const isEnabled = permissions[perm.id];
                return (
                  <motion.button
                    key={perm.id}
                    onClick={() => togglePermission(perm.id)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + index * 0.05 }}
                    className="flex w-full items-center justify-between rounded-xl bg-card p-4"
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="font-medium text-foreground">{perm.label}</span>
                    <div className={cn(
                      "h-6 w-11 rounded-full transition-colors",
                      isEnabled ? "bg-gradient-primary" : "bg-muted"
                    )}>
                      <motion.div
                        className="h-5 w-5 translate-y-0.5 rounded-full bg-white shadow-md"
                        animate={{ x: isEnabled ? 20 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>

          <div className="relative z-50 px-6 pb-12 pt-4 bg-background" style={{ paddingBottom: 'max(3rem, env(safe-area-inset-bottom))' }}>
            <motion.button
              onClick={handleContinueToInvite}
              className="btn-primary w-full py-4"
              whileTap={{ scale: 0.98 }}
            >
              Continue
            </motion.button>
          </div>
        </div>
      </OnboardingPageWrapper>
    );
  }

  // Invite screen
  return (
    <OnboardingPageWrapper>
      <div className="flex h-full flex-col bg-background">
        <div className="flex items-center justify-between px-4 pt-4">
          <motion.button
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </motion.button>
          
          <OnboardingProgress currentStep={4} totalSteps={5} />
          
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-title-large text-foreground">
              Invite caregiver
            </h1>
            <p className="mt-2 text-body text-muted-foreground">
              Share this code. It expires in 15 minutes.
            </p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-8 w-full"
          >
            <div className="rounded-2xl bg-card p-6 text-center">
              <p className="text-sm font-medium text-muted-foreground mb-2">Invite code</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold tracking-[0.3em] text-foreground">
                  {generatedCode}
                </span>
                <motion.button
                  onClick={handleCopyCode}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
                  whileTap={{ scale: 0.9 }}
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Check className="h-5 w-5 text-success" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Copy className="h-5 w-5 text-foreground" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative z-50 px-6 pb-12 pt-4 bg-background" style={{ paddingBottom: 'max(3rem, env(safe-area-inset-bottom))' }}>
          <motion.button
            onClick={handleShareLink}
            className="btn-primary w-full py-4 flex items-center justify-center gap-2"
            whileTap={{ scale: 0.98 }}
          >
            <Link2 className="h-5 w-5" />
            Share invite link
          </motion.button>

          <button
            onClick={handleDone}
            className="mt-4 w-full text-center text-sm font-medium text-muted-foreground"
          >
            Done
          </button>
        </div>
      </div>
    </OnboardingPageWrapper>
  );
}
