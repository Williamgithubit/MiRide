export interface Car {
  id: number;
  name?: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  licensePlate?: string;
  dailyRate?: number;
  isAvailable?: boolean;
  imageUrl?: string;
  type?: string;
  transmission?: string;
  description?: string;
  seats?: number;
  fuelType?: "Petrol" | "Electric" | "Hybrid" | "Gasoline" | "Diesel" | string;
  ownerId?: number;
  location?: string;
  features?: string[];
  rating?: number;
  reviews?: number;
  rentalPricePerDay?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Rental {
  id: number;
  carId: number;
  customerId: number;
  startDate: string;
  endDate: string;
  totalCost: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  car?: Car;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  // Add other user properties as needed
}
