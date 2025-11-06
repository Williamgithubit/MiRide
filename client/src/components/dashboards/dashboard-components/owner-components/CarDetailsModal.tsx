import React, { useState, useMemo } from 'react';
import Modal from '../../shared/Modal';
import { Car, CarImage } from '../../../../store/Car/carApi';

interface CarDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCar: Car | null;
}

const CarDetailsModal: React.FC<CarDetailsModalProps> = ({ isOpen, onClose, selectedCar }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Helper function to get image URL
  const getImageUrl = (imageUrl: string | undefined): string => {
    if (!imageUrl) return '/placeholder-car.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/uploads')) return `http://localhost:3000${imageUrl}`;
    return imageUrl;
  };

  // Get car images array
  const carImages: string[] = useMemo(() => {
    if (!selectedCar) return [];
    
    // If car has images array, use those
    if (selectedCar.images && Array.isArray(selectedCar.images) && selectedCar.images.length > 0) {
      // Create a copy of the array before sorting to avoid mutating the original
      return [...selectedCar.images]
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((img: CarImage) => getImageUrl(img.imageUrl));
    }
    
    // Fallback to imageUrl if available
    if (selectedCar.imageUrl) {
      return [getImageUrl(selectedCar.imageUrl)];
    }
    
    return ['/placeholder-car.jpg'];
  }, [selectedCar]);

  // Reset image index when modal opens with new car
  React.useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedCar]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Car Details" 
      size="lg"
    >
      {selectedCar && (
        <div className="space-y-4">
          {/* Image Carousel */}
          <div className="relative">
            <img
              src={carImages[currentImageIndex] || '/placeholder-car.jpg'}
              alt={selectedCar.model}
              className="w-full h-32 sm:h-48 object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-car.jpg';
              }}
            />
            
            {/* Navigation Arrows - Only show if multiple images */}
            {carImages.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : carImages.length - 1)}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-white shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev < carImages.length - 1 ? prev + 1 : 0)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-white shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* Image Counter */}
                <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-0.5 rounded-full text-xs">
                  {currentImageIndex + 1} / {carImages.length}
                </div>
              </>
            )}
          </div>
          
          {/* Thumbnail Images - Only show if multiple images */}
          {carImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {carImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 ${
                    currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-sm text-gray-500">Make & Model</p>
              <p className="font-medium">{selectedCar.year} {selectedCar.brand} {selectedCar.model}</p>
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
