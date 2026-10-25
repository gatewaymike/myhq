import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useApp } from './context';
import { localDateOf } from '../lib/hq';
import { readReminder } from '../lib/reminder';
import { syncReminders, type NotificationsApi } from '../lib/reminderSync';

export const notifications = LocalNotifications as unknown as NotificationsApi;

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
      await syncReminders(notifications, settings, loggedToday, {
        title: t('reminder.title'),
        body: t('reminder.body'),
        channelName: t('reminder.channel'),
      });
    } catch {
      // A failed sync leaves the previous schedule in place; the next launch or save tries again.
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
