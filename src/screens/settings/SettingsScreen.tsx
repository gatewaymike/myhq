import { useEffect, useState, type ReactNode } from 'react';
import { failKey } from '../../app/failKey';
import { HandOverNotice } from '../../app/HandOverNotice';
import { LoadNotice } from '../../app/LoadNotice';
import { useLoad } from '../../app/useLoad';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../app/context';
import { useAuth } from '../../app/auth';
import { RouteIcon } from '../../app/RouteIcon';
import { downloadFile, entriesToCSV, exportJSON } from '../../lib/export';
import { formatInput } from '../../lib/hq';
import { LocalStore, writeJSON } from '../../store/localStore';
import type { Device } from '../../store/types';
import { DeviceSheet } from '../log/DeviceSheet';
import { Legal } from '../auth/AuthScreens';
import { SHOW_INTRO_EVENT } from '../onboarding/Onboarding';
import { useInstall } from '../../lib/install';
import { IS_NATIVE } from '../../lib/platform';
import { isValidTime, readReminder, writeReminder, type ReminderSettings } from '../../lib/reminder';
import { askPermission } from '../../lib/reminderSync';
import { notifications, useReminderStatus } from '../../app/ReminderSync';

const APP_VERSION = __APP_VERSION__; // from package.json at build time (vite.config.ts)
const PREVIEW = import.meta.env.VITE_PREVIEW === '1';

function RemindersSection() {
  const { t, bump, locale } = useApp();
  const status = useReminderStatus();
  const [settings, setSettings] = useState<ReminderSettings>(() => readReminder());
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState(false);

  // Notifications switched off in the phone's settings while the reminder is on: say so.
  useEffect(() => {
    if (!IS_NATIVE || !settings.on) return;
    void notifications.checkPermissions().then((p) => setDenied(p.display !== 'granted'));
  }, [settings.on]);

  function save(next: ReminderSettings) {
    setSettings(next);
    writeReminder(next);
    bump(); // ReminderSync rebuilds the schedule
  }

  async function toggle() {
    if (busy) return;
    if (settings.on) return save({ ...settings, on: false });
    setBusy(true);
    const ok = IS_NATIVE ? await askPermission(notifications).catch(() => false) : true;
    setBusy(false);
    setDenied(!ok);
    if (ok) save({ ...settings, on: true });
  }

  return (
    <Section id="remind-h" title={t('settings.reminders')} note={<p>{t('settings.reminder.skip')}</p>}>
      <Row>
        <div className="flex items-center justify-between gap-3">
          <span id="remind-label" className="text-row text-text">{t('settings.reminder.label')}</span>
          <button
            type="button"
            role="switch"
            aria-checked={settings.on}
            aria-labelledby="remind-label"
            disabled={busy}
            onClick={() => void toggle()}
            className="flex min-h-tap min-w-tap items-center justify-center"
          >
            <span className={`relative h-7 w-12 rounded-full border transition-colors motion-reduce:transition-none ${settings.on ? 'border-action bg-action/25' : 'border-line bg-bg'}`}>
              <span
                className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full transition-[left] motion-reduce:transition-none ${settings.on ? 'left-[calc(100%-1.5rem)] bg-action' : 'left-1 bg-muted'}`}
              />
            </span>
          </button>
        </div>
      </Row>
      {settings.on && (
        <Row>
          <label className="flex items-center justify-between gap-3" htmlFor="remind-time">
            <span className="text-row text-body">{t('settings.reminder.time')}</span>
            <input
              id="remind-time"
              type="time"
              value={settings.time}
              onChange={(e) => isValidTime(e.target.value) && save({ ...settings, time: e.target.value })}
              className="tabular min-h-tap rounded-xl border border-line bg-bg px-3 font-mono text-text [color-scheme:dark] focus:border-action focus:outline-none"
            />
          </label>
        </Row>
      )}
      {settings.on && !denied && IS_NATIVE && status.kind === 'done' && status.report.next && (
        <Row>
          <p className="text-row text-body">
            {t('settings.reminder.next', {
              when: status.report.next.toLocaleString(locale, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
            })}
            <span className="ml-2 font-mono text-label text-muted">· {status.report.pending}/14</span>
          </p>
        </Row>
      )}
      {settings.on && status.kind === 'error' && (
        <Row>
          <p className="text-row text-danger" role="alert">
            {t('settings.reminder.error')}
            <span className="mt-1 block break-words font-mono text-label text-muted">{status.message}</span>
          </p>
        </Row>
      )}
      {denied && (
        <Row>
          <p className="text-row text-danger" role="alert">
            {t('settings.reminder.denied')}
          </p>
        </Row>
      )}
    </Section>
  );
}

function Section({ id, title, children, note }: { id: string; title: string; children: ReactNode; note?: ReactNode }) {
  return (
    <section className="grid grid-cols-[minmax(0,1fr)] gap-2" aria-labelledby={id}>
      <h2 id={id} className="px-1 font-mono text-label uppercase tracking-[.12em] text-muted">
        {title}
      </h2>
      <div className="grid grid-cols-[minmax(0,1fr)] divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">{children}</div>
      {note && <div className="grid gap-1 px-1 text-small text-muted">{note}</div>}
    </section>
  );
}

function Row({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`grid min-h-[52px] grid-cols-[minmax(0,1fr)] content-center gap-2 px-4 py-3 ${className}`}>{children}</div>;
}

export function SettingsScreen() {
  const { t, lang, setLang, store, version, bump, toast, locale } = useApp();
  const { available, session, signOut, deleteAccount } = useAuth();
  const nav = useNavigate();
  const install = useInstall();
  const email = session?.user.email ?? '';

  const [editing, setEditing] = useState<Device | null>(null);
  const [adding, setAdding] = useState(false);
  const [armed, setArmed] = useState<string | null>(null);
  const [busy, setBusy] = useState<'csv' | 'json' | null>(null);
  const [delOpen, setDelOpen] = useState(false);
  const [delText, setDelText] = useState('');
  const [delBusy, setDelBusy] = useState(false);
  const [delErr, setDelErr] = useState<string | null>(null);

  // A failed load never reads as "no equipment": the last loaded list stays, or a message shows.
  const { data: deviceList, status: devStatus, retry: retryDevices } = useLoad<Device[]>(store, 'settings:devices', () => store.listDevices(), [version]);
  const devices = deviceList ?? [];

  useEffect(() => {
    if (!armed) return;
    const id = window.setTimeout(() => setArmed(null), 4000);
    return () => window.clearTimeout(id);
  }, [armed]);

  async function removeDevice(d: Device) {
    try {
      await store.archiveDevice(d.id);
    } catch (err) {
      setArmed(null);
      toast(t(failKey(err)));
      return;
    }
    setArmed(null);
    bump();
    toast(t('settings.removed'));
  }

  async function download(kind: 'csv' | 'json') {
    setBusy(kind);
    try {
      const { devices: all, entries } = await store.exportAll();
      const stamp = new Date().toISOString().slice(0, 10);
      if (kind === 'csv') await downloadFile(`myhq-entries-${stamp}.csv`, entriesToCSV(entries, all), 'text/csv;charset=utf-8');
      else await downloadFile(`myhq-data-${stamp}.json`, exportJSON(entries, all, email || null), 'application/json');
    } catch {
      toast(t('auth.errorGeneric'));
    } finally {
      setBusy(null);
    }
  }

  async function confirmDelete() {
    if (delText.trim().toUpperCase() !== 'DELETE' || delBusy) return;
    setDelBusy(true);
    setDelErr(null);
    try {
      await deleteAccount();
      setDelOpen(false);
      toast(t('settings.deleted'));
      nav('/');
    } catch {
      setDelErr(t('auth.errorGeneric'));
    } finally {
      setDelBusy(false);
    }
  }

  function eraseGuest() {
    if (armed !== 'erase') return setArmed('erase');
    if (store instanceof LocalStore) store.clear();
    // Also the timer and the saved preferences, so "erase" leaves nothing of the person on this device.
    for (const k of ['myhq.timer.v1', 'myhq.prefs.v1']) {
      writeJSON(k, null);
      try {
        window.localStorage.removeItem(k);
      } catch {
        /* ignore */
      }
    }
    setArmed(null);
    bump();
    toast(t('settings.erased'));
  }

  const figure = (d: Device) =>
    d.route === 'inhalation' ? `${formatInput(d.h2FlowMlMin!, locale)} mL/min H₂` : `${formatInput(d.concentrationMgL!, locale)} mg/L`;
  const btn = 'grid min-h-tap place-content-center rounded-xl border px-4 text-row';
  const primary = `${btn} border-action bg-action font-semibold text-on-action`;
  const routeWord = (d: Device) => t(d.route === 'water' ? 'route.water' : 'route.inhalation').toLocaleLowerCase(locale);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <h1 className="pt-2 text-center text-title text-text">{t('nav.settings')}</h1>

      <HandOverNotice />

      {(install.mode === 'button' || install.mode === 'ios' || install.mode === 'samsung' || install.mode === 'menu') && (
        <Section id="install-h" title={t('install.title')}>
          <Row>
            <p className="text-row text-body">{t('install.body')}</p>
            {install.mode === 'button' && (
              <button type="button" onClick={() => void install.install()} className={`${primary} justify-self-start`}>
                {t('install.button')}
              </button>
            )}
            {install.mode === 'ios' && <p className="text-row text-text">{t('install.ios')}</p>}
            {install.mode === 'samsung' && <p className="text-row text-text">{t('install.samsung')}</p>}
            {install.mode === 'menu' && <p className="text-row text-text">{t('install.menu')}</p>}
          </Row>
        </Section>
      )}

      <Section id="acct-h" title={t('settings.account')} note={!session && !available ? <p>{t('auth.unavailable')}</p> : undefined}>
        {session ? (
          <>
            <Row>
              <p className="break-words text-row text-body">{t('settings.signedInAs', { email })}</p>
            </Row>
            <Row>
              <button type="button" onClick={signOut} className={`${btn} justify-self-start border-line text-body`}>
                {t('auth.signOut')}
              </button>
            </Row>
          </>
        ) : (
          <>
            <Row>
              <p className="text-row text-body">{t('settings.guest')}</p>
            </Row>
            {available && (
              <Row>
                <div className="flex flex-wrap gap-3">
                  <Link to="/signup" className={primary}>{t('auth.createAccount')}</Link>
                  <Link to="/signin" className={`${btn} border-line text-body`}>{t('auth.signIn')}</Link>
                </div>
              </Row>
            )}
          </>
        )}
      </Section>

      {/* My equipment: one row per device, the route in words */}
      <Section id="equip-h" title={t('settings.equipment')} note={<p>{t('settings.removeNote')}</p>}>
        {(devStatus === 'stale' || devStatus === 'failed') && (
          <Row>
            <LoadNotice status={devStatus} retry={retryDevices} />
          </Row>
        )}
        {deviceList === null ? (
          devStatus === 'failed' ? null : (
            <Row>
              <p className="text-row text-muted">{t('history.loading')}</p>
            </Row>
          )
        ) : devices.length === 0 ? (
          <Row>
            <p className="text-row text-muted">{t('settings.noEquipment')}</p>
          </Row>
        ) : (
          devices.map((d) => {
            const color = d.route === 'water' ? 'text-water' : 'text-inhalation';
            return (
              <div key={d.id} className="flex min-h-[60px] items-center gap-1 pr-2">
                <button type="button" onClick={() => setEditing(d)} className="flex min-h-[60px] min-w-0 flex-1 items-center gap-3 px-4 py-2 text-left" aria-label={`${t('history.edit')}: ${d.name}`}>
                  <RouteIcon route={d.route} className={`h-4 w-4 shrink-0 ${color}`} />
                  <span className="grid min-w-0">
                    <span className="truncate text-row text-text">
                      {d.name}
                      {d.modeLabel ? ` · ${d.modeLabel}` : ''}
                    </span>
                    <span className="tabular truncate font-mono text-arith text-muted">
                      {figure(d)} · {routeWord(d)}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => (armed === d.id ? removeDevice(d) : setArmed(d.id))}
                  className={`min-h-tap shrink-0 rounded-xl px-3 text-small ${armed === d.id ? 'bg-danger/10 text-danger' : 'text-muted hover:text-body'}`}
                >
                  {armed === d.id ? t('settings.confirmRemove') : t('settings.remove')}
                </button>
              </div>
            );
          })
        )}
        <button type="button" onClick={() => setAdding(true)} className="min-h-[52px] px-4 text-left text-row text-action">
          + {t('log.addEquipment')}
        </button>
      </Section>

      {/* Reminders (R-466): the store app only; the preview shows it for the parity gate */}
      {IS_NATIVE || PREVIEW ? (
        <RemindersSection />
      ) : (
        // Michael 2026-10-29 (answer 4b): the website says where reminders live instead of hiding them.
        <Section id="remind-h" title={t('settings.reminders')}>
          <Row>
            <p className="text-row text-body">{t('settings.reminder.appOnly')}</p>
          </Row>
        </Section>
      )}

      <Section id="lang-h" title={t('settings.language')}>
        <Row>
          <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-bg p-1" role="radiogroup" aria-label={t('settings.language')}>
            {(['en', 'zh-TW'] as const).map((l) => (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={lang === l}
                onClick={() => setLang(l)}
                className={`min-h-tap rounded-lg text-row transition-colors duration-150 motion-reduce:transition-none ${lang === l ? 'bg-surface-2 text-text' : 'text-muted'}`}
              >
                {l === 'en' ? 'English' : '中文'}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      <Section id="data-h" title={t('settings.yourData')} note={<p>{t('settings.downloadNote')}</p>}>
        <Row>
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={!!busy} onClick={() => download('csv')} className={`${btn} border-action/60 text-action disabled:opacity-50`}>
              {busy === 'csv' ? t('settings.preparing') : t('settings.downloadCSV')}
            </button>
            <button type="button" disabled={!!busy} onClick={() => download('json')} className={`${btn} border-action/60 text-action disabled:opacity-50`}>
              {busy === 'json' ? t('settings.preparing') : t('settings.downloadJSON')}
            </button>
          </div>
        </Row>
        <Row>
          {session ? (
            !delOpen ? (
              <button type="button" onClick={() => setDelOpen(true)} className={`${btn} justify-self-start border-danger/60 text-danger`}>
                {t('settings.deleteAccount')}
              </button>
            ) : (
              <form
                className="grid gap-3 rounded-xl border border-danger/50 bg-danger/5 p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  confirmDelete();
                }}
              >
                <p className="text-row leading-relaxed text-body">{t('settings.deleteExplain')}</p>
                <label className="grid gap-1.5" htmlFor="del-confirm">
                  <span className="font-mono text-label uppercase tracking-[.1em] text-muted">{t('settings.deleteTypeLabel')}</span>
                  <input
                    id="del-confirm"
                    value={delText}
                    autoComplete="off"
                    autoCapitalize="characters"
                    onChange={(e) => setDelText(e.target.value)}
                    className="min-h-tap rounded-xl border border-line bg-bg px-3 font-mono text-text focus:border-danger focus:outline-none"
                  />
                </label>
                {delErr && <p className="text-row text-danger">{delErr}</p>}
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => { setDelOpen(false); setDelText(''); }} className={`${btn} border-line text-body`}>
                    {t('device.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={delText.trim().toUpperCase() !== 'DELETE' || delBusy}
                    className={`${btn} border-danger bg-danger font-semibold text-bg disabled:opacity-40`}
                  >
                    {delBusy ? t('auth.working') : t('settings.deleteConfirm')}
                  </button>
                </div>
              </form>
            )
          ) : (
            <>
              <p className="text-small text-muted">{t('settings.eraseExplain')}</p>
              <button
                type="button"
                onClick={eraseGuest}
                className={`${btn} justify-self-start ${armed === 'erase' ? 'border-danger bg-danger/10 text-danger' : 'border-danger/60 text-danger'}`}
              >
                {armed === 'erase' ? t('settings.eraseConfirm') : t('settings.eraseDevice')}
              </button>
            </>
          )}
        </Row>
      </Section>

      <Section id="about-h" title={t('settings.about')}>
        <Row>
          <div className="grid gap-2 text-row leading-relaxed text-body">
            <p>{t('today.aboutHQ')}</p>
            <p>{t('today.aboutRef')}</p>
          </div>
        </Row>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event(SHOW_INTRO_EVENT))}
          className="min-h-[52px] px-4 text-left text-row text-action"
        >
          {t('settings.showIntro')}
        </button>
      </Section>

      <Legal />
      <p className="text-center font-mono text-label text-muted">{t('settings.version', { v: APP_VERSION })}</p>

      {(editing || adding) && (
        <DeviceSheet
          route={editing?.route ?? 'inhalation'}
          device={editing ?? undefined}
          onClose={() => {
            setEditing(null);
            setAdding(false);
          }}
          onSaved={() => {
            setEditing(null);
            setAdding(false);
          }}
        />
      )}
    </div>
  );
}
