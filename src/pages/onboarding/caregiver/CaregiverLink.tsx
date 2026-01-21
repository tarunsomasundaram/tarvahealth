import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Mail, Link2, Check, X, Loader2 } from "lucide-react";
import { triggerHaptic } from "@/hooks/use-haptics";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { OnboardingPageWrapper } from "@/components/onboarding/OnboardingPageWrapper";

type LinkMode = "options" | "code" | "request" | "pending" | "declined" | "accepted";

export default function CaregiverLink() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<LinkMode>("options");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleBack = () => {
    triggerHaptic('light');
    if (mode === "options") {
      navigate("/onboarding/caregiver/notifications");
    } else {
      setMode("options");
      setError("");
    }
  };

  const handleEnterCode = () => {
    triggerHaptic('light');
    setMode("code");
  };

  const handleRequestAccess = () => {
    triggerHaptic('light');
    setMode("request");
  };

  const handleSubmitCode = () => {
    triggerHaptic('medium');
    setError("");

    if (code.length !== 6) {
      setError("That code doesn't look right.");
      return;
    }

    // Simulate validation
    if (code === "000000") {
      setError("This code expired. Ask the patient for a new one.");
      return;
    }

    setMode("accepted");
  };

  const handleSubmitRequest = () => {
    triggerHaptic('medium');
    setError("");

    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    setMode("pending");
  };

  const handleGoToDashboard = () => {
    triggerHaptic('medium');
    navigate("/onboarding/complete");
  };

  const handleTryAgain = () => {
    triggerHaptic('light');
    setMode("options");
    setError("");
    setCode("");
    setEmail("");
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
          <OnboardingProgress currentStep={2} totalSteps={3} />
          
          <div className="w-10" />
        </div>

        <AnimatePresence mode="wait">
          {mode === "options" && (
            <motion.div
              key="options"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col px-6 pt-8"
            >
              <h1 className="text-title-large text-foreground">
                Link to a patient
              </h1>
              <p className="mt-3 text-body text-muted-foreground">
                Enter an invite code from the patient to view their schedule and adherence.
              </p>

              <div className="mt-8 space-y-4">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleEnterCode}
                  className="flex w-full items-center gap-4 rounded-2xl bg-card p-5"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
                    <KeyRound className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Enter invite code</p>
                    <p className="text-sm text-muted-foreground">6-digit code from patient</p>
                  </div>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  onClick={handleRequestAccess}
                  className="flex w-full items-center gap-4 rounded-2xl bg-card p-5"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Request access</p>
                    <p className="text-sm text-muted-foreground">Send request by email</p>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {mode === "code" && (
            <motion.div
              key="code"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col px-6 pt-8"
            >
              <h1 className="text-title-large text-foreground">
                Enter invite code
              </h1>

              <div className="mt-8">
                <label className="text-sm font-medium text-foreground">6-digit code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="input-tarva mt-1.5 text-center text-2xl tracking-[0.5em] font-mono"
                  placeholder="123456"
                  maxLength={6}
                />
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

              <div className="mt-auto pb-10 pt-8">
                <motion.button
                  onClick={handleSubmitCode}
                  className="btn-primary w-full py-4"
                  whileTap={{ scale: 0.98 }}
                >
                  Continue
                </motion.button>
                <button
                  onClick={handleBack}
                  className="mt-4 w-full text-center text-sm font-medium text-muted-foreground"
                >
                  Back
                </button>
              </div>
            </motion.div>
          )}

          {mode === "request" && (
            <motion.div
              key="request"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col px-6 pt-8"
            >
              <h1 className="text-title-large text-foreground">
                Request access
              </h1>
              <p className="mt-3 text-body text-muted-foreground">
                Enter the patient's email. They'll need to approve your request.
              </p>

              <div className="mt-8">
                <label className="text-sm font-medium text-foreground">Patient email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-tarva mt-1.5"
                  placeholder="patient@example.com"
                />
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

              <div className="mt-auto pb-10 pt-8">
                <motion.button
                  onClick={handleSubmitRequest}
                  className="btn-primary w-full py-4"
                  whileTap={{ scale: 0.98 }}
                >
                  Send request
                </motion.button>
                <button
                  onClick={handleBack}
                  className="mt-4 w-full text-center text-sm font-medium text-muted-foreground"
                >
                  Back
                </button>
              </div>
            </motion.div>
          )}

          {mode === "pending" && (
            <motion.div
              key="pending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="flex h-24 w-24 items-center justify-center rounded-full bg-accent"
              >
                <Loader2 className="h-12 w-12 text-primary" />
              </motion.div>

              <h1 className="mt-8 text-title-large text-foreground text-center">
                Waiting for approval
              </h1>
              <p className="mt-3 text-body text-muted-foreground text-center max-w-xs">
                You'll get access as soon as the patient approves.
              </p>

              <div className="mt-auto pb-10 pt-8 w-full">
                <motion.button
                  onClick={handleGoToDashboard}
                  className="btn-primary w-full py-4"
                  whileTap={{ scale: 0.98 }}
                >
                  Go to dashboard
                </motion.button>
                <button
                  onClick={handleTryAgain}
                  className="mt-4 w-full text-center text-sm font-medium text-muted-foreground"
                >
                  Cancel request
                </button>
              </div>
            </motion.div>
          )}

          {mode === "declined" && (
            <motion.div
              key="declined"
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
                Request declined
              </h1>
              <p className="mt-3 text-body text-muted-foreground text-center max-w-xs">
                The patient didn't approve this request.
              </p>

              <div className="mt-auto pb-10 pt-8 w-full">
                <motion.button
                  onClick={handleTryAgain}
                  className="btn-primary w-full py-4"
                  whileTap={{ scale: 0.98 }}
                >
                  Try again
                </motion.button>
                <button
                  onClick={handleGoToDashboard}
                  className="mt-4 w-full text-center text-sm font-medium text-muted-foreground"
                >
                  Back
                </button>
              </div>
            </motion.div>
          )}

          {mode === "accepted" && (
            <motion.div
              key="accepted"
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
                <Link2 className="h-12 w-12 text-success" />
              </motion.div>

              <h1 className="mt-8 text-title-large text-foreground text-center">
                Linked
              </h1>
              <p className="mt-3 text-body text-muted-foreground text-center max-w-xs">
                You can now view the patient's schedule and adherence.
              </p>

              <div className="mt-auto pb-10 pt-8 w-full">
                <motion.button
                  onClick={handleGoToDashboard}
                  className="btn-primary w-full py-4"
                  whileTap={{ scale: 0.98 }}
                >
                  Go to dashboard
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </OnboardingPageWrapper>
  );
}
