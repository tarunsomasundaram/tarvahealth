import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/integrations/supabase/client';

export interface Device {
  id: string;
  user_id: string;
  device_name: string;
  device_identifier: string | null;
  last_seen_at: string | null;
  battery_percent: number;
  firmware_version: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseInventoryItem {
  id: string;
  user_id: string;
  medication_id: string;
  doses_remaining: number;
  last_refill_at: string | null;
  updated_at: string;
}

export interface RefillLog {
  id: string;
  user_id: string;
  medication_id: string;
  quantity_added: number;
  previous_quantity: number | null;
  new_quantity: number | null;
  refilled_at: string;
  created_at: string;
}

export function useCaseInventory() {
  const { user } = useAuth();
  const [device, setDevice] = useState<Device | null>(null);
  const [inventory, setInventory] = useState<CaseInventoryItem[]>([]);
  const [refillLogs, setRefillLogs] = useState<RefillLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCaseData = useCallback(async () => {
    if (!user) {
      setDevice(null);
      setInventory([]);
      setRefillLogs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch device
      const { data: deviceData, error: deviceError } = await supabase
        .from('devices')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (deviceError) throw deviceError;
      setDevice(deviceData as Device | null);

      // Fetch inventory
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('case_inventory')
        .select('*')
        .eq('user_id', user.id);

      if (inventoryError) throw inventoryError;
      setInventory(inventoryData as CaseInventoryItem[]);

      // Fetch refill logs
      const { data: refillData, error: refillError } = await supabase
        .from('refill_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('refilled_at', { ascending: false })
        .limit(50);

      if (refillError) throw refillError;
      setRefillLogs(refillData as RefillLog[]);

    } catch (err) {
      setError(err as Error);
      console.error('Error fetching case data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCaseData();
  }, [fetchCaseData]);

  const registerDevice = useCallback(async (deviceIdentifier: string, deviceName?: string) => {
    if (!user) return { error: new Error('Not authenticated'), device: null };

    try {
      const { data, error } = await supabase
        .from('devices')
        .upsert({
          user_id: user.id,
          device_identifier: deviceIdentifier,
          device_name: deviceName || 'TARVA Case',
          last_seen_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;

      setDevice(data as Device);
      return { error: null, device: data as Device };
    } catch (err) {
      return { error: err as Error, device: null };
    }
  }, [user]);

  const updateDevice = useCallback(async (updates: Partial<Device>) => {
    if (!user || !device) return { error: new Error('No device') };

    try {
      const { error } = await supabase
        .from('devices')
        .update(updates)
        .eq('id', device.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setDevice(prev => prev ? { ...prev, ...updates } : null);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, [user, device]);

  const updateInventory = useCallback(async (medicationId: string, dosesRemaining: number) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('case_inventory')
        .upsert({
          user_id: user.id,
          medication_id: medicationId,
          doses_remaining: dosesRemaining,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,medication_id'
        })
        .select()
        .single();

      if (error) throw error;

      setInventory(prev => {
        const existing = prev.find(i => i.medication_id === medicationId);
        if (existing) {
          return prev.map(i => i.medication_id === medicationId ? data as CaseInventoryItem : i);
        }
        return [...prev, data as CaseInventoryItem];
      });

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, [user]);

  const logRefill = useCallback(async (
    medicationId: string,
    quantityAdded: number,
    previousQuantity: number,
    newQuantity: number
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      // Log the refill
      const { data: refillData, error: refillError } = await supabase
        .from('refill_logs')
        .insert({
          user_id: user.id,
          medication_id: medicationId,
          quantity_added: quantityAdded,
          previous_quantity: previousQuantity,
          new_quantity: newQuantity,
        })
        .select()
        .single();

      if (refillError) throw refillError;

      setRefillLogs(prev => [refillData as RefillLog, ...prev]);

      // Update inventory
      const { error: inventoryError } = await supabase
        .from('case_inventory')
        .upsert({
          user_id: user.id,
          medication_id: medicationId,
          doses_remaining: newQuantity,
          last_refill_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,medication_id'
        });

      if (inventoryError) throw inventoryError;

      setInventory(prev => {
        const existing = prev.find(i => i.medication_id === medicationId);
        const updated: CaseInventoryItem = {
          id: existing?.id || '',
          user_id: user.id,
          medication_id: medicationId,
          doses_remaining: newQuantity,
          last_refill_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        if (existing) {
          return prev.map(i => i.medication_id === medicationId ? updated : i);
        }
        return [...prev, updated];
      });

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, [user]);

  const decrementDose = useCallback(async (medicationId: string) => {
    const item = inventory.find(i => i.medication_id === medicationId);
    if (!item || item.doses_remaining <= 0) return { error: new Error('No doses to decrement') };

    return updateInventory(medicationId, item.doses_remaining - 1);
  }, [inventory, updateInventory]);

  const getInventoryForMedication = useCallback((medicationId: string): CaseInventoryItem | undefined => {
    return inventory.find(i => i.medication_id === medicationId);
  }, [inventory]);

  const getRefillLogsForMedication = useCallback((medicationId: string): RefillLog[] => {
    return refillLogs.filter(r => r.medication_id === medicationId);
  }, [refillLogs]);

  return {
    device,
    inventory,
    refillLogs,
    loading,
    error,
    registerDevice,
    updateDevice,
    updateInventory,
    logRefill,
    decrementDose,
    getInventoryForMedication,
    getRefillLogsForMedication,
    refreshCaseData: fetchCaseData,
  };
}
