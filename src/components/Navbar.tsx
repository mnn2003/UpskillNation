import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search, Bell, User } from "lucide-react";
import logo from '../assets/upskillnation-logo.svg';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0); 
  const [isVisible, setIsVisible] = useState(true); 

  const handleScroll = () => {
    if (window.scrollY > lastScrollY) {
      // Scrolling down
      setIsVisible(false);
    } else {
      // Scrolling up
      setIsVisible(true);
    }
    setLastScrollY(window.scrollY); 
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <nav
      className={`bg-white shadow-sm transition-all duration-300 ${
        isVisible ? "top-0" : "-top-16" 
      } fixed w-full z-50`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img src={logo} alt="UpskillNation Logo" className="h-10" />
            </Link>
            {/* Desktop Menu */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/events"
                className="text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium"
              >
                Events
              </Link>
              <Link
                to="/jobs"
                className="text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium"
              >
                Jobs
              </Link>
              <Link
                to="/learn"
                className="text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium"
              >
                Learn
              </Link>
              <Link
                to="/community"
                className="text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium"
              >
                Community
              </Link>
              <Link
                to="/news"
                className="text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium"
              >
                News
              </Link>
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-600">
              <Search className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-600">
              <Bell className="h-5 w-5" />
            </button>
            <Link
              to="/auth"
              className="p-2 rounded-full text-gray-500 hover:text-gray-600"
            >
              <User className="h-5 w-5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/events"
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Events
            </Link>
            <Link
              to="/jobs"
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Jobs
            </Link>
            <Link
              to="/learn"
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Learn
            </Link>
            <Link
              to="/community"
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Community
            </Link>
            <Link
              to="/news"
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              News
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
