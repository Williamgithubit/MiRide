import React, { useState } from "react";
import Sidebar from "../shared/Sidebar";
import TopNavbar from "../shared/TopNavbar";
import {
  AdminOverview,
  UserManagement,
  CarManagement,
  AdminModals,
  AdminNotifications,
  AdminReports,
} from "../dashboard-components/admin-components";
import RevenuePayments from "../dashboard-components/admin-components/RevenuePayments/RevenuePayments";
import { BookingsManagement } from "../dashboard-components/admin-components/BookingsManagement";

const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedCar, setSelectedCar] = useState<any>(null);
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
        return <AdminOverview />;

      case "user-management":
        return <UserManagement />;

      case "car-management":
        return <CarManagement />;

      case "bookings-management":
        return <BookingsManagement />;

      case "revenue":
        return <RevenuePayments />;

      case "notifications":
        return <AdminNotifications />;

      case "reports":
        return <AdminReports />;

      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Select a section from the sidebar.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar
        role="admin"
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col w-full md:ml-64">
        <TopNavbar 
          title="Admin Dashboard" 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 w-full">{renderContent()}</main>
      </div>

      <AdminModals
        selectedUser={selectedUser}
        selectedCar={selectedCar}
        onCloseUserModal={handleCloseUserModal}
        onCloseCarModal={handleCloseCarModal}
      />
    </div>
  );
};

export default AdminDashboard;
