import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabaseClient } from './supabaseClient';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!supabaseClient) {
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
        return;
      }

      const { data } = await supabaseClient.auth.getSession();
      if (!mounted) return;
      console.log('[useAuth] Session retrieved:', data.session ? 'User signed in' : 'No session');
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);

      const { data: sub } = supabaseClient.auth.onAuthStateChange((event, next) => {
        console.log('[useAuth] Auth state changed:', event, next ? 'User signed in' : 'No session');
        setSession(next);
        setUser(next?.user ?? null);
      });

      return () => sub.subscription.unsubscribe();
    }

    const cleanupPromise = init();

    return () => {
      mounted = false;
      void cleanupPromise;
    };
  }, []);

  return { session, user, loading, supabaseReady: Boolean(supabaseClient) };
}
