import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../app/context';
import { useAuth } from '../../app/auth';
import { RouteIcon } from '../../app/RouteIcon';
import { downloadFile, entriesToCSV, exportJSON } from '../../lib/export';
import { formatInput } from '../../lib/hq';
import { LocalStore } from '../../store/localStore';
import type { Device } from '../../store/types';
import { DeviceSheet } from '../log/DeviceSheet';
import { Legal } from '../auth/AuthScreens';
import { SHOW_INTRO_EVENT } from '../onboarding/Onboarding';
import { useInstall } from '../../lib/install';

const APP_VERSION = '0.5.0';

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="grid grid-cols-[minmax(0,1fr)] gap-3 rounded-card border border-line bg-surface p-4" aria-labelledby={id}>
      <h2 id={id} className="font-mono text-[11px] uppercase tracking-[.12em] text-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function SettingsScreen() {
  const { t, lang, setLang, store, version, bump, toast, locale } = useApp();
  const { available, session, signOut, deleteAccount } = useAuth();
  const nav = useNavigate();
  const install = useInstall();
  const email = session?.user.email ?? '';

  const [devices, setDevices] = useState<Device[]>([]);
  const [editing, setEditing] = useState<Device | null>(null);
  const [adding, setAdding] = useState(false);
  const [armed, setArmed] = useState<string | null>(null);
  const [busy, setBusy] = useState<'csv' | 'json' | null>(null);
  const [delOpen, setDelOpen] = useState(false);
  const [delText, setDelText] = useState('');
  const [delBusy, setDelBusy] = useState(false);
  const [delErr, setDelErr] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    store.listDevices().then((d) => live && setDevices(d));
    return () => {
      live = false;
    };
  }, [store, version]);

  useEffect(() => {
    if (!armed) return;
    const id = window.setTimeout(() => setArmed(null), 4000);
    return () => window.clearTimeout(id);
  }, [armed]);

  async function removeDevice(d: Device) {
    await store.archiveDevice(d.id);
    setArmed(null);
    bump();
    toast(t('settings.removed'));
  }

  async function download(kind: 'csv' | 'json') {
    setBusy(kind);
    try {
      const { devices: all, entries } = await store.exportAll();
      const stamp = new Date().toISOString().slice(0, 10);
      if (kind === 'csv') downloadFile(`myhq-entries-${stamp}.csv`, entriesToCSV(entries, all), 'text/csv;charset=utf-8');
      else downloadFile(`myhq-data-${stamp}.json`, exportJSON(entries, all, email || null), 'application/json');
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
    setArmed(null);
    bump();
    toast(t('settings.erased'));
  }

  const figure = (d: Device) =>
    d.route === 'inhalation' ? `${formatInput(d.h2FlowMlMin!, locale)} mL/min H₂` : `${formatInput(d.concentrationMgL!, locale)} mg/L`;
  const btn = 'grid min-h-tap place-content-center rounded-xl border px-4 text-sm';

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      <h1 className="pt-2 text-center text-[2rem] font-bold uppercase leading-none tracking-[.12em] text-water sm:text-[2.6rem]">{t('nav.settings')}</h1>

      {/* Account */}
      {(install.mode === 'button' || install.mode === 'ios' || install.mode === 'samsung' || install.mode === 'menu') && (
        <Section id="install-h" title={t('install.title')}>
          <p className="text-sm text-body">{t('install.body')}</p>
          {install.mode === 'button' && (
            <button type="button" onClick={() => void install.install()} className={`${btn} justify-self-start border-water bg-water font-bold text-bg`}>
              {t('install.button')}
            </button>
          )}
          {install.mode === 'ios' && <p className="text-sm text-text">{t('install.ios')}</p>}
          {install.mode === 'samsung' && <p className="text-sm text-text">{t('install.samsung')}</p>}
          {install.mode === 'menu' && <p className="text-sm text-text">{t('install.menu')}</p>}
        </Section>
      )}

      <Section id="acct-h" title={t('settings.account')}>
        {session ? (
          <>
            <p className="break-words text-body">{t('settings.signedInAs', { email })}</p>
            <button type="button" onClick={signOut} className={`${btn} justify-self-start border-line text-body`}>
              {t('auth.signOut')}
            </button>
          </>
        ) : (
          <>
            <p className="text-body">{t('settings.guest')}</p>
            {available ? (
              <div className="flex flex-wrap gap-3">
                <Link to="/signup" className={`${btn} border-water bg-water font-bold text-bg`}>{t('auth.createAccount')}</Link>
                <Link to="/signin" className={`${btn} border-line text-body`}>{t('auth.signIn')}</Link>
              </div>
            ) : (
              <p className="text-xs text-muted">{t('auth.unavailable')}</p>
            )}
          </>
        )}
      </Section>

      {/* My equipment */}
      <Section id="equip-h" title={t('settings.equipment')}>
        {devices.length === 0 ? (
          <p className="text-sm text-muted">{t('settings.noEquipment')}</p>
        ) : (
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-2">
            {devices.map((d) => {
              const color = d.route === 'water' ? 'text-water' : 'text-inhalation';
              return (
                <li key={d.id} className="grid grid-cols-[minmax(0,1fr)] gap-2 rounded-xl border border-line bg-bg px-3 py-3">
                  <span className="flex min-w-0 items-center gap-3">
                    <RouteIcon route={d.route} className={`h-4 w-4 shrink-0 ${color}`} />
                    <span className="grid min-w-0">
                      <span className="truncate text-sm text-text">
                        {d.name}
                        {d.modeLabel ? ` · ${d.modeLabel}` : ''}
                      </span>
                      <span className="tabular font-mono text-[11px] text-muted">{figure(d)}</span>
                    </span>
                  </span>
                  <span className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => (armed === d.id ? removeDevice(d) : setArmed(d.id))}
                      className={`${btn} ${armed === d.id ? 'border-danger bg-danger/10 text-danger' : 'border-line text-muted'}`}
                    >
                      {armed === d.id ? t('settings.confirmRemove') : t('settings.remove')}
                    </button>
                    <button type="button" onClick={() => setEditing(d)} className={`${btn} border-water/60 text-water`}>
                      {t('history.edit')}
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        <p className="text-xs text-muted">{t('settings.removeNote')}</p>
        <button type="button" onClick={() => setAdding(true)} className="min-h-tap justify-self-start rounded-xl border border-dashed border-line px-4 text-sm text-muted hover:text-body">
          + {t('log.addEquipment')}
        </button>
      </Section>

      {/* Language */}
      <Section id="lang-h" title={t('settings.language')}>
        <div className="grid grid-cols-2 gap-1 rounded-full border border-line bg-bg p-1" role="radiogroup" aria-label={t('settings.language')}>
          {(['en', 'zh-TW'] as const).map((l) => (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={lang === l}
              onClick={() => setLang(l)}
              className={`min-h-tap rounded-full text-sm ${lang === l ? 'bg-water/15 text-water' : 'text-muted'}`}
            >
              {l === 'en' ? 'English' : '中文'}
            </button>
          ))}
        </div>
      </Section>

      {/* Your data */}
      <Section id="data-h" title={t('settings.yourData')}>
        <p className="text-xs text-muted">{t('settings.downloadNote')}</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" disabled={!!busy} onClick={() => download('csv')} className={`${btn} border-water/60 text-water disabled:opacity-50`}>
            {busy === 'csv' ? t('settings.preparing') : t('settings.downloadCSV')}
          </button>
          <button type="button" disabled={!!busy} onClick={() => download('json')} className={`${btn} border-water/60 text-water disabled:opacity-50`}>
            {busy === 'json' ? t('settings.preparing') : t('settings.downloadJSON')}
          </button>
        </div>

        <div className="mt-2 grid gap-3 border-t border-line pt-4">
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
                <p className="text-sm leading-relaxed text-body">{t('settings.deleteExplain')}</p>
                <label className="grid gap-1.5" htmlFor="del-confirm">
                  <span className="font-mono text-[11px] uppercase tracking-[.1em] text-muted">{t('settings.deleteTypeLabel')}</span>
                  <input
                    id="del-confirm"
                    value={delText}
                    autoComplete="off"
                    autoCapitalize="characters"
                    onChange={(e) => setDelText(e.target.value)}
                    className="min-h-tap rounded-xl border border-line bg-bg px-3 font-mono text-text focus:border-danger focus:outline-none"
                  />
                </label>
                {delErr && <p className="text-sm text-danger">{delErr}</p>}
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => { setDelOpen(false); setDelText(''); }} className={`${btn} border-line text-body`}>
                    {t('device.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={delText.trim().toUpperCase() !== 'DELETE' || delBusy}
                    className={`${btn} border-danger bg-danger font-bold text-bg disabled:opacity-40`}
                  >
                    {delBusy ? t('auth.working') : t('settings.deleteConfirm')}
                  </button>
                </div>
              </form>
            )
          ) : (
            <>
              <p className="text-xs text-muted">{t('settings.eraseExplain')}</p>
              <button
                type="button"
                onClick={eraseGuest}
                className={`${btn} justify-self-start ${armed === 'erase' ? 'border-danger bg-danger/10 text-danger' : 'border-danger/60 text-danger'}`}
              >
                {armed === 'erase' ? t('settings.eraseConfirm') : t('settings.eraseDevice')}
              </button>
            </>
          )}
        </div>
      </Section>

      {/* About HQ */}
      <Section id="about-h" title={t('settings.about')}>
        <div className="grid gap-2 text-sm leading-relaxed text-body">
          <p>{t('today.aboutHQ')}</p>
          <p>{t('today.aboutRef')}</p>
        </div>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event(SHOW_INTRO_EVENT))}
          className="min-h-tap justify-self-start px-1 font-mono text-xs uppercase tracking-wider text-water"
        >
          {t('settings.showIntro')}
        </button>
      </Section>

      <Legal />
      <p className="text-center font-mono text-[11px] text-muted">{t('settings.version', { v: APP_VERSION })}</p>

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
