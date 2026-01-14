import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface HealthProfile {
  age?: number;
  heightValue?: number;
  heightUnit: 'cm' | 'in';
  bloodGroup?: string;
  conditions: string[]; // condition IDs
  conditionOtherText?: string;
  selectedBehaviors: string[]; // behavior IDs
  shareProfileInForum: boolean;
  profileCompleted: boolean;
}

interface HealthProfileContextType extends HealthProfile {
  setAge: (age: number | undefined) => void;
  setHeightValue: (value: number | undefined) => void;
  setHeightUnit: (unit: 'cm' | 'in') => void;
  setBloodGroup: (group: string | undefined) => void;
  setConditions: (conditions: string[]) => void;
  setConditionOtherText: (text: string | undefined) => void;
  setSelectedBehaviors: (behaviors: string[]) => void;
  setShareProfileInForum: (share: boolean) => void;
  setProfileCompleted: (completed: boolean) => void;
  getProfileCompletionPercentage: () => number;
  resetHealthProfile: () => void;
}

const defaultHealthProfile: HealthProfile = {
  age: undefined,
  heightValue: undefined,
  heightUnit: 'cm',
  bloodGroup: undefined,
  conditions: [],
  conditionOtherText: undefined,
  selectedBehaviors: [],
  shareProfileInForum: false,
  profileCompleted: false,
};

const HealthProfileContext = createContext<HealthProfileContextType | undefined>(undefined);

export function HealthProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<HealthProfile>(() => {
    const saved = localStorage.getItem('tarva-health-profile');
    if (saved) {
      return { ...defaultHealthProfile, ...JSON.parse(saved) };
    }
    return defaultHealthProfile;
  });

  useEffect(() => {
    localStorage.setItem('tarva-health-profile', JSON.stringify(profile));
  }, [profile]);

  const setAge = (age: number | undefined) => {
    setProfile(prev => ({ ...prev, age }));
  };

  const setHeightValue = (heightValue: number | undefined) => {
    setProfile(prev => ({ ...prev, heightValue }));
  };

  const setHeightUnit = (heightUnit: 'cm' | 'in') => {
    setProfile(prev => ({ ...prev, heightUnit }));
  };

  const setBloodGroup = (bloodGroup: string | undefined) => {
    setProfile(prev => ({ ...prev, bloodGroup }));
  };

  const setConditions = (conditions: string[]) => {
    setProfile(prev => ({ ...prev, conditions }));
  };

  const setConditionOtherText = (conditionOtherText: string | undefined) => {
    setProfile(prev => ({ ...prev, conditionOtherText }));
  };

  const setSelectedBehaviors = (selectedBehaviors: string[]) => {
    setProfile(prev => ({ ...prev, selectedBehaviors }));
  };

  const setShareProfileInForum = (shareProfileInForum: boolean) => {
    setProfile(prev => ({ ...prev, shareProfileInForum }));
  };

  const setProfileCompleted = (profileCompleted: boolean) => {
    setProfile(prev => ({ ...prev, profileCompleted }));
  };

  const getProfileCompletionPercentage = (): number => {
    let completed = 0;
    const total = 5; // age, height, bloodGroup, conditions, behaviors
    
    if (profile.age) completed++;
    if (profile.heightValue) completed++;
    if (profile.bloodGroup) completed++;
    if (profile.conditions.length > 0) completed++;
    if (profile.selectedBehaviors.length > 0) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const resetHealthProfile = () => {
    setProfile(defaultHealthProfile);
    localStorage.removeItem('tarva-health-profile');
  };

  return (
    <HealthProfileContext.Provider
      value={{
        ...profile,
        setAge,
        setHeightValue,
        setHeightUnit,
        setBloodGroup,
        setConditions,
        setConditionOtherText,
        setSelectedBehaviors,
        setShareProfileInForum,
        setProfileCompleted,
        getProfileCompletionPercentage,
        resetHealthProfile,
      }}
    >
      {children}
    </HealthProfileContext.Provider>
  );
}

export function useHealthProfile() {
  const context = useContext(HealthProfileContext);
  if (context === undefined) {
    throw new Error('useHealthProfile must be used within a HealthProfileProvider');
  }
  return context;
}
