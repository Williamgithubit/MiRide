// Mock data for dashboard components
export const mockCars = [
  {
    id: 1,
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    licensePlate: 'ABC123',
    status: 'available',
    dailyRate: 45,
    location: 'Downtown',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
    totalRentals: 24,
    totalEarnings: 1080,
    rating: 4.8,
    ownerId: 1,
  },
  {
    id: 2,
    make: 'Honda',
    model: 'Civic',
    year: 2021,
    licensePlate: 'XYZ789',
    status: 'rented',
    dailyRate: 40,
    location: 'Airport',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400',
    totalRentals: 18,
    totalEarnings: 720,
    rating: 4.6,
    ownerId: 1,
  },
  {
    id: 3,
    make: 'BMW',
    model: 'X5',
    year: 2023,
    licensePlate: 'BMW001',
    status: 'maintenance',
    dailyRate: 85,
    location: 'City Center',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400',
    totalRentals: 12,
    totalEarnings: 1020,
    rating: 4.9,
    ownerId: 2,
  },
];

export const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'owner',
    phone: '+1234567890',
    joinDate: '2023-01-15',
    status: 'active',
    totalEarnings: 1800,
    carsListed: 2,
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'customer',
    phone: '+1234567891',
    joinDate: '2023-03-20',
    status: 'active',
    totalRentals: 5,
    totalSpent: 850,
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'owner',
    phone: '+1234567892',
    joinDate: '2023-02-10',
    status: 'active',
    totalEarnings: 1020,
    carsListed: 1,
  },
];

export const mockRentals = [
  {
    id: 1,
    carId: 1,
    customerId: 2,
    customerName: 'Jane Smith',
    carDetails: '2022 Toyota Camry',
    startDate: '2024-01-15',
    endDate: '2024-01-20',
    totalCost: 225,
    status: 'completed',
    paymentStatus: 'paid',
  },
  {
    id: 2,
    carId: 2,
    customerId: 2,
    customerName: 'Jane Smith',
    carDetails: '2021 Honda Civic',
    startDate: '2024-01-25',
    endDate: '2024-01-30',
    totalCost: 200,
    status: 'active',
    paymentStatus: 'paid',
  },
  {
    id: 3,
    carId: 3,
    customerId: 4,
    customerName: 'Sarah Wilson',
    carDetails: '2023 BMW X5',
    startDate: '2024-02-01',
    endDate: '2024-02-05',
    totalCost: 340,
    status: 'pending',
    paymentStatus: 'pending',
  },
];

export const mockEarnings = {
  monthly: [
    { month: 'Jan', amount: 1200 },
    { month: 'Feb', amount: 1500 },
    { month: 'Mar', amount: 1800 },
    { month: 'Apr', amount: 1300 },
    { month: 'May', amount: 2000 },
    { month: 'Jun', amount: 1700 },
  ],
  daily: [
    { date: '2024-01-01', amount: 45 },
    { date: '2024-01-02', amount: 85 },
    { date: '2024-01-03', amount: 0 },
    { date: '2024-01-04', amount: 40 },
    { date: '2024-01-05', amount: 125 },
    { date: '2024-01-06', amount: 85 },
    { date: '2024-01-07', amount: 45 },
  ],
};

export const mockAnalytics = {
  totalUsers: 1250,
  activeUsers: 890,
  totalCars: 450,
  activeCars: 320,
  totalRentals: 2100,
  activeRentals: 85,
  totalRevenue: 125000,
  monthlyRevenue: 15000,
  userGrowth: 12.5,
  revenueGrowth: 8.3,
  carUtilization: 71.1,
};

export const mockNotifications = [
  {
    id: 1,
    type: 'booking',
    title: 'New Booking Request',
    message: 'Jane Smith wants to book your Toyota Camry',
    time: '5 min ago',
    unread: true,
  },
  {
    id: 2,
    type: 'payment',
    title: 'Payment Received',
    message: 'Payment of $225 received for booking #1001',
    time: '1 hour ago',
    unread: true,
  },
  {
    id: 3,
    type: 'maintenance',
    title: 'Maintenance Reminder',
    message: 'BMW X5 is due for maintenance check',
    time: '2 hours ago',
    unread: false,
  },
];

export const mockReviews = [
  {
    id: 1,
    carId: 1,
    customerName: 'Jane Smith',
    rating: 5,
    comment: 'Excellent car and great service!',
    date: '2024-01-21',
  },
  {
    id: 2,
    carId: 1,
    customerName: 'Bob Johnson',
    rating: 4,
    comment: 'Good car, clean and reliable.',
    date: '2024-01-15',
  },
  {
    id: 3,
    carId: 2,
    customerName: 'Alice Brown',
    rating: 5,
    comment: 'Perfect for city driving!',
    date: '2024-01-10',
  },
];

// Chart data
export const revenueChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Revenue',
      data: [1200, 1500, 1800, 1300, 2000, 1700],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
    },
  ],
};

export const carStatusChartData = {
  labels: ['Available', 'Rented', 'Maintenance'],
  datasets: [
    {
      data: [65, 25, 10],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(245, 158, 11, 1)',
      ],
      borderWidth: 2,
    },
  ],
};

export const bookingTrendsData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Bookings',
      data: [12, 19, 15, 25, 22, 30, 28],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
    },
  ],
};
