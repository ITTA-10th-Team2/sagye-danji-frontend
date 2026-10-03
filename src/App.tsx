import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import Layout from './components/common/Layout';
import Splash from './pages/Splash';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Write from './pages/Write';
import WriteComplete from './pages/WriteComplete';

export default function App() {
  return (
    <TDSMobileAITProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/home" element={<Home />} />
            <Route path="/write" element={<Write />} />
            <Route path="/write/complete" element={<WriteComplete />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TDSMobileAITProvider>
  );
}
