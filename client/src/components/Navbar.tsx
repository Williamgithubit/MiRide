import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useReduxAuth from "../store/hooks/useReduxAuth";
import { toast } from "react-hot-toast";
import MiRideLogo from "../assets/MiRide Logo.png";

interface NavbarProps {
  activeTab: "cars" | "rentals";
  onTabChange: (tab: "cars" | "rentals") => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const { isAuthenticated, user, logout } = useReduxAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    // Add event listeners
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Logged out successfully");
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <div className="h-16"></div> {/* Spacer for fixed navbar */}
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 bg-green-600 text-white z-50 shadow-md"
      >
        <div className="container mx-auto px-4 relative">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center cursor-pointer"
            >
              <img src={MiRideLogo} alt="MiRide" className="h-10 w-auto" />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => onTabChange("cars")}
                    className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                      activeTab === "cars" ? "bg-green-700" : "hover:bg-green-700"
                    }`}
                  >
                    Available Cars
                  </button>
                  <button
                    onClick={() => onTabChange("rentals")}
                    className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                      activeTab === "rentals"
                        ? "bg-green-700"
                        : "hover:bg-green-700"
                    }`}
                  >
                    My Rentals
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600 cursor-pointer transition-colors duration-200"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Sign Out ({user?.name})</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("/login") ? "bg-green-700" : "hover:bg-green-700"
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("/signup") ? "bg-green-700" : "hover:bg-green-700"
                    }`}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-green-700 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 right-0 bg-green-600 border-t border-green-500 shadow-lg">
              <div className="px-4 pt-2 pb-3 space-y-1">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => {
                        onTabChange("cars");
                        closeMenu();
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                        activeTab === "cars"
                          ? "bg-green-700"
                          : "hover:bg-green-700"
                      }`}
                    >
                      Available Cars
                    </button>
                    <button
                      onClick={() => {
                        onTabChange("rentals");
                        closeMenu();
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                        activeTab === "rentals"
                          ? "bg-green-700"
                          : "hover:bg-green-700"
                      }`}
                    >
                      My Rentals
                    </button>
                    <div className="border-t border-green-700 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium hover:bg-red-600 transition-colors duration-200"
                      >
                        <span className="flex items-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          <span>Sign Out</span>
                        </span>
                        <span className="text-sm text-green-200">
                          {user?.name}
                        </span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={closeMenu}
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        isActive("/login") ? "bg-green-700" : "hover:bg-green-700"
                      }`}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={closeMenu}
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        isActive("/signup")
                          ? "bg-green-700"
                          : "hover:bg-green-700"
                      }`}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
