import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Bell, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { triggerHaptic } from "@/hooks/use-haptics";
import tarvaLogo from "@/assets/tarva-logo.png";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showNotification?: boolean;
  showCalendar?: boolean;
  rightContent?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  showNotification = false,
  showCalendar = false,
  rightContent,
}: PageHeaderProps) {
  const navigate = useNavigate();
  const { notifications } = useOnboarding();
  
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const handleNotificationClick = () => {
    triggerHaptic('light');
    navigate("/notifications");
  };

  const handleCalendarClick = () => {
    triggerHaptic('light');
    navigate("/calendar");
  };

  return (
    <header className="flex items-start justify-between pb-4">
      <div>
        {title === "TARVA" ? (
          <div className="flex flex-col">
            <h1 className="sr-only">TARVA — Smart Medication Schedule</h1>
            <img 
              src={tarvaLogo} 
              alt="TARVA" 
              aria-hidden="true"
              className="h-12 object-contain object-left dark:invert-0 invert"
            />
            {subtitle && <p className="text-caption mt-1">{subtitle}</p>}
          </div>
        ) : (
          <>
            <h1 className="text-title-large text-foreground">{title}</h1>
            {subtitle && <p className="text-caption mt-0.5">{subtitle}</p>}
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        {showCalendar && (
          <motion.button
            onClick={handleCalendarClick}
            className="btn-glass-icon"
            aria-label="Calendar"
            whileTap={{ scale: 0.9 }}
          >
            <Calendar className="h-5 w-5 text-foreground" />
          </motion.button>
        )}
        {showNotification && (
          <motion.button
            onClick={handleNotificationClick}
            className="btn-glass-icon relative"
            aria-label="Notifications"
            whileTap={{ scale: 0.9 }}
          >
            <Bell className="h-5 w-5 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </motion.button>
        )}
        {rightContent}
      </div>
    </header>
  );
}
