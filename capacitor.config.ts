import type { CapacitorConfig } from '@capacitor/cli';

// Store app (Michael 2026-10-19: Capacitor for both stores). The app ships its own copy of the
// built web app (dist/), so it opens offline and store review sees a real app, not a website.
const config: CapacitorConfig = {
  appId: 'com.gatewayh2.myhq', // permanent (M31)
  appName: 'MyHQ',
  webDir: 'dist',
  backgroundColor: '#020E0A',
  android: {
    backgroundColor: '#020E0A',
  },
};

export default config;
