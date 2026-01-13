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
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="tab-add"
              aria-label={tab.label}
            >
              <Icon className="h-6 w-6" strokeWidth={2.5} />
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={cn("tab-item", isActive && "active")}
          >
            <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[11px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
