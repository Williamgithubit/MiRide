import React from 'react';
import Modal from '../../shared/Modal';
import { Car } from '../../../../store/Car/carApi';

interface CarDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCar: Car | null;
}

const CarDetailsModal: React.FC<CarDetailsModalProps> = ({ isOpen, onClose, selectedCar }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Car Details" 
      size="lg"
    >
      {selectedCar && (
        <div className="space-y-4">
          <img
            src={selectedCar.imageUrl || '/placeholder-car.jpg'}
            alt={selectedCar.model}
            className="w-full h-32 sm:h-48 object-cover rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-car.jpg';
            }}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-sm text-gray-500">Make & Model</p>
              <p className="font-medium">{selectedCar.year} {selectedCar.make} {selectedCar.model}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Car Name</p>
              <p className="font-medium">{selectedCar.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Daily Rate</p>
              <p className="font-medium">${selectedCar.rentalPricePerDay}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedCar.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {selectedCar.isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{selectedCar.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Seats</p>
              <p className="font-medium">{selectedCar.seats}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fuel Type</p>
              <p className="font-medium">{selectedCar.fuelType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Rating</p>
              <p className="font-medium">⭐ {
                selectedCar.rating 
                  ? (typeof selectedCar.rating === 'number' ? selectedCar.rating : parseFloat(selectedCar.rating) || 0).toFixed(1)
                  : '0.0'
              }</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Reviews</p>
              <p className="font-medium">{selectedCar.reviews || 0}</p>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CarDetailsModal;
