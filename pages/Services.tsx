import React from 'react';
import { AnimatedSection } from '../components/ui/AnimatedSection';
import { OptimizedImage } from '../components/ui/OptimizedImage';
import { services } from '../data/salonContent';
import { Button } from '../components/ui/Button';

export const Services: React.FC = () => {
  return (
    <div className="pt-32 pb-24 bg-goddess-white">
      <div className="max-w-7xl mx-auto px-6">
        <nav className="text-xs text-gray-500 mb-6" aria-label="Breadcrumb">
          <button className="hover:text-deep-charcoal" onClick={() => (window.location.hash = '/')} type="button">Home</button>
          <span className="mx-2">/</span>
          <span className="text-gray-700">Services</span>
        </nav>
        <AnimatedSection className="text-center mb-16">
          <p className="font-accent text-4xl text-divine-gold mb-2">Methods, Elevated</p>
          <h1 className="text-5xl md:text-7xl font-serif uppercase tracking-widest mb-6">Services</h1>
          <p className="text-gray-500 text-lg max-w-3xl mx-auto leading-relaxed italic">
            Comfort-first installs. Rooted blends. Daylight-proof results.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {services.map((s, idx) => (
            <AnimatedSection key={s.id} delay={idx * 0.1}>
              <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="aspect-[3/4] md:aspect-auto md:h-full">
                    {/* Expecting /exports/services/<id>/700.webp etc */}
                    <OptimizedImage
                      src={s.imageUrl}
                      alt={s.title}
                      className="w-full h-full"
                    />
                  </div>

                  <div className="p-8">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-gray-500">{s.duration} • {s.price}</div>
                    <h2 className="text-2xl font-serif uppercase tracking-widest mt-3 mb-4">{s.title}</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">{s.longDescription}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="border border-gray-100 p-4">
                        <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Best For</div>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {s.bestFor.slice(0, 3).map((b) => (
                            <li key={b}>• {b}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="border border-gray-100 p-4">
                        <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Maintenance</div>
                        <div className="text-sm text-gray-600">Move-up: {s.moveUpCadence}</div>
                      </div>
                      <div className="border border-gray-100 p-4">
                        <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Wear</div>
                        <div className="text-sm text-gray-600">{s.wearTime}</div>
                      </div>
                    </div>

                    {s.notes && (
                      <p className="text-xs text-gray-500 italic mb-6">{s.notes}</p>
                    )}

                    <Button size="md" onClick={() => (window.location.hash = '/booking')}>Book a Consultation</Button>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </div>
  );
};
