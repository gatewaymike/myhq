import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { AuthError } from '@supabase/supabase-js';
import { useApp } from '../../app/context';
import { useAuth } from '../../app/auth';
import { Wordmark } from '../../app/Shell';
import { supabase } from '../../lib/supabase';
import type { StringKey } from '../../i18n/strings';

/** Set once the privacy policy page is live on gatewayh2.com (owned by the website chat). Never guessed. */
export const PRIVACY_URL: string | null = null;
export const SITE_URL = 'https://gatewayh2.com';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function errorKey(e: AuthError | Error | null): StringKey {
  const msg = (e?.message ?? '').toLowerCase();
  const code = (e as AuthError | null)?.code ?? '';
  if (code === 'invalid_credentials' || msg.includes('invalid login')) return 'auth.errorInvalid';
  if (code === 'email_not_confirmed' || msg.includes('not confirmed')) return 'auth.errorUnconfirmed';
  if (code.includes('rate_limit') || msg.includes('rate limit') || (e as AuthError | null)?.status === 429) return 'auth.errorRate';
  return 'auth.errorGeneric';
}

export function Legal({ compact = false }: { compact?: boolean }) {
  const { t } = useApp();
  return (
    <div className={`grid gap-3 text-xs leading-relaxed text-muted ${compact ? '' : 'rounded-card border border-line bg-surface p-4'}`}>
      <p>
        <span className="font-mono uppercase tracking-wider text-body">{t('settings.disclaimerTitle')} · </span>
        {t('legal.disclaimer')}
      </p>
      <p>
        <span className="font-mono uppercase tracking-wider text-body">{t('settings.disclosureTitle')} · </span>
        {t('legal.disclosure')}
      </p>
      <p className="flex flex-wrap gap-x-4 gap-y-1">
        {PRIVACY_URL && (
          <a className="text-water underline underline-offset-4" href={PRIVACY_URL} target="_blank" rel="noreferrer">
            {t('legal.privacy')}
          </a>
        )}
        <a className="text-mint underline underline-offset-4" href={SITE_URL} target="_blank" rel="noreferrer">
          {t('legal.site')}
        </a>
      </p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-md grid-cols-[minmax(0,1fr)] gap-5">
      <div className="grid justify-items-center gap-2 pt-2">
        <Wordmark size="text-[2.5rem]" />
        <h1 className="text-center text-[1.75rem] font-bold uppercase leading-tight tracking-[.12em] text-water sm:text-[2.2rem]">{title}</h1>
      </div>
      {children}
    </div>
  );
}

function Field(props: { id: string; label: string; type: string; value: string; onChange: (v: string) => void; autoComplete: string; hint?: string; error?: string | null }) {
  return (
    <label className="grid gap-1.5" htmlFor={props.id}>
      <span className="font-mono text-[11px] uppercase tracking-[.1em] text-muted">{props.label}</span>
      <input
        id={props.id}
        type={props.type}
        value={props.value}
        autoComplete={props.autoComplete}
        onChange={(e) => props.onChange(e.target.value)}
        aria-invalid={!!props.error}
        className={`min-h-tap rounded-xl border bg-bg px-3 py-2.5 text-text focus:border-water focus:outline-none ${props.error ? 'border-danger' : 'border-line'}`}
      />
      {props.error ? <span className="text-xs text-danger">{props.error}</span> : props.hint ? <span className="text-xs text-muted">{props.hint}</span> : null}
    </label>
  );
}

function Submit({ busy, label }: { busy: boolean; label: string }) {
  const { t } = useApp();
  return (
    <button type="submit" disabled={busy} className="min-h-[52px] rounded-xl bg-water text-base font-bold text-bg disabled:opacity-40">
      {busy ? t('auth.working') : label}
    </button>
  );
}

function Unavailable() {
  const { t } = useApp();
  return <p className="rounded-card border border-dashed border-line p-6 text-center text-sm text-muted">{t('auth.unavailable')}</p>;
}

/* ------------------------------------------------------------------ sign in */
export function SignInScreen() {
  const { t } = useApp();
  const { available } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!supabase || busy) return;
    if (!EMAIL_RE.test(email.trim())) return setErr(t('auth.errorEmail'));
    setBusy(true);
    setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) return setErr(t(errorKey(error)));
    nav('/log');
  }

  return (
    <Card title={t('auth.signIn')}>
      {!available ? (
        <Unavailable />
      ) : (
        <form onSubmit={submit} className="grid gap-4" noValidate>
          <Field id="si-email" label={t('auth.email')} type="email" autoComplete="email" value={email} onChange={setEmail} />
          <Field id="si-password" label={t('auth.password')} type="password" autoComplete="current-password" value={password} onChange={setPassword} />
          {err && <p className="text-sm text-danger" role="alert">{err}</p>}
          <Submit busy={busy} label={t('auth.signIn')} />
          <div className="flex flex-wrap justify-between gap-2 text-sm">
            <Link to="/forgot" className="min-h-tap py-2 text-water">{t('auth.forgot')}</Link>
            <span className="py-2 text-muted">
              {t('auth.noAccount')} <Link to="/signup" className="text-water">{t('auth.createAccount')}</Link>
            </span>
          </div>
        </form>
      )}
      <GuestNote />
      <Legal />
    </Card>
  );
}

function GuestNote() {
  const { t } = useApp();
  return (
    <div className="grid gap-2 rounded-card border border-line p-4 text-sm text-body">
      <p>{t('auth.guestNote')}</p>
      <Link to="/log" className="min-h-tap justify-self-start py-2 font-mono text-xs uppercase tracking-wider text-water">
        {t('auth.continueGuest')}
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ sign up */
export function SignUpScreen() {
  const { t, lang } = useApp();
  const { available } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!supabase || busy) return;
    if (!EMAIL_RE.test(email.trim())) return setErr(t('auth.errorEmail'));
    if (password.length < 8) return setErr(t('auth.errorPassword'));
    setBusy(true);
    setErr(null);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: `${window.location.origin}/log`, data: { language: lang } },
    });
    setBusy(false);
    if (error) return setErr(t(errorKey(error)));
    setSentTo(email.trim());
  }

  if (sentTo) {
    return (
      <Card title={t('auth.checkEmailTitle')}>
        <p className="rounded-card border border-water/40 bg-water/5 p-4 text-center text-body">{t('auth.checkEmailBody', { email: sentTo })}</p>
        <Link to="/signin" className="min-h-tap justify-self-center py-2 text-water">{t('auth.signIn')}</Link>
      </Card>
    );
  }

  return (
    <Card title={t('auth.createAccount')}>
      {!available ? (
        <Unavailable />
      ) : (
        <form onSubmit={submit} className="grid gap-4" noValidate>
          <Field id="su-email" label={t('auth.email')} type="email" autoComplete="email" value={email} onChange={setEmail} />
          <Field id="su-password" label={t('auth.password')} type="password" autoComplete="new-password" value={password} onChange={setPassword} hint={t('auth.passwordHint')} />
          {err && <p className="text-sm text-danger" role="alert">{err}</p>}
          <p className="text-xs text-muted">{t(PRIVACY_URL ? 'auth.agree' : 'auth.agreeNoPrivacy')}</p>
          <Submit busy={busy} label={t('auth.createAccount')} />
          <p className="text-sm text-muted">
            {t('auth.haveAccount')} <Link to="/signin" className="text-water">{t('auth.signIn')}</Link>
          </p>
        </form>
      )}
      <Legal />
    </Card>
  );
}

/* ----------------------------------------------------------- forgot password */
export function ForgotScreen() {
  const { t } = useApp();
  const { available } = useAuth();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!supabase || busy) return;
    if (!EMAIL_RE.test(email.trim())) return setErr(t('auth.errorEmail'));
    setBusy(true);
    setErr(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset` });
    setBusy(false);
    if (error && errorKey(error) === 'auth.errorRate') return setErr(t('auth.errorRate'));
    // Same message whether or not the address has an account.
    setSent(true);
  }

  return (
    <Card title={t('auth.resetTitle')}>
      {!available ? (
        <Unavailable />
      ) : sent ? (
        <p className="rounded-card border border-water/40 bg-water/5 p-4 text-center text-body">{t('auth.resetSent', { email: email.trim() })}</p>
      ) : (
        <form onSubmit={submit} className="grid gap-4" noValidate>
          <Field id="fp-email" label={t('auth.email')} type="email" autoComplete="email" value={email} onChange={setEmail} />
          {err && <p className="text-sm text-danger" role="alert">{err}</p>}
          <Submit busy={busy} label={t('auth.resetSend')} />
        </form>
      )}
      <Link to="/signin" className="min-h-tap justify-self-center py-2 text-water">{t('auth.signIn')}</Link>
    </Card>
  );
}

/* --------------------------------------------- set a new password (from email) */
export function ResetScreen() {
  const { t, toast } = useApp();
  const { session, clearRecovery } = useAuth();
  const nav = useNavigate();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!supabase || busy) return;
    if (password.length < 8) return setErr(t('auth.errorPassword'));
    setBusy(true);
    setErr(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setErr(t(errorKey(error)));
    clearRecovery();
    toast(t('auth.passwordSaved'));
    nav('/log');
  }

  return (
    <Card title={t('auth.resetTitle')}>
      {!session ? (
        <ForgotLinkExpired />
      ) : (
        <form onSubmit={submit} className="grid gap-4" noValidate>
          <Field id="rp-password" label={t('auth.newPassword')} type="password" autoComplete="new-password" value={password} onChange={setPassword} hint={t('auth.passwordHint')} />
          {err && <p className="text-sm text-danger" role="alert">{err}</p>}
          <Submit busy={busy} label={t('auth.setPassword')} />
        </form>
      )}
    </Card>
  );
}

function ForgotLinkExpired() {
  const { t } = useApp();
  return (
    <Link to="/forgot" className="min-h-tap justify-self-center py-2 text-water">
      {t('auth.resetSend')}
    </Link>
  );
}
