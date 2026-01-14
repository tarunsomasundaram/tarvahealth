import { motion } from "framer-motion";
import { Plus, Globe, Bell, Settings, ChevronRight, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { triggerHaptic } from "@/hooks/use-haptics";

interface MenuItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  path: string;
  iconBg?: string;
}

// Scalable menu configuration - add new items here
const menuItems: MenuItem[] = [
  {
    id: "add",
    title: "Add Medication",
    subtitle: "Add a new prescription",
    icon: Plus,
    path: "/add",
    iconBg: "bg-primary/15 text-primary",
  },
  {
    id: "community",
    title: "Community",
    subtitle: "Join condition-based groups",
    icon: Globe,
    path: "/community",
    iconBg: "bg-blue-500/15 text-blue-500",
  },
  {
    id: "calendar",
    title: "Calendar",
    subtitle: "View dose history",
    icon: Calendar,
    path: "/calendar",
    iconBg: "bg-emerald-500/15 text-emerald-500",
  },
  {
    id: "caregivers",
    title: "Caregivers",
    subtitle: "Manage linked caregivers",
    icon: Users,
    path: "/caregivers",
    iconBg: "bg-amber-500/15 text-amber-500",
  },
  {
    id: "notifications",
    title: "Notifications",
    subtitle: "View alerts and reminders",
    icon: Bell,
    path: "/notifications",
    iconBg: "bg-pink-500/15 text-pink-500",
  },
  {
    id: "settings",
    title: "Settings",
    subtitle: "App preferences",
    icon: Settings,
    path: "/settings",
    iconBg: "bg-muted-foreground/15 text-muted-foreground",
  },
];

interface MoreMenuSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MoreMenuSheet({ open, onOpenChange }: MoreMenuSheetProps) {
  const navigate = useNavigate();

  const handleItemClick = (path: string) => {
    triggerHaptic('light');
    onOpenChange(false);
    navigate(path);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="more-menu-sheet">
        <SheetHeader className="more-menu-header">
          <SheetTitle className="text-base font-semibold">More</SheetTitle>
        </SheetHeader>

        <div className="more-menu-content">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleItemClick(item.path)}
                className="more-menu-item"
              >
                <div className={`more-menu-icon ${item.iconBg}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="more-menu-text">
                  <span className="more-menu-title">{item.title}</span>
                  {item.subtitle && (
                    <span className="more-menu-subtitle">{item.subtitle}</span>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
              </motion.button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
