// Install help (operations handoff 3f). The browser's install event can fire before Settings is
// opened, so it is captured here at startup and held until the button asks for it.
import { useEffect, useState } from 'react';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((f) => f());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // keep the browser's own mini-bar quiet; Settings offers the button instead
    deferred = e as InstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    notify();
  });
}

export type InstallMode = 'installed' | 'button' | 'ios' | 'samsung' | 'menu' | 'none';

export function detectInstallMode(hasPrompt: boolean): InstallMode {
  if (typeof window === 'undefined') return 'none';
  const nav = window.navigator as Navigator & { standalone?: boolean };
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches || nav.standalone === true;
  if (standalone) return 'installed';
  const ua = nav.userAgent;
  // Samsung Internet's own install path triggers a Play Protect warning (2026-10-07); send people to Chrome.
  if (/SamsungBrowser/i.test(ua)) return 'samsung';
  if (hasPrompt) return 'button';
  const ios = /iPhone|iPad|iPod/.test(ua) || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1);
  if (ios) return 'ios';
  // Android without a button: Chrome stops offering once MyHQ is installed, and Brave may never offer.
  if (/Android/i.test(ua)) return 'menu';
  return 'none';
}

export function useInstall() {
  const [, force] = useState(0);
  useEffect(() => {
    const f = () => force((n) => n + 1);
    listeners.add(f);
    return () => {
      listeners.delete(f);
    };
  }, []);
  return {
    mode: detectInstallMode(deferred !== null),
    async install() {
      if (!deferred) return;
      const e = deferred;
      await e.prompt();
      await e.userChoice.catch(() => undefined);
      deferred = null;
      notify();
    },
  };
}
