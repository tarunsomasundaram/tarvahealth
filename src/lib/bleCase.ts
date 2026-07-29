/**
 * Native BLE bridge for the Tarva smart case.
 *
 * Uses @capacitor-community/bluetooth-le, which maps to native CoreBluetooth (iOS)
 * and Android BluetoothGatt. On web it falls back to the Web Bluetooth API.
 *
 * GATT contract (update these UUIDs to match the case firmware):
 *   Service  0000fee0-...   Tarva case service
 *     Char   0000fee1-...   Case-open events (notify)  -> payload byte[0] = compartment index
 *     Char   0000fee2-...   Battery / status (read + notify)
 */
import { BleClient, numbersToDataView, type ScanResult } from '@capacitor-community/bluetooth-le';
import { Capacitor } from '@capacitor/core';

export const CASE_SERVICE_UUID = '0000fee0-0000-1000-8000-00805f9b34fb';
export const CASE_EVENT_CHAR_UUID = '0000fee1-0000-1000-8000-00805f9b34fb';
export const CASE_STATUS_CHAR_UUID = '0000fee2-0000-1000-8000-00805f9b34fb';

const DEVICE_ID_KEY = 'tarva.case.deviceId';

export interface CaseBleEvent {
  type: 'case_open' | 'case_close';
  compartment?: number;
  timestamp: Date;
}

export interface CaseBleStatus {
  batteryLevel: number;
  lidOpen: boolean;
}

export const isNativePlatform = () => Capacitor.isNativePlatform();

let initialized = false;

export async function initBle(): Promise<void> {
  if (initialized) return;
  await BleClient.initialize({ androidNeverForLocation: true });
  initialized = true;
}

export function getSavedDeviceId(): string | null {
  return localStorage.getItem(DEVICE_ID_KEY);
}

export function saveDeviceId(deviceId: string) {
  localStorage.setItem(DEVICE_ID_KEY, deviceId);
}

export function forgetDevice() {
  localStorage.removeItem(DEVICE_ID_KEY);
}

/** Scan and let the user pick a case (native picker on iOS/Android/web). */
export async function requestCaseDevice(): Promise<{ deviceId: string; name?: string }> {
  await initBle();
  const device = await BleClient.requestDevice({
    services: [CASE_SERVICE_UUID],
    optionalServices: [CASE_STATUS_CHAR_UUID],
  });
  saveDeviceId(device.deviceId);
  return { deviceId: device.deviceId, name: device.name };
}

/** Silent background scan — useful for auto-reconnect without UI. */
export async function scanForCases(timeoutMs = 5000): Promise<ScanResult[]> {
  await initBle();
  const results: ScanResult[] = [];
  await BleClient.requestLEScan({ services: [CASE_SERVICE_UUID] }, (r) => {
    if (!results.find((x) => x.device.deviceId === r.device.deviceId)) results.push(r);
  });
  await new Promise((r) => setTimeout(r, timeoutMs));
  await BleClient.stopLEScan();
  return results;
}

export interface ConnectOptions {
  onEvent: (event: CaseBleEvent) => void;
  onStatus?: (status: CaseBleStatus) => void;
  onDisconnect?: (deviceId: string) => void;
}

/** Connect to a case and subscribe to open/close + status notifications. */
export async function connectToCase(deviceId: string, opts: ConnectOptions): Promise<void> {
  await initBle();
  await BleClient.connect(deviceId, (id) => opts.onDisconnect?.(id));

  await BleClient.startNotifications(deviceId, CASE_SERVICE_UUID, CASE_EVENT_CHAR_UUID, (value) => {
    const code = value.byteLength > 0 ? value.getUint8(0) : 1;
    const compartment = value.byteLength > 1 ? value.getUint8(1) : undefined;
    opts.onEvent({
      type: code === 0 ? 'case_close' : 'case_open',
      compartment,
      timestamp: new Date(),
    });
  });

  if (opts.onStatus) {
    try {
      await BleClient.startNotifications(deviceId, CASE_SERVICE_UUID, CASE_STATUS_CHAR_UUID, (value) => {
        opts.onStatus?.({
          batteryLevel: value.byteLength > 0 ? value.getUint8(0) : 0,
          lidOpen: value.byteLength > 1 ? value.getUint8(1) === 1 : false,
        });
      });
      const initial = await BleClient.read(deviceId, CASE_SERVICE_UUID, CASE_STATUS_CHAR_UUID);
      opts.onStatus({
        batteryLevel: initial.byteLength > 0 ? initial.getUint8(0) : 0,
        lidOpen: initial.byteLength > 1 ? initial.getUint8(1) === 1 : false,
      });
    } catch {
      // status characteristic optional
    }
  }
}

export async function disconnectFromCase(deviceId: string): Promise<void> {
  try {
    await BleClient.stopNotifications(deviceId, CASE_SERVICE_UUID, CASE_EVENT_CHAR_UUID);
  } catch {
    /* noop */
  }
  await BleClient.disconnect(deviceId);
}

/** Optional: acknowledge an event so the case can clear its buffer. */
export async function ackCaseEvent(deviceId: string): Promise<void> {
  await BleClient.write(
    deviceId,
    CASE_SERVICE_UUID,
    CASE_EVENT_CHAR_UUID,
    numbersToDataView([0x01]),
  );
}
