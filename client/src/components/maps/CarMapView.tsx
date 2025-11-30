import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon, LatLngExpression, DivIcon } from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { Car, MapPin, DollarSign, Users, Navigation2 } from 'lucide-react';
import { CarLocation, Coordinates } from '../../types/map';
import { LIBERIA_CENTER, calculateDistance, formatDistance, generateNearbyCoords, LIBERIA_LOCATION_COORDS } from '../../utils/mapUtils';
import 'leaflet/dist/leaflet.css';

interface CarMapViewProps {
  cars: any[];
  userLocation?: Coordinates | null;
  proximityRadius?: number; // in kilometers
  onCarSelect?: (carId: number) => void;
  className?: string;
}

// Create custom car marker icon
const createCarMarkerIcon = (price: number, isAvailable: boolean) => {
  const color = isAvailable ? '#10b981' : '#ef4444';
  const bgColor = isAvailable ? '#d1fae5' : '#fee2e2';
  
  return new DivIcon({
    html: `
      <div style="
        background-color: ${bgColor};
        border: 2px solid ${color};
        border-radius: 20px;
        padding: 4px 8px;
        font-weight: 600;
        font-size: 12px;
        color: ${color};
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      ">
        $${price}
      </div>
    `,
    className: 'custom-car-marker',
    iconSize: [60, 30],
    iconAnchor: [30, 30],
  });
};

// User location marker
const userLocationIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const CarMapView: React.FC<CarMapViewProps> = ({
  cars,
  userLocation,
  proximityRadius = 10,
  onCarSelect,
  className = ''
}) => {
  const navigate = useNavigate();
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([LIBERIA_CENTER.lat, LIBERIA_CENTER.lng]);
  const [zoom, setZoom] = useState<number>(10);

  // Generate car locations (in real app, this would come from backend)
  const carLocations: CarLocation[] = useMemo(() => {
    return cars.map(car => {
      // Try to get location from car data, otherwise generate random location
      let coords: Coordinates;
      
      if (car.location && typeof car.location === 'string' && LIBERIA_LOCATION_COORDS[car.location]) {
        coords = LIBERIA_LOCATION_COORDS[car.location];
      } else {
        // Generate random location near Monrovia
        coords = generateNearbyCoords(LIBERIA_CENTER, 15);
      }

      return {
        carId: car.id,
        brand: car.brand || car.make,
        model: car.model,
        year: car.year,
        imageUrl: car.imageUrl,
        rentalPricePerDay: car.rentalPricePerDay || car.dailyRate || 0,
        isAvailable: car.isAvailable !== false,
        lat: coords.lat,
        lng: coords.lng
      };
    });
  }, [cars]);

  // Filter cars by proximity if user location is provided
  const filteredCarLocations = useMemo(() => {
    if (!userLocation) return carLocations;

    return carLocations.filter(car => {
      const distance = calculateDistance(userLocation, { lat: car.lat, lng: car.lng });
      return distance <= proximityRadius;
    });
  }, [carLocations, userLocation, proximityRadius]);

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
      setZoom(12);
    } else if (filteredCarLocations.length > 0) {
      // Center on first car
      setMapCenter([filteredCarLocations[0].lat, filteredCarLocations[0].lng]);
    }
  }, [userLocation, filteredCarLocations]);

  const handleCarClick = (carId: number) => {
    if (onCarSelect) {
      onCarSelect(carId);
    } else {
      navigate(`/car/${carId}`);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Map Stats */}
      <div className="absolute top-4 left-4 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 space-y-2">
        <div className="flex items-center text-sm">
          <Car className="w-4 h-4 mr-2 text-green-600" />
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {filteredCarLocations.length} cars available
          </span>
        </div>
        {userLocation && (
          <div className="flex items-center text-sm">
            <Navigation2 className="w-4 h-4 mr-2 text-blue-600" />
            <span className="text-gray-600 dark:text-gray-400">
              Within {proximityRadius}km
            </span>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600 shadow-lg">
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          style={{ height: '600px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Location Marker */}
          {userLocation && (
            <>
              <Marker
                position={[userLocation.lat, userLocation.lng]}
                icon={userLocationIcon}
              >
                <Popup>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">Your Location</p>
                  </div>
                </Popup>
              </Marker>
              
              {/* Proximity Circle */}
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={proximityRadius * 1000} // Convert km to meters
                pathOptions={{
                  color: '#3b82f6',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.1,
                  weight: 2,
                  dashArray: '5, 5'
                }}
              />
            </>
          )}

          {/* Car Markers */}
          {filteredCarLocations.map((car) => {
            const distance = userLocation 
              ? calculateDistance(userLocation, { lat: car.lat, lng: car.lng })
              : null;

            return (
              <Marker
                key={car.carId}
                position={[car.lat, car.lng]}
                icon={createCarMarkerIcon(car.rentalPricePerDay, car.isAvailable)}
                eventHandlers={{
                  click: () => handleCarClick(car.carId),
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    {car.imageUrl && (
                      <img
                        src={car.imageUrl}
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/car-placeholder.jpg';
                        }}
                      />
                    )}
                    
                    <h3 className="font-bold text-gray-900 mb-2">
                      {car.year} {car.brand} {car.model}
                    </h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-semibold text-green-600">
                          ${car.rentalPricePerDay}/day
                        </span>
                      </div>
                      
                      {distance !== null && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Distance:</span>
                          <span className="font-medium text-blue-600">
                            {formatDistance(distance)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${car.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                          {car.isAvailable ? 'Available' : 'Booked'}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleCarClick(car.carId)}
                      className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Map Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-200 border-2 border-green-500 rounded mr-2"></div>
            <span className="text-gray-700 dark:text-gray-300">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-200 border-2 border-red-500 rounded mr-2"></div>
            <span className="text-gray-700 dark:text-gray-300">Booked</span>
          </div>
          {userLocation && (
            <>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">Your Location</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-blue-500 border-dashed rounded-full mr-2"></div>
                <span className="text-gray-700 dark:text-gray-300">Search Radius</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarMapView;
