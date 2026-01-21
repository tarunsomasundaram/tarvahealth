import { motion } from "framer-motion";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="relative">
          {/* Background dot */}
          <div className="h-1.5 w-6 rounded-full bg-muted" />
          
          {/* Animated fill */}
          <motion.div
            className="absolute inset-0 h-1.5 rounded-full bg-primary"
            initial={false}
            animate={{
              scaleX: index <= currentStep ? 1 : 0,
              opacity: index <= currentStep ? 1 : 0,
            }}
            transition={{
              duration: 0.4,
              delay: index <= currentStep ? index * 0.08 : 0,
              ease: [0.4, 0, 0.2, 1],
            }}
            style={{ originX: 0 }}
          />
          
          {/* Pulse effect on current step */}
          {index === currentStep && (
            <motion.div
              className="absolute inset-0 h-1.5 rounded-full bg-primary"
              initial={{ opacity: 0.6, scale: 1 }}
              animate={{ opacity: 0, scale: 1.5 }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
