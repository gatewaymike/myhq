import { useEffect, useMemo } from 'react';
import { BrowserRouter, MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './app/context';
import { AuthProvider, useAuth } from './app/auth';
import { Shell } from './app/Shell';
import { LogScreen } from './screens/log/LogScreen';
import { TodayScreen } from './screens/today/TodayScreen';
import { SettingsScreen } from './screens/settings/SettingsScreen';
import { ForgotScreen, ResetScreen, SignInScreen, SignUpScreen } from './screens/auth/AuthScreens';
import { LocalStore, writeJSON } from './store/localStore';
import { exampleSeed } from './store/exampleSeed';
import type { StringKey } from './i18n/strings';

const PREVIEW = import.meta.env.VITE_PREVIEW === '1';
const PREVIEW_KEY = 'myhq.preview.v3';

function ComingNext({ titleKey }: { titleKey: StringKey }) {
  const { t } = useApp();
  return (
    <div className="grid gap-4">
      <h1 className="font-mono text-sm uppercase tracking-[.14em] text-text">{t(titleKey)}</h1>
      <p className="rounded-card border border-dashed border-line p-6 text-center text-sm text-muted">{t('common.comingNext')}</p>
    </div>
  );
}

function PreviewBanner() {
  const { t } = useApp();
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-b border-gold/40 bg-gold/10 px-4 py-2 text-center text-xs text-gold">
      <span>{t('preview.banner')}</span>
      <button
        type="button"
        className="min-h-tap font-mono uppercase tracking-wider underline underline-offset-4"
        onClick={() => {
          const keys = [PREVIEW_KEY, 'myhq.prefs.v1', 'myhq.timer.v1'];
          keys.forEach((k) => writeJSON(k, null));
          try {
            keys.forEach((k) => window.localStorage.removeItem(k));
          } catch {
            /* ignore */
          }
          window.location.reload();
        }}
      >
        {t('preview.reset')}
      </button>
    </div>
  );
}

/** Account events that need the router or a toast. */
function AuthEffects() {
  const { t, toast, bump } = useApp();
  const { recovery, imported, clearImported } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (recovery) nav('/reset');
  }, [recovery, nav]);
  useEffect(() => {
    if (imported > 0) {
      toast(imported === 1 ? t('auth.importedOne') : t('auth.imported', { n: imported }));
      clearImported();
      bump();
    }
  }, [imported, clearImported, toast, t, bump]);
  return null;
}

function Screens() {
  return (
    <Shell banner={PREVIEW ? <PreviewBanner /> : undefined}>
      <AuthEffects />
      <Routes>
        <Route path="/" element={<TodayScreen />} />
        <Route path="/log" element={<LogScreen />} />
        <Route path="/history" element={<ComingNext titleKey="nav.history" />} />
        <Route path="/trends" element={<ComingNext titleKey="nav.trends" />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/signin" element={<SignInScreen />} />
        <Route path="/signup" element={<SignUpScreen />} />
        <Route path="/forgot" element={<ForgotScreen />} />
        <Route path="/reset" element={<ResetScreen />} />
        <Route path="*" element={<ComingNext titleKey="nav.today" />} />
      </Routes>
    </Shell>
  );
}

function WithStore() {
  const { store } = useAuth();
  return (
    <AppProvider store={store}>
      <Screens />
    </AppProvider>
  );
}

export default function App() {
  const guestStore = useMemo(() => (PREVIEW ? new LocalStore(exampleSeed(), PREVIEW_KEY) : new LocalStore()), []);
  const Router = PREVIEW ? MemoryRouter : BrowserRouter;
  return (
    <Router {...(PREVIEW ? { initialEntries: ['/'] } : {})}>
      <AuthProvider guestStore={guestStore}>
        <WithStore />
      </AuthProvider>
    </Router>
  );
}
