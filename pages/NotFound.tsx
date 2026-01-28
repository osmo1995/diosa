import React from 'react';
import { Button } from '../components/ui/Button';
import { AnimatedSection } from '../components/ui/AnimatedSection';

export const NotFound: React.FC = () => {
  return (
    <div className="pt-32 pb-24 bg-goddess-white">
      <div className="max-w-5xl mx-auto px-6">
        <AnimatedSection className="text-center">
          <p className="font-accent text-4xl text-divine-gold mb-2">Lost in the Goddess Realm</p>
          <h1 className="text-5xl md:text-7xl font-serif uppercase tracking-widest mb-6">404</h1>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed mb-10">
            This page doesn’t exist — but your next best hair day absolutely does.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => (window.location.hash = '/')}>Return Home</Button>
            <Button size="lg" variant="outline" onClick={() => (window.location.hash = '/booking')}>Book Consultation</Button>
            <Button size="lg" variant="secondary" onClick={() => (window.location.hash = '/services')}>Explore Methods</Button>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};
