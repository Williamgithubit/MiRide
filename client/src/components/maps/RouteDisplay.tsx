import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { Navigation, Clock, MapPin as MapPinIcon } from 'lucide-react';
import { Coordinates } from '../../types/map';
import { calculateDistance, estimateTravelTime, formatDistance, formatDuration, getCenterPoint, getZoomLevel } from '../../utils/mapUtils';
import 'leaflet/dist/leaflet.css';

interface RouteDisplayProps {
  pickupLocation: Coordinates;
  dropoffLocation: Coordinates;
  pickupName?: string;
  dropoffName?: string;
  className?: string;
}

// Custom marker icons
const pickupIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const dropoffIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const RouteDisplay: React.FC<RouteDisplayProps> = ({
  pickupLocation,
  dropoffLocation,
  pickupName = 'Pickup Location',
  dropoffName = 'Dropoff Location',
  className = ''
}) => {
  const [distance, setDistance] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [center, setCenter] = useState<LatLngExpression>([6.3156, -10.8074]);
  const [zoom, setZoom] = useState<number>(10);

  useEffect(() => {
    // Calculate distance and duration
    const dist = calculateDistance(pickupLocation, dropoffLocation);
    const dur = estimateTravelTime(dist);
    setDistance(dist);
    setDuration(dur);

    // Calculate center point and zoom level
    const centerPoint = getCenterPoint(pickupLocation, dropoffLocation);
    setCenter([centerPoint.lat, centerPoint.lng]);
    setZoom(getZoomLevel(dist));
  }, [pickupLocation, dropoffLocation]);

  // Create route line (straight line for simplicity)
  const routeLine: LatLngExpression[] = [
    [pickupLocation.lat, pickupLocation.lng],
    [dropoffLocation.lat, dropoffLocation.lng]
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Route Info Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-4 rounded-lg border border-green-200 dark:border-green-700">
          <div className="flex items-center text-green-700 dark:text-green-300 mb-2">
            <Navigation className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Distance</span>
          </div>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            {formatDistance(distance)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center text-blue-700 dark:text-blue-300 mb-2">
            <Clock className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Est. Time</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {formatDuration(duration)}
          </p>
        </div>
      </div>

      {/* Map Display */}
      <div className="rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600 shadow-lg">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '400px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Pickup Marker */}
          <Marker
            position={[pickupLocation.lat, pickupLocation.lng]}
            icon={pickupIcon}
          >
            <Popup>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <p className="font-semibold text-gray-900">Pickup</p>
                </div>
                <p className="text-sm text-gray-600">{pickupName}</p>
              </div>
            </Popup>
          </Marker>

          {/* Dropoff Marker */}
          <Marker
            position={[dropoffLocation.lat, dropoffLocation.lng]}
            icon={dropoffIcon}
          >
            <Popup>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <p className="font-semibold text-gray-900">Dropoff</p>
                </div>
                <p className="text-sm text-gray-600">{dropoffName}</p>
              </div>
            </Popup>
          </Marker>

          {/* Route Line */}
          <Polyline
            positions={routeLine}
            color="#3b82f6"
            weight={4}
            opacity={0.7}
            dashArray="10, 10"
          />
        </MapContainer>
      </div>

      {/* Location Details */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
        <div className="flex items-start">
          <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5 mr-3"></div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Pickup Location</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{pickupName}</p>
          </div>
        </div>
        <div className="flex items-start">
          <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5 mr-3"></div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Dropoff Location</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{dropoffName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteDisplay;
