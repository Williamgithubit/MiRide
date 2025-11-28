import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaCar,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaTools,
  FaStar,
  FaEnvelope,
  FaChartLine,
  FaUsers,
  FaCog,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaUserCircle,
  FaCommentDots,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import useReduxAuth from "../../../store/hooks/useReduxAuth";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import MiRideLogo from "../../../assets/MiRide Logo.png";
import { useGetUnreadCountQuery } from "../../../store/Message/messageApi";

interface SidebarProps {
  role: "customer" | "owner" | "admin";
  activeSection: string;
  onSectionChange: (section: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: Array<"customer" | "owner" | "admin">;
}

const Sidebar: React.FC<SidebarProps> = ({
  role,
  activeSection,
  onSectionChange,
  isOpen = false,
  onClose,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(isOpen);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { user, logout } = useReduxAuth();
  
  // Get unread notification count for admin
  const adminUnreadCount = useSelector((state: RootState) => 
    role === 'admin' ? state.adminNotifications?.unreadCount || 0 : 0
  );
  
  // Get message unread count for owners
  const { data: messageUnreadData } = useGetUnreadCountQuery(undefined, {
    skip: role !== 'owner',
  });
  const ownerMessageUnreadCount = messageUnreadData?.unreadCount || 0;

  useEffect(() => {
    setIsMobileMenuOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
        if (onClose) onClose();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [onClose]);

  const sidebarItems: SidebarItem[] = [
    // Customer Items
    {
      id: "overview",
      label: "Overview",
      icon: <FaHome />,
      roles: ["customer"],
    },
    {
      id: "bookings",
      label: "My Bookings",
      icon: <FaCalendarAlt />,
      roles: ["customer"],
    },
    {
      id: "booking-status",
      label: "Booking Status",
      icon: <FaChartLine />,
      roles: ["customer"],
    },
    {
      id: "payments",
      label: "Payment History",
      icon: <FaMoneyBillWave />,
      roles: ["customer"],
    },
    {
      id: "reviews",
      label: "My Reviews",
      icon: <FaStar />,
      roles: ["customer"],
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <FaEnvelope />,
      roles: ["customer"],
    },
    {
      id: "profile",
      label: "My Profile",
      icon: <FaUserCircle />,
      roles: ["customer"],
    },

    // Owner Items - Dashboard Overview
    {
      id: "overview",
      label: "Overview",
      icon: <FaHome />,
      roles: ["owner"],
    },
    {
      id: "car-listings",
      label: "My Car Listings",
      icon: <FaCar />,
      roles: ["owner"],
    },
    {
      id: "booking-requests",
      label: "Booking Requests",
      icon: <FaCalendarAlt />,
      roles: ["owner"],
    },
    {
      id: "earnings",
      label: "Earnings",
      icon: <FaMoneyBillWave />,
      roles: ["owner"],
    },
    {
      id: "maintenance",
      label: "Maintenance",
      icon: <FaTools />,
      roles: ["owner"],
    },
    {
      id: "owner-reviews",
      label: "Reviews",
      icon: <FaStar />,
      roles: ["owner"],
    },
    {
      id: "messages",
      label: "Messages",
      icon: <FaCommentDots />,
      roles: ["owner"],
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <FaEnvelope />,
      roles: ["owner"],
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <FaChartLine />,
      roles: ["owner"],
    },

    // Admin Items
    {
      id: "overview",
      label: "Overview",
      icon: <FaHome />,
      roles: ["admin"],
    },
    {
      id: "user-management",
      label: "User Management",
      icon: <FaUsers />,
      roles: ["admin"],
    },
    {
      id: "car-management",
      label: "Car Listings",
      icon: <FaCar />,
      roles: ["admin"],
    },
    {
      id: "bookings-management",
      label: "Bookings",
      icon: <FaCalendarAlt />,
      roles: ["admin"],
    },
    {
      id: "revenue",
      label: "Revenue",
      icon: <FaMoneyBillWave />,
      roles: ["admin"],
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <FaEnvelope />,
      roles: ["admin"],
    },
    {
      id: "reports",
      label: "Reports",
      icon: <FaChartLine />,
      roles: ["admin"],
    },
    { id: "settings", label: "Settings", icon: <FaCog />, roles: ["admin"] },
  ];

  const filteredItems = sidebarItems.filter((item) =>
    item.roles.includes(role)
  );

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

  return (
    <>
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => {
            setIsMobileMenuOpen(false);
            if (onClose) onClose();
          }}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-800 dark:bg-gray-900 text-white w-64 shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isMobileMenuOpen || windowWidth >= 768
            ? "translate-x-0"
            : "-translate-x-full"
        } ${windowWidth < 768 ? 'z-50' : 'z-30'}`}
      >
        {/* Header with close button on mobile */}
        <div className="p-4 sm:p-5 border-b border-gray-700 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <img src={MiRideLogo} alt="MiRide" className="h-8 w-auto cursor-pointer" />
            </Link>
            {/* Close button for mobile */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (onClose) onClose();
              }}
              className="md:hidden p-1.5 hover:bg-gray-700 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <FaTimes size={18} />
            </button>
          </div>
          <div className="mb-2">
            <h2 className="text-lg sm:text-xl font-bold">
              {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 truncate">Welcome, {user?.name}</p>
          </div>
        </div>

        <nav className="mt-3 sm:mt-5 pb-4">
          <ul className="space-y-1 sm:space-y-2 px-3 sm:px-4">
            {filteredItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onSectionChange(item.id);
                    if (windowWidth < 768) {
                      setIsMobileMenuOpen(false);
                      if (onClose) onClose();
                    }
                  }}
                  className={`flex items-center justify-between w-full p-2.5 sm:p-3 rounded-lg transition-all duration-200 ${
                    activeSection === item.id
                      ? "bg-blue-600 text-white shadow-lg scale-[1.02]"
                      : "text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-800 hover:scale-[1.01]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base sm:text-lg">{item.icon}</span>
                    <span className="text-sm sm:text-base font-medium">{item.label}</span>
                  </div>
                  {item.id === "notifications" && role === "admin" && adminUnreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center animate-pulse">
                      {adminUnreadCount > 99 ? '99+' : adminUnreadCount}
                    </span>
                  )}
                  {item.id === "messages" && role === "owner" && ownerMessageUnreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center animate-pulse">
                      {ownerMessageUnreadCount > 99 ? '99+' : ownerMessageUnreadCount}
                    </span>
                  )}
                </button>
              </li>
            ))}

            <li className="mt-6 sm:mt-8 pt-4 border-t border-gray-700 dark:border-gray-800">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full p-2.5 sm:p-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200 hover:scale-[1.01]"
              >
                <FaSignOutAlt className="text-base sm:text-lg" />
                <span className="text-sm sm:text-base font-medium">Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
