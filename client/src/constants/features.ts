// Predefined list of car features and amenities
export const CAR_FEATURES = [
  "Air Conditioning",
  "USB Charging",
  "Automatic Transmission",
  "GPS Navigation",
  "Bluetooth",
  "Backup Camera",
  "Power Windows",
  "Premium Sound System",
  "Sunroof",
  "Heated Seats",
  "Leather Seats",
  "Keyless Entry",
  "Cruise Control",
  "Parking Sensors",
  "Lane Assist",
  "Apple CarPlay",
  "Android Auto",
  "Rear AC Vents",
  "Alloy Wheels",
  "Fog Lights",
] as const;

export type CarFeature = typeof CAR_FEATURES[number];
