import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4d5a98c0fa83435d95c59e75ecb16ffd',
  appName: 'tarvahealth',
  webDir: 'dist',
  server: {
    url: 'https://4d5a98c0-fa83-435d-95c5-9e75ecb16ffd.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    BluetoothLe: {
      displayStrings: {
        scanning: 'Scanning for your Tarva case…',
        cancel: 'Cancel',
        availableDevices: 'Available cases',
        noDeviceFound: 'No case found',
      },
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#22C55E',
    },
  },
};

export default config;
