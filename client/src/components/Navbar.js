import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useReduxAuth from "../store/hooks/useReduxAuth";
import { toast } from "react-hot-toast";
const Navbar = ({ activeTab, onTabChange }) => {
    const { isAuthenticated, user, logout } = useReduxAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navRef = useRef(null);
    useEffect(() => {
        const handleScroll = () => {
            if (isMenuOpen) {
                setIsMenuOpen(false);
            }
        };
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
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
    const isActive = (path) => location.pathname === path;
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "h-16" }), " ", _jsx("nav", { ref: navRef, className: "fixed top-0 left-0 right-0 bg-green-600 text-white z-50 shadow-md", children: _jsxs("div", { className: "container mx-auto px-4 relative", children: [_jsxs("div", { className: "flex justify-between items-center h-16", children: [_jsx(Link, { to: "/", className: "text-xl font-bold flex items-center space-x-2 cursor-pointer", children: _jsx("span", { children: "MiRide" }) }), _jsx("div", { className: "hidden md:flex items-center space-x-4", children: isAuthenticated ? (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => onTabChange("cars"), className: `px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${activeTab === "cars" ? "bg-green-700" : "hover:bg-green-700"}`, children: "Available Cars" }), _jsx("button", { onClick: () => onTabChange("rentals"), className: `px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${activeTab === "rentals"
                                                    ? "bg-green-700"
                                                    : "hover:bg-green-700"}`, children: "My Rentals" }), _jsxs("button", { onClick: handleLogout, className: "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600 cursor-pointer transition-colors duration-200", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" }) }), _jsxs("span", { children: ["Sign Out (", user?.name, ")"] })] })] })) : (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/login", className: `px-3 py-2 rounded-md text-sm font-medium ${isActive("/login") ? "bg-green-700" : "hover:bg-green-700"}`, children: "Login" }), _jsx(Link, { to: "/signup", className: `px-3 py-2 rounded-md text-sm font-medium ${isActive("/signup") ? "bg-green-700" : "hover:bg-green-700"}`, children: "Sign Up" })] })) }), _jsx("div", { className: "md:hidden", children: _jsx("button", { onClick: () => setIsMenuOpen(!isMenuOpen), className: "inline-flex items-center justify-center p-2 rounded-md hover:bg-green-700 focus:outline-none", children: _jsx("svg", { className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: isMenuOpen ? (_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" })) : (_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" })) }) }) })] }), isMenuOpen && (_jsx("div", { className: "md:hidden absolute top-16 left-0 right-0 bg-green-600 border-t border-green-500 shadow-lg", children: _jsx("div", { className: "px-4 pt-2 pb-3 space-y-1", children: isAuthenticated ? (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => {
                                                onTabChange("cars");
                                                closeMenu();
                                            }, className: `w-full text-left px-3 py-2 rounded-md text-base font-medium ${activeTab === "cars"
                                                ? "bg-green-700"
                                                : "hover:bg-green-700"}`, children: "Available Cars" }), _jsx("button", { onClick: () => {
                                                onTabChange("rentals");
                                                closeMenu();
                                            }, className: `w-full text-left px-3 py-2 rounded-md text-base font-medium ${activeTab === "rentals"
                                                ? "bg-green-700"
                                                : "hover:bg-green-700"}`, children: "My Rentals" }), _jsx("div", { className: "border-t border-green-700 mt-2 pt-2", children: _jsxs("button", { onClick: handleLogout, className: "w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium hover:bg-red-600 transition-colors duration-200", children: [_jsxs("span", { className: "flex items-center", children: [_jsx("svg", { className: "w-5 h-5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" }) }), _jsx("span", { children: "Sign Out" })] }), _jsx("span", { className: "text-sm text-green-200", children: user?.name })] }) })] })) : (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/login", onClick: closeMenu, className: `block px-3 py-2 rounded-md text-base font-medium ${isActive("/login") ? "bg-green-700" : "hover:bg-green-700"}`, children: "Login" }), _jsx(Link, { to: "/signup", onClick: closeMenu, className: `block px-3 py-2 rounded-md text-base font-medium ${isActive("/signup")
                                                ? "bg-green-700"
                                                : "hover:bg-green-700"}`, children: "Sign Up" })] })) }) }))] }) })] }));
};
export default Navbar;
