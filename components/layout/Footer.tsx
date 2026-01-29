
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, MapPin, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-deep-charcoal text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand Block */}
        <div className="flex flex-col space-y-6">
          <Link to="/" className="flex flex-col">
            <span className="font-accent text-4xl text-divine-gold">Diosa</span>
            <span className="text-[10px] uppercase tracking-[0.3em] -mt-1 font-bold text-soft-champagne">Studio Yorkville</span>
          </Link>
          <p className="text-soft-champagne/60 text-sm leading-relaxed">
            Diosa Studio is Toronto's premier destination for luxury hair extensions. 
            Experience the "Goddess" transformation in the heart of Yorkville.
          </p>
          <div className="flex space-x-4">
            <button
              type="button"
              aria-label="Instagram (coming soon)"
              className="hover:text-divine-gold transition-colors"
              onClick={() => alert('Instagram coming soon')}
            >
              <Instagram size={20} />
            </button>
            <button
              type="button"
              aria-label="Facebook (coming soon)"
              className="hover:text-divine-gold transition-colors"
              onClick={() => alert('Facebook coming soon')}
            >
              <Facebook size={20} />
            </button>
            <a href="mailto:hello@diosayorkville.com" aria-label="Email Diosa Studio" className="hover:text-divine-gold transition-colors"><Mail size={20} /></a>
          </div>
        </div>

        {/* Explore */}
        <div>
          <h4 className="text-divine-gold font-serif text-xl mb-6">Explore</h4>
          <ul className="space-y-4 text-sm uppercase tracking-widest font-semibold text-soft-champagne/80">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/services" className="hover:text-white transition-colors">Services</Link></li>
            <li><Link to="/gallery" className="hover:text-white transition-colors">Gallery</Link></li>
            <li><Link to="/style-generator" className="hover:text-white transition-colors">Virtual Preview</Link></li>
            <li><Link to="/booking" className="hover:text-white transition-colors">Booking</Link></li>
          </ul>
        </div>

        {/* Hours */}
        <div>
          <h4 className="text-divine-gold font-serif text-xl mb-6">At Your Service</h4>
          <ul className="space-y-2 text-sm text-soft-champagne/80">
            <li className="flex justify-between"><span>Mon - Tue</span> <span>Closed</span></li>
            <li className="flex justify-between"><span>Wed - Fri</span> <span>10am - 8pm</span></li>
            <li className="flex justify-between"><span>Sat</span> <span>9am - 6pm</span></li>
            <li className="flex justify-between"><span>Sun</span> <span>10am - 4pm</span></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-divine-gold font-serif text-xl mb-6">Contact</h4>
          <ul className="space-y-4 text-sm text-soft-champagne/80">
            <li className="flex items-start space-x-3">
              <MapPin size={18} className="text-divine-gold flex-shrink-0" />
              <span>123 Luxury Ave, Yorkville<br />Toronto, ON M5R 1A1</span>
            </li>
            <li className="flex items-center space-x-3">
              <Phone size={18} className="text-divine-gold flex-shrink-0" />
              <span>(416) 555-0199</span>
            </li>
            <li className="flex items-center space-x-3">
              <Mail size={18} className="text-divine-gold flex-shrink-0" />
              <span>hello@diosayorkville.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-20 pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-soft-champagne/70 font-bold">
        <p>&copy; 2024 Diosa Studio Yorkville. All Rights Reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <button type="button" className="hover:text-white" onClick={() => alert('Privacy Policy coming soon')}>Privacy Policy</button>
          <button type="button" className="hover:text-white" onClick={() => alert('Terms of Service coming soon')}>Terms of Service</button>
        </div>
      </div>
    </footer>
  );
};
