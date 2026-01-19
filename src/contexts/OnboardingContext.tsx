import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'patient' | 'caregiver' | null;

export interface PatientProfile {
  fullName: string;
  timezone: string;
  dateOfBirth?: string;
  allergies?: string;
  bloodType?: string;
  height?: string;
  weight?: string;
  avatarUrl?: string;
}

export interface CaregiverProfile {
  fullName: string;
  timezone: string;
  relationship?: string;
}

export interface Medication {
  id: string;
  name: string;
  strength: string;
  form: string;
  instructions?: string;
  frequency: string;
  times: string[];
  reminderWindow: string;
  storeInCase: boolean;
  compartment?: string;
  refillQuantity?: number;
  remaining?: number;
}

export interface CaregiverAccess {
  id: string;
  name: string;
  email?: string;
  relationship?: string;
  status: 'pending' | 'accepted' | 'declined';
  permissions: CaregiverPermissions;
  invitedAt: string;
}

export interface CaregiverPermissions {
  viewCalendar: boolean;
  viewAdherence: boolean;
  missedDoseAlerts: boolean;
  refillAlerts: boolean;
  lowBatteryAlerts: boolean;
}

export interface NotificationPreferences {
  doseReminders: boolean;
  lateDoseAlerts: boolean;
  refillAlerts: boolean;
  lowBatteryAlerts: boolean;
  caregiverSharingAlerts: boolean;
  // Caregiver specific
  missedDoseAlerts?: boolean;
  patientLateDoseAlerts?: boolean;
}

export interface Notification {
  id: string;
  type: 'dose_reminder' | 'dose_taken' | 'dose_late' | 'dose_missed' | 'refill' | 'low_battery' | 'caregiver_notified' | 'caregiver_request' | 'caregiver_approved' | 'caregiver_declined' | 'forum_comment' | 'forum_like';
  title: string;
  subtitle?: string;
  medicationName?: string;
  postTitle?: string;
  timestamp: string;
  status?: 'sent' | 'late' | 'viewed' | 'approved' | 'declined';
  read: boolean;
}

export interface CaseDevice {
  connected: boolean;
  batteryLevel: number;
  lastSync: string;
  deviceName: string;
}

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  userRole: UserRole;
  patientProfile: PatientProfile | null;
  caregiverProfile: CaregiverProfile | null;
  hasCasePaired: boolean;
  caseDevice: CaseDevice | null;
  hasEnabledNotifications: boolean;
  notificationPreferences: NotificationPreferences;
  pinEnabled: boolean;
  pinCode: string | null;
  faceIdEnabled: boolean;
  medications: Medication[];
  caregivers: CaregiverAccess[];
  linkedPatient: { id: string; name: string } | null;
  notifications: Notification[];
  inviteCode: string | null;
  inviteCodeExpiry: string | null;
  userEmail: string | null;
  accountCreatedAt: string | null;
}

interface OnboardingContextType extends OnboardingState {
  setHasCompletedOnboarding: (value: boolean) => void;
  setUserRole: (role: UserRole) => void;
  setPatientProfile: (profile: PatientProfile) => void;
  setCaregiverProfile: (profile: CaregiverProfile) => void;
  setHasCasePaired: (value: boolean) => void;
  setCaseDevice: (device: CaseDevice | null) => void;
  setHasEnabledNotifications: (value: boolean) => void;
  setNotificationPreferences: (prefs: Partial<NotificationPreferences>) => void;
  setPinEnabled: (value: boolean) => void;
  setPinCode: (code: string | null) => void;
  setFaceIdEnabled: (value: boolean) => void;
  addMedication: (med: Medication) => void;
  updateMedication: (id: string, med: Partial<Medication>) => void;
  removeMedication: (id: string) => void;
  addCaregiver: (caregiver: CaregiverAccess) => void;
  updateCaregiver: (id: string, updates: Partial<CaregiverAccess>) => void;
  removeCaregiver: (id: string) => void;
  setLinkedPatient: (patient: { id: string; name: string } | null) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  generateInviteCode: () => string;
  clearInviteCode: () => void;
  setUserEmail: (email: string) => void;
  resetOnboarding: () => void;
}

const defaultNotificationPreferences: NotificationPreferences = {
  doseReminders: false,
  lateDoseAlerts: false,
  refillAlerts: false,
  lowBatteryAlerts: false,
  caregiverSharingAlerts: false,
  missedDoseAlerts: false,
  patientLateDoseAlerts: false,
};

const generateMockNotifications = (): Notification[] => [
  {
    id: '1',
    type: 'dose_taken',
    title: 'Dose marked taken',
    subtitle: 'Detected from case',
    medicationName: 'Lisinopril 10mg',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'sent',
    read: true,
  },
  {
    id: '2',
    type: 'dose_reminder',
    title: 'Dose reminder sent',
    medicationName: 'Metformin 500mg',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    status: 'sent',
    read: true,
  },
  {
    id: '3',
    type: 'dose_late',
    title: 'Dose taken late',
    subtitle: '15 minutes past scheduled time',
    medicationName: 'Atorvastatin 20mg',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    status: 'late',
    read: false,
  },
  {
    id: '4',
    type: 'refill',
    title: 'Refill reminder',
    subtitle: '2 doses remaining',
    medicationName: 'Metformin 500mg',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: '5',
    type: 'low_battery',
    title: 'Low battery alert',
    subtitle: 'Case battery at 15%',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: '6',
    type: 'caregiver_approved',
    title: 'Caregiver linked',
    subtitle: 'Michael Johnson now has access',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
    read: true,
  },
];

const defaultState: OnboardingState = {
  hasCompletedOnboarding: false,
  userRole: null,
  patientProfile: null,
  caregiverProfile: null,
  hasCasePaired: false,
  caseDevice: null,
  hasEnabledNotifications: false,
  notificationPreferences: defaultNotificationPreferences,
  pinEnabled: false,
  pinCode: null,
  faceIdEnabled: false,
  medications: [],
  caregivers: [],
  linkedPatient: null,
  notifications: generateMockNotifications(),
  inviteCode: null,
  inviteCodeExpiry: null,
  userEmail: null,
  accountCreatedAt: null,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(() => {
    const saved = localStorage.getItem('tarva-onboarding');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure notifications exist with mock data if empty
      if (!parsed.notifications || parsed.notifications.length === 0) {
        parsed.notifications = generateMockNotifications();
      }
      return { ...defaultState, ...parsed };
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem('tarva-onboarding', JSON.stringify(state));
  }, [state]);

  const setHasCompletedOnboarding = (value: boolean) => {
    setState(prev => ({ ...prev, hasCompletedOnboarding: value }));
  };

  const setUserRole = (role: UserRole) => {
    setState(prev => ({ ...prev, userRole: role }));
  };

  const setPatientProfile = (profile: PatientProfile) => {
    setState(prev => ({ ...prev, patientProfile: profile }));
  };

  const setCaregiverProfile = (profile: CaregiverProfile) => {
    setState(prev => ({ ...prev, caregiverProfile: profile }));
  };

  const setHasCasePaired = (value: boolean) => {
    setState(prev => ({ ...prev, hasCasePaired: value }));
  };

  const setCaseDevice = (device: CaseDevice | null) => {
    setState(prev => ({ ...prev, caseDevice: device }));
  };

  const setHasEnabledNotifications = (value: boolean) => {
    setState(prev => ({ ...prev, hasEnabledNotifications: value }));
  };

  const setNotificationPreferences = (prefs: Partial<NotificationPreferences>) => {
    setState(prev => ({
      ...prev,
      notificationPreferences: { ...prev.notificationPreferences, ...prefs },
    }));
  };

  const setPinEnabled = (value: boolean) => {
    setState(prev => ({ ...prev, pinEnabled: value }));
  };

  const setPinCode = (code: string | null) => {
    setState(prev => ({ ...prev, pinCode: code }));
  };

  const setFaceIdEnabled = (value: boolean) => {
    setState(prev => ({ ...prev, faceIdEnabled: value }));
  };

  const addMedication = (med: Medication) => {
    setState(prev => ({ ...prev, medications: [...prev.medications, med] }));
  };

  const updateMedication = (id: string, updates: Partial<Medication>) => {
    setState(prev => ({
      ...prev,
      medications: prev.medications.map(m => m.id === id ? { ...m, ...updates } : m),
    }));
  };

  const removeMedication = (id: string) => {
    setState(prev => ({
      ...prev,
      medications: prev.medications.filter(m => m.id !== id),
    }));
  };

  const addCaregiver = (caregiver: CaregiverAccess) => {
    setState(prev => ({ ...prev, caregivers: [...prev.caregivers, caregiver] }));
  };

  const updateCaregiver = (id: string, updates: Partial<CaregiverAccess>) => {
    setState(prev => ({
      ...prev,
      caregivers: prev.caregivers.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  };

  const removeCaregiver = (id: string) => {
    setState(prev => ({
      ...prev,
      caregivers: prev.caregivers.filter(c => c.id !== id),
    }));
  };

  const setLinkedPatient = (patient: { id: string; name: string } | null) => {
    setState(prev => ({ ...prev, linkedPatient: patient }));
  };

  const addNotification = (notification: Notification) => {
    setState(prev => ({
      ...prev,
      notifications: [notification, ...prev.notifications],
    }));
  };

  const markNotificationRead = (id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  };

  const generateInviteCode = () => {
    const code = Math.random().toString().slice(2, 8);
    const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    setState(prev => ({ ...prev, inviteCode: code, inviteCodeExpiry: expiry }));
    return code;
  };

  const clearInviteCode = () => {
    setState(prev => ({ ...prev, inviteCode: null, inviteCodeExpiry: null }));
  };

  const setUserEmail = (email: string) => {
    setState(prev => ({ 
      ...prev, 
      userEmail: email,
      accountCreatedAt: prev.accountCreatedAt || new Date().toISOString()
    }));
  };

  const resetOnboarding = () => {
    setState({ ...defaultState, notifications: generateMockNotifications() });
    localStorage.removeItem('tarva-onboarding');
  };

  return (
    <OnboardingContext.Provider
      value={{
        ...state,
        setHasCompletedOnboarding,
        setUserRole,
        setPatientProfile,
        setCaregiverProfile,
        setHasCasePaired,
        setCaseDevice,
        setHasEnabledNotifications,
        setNotificationPreferences,
        setPinEnabled,
        setPinCode,
        setFaceIdEnabled,
        addMedication,
        updateMedication,
        removeMedication,
        addCaregiver,
        updateCaregiver,
        removeCaregiver,
        setLinkedPatient,
        addNotification,
        markNotificationRead,
        generateInviteCode,
        clearInviteCode,
        setUserEmail,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
