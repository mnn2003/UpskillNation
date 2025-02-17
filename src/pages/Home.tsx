import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, GraduationCap, Users, Calendar } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Unlock Your Potential
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Discover opportunities, learn new skills, and connect with a community of achievers
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/events"
                className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Explore Events
              </Link>
              <Link
                to="/auth"
                className="border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Calendar className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Events & Competitions</h3>
              <p className="text-gray-600 mb-4">
                Participate in exciting events and competitions to showcase your talent
              </p>
              <Link to="/events" className="text-primary-600 font-medium flex items-center hover:text-primary-700">
                View Events <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <Briefcase className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Jobs & Internships</h3>
              <p className="text-gray-600 mb-4">
                Find your dream job or internship with top companies
              </p>
              <Link to="/jobs" className="text-primary-600 font-medium flex items-center hover:text-primary-700">
                Browse Jobs <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <GraduationCap className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Learning Resources</h3>
              <p className="text-gray-600 mb-4">
                Access quality learning materials to enhance your skills
              </p>
              <Link to="/learn" className="text-primary-600 font-medium flex items-center hover:text-primary-700">
                Start Learning <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <Users className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p className="text-gray-600 mb-4">
                Connect with like-minded individuals and grow together
              </p>
              <Link to="/community" className="text-primary-600 font-medium flex items-center hover:text-primary-700">
                Join Community <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Opportunities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80"
                alt="Hackathon"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">National Hackathon 2025</h3>
                <p className="text-gray-600 mb-4">
                  Join the biggest hackathon of the year and showcase your innovation
                </p>
                <Link to="/events" className="text-primary-600 font-medium">Learn More</Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80"
                alt="Career Fair"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Virtual Career Fair</h3>
                <p className="text-gray-600 mb-4">
                  Connect with top employers and find your next career opportunity
                </p>
                <Link to="/jobs" className="text-primary-600 font-medium">Learn More</Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                alt="Workshop"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Tech Workshop Series</h3>
                <p className="text-gray-600 mb-4">
                  Learn the latest technologies from industry experts
                </p>
                <Link to="/learn" className="text-primary-600 font-medium">Learn More</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;