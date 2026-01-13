import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Fingerprint } from "lucide-react";
import { triggerHaptic } from "@/hooks/use-haptics";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { cn } from "@/lib/utils";

export default function CaregiverPasscode() {
  const navigate = useNavigate();
  const { setPinEnabled, setPinCode, setFaceIdEnabled } = useOnboarding();
  
  const [step, setStep] = useState<'ask' | 'enter' | 'confirm'>('ask');
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [enableFaceId, setEnableFaceId] = useState(false);

  const handleBack = () => {
    triggerHaptic('light');
    if (step === 'enter') {
      setStep('ask');
      setPin("");
    } else if (step === 'confirm') {
      setStep('enter');
      setConfirmPin("");
    } else {
      navigate("/onboarding/caregiver/profile");
    }
  };

  const handleSetupPin = () => {
    triggerHaptic('medium');
    setStep('enter');
  };

  const handleSkip = () => {
    triggerHaptic('light');
    navigate("/onboarding/caregiver/notifications");
  };

  const handlePinInput = (digit: string) => {
    triggerHaptic('light');
    setError("");
    
    if (step === 'enter') {
      if (pin.length < 4) {
        const newPin = pin + digit;
        setPin(newPin);
        if (newPin.length === 4) {
          setTimeout(() => setStep('confirm'), 200);
        }
      }
    } else if (step === 'confirm') {
      if (confirmPin.length < 4) {
        const newConfirmPin = confirmPin + digit;
        setConfirmPin(newConfirmPin);
        if (newConfirmPin.length === 4) {
          if (newConfirmPin === pin) {
            triggerHaptic('success');
            setPinEnabled(true);
            setPinCode(newConfirmPin);
            setFaceIdEnabled(enableFaceId);
            navigate("/onboarding/caregiver/notifications");
          } else {
            triggerHaptic('error');
            setError("PINs don't match. Try again.");
            setConfirmPin("");
          }
        }
      }
    }
  };

  const handleDelete = () => {
    triggerHaptic('light');
    if (step === 'enter') {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const currentPin = step === 'enter' ? pin : confirmPin;

  if (step === 'ask') {
    return (
      <div className="fixed inset-0 flex flex-col bg-background">
        <div className="flex items-center justify-between px-4 pt-4">
          <motion.button
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </motion.button>
          
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 w-6 rounded-full ${
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
            <Lock className="h-12 w-12 text-white" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 text-center"
          >
            <h1 className="text-title-large text-foreground">
              Set a passcode?
            </h1>
            <p className="mt-3 text-body text-muted-foreground max-w-xs">
              Add an optional 4-digit PIN to secure the app.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 w-full"
          >
            <motion.button
              onClick={() => setEnableFaceId(!enableFaceId)}
              className="flex w-full items-center justify-between rounded-xl bg-card p-4"
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                  <Fingerprint className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium text-foreground">Enable Face ID / Touch ID</span>
              </div>
              <div className={cn(
                "h-6 w-11 rounded-full transition-colors",
                enableFaceId ? "bg-gradient-primary" : "bg-muted"
              )}>
                <motion.div
                  className="h-5 w-5 translate-y-0.5 rounded-full bg-white shadow-md"
                  animate={{ x: enableFaceId ? 20 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </div>
            </motion.button>
          </motion.div>
        </div>

        <div className="px-6 pb-10 pt-4">
          <motion.button
            onClick={handleSetupPin}
            className="btn-primary w-full py-4"
            whileTap={{ scale: 0.98 }}
          >
            Set passcode
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

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      <div className="flex items-center justify-between px-4 pt-4">
        <motion.button
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </motion.button>
        
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full ${
                i <= 1 ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-title-large text-foreground">
            {step === 'enter' ? 'Enter a 4-digit PIN' : 'Confirm your PIN'}
          </h1>
          <p className="mt-2 text-body text-muted-foreground">
            {step === 'enter' 
              ? "Choose something easy to remember"
              : "Enter the same PIN again"}
          </p>
        </motion.div>

        <div className="mt-10 flex gap-4">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className={cn(
                "h-4 w-4 rounded-full transition-all",
                i < currentPin.length ? "bg-primary scale-110" : "bg-muted"
              )}
              animate={{ scale: i < currentPin.length ? 1.1 : 1 }}
            />
          ))}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-sm text-destructive"
          >
            {error}
          </motion.p>
        )}

        <div className="mt-12 grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'].map((item) => {
            if (item === '') {
              return <div key="empty" className="h-16 w-16" />;
            }
            
            if (item === 'del') {
              return (
                <motion.button
                  key="del"
                  onClick={handleDelete}
                  className="flex h-16 w-16 items-center justify-center rounded-full text-foreground"
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="text-sm font-medium">Delete</span>
                </motion.button>
              );
            }

            return (
              <motion.button
                key={item}
                onClick={() => handlePinInput(item.toString())}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-xl font-semibold text-foreground"
                whileTap={{ scale: 0.9, backgroundColor: "hsl(var(--primary))" }}
              >
                {item}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
