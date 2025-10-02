import React, { useState } from 'react';
import Sidebar from '../shared/Sidebar';
import TopNavbar from '../shared/TopNavbar';
import { 
  AdminOverview, 
  UserManagement, 
  CarManagement, 
  AdminModals 
} from '../dashboard-components/admin-components';
import {BookingsManagement} from "../dashboard-components/admin-components/BookingsManagement"

const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedCar, setSelectedCar] = useState<any>(null);

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
      case 'overview':
        return <AdminOverview />;

      case 'user-management':
        return <UserManagement />;

      case 'car-management':
        return <CarManagement />;
      
      case 'bookings-management':
        return <BookingsManagement/>

      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Select a section from the sidebar.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar role="admin" activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <TopNavbar title="Admin Dashboard" />
        <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
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
