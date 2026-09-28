import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import Layout from './components/common/Layout';
import Home from './pages/Home';
import Write from './pages/Write';

export default function App() {
  return (
    <TDSMobileAITProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/write" element={<Write />} />
            {/* 이 아래로 페이지 추가 */}
          </Routes>
        </Layout>
      </BrowserRouter>
    </TDSMobileAITProvider>
  );
}
