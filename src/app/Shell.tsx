import type { ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from './auth';
import { useApp } from './context';
import type { StringKey } from '../i18n/strings';

export function Wordmark({ size = 'text-xl' }: { size?: string }) {
  return (
    <span className={`inline-flex items-baseline ${size}`} aria-label="MyHQ">
      <span className="font-display italic font-semibold text-gold">My</span>
      <span className="font-mono font-medium tracking-tighter text-mint">HQ</span>
      <span className="align-super text-[.45em] text-mint/70">™</span>
    </span>
  );
}

const Icon = {
  today: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  history: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  ),
  trends: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path d="M4 18l5-6 4 3 7-9" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </svg>
  ),
};

function LangToggle() {
  const { lang, setLang, t } = useApp();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === 'en' ? 'zh-TW' : 'en')}
      className="min-h-tap rounded-full border border-line px-3 font-mono text-xs text-muted hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-water"
      aria-label={t('header.langSwitch')}
    >
      <span className={lang === 'en' ? 'text-text' : ''}>EN</span>
      <span className="mx-1.5 opacity-50">·</span>
      <span className={lang === 'zh-TW' ? 'text-text' : ''}>中文</span>
    </button>
  );
}

function AccountLink() {
  const { t } = useApp();
  const { available, session, loading } = useAuth();
  const { pathname } = useLocation();
  if (!available || loading || session || ['/signin', '/signup', '/forgot', '/reset'].includes(pathname)) return null;
  return (
    <Link to="/signin" className="grid min-h-tap place-content-center px-2 font-mono text-xs text-water">
      {t('auth.signIn')}
    </Link>
  );
}

const DESKTOP: { to: string; key: StringKey }[] = [
  { to: '/', key: 'nav.today' },
  { to: '/log', key: 'nav.log' },
  { to: '/history', key: 'nav.history' },
  { to: '/settings', key: 'nav.settings' },
];

export function Shell({ children, banner }: { children: ReactNode; banner?: ReactNode }) {
  const { t } = useApp();
  const { pathname } = useLocation();
  const tab = (to: string, key: StringKey, icon: ReactNode) => (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex min-h-tap flex-col items-center justify-end gap-1 pb-1 text-[11px] ${isActive ? 'text-water' : 'text-muted'}`
      }
    >
      {icon}
      {t(key)}
    </NavLink>
  );

  return (
    <div className="min-h-screen">
      {banner}
      <header className="sticky z-30 border-b border-line bg-bg/95 backdrop-blur" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-2">
          <div className="flex items-center gap-3">
            <Wordmark size="text-[1.35rem]" />
            <span className="hidden font-mono text-[11px] text-mint/70 sm:inline">{t('header.descriptor')}</span>
          </div>
          <div className="flex items-center gap-2">
            <AccountLink />
            <LangToggle />
          </div>
        </div>
        <nav aria-label={t('nav.main')} className="mx-auto hidden max-w-3xl gap-1 px-2 md:flex">
          {DESKTOP.map((d) => (
            <NavLink
              key={d.to}
              to={d.to}
              end={d.to === '/'}
              className={({ isActive }) =>
                `min-h-tap border-b-2 px-4 pt-3 text-sm ${isActive || (d.to === '/history' && pathname === '/trends') ? 'border-water text-water' : 'border-transparent text-body hover:text-text'}`
              }
            >
              {t(d.key)}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-36 pt-5 md:pb-16">{children}</main>

      <nav
        aria-label={t('nav.main')}
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 items-end border-t border-line bg-surface px-1.5 pt-2 md:hidden"
        style={{ paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))' }}
      >
        {tab('/', 'nav.today', Icon.today)}
        {tab('/history', 'nav.history', Icon.history)}
        <NavLink
          to="/log"
          aria-label={t('nav.log')}
          className={({ isActive }) =>
            `-mt-7 grid h-14 w-14 place-content-center justify-self-center rounded-full bg-water text-[13px] font-bold text-bg shadow-[0_0_0_4px_rgb(var(--bg))] ${isActive ? 'ring-2 ring-water/50 ring-offset-2 ring-offset-bg' : ''}`
          }
        >
          {t('nav.addLog')}
        </NavLink>
        {tab('/trends', 'nav.trends', Icon.trends)}
        {tab('/settings', 'nav.settings', Icon.settings)}
      </nav>
    </div>
  );
}
