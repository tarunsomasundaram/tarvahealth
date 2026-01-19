import { useState } from "react";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { PatientSelector } from "@/components/caregiver/PatientSelector";
import { 
  Check, 
  Clock, 
  AlertTriangle, 
  Eye, 
  Lock, 
  Calendar, 
  BarChart3, 
  RefreshCw, 
  Battery,
  Bell,
  ChevronRight
} from "lucide-react";
import { useCaregiver, CaregiverNotification } from "@/contexts/CaregiverContext";
import { cn } from "@/lib/utils";

// Mock data for linked patients
const mockPatients = [
  { id: "1", name: "John Smith", lastActive: "5 min ago", caregiverId: "1" },
];

// Mock data for today's doses
const mockTodayDoses = [
  { id: "1", name: "Lisinopril", strength: "10mg", time: "8:00 AM", status: "taken" as const, takenTime: "8:05 AM" },
  { id: "2", name: "Metformin", strength: "500mg", time: "9:00 AM", status: "taken" as const, takenTime: "9:12 AM" },
  { id: "3", name: "Atorvastatin", strength: "20mg", time: "10:00 PM", status: "pending" as const },
  { id: "4", name: "Vitamin D3", strength: "2000 IU", time: "12:00 PM", status: "pending" as const },
];

function NotificationItem({ notification }: { notification: CaregiverNotification }) {
  const getIcon = () => {
    switch (notification.type) {
      case 'dose_taken':
        return <Check className="h-4 w-4 text-success" />;
      case 'dose_missed':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'refill_alert':
        return <RefreshCw className="h-4 w-4 text-warning" />;
      case 'low_battery':
        return <Battery className="h-4 w-4 text-warning" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'dose_taken':
        return 'bg-success/10';
      case 'dose_missed':
        return 'bg-destructive/10';
      case 'refill_alert':
      case 'low_battery':
        return 'bg-warning/10';
      default:
        return 'bg-muted';
    }
  };

  return (
    <motion.div 
      className={cn(
        "flex items-start gap-3 p-3 rounded-xl",
        notification.read ? "bg-card" : "bg-primary/5 border border-primary/10"
      )}
      whileTap={{ scale: 0.98 }}
    >
      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", getBgColor())}>
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm font-medium", !notification.read && "text-foreground")}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
        </p>
      </div>
    </motion.div>
  );
}

export default function CaregiverHome() {
  const [selectedPatientId, setSelectedPatientId] = useState(mockPatients[0]?.id || "");
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const { caregivers, caregiverNotifications, markAllNotificationsRead } = useCaregiver();

  // Get the permissions for this caregiver
  const linkedCaregiver = caregivers.find(cg => cg.id === mockPatients[0]?.caregiverId);
  const permissions = linkedCaregiver?.permissions || {
    calendar: true,
    stats: true,
    missedAlerts: true,
    refillAlerts: true,
    lowBattery: true,
    doseTaken: true,
  };

  // Filter notifications based on permissions
  const filteredNotifications = caregiverNotifications.filter(n => {
    if (n.type === 'dose_taken' && !permissions.doseTaken) return false;
    if (n.type === 'dose_missed' && !permissions.missedAlerts) return false;
    if (n.type === 'refill_alert' && !permissions.refillAlerts) return false;
    if (n.type === 'low_battery' && !permissions.lowBattery) return false;
    return true;
  });

  const unreadCount = filteredNotifications.filter(n => !n.read).length;
  const displayedNotifications = showAllNotifications 
    ? filteredNotifications 
    : filteredNotifications.slice(0, 3);

  const takenCount = mockTodayDoses.filter(d => d.status === "taken").length;
  const totalCount = mockTodayDoses.length;
  const adherenceRate = Math.round((takenCount / totalCount) * 100);

  const enabledPermissions = [
    { key: 'calendar', label: 'Calendar', icon: Calendar, enabled: permissions.calendar },
    { key: 'stats', label: 'Stats', icon: BarChart3, enabled: permissions.stats },
    { key: 'doseTaken', label: 'Dose Taken', icon: Check, enabled: permissions.doseTaken },
    { key: 'missedAlerts', label: 'Missed', icon: AlertTriangle, enabled: permissions.missedAlerts },
    { key: 'refillAlerts', label: 'Refills', icon: RefreshCw, enabled: permissions.refillAlerts },
    { key: 'lowBattery', label: 'Battery', icon: Battery, enabled: permissions.lowBattery },
  ];

  return (
    <AnimatedPage>
      <div className="page-padding">
        <PageHeader
          title="TARVA"
          subtitle="Caregiver Dashboard"
          showNotification
        />

        <div className="section-gap">
          <FadeIn delay={0.1}>
            <PatientSelector
              patients={mockPatients}
              selectedPatientId={selectedPatientId}
              onSelectPatient={setSelectedPatientId}
            />
          </FadeIn>

          {/* View-only badge with permissions summary */}
          <FadeIn delay={0.15}>
            <div className="p-3 bg-muted/50 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Your Access</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {enabledPermissions.map(({ key, label, icon: Icon, enabled }) => (
                  <span
                    key={key}
                    className={cn(
                      "badge-pill text-xs",
                      enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground line-through opacity-50"
                    )}
                  >
                    {enabled ? <Icon className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Notification History */}
          {filteredNotifications.length > 0 && (
            <section>
              <FadeIn delay={0.18}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-section text-foreground">Recent Alerts</h2>
                    {unreadCount > 0 && (
                      <span className="badge-pill bg-primary text-primary-foreground text-xs">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllNotificationsRead}
                      className="text-xs text-primary font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </FadeIn>
              <FadeIn delay={0.2}>
                <div className="space-y-2">
                  {displayedNotifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                  {filteredNotifications.length > 3 && (
                    <motion.button
                      onClick={() => setShowAllNotifications(!showAllNotifications)}
                      className="w-full flex items-center justify-center gap-1 p-2 text-sm text-primary font-medium"
                      whileTap={{ scale: 0.97 }}
                    >
                      {showAllNotifications ? 'Show less' : `View all ${filteredNotifications.length} alerts`}
                      <ChevronRight className={cn(
                        "h-4 w-4 transition-transform",
                        showAllNotifications && "rotate-90"
                      )} />
                    </motion.button>
                  )}
                </div>
              </FadeIn>
            </section>
          )}

          {/* Today's summary - only show if stats permission */}
          {permissions.stats ? (
            <FadeIn delay={0.25}>
              <div className="card-tarva bg-gradient-to-br from-primary/10 to-accent/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-caption">Today's Progress</p>
                    <p className="text-2xl font-bold text-foreground">
                      {takenCount}/{totalCount} doses
                    </p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background/80">
                    <span className="text-xl font-bold text-primary">{adherenceRate}%</span>
                  </div>
                </div>
                <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${adherenceRate}%` }}
                    transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            </FadeIn>
          ) : (
            <FadeIn delay={0.25}>
              <div className="card-tarva bg-muted/30 text-center py-6">
                <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Stats access not granted</p>
              </div>
            </FadeIn>
          )}

          {/* Today's date */}
          <FadeIn delay={0.3}>
            <p className="text-lg font-semibold text-foreground">
              {format(new Date(), "EEEE, MMMM d")}
            </p>
          </FadeIn>

          {/* Dose list - only show if calendar permission */}
          {permissions.calendar ? (
            <section>
              <FadeIn delay={0.35}>
                <h2 className="text-section text-foreground mb-3">Today's Schedule</h2>
              </FadeIn>
              <StaggerContainer className="space-y-3">
                {mockTodayDoses.map((dose) => (
                  <StaggerItem key={dose.id}>
                    <motion.div className="card-tarva" whileTap={{ scale: 0.98 }}>
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl",
                          dose.status === "taken" ? "bg-success/15" : "bg-muted"
                        )}>
                          {dose.status === "taken" ? (
                            <Check className="h-5 w-5 text-success" />
                          ) : (
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">{dose.name}</h4>
                            <span className="badge-time">{dose.time}</span>
                          </div>
                          <p className="text-caption">{dose.strength}</p>
                          {dose.status === "taken" && dose.takenTime && (
                            <p className="text-xs text-success mt-1">
                              ✓ Taken at {dose.takenTime}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </section>
          ) : (
            <FadeIn delay={0.35}>
              <div className="card-tarva bg-muted/30 text-center py-6">
                <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Calendar access not granted</p>
              </div>
            </FadeIn>
          )}

          {/* Quick stats - only show if stats permission */}
          {permissions.stats && (
            <section>
              <FadeIn delay={0.4}>
                <h2 className="text-section text-foreground mb-3">This Week</h2>
              </FadeIn>
              <StaggerContainer className="grid grid-cols-2 gap-3">
                <StaggerItem>
                  <div className="card-tarva">
                    <p className="text-caption">Adherence</p>
                    <p className="text-2xl font-bold text-foreground">89%</p>
                    <p className="text-xs text-success mt-1">↑ +5%</p>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div className="card-tarva">
                    <p className="text-caption">On-time</p>
                    <p className="text-2xl font-bold text-foreground">76%</p>
                    <p className="text-xs text-muted-foreground mt-1">→ same</p>
                  </div>
                </StaggerItem>
              </StaggerContainer>
            </section>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}
