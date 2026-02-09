import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignInPanel } from '../components/auth/SignInPanel';
import { useAuth } from '../services/auth';

/**
 * Members page - dedicated authentication page
 * - If user is not signed in: shows sign-in panel
 * - If user is signed in: redirects to style generator
 */
export function MembersPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is authenticated, redirect to style generator
    if (!loading && user) {
      navigate('/style-generator', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-goddess-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-divine-gold border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show sign-in panel
  return (
    <div className="min-h-screen bg-goddess-white">
      {/* Header */}
      <div className="bg-deep-charcoal text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <p className="font-accent text-3xl text-divine-gold mb-2">Members Area</p>
          <h1 className="text-4xl md:text-5xl font-serif uppercase tracking-widest mb-4">
            Sign In
          </h1>
          <p className="text-lg text-soft-champagne/90 max-w-2xl mx-auto">
            Access your account to use the AI Style Generator, manage your bookings, and view your consultation history.
          </p>
        </div>
      </div>

      {/* Sign-in Panel */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-md mx-auto">
          <SignInPanel />
        </div>
      </div>
    </div>
  );
}
