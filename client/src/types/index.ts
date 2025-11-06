export interface CarImage {
  id: string;
  imageUrl: string;
  carId: number;
  isPrimary: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

// Define the possible car statuses
export type CarStatus = 'available' | 'rented' | 'maintenance' | 'pending_approval' | 'rejected' | 'inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  // Add other user properties as needed
}

export interface Car {
  id: number;
  name: string;
  brand: string;
  model: string;
  year: number;
  rentalPricePerDay: number;
  rating: number;
  reviews: number;
  seats: number;
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  location: string;
  features: string[];
  isLiked: boolean;
  isAvailable: boolean;
  status?: CarStatus; // Added status field
  ownerId?: string;
  owner?: User; // Added owner object
  description?: string; // Added description field
  imageUrl?: string; // Primary image URL for backward compatibility
  images?: CarImage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ImageUploadResponse {
  success: boolean;
  message: string;
  data: {
    images: CarImage[];
  };
}

export interface ImageDeleteResponse {
  success: boolean;
  message: string;
}

export interface SetPrimaryImagePayload {
  carId: number;
  imageId: string;
}

export interface ReorderImagesPayload {
  carId: number;
  images: Array<{ id: string; order: number }>;
}
