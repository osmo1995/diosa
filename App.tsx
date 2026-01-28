
import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

import { Home } from './pages/Home';
import { Gallery } from './pages/Gallery';
import { Contact } from './pages/Contact';
import { StyleGeneratorPage } from './pages/StyleGeneratorPage';
import { Services } from './pages/Services';
import { About } from './pages/About';

const ConciergeWidget = React.lazy(() =>
  import('./components/ai/ConciergeWidget').then((m) => ({ default: m.ConciergeWidget }))
);

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AnimatedSection: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="animate-fade-in">{children}</div>
);

const LazyAfterIdle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const ric = (window as any).requestIdleCallback as undefined | ((cb: () => void, opts?: any) => number);
    if (ric) {
      const id = ric(() => setShow(true), { timeout: 1500 });
      return () => (window as any).cancelIdleCallback?.(id);
    }

    const t = window.setTimeout(() => setShow(true), 1500);
    return () => window.clearTimeout(t);
  }, []);

  return show ? <>{children}</> : null;
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/booking" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/style-generator" element={<StyleGeneratorPage />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />

        <Suspense fallback={null}>
          <LazyAfterIdle>
            <ConciergeWidget />
          </LazyAfterIdle>
        </Suspense>
      </div>
    </Router>
  );
};

export default App;
