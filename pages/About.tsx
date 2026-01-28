import React from 'react';
import { AnimatedSection } from '../components/ui/AnimatedSection';
import { Button } from '../components/ui/Button';
import { OptimizedImage } from '../components/ui/OptimizedImage';

export const About: React.FC = () => {
  return (
    <div className="pt-32 pb-24 bg-goddess-white">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-accent text-4xl text-divine-gold mb-2">The Studio</p>
            <h1 className="text-5xl md:text-7xl font-serif uppercase tracking-widest mb-8">About Diosa</h1>
            <p className="text-gray-600 leading-relaxed mb-6">
              Diosa Studio Yorkville is built around integrity-first extensions: meticulous sectioning,
              invisible installs, and blends that hold up in daylight.
            </p>
            <p className="text-gray-600 leading-relaxed mb-10">
              We focus on comfort, scalp health, and repeatable results  so your hair feels as luxurious as it looks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={() => (window.location.hash = '/booking')}>Book Your Consultation</Button>
              <Button size="lg" variant="outline" onClick={() => (window.location.hash = '/services')}>Explore Methods</Button>
            </div>
          </div>

          <div className="aspect-[3/4] bg-soft-champagne overflow-hidden shadow-sm">
            {/* Re-use a hero export as an About visual */}
            <OptimizedImage basePath="/exports/hero" alt="Diosa Studio Yorkville" className="w-full h-full" />
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};
