import { motion } from "framer-motion";
import { Home, Box, Plus, BarChart3, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "case", label: "Case", icon: Box, path: "/case" },
  { id: "add", label: "Add", icon: Plus, path: "/add" },
  { id: "stats", label: "Stats", icon: BarChart3, path: "/stats" },
  { id: "profile", label: "Profile", icon: User, path: "/profile" },
];

export function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="tab-bar">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        const Icon = tab.icon;

        if (tab.id === "add") {
          return (
            <motion.button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="tab-add"
              aria-label={tab.label}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
            >
              <Icon className="h-6 w-6" strokeWidth={2.5} />
            </motion.button>
          );
        }

        return (
          <motion.button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={cn("tab-item", isActive && "active")}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={{ 
                scale: isActive ? 1.1 : 1,
                y: isActive ? -2 : 0
              }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
            </motion.div>
            <span className="text-[11px] font-medium">{tab.label}</span>
            {isActive && (
              <motion.div
                className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary"
                layoutId="activeTab"
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
}
