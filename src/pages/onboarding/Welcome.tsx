import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Package, Smartphone, ChevronLeft, ChevronRight } from "lucide-react";
import { triggerHaptic } from "@/hooks/use-haptics";
import tarvaLogo from "@/assets/tarva-logo.png";

const carouselData = [
  {
    icon: Bell,
    title: "Stay on track",
    body: "Reminders that fit your routine.",
  },
  {
    icon: Smartphone,
    title: "Automatic tracking with the TARVA case",
    body: "When you take a dose from the case, TARVA logs it for you.",
  },
  {
    icon: Package,
    title: "Refill reminders at the right time",
    body: "Get notified when you're down to your last 2 doses.",
  },
];

export default function Welcome() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    triggerHaptic('light');
    if (currentIndex < carouselData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    triggerHaptic('light');
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleGetStarted = () => {
    triggerHaptic('medium');
    navigate("/auth");
  };

  const handleSignIn = () => {
    triggerHaptic('light');
    navigate("/auth", { state: { mode: "signin" } });
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* TARVA Logo at top */}
      <div className="pt-12 px-8 flex justify-center">
        <img 
          src={tarvaLogo} 
          alt="TARVA" 
          className="h-24 object-contain"
        />
      </div>

      {/* Carousel content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-primary shadow-lg">
              {(() => {
                const Icon = carouselData[currentIndex].icon;
                return <Icon className="h-14 w-14 text-white" />;
              })()}
            </div>

            <h1 className="text-title-large text-foreground mb-3">
              {carouselData[currentIndex].title}
            </h1>
            <p className="text-body text-muted-foreground max-w-xs">
              {carouselData[currentIndex].body}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        <div className="mt-12 flex items-center gap-6">
          <motion.button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary disabled:opacity-30"
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="h-6 w-6 text-foreground" />
          </motion.button>

          {/* Dots */}
          <div className="flex gap-2">
            {carouselData.map((_, i) => (
              <motion.div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === currentIndex
                    ? "w-6 bg-primary"
                    : "w-2 bg-muted-foreground/30"
                }`}
                layoutId="dot"
              />
            ))}
          </div>

          <motion.button
            onClick={handleNext}
            disabled={currentIndex === carouselData.length - 1}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary disabled:opacity-30"
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="h-6 w-6 text-foreground" />
          </motion.button>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="px-6 pb-10 pt-4">
        <motion.button
          onClick={handleGetStarted}
          className="btn-primary w-full py-4"
          whileTap={{ scale: 0.98 }}
        >
          Get started
        </motion.button>

        <button
          onClick={handleSignIn}
          className="mt-4 w-full text-center text-sm font-medium text-muted-foreground"
        >
          I already have an account
        </button>

        <p className="mt-6 text-center text-xs text-muted-foreground/70">
          You can change settings anytime.
        </p>
      </div>
    </div>
  );
}
