import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Calendar, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/hooks/use-haptics";

const tabs = [
  { path: "/caregiver", icon: Home, label: "Home" },
  { path: "/caregiver/calendar", icon: Calendar, label: "Calendar" },
  { path: "/caregiver/stats", icon: BarChart3, label: "Stats" },
  { path: "/caregiver/profile", icon: User, label: "Profile" },
];

export function CaregiverTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleTabPress = (path: string) => {
    triggerHaptic("light");
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-t border-border/50 pb-safe">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;

            return (
              <motion.button
                key={tab.path}
                onClick={() => handleTabPress(tab.path)}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
                whileTap={{ scale: 0.9 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="caregiver-tab-indicator"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={cn("h-5 w-5 relative z-10", isActive && "stroke-[2.5]")} />
                <span className="text-[10px] font-medium relative z-10">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
