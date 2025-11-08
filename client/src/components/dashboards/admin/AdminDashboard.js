import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import Sidebar from "../shared/Sidebar";
import TopNavbar from "../shared/TopNavbar";
import { AdminOverview, UserManagement, CarManagement, AdminModals, AdminNotifications, AdminReports, AdminSettings, } from "../dashboard-components/admin-components";
import RevenuePayments from "../dashboard-components/admin-components/RevenuePayments/RevenuePayments";
import { BookingsManagement } from "../dashboard-components/admin-components/BookingsManagement";
const AdminDashboard = () => {
    const [activeSection, setActiveSection] = useState("overview");
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedCar, setSelectedCar] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // Handler functions for modal interactions
    // const handleViewUser = (user: any) => {
    //   setSelectedUser(user);
    // };
    // const handleViewCar = (car: any) => {
    //   setSelectedCar(car);
    // };
    const handleCloseUserModal = () => {
        setSelectedUser(null);
    };
    const handleCloseCarModal = () => {
        setSelectedCar(null);
    };
    const renderContent = () => {
        switch (activeSection) {
            case "overview":
                return _jsx(AdminOverview, {});
            case "user-management":
                return _jsx(UserManagement, {});
            case "car-management":
                return _jsx(CarManagement, {});
            case "bookings-management":
                return _jsx(BookingsManagement, {});
            case "revenue":
                return _jsx(RevenuePayments, {});
            case "notifications":
                return _jsx(AdminNotifications, {});
            case "reports":
                return _jsx(AdminReports, {});
            case "settings":
                return _jsx(AdminSettings, {});
            default:
                return (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "Select a section from the sidebar." }) }));
        }
    };
    return (_jsxs("div", { className: "flex h-screen bg-gray-100 dark:bg-gray-900", children: [_jsx(Sidebar, { role: "admin", activeSection: activeSection, onSectionChange: setActiveSection, isOpen: isSidebarOpen, onClose: () => setIsSidebarOpen(false) }), _jsxs("div", { className: "flex-1 flex flex-col w-full md:ml-64", children: [_jsx(TopNavbar, { title: "Admin Dashboard", onMenuClick: () => setIsSidebarOpen(!isSidebarOpen) }), _jsx("main", { className: "flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 w-full", children: renderContent() })] }), _jsx(AdminModals, { selectedUser: selectedUser, selectedCar: selectedCar, onCloseUserModal: handleCloseUserModal, onCloseCarModal: handleCloseCarModal })] }));
};
export default AdminDashboard;
