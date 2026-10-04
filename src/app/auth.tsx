import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { LocalStore } from '../store/localStore';
import { SupabaseStore } from '../store/supabaseStore';
import type { Store } from '../store/types';

interface AuthCtx {
  /** False when the app runs without a backend (preview build, or settings missing). */
  available: boolean;
  session: Session | null;
  /** True until the stored session (if any) has been read. */
  loading: boolean;
  /** Set when the person arrived from a password-reset email. */
  recovery: boolean;
  clearRecovery: () => void;
  store: Store;
  /** Entries moved from this device into the account at the last sign-in, for a one-time notice. */
  imported: number;
  clearImported: () => void;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function useAuth(): AuthCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth outside provider');
  return c;
}

export function AuthProvider({ guestStore, children }: { guestStore: LocalStore; children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!!supabase);
  const [recovery, setRecovery] = useState(false);
  const [imported, setImported] = useState(0);
  const importing = useRef(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id ?? null;
  const store = useMemo<Store>(() => (supabase && userId ? new SupabaseStore(supabase) : guestStore), [userId, guestStore]);

  // Guest hand-over: whatever was logged on this device before signing in moves into the account.
  useEffect(() => {
    if (!supabase || !userId || importing.current) return;
    const snap = guestStore.snapshot();
    if (snap.entries.length === 0 && snap.devices.length === 0) return;
    importing.current = true;
    new SupabaseStore(supabase)
      .importGuest(snap.devices.filter((d) => !d.archived), snap.entries)
      .then((n) => {
        guestStore.clear();
        setImported(n);
      })
      .catch(() => {
        /* keep the guest copy; the next sign-in retries, and client_request_id prevents duplicates */
      })
      .finally(() => {
        importing.current = false;
      });
  }, [userId, guestStore]);

  const value: AuthCtx = {
    available: !!supabase,
    session,
    loading,
    recovery,
    clearRecovery: () => setRecovery(false),
    store,
    imported,
    clearImported: () => setImported(0),
    signOut: async () => {
      await supabase?.auth.signOut();
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
