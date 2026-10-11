import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import { AnimatePresence } from 'framer-motion';
import { useHomeButtonRouting } from './lib/useHomeButtonRouting';
import NavigationManager from './components/common/ManageNav';
import PageTransition from './components/common/PageTransition';
import Layout from './components/common/Layout';
import Splash from './pages/Splash';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Danji from './pages/Danji';
import Write from './pages/Write';
import WriteComplete from './pages/WriteComplete';
import { useEffect } from 'react';
import { startAnalytics } from './lib/analytics';

function AnimatedRoutes() {
  const location = useLocation();
  useHomeButtonRouting();

  return (
    <>
      <NavigationManager />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Splash /></PageTransition>} />
          <Route path="/onboarding" element={<PageTransition><Onboarding /></PageTransition>} />
          <Route path="/home" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/danji" element={<PageTransition><Danji /></PageTransition>} />
          <Route path="/write" element={<PageTransition><Write /></PageTransition>} />
          <Route path="/write/complete" element={<PageTransition><WriteComplete /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  // 사진 상세 페이지를 제외하고 확대/축소 막기
  useEffect(() => {
    const preventPageZoom = (event: Event) => {
      if (event.target instanceof Element && event.target.closest('.danji-detail-photo')) return;
      if ('touches' in event && (event as TouchEvent).touches.length < 2) return;
      if (event.cancelable) event.preventDefault();
    };

    document.addEventListener('touchmove', preventPageZoom, { passive: false });
    document.addEventListener('gesturestart', preventPageZoom, { passive: false });
    document.addEventListener('gesturechange', preventPageZoom, { passive: false });
    return () => {
      document.removeEventListener('touchmove', preventPageZoom);
      document.removeEventListener('gesturestart', preventPageZoom);
      document.removeEventListener('gesturechange', preventPageZoom);
    };
  }, []);

  useEffect(startAnalytics, []);
  return (
    <TDSMobileAITProvider>
      <BrowserRouter>
        <Layout>
          <AnimatedRoutes />
        </Layout>
      </BrowserRouter>
    </TDSMobileAITProvider>
  );
}
