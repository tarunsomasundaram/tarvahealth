import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { Plus, User, Calendar, AlertTriangle, RefreshCw, Lock, ChevronRight, BarChart3, Battery, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCaregiver, Caregiver } from "@/contexts/CaregiverContext";
import { EditCaregiverSheet } from "@/components/caregiver/EditCaregiverSheet";
import { useHaptics } from "@/hooks/use-haptics";

export default function Caregivers() {
  const { caregivers } = useCaregiver();
  const { trigger } = useHaptics();
  const [selectedCaregiver, setSelectedCaregiver] = useState<Caregiver | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  const handleAddCaregiver = () => {
    console.log("Add caregiver");
  };

  const handleCaregiverClick = (caregiver: Caregiver) => {
    trigger('light');
    setSelectedCaregiver(caregiver);
    setEditSheetOpen(true);
  };

  const getEnabledPermissionsCount = (caregiver: Caregiver) => {
    return Object.values(caregiver.permissions).filter(Boolean).length;
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
              {caregivers.length === 0 ? (
                <FadeIn delay={0.2}>
                  <div className="card-tarva text-center py-8">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No caregivers added yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add a caregiver to share your medication data
                    </p>
                  </div>
                </FadeIn>
              ) : (
                caregivers.map((caregiver) => (
                  <StaggerItem key={caregiver.id}>
                    <motion.div 
                      className="card-tarva cursor-pointer"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCaregiverClick(caregiver)}
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
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "badge-status",
                                caregiver.accessLevel === "full" ? "bg-success/15 text-success" : "bg-accent text-accent-foreground"
                              )}>
                                {caregiver.accessLevel === "full" ? "Full Access" : "Limited"}
                              </span>
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <motion.span 
                              className={cn(
                                "badge-pill text-xs",
                                caregiver.permissions.calendar ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                              )}
                            >
                              <Calendar className="h-3 w-3" />
                              Calendar
                            </motion.span>
                            <motion.span 
                              className={cn(
                                "badge-pill text-xs",
                                caregiver.permissions.stats ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                              )}
                            >
                              <BarChart3 className="h-3 w-3" />
                              Stats
                            </motion.span>
                            <motion.span 
                              className={cn(
                                "badge-pill text-xs",
                                caregiver.permissions.missedAlerts ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                              )}
                            >
                              <AlertTriangle className="h-3 w-3" />
                              Missed
                            </motion.span>
                            <motion.span 
                              className={cn(
                                "badge-pill text-xs",
                                caregiver.permissions.refillAlerts ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                              )}
                            >
                              <RefreshCw className="h-3 w-3" />
                              Refills
                            </motion.span>
                            <motion.span 
                              className={cn(
                                "badge-pill text-xs",
                                caregiver.permissions.lowBattery ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                              )}
                            >
                              <Battery className="h-3 w-3" />
                              Battery
                            </motion.span>
                            <motion.span 
                              className={cn(
                                "badge-pill text-xs",
                                caregiver.permissions.doseTaken ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                              )}
                            >
                              <Check className="h-3 w-3" />
                              Taken
                            </motion.span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </StaggerItem>
                ))
              )}
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

      <EditCaregiverSheet
        caregiver={selectedCaregiver}
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
      />
    </AnimatedPage>
  );
}
