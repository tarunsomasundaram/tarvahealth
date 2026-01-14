import { motion, AnimatePresence } from "framer-motion";
import { Home, Smartphone, BarChart3, User, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/hooks/use-haptics";
import { useState } from "react";
import { MoreMenuSheet } from "./MoreMenuSheet";

const tabs = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "case", label: "Case", icon: Smartphone, path: "/case" },
  { id: "stats", label: "Stats", icon: BarChart3, path: "/stats" },
  { id: "profile", label: "Profile", icon: User, path: "/profile" },
  { id: "more", label: "More", icon: Menu, path: null },
];

export function FloatingBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Hide only on add medication flow and edit pages
  const hiddenRoutes = [
    "/add",
    "/edit-profile",
  ];

  const shouldHide = hiddenRoutes.some(route => location.pathname.startsWith(route));

  if (shouldHide) return null;

  return (
    <>
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="floating-nav"
      >
        <div className="floating-nav-container">
          {tabs.map((tab) => {
            const isActive = tab.path ? location.pathname === tab.path : isMoreOpen;
            const Icon = tab.icon;

            return (
              <motion.button
                key={tab.id}
                onClick={() => {
                  if (tab.path) {
                    triggerHaptic('light');
                    navigate(tab.path);
                  } else {
                    triggerHaptic('medium');
                    setIsMoreOpen(true);
                  }
                }}
                className={cn("floating-nav-item", isActive && "active")}
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  className="floating-nav-icon-wrapper"
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                <span className="floating-nav-label">{tab.label}</span>
                
                {/* Active indicator glow */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      className="floating-nav-glow"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </motion.nav>

      <MoreMenuSheet open={isMoreOpen} onOpenChange={setIsMoreOpen} />
    </>
  );
}
