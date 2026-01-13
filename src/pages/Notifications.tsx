import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { FilterChips } from "@/components/common/FilterChips";
import { useOnboarding, Notification } from "@/contexts/OnboardingContext";
import { triggerHaptic } from "@/hooks/use-haptics";
import { 
  Bell, Check, Clock, AlertTriangle, Package, 
  Battery, Users, CheckCircle2, XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday, parseISO } from "date-fns";

const filters = [
  { id: "all", label: "All" },
  { id: "doses", label: "Doses" },
  { id: "refill", label: "Refill" },
  { id: "case", label: "Case" },
  { id: "caregivers", label: "Caregivers" },
];

function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'dose_reminder':
      return <Bell className="h-5 w-5 text-primary" />;
    case 'dose_taken':
      return <Check className="h-5 w-5 text-success" />;
    case 'dose_late':
      return <Clock className="h-5 w-5 text-warning" />;
    case 'dose_missed':
      return <AlertTriangle className="h-5 w-5 text-destructive" />;
    case 'refill':
      return <Package className="h-5 w-5 text-warning" />;
    case 'low_battery':
      return <Battery className="h-5 w-5 text-warning" />;
    case 'caregiver_notified':
      return <Users className="h-5 w-5 text-primary" />;
    case 'caregiver_request':
      return <Users className="h-5 w-5 text-primary" />;
    case 'caregiver_approved':
      return <CheckCircle2 className="h-5 w-5 text-success" />;
    case 'caregiver_declined':
      return <XCircle className="h-5 w-5 text-destructive" />;
    default:
      return <Bell className="h-5 w-5 text-primary" />;
  }
}

function getStatusBadge(status?: string) {
  if (!status) return null;
  
  const styles: Record<string, string> = {
    sent: "bg-primary/10 text-primary",
    late: "bg-warning/15 text-warning",
    viewed: "bg-muted text-muted-foreground",
    approved: "bg-success/15 text-success",
    declined: "bg-destructive/15 text-destructive",
  };

  return (
    <span className={cn("badge-status text-[10px]", styles[status] || "bg-muted text-muted-foreground")}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function formatNotificationTime(timestamp: string): string {
  const date = parseISO(timestamp);
  if (isToday(date)) {
    return format(date, "h:mm a");
  }
  if (isYesterday(date)) {
    return `Yesterday, ${format(date, "h:mm a")}`;
  }
  return format(date, "MMM d, h:mm a");
}

function filterNotifications(notifications: Notification[], filter: string): Notification[] {
  if (filter === "all") return notifications;
  
  const typeMap: Record<string, Notification['type'][]> = {
    doses: ['dose_reminder', 'dose_taken', 'dose_late', 'dose_missed'],
    refill: ['refill'],
    case: ['low_battery'],
    caregivers: ['caregiver_notified', 'caregiver_request', 'caregiver_approved', 'caregiver_declined'],
  };

  return notifications.filter(n => typeMap[filter]?.includes(n.type));
}

export default function Notifications() {
  const { notifications, markNotificationRead } = useOnboarding();
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredNotifications = filterNotifications(notifications, activeFilter);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationPress = (id: string) => {
    triggerHaptic('light');
    markNotificationRead(id);
  };

  return (
    <AnimatedPage>
      <div className="page-padding">
        <PageHeader 
          title="Notifications" 
          subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
        />

        <div className="section-gap">
          <FadeIn delay={0.1}>
            <FilterChips
              filters={filters}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </FadeIn>

          {filteredNotifications.length === 0 ? (
            <FadeIn delay={0.2}>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">No notifications</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activeFilter === "all" 
                    ? "You're all caught up!"
                    : `No ${activeFilter} notifications yet`}
                </p>
              </div>
            </FadeIn>
          ) : (
            <StaggerContainer className="space-y-2">
              {filteredNotifications.map((notification) => (
                <StaggerItem key={notification.id}>
                  <motion.button
                    onClick={() => handleNotificationPress(notification.id)}
                    className={cn(
                      "card-tarva w-full text-left transition-all",
                      !notification.read && "ring-1 ring-primary/20 bg-primary/5"
                    )}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        notification.read ? "bg-muted" : "bg-accent"
                      )}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className={cn(
                              "font-medium text-foreground truncate",
                              !notification.read && "font-semibold"
                            )}>
                              {notification.title}
                            </h4>
                            {notification.medicationName && (
                              <p className="text-sm text-primary font-medium truncate">
                                {notification.medicationName}
                              </p>
                            )}
                            {notification.subtitle && (
                              <p className="text-caption truncate">{notification.subtitle}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                              {formatNotificationTime(notification.timestamp)}
                            </span>
                            {getStatusBadge(notification.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}
