import React, { useEffect, useState } from 'react';
import { supabaseClient } from '../services/supabaseClient';

export const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      if (!supabaseClient) {
        setStatus('error');
        setErrorMessage('Supabase client not configured');
        // Redirect to home after 2 seconds
        setTimeout(() => {
          window.location.hash = '/';
        }, 2000);
        return;
      }

      try {
        // Supabase automatically handles the OAuth callback via URL hash parameters
        // We just need to wait a moment for the session to be established
        const { data, error } = await supabaseClient.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setErrorMessage(error.message);
          // Redirect back to sign-in after 3 seconds
          setTimeout(() => {
            window.location.hash = '/style-generator';
          }, 3000);
          return;
        }

        if (data.session) {
          setStatus('success');
          // Successful auth - redirect to style generator
          setTimeout(() => {
            window.location.hash = '/style-generator';
          }, 500);
        } else {
          // No session yet, wait a bit and try again
          setTimeout(handleCallback, 500);
        }
      } catch (err) {
        console.error('Auth callback exception:', err);
        setStatus('error');
        setErrorMessage('Authentication failed');
        setTimeout(() => {
          window.location.hash = '/style-generator';
        }, 3000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="pt-32 pb-24 bg-goddess-white min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto px-6 text-center">
        {status === 'loading' && (
          <>
            <div className="mb-6">
              <div className="inline-block w-16 h-16 border-4 border-divine-gold border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="font-accent text-2xl text-divine-gold mb-2">Authenticating...</p>
            <p className="text-gray-600">Please wait while we complete your sign-in.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-divine-gold/10 rounded-full">
                <svg className="w-8 h-8 text-divine-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="font-accent text-2xl text-divine-gold mb-2">Success!</p>
            <p className="text-gray-600">Redirecting to Virtual Stylist...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <p className="font-accent text-2xl text-red-500 mb-2">Authentication Error</p>
            <p className="text-gray-600 mb-4">{errorMessage || 'Something went wrong.'}</p>
            <p className="text-sm text-gray-500">Redirecting back to sign-in...</p>
          </>
        )}
      </div>
    </div>
  );
};
