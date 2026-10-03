import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/common/PageTransition';
import Layout from './components/common/Layout';
import Splash from './pages/Splash';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Danji from './pages/Danji';
import Write from './pages/Write';
import WriteComplete from './pages/WriteComplete';

function AnimatedRoutes() {
  const location = useLocation();

  return (
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
  );
}

export default function App() {
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
