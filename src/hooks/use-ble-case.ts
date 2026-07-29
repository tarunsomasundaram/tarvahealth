import { useCallback, useEffect, useRef, useState } from 'react';
import { useCaseDevice } from '@/hooks/use-case-device';
import {
  connectToCase,
  disconnectFromCase,
  forgetDevice,
  getSavedDeviceId,
  initBle,
  isNativePlatform,
  requestCaseDevice,
  type CaseBleEvent,
} from '@/lib/bleCase';

export type BleConnectionState = 'idle' | 'connecting' | 'connected' | 'error';

/**
 * Bridges native BLE case events into the existing dose auto-mark logic.
 * Safe to mount on web — it simply stays idle until a device is paired.
 */
export function useBleCase() {
  const { handleCaseOpen } = useCaseDevice();
  const [state, setState] = useState<BleConnectionState>('idle');
  const [deviceId, setDeviceId] = useState<string | null>(() => getSavedDeviceId());
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [lastEventAt, setLastEventAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const connectingRef = useRef(false);

  const onEvent = useCallback(
    (event: CaseBleEvent) => {
      setLastEventAt(event.timestamp);
      if (event.type !== 'case_open') return;
      void handleCaseOpen({
        timestamp: event.timestamp,
        compartmentOpened: event.compartment?.toString(),
        deviceId: deviceId ?? undefined,
      });
    },
    [handleCaseOpen, deviceId],
  );

  const connect = useCallback(
    async (id: string) => {
      if (connectingRef.current) return;
      connectingRef.current = true;
      setState('connecting');
      setError(null);
      try {
        await connectToCase(id, {
          onEvent,
          onStatus: (s) => setBatteryLevel(s.batteryLevel),
          onDisconnect: () => setState('idle'),
        });
        setState('connected');
      } catch (e) {
        setState('error');
        setError(e instanceof Error ? e.message : 'Failed to connect to case');
      } finally {
        connectingRef.current = false;
      }
    },
    [onEvent],
  );

  /** Opens the OS device picker, pairs, then connects. */
  const pairCase = useCallback(async () => {
    setError(null);
    try {
      const device = await requestCaseDevice();
      setDeviceId(device.deviceId);
      await connect(device.deviceId);
      return device;
    } catch (e) {
      setState('error');
      setError(e instanceof Error ? e.message : 'Pairing cancelled');
      return null;
    }
  }, [connect]);

  const disconnect = useCallback(async () => {
    if (!deviceId) return;
    try {
      await disconnectFromCase(deviceId);
    } catch {
      /* noop */
    }
    setState('idle');
  }, [deviceId]);

  const unpair = useCallback(async () => {
    await disconnect();
    forgetDevice();
    setDeviceId(null);
    setBatteryLevel(null);
  }, [disconnect]);

  // Auto-reconnect to a previously paired case on app start (native only).
  useEffect(() => {
    if (!isNativePlatform() || !deviceId) return;
    let cancelled = false;
    (async () => {
      try {
        await initBle();
        if (!cancelled) await connect(deviceId);
      } catch {
        /* BLE unavailable */
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId]);

  return {
    isNative: isNativePlatform(),
    state,
    isConnected: state === 'connected',
    deviceId,
    batteryLevel,
    lastEventAt,
    error,
    pairCase,
    connect,
    disconnect,
    unpair,
  };
}
