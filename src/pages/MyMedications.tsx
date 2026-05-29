import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { useNavigate } from "react-router-dom";
import { Plus, Pill, Clock, ChevronRight, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/contexts/DataContext";
import { EmptyMedicationsState } from "@/components/home/EmptyMedicationsState";

export default function MyMedications() {
  const navigate = useNavigate();
  const { activeMedications, schedules, inventory } = useData();

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getScheduleForMed = (medId: string) => {
    return schedules.find(s => s.medication_id === medId);
  };

  const getInventoryForMed = (medId: string) => {
    return inventory.find(i => i.medication_id === medId);
  };

  return (
    <AnimatedPage>
      <div className="page-padding">
        <PageHeader 
          title="My Medications" 
          subtitle={`${activeMedications.length} active medication${activeMedications.length !== 1 ? 's' : ''}`}
        />

        <div className="section-gap">
          <FadeIn delay={0.1}>
            <motion.button 
              onClick={() => navigate("/add")} 
              className="btn-primary w-full"
              whileTap={{ scale: 0.97 }}
            >
              <Plus className="h-4 w-4" />
              Add Medication
            </motion.button>
          </FadeIn>

          <StaggerContainer className="space-y-3">
            {activeMedications.map((med) => {
              const schedule = getScheduleForMed(med.id);
              const inv = getInventoryForMed(med.id);
              const remainingDoses = inv?.doses_remaining || 0;
              const isLowStock = med.stored_in_case && remainingDoses <= (med.refill_threshold_doses || 2);
              
              return (
                <StaggerItem key={med.id}>
                  <motion.div 
                    className="card-tarva cursor-pointer"
                    onClick={() => navigate(`/medications/${med.id}/edit`)}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                        isLowStock ? "bg-warning/15" : "bg-accent"
                      )}>
                        <Pill className={cn(
                          "h-6 w-6",
                          isLowStock ? "text-warning" : "text-primary"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-foreground">{med.generic_name}</h4>
                            <p className="text-caption">{med.strength_value}{med.strength_unit} • {med.form}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                        </div>
                        
                        {schedule && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="badge-time">
                              <Clock className="h-3 w-3" />
                              {schedule.times_of_day.map(formatTime).join(', ')}
                            </span>
                            <span className="badge-pill">
                              {schedule.frequency_type.charAt(0).toUpperCase() + schedule.frequency_type.slice(1)}
                            </span>
                            {med.stored_in_case && med.compartment && (
                              <span className="badge-pill">
                                <Package className="h-3 w-3" />
                                Slot {med.compartment}
                              </span>
                            )}
                          </div>
                        )}

                        {med.stored_in_case && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className={cn(
                                "font-medium",
                                isLowStock ? "text-warning" : "text-muted-foreground"
                              )}>
                                {remainingDoses} doses remaining
                              </span>
                              {isLowStock && (
                                <span className="text-warning font-medium">Refill soon</span>
                              )}
                            </div>
                            <div className="meter-bar">
                              <div 
                                className={cn(
                                  "meter-fill",
                                  isLowStock && "critical"
                                )}
                                style={{ 
                                  width: `${Math.min(100, (remainingDoses / (med.refill_quantity_doses || 30)) * 100)}%` 
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          {activeMedications.length === 0 && (
            <FadeIn delay={0.2}>
              <EmptyMedicationsState onAdd={() => navigate('/add')} />
            </FadeIn>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}
