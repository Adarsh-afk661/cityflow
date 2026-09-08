import { connectDatabase } from './config/db.js';
import { VehicleModel } from './models/Vehicle.js';
import { RouteModel } from './models/RouteModel.js';
import { AlertModel } from './models/Alert.js';

export const REAL_VEHICLES = [
  {
    id: 'V-HVY-101',
    name: 'Class 8 Heavy Delivery Truck (Semi-Trailer)',
    type: 'Heavy Freight (Class 8)',
    height: 4.1,
    width: 2.5,
    length: 12.0,
    weight: 16.0,
    fuelType: 'diesel',
    emissionRate: 0.82,
    isCustom: false
  },
  {
    id: 'V-VAN-202',
    name: 'Sprinter Commercial Cargo Van',
    type: 'Light Commercial (Class 2)',
    height: 2.4,
    width: 2.0,
    length: 6.0,
    weight: 3.5,
    fuelType: 'electric',
    emissionRate: 0.12,
    isCustom: false
  },
  {
    id: 'V-BOX-303',
    name: 'Freightliner Medium Box Truck (26ft)',
    type: 'Medium Duty (Class 6)',
    height: 3.6,
    width: 2.4,
    length: 8.5,
    weight: 10.0,
    fuelType: 'diesel',
    emissionRate: 0.54,
    isCustom: false
  },
  {
    id: 'V-EV-404',
    name: 'BrightDrop Zero-Emission Delivery Unit',
    type: 'Electric Commercial (Class 3)',
    height: 2.6,
    width: 2.1,
    length: 6.8,
    weight: 4.2,
    fuelType: 'electric',
    emissionRate: 0.08,
    isCustom: false
  },
  {
    id: 'V-FLAT-505',
    name: 'Kenworth Heavy Construction Flatbed',
    type: 'Oversize Specialized (Class 8)',
    height: 4.3,
    width: 2.6,
    length: 15.0,
    weight: 28.0,
    fuelType: 'diesel',
    emissionRate: 1.15,
    isCustom: false
  }
];

export const REAL_ROUTES = [
  {
    id: 'corridor-a',
    name: 'Route A — Ashford Bypass Corridor',
    corridorCode: 'EXP-A10',
    distanceKm: 18.4,
    baseEtaMin: 22,
    minClearanceHeightM: 3.8, // Barred for vehicles > 3.8m!
    maxBridgeWeightT: 18.0,
    reliabilityScore: 78,
    delayProbability: 24,
    co2PerTripKg: 18.4,
    clearanceStatus: 'barred',
    criticalChokepoint: 'Deacon Underpass (3.8m limit)',
    pathWaypoints: [
      { x: 220, y: 480, lat: 28.6139, lon: 77.2090 },
      { x: 290, y: 410, lat: 28.6250, lon: 77.2180 },
      { x: 370, y: 350, lat: 28.6380, lon: 77.2270 },
      { x: 450, y: 270, lat: 28.6520, lon: 77.2350 },
      { x: 540, y: 180, lat: 28.6650, lon: 77.2420 },
      { x: 620, y: 120, lat: 28.6790, lon: 77.2510 }
    ]
  },
  {
    id: 'corridor-b',
    name: 'Route B — Ring Beltway Corridor',
    corridorCode: 'BELT-B',
    distanceKm: 22.8,
    baseEtaMin: 28,
    minClearanceHeightM: 4.8, // 4.8m clearance allows all standard trucks
    maxBridgeWeightT: 40.0,
    reliabilityScore: 89,
    delayProbability: 11,
    co2PerTripKg: 16.2,
    clearanceStatus: 'clear',
    criticalChokepoint: 'High Clearance Beltway',
    pathWaypoints: [
      { x: 220, y: 480, lat: 28.6139, lon: 77.2090 },
      { x: 200, y: 360, lat: 28.6210, lon: 77.1950 },
      { x: 250, y: 240, lat: 28.6400, lon: 77.1900 },
      { x: 380, y: 180, lat: 28.6600, lon: 77.2050 },
      { x: 490, y: 230, lat: 28.6700, lon: 77.2250 },
      { x: 570, y: 180, lat: 28.6750, lon: 77.2400 },
      { x: 620, y: 120, lat: 28.6790, lon: 77.2510 }
    ]
  },
  {
    id: 'corridor-c',
    name: 'Route C — Green Corridor Parkway',
    corridorCode: 'GRN-C',
    distanceKm: 19.6,
    baseEtaMin: 26,
    minClearanceHeightM: 4.5, // 4.5m clearance with high eco-efficiency
    maxBridgeWeightT: 32.0,
    reliabilityScore: 94,
    delayProbability: 8,
    co2PerTripKg: 13.7,
    clearanceStatus: 'selected',
    criticalChokepoint: 'Green Viaduct Eco-Route',
    pathWaypoints: [
      { x: 220, y: 480, lat: 28.6139, lon: 77.2090 },
      { x: 260, y: 370, lat: 28.6280, lon: 77.2050 },
      { x: 310, y: 260, lat: 28.6450, lon: 77.2150 },
      { x: 390, y: 210, lat: 28.6580, lon: 77.2280 },
      { x: 510, y: 160, lat: 28.6700, lon: 77.2380 },
      { x: 620, y: 120, lat: 28.6790, lon: 77.2510 }
    ]
  }
];

export const REAL_ALERTS = [
  {
    id: 'ALT-101',
    type: 'clearance',
    severity: 'critical',
    title: 'Low Clearance Height Barrier on Corridor A-10',
    description: '3.8m maximum underpass clearance detected. Barring commercial vehicles >3.8m.',
    affectedRoute: 'Expressway A-10',
    affectedVehicle: 'V-HVY-101 (4.1m H)',
    recommendedAction: 'Reroute via Route B (Ring Beltway) or Route C (Green Corridor).',
    timestamp: 'Just now',
    acknowledged: false
  },
  {
    id: 'ALT-102',
    type: 'weather',
    severity: 'warning',
    title: 'Heavy Rain Sensor Triggered: 28mm Influx',
    description: 'Surface water accumulation near Industrial Underpass Sector 4. Speed reduced by 35%.',
    affectedRoute: 'Central Connector',
    recommendedAction: 'Activate Storm Contingency Protocol — switch fleet to Green Viaduct.',
    timestamp: '4m ago',
    acknowledged: false
  },
  {
    id: 'ALT-103',
    type: 'traffic',
    severity: 'info',
    title: 'Peak Freight Corridor Inbound Volume',
    description: 'Ashford freight depot experiencing 18% higher commercial transit flow.',
    affectedRoute: 'Ring Beltway B',
    recommendedAction: 'Dispatches staggered by 6-minute intervals.',
    timestamp: '12m ago',
    acknowledged: true
  }
];

export async function seedDatabase() {
  console.log('🌱 Starting MongoDB database seeding...');
  const connected = await connectDatabase();

  if (!connected) {
    console.log('⚠️ MongoDB is currently offline. Loaded real commercial data into in-memory fallback store.');
    return {
      success: true,
      mode: 'In-Memory Fallback Persistence',
      message: 'Real commercial data initialized in memory. Set MONGODB_URI to persist to MongoDB Atlas.',
      vehiclesCount: REAL_VEHICLES.length,
      routesCount: REAL_ROUTES.length,
      alertsCount: REAL_ALERTS.length,
      timestamp: new Date().toISOString()
    };
  }

  // Clear existing default records in MongoDB
  await VehicleModel.deleteMany({});
  await RouteModel.deleteMany({});
  await AlertModel.deleteMany({});

  // Insert real commercial data into MongoDB Atlas
  const vehicles = await VehicleModel.insertMany(REAL_VEHICLES);
  const routes = await RouteModel.insertMany(REAL_ROUTES);
  const alerts = await AlertModel.insertMany(REAL_ALERTS);

  console.log(`✅ Seeded ${vehicles.length} commercial vehicles in MongoDB.`);
  console.log(`✅ Seeded ${routes.length} freight corridors in MongoDB.`);
  console.log(`✅ Seeded ${alerts.length} live operational alerts in MongoDB.`);
  return {
    success: true,
    mode: 'MongoDB Live (Atlas/Local)',
    vehiclesCount: vehicles.length,
    routesCount: routes.length,
    alertsCount: alerts.length,
    timestamp: new Date().toISOString()
  };
}

// Standalone execution if run directly with `node` or `tsx`
if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedDatabase()
    .then(res => {
      console.log('🎉 Seeding completed successfully:', res);
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}

