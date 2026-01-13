import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Patient {
  id: string;
  name: string;
  avatar?: string;
  lastActive?: string;
}

interface PatientSelectorProps {
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
}

export function PatientSelector({
  patients,
  selectedPatientId,
  onSelectPatient,
}: PatientSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  if (patients.length === 0) {
    return null;
  }

  if (patients.length === 1) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-secondary/50 rounded-2xl">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Monitoring</p>
          <p className="font-semibold text-foreground">{selectedPatient?.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full px-4 py-3 bg-secondary/50 rounded-2xl transition-colors hover:bg-secondary/70"
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-xs text-muted-foreground">Monitoring</p>
          <p className="font-semibold text-foreground">{selectedPatient?.name}</p>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute left-0 right-0 top-full mt-2 z-50 bg-card rounded-xl shadow-card-hover overflow-hidden"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {patients.map((patient) => (
              <motion.button
                key={patient.id}
                onClick={() => {
                  onSelectPatient(patient.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-3 transition-colors hover:bg-secondary/50",
                  patient.id === selectedPatientId && "bg-primary/5"
                )}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">{patient.name}</p>
                  {patient.lastActive && (
                    <p className="text-xs text-muted-foreground">
                      Last active: {patient.lastActive}
                    </p>
                  )}
                </div>
                {patient.id === selectedPatientId && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
