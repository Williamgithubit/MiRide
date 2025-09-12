import React, { useState } from 'react';
import { Users, Car, DollarSign, TrendingUp, CheckCircle, XCircle, Eye, Edit, Trash2 } from 'lucide-react';
import Sidebar from '../shared/Sidebar';
import TopNavbar from '../shared/TopNavbar';
import DashboardCard from '../shared/DashboardCard';
import Table from '../shared/Table';
import Chart from '../shared/Chart';
import Modal from '../shared/Modal';
import { mockUsers, mockCars, mockRentals, mockAnalytics, revenueChartData, bookingTrendsData } from '../shared/mockData';

const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedCar, setSelectedCar] = useState<any>(null);

  const userColumns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true
    },
    {
      key: 'email',
      label: 'Email'
    },
    {
      key: 'role',
      label: 'Role',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'admin' ? 'bg-purple-100 text-purple-800' :
          value === 'owner' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'joinDate',
      label: 'Join Date',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex space-x-2">
          <button onClick={() => setSelectedUser(row)} className="p-1 text-blue-600 hover:bg-blue-100 rounded">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-1 text-green-600 hover:bg-green-100 rounded">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-1 text-red-600 hover:bg-red-100 rounded">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const carColumns = [
    {
      key: 'image',
      label: 'Car',
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-3">
          <img src={value} alt={row.model} className="w-12 h-12 rounded-lg object-cover" />
          <div>
            <p className="font-medium">{row.year} {row.make} {row.model}</p>
            <p className="text-sm text-gray-500">{row.licensePlate}</p>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'available' ? 'bg-green-100 text-green-800' :
          value === 'rented' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'dailyRate',
      label: 'Daily Rate',
      render: (value: number) => `$${value}`
    },
    {
      key: 'ownerId',
      label: 'Owner',
      render: (value: number) => {
        const owner = mockUsers.find(u => u.id === value);
        return owner?.name || 'Unknown';
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex space-x-2">
          <button onClick={() => setSelectedCar(row)} className="p-1 text-blue-600 hover:bg-blue-100 rounded">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-1 text-green-600 hover:bg-green-100 rounded">
            <CheckCircle className="w-4 h-4" />
          </button>
          <button className="p-1 text-red-600 hover:bg-red-100 rounded">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard
                title="Total Users"
                value={mockAnalytics.totalUsers.toLocaleString()}
                icon={Users}
                change={{ value: mockAnalytics.userGrowth, type: 'increase' }}
              />
              <DashboardCard
                title="Active Cars"
                value={mockAnalytics.activeCars}
                icon={Car}
                change={{ value: 5.2, type: 'increase' }}
              />
              <DashboardCard
                title="Total Revenue"
                value={`$${mockAnalytics.totalRevenue.toLocaleString()}`}
                icon={DollarSign}
                change={{ value: mockAnalytics.revenueGrowth, type: 'increase' }}
              />
              <DashboardCard
                title="Active Rentals"
                value={mockAnalytics.activeRentals}
                icon={TrendingUp}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Chart
                type="line"
                data={revenueChartData}
                options={{ plugins: { title: { display: true, text: 'Platform Revenue' } } }}
              />
              <Chart
                type="bar"
                data={bookingTrendsData}
                options={{ plugins: { title: { display: true, text: 'Weekly Booking Trends' } } }}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold mb-4">Recent Users</h4>
                <div className="space-y-3">
                  {mockUsers.slice(0, 5).map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'owner' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold mb-4">System Stats</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Car Utilization</span>
                    <span className="font-semibold">{mockAnalytics.carUtilization}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Users</span>
                    <span className="font-semibold">{mockAnalytics.activeUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Revenue</span>
                    <span className="font-semibold">${mockAnalytics.monthlyRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Rentals</span>
                    <span className="font-semibold">{mockAnalytics.totalRentals}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'user-management':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Management</h3>
            <Table columns={userColumns} data={mockUsers} searchable filterable />
          </div>
        );

      case 'car-management':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Car Management</h3>
            <Table columns={carColumns} data={mockCars} searchable filterable />
          </div>
        );

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

      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Details" size="lg">
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Name</p><p className="font-medium">{selectedUser.name}</p></div>
              <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{selectedUser.email}</p></div>
              <div><p className="text-sm text-gray-500">Role</p><p className="font-medium">{selectedUser.role}</p></div>
              <div><p className="text-sm text-gray-500">Status</p><p className="font-medium">{selectedUser.status}</p></div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!selectedCar} onClose={() => setSelectedCar(null)} title="Car Details" size="lg">
        {selectedCar && (
          <div className="space-y-4">
            <img src={selectedCar.image} alt={selectedCar.model} className="w-full h-48 object-cover rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Make & Model</p><p className="font-medium">{selectedCar.year} {selectedCar.make} {selectedCar.model}</p></div>
              <div><p className="text-sm text-gray-500">License Plate</p><p className="font-medium">{selectedCar.licensePlate}</p></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
