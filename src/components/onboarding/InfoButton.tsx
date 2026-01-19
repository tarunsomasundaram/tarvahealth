import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, X } from "lucide-react";
import { triggerHaptic } from "@/hooks/use-haptics";

interface InfoButtonProps {
  title: string;
  description: string;
}

export function InfoButton({ title, description }: InfoButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    triggerHaptic('light');
    setIsOpen(true);
  };

  const handleClose = () => {
    triggerHaptic('light');
    setIsOpen(false);
  };

  return (
    <>
      <motion.button
        onClick={handleOpen}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
        whileTap={{ scale: 0.9 }}
        aria-label="More information"
      >
        <Info className="h-5 w-5 text-muted-foreground" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed left-4 right-4 top-1/2 z-50 -translate-y-1/2 rounded-2xl bg-card p-6 shadow-xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
                  <Info className="h-6 w-6 text-white" />
                </div>
                <motion.button
                  onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary"
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </motion.button>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
              <motion.button
                onClick={handleClose}
                className="btn-primary w-full mt-6"
                whileTap={{ scale: 0.98 }}
              >
                Got it
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
