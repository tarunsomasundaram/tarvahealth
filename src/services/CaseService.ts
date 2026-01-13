/**
 * CaseService - Mock TARVA case hardware integration
 * Simulates Bluetooth communication with the pill case device
 */

export interface CaseOpenEvent {
  timestamp: string;
  compartment?: string;
}

export interface CaseStatus {
  connected: boolean;
  batteryLevel: number;
  lastSync: string;
  deviceName: string;
}

type CaseEventListener = (event: CaseOpenEvent) => void;

class CaseServiceClass {
  private listeners: Set<CaseEventListener> = new Set();
  private isConnected = false;
  private mockBatteryLevel = 85;

  constructor() {
    // Simulate case status from localStorage
    const saved = localStorage.getItem('tarva-case-status');
    if (saved) {
      const status = JSON.parse(saved);
      this.isConnected = status.connected;
      this.mockBatteryLevel = status.batteryLevel;
    }
  }

  // Subscribe to case open events
  onCaseOpen(callback: CaseEventListener): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Simulate case being opened (for demo/testing)
  simulateCaseOpen(compartment?: string) {
    const event: CaseOpenEvent = {
      timestamp: new Date().toISOString(),
      compartment,
    };

    this.listeners.forEach(listener => listener(event));
    this.saveStatus();
  }

  // Connect to case (mock Bluetooth pairing)
  async connect(): Promise<boolean> {
    // Simulate Bluetooth discovery delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    this.isConnected = true;
    this.saveStatus();
    return true;
  }

  disconnect() {
    this.isConnected = false;
    this.saveStatus();
  }

  getStatus(): CaseStatus {
    return {
      connected: this.isConnected,
      batteryLevel: this.mockBatteryLevel,
      lastSync: new Date().toISOString(),
      deviceName: 'TARVA Case Pro',
    };
  }

  isDeviceConnected(): boolean {
    return this.isConnected;
  }

  private saveStatus() {
    localStorage.setItem('tarva-case-status', JSON.stringify({
      connected: this.isConnected,
      batteryLevel: this.mockBatteryLevel,
    }));
  }

  // Simulate battery drain (for demo)
  simulateBatteryDrain(level: number) {
    this.mockBatteryLevel = Math.max(0, Math.min(100, level));
    this.saveStatus();
  }
}

export const CaseService = new CaseServiceClass();
