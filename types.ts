
export interface Service {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  price: string;
  duration: string;
  longevity: string;
  imageUrl: string;
  bestFor: string[];
  moveUpCadence: string;
  wearTime: string;
  notes?: string;
}

export interface Transformation {
  id: string;
  before: string;
  after: string;
  method: string;
  category?: string;
}

export interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
}

export interface GalleryItem {
  id: string;
  url: string;
  category: 'Blonde' | 'Volume' | 'Length';
  title: string;
}

export interface FormData {
  service: string;
  length: string;
  date: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
}
