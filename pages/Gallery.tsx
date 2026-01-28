
import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize } from 'lucide-react';
import { AnimatedSection } from '../components/ui/AnimatedSection';
import { OptimizedImage } from '../components/ui/OptimizedImage';
import { galleryItems } from '../data/salonContent';

type Category = 'All' | 'Blonde' | 'Volume' | 'Length';

export const Gallery: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const filteredItems = activeCategory === 'All' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  const openLightbox = (idx: number) => setSelectedIdx(idx);
  const closeLightbox = () => setSelectedIdx(null);
  
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIdx === null) return;
    setSelectedIdx((selectedIdx + 1) % filteredItems.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIdx === null) return;
    setSelectedIdx((selectedIdx - 1 + filteredItems.length) % filteredItems.length);
  };

  const categories: Category[] = ['All', 'Blonde', 'Volume', 'Length'];

  return (
    <div className="pt-32 pb-24 bg-goddess-white">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-serif uppercase tracking-widest mb-6">Gallery</h1>
          <p className="text-gray-500 font-light text-lg mb-12 italic">Curation of our finest transformations in Yorkville.</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-2 text-[10px] uppercase tracking-[0.2em] font-bold border transition-all ${
                  activeCategory === cat 
                  ? 'bg-deep-charcoal text-white border-deep-charcoal' 
                  : 'bg-transparent text-deep-charcoal border-gray-200 hover:border-divine-gold'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, idx) => (
            <AnimatedSection key={item.id} delay={idx * 0.1}>
              <div 
                className="group relative cursor-pointer overflow-hidden aspect-[3/4]"
                onClick={() => openLightbox(idx)}
              >
                <OptimizedImage 
                  src={item.url} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-110 duration-[1500ms]" 
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-500 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 p-8 text-center">
                  <Maximize className="text-divine-gold mb-4" size={32} />
                  <p className="text-white font-serif text-2xl uppercase tracking-widest">{item.title}</p>
                  <p className="text-divine-gold text-[10px] uppercase tracking-widest font-bold mt-2">{item.category}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>

      {/* Lightbox Overlay */}
      {selectedIdx !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 animate-fade-in"
          onClick={closeLightbox}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:text-divine-gold transition-colors"
            onClick={closeLightbox}
          >
            <X size={40} />
          </button>
          
          <button 
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white hover:text-divine-gold transition-colors p-4"
            onClick={prevImage}
          >
            <ChevronLeft size={48} />
          </button>

          <div className="max-w-4xl w-full flex flex-col items-center">
            <img 
              src={filteredItems[selectedIdx].url.replace('/700.webp','/2000.webp')} 
              alt={filteredItems[selectedIdx].title} 
              className="max-h-[80vh] object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-8 text-center text-white" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-3xl font-serif uppercase tracking-widest text-divine-gold mb-2">
                {filteredItems[selectedIdx].title}
              </h3>
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                Category: {filteredItems[selectedIdx].category}
              </p>
            </div>
          </div>

          <button 
            className="absolute right-6 top-1/2 -translate-y-1/2 text-white hover:text-divine-gold transition-colors p-4"
            onClick={nextImage}
          >
            <ChevronRight size={48} />
          </button>
        </div>
      )}
    </div>
  );
};
