import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-gray-600">Empowering students and professionals with opportunities to learn, compete, and grow.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/events" className="text-gray-600 hover:text-blue-600">Events</Link></li>
              <li><Link to="/jobs" className="text-gray-600 hover:text-blue-600">Jobs</Link></li>
              <li><Link to="/learn" className="text-gray-600 hover:text-blue-600">Learn</Link></li>
              <li><Link to="/community" className="text-gray-600 hover:text-blue-600">Community</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-gray-600 hover:text-blue-600">Help Center</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-blue-600">Contact Us</Link></li>
              <li><Link to="/privacy" className="text-gray-600 hover:text-blue-600">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-600 hover:text-blue-600">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-blue-600">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600">
                <Linkedin className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500">&copy; {new Date().getFullYear()} UpskillNation. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
