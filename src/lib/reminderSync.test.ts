import { describe, expect, it } from 'vitest';
import { REMINDER_IDS } from './reminder';
import { askPermission, syncReminders, type NotificationsApi } from './reminderSync';

function fake(display: string, afterRequest = display) {
  const calls: { cancelled: number[]; scheduled: Record<string, unknown>[]; channels: string[]; requests: number } = {
    cancelled: [],
    scheduled: [],
    channels: [],
    requests: 0,
  };
  let state = display;
  const api: NotificationsApi = {
    checkPermissions: async () => ({ display: state }),
    requestPermissions: async () => {
      calls.requests++;
      state = afterRequest;
      return { display: state };
    },
    createChannel: async (c) => void calls.channels.push(c.id),
    cancel: async (o) => void calls.cancelled.push(...o.notifications.map((n) => n.id)),
    schedule: async (o) => void calls.scheduled.push(...o.notifications),
  };
  return { api, calls };
}

const copy = { title: 'MyHQ', body: "Time to log today's hydrogen intake.", channelName: 'Daily log reminder' };
const morning = new Date(2026, 9, 25, 9, 0);

describe('reminder sync', () => {
  it('cancels all 14 and schedules nothing when switched off', async () => {
    const { api, calls } = fake('granted');
    expect(await syncReminders(api, { on: false, time: '20:00' }, false, copy, morning)).toBe('off');
    expect(calls.cancelled).toEqual(REMINDER_IDS);
    expect(calls.scheduled).toHaveLength(0);
  });

  it('schedules 14 inexact reminders on the channel when on and allowed', async () => {
    const { api, calls } = fake('granted');
    expect(await syncReminders(api, { on: true, time: '20:00' }, false, copy, morning)).toBe('scheduled');
    expect(calls.channels).toEqual(['daily-log']);
    expect(calls.scheduled).toHaveLength(14);
    expect(calls.scheduled.every((n) => n.isExactNotification === false && n.channelId === 'daily-log')).toBe(true);
    expect(calls.scheduled[0].body).toBe("Time to log today's hydrogen intake.");
  });

  it('leaves today out once today has an entry', async () => {
    const { api, calls } = fake('granted');
    await syncReminders(api, { on: true, time: '20:00' }, true, copy, morning);
    const first = (calls.scheduled[0].schedule as { at: Date }).at;
    expect(first.getDate()).toBe(26);
  });

  it('never prompts during a sync, and schedules nothing without permission', async () => {
    const { api, calls } = fake('prompt');
    expect(await syncReminders(api, { on: true, time: '20:00' }, false, copy, morning)).toBe('denied');
    expect(calls.requests).toBe(0);
    expect(calls.scheduled).toHaveLength(0);
    expect(calls.cancelled).toEqual(REMINDER_IDS);
  });

  it('asks once when switching on, and reports a refusal', async () => {
    const yes = fake('prompt', 'granted');
    expect(await askPermission(yes.api)).toBe(true);
    expect(yes.calls.requests).toBe(1);
    const no = fake('prompt', 'denied');
    expect(await askPermission(no.api)).toBe(false);
    const already = fake('granted');
    expect(await askPermission(already.api)).toBe(true);
    expect(already.calls.requests).toBe(0);
  });
});
