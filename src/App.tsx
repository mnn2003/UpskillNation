import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Events from './pages/Events';
import Jobs from './pages/Jobs';
import Learn from './pages/Learn';
import Community from './pages/Community';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import News from './pages/News';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
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
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;