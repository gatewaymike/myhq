import { useMemo } from 'react';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from './app/context';
import { Shell } from './app/Shell';
import { LogScreen } from './screens/log/LogScreen';
import { LocalStore, writeJSON } from './store/localStore';
import { exampleSeed } from './store/exampleSeed';
import type { StringKey } from './i18n/strings';

const PREVIEW = import.meta.env.VITE_PREVIEW === '1';
const PREVIEW_KEY = 'myhq.preview.v2';

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
          [PREVIEW_KEY, 'myhq.prefs.v1', 'myhq.timer.v1'].forEach((k) => writeJSON(k, null));
          try {
            [PREVIEW_KEY, 'myhq.prefs.v1', 'myhq.timer.v1'].forEach((k) => window.localStorage.removeItem(k));
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

function Screens() {
  return (
    <Shell banner={PREVIEW ? <PreviewBanner /> : undefined}>
      <Routes>
        <Route path="/" element={<ComingNext titleKey="nav.today" />} />
        <Route path="/log" element={<LogScreen />} />
        <Route path="/history" element={<ComingNext titleKey="nav.history" />} />
        <Route path="/trends" element={<ComingNext titleKey="nav.trends" />} />
        <Route path="/settings" element={<ComingNext titleKey="nav.settings" />} />
        <Route path="*" element={<ComingNext titleKey="nav.today" />} />
      </Routes>
    </Shell>
  );
}

export default function App() {
  // Sign-in is wired after hosting is live; until then the app runs in guest mode (item 1).
  const store = useMemo(() => (PREVIEW ? new LocalStore(exampleSeed(), PREVIEW_KEY) : new LocalStore()), []);
  const Router = PREVIEW ? MemoryRouter : BrowserRouter;
  return (
    <Router {...(PREVIEW ? { initialEntries: ['/log'] } : {})}>
      <AppProvider store={store}>
        <Screens />
      </AppProvider>
    </Router>
  );
}
