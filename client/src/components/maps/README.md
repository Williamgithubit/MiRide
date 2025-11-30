# 🗺️ Map Components - Quick Reference

## Components Overview

### 📍 LocationPicker
**Purpose:** Interactive location selection for booking flow

**Props:**
```typescript
{
  selectedLocation: string | null;
  onLocationSelect: (locationName: string, coordinates: Coordinates) => void;
  label?: string;
  className?: string;
}
```

**Example:**
```tsx
<LocationPicker
  selectedLocation={pickupLocation}
  onLocationSelect={(name, coords) => {
    setPickupLocation(name);
    setPickupCoords(coords);
  }}
  label="Pickup Location"
/>
```

---

### 🛣️ RouteDisplay
**Purpose:** Show route between two locations with distance/time

**Props:**
```typescript
{
  pickupLocation: Coordinates;
  dropoffLocation: Coordinates;
  pickupName?: string;
  dropoffName?: string;
  className?: string;
}
```

**Example:**
```tsx
<RouteDisplay
  pickupLocation={{ lat: 6.3156, lng: -10.8074 }}
  dropoffLocation={{ lat: 6.2337, lng: -10.3623 }}
  pickupName="Monrovia City Center"
  dropoffName="Roberts Airport"
/>
```

---

### 🚗 CarMapView
**Purpose:** Display multiple cars on map with filtering

**Props:**
```typescript
{
  cars: any[];
  userLocation?: Coordinates | null;
  proximityRadius?: number;
  onCarSelect?: (carId: number) => void;
  className?: string;
}
```

**Example:**
```tsx
<CarMapView
  cars={availableCars}
  userLocation={userCoords}
  proximityRadius={20}
  onCarSelect={(id) => navigate(`/car/${id}`)}
/>
```

---

### 📡 RentalTracker
**Purpose:** Real-time tracking with geofencing (demo)

**Props:**
```typescript
{
  rentalId: number;
  carInfo: {
    brand: string;
    model: string;
    year: number;
    imageUrl?: string;
  };
  pickupLocation: Coordinates;
  dropoffLocation: Coordinates;
  geofenceRadius?: number;
  onGeofenceViolation?: () => void;
  className?: string;
}
```

**Example:**
```tsx
<RentalTracker
  rentalId={123}
  carInfo={car}
  pickupLocation={pickup}
  dropoffLocation={dropoff}
  geofenceRadius={50}
  onGeofenceViolation={() => alert('Geofence violation!')}
/>
```

---

## Utility Functions

### 📏 Distance & Time
```typescript
import { calculateDistance, estimateTravelTime, formatDistance, formatDuration } from '../utils/mapUtils';

const distance = calculateDistance(coord1, coord2); // Returns km
const time = estimateTravelTime(distance); // Returns minutes
const distStr = formatDistance(distance); // "15.3km"
const timeStr = formatDuration(time); // "23 min"
```

### 📍 Location Lookups
```typescript
import { getCoordsFromLocationName, getLocationNameFromCoords } from '../utils/mapUtils';

const coords = getCoordsFromLocationName('Monrovia - City Center');
// { lat: 6.3156, lng: -10.8074 }

const name = getLocationNameFromCoords({ lat: 6.3156, lng: -10.8074 });
// "Monrovia - City Center"
```

### 🗺️ Map Helpers
```typescript
import { getCenterPoint, getZoomLevel } from '../utils/mapUtils';

const center = getCenterPoint(coord1, coord2);
const zoom = getZoomLevel(distanceKm);
```

---

## Predefined Locations

```typescript
import { LIBERIA_LOCATION_COORDS, LIBERIA_CENTER } from '../utils/mapUtils';

// All locations
LIBERIA_LOCATION_COORDS = {
  'Monrovia - Roberts International Airport': { lat: 6.2337, lng: -10.3623 },
  'Monrovia - City Center': { lat: 6.3156, lng: -10.8074 },
  'Paynesville - Red Light': { lat: 6.2897, lng: -10.7036 },
  'Sinkor - Tubman Boulevard': { lat: 6.3208, lng: -10.7945 },
  'Congo Town': { lat: 6.3333, lng: -10.8000 },
  'Buchanan - Grand Bassa': { lat: 5.8808, lng: -10.0467 },
  'Gbarnga - Bong County': { lat: 6.9958, lng: -9.4722 },
  'Kakata - Margibi County': { lat: 6.5297, lng: -10.3528 },
}

// Default center
LIBERIA_CENTER = { lat: 6.3156, lng: -10.8074 }
```

---

## Types

```typescript
import { Coordinates, LocationData, CarLocation, RouteInfo, TrackingData } from '../../types/map';

// Basic coordinates
type Coordinates = {
  lat: number;
  lng: number;
}

// Location with name
type LocationData = {
  name: string;
  coordinates: Coordinates;
  address?: string;
}

// Car on map
type CarLocation = Coordinates & {
  carId: number;
  brand: string;
  model: string;
  year: number;
  imageUrl?: string;
  rentalPricePerDay: number;
  isAvailable: boolean;
}
```

---

## Common Patterns

### Pattern 1: Location Selection
```tsx
const [location, setLocation] = useState<string | null>(null);
const [coords, setCoords] = useState<Coordinates | null>(null);

<LocationPicker
  selectedLocation={location}
  onLocationSelect={(name, coordinates) => {
    setLocation(name);
    setCoords(coordinates);
  }}
/>
```

### Pattern 2: Route Display
```tsx
const [pickup, setPickup] = useState<Coordinates | null>(null);
const [dropoff, setDropoff] = useState<Coordinates | null>(null);

{pickup && dropoff && pickup !== dropoff && (
  <RouteDisplay
    pickupLocation={pickup}
    dropoffLocation={dropoff}
  />
)}
```

### Pattern 3: User Location
```tsx
const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

const getUserLocation = () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        setUserLocation(LIBERIA_CENTER); // Fallback
      }
    );
  }
};
```

---

## Styling

All components support:
- ✅ Dark mode via Tailwind classes
- ✅ Responsive design
- ✅ Custom className prop
- ✅ Consistent spacing

Map container heights:
- LocationPicker: 400px
- RouteDisplay: 400px
- CarMapView: 600px
- RentalTracker: 500px

---

## Tips & Best Practices

### 🎯 Performance
- Lazy load maps (only render when visible)
- Limit markers to visible area
- Use marker clustering for 100+ items
- Debounce map updates

### 🔒 Security
- Validate coordinates on backend
- Sanitize location names
- Rate limit geolocation requests
- Verify geofence boundaries

### 📱 Mobile
- Test touch interactions
- Ensure markers are tappable (min 44px)
- Optimize for slower connections
- Handle orientation changes

### ♿ Accessibility
- Provide text alternatives
- Keyboard navigation support
- Screen reader friendly
- High contrast mode

---

## Troubleshooting

### Map not displaying?
```typescript
// Check CSS import in main.tsx
import "leaflet/dist/leaflet.css";

// Ensure container has height
<div style={{ height: '400px' }}>
  <MapContainer>...</MapContainer>
</div>
```

### Markers not showing?
```typescript
// Verify coordinates are valid
const isValid = (coords: Coordinates) => {
  return coords.lat >= -90 && coords.lat <= 90 &&
         coords.lng >= -180 && coords.lng <= 180;
};
```

### Geolocation not working?
```typescript
// Requires HTTPS in production
// Check browser permissions
// Provide fallback location
```

---

## Resources

- [Leaflet Docs](https://leafletjs.com/)
- [React-Leaflet Docs](https://react-leaflet.js.org/)
- [OpenStreetMap](https://www.openstreetmap.org/)

---

**Last Updated:** November 28, 2025
