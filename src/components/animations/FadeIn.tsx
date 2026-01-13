import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
}

export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 0.4, 
  direction = "up",
  className = "" 
}: FadeInProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case "up": return { y: 16 };
      case "down": return { y: -16 };
      case "left": return { x: 16 };
      case "right": return { x: -16 };
      case "none": return {};
    }
  };

  const variants: Variants = {
    hidden: {
      opacity: 0,
      ...getInitialPosition(),
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
