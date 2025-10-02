import React from 'react';
import Modal from '../../shared/Modal';

interface AdminModalsProps {
  selectedUser: any;
  selectedCar: any;
  onCloseUserModal: () => void;
  onCloseCarModal: () => void;
}

const AdminModals: React.FC<AdminModalsProps> = ({
  selectedUser,
  selectedCar,
  onCloseUserModal,
  onCloseCarModal
}) => {
  return (
    <>
      {/* User Details Modal */}
      <Modal 
        isOpen={!!selectedUser} 
        onClose={onCloseUserModal} 
        title="User Details" 
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                  selectedUser.role === 'owner' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  selectedUser.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Join Date</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedUser.joinDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedUser.phone || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Account Actions</h4>
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Edit User
                </button>
                <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                  {selectedUser.status === 'active' ? 'Suspend' : 'Activate'}
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Car Details Modal */}
      <Modal 
        isOpen={!!selectedCar} 
        onClose={onCloseCarModal} 
        title="Car Details" 
        size="lg"
      >
        {selectedCar && (
          <div className="space-y-6">
            <img 
              src={selectedCar.image} 
              alt={selectedCar.model} 
              className="w-full h-48 object-cover rounded-lg" 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Make & Model</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedCar.year} {selectedCar.make} {selectedCar.model}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">License Plate</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedCar.licensePlate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Daily Rate</p>
                <p className="font-medium text-gray-900 dark:text-white">${selectedCar.dailyRate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  selectedCar.status === 'available' ? 'bg-green-100 text-green-800' :
                  selectedCar.status === 'rented' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedCar.status.charAt(0).toUpperCase() + selectedCar.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Transmission</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedCar.transmission || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fuel Type</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedCar.fuelType || 'Not specified'}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Car Actions</h4>
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Approve Car
                </button>
                <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                  Request Changes
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Reject Car
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default AdminModals;
