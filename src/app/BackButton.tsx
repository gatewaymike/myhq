import { useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';

/** Store app on Android: the system back button goes back a screen, and closes the app from the first one. */
export function BackButton() {
  useEffect(() => {
    const handle = CapApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) window.history.back();
      else void CapApp.exitApp();
    });
    return () => {
      void handle.then((h) => h.remove());
    };
  }, []);
  return null;
}
