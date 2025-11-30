# MiRide Interactive Map Features - Implementation Guide

## 🗺️ Overview

This guide documents the interactive map features implemented in the MiRide car rental platform using Leaflet and React-Leaflet.

## ✅ Implemented Features

### 1. **Location Selection with Interactive Maps**

#### **A. LocationPicker Component** (`client/src/components/maps/LocationPicker.tsx`)

**Features:**
- Interactive map for selecting pickup/dropoff locations
- Dropdown selector with predefined Liberia locations
- Click-to-select on map markers
- Toggle between map view and dropdown
- Visual feedback for selected location
- Supports both map clicks and dropdown selection

**Usage in BookingFlow:**
```tsx
<LocationPicker
  selectedLocation={bookingData.pickupLocation !== "default" ? bookingData.pickupLocation : null}
  onLocationSelect={(locationName, coordinates) => {
    handleInputChange("pickupLocation", locationName);
    setPickupCoords(coordinates);
  }}
  label="Pickup Location"
/>
```

**Key Features:**
- 📍 8 predefined locations across Liberia
- 🗺️ OpenStreetMap tiles
- 🎯 Custom marker icons (blue for available, red for selected)
- 📱 Responsive design
- 🌓 Dark mode support

---

### 2. **Route Display & Distance Calculator**

#### **B. RouteDisplay Component** (`client/src/components/maps/RouteDisplay.tsx`)

**Features:**
- Visual route between pickup and dropoff locations
- Distance calculation using Haversine formula
- Estimated travel time (based on 40 km/h average speed)
- Interactive map with route line
- Color-coded markers (green for pickup, red for dropoff)

**Usage:**
```tsx
<RouteDisplay
  pickupLocation={pickupCoords}
  dropoffLocation={dropoffCoords}
  pickupName={bookingData.pickupLocation}
  dropoffName={bookingData.dropoffLocation}
/>
```

**Displays:**
- 📏 Distance in kilometers/meters
- ⏱️ Estimated travel time
- 🗺️ Visual route on map
- 📍 Pickup and dropoff markers
- 📊 Route summary cards

---

### 3. **Car Location Display**

#### **C. CarMapView Component** (`client/src/components/maps/CarMapView.tsx`)

**Features:**
- Display all available cars on an interactive map
- Custom price markers for each car
- Proximity search based on user location
- Filter cars by distance radius
- Click markers to view car details
- Color-coded availability (green = available, red = booked)

**Usage:**
```tsx
<CarMapView
  cars={cars}
  userLocation={userLocation}
  proximityRadius={20}
  onCarSelect={(carId) => navigate(`/car/${carId}`)}
/>
```

**Key Features:**
- 🚗 Custom car markers with price display
- 📍 User location marker
- ⭕ Proximity circle visualization
- 🔍 Filter by distance
- 📊 Stats display (number of cars, radius)
- 🎨 Interactive popups with car details

---

### 4. **Browse Cars with Map View**

#### **D. BrowseCarsMap Component** (`client/src/components/BrowseCarsMap.tsx`)

**Features:**
- Toggle between map view and list view
- Use device geolocation for proximity search
- Adjustable search radius (5km - 100km)
- Filter panel for advanced search
- Responsive layout

**Key Features:**
- 🗺️ Map view with all cars
- 📋 List view fallback
- 📍 "Use My Location" button
- 🎚️ Radius selector
- 🔍 Advanced filters (price, type, transmission, seats)
- 📊 Car count display

**Access:**
- Navigate to `/browse-cars-map` (needs to be added to routes)

---

### 5. **Car Details Location Display**

**Features:**
- Show approximate car location on details page
- Toggle map visibility
- Single car marker with popup
- Approximate location indicator

**Implementation in CarDetails:**
- Generates random location near Monrovia (demo)
- In production, would use actual car location from database
- Toggle button to show/hide map
- 300px height map with single marker

---

### 6. **Real-time Tracking (Future Enhancement)**

#### **E. RentalTracker Component** (`client/src/components/maps/RentalTracker.tsx`)

**Features (Demo Implementation):**
- Real-time car location tracking
- Geofence monitoring with alerts
- Travel path visualization
- Movement status (moving/stationary)
- Distance calculations from pickup/dropoff
- Last update timestamp

**Usage:**
```tsx
<RentalTracker
  rentalId={booking.id}
  carInfo={{
    brand: car.brand,
    model: car.model,
    year: car.year,
    imageUrl: car.imageUrl
  }}
  pickupLocation={pickupCoords}
  dropoffLocation={dropoffCoords}
  geofenceRadius={50}
  onGeofenceViolation={() => {
    // Handle geofence violation
    toast.error('Vehicle has left the designated area!');
  }}
/>
```

**Key Features:**
- 🚗 Real-time car position marker
- ⭕ Geofence circle visualization
- 🚨 Geofence violation alerts
- 📍 Pickup/dropoff markers
- 📈 Travel path polyline
- 📊 Status cards (moving, geofence, last update)
- 📏 Distance tracking

**Note:** Currently simulates movement. In production:
- Integrate with GPS tracking device API
- Use WebSocket for real-time updates
- Store location history in database
- Add speed monitoring
- Implement route optimization

---

## 🛠️ Utility Functions

### **mapUtils.ts** (`client/src/utils/mapUtils.ts`)

**Functions:**
- `calculateDistance(coord1, coord2)` - Haversine distance calculation
- `estimateTravelTime(distanceKm)` - Time estimation based on average speed
- `formatDistance(distanceKm)` - Format distance for display
- `formatDuration(minutes)` - Format duration for display
- `getCoordsFromLocationName(name)` - Get coordinates from location name
- `getLocationNameFromCoords(coords)` - Reverse lookup location name
- `generateNearbyCoords(center, radius)` - Generate random nearby coordinates
- `getCenterPoint(coord1, coord2)` - Calculate midpoint
- `getZoomLevel(distanceKm)` - Calculate appropriate zoom level
- `isWithinLiberia(coords)` - Check if coordinates are in Liberia

**Predefined Locations:**
```typescript
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
```

---

## 📦 Type Definitions

### **map.ts** (`client/src/types/map.ts`)

```typescript
interface Coordinates {
  lat: number;
  lng: number;
}

interface LocationData {
  name: string;
  coordinates: Coordinates;
  address?: string;
}

interface CarLocation extends Coordinates {
  carId: number;
  brand: string;
  model: string;
  year: number;
  imageUrl?: string;
  rentalPricePerDay: number;
  isAvailable: boolean;
}

interface RouteInfo {
  distance: number;
  duration: number;
  coordinates: Coordinates[];
}

interface TrackingData {
  rentalId: number;
  currentLocation: Coordinates;
  lastUpdated: Date;
  isMoving: boolean;
  speed?: number;
}
```

---

## 🚀 Setup & Configuration

### **1. Dependencies**

Already installed in your project:
```json
{
  "leaflet": "^1.9.4",
  "react-leaflet": "^5.0.0",
  "@types/leaflet": "^1.9.20",
  "@types/react-leaflet": "^2.8.3"
}
```

### **2. CSS Import**

Added to `main.tsx`:
```typescript
import "leaflet/dist/leaflet.css";
```

### **3. Marker Icons**

Using CDN-hosted marker icons:
- Blue: Default/User location
- Green: Pickup location
- Red: Dropoff location
- Violet: Car tracking
- Custom: Price markers (dynamically generated)

---

## 🎨 Styling & Theming

All map components support:
- ✅ Dark mode
- ✅ Responsive design
- ✅ TailwindCSS classes
- ✅ Custom marker styles
- ✅ Smooth transitions

---

## 📱 Responsive Design

Maps are fully responsive:
- **Mobile**: Single column, compact controls
- **Tablet**: Two columns, medium maps
- **Desktop**: Full layout, large maps

Map heights:
- LocationPicker: 400px
- RouteDisplay: 400px
- CarMapView: 600px
- CarDetails: 300px
- RentalTracker: 500px

---

## 🔄 Integration Points

### **Booking Flow**
1. User selects pickup location (map or dropdown)
2. User selects dropoff location
3. Route display shows distance and time
4. Booking proceeds with location data

### **Browse Cars**
1. User views cars on map
2. Optional: Use device location
3. Filter by proximity radius
4. Click marker to view details

### **Car Details**
1. View approximate car location
2. Toggle map visibility
3. See location context

### **Active Rentals (Future)**
1. Track car in real-time
2. Monitor geofence
3. View travel history
4. Receive alerts

---

## 🔮 Future Enhancements

### **Backend Integration Needed:**

1. **Car Locations**
   - Add `latitude` and `longitude` fields to Car model
   - Store actual car locations in database
   - Update location when car is moved

2. **Real-time Tracking**
   - Integrate GPS tracking devices
   - WebSocket server for real-time updates
   - Store location history
   - API endpoints for tracking data

3. **Geofencing**
   - Define geofence zones in database
   - Monitor violations
   - Send notifications
   - Log geofence events

4. **Route Optimization**
   - Integrate routing API (e.g., OSRM, Google Directions)
   - Calculate actual driving routes
   - Provide turn-by-turn directions
   - Traffic-aware routing

5. **Location Services**
   - Geocoding API integration
   - Reverse geocoding
   - Address autocomplete
   - Place search

---

## 📊 Database Schema Updates

### **Recommended Schema Changes:**

```sql
-- Add to cars table
ALTER TABLE cars ADD COLUMN latitude DECIMAL(10, 8);
ALTER TABLE cars ADD COLUMN longitude DECIMAL(11, 8);
ALTER TABLE cars ADD COLUMN location_updated_at TIMESTAMP;

-- Create location_history table
CREATE TABLE location_history (
  id SERIAL PRIMARY KEY,
  rental_id INTEGER REFERENCES rentals(id),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  speed DECIMAL(5, 2),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_rental_timestamp (rental_id, timestamp)
);

-- Create geofence_events table
CREATE TABLE geofence_events (
  id SERIAL PRIMARY KEY,
  rental_id INTEGER REFERENCES rentals(id),
  event_type VARCHAR(50), -- 'entered', 'exited'
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🧪 Testing

### **Manual Testing Checklist:**

- [ ] LocationPicker displays map correctly
- [ ] Can select location from dropdown
- [ ] Can select location by clicking map
- [ ] RouteDisplay calculates distance
- [ ] Route line displays between markers
- [ ] CarMapView shows all cars
- [ ] User location works (with permission)
- [ ] Proximity filter works
- [ ] Car markers are clickable
- [ ] CarDetails map toggles correctly
- [ ] RentalTracker simulates movement
- [ ] Geofence alerts trigger
- [ ] All maps are responsive
- [ ] Dark mode works on all maps

---

## 📝 API Endpoints Needed

### **For Production:**

```typescript
// Get car location
GET /api/cars/:id/location
Response: { latitude, longitude, lastUpdated }

// Get rental tracking data
GET /api/rentals/:id/tracking
Response: { currentLocation, isMoving, speed, lastUpdated }

// Get location history
GET /api/rentals/:id/location-history
Response: [{ latitude, longitude, timestamp, speed }]

// Update car location (from GPS device)
POST /api/cars/:id/location
Body: { latitude, longitude, speed }

// Get geofence events
GET /api/rentals/:id/geofence-events
Response: [{ eventType, latitude, longitude, timestamp }]
```

---

## 🎯 Usage Examples

### **1. Add Map View to Routes**

Update your `App.tsx` or routing file:

```typescript
import BrowseCarsMap from './components/BrowseCarsMap';

// Add route
<Route path="/browse-cars-map" element={<BrowseCarsMap />} />
```

### **2. Add Navigation Link**

```typescript
<Link to="/browse-cars-map" className="...">
  🗺️ Map View
</Link>
```

### **3. Use in Customer Dashboard**

```typescript
import RentalTracker from './components/maps/RentalTracker';

// In active rental section
{activeRental && (
  <RentalTracker
    rentalId={activeRental.id}
    carInfo={activeRental.car}
    pickupLocation={pickupCoords}
    dropoffLocation={dropoffCoords}
  />
)}
```

---

## 🐛 Troubleshooting

### **Common Issues:**

1. **Map not displaying:**
   - Check Leaflet CSS is imported
   - Verify map container has explicit height
   - Check console for errors

2. **Markers not showing:**
   - Verify marker icon URLs are accessible
   - Check coordinates are valid
   - Ensure markers are within map bounds

3. **Geolocation not working:**
   - Requires HTTPS in production
   - User must grant permission
   - Fallback to default location

4. **Performance issues:**
   - Limit number of markers displayed
   - Use marker clustering for many cars
   - Debounce map updates

---

## 📚 Resources

- [Leaflet Documentation](https://leafletjs.com/)
- [React-Leaflet Documentation](https://react-leaflet.js.org/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)

---

## ✅ Summary

All requested map features have been implemented:

✅ **A. Location Selection with Map** - Interactive map for pickup/dropoff
✅ **B. Car Location Display** - Browse cars on map with markers
✅ **C. Real-time Tracking** - Demo implementation ready for production integration

The implementation is production-ready with demo data. To go live:
1. Add GPS tracking device integration
2. Implement WebSocket for real-time updates
3. Store actual car locations in database
4. Add backend API endpoints
5. Configure geofencing rules

---

**Created:** November 28, 2025
**Version:** 1.0.0
**Status:** ✅ Complete - Ready for Testing
