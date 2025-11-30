import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup, Polyline } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { Navigation, AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';
import { Coordinates, TrackingData } from '../../types/map';
import { calculateDistance, formatDistance, LIBERIA_CENTER } from '../../utils/mapUtils';
import 'leaflet/dist/leaflet.css';

interface RentalTrackerProps {
  rentalId: number;
  carInfo: {
    brand: string;
    model: string;
    year: number;
    imageUrl?: string;
  };
  pickupLocation: Coordinates;
  dropoffLocation: Coordinates;
  geofenceRadius?: number; // in kilometers
  onGeofenceViolation?: () => void;
  className?: string;
}

// Custom marker icons
const carIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const pickupIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  shadowSize: [33, 33]
});

const dropoffIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  shadowSize: [33, 33]
});

const RentalTracker: React.FC<RentalTrackerProps> = ({
  rentalId,
  carInfo,
  pickupLocation,
  dropoffLocation,
  geofenceRadius = 50,
  onGeofenceViolation,
  className = ''
}) => {
  const [currentLocation, setCurrentLocation] = useState<Coordinates>(pickupLocation);
  const [isMoving, setIsMoving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isOutsideGeofence, setIsOutsideGeofence] = useState(false);
  const [travelPath, setTravelPath] = useState<Coordinates[]>([pickupLocation]);

  // Simulate real-time tracking (in production, this would be WebSocket/API polling)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate car movement (for demo purposes)
      // In production, fetch real GPS data from backend
      simulateMovement();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [currentLocation]);

  // Check geofence violations
  useEffect(() => {
    const distanceFromPickup = calculateDistance(currentLocation, pickupLocation);
    const outsideGeofence = distanceFromPickup > geofenceRadius;
    
    if (outsideGeofence && !isOutsideGeofence) {
      setIsOutsideGeofence(true);
      if (onGeofenceViolation) {
        onGeofenceViolation();
      }
    } else if (!outsideGeofence && isOutsideGeofence) {
      setIsOutsideGeofence(false);
    }
  }, [currentLocation, pickupLocation, geofenceRadius, isOutsideGeofence, onGeofenceViolation]);

  const simulateMovement = () => {
    // Simulate random movement (for demo)
    // In production, this would be replaced with actual GPS data
    setCurrentLocation(prev => ({
      lat: prev.lat + (Math.random() - 0.5) * 0.01,
      lng: prev.lng + (Math.random() - 0.5) * 0.01
    }));
    
    setIsMoving(Math.random() > 0.3);
    setLastUpdated(new Date());
    
    // Add to travel path
    setTravelPath(prev => [...prev, currentLocation].slice(-50)); // Keep last 50 points
  };

  const distanceFromPickup = calculateDistance(currentLocation, pickupLocation);
  const distanceToDropoff = calculateDistance(currentLocation, dropoffLocation);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg border-2 ${
          isMoving 
            ? 'bg-green-50 border-green-300 dark:bg-green-900 dark:border-green-700' 
            : 'bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-600'
        }`}>
          <div className="flex items-center mb-2">
            <Navigation className={`w-5 h-5 mr-2 ${isMoving ? 'text-green-600' : 'text-gray-500'}`} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
          </div>
          <p className={`text-lg font-bold ${isMoving ? 'text-green-900 dark:text-green-100' : 'text-gray-900 dark:text-gray-100'}`}>
            {isMoving ? 'Moving' : 'Stationary'}
          </p>
        </div>

        <div className={`p-4 rounded-lg border-2 ${
          isOutsideGeofence 
            ? 'bg-red-50 border-red-300 dark:bg-red-900 dark:border-red-700' 
            : 'bg-blue-50 border-blue-300 dark:bg-blue-900 dark:border-blue-700'
        }`}>
          <div className="flex items-center mb-2">
            {isOutsideGeofence ? (
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
            ) : (
              <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Geofence</span>
          </div>
          <p className={`text-lg font-bold ${
            isOutsideGeofence 
              ? 'text-red-900 dark:text-red-100' 
              : 'text-blue-900 dark:text-blue-100'
          }`}>
            {isOutsideGeofence ? 'Outside Zone' : 'Within Zone'}
          </p>
        </div>

        <div className="p-4 rounded-lg border-2 bg-purple-50 border-purple-300 dark:bg-purple-900 dark:border-purple-700">
          <div className="flex items-center mb-2">
            <Clock className="w-5 h-5 mr-2 text-purple-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Update</span>
          </div>
          <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
            {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Distance Info */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">From Pickup</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {formatDistance(distanceFromPickup)}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">To Dropoff</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {formatDistance(distanceToDropoff)}
            </p>
          </div>
        </div>
      </div>

      {/* Map Display */}
      <div className="rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600 shadow-lg">
        <MapContainer
          center={[currentLocation.lat, currentLocation.lng]}
          zoom={11}
          style={{ height: '500px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Geofence Circle */}
          <Circle
            center={[pickupLocation.lat, pickupLocation.lng]}
            radius={geofenceRadius * 1000}
            pathOptions={{
              color: isOutsideGeofence ? '#ef4444' : '#3b82f6',
              fillColor: isOutsideGeofence ? '#ef4444' : '#3b82f6',
              fillOpacity: 0.1,
              weight: 2,
              dashArray: '10, 5'
            }}
          />

          {/* Pickup Location */}
          <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={pickupIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-gray-900">Pickup Location</p>
              </div>
            </Popup>
          </Marker>

          {/* Dropoff Location */}
          <Marker position={[dropoffLocation.lat, dropoffLocation.lng]} icon={dropoffIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-gray-900">Dropoff Location</p>
              </div>
            </Popup>
          </Marker>

          {/* Current Car Location */}
          <Marker position={[currentLocation.lat, currentLocation.lng]} icon={carIcon}>
            <Popup>
              <div className="min-w-[200px]">
                {carInfo.imageUrl && (
                  <img
                    src={carInfo.imageUrl}
                    alt={`${carInfo.brand} ${carInfo.model}`}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                )}
                <h3 className="font-bold text-gray-900 mb-2">
                  {carInfo.year} {carInfo.brand} {carInfo.model}
                </h3>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">
                    Status: <span className={`font-medium ${isMoving ? 'text-green-600' : 'text-gray-900'}`}>
                      {isMoving ? 'Moving' : 'Stationary'}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    Updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Travel Path */}
          {travelPath.length > 1 && (
            <Polyline
              positions={travelPath.map(coord => [coord.lat, coord.lng] as LatLngExpression)}
              color="#8b5cf6"
              weight={3}
              opacity={0.6}
            />
          )}
        </MapContainer>
      </div>

      {/* Alerts */}
      {isOutsideGeofence && (
        <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <h4 className="font-semibold text-red-900 dark:text-red-100">Geofence Alert</h4>
              <p className="text-sm text-red-700 dark:text-red-200">
                Vehicle has moved {formatDistance(distanceFromPickup)} from the pickup location, 
                exceeding the {geofenceRadius}km geofence radius.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 p-4 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> This is a demo of real-time tracking. In production, 
          GPS data would be provided by the vehicle's tracking device and updated via WebSocket connection.
        </p>
      </div>
    </div>
  );
};

export default RentalTracker;
