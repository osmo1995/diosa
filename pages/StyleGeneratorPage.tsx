
import React from 'react';
import { AnimatedSection } from '../components/ui/AnimatedSection';
import { StyleGenerator } from '../components/ai/StyleGenerator';
import { SignInPanel } from '../components/auth/SignInPanel';
import { useAuth } from '../services/auth';

const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, supabaseReady } = useAuth();

  if (!supabaseReady) return <SignInPanel />;
  if (loading) {
    return (
      <div className="bg-white border border-gray-100 shadow-lg rounded-2xl p-8">
        <div className="h-6 w-40 bg-gray-200 animate-pulse mb-3" />
        <div className="h-4 w-full max-w-md bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (!user) return <SignInPanel />;

  return <>{children}</>;
};

export const StyleGeneratorPage: React.FC = () => {
  const { user, loading } = useAuth();

  React.useEffect(() => {
    // Safety net: if auth callback lands elsewhere, send authenticated users here.
    if (!loading && user && window.location.hash !== '#/style-generator') {
      window.location.hash = '/style-generator';
    }
  }, [loading, user]);

  return (
    <div className="pt-40 pb-24 bg-goddess-white">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="mb-20">
          <p className="font-accent text-4xl text-divine-gold mb-2">Confidence Through Vision</p>
          <h1 className="text-5xl md:text-7xl font-serif uppercase tracking-widest mb-8">Virtual Stylist</h1>
          <p className="text-gray-500 text-lg max-w-3xl leading-relaxed italic">
            Visualize your premium hair extension transformation before you even book. 
            Our advanced neural engine renders professional-grade extensions based on your unique features.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <AuthGate>
            <StyleGenerator />
          </AuthGate>
        </AnimatedSection>
      </div>
    </div>
  );
};
