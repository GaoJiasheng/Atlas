import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pub.gavin.atlas',
  appName: 'Atlas',
  webDir: 'dist',
  backgroundColor: '#e9e4d8',
  ios: {
    contentInset: 'never',
    allowsLinkPreview: false,
    backgroundColor: '#e9e4d8',
  },
};

export default config;
