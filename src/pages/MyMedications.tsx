import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useNavigate } from "react-router-dom";
import { Plus, Pill, Clock, ChevronRight, Package } from "lucide-react";
import { cn } from "@/lib/utils";

// Default medications for display if none added
const defaultMedications = [
  { 
    id: "1", 
    name: "Lisinopril", 
    strength: "10mg", 
    form: "Tablet",
    frequency: "Daily", 
    times: ["08:00"],
    reminderWindow: "30",
    storeInCase: true,
    compartment: "1",
    refillQuantity: 30,
    remaining: 14
  },
  { 
    id: "2", 
    name: "Metformin", 
    strength: "500mg", 
    form: "Tablet",
    frequency: "Daily", 
    times: ["09:00"],
    reminderWindow: "30",
    storeInCase: true,
    compartment: "2",
    refillQuantity: 60,
    remaining: 2
  },
  { 
    id: "3", 
    name: "Atorvastatin", 
    strength: "20mg", 
    form: "Tablet",
    frequency: "Daily", 
    times: ["22:00"],
    reminderWindow: "60",
    storeInCase: true,
    compartment: "3",
    refillQuantity: 30,
    remaining: 8
  },
];

export default function MyMedications() {
  const navigate = useNavigate();
  const { medications } = useOnboarding();

  const displayMedications = medications.length > 0 ? medications : defaultMedications;

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <AnimatedPage>
      <div className="page-padding">
        <PageHeader 
          title="My Medications" 
          subtitle={`${displayMedications.length} active medication${displayMedications.length !== 1 ? 's' : ''}`}
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
            {displayMedications.map((med) => {
              const isLowStock = med.remaining !== undefined && med.remaining <= 2;
              
              return (
                <StaggerItem key={med.id}>
                  <motion.div 
                    className="card-tarva"
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
                            <h4 className="font-semibold text-foreground">{med.name}</h4>
                            <p className="text-caption">{med.strength} • {med.form}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                        </div>
                        
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="badge-time">
                            <Clock className="h-3 w-3" />
                            {med.times.map(formatTime).join(', ')}
                          </span>
                          <span className="badge-pill">
                            {med.frequency}
                          </span>
                          {med.storeInCase && med.compartment && (
                            <span className="badge-pill">
                              <Package className="h-3 w-3" />
                              Slot {med.compartment}
                            </span>
                          )}
                        </div>

                        {med.remaining !== undefined && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className={cn(
                                "font-medium",
                                isLowStock ? "text-warning" : "text-muted-foreground"
                              )}>
                                {med.remaining} doses remaining
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
                                  width: `${Math.min(100, (med.remaining / (med.refillQuantity || 30)) * 100)}%` 
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

          {displayMedications.length === 0 && (
            <FadeIn delay={0.2}>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Pill className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">No medications yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add your first medication to start tracking
                </p>
                <motion.button 
                  onClick={() => navigate("/add")} 
                  className="btn-primary mt-6"
                  whileTap={{ scale: 0.97 }}
                >
                  <Plus className="h-4 w-4" />
                  Add Medication
                </motion.button>
              </div>
            </FadeIn>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}
