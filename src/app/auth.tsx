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
  /** Entries still on this device because the last hand-over failed (0 when nothing is waiting). */
  stuck: number;
  /** Try the hand-over again now. */
  retryHandOver: () => void;
  signOut: () => Promise<void>;
  /** Server-side deletion of the signed-in account and everything in it (delete_my_account). */
  deleteAccount: () => Promise<void>;
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
  const [stuck, setStuck] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const importing = useRef(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .catch(() => {
        /* no stored session could be read: carry on as a guest */
      })
      .finally(() => setLoading(false));
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id ?? null;
  const store = useMemo<Store>(() => (supabase && userId ? new SupabaseStore(supabase) : guestStore), [userId, guestStore]);

  // Guest hand-over: whatever was logged on this device before signing in moves into the account.
  // If the server refuses it, the entries stay on the device and the person is told how many (with a retry).
  useEffect(() => {
    if (!supabase || !userId || importing.current) return;
    const snap = guestStore.snapshot();
    if (snap.entries.length === 0 && snap.devices.length === 0) {
      setStuck(0);
      return;
    }
    importing.current = true;
    new SupabaseStore(supabase)
      .importGuest(snap.devices.filter((d) => !d.archived), snap.entries)
      .then((n) => {
        guestStore.clear();
        setStuck(0);
        // Entries show a toast; a hand-over of equipment alone has no toast, so the screens refresh from the count change.
        setImported(n > 0 ? n : snap.devices.length > 0 ? -1 : 0);
      })
      .catch(() => {
        // Keep the guest copy; client_request_id prevents duplicates on a retry.
        setStuck(snap.entries.length > 0 ? snap.entries.length : -1);
      })
      .finally(() => {
        importing.current = false;
      });
  }, [userId, guestStore, attempt]);

  const value: AuthCtx = {
    available: !!supabase,
    session,
    loading,
    recovery,
    clearRecovery: () => setRecovery(false),
    store,
    imported,
    clearImported: () => setImported(0),
    stuck,
    retryHandOver: () => setAttempt((n) => n + 1),
    signOut: async () => {
      await supabase?.auth.signOut();
    },
    deleteAccount: async () => {
      if (!supabase) return;
      const { error } = await supabase.rpc('delete_my_account');
      if (error) throw error;
      // The account no longer exists, so only the local session is cleared.
      await supabase.auth.signOut({ scope: 'local' });
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
