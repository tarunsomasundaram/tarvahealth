import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";
import { triggerHaptic } from "@/hooks/use-haptics";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Confetti } from "@/components/animations/Confetti";
import { OnboardingPageWrapper } from "@/components/onboarding/OnboardingPageWrapper";

export default function OnboardingComplete() {
  const navigate = useNavigate();
  const { setHasCompletedOnboarding } = useOnboarding();

  const handleGoToHome = () => {
    triggerHaptic('heavy');
    setHasCompletedOnboarding(true);
    navigate("/");
  };

  return (
    <OnboardingPageWrapper>
      <div className="flex h-full flex-col bg-background">
        {/* Confetti celebration */}
        <Confetti />

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* Celebration animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              delay: 0.2 
            }}
            className="relative"
          >
            <motion.div
              className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-primary shadow-lg"
              animate={{ 
                boxShadow: [
                  "0 4px 14px -2px hsl(258 75% 45% / 0.35)",
                  "0 8px 24px -2px hsl(258 75% 45% / 0.5)",
                  "0 4px 14px -2px hsl(258 75% 45% / 0.35)",
                ]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Check className="h-14 w-14 text-white" />
            </motion.div>

            {/* Sparkle effects */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                  x: Math.cos((i * Math.PI) / 3) * 60,
                  y: Math.sin((i * Math.PI) / 3) * 60,
                }}
                transition={{
                  delay: 0.5 + i * 0.1,
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <Sparkles className="h-5 w-5 text-primary" />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 text-center"
          >
            <h1 className="text-title-large text-foreground">
              You're all set! 🎉
            </h1>
            <p className="mt-3 text-body text-muted-foreground">
              Let's take you to your Home screen.
            </p>
          </motion.div>
        </div>

        {/* Bottom button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative z-50 px-6 pb-12 pt-4 bg-background"
          style={{ paddingBottom: 'max(3rem, env(safe-area-inset-bottom))' }}
        >
          <motion.button
            onClick={handleGoToHome}
            className="btn-primary w-full py-4"
            whileTap={{ scale: 0.98 }}
          >
            Go to Home
          </motion.button>
        </motion.div>
      </div>
    </OnboardingPageWrapper>
  );
}
