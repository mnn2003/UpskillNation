import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search, Bell, User } from "lucide-react";
import logo from "../assets/upskillnation-logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const mobileMenuRef = useRef(null);

  // Handle scroll to show/hide navbar
  const handleScroll = () => {
    if (window.scrollY > lastScrollY) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
    setLastScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Handle search functionality
  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // You can redirect the user to a search results page
      // Example: navigate(`/search?q=${searchQuery}`);
    }
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <nav
      className={`bg-white shadow-sm transition-all duration-300 ${
        isVisible ? "top-0" : "-top-16"
      } fixed w-full z-50`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img src={logo} alt="UpskillNation Logo" className="h-10" />
            </Link>
            {/* Desktop Menu */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/events" className="text-gray-900 text-sm font-medium">Events</Link>
              <Link to="/jobs" className="text-gray-900 text-sm font-medium">Jobs</Link>
              <Link to="/learn" className="text-gray-900 text-sm font-medium">Learn</Link>
              <Link to="/community" className="text-gray-900 text-sm font-medium">Community</Link>
              <Link to="/news" className="text-gray-900 text-sm font-medium">News</Link>
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="hidden sm:flex sm:items-center space-x-4">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="px-3 py-1 border rounded-md text-sm"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-600"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>

            <button className="p-2 rounded-full text-gray-500 hover:text-gray-600">
              <Bell className="h-5 w-5" />
            </button>
            <Link to="/auth" className="p-2 rounded-full text-gray-500 hover:text-gray-600">
              <User className="h-5 w-5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div ref={mobileMenuRef} className="sm:hidden absolute top-16 left-0 w-full bg-white shadow-md">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/events" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">Events</Link>
            <Link to="/jobs" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">Jobs</Link>
            <Link to="/learn" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">Learn</Link>
            <Link to="/community" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">Community</Link>
            <Link to="/news" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">News</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
