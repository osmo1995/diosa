
import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { OptimizedImage } from '../components/ui/OptimizedImage';
import { HeroBackgroundVideo } from '../components/ui/HeroBackgroundVideo';
import { AnimatedSection } from '../components/ui/AnimatedSection';
import { services, transformations, testimonials } from '../data/salonContent';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  const [activeTransform, setActiveTransform] = useState(0);
  const [deferStage, setDeferStage] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    // Stage below-the-fold work to reduce initial main-thread work.
    const w = window as any;
    const idle = (cb: () => void, timeout = 1200) =>
      w.requestIdleCallback ? w.requestIdleCallback(cb, { timeout }) : window.setTimeout(cb, 250);

    const id1 = idle(() => setDeferStage(1), 800);
    const id2 = idle(() => setDeferStage(2), 1400);
    const id3 = idle(() => setDeferStage(3), 2000);

    return () => {
      if (w.cancelIdleCallback) {
        try { w.cancelIdleCallback(id1); } catch {}
        try { w.cancelIdleCallback(id2); } catch {}
        try { w.cancelIdleCallback(id3); } catch {}
      } else {
        clearTimeout(id1);
        clearTimeout(id2);
        clearTimeout(id3);
      }
    };
  }, []);

  const nextTransform = () => {
    setActiveTransform((prev) => (prev + 1) % transformations.length);
  };

  const prevTransform = () => {
    setActiveTransform((prev) => (prev - 1 + transformations.length) % transformations.length);
  };

  return (
    <div className="overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Image-first for fast LCP, then progressively enhance with video. */}
          <OptimizedImage 
            basePath="/exports/hero"
            preferAvif
            alt="Luxury Salon Interior"
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            sizesAttr="100vw"
          />

          <HeroBackgroundVideo
            videoSrc="/exports/hero/hero-install.mp4"
            poster="/exports/hero/700.webp"
            className="absolute inset-0 w-full h-full object-cover opacity-0 animate-fade-in"
          />

          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 text-center px-6">
          <AnimatedSection direction="down">
            <p className="font-accent text-3xl md:text-5xl text-divine-gold mb-4">Awaken Your Inner</p>
            <h1 className="text-5xl md:text-8xl font-serif text-white uppercase tracking-[0.2em] mb-8 leading-tight">
              Goddess
            </h1>
            <p className="text-soft-champagne text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light tracking-wide italic">
              Experience Yorkville's premier destination for high-end hair extensions and bespoke transformations.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => window.location.hash = '/booking'}>
                Book Consultation
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.hash = '/style-generator'}>
                Virtual Preview
              </Button>
            </div>
          </AnimatedSection>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-divine-gold to-transparent" />
        </div>
      </section>

      {/* 2. Virtual Preview Teaser */}
      {deferStage >= 1 && (
      <section className="py-24 bg-goddess-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 shadow-2xl overflow-hidden rounded-sm">
            <AnimatedSection direction="left" className="h-[500px] lg:h-auto">
              <OptimizedImage 
                basePath="/exports/misc/quiz"
                alt="AI Style Preview" 
                className="h-full"
                sizesAttr="(max-width: 1024px) 100vw, 50vw"
              />
            </AnimatedSection>
            <AnimatedSection direction="right" className="bg-deep-charcoal p-12 lg:p-24 flex flex-col justify-center text-white">
              <p className="text-divine-gold font-accent text-3xl mb-4">The Future of Beauty</p>
              <h2 className="text-4xl md:text-5xl font-serif uppercase tracking-widest mb-8">
                Virtual Preview
              </h2>
              <p className="text-soft-champagne/80 text-lg mb-10 leading-relaxed font-light">
                Not sure which method or length is right for you? Our proprietary AI engine lets you visualize 
                different extension styles and colors on your own photo before you even step into the studio.
              </p>
              <Link to="/style-generator">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-deep-charcoal">
                  Try AI Stylist
                </Button>
              </Link>
            </AnimatedSection>
          </div>
        </div>
      </section>
      )}

      {/* 3. Services Preview */}
      {deferStage >= 1 && (
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <AnimatedSection>
            <p className="font-accent text-3xl text-divine-gold mb-2">Artisan Craft</p>
            <h2 className="text-4xl md:text-5xl font-serif uppercase tracking-widest mb-6">Our Services</h2>
            <div className="w-24 h-[1px] bg-divine-gold mx-auto" />
          </AnimatedSection>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <AnimatedSection key={service.id} delay={idx * 0.2}>
              <div className="group cursor-pointer">
                <div className="relative h-[500px] mb-6 overflow-hidden">
                  <OptimizedImage 
                    src={service.imageUrl} 
                    alt={service.title} 
                    className="group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                  <div className="absolute bottom-0 left-0 w-full p-8 translate-y-4 group-hover:translate-y-0 transition-transform">
                    <Link to="/services">
                      <Button variant="ghost" className="text-white border-b border-white rounded-none px-0 hover:bg-transparent tracking-[0.3em]">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </div>
                <h3 className="text-2xl font-serif uppercase tracking-widest mb-2">{service.title}</h3>
                <p className="text-gray-500 text-sm italic">{service.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>
      )}

      {/* 4. Transformations Carousel */}
      {deferStage >= 2 && (
      <section className="py-24 bg-soft-champagne">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <AnimatedSection direction="right">
              <p className="font-accent text-3xl text-divine-gold mb-4">Visible Luxury</p>
              <h2 className="text-4xl md:text-6xl font-serif uppercase tracking-widest mb-8 leading-tight">
                Refined<br />Results
              </h2>
              <p className="text-deep-charcoal/70 text-lg mb-8 leading-relaxed italic">
                Our specialists create seamless blends that are virtually undetectable. 
                Move through your life with the confidence of a goddess.
              </p>
              <div className="flex space-x-4 mb-12">
                <div className="text-center">
                  <p className="text-3xl font-serif text-divine-gold">10k+</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-deep-charcoal/40">Clients Served</p>
                </div>
                <div className="w-[1px] h-12 bg-divine-gold/30" />
                <div className="text-center">
                  <p className="text-3xl font-serif text-divine-gold">15yrs</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-deep-charcoal/40">Experience</p>
                </div>
              </div>
              <Link to="/gallery">
                <Button variant="secondary" size="lg">View Full Gallery</Button>
              </Link>
            </AnimatedSection>
          </div>

          <div className="lg:col-span-7">
            <AnimatedSection direction="left">
              <div className="relative bg-white p-4 shadow-xl">
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <OptimizedImage src={transformations[activeTransform].before} alt="Before" className="aspect-[3/4]" />
                    <span className="absolute top-4 left-4 bg-black/60 text-white text-[10px] px-3 py-1 uppercase tracking-widest font-bold">Before</span>
                  </div>
                  <div className="relative">
                    <OptimizedImage src={transformations[activeTransform].after} alt="After" className="aspect-[3/4]" />
                    <span className="absolute top-4 right-4 bg-divine-gold text-deep-charcoal text-[10px] px-3 py-1 uppercase tracking-widest font-bold">After</span>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Method Used</p>
                    <p className="text-xl font-serif tracking-widest uppercase">{transformations[activeTransform].method}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={prevTransform}
                      aria-label="Previous transformation"
                      className="p-3 border border-gray-200 hover:bg-divine-gold hover:border-divine-gold transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={nextTransform}
                      aria-label="Next transformation"
                      className="p-3 border border-gray-200 hover:bg-divine-gold hover:border-divine-gold transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
      )}

      {/* 5. Testimonials */}
      {deferStage >= 2 && (
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
             <AnimatedSection>
              <Quote size={48} className="text-divine-gold/20 mx-auto mb-6" />
              <h2 className="text-4xl font-serif uppercase tracking-widest">Whispers of Beauty</h2>
            </AnimatedSection>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {testimonials.map((t, idx) => (
              <AnimatedSection key={t.name} delay={idx * 0.2} direction={idx % 2 === 0 ? 'right' : 'left'}>
                <div className="bg-soft-champagne p-12 relative">
                  <p className="text-lg leading-relaxed italic mb-8 text-deep-charcoal/80">
                    "{t.content}"
                  </p>
                  <div>
                    <p className="font-serif text-xl uppercase tracking-widest text-divine-gold">{t.name}</p>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{t.role}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* 6. Final CTA */}
      {deferStage >= 3 && (
      <section className="relative py-32 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <OptimizedImage 
            basePath="/exports/cta"
            preferAvif
            alt="Final CTA Background" 
            className="w-full h-full object-cover"
            sizesAttr="100vw"
          />
          <div className="absolute inset-0 bg-deep-charcoal/80" />
        </div>
        <div className="relative z-10 text-center px-6">
          <AnimatedSection>
            <h2 className="text-4xl md:text-6xl font-serif text-white uppercase tracking-widest mb-8">
              Start Your Journey
            </h2>
            <p className="text-soft-champagne/80 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light">
              Transform your look with the hands of master extension specialists. 
              Luxury is just a consultation away.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Link to="/booking">
                <Button size="lg">Book Now</Button>
              </Link>
              <Link to="/style-generator">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-deep-charcoal">Try Virtual Preview</Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
      )}
    </div>
  );
};
