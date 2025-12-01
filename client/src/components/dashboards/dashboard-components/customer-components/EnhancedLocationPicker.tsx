import React, { useState } from 'react';
import { MapPin, Navigation, Map, X } from 'lucide-react';
import { LIBERIA_LOCATIONS } from '../../../../constants/locations';

interface EnhancedLocationPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const EnhancedLocationPicker: React.FC<EnhancedLocationPickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Select location',
  disabled = false,
}) => {
  const [inputMode, setInputMode] = useState<'select' | 'manual' | 'gps'>('select');
  const [manualInput, setManualInput] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Handle GPS location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use reverse geocoding to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          onChange(address);
          setInputMode('manual');
          setManualInput(address);
        } catch (error) {
          console.error('Error getting address:', error);
          onChange(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location. Please enter manually.');
        setIsGettingLocation(false);
      }
    );
  };

  // Handle manual input
  const handleManualInputChange = (val: string) => {
    setManualInput(val);
    onChange(val);
  };

  // Handle mode switch
  const switchToManual = () => {
    setInputMode('manual');
    setManualInput(value !== 'default' ? value : '');
  };

  const switchToSelect = () => {
    setInputMode('select');
    setManualInput('');
  };

  return (
    <div className={`${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <label className="block text-sm font-medium mb-2 flex items-center justify-between text-gray-700 dark:text-gray-300">
        <span className="flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-blue-600" />
          {label}
        </span>
        <div className="flex items-center space-x-2 text-xs font-normal">
          <button
            type="button"
            onClick={switchToManual}
            className={`px-2 py-1 rounded ${
              inputMode === 'manual'
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
                : 'text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/30'
            }`}
          >
            Manual Input
          </button>
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 px-2 py-1 rounded flex items-center"
          >
            <Map className="w-3 h-3 mr-1" />
            Show Map
          </button>
        </div>
      </label>

      {/* Select Mode */}
      {inputMode === 'select' && (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="default">{placeholder}</option>
          {LIBERIA_LOCATIONS.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      )}

      {/* Manual Input Mode */}
      {inputMode === 'manual' && (
        <div className="space-y-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => handleManualInputChange(e.target.value)}
            placeholder="Enter address or location"
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            type="button"
            onClick={switchToSelect}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Switch to dropdown
          </button>
        </div>
      )}

      {/* GPS Button */}
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={disabled || isGettingLocation}
        className="mt-2 w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Navigation className={`w-4 h-4 ${isGettingLocation ? 'animate-pulse' : ''}`} />
        <span>{isGettingLocation ? 'Getting location...' : 'Use My Current Location (GPS)'}</span>
      </button>

      {/* GPS Helper Text */}
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        GPS will capture your exact coordinates with the nearest county/region
      </p>

      {/* Map Modal */}
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Location on Map</h3>
              <button
                onClick={() => setShowMap(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg h-96 flex items-center justify-center">
                <div className="text-center">
                  <Map className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Map integration coming soon
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    For now, use GPS or manual input
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedLocationPicker;
