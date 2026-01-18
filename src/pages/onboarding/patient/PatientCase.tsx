import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bluetooth, Box, Check, Loader2, X } from "lucide-react";
import { triggerHaptic } from "@/hooks/use-haptics";
import { useOnboarding } from "@/contexts/OnboardingContext";

type PairingState = "prompt" | "scanning" | "found" | "success" | "failed";

export default function PatientCase() {
  const navigate = useNavigate();
  const { setHasCasePaired } = useOnboarding();
  const [pairingState, setPairingState] = useState<PairingState>("prompt");

  const handleBack = () => {
    triggerHaptic('light');
    navigate("/onboarding/patient/notifications");
  };

  const handlePairNow = () => {
    triggerHaptic('medium');
    setPairingState("scanning");
    
    // Simulate scanning
    setTimeout(() => {
      setPairingState("found");
    }, 2000);
  };

  const handleSelectDevice = () => {
    triggerHaptic('medium');
    setPairingState("success");
    setHasCasePaired(true);
  };

  const handleContinue = () => {
    triggerHaptic('medium');
    navigate("/onboarding/patient/conditions");
  };

  const handleSkip = () => {
    triggerHaptic('light');
    setHasCasePaired(false);
    navigate("/onboarding/patient/conditions");
  };

  const handleTryAgain = () => {
    triggerHaptic('light');
    setPairingState("scanning");
    setTimeout(() => {
      // Randomly succeed or fail for demo
      setPairingState(Math.random() > 0.3 ? "found" : "failed");
    }, 2000);
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
                i <= 2 ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        
        <div className="w-10" />
      </div>

      <AnimatePresence mode="wait">
        {pairingState === "prompt" && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-primary shadow-lg"
            >
              <Box className="h-12 w-12 text-white" />
            </motion.div>

            <h1 className="mt-8 text-title-large text-foreground text-center">
              Connect your TARVA case
            </h1>
            <p className="mt-3 text-body text-muted-foreground text-center max-w-xs">
              Pair your case to log doses automatically and track battery and refills.
            </p>

            <p className="mt-6 text-xs text-muted-foreground text-center">
              You can pair anytime from the Case tab.
            </p>
          </motion.div>
        )}

        {pairingState === "scanning" && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-6"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex h-24 w-24 items-center justify-center rounded-3xl bg-accent"
            >
              <Bluetooth className="h-12 w-12 text-primary" />
            </motion.div>

            <h1 className="mt-8 text-title-large text-foreground text-center">
              Looking for your case
            </h1>
            <p className="mt-3 text-body text-muted-foreground text-center max-w-xs">
              Make sure Bluetooth is on and your case is nearby.
            </p>

            <div className="mt-8 flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Scanning…</span>
            </div>
          </motion.div>
        )}

        {pairingState === "found" && (
          <motion.div
            key="found"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col px-6 pt-8"
          >
            <h1 className="text-title-large text-foreground">
              Available devices
            </h1>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleSelectDevice}
              className="mt-6 flex items-center gap-4 rounded-2xl border-2 border-border bg-card p-4"
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
                <Box className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-foreground">TARVA Case</p>
                <p className="text-sm text-muted-foreground">Tap to pair</p>
              </div>
              <Bluetooth className="h-5 w-5 text-primary" />
            </motion.button>
          </motion.div>
        )}

        {pairingState === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
              Case connected
            </h1>
            <p className="mt-3 text-body text-muted-foreground text-center">
              You're all set.
            </p>

            <div className="mt-8 w-full rounded-2xl bg-card p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Battery</span>
                <span className="font-medium text-foreground">78%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last sync</span>
                <span className="font-medium text-foreground">just now</span>
              </div>
            </div>
          </motion.div>
        )}

        {pairingState === "failed" && (
          <motion.div
            key="failed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10"
            >
              <X className="h-12 w-12 text-destructive" />
            </motion.div>

            <h1 className="mt-8 text-title-large text-foreground text-center">
              Couldn't connect
            </h1>
            <p className="mt-3 text-body text-muted-foreground text-center max-w-xs">
              Try again. If it keeps happening, restart Bluetooth.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom buttons */}
      <div className="px-6 pb-10 pt-4">
        {pairingState === "prompt" && (
          <>
            <motion.button
              onClick={handlePairNow}
              className="btn-primary w-full py-4"
              whileTap={{ scale: 0.98 }}
            >
              Pair now
            </motion.button>
            <button
              onClick={handleSkip}
              className="mt-4 w-full text-center text-sm font-medium text-muted-foreground"
            >
              Skip for now
            </button>
          </>
        )}

        {pairingState === "scanning" && (
          <button
            onClick={handleSkip}
            className="w-full text-center text-sm font-medium text-muted-foreground"
          >
            Cancel
          </button>
        )}

        {pairingState === "success" && (
          <motion.button
            onClick={handleContinue}
            className="btn-primary w-full py-4"
            whileTap={{ scale: 0.98 }}
          >
            Continue
          </motion.button>
        )}

        {pairingState === "failed" && (
          <>
            <motion.button
              onClick={handleTryAgain}
              className="btn-primary w-full py-4"
              whileTap={{ scale: 0.98 }}
            >
              Try again
            </motion.button>
            <button
              onClick={handleSkip}
              className="mt-4 w-full text-center text-sm font-medium text-muted-foreground"
            >
              Skip for now
            </button>
          </>
        )}
      </div>
    </div>
  );
}
