
import { Service, Transformation, Testimonial, GalleryItem } from '../types';

export const services: Service[] = [
  {
    id: 'tape-in',
    title: 'Tape-In Extensions',
    description: 'The standard for seamless, flat-laying volume and length.',
    longDescription: 'Our medical-grade adhesive ensures your extensions stay secure while remaining completely invisible, even in high ponytails.',
    price: 'From $450',
    duration: '1.5 - 2 Hours',
    longevity: '6-8 Weeks',
    imageUrl: '/exports/services/tape-in/700.webp',
    bestFor: ['Fine to medium hair', 'Quick transformations', 'Side-sleeping comfort'],
    moveUpCadence: '6 weeks',
    wearTime: '8-10 weeks'
  },
  {
    id: 'keratin-bond',
    title: 'Keratin Bond',
    description: 'Individual strand-by-strand application for 360° movement.',
    longDescription: 'Each strand is fused using a heat-responsive protein bond, mimicking the natural structure of your hair for ultimate discretion.',
    price: 'From $800',
    duration: '3 - 5 Hours',
    longevity: '3-4 Months',
    imageUrl: '/exports/services/keratin-bond/700.webp',
    bestFor: ['All hair types', 'Maximum discretion', 'Longevity lovers'],
    moveUpCadence: '12-16 weeks',
    wearTime: '4 months'
  },
  {
    id: 'hand-tied',
    title: 'Hand-Tied Wefts',
    description: 'Thin, flat, and weightless rows for massive volume.',
    longDescription: 'Artisanally crafted wefts that sit close to the scalp, providing high-impact density without the bulk of traditional machine wefts.',
    price: 'From $1200',
    duration: '4 - 6 Hours',
    longevity: '2-3 Months',
    imageUrl: '/exports/services/hand-tied/700.webp',
    bestFor: ['Medium to thick hair', 'High-density results', 'Athletic lifestyles'],
    moveUpCadence: '8 weeks',
    wearTime: '9-12 months (re-used hair)'
  }
];

export const transformations: Transformation[] = [
  {
    id: 't1',
    before: '/exports/transformations/t1_before/700.webp',
    after: '/exports/transformations/t1_after/700.webp',
    method: 'Keratin Bond Hybrid',
    category: 'Length'
  },
  {
    id: 't2',
    before: '/exports/transformations/t2_before/700.webp',
    after: '/exports/transformations/t2_after/700.webp',
    method: 'Hand-Tied Volume',
    category: 'Volume'
  },
  {
    id: 't3',
    before: '/exports/transformations/r3_before/700.webp',
    after: '/exports/transformations/r3_after/700.webp',
    method: 'Honey Blonde Blend',
    category: 'Blonde'
  }
];

export const testimonials: Testimonial[] = [
  {
    name: 'Alexandra R.',
    role: 'Editorial Model',
    content: 'Diosa Studio is the only place I trust with my hair. The Yorkville location feels like a private sanctuary, and my extensions are always flawless.',
    rating: 5
  },
  {
    name: 'Julianne M.',
    role: 'Executive',
    content: 'The attention to detail is unmatched. I opted for the Keratin Bonds and people genuinely cannot tell it isn\'t my natural hair.',
    rating: 5
  }
];

export const galleryItems: GalleryItem[] = [
  { id: 'g1', url: '/exports/gallery/blonde_1/700.webp', category: 'Blonde', title: 'Icy Platinum Transformation' },
  { id: 'g2', url: '/exports/gallery/volume_1/700.webp', category: 'Volume', title: 'Natural Density Boost' },
  { id: 'g3', url: '/exports/gallery/length_1/700.webp', category: 'Length', title: 'Mermaid Length Wefts' },
  { id: 'g4', url: '/exports/gallery/blonde_2/700.webp', category: 'Blonde', title: 'Sun-Kissed Balayage' },
  { id: 'g5', url: '/exports/gallery/volume_2/700.webp', category: 'Volume', title: 'Brunette Dimension' },
  { id: 'g6', url: '/exports/gallery/length_2/700.webp', category: 'Length', title: 'Dramatic 24" Transformation' },
];
