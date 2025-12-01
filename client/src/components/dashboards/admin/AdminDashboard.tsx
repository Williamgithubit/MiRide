import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../shared/Sidebar";
import TopNavbar from "../shared/TopNavbar";
import { checkTermsStatus } from "../../../store/Terms/termsSlice";
import { AppDispatch, RootState } from "../../../store/store";
import TermsModal from "../../shared/TermsModal";
import {
  AdminOverview,
  UserManagement,
  CarManagement,
  AdminModals,
  AdminNotifications,
  AdminReports,
  AdminSettings,
} from "../dashboard-components/admin-components";
import EnhancedRevenueSection from "../dashboard-components/admin-components/RevenuePayments/EnhancedRevenueSection";
import { BookingsManagement } from "../dashboard-components/admin-components/BookingsManagement";

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { termsAccepted } = useSelector((state: RootState) => state.terms);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check terms status on mount
  useEffect(() => {
    if (user) {
      dispatch(checkTermsStatus());
    }
  }, [dispatch, user]);

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
        return <EnhancedRevenueSection />;

      case "notifications":
        return <AdminNotifications />;

      case "reports":
        return <AdminReports />;

      case "settings":
        return <AdminSettings />;

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
    <>
      <TermsModal isOpen={!termsAccepted} userRole={user?.role || 'admin'} />
      
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
    </>
  );
};

export default AdminDashboard;
