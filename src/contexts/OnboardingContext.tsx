import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'patient' | 'caregiver' | null;

interface PatientProfile {
  fullName: string;
  timezone: string;
  dateOfBirth?: string;
  allergies?: string;
}

interface CaregiverProfile {
  fullName: string;
  timezone: string;
  relationship?: string;
}

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  userRole: UserRole;
  patientProfile: PatientProfile | null;
  caregiverProfile: CaregiverProfile | null;
  hasCasePaired: boolean;
  hasEnabledNotifications: boolean;
  pinEnabled: boolean;
  pinCode: string | null;
  faceIdEnabled: boolean;
}

interface OnboardingContextType extends OnboardingState {
  setHasCompletedOnboarding: (value: boolean) => void;
  setUserRole: (role: UserRole) => void;
  setPatientProfile: (profile: PatientProfile) => void;
  setCaregiverProfile: (profile: CaregiverProfile) => void;
  setHasCasePaired: (value: boolean) => void;
  setHasEnabledNotifications: (value: boolean) => void;
  setPinEnabled: (value: boolean) => void;
  setPinCode: (code: string | null) => void;
  setFaceIdEnabled: (value: boolean) => void;
  resetOnboarding: () => void;
}

const defaultState: OnboardingState = {
  hasCompletedOnboarding: false,
  userRole: null,
  patientProfile: null,
  caregiverProfile: null,
  hasCasePaired: false,
  hasEnabledNotifications: false,
  pinEnabled: false,
  pinCode: null,
  faceIdEnabled: false,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(() => {
    const saved = localStorage.getItem('tarva-onboarding');
    return saved ? JSON.parse(saved) : defaultState;
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

  const setHasEnabledNotifications = (value: boolean) => {
    setState(prev => ({ ...prev, hasEnabledNotifications: value }));
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

  const resetOnboarding = () => {
    setState(defaultState);
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
        setHasEnabledNotifications,
        setPinEnabled,
        setPinCode,
        setFaceIdEnabled,
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
