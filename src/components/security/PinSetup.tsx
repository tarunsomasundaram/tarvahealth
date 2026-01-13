import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X, Check, Delete, Fingerprint } from "lucide-react";
import { triggerHaptic } from "@/hooks/use-haptics";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { cn } from "@/lib/utils";

interface PinSetupProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "setup" | "change" | "disable";
}

type SetupStep = "create" | "confirm" | "success" | "faceId";

export function PinSetup({ isOpen, onClose, mode }: PinSetupProps) {
  const { pinCode, setPinCode, setPinEnabled, faceIdEnabled, setFaceIdEnabled } = useOnboarding();
  
  const [step, setStep] = useState<SetupStep>("create");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setConfirmPin("");
      setError("");
      setStep(mode === "disable" ? "create" : "create");
    }
  }, [isOpen, mode]);

  const handleNumberPress = (num: string) => {
    triggerHaptic('light');
    
    if (step === "create" && pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (mode === "disable") {
          // Verify existing PIN
          if (newPin === pinCode) {
            setPinEnabled(false);
            setPinCode(null);
            setFaceIdEnabled(false);
            triggerHaptic('success');
            onClose();
          } else {
            setError("Incorrect PIN");
            setTimeout(() => {
              setPin("");
              setError("");
            }, 1000);
          }
        } else {
          // Move to confirm step
          setTimeout(() => setStep("confirm"), 300);
        }
      }
    } else if (step === "confirm" && confirmPin.length < 4) {
      const newConfirmPin = confirmPin + num;
      setConfirmPin(newConfirmPin);
      if (newConfirmPin.length === 4) {
        if (newConfirmPin === pin) {
          setPinCode(pin);
          setPinEnabled(true);
          triggerHaptic('success');
          setStep("faceId");
        } else {
          triggerHaptic('error');
          setError("PINs don't match. Try again.");
          setTimeout(() => {
            setConfirmPin("");
            setError("");
          }, 1000);
        }
      }
    }
  };

  const handleDelete = () => {
    triggerHaptic('light');
    if (step === "create" && pin.length > 0) {
      setPin(pin.slice(0, -1));
    } else if (step === "confirm" && confirmPin.length > 0) {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const handleEnableFaceId = () => {
    triggerHaptic('medium');
    setFaceIdEnabled(true);
    setStep("success");
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleSkipFaceId = () => {
    triggerHaptic('light');
    setStep("success");
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const currentPin = step === "create" ? pin : confirmPin;

  const getTitle = () => {
    if (mode === "disable") return "Enter your PIN";
    if (step === "create") return "Create a PIN";
    if (step === "confirm") return "Confirm your PIN";
    if (step === "faceId") return "Enable Face ID?";
    return "PIN set up!";
  };

  const getSubtitle = () => {
    if (mode === "disable") return "Enter your current PIN to disable security";
    if (step === "create") return "Choose a 4-digit PIN to lock your app";
    if (step === "confirm") return "Enter the same PIN again";
    if (step === "faceId") return "Unlock your app with Face ID for faster access";
    return "Your app is now protected";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-background"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4">
            <motion.button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-5 w-5 text-foreground" />
            </motion.button>
            <div />
          </div>

          <AnimatePresence mode="wait">
            {step === "faceId" ? (
              <motion.div
                key="faceId"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col items-center justify-center px-6"
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-primary shadow-lg"
                >
                  <Fingerprint className="h-12 w-12 text-white" />
                </motion.div>

                <h1 className="mt-8 text-title-large text-foreground text-center">
                  {getTitle()}
                </h1>
                <p className="mt-3 text-body text-muted-foreground text-center max-w-xs">
                  {getSubtitle()}
                </p>

                <div className="mt-auto pb-10 pt-8 w-full">
                  <motion.button
                    onClick={handleEnableFaceId}
                    className="btn-primary w-full py-4"
                    whileTap={{ scale: 0.98 }}
                  >
                    Enable Face ID
                  </motion.button>
                  <button
                    onClick={handleSkipFaceId}
                    className="mt-4 w-full text-center text-sm font-medium text-muted-foreground"
                  >
                    Not now
                  </button>
                </div>
              </motion.div>
            ) : step === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center px-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="flex h-24 w-24 items-center justify-center rounded-full bg-success/10"
                >
                  <Check className="h-12 w-12 text-success" />
                </motion.div>

                <h1 className="mt-8 text-title-large text-foreground text-center">
                  {getTitle()}
                </h1>
                <p className="mt-3 text-body text-muted-foreground text-center">
                  {getSubtitle()}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="pin-entry"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col items-center px-6"
              >
                <div className="mt-12 text-center">
                  <h1 className="text-title-large text-foreground">
                    {getTitle()}
                  </h1>
                  <p className="mt-2 text-body text-muted-foreground">
                    {getSubtitle()}
                  </p>
                </div>

                {/* PIN dots */}
                <div className="mt-12 flex gap-4">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className={cn(
                        "h-4 w-4 rounded-full transition-all",
                        currentPin.length > i ? "bg-primary" : "bg-muted",
                        error && "bg-destructive"
                      )}
                      animate={error ? { x: [-4, 4, -4, 4, 0] } : {}}
                      transition={{ duration: 0.3 }}
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

                {/* Number pad */}
                <div className="mt-auto mb-10 grid grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "delete"].map((item, i) => {
                    if (item === null) {
                      return <div key={i} />;
                    }
                    
                    if (item === "delete") {
                      return (
                        <motion.button
                          key={i}
                          onClick={handleDelete}
                          className="flex h-16 w-16 items-center justify-center rounded-full"
                          whileTap={{ scale: 0.9 }}
                        >
                          <Delete className="h-6 w-6 text-foreground" />
                        </motion.button>
                      );
                    }

                    return (
                      <motion.button
                        key={i}
                        onClick={() => handleNumberPress(String(item))}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-2xl font-semibold text-foreground"
                        whileTap={{ scale: 0.9, backgroundColor: "hsl(var(--primary))" }}
                      >
                        {item}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
