import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Menu, X, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-mgmu-blue text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full">
                <GraduationCap className="h-8 w-8 text-mgmu-blue" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight">MGM UNIVERSITY</span>
                <span className="text-xs text-mgmu-gold font-semibold uppercase tracking-widest">Ph.D. Management System</span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-mgmu-gold transition-colors font-medium">Home</Link>
            <Link to="/about" className="hover:text-mgmu-gold transition-colors font-medium">About</Link>
            <Link to="/contact" className="hover:text-mgmu-gold transition-colors font-medium">Contact</Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/dashboard" 
                  className="bg-mgmu-gold text-white px-4 py-2 rounded hover:bg-opacity-90 transition-all flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-secondary">Login</Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-mgmu-blue border-t border-blue-900"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" className="block px-3 py-2 hover:bg-blue-900 rounded">Home</Link>
              <Link to="/about" className="block px-3 py-2 hover:bg-blue-900 rounded">About</Link>
              <Link to="/contact" className="block px-3 py-2 hover:bg-blue-900 rounded">Contact</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="block px-3 py-2 text-mgmu-gold">Dashboard</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-red-400">Logout</button>
                </>
              ) : (
                <Link to="/login" className="block px-3 py-2 text-mgmu-gold font-bold">Login</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
