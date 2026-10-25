// Store app only: turns the reminder setting into scheduled local notifications.
// The plugin is passed in, so the same logic runs against a fake in tests.
import { REMINDER_IDS, planReminders, type ReminderSettings } from './reminder';

export const REMINDER_CHANNEL = 'daily-log';

export interface ReminderCopy {
  title: string;
  body: string;
  channelName: string;
}

/** The slice of @capacitor/local-notifications this file uses. */
export interface NotificationsApi {
  checkPermissions(): Promise<{ display: string }>;
  requestPermissions(): Promise<{ display: string }>;
  createChannel(c: { id: string; name: string; importance?: 1 | 2 | 3 | 4 | 5 }): Promise<void>;
  cancel(o: { notifications: { id: number }[] }): Promise<void>;
  schedule(o: { notifications: Record<string, unknown>[] }): Promise<unknown>;
}

export type SyncResult = 'off' | 'denied' | 'scheduled';

/**
 * Cancels every reminder, then schedules the next 14 if the setting is on and notifications are allowed.
 * Never asks for permission: the prompt belongs to the moment the person switches the reminder on.
 */
export async function syncReminders(
  api: NotificationsApi,
  settings: ReminderSettings,
  loggedToday: boolean,
  copy: ReminderCopy,
  now = new Date(),
): Promise<SyncResult> {
  await api.cancel({ notifications: REMINDER_IDS.map((id) => ({ id })) });
  if (!settings.on) return 'off';
  const perm = await api.checkPermissions();
  if (perm.display !== 'granted') return 'denied';
  // A notification pointing at a missing channel never shows (Android 8+). Creating it again only renames it.
  await api.createChannel({ id: REMINDER_CHANNEL, name: copy.channelName, importance: 3 });
  const plan = planReminders(now, settings.time, loggedToday);
  if (plan.length === 0) return 'scheduled';
  await api.schedule({
    notifications: plan.map((p) => ({
      id: p.id,
      title: copy.title,
      body: copy.body,
      channelId: REMINDER_CHANNEL,
      smallIcon: 'ic_stat_myhq',
      iconColor: '#00E5FF',
      autoCancel: true,
      // Inexact on purpose: no exact-alarm permission, so no Play exact-alarm declaration and no
      // trip to the phone's "Alarms & reminders" screen. Android may shift delivery by a few minutes.
      isExactNotification: false,
      schedule: { at: p.at, allowWhileIdle: true },
      extra: { open: '/log' },
    })),
  });
  return 'scheduled';
}

/** Called when the person switches the reminder on: the only place the permission prompt appears. */
export async function askPermission(api: NotificationsApi): Promise<boolean> {
  const cur = await api.checkPermissions();
  if (cur.display === 'granted') return true;
  const next = await api.requestPermissions();
  return next.display === 'granted';
}
