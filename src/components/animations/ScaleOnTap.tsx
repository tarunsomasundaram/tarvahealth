import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface ScaleOnTapProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  scale?: number;
  className?: string;
}

export function ScaleOnTap({ children, scale = 0.97, className = "", ...props }: ScaleOnTapProps) {
  return (
    <motion.div
      whileTap={{ scale }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
