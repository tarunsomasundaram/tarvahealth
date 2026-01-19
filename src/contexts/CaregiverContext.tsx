import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CaregiverPermissions {
  calendar: boolean;
  missedAlerts: boolean;
  refillAlerts: boolean;
  stats: boolean;
  lowBattery: boolean;
}

export interface Caregiver {
  id: string;
  name: string;
  relationship: string;
  email?: string;
  accessLevel: "full" | "limited";
  permissions: CaregiverPermissions;
  linkedAt: Date;
  lastActive?: string;
}

interface CaregiverContextType {
  caregivers: Caregiver[];
  addCaregiver: (caregiver: Omit<Caregiver, 'id' | 'linkedAt'>) => void;
  updateCaregiver: (id: string, updates: Partial<Caregiver>) => void;
  updatePermissions: (id: string, permissions: Partial<CaregiverPermissions>) => void;
  removeCaregiver: (id: string) => void;
  getCaregiverById: (id: string) => Caregiver | undefined;
}

const defaultCaregivers: Caregiver[] = [
  {
    id: "1",
    name: "Michael Johnson",
    relationship: "Spouse",
    email: "michael.j@email.com",
    accessLevel: "full",
    permissions: { 
      calendar: true, 
      missedAlerts: true, 
      refillAlerts: true,
      stats: true,
      lowBattery: true 
    },
    linkedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    lastActive: "2 min ago",
  },
  {
    id: "2",
    name: "Dr. Emily Chen",
    relationship: "Primary Care",
    email: "dr.chen@healthcare.com",
    accessLevel: "limited",
    permissions: { 
      calendar: true, 
      missedAlerts: false, 
      refillAlerts: false,
      stats: true,
      lowBattery: false 
    },
    linkedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    lastActive: "1 day ago",
  },
];

const CaregiverContext = createContext<CaregiverContextType | undefined>(undefined);

export function CaregiverProvider({ children }: { children: ReactNode }) {
  const [caregivers, setCaregivers] = useState<Caregiver[]>(defaultCaregivers);

  const addCaregiver = (caregiver: Omit<Caregiver, 'id' | 'linkedAt'>) => {
    const newCaregiver: Caregiver = {
      ...caregiver,
      id: Date.now().toString(),
      linkedAt: new Date(),
    };
    setCaregivers(prev => [...prev, newCaregiver]);
  };

  const updateCaregiver = (id: string, updates: Partial<Caregiver>) => {
    setCaregivers(prev => 
      prev.map(cg => cg.id === id ? { ...cg, ...updates } : cg)
    );
  };

  const updatePermissions = (id: string, permissions: Partial<CaregiverPermissions>) => {
    setCaregivers(prev => 
      prev.map(cg => {
        if (cg.id === id) {
          const newPermissions = { ...cg.permissions, ...permissions };
          const enabledCount = Object.values(newPermissions).filter(Boolean).length;
          const accessLevel = enabledCount === Object.keys(newPermissions).length ? "full" : "limited";
          return { ...cg, permissions: newPermissions, accessLevel };
        }
        return cg;
      })
    );
  };

  const removeCaregiver = (id: string) => {
    setCaregivers(prev => prev.filter(cg => cg.id !== id));
  };

  const getCaregiverById = (id: string) => {
    return caregivers.find(cg => cg.id === id);
  };

  return (
    <CaregiverContext.Provider value={{
      caregivers,
      addCaregiver,
      updateCaregiver,
      updatePermissions,
      removeCaregiver,
      getCaregiverById,
    }}>
      {children}
    </CaregiverContext.Provider>
  );
}

export function useCaregiver() {
  const context = useContext(CaregiverContext);
  if (!context) {
    throw new Error('useCaregiver must be used within a CaregiverProvider');
  }
  return context;
}
