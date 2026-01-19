import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CaregiverPermissions {
  calendar: boolean;
  missedAlerts: boolean;
  refillAlerts: boolean;
  stats: boolean;
  lowBattery: boolean;
  doseTaken: boolean;
}

export interface CaregiverNotification {
  id: string;
  type: 'dose_taken' | 'dose_missed' | 'refill_alert' | 'low_battery';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  patientName: string;
  medicationName?: string;
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
  caregiverNotifications: CaregiverNotification[];
  addCaregiver: (caregiver: Omit<Caregiver, 'id' | 'linkedAt'>) => void;
  updateCaregiver: (id: string, updates: Partial<Caregiver>) => void;
  updatePermissions: (id: string, permissions: Partial<CaregiverPermissions>) => void;
  removeCaregiver: (id: string) => void;
  getCaregiverById: (id: string) => Caregiver | undefined;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
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
      lowBattery: true,
      doseTaken: true,
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
      lowBattery: false,
      doseTaken: false,
    },
    linkedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    lastActive: "1 day ago",
  },
];

// Mock notifications for the caregiver dashboard
const defaultNotifications: CaregiverNotification[] = [
  {
    id: "1",
    type: "dose_taken",
    title: "Dose Taken",
    message: "Lisinopril 10mg was taken on time",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    patientName: "John Smith",
    medicationName: "Lisinopril",
  },
  {
    id: "2",
    type: "dose_taken",
    title: "Dose Taken",
    message: "Metformin 500mg was taken on time",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    patientName: "John Smith",
    medicationName: "Metformin",
  },
  {
    id: "3",
    type: "dose_missed",
    title: "Missed Dose Alert",
    message: "Atorvastatin 20mg was not taken at scheduled time",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: true,
    patientName: "John Smith",
    medicationName: "Atorvastatin",
  },
  {
    id: "4",
    type: "refill_alert",
    title: "Refill Reminder",
    message: "Lisinopril has only 3 doses remaining",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    read: true,
    patientName: "John Smith",
    medicationName: "Lisinopril",
  },
  {
    id: "5",
    type: "dose_taken",
    title: "Dose Taken (Late)",
    message: "Vitamin D3 2000 IU was taken 15 minutes late",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    read: true,
    patientName: "John Smith",
    medicationName: "Vitamin D3",
  },
  {
    id: "6",
    type: "low_battery",
    title: "Low Battery Alert",
    message: "TARVA case battery is at 15%",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
    patientName: "John Smith",
  },
];

const CaregiverContext = createContext<CaregiverContextType | undefined>(undefined);

export function CaregiverProvider({ children }: { children: ReactNode }) {
  const [caregivers, setCaregivers] = useState<Caregiver[]>(defaultCaregivers);
  const [caregiverNotifications, setCaregiverNotifications] = useState<CaregiverNotification[]>(defaultNotifications);

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

  const markNotificationRead = (id: string) => {
    setCaregiverNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllNotificationsRead = () => {
    setCaregiverNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  return (
    <CaregiverContext.Provider value={{
      caregivers,
      caregiverNotifications,
      addCaregiver,
      updateCaregiver,
      updatePermissions,
      removeCaregiver,
      getCaregiverById,
      markNotificationRead,
      markAllNotificationsRead,
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
