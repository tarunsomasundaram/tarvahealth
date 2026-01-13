import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { Plus, User, Calendar, AlertTriangle, RefreshCw, Lock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Caregiver {
  id: string;
  name: string;
  relationship: string;
  accessLevel: "full" | "limited";
  permissions: {
    calendar: boolean;
    missedAlerts: boolean;
    refillAlerts: boolean;
  };
}

const mockCaregivers: Caregiver[] = [
  {
    id: "1",
    name: "Michael Johnson",
    relationship: "Spouse",
    accessLevel: "full",
    permissions: { calendar: true, missedAlerts: true, refillAlerts: true },
  },
  {
    id: "2",
    name: "Dr. Emily Chen",
    relationship: "Primary Care",
    accessLevel: "limited",
    permissions: { calendar: true, missedAlerts: false, refillAlerts: false },
  },
];

export default function Caregivers() {
  const [caregivers] = useState<Caregiver[]>(mockCaregivers);

  const handleAddCaregiver = () => {
    console.log("Add caregiver");
  };

  return (
    <AnimatedPage>
      <div className="page-padding">
        <PageHeader title="Caregivers" subtitle="Manage access to your data" />

        <div className="section-gap">
          <FadeIn delay={0.1}>
            <motion.button 
              onClick={handleAddCaregiver} 
              className="btn-primary w-full"
              whileTap={{ scale: 0.97 }}
            >
              <Plus className="h-4 w-4" />
              Add Caregiver
            </motion.button>
          </FadeIn>

          <section>
            <FadeIn delay={0.15}>
              <h2 className="text-section text-foreground mb-3">Active Caregivers</h2>
            </FadeIn>
            <StaggerContainer className="space-y-3">
              {caregivers.map((caregiver) => (
                <StaggerItem key={caregiver.id}>
                  <motion.div 
                    className="card-tarva"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-4">
                      <motion.div 
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-accent"
                        whileHover={{ scale: 1.05 }}
                      >
                        <User className="h-6 w-6 text-primary" />
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-foreground">{caregiver.name}</h4>
                            <p className="text-caption">{caregiver.relationship}</p>
                          </div>
                          <span className={cn(
                            "badge-status",
                            caregiver.accessLevel === "full" ? "bg-success/15 text-success" : "bg-accent text-accent-foreground"
                          )}>
                            {caregiver.accessLevel === "full" ? "Full Access" : "Limited"}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <motion.span 
                            className={cn(
                              "badge-pill text-xs",
                              caregiver.permissions.calendar ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                            )}
                            whileHover={{ scale: 1.05 }}
                          >
                            <Calendar className="h-3 w-3" />
                            Calendar
                          </motion.span>
                          <motion.span 
                            className={cn(
                              "badge-pill text-xs",
                              caregiver.permissions.missedAlerts ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                            )}
                            whileHover={{ scale: 1.05 }}
                          >
                            <AlertTriangle className="h-3 w-3" />
                            Missed Alerts
                          </motion.span>
                          <motion.span 
                            className={cn(
                              "badge-pill text-xs",
                              caregiver.permissions.refillAlerts ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                            )}
                            whileHover={{ scale: 1.05 }}
                          >
                            <RefreshCw className="h-3 w-3" />
                            Refill Alerts
                          </motion.span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>

          <FadeIn delay={0.3}>
            <div className="card-tarva bg-accent/50">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Upgrade for More</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Free plan allows 1 caregiver. Upgrade to share with unlimited caregivers and unlock advanced sharing options.
                  </p>
                  <motion.button 
                    className="btn-secondary mt-3"
                    whileTap={{ scale: 0.97 }}
                  >
                    View Plans
                    <ChevronRight className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </AnimatedPage>
  );
}
