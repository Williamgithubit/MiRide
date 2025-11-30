// Map utility functions for MiRide
import { Coordinates, LocationData } from '../types/map';

// Liberia location coordinates
export const LIBERIA_LOCATION_COORDS: Record<string, Coordinates> = {
  'Monrovia - Roberts International Airport': { lat: 6.2337, lng: -10.3623 },
  'Monrovia - City Center': { lat: 6.3156, lng: -10.8074 },
  'Paynesville - Red Light': { lat: 6.2897, lng: -10.7036 },
  'Sinkor - Tubman Boulevard': { lat: 6.3208, lng: -10.7945 },
  'Congo Town': { lat: 6.3333, lng: -10.8000 },
  'Buchanan - Grand Bassa': { lat: 5.8808, lng: -10.0467 },
  'Gbarnga - Bong County': { lat: 6.9958, lng: -9.4722 },
  'Kakata - Margibi County': { lat: 6.5297, lng: -10.3528 },
};

// Default center for Liberia (Monrovia)
export const LIBERIA_CENTER: Coordinates = { lat: 6.3156, lng: -10.8074 };

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

// Convert degrees to radians
const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// Estimate travel time based on distance (average speed 40 km/h in Liberia)
export const estimateTravelTime = (distanceKm: number): number => {
  const averageSpeedKmh = 40;
  return Math.round((distanceKm / averageSpeedKmh) * 60); // Return minutes
};

// Get location name from coordinates (reverse lookup)
export const getLocationNameFromCoords = (coords: Coordinates): string | null => {
  const threshold = 0.01; // Approximately 1km
  
  for (const [name, location] of Object.entries(LIBERIA_LOCATION_COORDS)) {
    const distance = calculateDistance(coords, location);
    if (distance < threshold) {
      return name;
    }
  }
  
  return null;
};

// Get coordinates from location name
export const getCoordsFromLocationName = (locationName: string): Coordinates | null => {
  return LIBERIA_LOCATION_COORDS[locationName] || null;
};

// Format distance for display
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
};

// Format duration for display
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

// Check if coordinates are within Liberia bounds
export const isWithinLiberia = (coords: Coordinates): boolean => {
  // Approximate Liberia bounds
  const bounds = {
    north: 8.55,
    south: 4.35,
    west: -11.50,
    east: -7.37
  };
  
  return (
    coords.lat >= bounds.south &&
    coords.lat <= bounds.north &&
    coords.lng >= bounds.west &&
    coords.lng <= bounds.east
  );
};

// Generate random coordinates near a location (for demo purposes)
export const generateNearbyCoords = (center: Coordinates, radiusKm: number = 5): Coordinates => {
  const radiusInDegrees = radiusKm / 111; // Rough conversion
  
  const u = Math.random();
  const v = Math.random();
  const w = radiusInDegrees * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);
  
  return {
    lat: center.lat + y,
    lng: center.lng + x
  };
};

// Get all location data
export const getAllLocations = (): LocationData[] => {
  return Object.entries(LIBERIA_LOCATION_COORDS).map(([name, coordinates]) => ({
    name,
    coordinates,
    address: name
  }));
};

// Calculate center point between two coordinates
export const getCenterPoint = (coord1: Coordinates, coord2: Coordinates): Coordinates => {
  return {
    lat: (coord1.lat + coord2.lat) / 2,
    lng: (coord1.lng + coord2.lng) / 2
  };
};

// Get zoom level based on distance
export const getZoomLevel = (distanceKm: number): number => {
  if (distanceKm < 5) return 13;
  if (distanceKm < 10) return 12;
  if (distanceKm < 20) return 11;
  if (distanceKm < 50) return 10;
  if (distanceKm < 100) return 9;
  return 8;
};
