import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const Home = lazy(() => import('./pages/Home'));
const Events = lazy(() => import('./pages/Events'));
const Jobs = lazy(() => import('./pages/Jobs'));
const Learn = lazy(() => import('./pages/Learn'));
const Community = lazy(() => import('./pages/Community'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Auth = lazy(() => import('./pages/Auth'));
const News = lazy(() => import('./pages/News'));
const Admin = lazy(() => import('./pages/Admin'));
const ContentManagement = lazy(() => import('./pages/ContentManagement'));
const Chat = lazy(() => import('./pages/Chat'));

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow pt-16">
          <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/community" element={<Community />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/news" element={<News />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/content-management" element={<ContentManagement />} />
              <Route path="/chat" element={<Chat />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
