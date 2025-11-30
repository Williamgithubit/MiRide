import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { MapPin, Navigation, Locate, Loader } from 'lucide-react';
import { Coordinates, LocationData } from '../../types/map';
import { LIBERIA_CENTER, LIBERIA_LOCATION_COORDS, getAllLocations } from '../../utils/mapUtils';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

interface LocationPickerProps {
  selectedLocation: string | null;
  onLocationSelect: (locationName: string, coordinates: Coordinates) => void;
  label?: string;
  className?: string;
}

// Custom marker icons
const createCustomIcon = (color: string) => new Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const defaultIcon = createCustomIcon('blue');
const selectedIcon = createCustomIcon('red');

// Component to handle map clicks
function MapClickHandler({ onLocationClick }: { onLocationClick: (coords: Coordinates) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  selectedLocation,
  onLocationSelect,
  label = "Select Location",
  className = ""
}) => {
  const [locations] = useState<LocationData[]>(getAllLocations());
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([LIBERIA_CENTER.lat, LIBERIA_CENTER.lng]);
  const [showMap, setShowMap] = useState(false);
  const [manualInput, setManualInput] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    if (selectedLocation && LIBERIA_LOCATION_COORDS[selectedLocation]) {
      const coords = LIBERIA_LOCATION_COORDS[selectedLocation];
      setMapCenter([coords.lat, coords.lng]);
    }
  }, [selectedLocation]);

  const handleLocationClick = (locationName: string, coords: Coordinates) => {
    onLocationSelect(locationName, coords);
    setMapCenter([coords.lat, coords.lng]);
  };

  const handleMapClick = (coords: Coordinates) => {
    // Find nearest predefined location
    let nearestLocation = locations[0];
    let minDistance = Infinity;

    locations.forEach(loc => {
      const distance = Math.sqrt(
        Math.pow(loc.coordinates.lat - coords.lat, 2) +
        Math.pow(loc.coordinates.lng - coords.lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestLocation = loc;
      }
    });

    onLocationSelect(nearestLocation.name, nearestLocation.coordinates);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        try {
          // Reverse geocode to get address with more detail
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=10&addressdetails=1`
          );
          const data = await response.json();
          
          // Extract relevant location parts - prioritize county/state over city
          const address = data.address || {};
          const locationParts = [];
          
          // Add county or state first (most important for Liberia)
          if (address.county) locationParts.push(address.county);
          else if (address.state) locationParts.push(address.state);
          
          // Add city/town/village
          if (address.city) locationParts.push(address.city);
          else if (address.town) locationParts.push(address.town);
          else if (address.village) locationParts.push(address.village);
          
          // Add country
          if (address.country) locationParts.push(address.country);
          
          // Create location name with coordinates for accuracy
          let locationName;
          if (locationParts.length > 0) {
            locationName = `${locationParts.join(', ')} (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`;
          } else {
            locationName = `GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
          }
          
          onLocationSelect(locationName, coords);
          setMapCenter([coords.lat, coords.lng]);
          toast.success(`Location captured: ${locationParts[0] || 'GPS Coordinates'}`);
        } catch (error) {
          console.error('Error getting address:', error);
          const locationName = `GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
          onLocationSelect(locationName, coords);
          toast.success('GPS coordinates captured!');
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        toast.error('Unable to get your location. Please enable location services.');
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleManualLocationSubmit = () => {
    if (manualLocation.trim()) {
      // Use center of Liberia as default coordinates for manual entry
      onLocationSelect(manualLocation.trim(), LIBERIA_CENTER);
      setManualInput(false);
      toast.success('Location set successfully!');
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          <MapPin className="w-4 h-4 inline mr-2 text-green-600" />
          {label}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setManualInput(!manualInput)}
            className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 flex items-center"
          >
            {manualInput ? 'Use Dropdown' : 'Manual Input'}
          </button>
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
          >
            <Navigation className="w-4 h-4 mr-1" />
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
        </div>
      </div>

      {/* Manual Input or Dropdown selector */}
      {manualInput ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={manualLocation}
            onChange={(e) => setManualLocation(e.target.value)}
            placeholder="Enter location manually..."
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-gray-100 dark:bg-gray-800"
            onKeyPress={(e) => e.key === 'Enter' && handleManualLocationSubmit()}
          />
          <button
            type="button"
            onClick={handleManualLocationSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Set
          </button>
        </div>
      ) : (
        <select
          value={selectedLocation || 'default'}
          onChange={(e) => {
            const locationName = e.target.value;
            if (locationName !== 'default' && LIBERIA_LOCATION_COORDS[locationName]) {
              handleLocationClick(locationName, LIBERIA_LOCATION_COORDS[locationName]);
            }
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
        >
          <option value="default">Select location</option>
          {locations.map((location) => (
            <option key={location.name} value={location.name}>
              {location.name}
            </option>
          ))}
        </select>
      )}

      {/* GPS Location Button */}
      <div>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {isGettingLocation ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Getting your location...
            </>
          ) : (
            <>
              <Locate className="w-5 h-5" />
              Use My Current Location (GPS)
            </>
          )}
        </button>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          GPS will capture your exact coordinates with the nearest county/region
        </p>
      </div>

      {/* Interactive Map */}
      {showMap && (
        <div className="rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600">
          <MapContainer
            center={mapCenter}
            zoom={10}
            style={{ height: '400px', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onLocationClick={handleMapClick} />
            
            {locations.map((location) => (
              <Marker
                key={location.name}
                position={[location.coordinates.lat, location.coordinates.lng]}
                icon={selectedLocation === location.name ? selectedIcon : defaultIcon}
                eventHandlers={{
                  click: () => handleLocationClick(location.name, location.coordinates),
                }}
              >
                <Popup>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">{location.name}</p>
                    <button
                      onClick={() => handleLocationClick(location.name, location.coordinates)}
                      className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Select Location
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {selectedLocation && (
        <div className="flex items-center text-sm text-green-600 dark:text-green-400">
          <MapPin className="w-4 h-4 mr-1" />
          <span>Selected: {selectedLocation}</span>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
