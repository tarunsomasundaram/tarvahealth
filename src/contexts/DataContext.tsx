import React, { createContext, useContext, ReactNode } from 'react';
import { useUserProfile, UserProfile, Condition } from '@/hooks/use-user-profile';
import { useMedications, Medication, MedicationSchedule, DoseLog, ScheduledDose } from '@/hooks/use-medications';
import { useCaseInventory, Device, CaseInventoryItem, RefillLog } from '@/hooks/use-case-inventory';
import { useCaregivers, LinkedCaregiver, LinkedPatient, CaregiverPermissions } from '@/hooks/use-caregivers';
import { useNotificationsCloud, NotificationEvent, NotificationPreferences } from '@/hooks/use-notifications-cloud';
import { useBehaviors, BehaviorCategory, Behavior } from '@/hooks/use-behaviors';

interface DataContextType {
  // Profile
  profile: UserProfile | null;
  conditions: Condition[];
  userConditionIds: string[];
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  updateConditions: (conditionIds: string[]) => Promise<{ error: Error | null }>;
  getProfileCompletionPercentage: () => number;
  refreshProfile: () => Promise<void>;

  // Medications
  medications: Medication[];
  activeMedications: Medication[];
  schedules: MedicationSchedule[];
  doseLogs: DoseLog[];
  addMedication: (
    medication: Omit<Medication, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    schedule?: Omit<MedicationSchedule, 'id' | 'user_id' | 'medication_id' | 'created_at' | 'updated_at'>
  ) => Promise<{ error: Error | null; medication: Medication | null }>;
  updateMedication: (id: string, updates: Partial<Medication>) => Promise<{ error: Error | null }>;
  deleteMedication: (id: string) => Promise<{ error: Error | null }>;
  updateSchedule: (id: string, updates: Partial<MedicationSchedule>) => Promise<{ error: Error | null }>;
  logDose: (
    medicationId: string,
    scheduledDatetime: Date,
    eventType: DoseLog['event_type'],
    options?: { status?: 'on_time' | 'late'; source?: 'case' | 'manual'; notes?: string }
  ) => Promise<{ error: Error | null }>;
  getScheduledDosesForDate: (date: Date) => ScheduledDose[];
  getAdherenceRate: (startDate: Date, endDate: Date) => number;
  getOnTimeRate: (startDate: Date, endDate: Date) => number;
  getScheduleForMedication: (medicationId: string) => MedicationSchedule | undefined;
  refreshMedications: () => Promise<void>;

  // Case & Inventory
  device: Device | null;
  inventory: CaseInventoryItem[];
  refillLogs: RefillLog[];
  registerDevice: (deviceIdentifier: string, deviceName?: string) => Promise<{ error: Error | null; device: Device | null }>;
  updateDevice: (updates: Partial<Device>) => Promise<{ error: Error | null }>;
  updateInventory: (medicationId: string, dosesRemaining: number) => Promise<{ error: Error | null }>;
  logRefill: (medicationId: string, quantityAdded: number, previousQuantity: number, newQuantity: number) => Promise<{ error: Error | null }>;
  decrementDose: (medicationId: string) => Promise<{ error: Error | null }>;
  getInventoryForMedication: (medicationId: string) => CaseInventoryItem | undefined;
  getRefillLogsForMedication: (medicationId: string) => RefillLog[];
  refreshCaseData: () => Promise<void>;

  // Caregivers
  linkedCaregivers: LinkedCaregiver[];
  linkedPatients: LinkedPatient[];
  createCaregiverInvite: () => Promise<{ error: Error | null; inviteCode: string | null }>;
  acceptCaregiverInvite: (inviteCode: string) => Promise<{ error: Error | null }>;
  updateCaregiverPermissions: (
    caregiverUserId: string,
    permissions: Partial<Omit<CaregiverPermissions, 'id' | 'patient_user_id' | 'caregiver_user_id' | 'updated_at'>>
  ) => Promise<{ error: Error | null }>;
  removeCaregiver: (caregiverUserId: string) => Promise<{ error: Error | null }>;
  blockCaregiver: (caregiverUserId: string) => Promise<{ error: Error | null }>;
  refreshCaregiverData: () => Promise<void>;

  // Notifications
  notifications: NotificationEvent[];
  notificationPreferences: NotificationPreferences | null;
  unreadCount: number;
  createNotification: (type: string, options?: { medication_id?: string; scheduled_datetime?: Date; metadata?: Record<string, unknown> }) => Promise<{ error: Error | null }>;
  markAsRead: (notificationId: string) => Promise<{ error: Error | null }>;
  markAllAsRead: () => Promise<{ error: Error | null }>;
  updateNotificationPreferences: (updates: Partial<Omit<NotificationPreferences, 'user_id' | 'updated_at'>>) => Promise<{ error: Error | null }>;
  refreshNotifications: () => Promise<void>;

  // Behaviors
  behaviorCategories: BehaviorCategory[];
  behaviors: Behavior[];
  selectedBehaviorIds: string[];
  toggleBehavior: (behaviorId: string) => Promise<{ error: Error | null }>;
  setSelectedBehaviors: (behaviorIds: string[]) => Promise<{ error: Error | null }>;
  getBehaviorsByCategory: (categoryId: string) => Behavior[];
  refreshBehaviors: () => Promise<void>;

  // Loading states
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const profileHook = useUserProfile();
  const medicationsHook = useMedications();
  const caseHook = useCaseInventory();
  const caregiversHook = useCaregivers();
  const notificationsHook = useNotificationsCloud();
  const behaviorsHook = useBehaviors();

  const isLoading = 
    profileHook.loading || 
    medicationsHook.loading || 
    caseHook.loading || 
    caregiversHook.loading || 
    notificationsHook.loading ||
    behaviorsHook.loading;

  const value: DataContextType = {
    // Profile
    profile: profileHook.profile,
    conditions: profileHook.conditions,
    userConditionIds: profileHook.userConditionIds,
    updateProfile: profileHook.updateProfile,
    updateConditions: profileHook.updateConditions,
    getProfileCompletionPercentage: profileHook.getProfileCompletionPercentage,
    refreshProfile: profileHook.refreshProfile,

    // Medications
    medications: medicationsHook.medications,
    activeMedications: medicationsHook.activeMedications,
    schedules: medicationsHook.schedules,
    doseLogs: medicationsHook.doseLogs,
    addMedication: medicationsHook.addMedication,
    updateMedication: medicationsHook.updateMedication,
    deleteMedication: medicationsHook.deleteMedication,
    updateSchedule: medicationsHook.updateSchedule,
    logDose: medicationsHook.logDose,
    getScheduledDosesForDate: medicationsHook.getScheduledDosesForDate,
    getAdherenceRate: medicationsHook.getAdherenceRate,
    getOnTimeRate: medicationsHook.getOnTimeRate,
    getScheduleForMedication: medicationsHook.getScheduleForMedication,
    refreshMedications: medicationsHook.refreshMedications,

    // Case & Inventory
    device: caseHook.device,
    inventory: caseHook.inventory,
    refillLogs: caseHook.refillLogs,
    registerDevice: caseHook.registerDevice,
    updateDevice: caseHook.updateDevice,
    updateInventory: caseHook.updateInventory,
    logRefill: caseHook.logRefill,
    decrementDose: caseHook.decrementDose,
    getInventoryForMedication: caseHook.getInventoryForMedication,
    getRefillLogsForMedication: caseHook.getRefillLogsForMedication,
    refreshCaseData: caseHook.refreshCaseData,

    // Caregivers
    linkedCaregivers: caregiversHook.linkedCaregivers,
    linkedPatients: caregiversHook.linkedPatients,
    createCaregiverInvite: caregiversHook.createCaregiverInvite,
    acceptCaregiverInvite: caregiversHook.acceptCaregiverInvite,
    updateCaregiverPermissions: caregiversHook.updateCaregiverPermissions,
    removeCaregiver: caregiversHook.removeCaregiver,
    blockCaregiver: caregiversHook.blockCaregiver,
    refreshCaregiverData: caregiversHook.refreshCaregiverData,

    // Notifications
    notifications: notificationsHook.notifications,
    notificationPreferences: notificationsHook.preferences,
    unreadCount: notificationsHook.unreadCount,
    createNotification: notificationsHook.createNotification,
    markAsRead: notificationsHook.markAsRead,
    markAllAsRead: notificationsHook.markAllAsRead,
    updateNotificationPreferences: notificationsHook.updatePreferences,
    refreshNotifications: notificationsHook.refreshNotifications,

    // Behaviors
    behaviorCategories: behaviorsHook.categories,
    behaviors: behaviorsHook.behaviors,
    selectedBehaviorIds: behaviorsHook.selectedBehaviorIds,
    toggleBehavior: behaviorsHook.toggleBehavior,
    setSelectedBehaviors: behaviorsHook.setSelectedBehaviors,
    getBehaviorsByCategory: behaviorsHook.getBehaviorsByCategory,
    refreshBehaviors: behaviorsHook.refreshBehaviors,

    // Loading
    isLoading,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

// Re-export types for convenience
export type {
  UserProfile,
  Condition,
  Medication,
  MedicationSchedule,
  DoseLog,
  ScheduledDose,
  Device,
  CaseInventoryItem,
  RefillLog,
  LinkedCaregiver,
  LinkedPatient,
  CaregiverPermissions,
  NotificationEvent,
  NotificationPreferences,
  BehaviorCategory,
  Behavior,
};
