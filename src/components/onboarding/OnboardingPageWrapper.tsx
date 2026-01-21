import { motion } from "framer-motion";
import { ReactNode } from "react";

interface OnboardingPageWrapperProps {
  children: ReactNode;
  direction?: "forward" | "back";
}

const slideVariants = {
  enter: (direction: "forward" | "back") => ({
    x: direction === "forward" ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: "forward" | "back") => ({
    x: direction === "forward" ? "-30%" : "30%",
    opacity: 0,
  }),
};

const transition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

export function OnboardingPageWrapper({ 
  children, 
  direction = "forward" 
}: OnboardingPageWrapperProps) {
  return (
    <motion.div
      className="fixed inset-0 bg-background"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
