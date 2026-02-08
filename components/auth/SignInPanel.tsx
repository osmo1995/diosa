import React, { useMemo, useState } from 'react';
import { supabaseClient } from '../../services/supabaseClient';
import { Button } from '../ui/Button';

export const SignInPanel: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabaseReady = useMemo(() => Boolean(supabaseClient), []);

  async function signInWithGoogle() {
    if (!supabaseClient) return;
    setLoading(true);
    setStatus(null);
    try {
      // Supabase redirects to the root, then we handle the hash routing client-side
      const redirectTo = `${window.location.origin}/`;
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });
      if (error) setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseClient) return;
    setLoading(true);
    setStatus(null);
    try {
      // Supabase redirects to the root, then we handle the hash routing client-side
      const emailRedirectTo = `${window.location.origin}/`;
      const { error } = await supabaseClient.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo,
        },
      });
      if (error) setStatus(error.message);
      else setStatus('Check your email for a sign-in link.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-2xl p-8">
      <h2 className="text-2xl font-serif uppercase tracking-widest text-deep-charcoal mb-3">Sign in to continue</h2>
      <p className="text-gray-500 text-sm leading-relaxed mb-6">
        Your free quota (15 generations/month) and any purchased credits are tied to your account.
      </p>

      {!supabaseReady ? (
        <div className="p-4 bg-soft-champagne/40 border border-soft-champagne rounded-xl text-sm text-gray-700">
          Supabase is not configured. Set <code className="font-mono">VITE_SUPABASE_URL</code> and{' '}
          <code className="font-mono">VITE_SUPABASE_ANON_KEY</code>.
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <Button
              size="lg"
              variant="primary"
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full"
            >
              Continue with Google
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px bg-gray-200 flex-1" />
            <div className="text-[10px] uppercase tracking-widest text-gray-400">or</div>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          <form onSubmit={sendMagicLink} className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-600">Email link</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base"
              placeholder="you@example.com"
            />
            <Button size="lg" variant="secondary" type="submit" disabled={loading} className="w-full">
              Send magic link
            </Button>
          </form>

          {status && <div className="text-sm text-gray-600">{status}</div>}
        </div>
      )}
    </div>
  );
};
