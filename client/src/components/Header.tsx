import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCarSide, FaBars, FaTimes, FaUserCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
// Replace AuthContext with Redux
import { useAppSelector } from "../store/hooks";
import useReduxAuth from "../store/hooks/useReduxAuth";
import { toast } from "react-hot-toast";

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  
  // Use the custom auth hook for all auth-related state and actions
  const { user, isAuthenticated, logout } = useReduxAuth();
  
  // Debug auth state and ensure user data is available
  useEffect(() => {
    console.log('Auth state in Header:', { 
      isAuthenticated, 
      user, 
      userName: user?.name,
      userEmail: user?.email,
      userRole: user?.role
    });
    
    // Check for token but missing user data
    const token = localStorage.getItem('token');
    if (token && !user && isAuthenticated) {
      console.log('Token exists but user data is missing in Header');
    }
  }, [isAuthenticated, user]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const toggleProfile = () => setProfileOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
    toast.success("Logged out successfully");
  };

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-md fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center text-blue-600 text-2xl font-bold"
        >
          <FaCarSide className="mr-2" />
          MiRide
        </Link>

        {/* Hamburger (mobile) */}
        <button
          className="md:hidden text-2xl text-blue-600 focus:outline-none"
          onClick={toggleMenu}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex justify-end space-x-6 text-gray-700 font-medium">
          <Link to="/cars" className="hover:text-blue-600">Browse Cars</Link>
        </nav>

        {/* Desktop Auth/Profile */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              <button
                className="flex items-center space-x-2 hover:text-blue-600"
                onClick={toggleProfile}
              >
                <FaUserCircle size={24} />
                <span className="font-medium">
                  {user && user.name ? user.name : "Account"}
                </span>
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-md py-2 z-50"
                  >
                    <Link
                      to="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-full hover:bg-blue-50 transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="md:hidden overflow-hidden bg-white border-t border-gray-200 shadow-md"
          >
            <div className="flex flex-col space-y-4 px-6 pt-4 pb-6 text-gray-700 font-medium">
              <Link to="/cars" onClick={closeMenu} className="hover:text-blue-600">Browse Cars</Link>

              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 text-blue-600 font-medium border-b border-gray-200">
                    Hello, {user && user.name ? user.name : "User"}
                  </div>
                  <Link to="/dashboard" onClick={closeMenu} className="hover:text-blue-600 px-4 py-2">Dashboard</Link>
                  <button
                    onClick={() => {
                      closeMenu();
                      logout();
                      navigate("/login");
                    }}
                    className="text-left text-red-600 px-4 py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-full text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeMenu}
                    className="px-4 py-2 bg-blue-600 text-white rounded-full text-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
