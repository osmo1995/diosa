
import React, { Suspense } from 'react';

type AnimatePresenceType = React.ComponentType<{
  children: React.ReactNode;
  mode?: 'wait' | 'sync' | 'popLayout';
}>;

const MotionGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [AnimatePresence, setAnimatePresence] = React.useState<AnimatePresenceType | null>(null);

  React.useEffect(() => {
    let mounted = true;
    import('framer-motion')
      .then((m) => {
        if (mounted) setAnimatePresence(() => m.AnimatePresence as AnimatePresenceType);
      })
      .catch(() => {
        // If framer-motion fails to load for any reason, fall back to no animations.
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!AnimatePresence) return <>{children}</>;

  return <AnimatePresence mode="wait">{children}</AnimatePresence>;
};

import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/ui/ScrollToTop';

import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { AuthCallback } from './pages/AuthCallback';

const Gallery = React.lazy(() => import('./pages/Gallery').then((m) => ({ default: m.Gallery })));
const Contact = React.lazy(() => import('./pages/Contact').then((m) => ({ default: m.Contact })));
const StyleGeneratorPage = React.lazy(() =>
  import('./pages/StyleGeneratorPage').then((m) => ({ default: m.StyleGeneratorPage }))
);
const Services = React.lazy(() => import('./pages/Services').then((m) => ({ default: m.Services })));
const About = React.lazy(() => import('./pages/About').then((m) => ({ default: m.About })));


const ConciergeWidget = React.lazy(() =>
  import('./components/ai/ConciergeWidget').then((m) => ({ default: m.ConciergeWidget }))
);


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
          <MotionGate>
            <Suspense
              fallback={
                <div className="pt-40 pb-24 bg-goddess-white">
                  <div className="max-w-7xl mx-auto px-6">
                    <div className="h-8 w-64 bg-gray-200 animate-pulse mb-6" />
                    <div className="h-4 w-full max-w-xl bg-gray-200 animate-pulse" />
                  </div>
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<Services />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/booking" element={<Contact />} />
                <Route path="/about" element={<About />} />
                <Route path="/style-generator" element={<StyleGeneratorPage />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </MotionGate>
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
