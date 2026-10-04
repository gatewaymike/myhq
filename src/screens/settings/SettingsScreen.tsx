import { Link } from 'react-router-dom';
import { useApp } from '../../app/context';
import { useAuth } from '../../app/auth';
import { Legal } from '../auth/AuthScreens';

// Minimal Settings for the sign-in step. Download my data, delete my account and equipment
// management arrive with the full Settings screen.
export function SettingsScreen() {
  const { t, lang, setLang } = useApp();
  const { available, session, signOut } = useAuth();
  const email = session?.user.email ?? '';

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      <h1 className="font-mono text-sm uppercase tracking-[.14em] text-text">{t('nav.settings')}</h1>

      <section className="grid gap-3 rounded-card border border-line bg-surface p-4" aria-labelledby="acct-h">
        <h2 id="acct-h" className="font-mono text-[11px] uppercase tracking-[.1em] text-muted">{t('settings.account')}</h2>
        {session ? (
          <>
            <p className="break-words text-body">{t('settings.signedInAs', { email })}</p>
            <button type="button" onClick={signOut} className="min-h-tap justify-self-start rounded-xl border border-line px-4 text-sm text-body">
              {t('auth.signOut')}
            </button>
          </>
        ) : (
          <>
            <p className="text-body">{t('settings.guest')}</p>
            {available ? (
              <div className="flex flex-wrap gap-3">
                <Link to="/signup" className="grid min-h-tap place-content-center rounded-xl bg-water px-4 text-sm font-bold text-bg">{t('auth.createAccount')}</Link>
                <Link to="/signin" className="grid min-h-tap place-content-center rounded-xl border border-line px-4 text-sm text-body">{t('auth.signIn')}</Link>
              </div>
            ) : (
              <p className="text-xs text-muted">{t('auth.unavailable')}</p>
            )}
          </>
        )}
      </section>

      <section className="grid gap-3 rounded-card border border-line bg-surface p-4" aria-labelledby="lang-h">
        <h2 id="lang-h" className="font-mono text-[11px] uppercase tracking-[.1em] text-muted">{t('settings.language')}</h2>
        <div className="grid grid-cols-2 gap-1 rounded-full border border-line bg-bg p-1" role="radiogroup" aria-label={t('settings.language')}>
          {(['en', 'zh-TW'] as const).map((l) => (
            <button key={l} type="button" role="radio" aria-checked={lang === l} onClick={() => setLang(l)}
              className={`min-h-tap rounded-full text-sm ${lang === l ? 'bg-water/15 text-water' : 'text-muted'}`}>
              {l === 'en' ? 'English' : '中文'}
            </button>
          ))}
        </div>
      </section>

      <Legal />
    </div>
  );
}
