// User and profile interfaces for the new model structure

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'owner' | 'admin';
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  driverLicense?: string;
  address?: string;
  preferredPaymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OwnerProfile {
  id: string;
  userId: string;
  businessName?: string;
  businessAddress?: string;
  taxId?: string;
  businessPhone?: string;
  businessEmail?: string;
  createdAt: string;
  updatedAt: string;
}

// Combined user types with profile data
export interface CustomerUser extends User {
  driverLicense?: string;
  address?: string;
  preferredPaymentMethod?: string;
  customerProfile?: CustomerProfile;
}

export interface OwnerUser extends User {
  businessName?: string;
  businessAddress?: string;
  taxId?: string;
  businessPhone?: string;
  businessEmail?: string;
  ownerProfile?: OwnerProfile;
}

// Type guard functions
export const isCustomerUser = (user: User): user is CustomerUser => {
  return user.role === 'customer';
};

export const isOwnerUser = (user: User): user is OwnerUser => {
  return user.role === 'owner';
};

// Auth response types
export interface AuthResponse {
  message: string;
  user: User | CustomerUser | OwnerUser;
  token: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'customer' | 'owner' | 'admin';
  // Customer-specific fields
  driverLicense?: string;
  address?: string;
  // Owner-specific fields
  businessName?: string;
  businessAddress?: string;
  taxId?: string;
  businessPhone?: string;
  businessEmail?: string;
}

export interface LoginData {
  email: string;
  password: string;
}
