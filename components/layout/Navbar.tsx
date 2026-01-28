
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About', path: '/about' },
    { name: 'Virtual Preview', path: '/style-generator' },
  ];

  const navbarClasses = `fixed top-0 left-0 w-full z-50 transition-all duration-500 px-6 py-4 md:px-12 ${
    isScrolled 
      ? 'bg-white shadow-md py-3' 
      : isHome ? 'bg-transparent text-white' : 'bg-white text-deep-charcoal shadow-sm'
  }`;

  return (
    <nav className={navbarClasses}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex flex-col items-center">
          <span className="font-accent text-3xl md:text-4xl text-divine-gold">Diosa</span>
          <span className="text-[10px] uppercase tracking-[0.3em] -mt-1 font-bold">Studio Yorkville</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-[11px] uppercase tracking-[0.2em] font-bold hover:text-divine-gold transition-colors ${
                location.pathname === link.path ? 'text-divine-gold' : ''
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Button variant="primary" size="sm" onClick={() => window.location.hash = '/booking'}>
            Book Now
          </Button>
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden flex items-center space-x-4">
          <button
            type="button"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center space-y-8 lg:hidden animate-fade-in">
          <button 
            className="absolute top-6 right-6 p-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={32} />
          </button>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-2xl font-serif uppercase tracking-widest hover:text-divine-gold"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Button 
            variant="primary" 
            size="lg" 
            fullWidth 
            className="max-w-xs"
            onClick={() => {
              setIsMobileMenuOpen(false);
              window.location.hash = '/booking';
            }}
          >
            Book Free Consultation
          </Button>
        </div>
      )}
    </nav>
  );
};
