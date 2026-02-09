
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatedSection } from '../components/ui/AnimatedSection';
import { StyleGenerator } from '../components/ai/StyleGenerator';
import { useAuth } from '../services/auth';

export const StyleGeneratorPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    // Redirect unauthenticated users to Members page
    if (!loading && !user) {
      navigate('/members', { replace: true });
    }
  }, [loading, user, navigate]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="pt-40 pb-24 bg-goddess-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-8 w-64 bg-gray-200 animate-pulse mb-6" />
          <div className="h-4 w-full max-w-xl bg-gray-200 animate-pulse" />
        </div>
      </div>
    );
  }

  // If not authenticated, return null (useEffect will redirect to /members)
  if (!user) {
    return null;
  }

  // User is authenticated, show the style generator
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
          <StyleGenerator />
        </AnimatedSection>
      </div>
    </div>
  );
};
