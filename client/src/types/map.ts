// Map-related types for MiRide

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationData {
  name: string;
  coordinates: Coordinates;
  address?: string;
}

export interface CarLocation extends Coordinates {
  carId: number;
  brand: string;
  model: string;
  year: number;
  imageUrl?: string;
  rentalPricePerDay: number;
  isAvailable: boolean;
}

export interface RouteInfo {
  distance: number; // in kilometers
  duration: number; // in minutes
  coordinates: Coordinates[];
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface TrackingData {
  rentalId: number;
  currentLocation: Coordinates;
  lastUpdated: Date;
  isMoving: boolean;
  speed?: number;
}
