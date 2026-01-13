import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CaseStatusCard } from "@/components/case/CaseStatusCard";
import { InventoryCard } from "@/components/case/InventoryCard";
import { Plus, Settings, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockInventory = [
  { id: "1", name: "Lisinopril", strength: "10mg", remaining: 14, refillThreshold: 2 },
  { id: "2", name: "Metformin", strength: "500mg", remaining: 2, refillThreshold: 2 },
  { id: "3", name: "Atorvastatin", strength: "20mg", remaining: 8, refillThreshold: 2 },
];

export default function Case() {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(true);
  const [batteryLevel] = useState(78);

  const handleSync = () => {
    console.log("Syncing...");
  };

  return (
    <div className="page-padding">
      <PageHeader title="Case" subtitle="Manage your smart case" />

      <div className="section-gap">
        <CaseStatusCard
          batteryLevel={batteryLevel}
          isConnected={isConnected}
          lastSync="12 min ago"
          onSync={handleSync}
        />

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-section text-foreground">Inventory</h2>
            <button className="btn-secondary text-sm">
              <Plus className="h-4 w-4" />
              Log Refill
            </button>
          </div>
          <div className="space-y-3">
            {mockInventory.map((item) => (
              <InventoryCard
                key={item.id}
                medicationName={item.name}
                strength={item.strength}
                remaining={item.remaining}
                refillThreshold={item.refillThreshold}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-section text-foreground mb-3">Case Info</h2>
          <div className="space-y-3">
            <div className="card-tarva-interactive" onClick={() => navigate("/stats")}>
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Battery Trends</h4>
                  <p className="text-caption">View usage patterns</p>
                </div>
              </div>
            </div>
            <div className="card-tarva-interactive" onClick={() => navigate("/settings")}>
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Case Settings</h4>
                  <p className="text-caption">Calibration, sync, notifications</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="card-tarva bg-accent/50">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Tip:</span> Dose detected when compartment opens. 
            If a dose was taken outside the case, record it on Home.
          </p>
        </div>
      </div>
    </div>
  );
}
