import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { FaHome, FaCar, FaCalendarAlt, FaMoneyBillWave, FaTools, FaStar, FaEnvelope, FaChartLine, FaUsers, FaCog, FaTimes, FaSignOutAlt, FaUserCircle, } from "react-icons/fa";
import useReduxAuth from "../../../store/hooks/useReduxAuth";
import { useSelector } from "react-redux";
const Sidebar = ({ role, activeSection, onSectionChange, isOpen = false, onClose, }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(isOpen);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const { user, logout } = useReduxAuth();
    // Get unread notification count for admin
    const adminUnreadCount = useSelector((state) => role === 'admin' ? state.adminNotifications?.unreadCount || 0 : 0);
    useEffect(() => {
        setIsMobileMenuOpen(isOpen);
    }, [isOpen]);
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
                if (onClose)
                    onClose();
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [onClose]);
    const sidebarItems = [
        // Customer Items
        {
            id: "overview",
            label: "Overview",
            icon: _jsx(FaHome, {}),
            roles: ["customer"],
        },
        {
            id: "bookings",
            label: "My Bookings",
            icon: _jsx(FaCalendarAlt, {}),
            roles: ["customer"],
        },
        {
            id: "booking-status",
            label: "Booking Status",
            icon: _jsx(FaChartLine, {}),
            roles: ["customer"],
        },
        {
            id: "payments",
            label: "Payment History",
            icon: _jsx(FaMoneyBillWave, {}),
            roles: ["customer"],
        },
        {
            id: "reviews",
            label: "My Reviews",
            icon: _jsx(FaStar, {}),
            roles: ["customer"],
        },
        {
            id: "notifications",
            label: "Notifications",
            icon: _jsx(FaEnvelope, {}),
            roles: ["customer"],
        },
        {
            id: "profile",
            label: "My Profile",
            icon: _jsx(FaUserCircle, {}),
            roles: ["customer"],
        },
        // Owner Items - Dashboard Overview
        {
            id: "overview",
            label: "Overview",
            icon: _jsx(FaHome, {}),
            roles: ["owner"],
        },
        {
            id: "car-listings",
            label: "My Car Listings",
            icon: _jsx(FaCar, {}),
            roles: ["owner"],
        },
        {
            id: "booking-requests",
            label: "Booking Requests",
            icon: _jsx(FaCalendarAlt, {}),
            roles: ["owner"],
        },
        {
            id: "earnings",
            label: "Earnings",
            icon: _jsx(FaMoneyBillWave, {}),
            roles: ["owner"],
        },
        {
            id: "maintenance",
            label: "Maintenance",
            icon: _jsx(FaTools, {}),
            roles: ["owner"],
        },
        {
            id: "owner-reviews",
            label: "Reviews",
            icon: _jsx(FaStar, {}),
            roles: ["owner"],
        },
        {
            id: "notifications",
            label: "Notifications",
            icon: _jsx(FaEnvelope, {}),
            roles: ["owner"],
        },
        {
            id: "analytics",
            label: "Analytics",
            icon: _jsx(FaChartLine, {}),
            roles: ["owner"],
        },
        // Admin Items
        {
            id: "overview",
            label: "Overview",
            icon: _jsx(FaHome, {}),
            roles: ["admin"],
        },
        {
            id: "user-management",
            label: "User Management",
            icon: _jsx(FaUsers, {}),
            roles: ["admin"],
        },
        {
            id: "car-management",
            label: "Car Listings",
            icon: _jsx(FaCar, {}),
            roles: ["admin"],
        },
        {
            id: "bookings-management",
            label: "Bookings",
            icon: _jsx(FaCalendarAlt, {}),
            roles: ["admin"],
        },
        {
            id: "revenue",
            label: "Revenue",
            icon: _jsx(FaMoneyBillWave, {}),
            roles: ["admin"],
        },
        {
            id: "notifications",
            label: "Notifications",
            icon: _jsx(FaEnvelope, {}),
            roles: ["admin"],
        },
        {
            id: "reports",
            label: "Reports",
            icon: _jsx(FaChartLine, {}),
            roles: ["admin"],
        },
        { id: "settings", label: "Settings", icon: _jsx(FaCog, {}), roles: ["admin"] },
    ];
    const filteredItems = sidebarItems.filter((item) => item.roles.includes(role));
    const handleLogout = () => {
        logout();
    };
    const toggleMobileMenu = () => {
        const newState = !isMobileMenuOpen;
        setIsMobileMenuOpen(newState);
        if (!newState && onClose) {
            onClose();
        }
    };
    return (_jsxs(_Fragment, { children: [isMobileMenuOpen && (_jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity", onClick: () => {
                    setIsMobileMenuOpen(false);
                    if (onClose)
                        onClose();
                } })), _jsxs("div", { className: `fixed top-0 left-0 h-full bg-gray-800 dark:bg-gray-900 text-white w-64 shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto ${isMobileMenuOpen || windowWidth >= 768
                    ? "translate-x-0"
                    : "-translate-x-full"} ${windowWidth < 768 ? 'z-50' : 'z-30'}`, children: [_jsxs("div", { className: "p-4 sm:p-5 border-b border-gray-700 dark:border-gray-800", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("h2", { className: "text-lg sm:text-xl font-bold", children: [role.charAt(0).toUpperCase() + role.slice(1), " Dashboard"] }), _jsx("button", { onClick: () => {
                                            setIsMobileMenuOpen(false);
                                            if (onClose)
                                                onClose();
                                        }, className: "md:hidden p-1.5 hover:bg-gray-700 dark:hover:bg-gray-800 rounded-lg transition-colors", "aria-label": "Close menu", children: _jsx(FaTimes, { size: 18 }) })] }), _jsxs("p", { className: "text-xs sm:text-sm text-gray-400 truncate", children: ["Welcome, ", user?.name] })] }), _jsx("nav", { className: "mt-3 sm:mt-5 pb-4", children: _jsxs("ul", { className: "space-y-1 sm:space-y-2 px-3 sm:px-4", children: [filteredItems.map((item) => (_jsx("li", { children: _jsxs("button", { onClick: () => {
                                            onSectionChange(item.id);
                                            if (windowWidth < 768) {
                                                setIsMobileMenuOpen(false);
                                                if (onClose)
                                                    onClose();
                                            }
                                        }, className: `flex items-center justify-between w-full p-2.5 sm:p-3 rounded-lg transition-all duration-200 ${activeSection === item.id
                                            ? "bg-blue-600 text-white shadow-lg scale-[1.02]"
                                            : "text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-800 hover:scale-[1.01]"}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-base sm:text-lg", children: item.icon }), _jsx("span", { className: "text-sm sm:text-base font-medium", children: item.label })] }), item.id === "notifications" && role === "admin" && adminUnreadCount > 0 && (_jsx("span", { className: "bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center animate-pulse", children: adminUnreadCount > 99 ? '99+' : adminUnreadCount }))] }) }, item.id))), _jsx("li", { className: "mt-6 sm:mt-8 pt-4 border-t border-gray-700 dark:border-gray-800", children: _jsxs("button", { onClick: handleLogout, className: "flex items-center gap-3 w-full p-2.5 sm:p-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200 hover:scale-[1.01]", children: [_jsx(FaSignOutAlt, { className: "text-base sm:text-lg" }), _jsx("span", { className: "text-sm sm:text-base font-medium", children: "Logout" })] }) })] }) })] })] }));
};
export default Sidebar;
