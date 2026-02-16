import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { CaseStatusCard } from "@/components/case/CaseStatusCard";
import { InventoryCard } from "@/components/case/InventoryCard";
import { RefillSheet } from "@/components/case/RefillSheet";
import { Plus, Settings, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useData, Medication } from "@/contexts/DataContext";

export default function Case() {
  const navigate = useNavigate();
  const { activeMedications, getInventoryForMedication } = useData();
  const [isConnected, setIsConnected] = useState(true);
  const [batteryLevel] = useState(78);
  const [refillSheetOpen, setRefillSheetOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);

  // Get medications stored in case
  const caseMedications = activeMedications.filter((m) => !!m.stored_in_case);

  const handleSync = () => {
    console.log("Syncing...");
  };

  const handleRefillClick = (medication?: Medication) => {
    if (medication) {
      setSelectedMedication(medication);
    } else if (caseMedications.length > 0) {
      // If no specific medication, open for first low-stock one or first one
      const lowStock = caseMedications.find((m) => {
        const inv = getInventoryForMedication(m.id);
        const remaining = inv?.doses_remaining ?? 0;
        const threshold = m.refill_threshold_doses ?? 2;
        return remaining <= threshold;
      });
      setSelectedMedication(lowStock || caseMedications[0]);
    }
    setRefillSheetOpen(true);
  };

  return (
    <AnimatedPage>
      <div className="page-padding">
        <PageHeader title="Case" subtitle="Manage your smart case" />

        <div className="section-gap">
          <FadeIn delay={0.1}>
            <CaseStatusCard
              batteryLevel={batteryLevel}
              isConnected={isConnected}
              lastSync="12 min ago"
              onSync={handleSync}
            />
          </FadeIn>

          <section>
            <FadeIn delay={0.15}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-section text-foreground">Inventory</h2>
                {caseMedications.length > 0 && (
                  <motion.button 
                    className="btn-secondary text-sm"
                    onClick={() => handleRefillClick()}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="h-4 w-4" />
                    Log Refill
                  </motion.button>
                )}
              </div>
            </FadeIn>
            
            {caseMedications.length > 0 ? (
              <StaggerContainer className="space-y-3">
                {caseMedications.map((med) => (
                  <StaggerItem key={med.id}>
                    <motion.div
                      onClick={() => handleRefillClick(med)}
                      className="cursor-pointer"
                      whileTap={{ scale: 0.98 }}
                    >
                      <InventoryCard
                        medicationName={med.generic_name}
                        strength={`${med.strength_value ?? ""}${med.strength_unit ?? ""}`}
                        remaining={getInventoryForMedication(med.id)?.doses_remaining ?? 0}
                        refillThreshold={med.refill_threshold_doses ?? 2}
                        compartment={med.compartment?.toString()}
                        refillQuantity={med.refill_quantity_doses ?? undefined}
                      />
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              <FadeIn delay={0.2}>
                <div className="card-tarva flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                    <Package className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">No medications in case</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add medications and enable "Store in case" to track inventory
                  </p>
                  <motion.button 
                    onClick={() => navigate("/add")} 
                    className="btn-primary mt-4"
                    whileTap={{ scale: 0.97 }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Medication
                  </motion.button>
                </div>
              </FadeIn>
            )}
          </section>

          <section>
            <FadeIn delay={0.25}>
              <h2 className="text-section text-foreground mb-3">Case Info</h2>
            </FadeIn>
            <StaggerContainer className="space-y-3">
              <StaggerItem>
                <motion.div 
                  className="card-tarva-interactive" 
                  onClick={() => navigate("/settings")}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
                      <Settings className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Case Settings</h4>
                      <p className="text-caption">Bluetooth, notifications</p>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            </StaggerContainer>
          </section>

          <FadeIn delay={0.35}>
            <div className="card-tarva relative overflow-hidden bg-accent/50">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary rounded-t-[18px]" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Tip:</span> Dose detected when compartment opens. 
                If a dose was taken outside the case, record it on Home.
              </p>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Refill Sheet */}
      <RefillSheet
        open={refillSheetOpen}
        onOpenChange={setRefillSheetOpen}
        medication={selectedMedication}
      />
    </AnimatedPage>
  );
}
