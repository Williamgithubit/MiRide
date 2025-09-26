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
} from "react-icons/fa";
import useReduxAuth from "../../../store/hooks/useReduxAuth";

interface SidebarProps {
  role: "customer" | "owner" | "admin";
  activeSection: string;
  onSectionChange: (section: string) => void;
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
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { user, logout } = useReduxAuth();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      id: "bookings-overview",
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
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-800 text-white w-64 shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          isMobileMenuOpen || windowWidth >= 768
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-gray-700">
          <h2 className="text-xl font-bold">
            {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
          </h2>
          <p className="text-sm text-gray-400">Welcome, {user?.name}</p>
        </div>

        <nav className="mt-5">
          <ul className="space-y-2 px-4">
            {filteredItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onSectionChange(item.id);
                    if (windowWidth < 768) {
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  className={`flex items-center w-full p-3 rounded-md transition-colors ${
                    activeSection === item.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}

            <li className="mt-8">
              <button
                onClick={handleLogout}
                className="flex items-center w-full p-3 rounded-md text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
              >
                <FaSignOutAlt className="mr-3" />
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
