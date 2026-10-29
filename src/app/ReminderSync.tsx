import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useApp } from './context';
import { localDateOf } from '../lib/hq';
import { readReminder } from '../lib/reminder';
import { syncReminders, type NotificationsApi, type SyncReport } from '../lib/reminderSync';

export const notifications = LocalNotifications as unknown as NotificationsApi;

/** The outcome of the latest sync, shown in Settings so a failure is never silent. */
export type ReminderStatus = { kind: 'idle' } | { kind: 'done'; report: SyncReport } | { kind: 'error'; message: string };

let status: ReminderStatus = { kind: 'idle' };
const listeners = new Set<() => void>();
function setStatus(s: ReminderStatus) {
  status = s;
  listeners.forEach((f) => f());
}

export function useReminderStatus(): ReminderStatus {
  const [, force] = useState(0);
  useEffect(() => {
    const f = () => force((n) => n + 1);
    listeners.add(f);
    return () => {
      listeners.delete(f);
    };
  }, []);
  return status;
}

function errorText(e: unknown): string {
  if (e && typeof e === 'object') {
    const o = e as { code?: unknown; message?: unknown };
    return [o.code, o.message].filter((x) => typeof x === 'string' && x).join(': ') || String(e);
  }
  return String(e);
}

/**
 * Store app only. Keeps the next 14 reminders current: on launch, on resume (which also catches a
 * time zone change), after every save or delete (the context's version bump), on a language change,
 * and when the setting changes in Settings (which bumps too). Tapping a reminder opens Log.
 */
export function ReminderSync() {
  const { store, version, t } = useApp();
  const nav = useNavigate();

  const sync = useCallback(async () => {
    try {
      const settings = readReminder();
      let loggedToday = false;
      if (settings.on) {
        const today = localDateOf(new Date()).localDate;
        loggedToday = (await store.listEntries({ fromDate: today, toDate: today, limit: 1 })).length > 0;
      }
      const report = await syncReminders(notifications, settings, loggedToday, {
        title: t('reminder.title'),
        body: t('reminder.body'),
        channelName: t('reminder.channel'),
      });
      setStatus({ kind: 'done', report });
    } catch (e) {
      // Shown in Settings; the next launch, resume or save tries again.
      setStatus({ kind: 'error', message: errorText(e) });
    }
  }, [store, t]);

  useEffect(() => {
    void sync();
  }, [sync, version]);

  useEffect(() => {
    const resume = CapApp.addListener('resume', () => void sync());
    return () => {
      void resume.then((h) => h.remove());
    };
  }, [sync]);

  useEffect(() => {
    const tap = LocalNotifications.addListener('localNotificationActionPerformed', (a) => {
      const to = (a.notification.extra as { open?: string } | undefined)?.open;
      if (to === '/log') nav('/log');
    });
    return () => {
      void tap.then((h) => h.remove());
    };
  }, [nav]);

  return null;
}
