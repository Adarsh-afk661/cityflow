import { Vehicle } from '../types';

export const DEFAULT_VEHICLES: Vehicle[] = [
  {
    id: 'veh-heavy-truck',
    name: 'Heavy Delivery Truck',
    type: 'truck',
    height: 4.1, // 4.1 meters: specifically triggers failure against 3.8m underpass
    width: 2.5,
    length: 12.0,
    weight: 16.0,
    fuelType: 'diesel',
    emissionRate: 0.54
  },
  {
    id: 'veh-van',
    name: 'Commercial Cargo Van',
    type: 'van',
    height: 2.4,
    width: 2.1,
    length: 5.9,
    weight: 3.5,
    fuelType: 'diesel',
    emissionRate: 0.22
  },
  {
    id: 'veh-car',
    name: 'Urban Fleet Courier Car',
    type: 'car',
    height: 1.5,
    width: 1.8,
    length: 4.5,
    weight: 1.6,
    fuelType: 'electric',
    emissionRate: 0.05
  },
  {
    id: 'veh-bus',
    name: 'Metro Transit Bus',
    type: 'bus',
    height: 3.4,
    width: 2.55,
    length: 12.5,
    weight: 14.5,
    fuelType: 'cng',
    emissionRate: 0.42
  },
  {
    id: 'veh-motorcycle',
    name: 'Rapid Dispatch Motorcycle',
    type: 'motorcycle',
    height: 1.2,
    width: 0.8,
    length: 2.1,
    weight: 0.25,
    fuelType: 'gasoline',
    emissionRate: 0.08
  }
];
