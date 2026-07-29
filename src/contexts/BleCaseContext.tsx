import { createContext, useContext, type ReactNode } from 'react';
import { useBleCase } from '@/hooks/use-ble-case';

type BleCaseValue = ReturnType<typeof useBleCase>;

const BleCaseContext = createContext<BleCaseValue | null>(null);

/** Single app-wide BLE connection so case-open events fire on any screen. */
export function BleCaseProvider({ children }: { children: ReactNode }) {
  const value = useBleCase();
  return <BleCaseContext.Provider value={value}>{children}</BleCaseContext.Provider>;
}

export function useBleCaseContext(): BleCaseValue {
  const ctx = useContext(BleCaseContext);
  if (!ctx) throw new Error('useBleCaseContext must be used within BleCaseProvider');
  return ctx;
}
