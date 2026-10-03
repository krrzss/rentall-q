// ─── Mock Company Data ────────────────────────────────────────────────────────
// All 6 companies used on the landing page + their detail pages.
// This is intentionally mock/static data – no DB calls needed for the public
// /companies/[slug] route.

export type CompanyCategory =
  | 'self_storage'
  | 'warehouse'
  | 'hostel'
  | 'parking'
  | 'equipment';

export type InventoryStatus = 'Available' | 'Occupied' | 'Maintenance';
export type PaymentStatus = 'Paid' | 'Overdue' | 'Pending';

// ── Base inventory item (all categories share these fields) ──────────────────
interface BaseInventoryItem {
  id: string;
  label: string; // e.g. "Unit A-12", "Bay 3", "Bed 4B"
  status: InventoryStatus;
  renter: string | null; // null = vacant
  ratePerMonth: number;
  endDate: string | null; // ISO date string, null if vacant
}

// ── Category-specific extra fields ──────────────────────────────────────────
export interface StorageUnit extends BaseInventoryItem {
  size: string;          // e.g. "10×10 ft"
  climateControl: boolean;
  floor: string;         // e.g. "Ground", "Level 2"
  accessType: string;    // e.g. "Drive-up", "Elevator"
}

export interface WarehouseBay extends BaseInventoryItem {
  sqFt: number;
  dockDoors: number;
  ceilingHeight: string; // e.g. "24 ft"
  zoneType: string;      // e.g. "Cold Storage", "Dry Goods", "Hazmat"
}

export interface HostelBed extends BaseInventoryItem {
  bedType: string;       // e.g. "Single", "Bunk – Upper", "Private Queen"
  roomNumber: string;
  amenities: string[];
  checkIn: string | null;
  checkOut: string | null;
}

export interface ParkingSpot extends BaseInventoryItem {
  spotType: string;      // e.g. "Covered", "Open", "EV Charging"
  permitNumber: string | null;
  vehicle: string | null;
  renewalDate: string | null;
}

export interface EquipmentAsset extends BaseInventoryItem {
  assetCategory: string; // e.g. "Power Tools", "Heavy Machinery"
  condition: string;     // e.g. "Excellent", "Good", "Fair"
  lastMaintenance: string; // ISO date
  nextMaintenance: string; // ISO date
}

export type InventoryItem =
  | StorageUnit
  | WarehouseBay
  | HostelBed
  | ParkingSpot
  | EquipmentAsset;

// ── Tenant record ─────────────────────────────────────────────────────────────
export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  unit: string;
  monthlyRent: number;
  lastPayment: string; // ISO date
  paymentStatus: PaymentStatus;
}

// ── Revenue data point ────────────────────────────────────────────────────────
export interface RevenueDataPoint {
  month: string; // e.g. "Aug '25"
  revenue: number;
}

// ── Activity event ────────────────────────────────────────────────────────────
export interface ActivityEvent {
  id: string;
  type: 'move_in' | 'move_out' | 'payment' | 'maintenance' | 'renewal';
  description: string;
  timestamp: string; // ISO date-time
  actor: string;
}

// ── Full company record ───────────────────────────────────────────────────────
export interface MockCompany {
  slug: string;
  name: string;
  category: CompanyCategory;
  accent: string; // tailwind color name: amber | sky | violet | emerald | rose
  tagline: string;
  totalInventory: number;
  activeTenantsCount: number;
  occupancyRate: number; // percentage 0-100
  monthlyRevenue: number;
  inventory: InventoryItem[];
  tenants: Tenant[];
  revenue: RevenueDataPoint[];
  activity: ActivityEvent[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. StoreSafe Holdings — Self Storage
// ═══════════════════════════════════════════════════════════════════════════════
const storeSafe: MockCompany = {
  slug: 'storesafe-holdings',
  name: 'StoreSafe Holdings',
  category: 'self_storage',
  accent: 'amber',
  tagline: 'Multi-location storage management',
  totalInventory: 240,
  activeTenantsCount: 196,
  occupancyRate: 82,
  monthlyRevenue: 58800,
  inventory: [
    { id: 'ss-1', label: 'Unit A-01', status: 'Occupied',     renter: 'James Harrington',  ratePerMonth: 220, endDate: '2026-11-30', size: '5×5 ft',   climateControl: false, floor: 'Ground',  accessType: 'Drive-up' },
    { id: 'ss-2', label: 'Unit A-02', status: 'Available',    renter: null,                 ratePerMonth: 220, endDate: null,         size: '5×5 ft',   climateControl: false, floor: 'Ground',  accessType: 'Drive-up' },
    { id: 'ss-3', label: 'Unit B-07', status: 'Occupied',     renter: 'Priya Nambiar',      ratePerMonth: 350, endDate: '2026-09-15', size: '10×10 ft', climateControl: true,  floor: 'Ground',  accessType: 'Drive-up' },
    { id: 'ss-4', label: 'Unit B-08', status: 'Occupied',     renter: 'Daniel Osei',        ratePerMonth: 350, endDate: '2026-12-01', size: '10×10 ft', climateControl: true,  floor: 'Ground',  accessType: 'Drive-up' },
    { id: 'ss-5', label: 'Unit C-03', status: 'Maintenance',  renter: null,                 ratePerMonth: 480, endDate: null,         size: '10×20 ft', climateControl: true,  floor: 'Level 2', accessType: 'Elevator' },
    { id: 'ss-6', label: 'Unit C-04', status: 'Occupied',     renter: 'Sofia Reyes',        ratePerMonth: 480, endDate: '2027-01-15', size: '10×20 ft', climateControl: true,  floor: 'Level 2', accessType: 'Elevator' },
    { id: 'ss-7', label: 'Unit D-11', status: 'Occupied',     renter: 'Marcus Webb',        ratePerMonth: 180, endDate: '2026-10-31', size: '5×10 ft',  climateControl: false, floor: 'Ground',  accessType: 'Drive-up' },
    { id: 'ss-8', label: 'Unit D-12', status: 'Available',    renter: null,                 ratePerMonth: 180, endDate: null,         size: '5×10 ft',  climateControl: false, floor: 'Ground',  accessType: 'Drive-up' },
    { id: 'ss-9', label: 'Unit E-01', status: 'Occupied',     renter: 'Aisha Kamara',       ratePerMonth: 620, endDate: '2026-08-31', size: '20×20 ft', climateControl: true,  floor: 'Level 3', accessType: 'Elevator' },
    { id: 'ss-10', label: 'Unit E-02', status: 'Occupied',    renter: 'Tom Clarkson',       ratePerMonth: 620, endDate: '2026-11-20', size: '20×20 ft', climateControl: true,  floor: 'Level 3', accessType: 'Elevator' },
  ] as StorageUnit[],
  tenants: [
    { id: 't1', name: 'James Harrington', email: 'j.harrington@email.com', phone: '+1 555 0101', unit: 'Unit A-01', monthlyRent: 220, lastPayment: '2026-08-01', paymentStatus: 'Paid' },
    { id: 't2', name: 'Priya Nambiar',    email: 'priya.n@email.com',      phone: '+1 555 0202', unit: 'Unit B-07', monthlyRent: 350, lastPayment: '2026-08-01', paymentStatus: 'Paid' },
    { id: 't3', name: 'Daniel Osei',      email: 'd.osei@email.com',       phone: '+1 555 0303', unit: 'Unit B-08', monthlyRent: 350, lastPayment: '2026-07-15', paymentStatus: 'Overdue' },
    { id: 't4', name: 'Sofia Reyes',      email: 'sofia.r@email.com',      phone: '+1 555 0404', unit: 'Unit C-04', monthlyRent: 480, lastPayment: '2026-08-02', paymentStatus: 'Paid' },
    { id: 't5', name: 'Marcus Webb',      email: 'm.webb@email.com',       phone: '+1 555 0505', unit: 'Unit D-11', monthlyRent: 180, lastPayment: '2026-08-01', paymentStatus: 'Paid' },
    { id: 't6', name: 'Aisha Kamara',     email: 'aisha.k@email.com',      phone: '+1 555 0606', unit: 'Unit E-01', monthlyRent: 620, lastPayment: '2026-08-03', paymentStatus: 'Paid' },
    { id: 't7', name: 'Tom Clarkson',     email: 't.clarkson@email.com',   phone: '+1 555 0707', unit: 'Unit E-02', monthlyRent: 620, lastPayment: '2026-07-28', paymentStatus: 'Pending' },
  ],
  revenue: [
    { month: "Sep '25", revenue: 45200 }, { month: "Oct '25", revenue: 47800 },
    { month: "Nov '25", revenue: 49100 }, { month: "Dec '25", revenue: 51500 },
    { month: "Jan '26", revenue: 52300 }, { month: "Feb '26", revenue: 53800 },
    { month: "Mar '26", revenue: 54600 }, { month: "Apr '26", revenue: 55900 },
    { month: "May '26", revenue: 56400 }, { month: "Jun '26", revenue: 57200 },
    { month: "Jul '26", revenue: 57900 }, { month: "Aug '26", revenue: 58800 },
  ],
  activity: [
    { id: 'a1', type: 'payment',     description: 'Aisha Kamara paid ₹620 for Unit E-01',      timestamp: '2026-08-03T09:14:00Z', actor: 'System' },
    { id: 'a2', type: 'payment',     description: 'Sofia Reyes paid ₹480 for Unit C-04',        timestamp: '2026-08-02T11:05:00Z', actor: 'System' },
    { id: 'a3', type: 'move_in',     description: 'Tom Clarkson moved into Unit E-02',          timestamp: '2026-08-01T08:30:00Z', actor: 'Staff' },
    { id: 'a4', type: 'maintenance', description: 'Unit C-03 flagged for door-roller repair',   timestamp: '2026-07-30T14:00:00Z', actor: 'Maintenance' },
    { id: 'a5', type: 'move_out',    description: 'Rachel Ng vacated Unit A-02',                timestamp: '2026-07-28T16:20:00Z', actor: 'Staff' },
    { id: 'a6', type: 'payment',     description: 'Tom Clarkson payment pending – 7 days',      timestamp: '2026-07-28T09:00:00Z', actor: 'System' },
    { id: 'a7', type: 'renewal',     description: 'James Harrington renewed Unit A-01 – 6 mo',  timestamp: '2026-07-15T10:45:00Z', actor: 'Staff' },
    { id: 'a8', type: 'move_in',     description: 'Priya Nambiar moved into Unit B-07',         timestamp: '2026-07-01T09:00:00Z', actor: 'Staff' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. MetroWare Logistics — Warehouse
// ═══════════════════════════════════════════════════════════════════════════════
const metroWare: MockCompany = {
  slug: 'metroware-logistics',
  name: 'MetroWare Logistics',
  category: 'warehouse',
  accent: 'sky',
  tagline: 'Commercial bay & zone allocations',
  totalInventory: 18,
  activeTenantsCount: 14,
  occupancyRate: 78,
  monthlyRevenue: 124600,
  inventory: [
    { id: 'mw-1', label: 'Bay 01', status: 'Occupied',    renter: 'NorthPeak Distribution', ratePerMonth: 8200, endDate: '2026-12-31', sqFt: 4800, dockDoors: 3, ceilingHeight: '28 ft', zoneType: 'Dry Goods' },
    { id: 'mw-2', label: 'Bay 02', status: 'Occupied',    renter: 'Cryo-Logistics Ltd',     ratePerMonth: 11500, endDate: '2027-03-31', sqFt: 6200, dockDoors: 4, ceilingHeight: '30 ft', zoneType: 'Cold Storage' },
    { id: 'mw-3', label: 'Bay 03', status: 'Available',   renter: null,                      ratePerMonth: 7400, endDate: null,         sqFt: 3900, dockDoors: 2, ceilingHeight: '24 ft', zoneType: 'Dry Goods' },
    { id: 'mw-4', label: 'Bay 04', status: 'Occupied',    renter: 'EastLink Forwarding',    ratePerMonth: 9600, endDate: '2026-10-15', sqFt: 5200, dockDoors: 3, ceilingHeight: '26 ft', zoneType: 'Dry Goods' },
    { id: 'mw-5', label: 'Bay 05', status: 'Maintenance', renter: null,                      ratePerMonth: 12000, endDate: null,        sqFt: 7000, dockDoors: 5, ceilingHeight: '32 ft', zoneType: 'Hazmat' },
    { id: 'mw-6', label: 'Bay 06', status: 'Occupied',    renter: 'QuickShip Express',      ratePerMonth: 8800, endDate: '2026-09-30', sqFt: 4500, dockDoors: 3, ceilingHeight: '26 ft', zoneType: 'Dry Goods' },
    { id: 'mw-7', label: 'Bay 07', status: 'Occupied',    renter: 'FoodBridge Co.',         ratePerMonth: 10200, endDate: '2027-01-31', sqFt: 5800, dockDoors: 4, ceilingHeight: '28 ft', zoneType: 'Cold Storage' },
    { id: 'mw-8', label: 'Bay 08', status: 'Available',   renter: null,                      ratePerMonth: 7800, endDate: null,         sqFt: 4100, dockDoors: 2, ceilingHeight: '24 ft', zoneType: 'Dry Goods' },
  ] as WarehouseBay[],
  tenants: [
    { id: 't1', name: 'NorthPeak Distribution', email: 'ops@northpeak.com',   phone: '+1 555 1001', unit: 'Bay 01', monthlyRent: 8200,  lastPayment: '2026-08-01', paymentStatus: 'Paid' },
    { id: 't2', name: 'Cryo-Logistics Ltd',     email: 'billing@cryo.com',    phone: '+1 555 1002', unit: 'Bay 02', monthlyRent: 11500, lastPayment: '2026-08-01', paymentStatus: 'Paid' },
    { id: 't3', name: 'EastLink Forwarding',    email: 'el@eastlink.com',     phone: '+1 555 1003', unit: 'Bay 04', monthlyRent: 9600,  lastPayment: '2026-07-20', paymentStatus: 'Overdue' },
    { id: 't4', name: 'QuickShip Express',      email: 'qs@quickship.com',    phone: '+1 555 1004', unit: 'Bay 06', monthlyRent: 8800,  lastPayment: '2026-08-02', paymentStatus: 'Paid' },
    { id: 't5', name: 'FoodBridge Co.',         email: 'info@foodbridge.com', phone: '+1 555 1005', unit: 'Bay 07', monthlyRent: 10200, lastPayment: '2026-08-01', paymentStatus: 'Paid' },
  ],
  revenue: [
    { month: "Sep '25", revenue: 98400 }, { month: "Oct '25", revenue: 102800 },
    { month: "Nov '25", revenue: 105600 }, { month: "Dec '25", revenue: 108200 },
    { month: "Jan '26", revenue: 110500 }, { month: "Feb '26", revenue: 112900 },
    { month: "Mar '26", revenue: 115200 }, { month: "Apr '26", revenue: 117800 },
    { month: "May '26", revenue: 119400 }, { month: "Jun '26", revenue: 121000 },
    { month: "Jul '26", revenue: 122800 }, { month: "Aug '26", revenue: 124600 },
  ],
  activity: [
    { id: 'a1', type: 'payment',     description: 'FoodBridge Co. paid ₹10,200 for Bay 07',        timestamp: '2026-08-01T10:20:00Z', actor: 'System' },
    { id: 'a2', type: 'maintenance', description: 'Bay 05 Hazmat area under scheduled inspection',  timestamp: '2026-07-31T07:00:00Z', actor: 'Compliance Team' },
    { id: 'a3', type: 'move_in',     description: 'FoodBridge Co. commenced Bay 07 occupancy',      timestamp: '2026-07-15T08:00:00Z', actor: 'Admin' },
    { id: 'a4', type: 'renewal',     description: 'Cryo-Logistics extended Bay 02 lease by 12 mo', timestamp: '2026-07-10T11:30:00Z', actor: 'Admin' },
    { id: 'a5', type: 'payment',     description: 'EastLink Forwarding payment 12 days overdue',    timestamp: '2026-08-01T09:00:00Z', actor: 'System' },
    { id: 'a6', type: 'move_out',    description: 'Summit Freight vacated Bay 03',                  timestamp: '2026-07-01T17:00:00Z', actor: 'Staff' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. CoLive Spaces — Hostel
// ═══════════════════════════════════════════════════════════════════════════════
const coLive: MockCompany = {
  slug: 'colive-spaces',
  name: 'CoLive Spaces',
  category: 'hostel',
  accent: 'violet',
  tagline: 'Co-living & bed booking platform',
  totalInventory: 80,
  activeTenantsCount: 67,
  occupancyRate: 84,
  monthlyRevenue: 41800,
  inventory: [
    { id: 'cl-1', label: 'Bed 1A', status: 'Occupied',    renter: 'Lena Fischer',   ratePerMonth: 520, endDate: '2026-10-31', bedType: 'Single',        roomNumber: 'Room 101', amenities: ['WiFi', 'AC', 'Locker'],          checkIn: '2026-02-01', checkOut: '2026-10-31' },
    { id: 'cl-2', label: 'Bed 1B', status: 'Occupied',    renter: 'Ankit Sharma',   ratePerMonth: 520, endDate: '2026-09-30', bedType: 'Single',        roomNumber: 'Room 101', amenities: ['WiFi', 'AC', 'Locker'],          checkIn: '2026-03-15', checkOut: '2026-09-30' },
    { id: 'cl-3', label: 'Bed 2A', status: 'Occupied',    renter: 'Claire Dupont',  ratePerMonth: 680, endDate: '2026-12-31', bedType: 'Bunk – Lower',  roomNumber: 'Room 102', amenities: ['WiFi', 'AC', 'Locker', 'Desk'],  checkIn: '2026-01-10', checkOut: '2026-12-31' },
    { id: 'cl-4', label: 'Bed 2B', status: 'Available',   renter: null,             ratePerMonth: 720, endDate: null,         bedType: 'Bunk – Upper',  roomNumber: 'Room 102', amenities: ['WiFi', 'AC', 'Locker', 'Desk'],  checkIn: null,         checkOut: null },
    { id: 'cl-5', label: 'Bed 3A', status: 'Occupied',    renter: 'Yuki Tanaka',    ratePerMonth: 950, endDate: '2026-11-30', bedType: 'Private Queen', roomNumber: 'Room 201', amenities: ['WiFi', 'AC', 'En-suite', 'TV'],  checkIn: '2026-04-01', checkOut: '2026-11-30' },
    { id: 'cl-6', label: 'Bed 4A', status: 'Maintenance', renter: null,             ratePerMonth: 520, endDate: null,         bedType: 'Single',        roomNumber: 'Room 103', amenities: ['WiFi', 'Fan', 'Locker'],         checkIn: null,         checkOut: null },
    { id: 'cl-7', label: 'Bed 4B', status: 'Occupied',    renter: 'Carlos Mendez',  ratePerMonth: 520, endDate: '2026-10-15', bedType: 'Single',        roomNumber: 'Room 103', amenities: ['WiFi', 'Fan', 'Locker'],         checkIn: '2026-05-01', checkOut: '2026-10-15' },
    { id: 'cl-8', label: 'Bed 5A', status: 'Occupied',    renter: 'Fiona Walsh',    ratePerMonth: 870, endDate: '2027-01-31', bedType: 'Private Twin',  roomNumber: 'Room 202', amenities: ['WiFi', 'AC', 'Desk', 'Wardrobe'], checkIn: '2026-06-01', checkOut: '2027-01-31' },
  ] as HostelBed[],
  tenants: [
    { id: 't1', name: 'Lena Fischer',  email: 'lena.f@email.com',   phone: '+44 7911 100001', unit: 'Bed 1A', monthlyRent: 520, lastPayment: '2026-08-01', paymentStatus: 'Paid' },
    { id: 't2', name: 'Ankit Sharma',  email: 'ankit.s@email.com',  phone: '+44 7911 100002', unit: 'Bed 1B', monthlyRent: 520, lastPayment: '2026-08-01', paymentStatus: 'Paid' },
    { id: 't3', name: 'Claire Dupont', email: 'claire.d@email.com', phone: '+44 7911 100003', unit: 'Bed 2A', monthlyRent: 680, lastPayment: '2026-07-25', paymentStatus: 'Overdue' },
    { id: 't4', name: 'Yuki Tanaka',   email: 'yuki.t@email.com',   phone: '+44 7911 100004', unit: 'Bed 3A', monthlyRent: 950, lastPayment: '2026-08-02', paymentStatus: 'Paid' },
    { id: 't5', name: 'Carlos Mendez', email: 'carlos.m@email.com', phone: '+44 7911 100005', unit: 'Bed 4B', monthlyRent: 520, lastPayment: '2026-08-01', paymentStatus: 'Paid' },
    { id: 't6', name: 'Fiona Walsh',   email: 'fiona.w@email.com',  phone: '+44 7911 100006', unit: 'Bed 5A', monthlyRent: 870, lastPayment: '2026-08-01', paymentStatus: 'Paid' },
  ],
  revenue: [
    { month: "Sep '25", revenue: 33200 }, { month: "Oct '25", revenue: 34800 },
    { month: "Nov '25", revenue: 35600 }, { month: "Dec '25", revenue: 36200 },
    { month: "Jan '26", revenue: 37100 }, { month: "Feb '26", revenue: 38400 },
    { month: "Mar '26", revenue: 39000 }, { month: "Apr '26", revenue: 39800 },
    { month: "May '26", revenue: 40200 }, { month: "Jun '26", revenue: 40900 },
    { month: "Jul '26", revenue: 41400 }, { month: "Aug '26", revenue: 41800 },
  ],
  activity: [
    { id: 'a1', type: 'payment',     description: 'Yuki Tanaka paid ₹950 for Bed 3A',            timestamp: '2026-08-02T08:45:00Z', actor: 'System' },
    { id: 'a2', type: 'move_in',     description: 'Fiona Walsh checked into Bed 5A – Room 202',  timestamp: '2026-08-01T14:00:00Z', actor: 'Front Desk' },
    { id: 'a3', type: 'maintenance', description: 'Bed 4A mattress replacement scheduled',        timestamp: '2026-07-31T10:00:00Z', actor: 'Maintenance' },
    { id: 'a4', type: 'payment',     description: 'Claire Dupont payment 7 days overdue',         timestamp: '2026-08-01T09:00:00Z', actor: 'System' },
    { id: 'a5', type: 'renewal',     description: 'Lena Fischer extended stay by 3 months',       timestamp: '2026-07-20T11:00:00Z', actor: 'Front Desk' },
    { id: 'a6', type: 'move_out',    description: 'Marco Bianchi checked out from Bed 2B',        timestamp: '2026-07-15T12:00:00Z', actor: 'Front Desk' },
    { id: 'a7', type: 'move_in',     description: 'Carlos Mendez checked into Bed 4B',            timestamp: '2026-07-01T15:30:00Z', actor: 'Front Desk' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. ParkEase Networks — Parking
// ═══════════════════════════════════════════════════════════════════════════════
const parkEase: MockCompany = {
  slug: 'parkease-networks',
  name: 'ParkEase Networks',
  category: 'parking',
  accent: 'emerald',
  tagline: 'Reserved spot & permit renewals',
  totalInventory: 320,
  activeTenantsCount: 278,
  occupancyRate: 87,
  monthlyRevenue: 69500,
  inventory: [
    { id: 'pe-1', label: 'Spot P-001', status: 'Occupied',    renter: 'Ryan Gallagher',  ratePerMonth: 210, endDate: '2026-12-31', spotType: 'Covered',     permitNumber: 'PMT-9841', vehicle: 'Tesla Model 3 – CA 7X9Y',    renewalDate: '2026-12-31' },
    { id: 'pe-2', label: 'Spot P-002', status: 'Occupied',    renter: 'Nina Okafor',     ratePerMonth: 180, endDate: '2026-10-31', spotType: 'Open',        permitNumber: 'PMT-9842', vehicle: 'Honda Civic – CA 3Z5K',       renewalDate: '2026-10-31' },
    { id: 'pe-3', label: 'Spot P-003', status: 'Available',   renter: null,              ratePerMonth: 260, endDate: null,         spotType: 'EV Charging', permitNumber: null,       vehicle: null,                         renewalDate: null },
    { id: 'pe-4', label: 'Spot P-004', status: 'Occupied',    renter: 'Leo Braun',       ratePerMonth: 260, endDate: '2026-09-30', spotType: 'EV Charging', permitNumber: 'PMT-9844', vehicle: 'BMW i4 – CA 8M2P',           renewalDate: '2026-09-30' },
    { id: 'pe-5', label: 'Spot P-005', status: 'Maintenance', renter: null,              ratePerMonth: 210, endDate: null,         spotType: 'Covered',     permitNumber: null,       vehicle: null,                         renewalDate: null },
    { id: 'pe-6', label: 'Spot P-006', status: 'Occupied',    renter: 'Zara Hussain',    ratePerMonth: 210, endDate: '2026-11-30', spotType: 'Covered',     permitNumber: 'PMT-9846', vehicle: 'Hyundai Sonata – CA 5Q1T',   renewalDate: '2026-11-30' },
    { id: 'pe-7', label: 'Spot P-007', status: 'Occupied',    renter: 'Sam Petrov',      ratePerMonth: 180, endDate: '2026-10-15', spotType: 'Open',        permitNumber: 'PMT-9847', vehicle: 'Ford F-150 – CA 2R8V',       renewalDate: '2026-10-15' },
    { id: 'pe-8', label: 'Spot P-008', status: 'Occupied',    renter: 'Gloria Tran',     ratePerMonth: 180, endDate: '2027-01-31', spotType: 'Open',        permitNumber: 'PMT-9848', vehicle: 'Toyota Camry – CA 6N4J',     renewalDate: '2027-01-31' },
  ] as ParkingSpot[],
  tenants: [
    { id: 't1', name: 'Ryan Gallagher', email: 'ryan.g@email.com',   phone: '+1 555 2001', unit: 'Spot P-001', monthlyRent: 210, lastPayment: '2026-08-01', paymentStatus: 'Paid' },
    { id: 't2', name: 'Nina Okafor',    email: 'nina.o@email.com',   phone: '+1 555 2002', unit: 'Spot P-002', monthlyRent: 180, lastPayment: '2026-07-22', paymentStatus: 'Overdue' },
    { id: 't3', name: 'Leo Braun',      email: 'leo.b@email.com',    phone: '+1 555 2003', unit: 'Spot P-004', monthlyRent: 260, lastPayment: '2026-08-01', paymentStatus: 'Paid' },
    { id: 't4', name: 'Zara Hussain',   email: 'zara.h@email.com',   phone: '+1 555 2004', unit: 'Spot P-006', monthlyRent: 210, lastPayment: '2026-08-02', paymentStatus: 'Paid' },
    { id: 't5', name: 'Sam Petrov',     email: 'sam.p@email.com',    phone: '+1 555 2005', unit: 'Spot P-007', monthlyRent: 180, lastPayment: '2026-08-01', paymentStatus: 'Paid' },
    { id: 't6', name: 'Gloria Tran',    email: 'gloria.t@email.com', phone: '+1 555 2006', unit: 'Spot P-008', monthlyRent: 180, lastPayment: '2026-08-01', paymentStatus: 'Paid' },
  ],
  revenue: [
    { month: "Sep '25", revenue: 55600 }, { month: "Oct '25", revenue: 57800 },
    { month: "Nov '25", revenue: 59400 }, { month: "Dec '25", revenue: 61200 },
    { month: "Jan '26", revenue: 62500 }, { month: "Feb '26", revenue: 63800 },
    { month: "Mar '26", revenue: 64900 }, { month: "Apr '26", revenue: 65800 },
    { month: "May '26", revenue: 66900 }, { month: "Jun '26", revenue: 67800 },
    { month: "Jul '26", revenue: 68600 }, { month: "Aug '26", revenue: 69500 },
  ],
  activity: [
    { id: 'a1', type: 'payment',     description: 'Zara Hussain paid ₹210 for Spot P-006',          timestamp: '2026-08-02T10:00:00Z', actor: 'System' },
    { id: 'a2', type: 'renewal',     description: 'Ryan Gallagher renewed permit PMT-9841 – 12 mo',  timestamp: '2026-08-01T09:30:00Z', actor: 'Admin' },
    { id: 'a3', type: 'maintenance', description: 'Spot P-005 drainage repair in progress',          timestamp: '2026-07-30T08:00:00Z', actor: 'Facilities' },
    { id: 'a4', type: 'payment',     description: 'Nina Okafor payment 10 days overdue',             timestamp: '2026-08-01T09:00:00Z', actor: 'System' },
    { id: 'a5', type: 'move_in',     description: 'Gloria Tran assigned to Spot P-008',              timestamp: '2026-07-20T14:00:00Z', actor: 'Admin' },
    { id: 'a6', type: 'move_out',    description: 'Ahmed Al-Rashid vacated Spot P-003',              timestamp: '2026-07-10T17:00:00Z', actor: 'Staff' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 5. TechRig Equipment — Equipment
// ═══════════════════════════════════════════════════════════════════════════════
const techRig: MockCompany = {
  slug: 'techrig-equipment',
  name: 'TechRig Equipment',
  category: 'equipment',
  accent: 'rose',
  tagline: 'Tool & machinery rental tracking',
  totalInventory: 95,
  activeTenantsCount: 72,
  occupancyRate: 76,
  monthlyRevenue: 38400,
  inventory: [
    { id: 'tr-1', label: 'EQ-001 – Excavator CAT 320',     status: 'Occupied',    renter: 'BuildRight Co.',    ratePerMonth: 4200, endDate: '2026-09-15', assetCategory: 'Heavy Machinery', condition: 'Good',      lastMaintenance: '2026-06-10', nextMaintenance: '2026-09-10' },
    { id: 'tr-2', label: 'EQ-002 – Telescopic Forklift',   status: 'Occupied',    renter: 'FrameUp Builders', ratePerMonth: 2800, endDate: '2026-10-31', assetCategory: 'Heavy Machinery', condition: 'Excellent', lastMaintenance: '2026-07-01', nextMaintenance: '2026-10-01' },
    { id: 'tr-3', label: 'EQ-003 – Concrete Mixer 500L',   status: 'Available',   renter: null,               ratePerMonth: 480,  endDate: null,         assetCategory: 'Power Tools',     condition: 'Good',      lastMaintenance: '2026-07-15', nextMaintenance: '2026-10-15' },
    { id: 'tr-4', label: 'EQ-004 – Boom Lift 60ft',        status: 'Occupied',    renter: 'SkyTech Installs', ratePerMonth: 3100, endDate: '2026-11-30', assetCategory: 'Aerial Work',     condition: 'Excellent', lastMaintenance: '2026-07-20', nextMaintenance: '2026-10-20' },
    { id: 'tr-5', label: 'EQ-005 – Diesel Generator 100kW',status: 'Maintenance', renter: null,               ratePerMonth: 1200, endDate: null,         assetCategory: 'Power Systems',   condition: 'Fair',      lastMaintenance: '2026-05-01', nextMaintenance: '2026-08-15' },
    { id: 'tr-6', label: 'EQ-006 – Rotary Drill Rig',      status: 'Occupied',    renter: 'CoreDrill Inc.',   ratePerMonth: 5800, endDate: '2026-12-31', assetCategory: 'Drilling',        condition: 'Good',      lastMaintenance: '2026-06-28', nextMaintenance: '2026-09-28' },
    { id: 'tr-7', label: 'EQ-007 – Scissor Lift 32ft',     status: 'Available',   renter: null,               ratePerMonth: 950,  endDate: null,         assetCategory: 'Aerial Work',     condition: 'Excellent', lastMaintenance: '2026-08-01', nextMaintenance: '2026-11-01' },
    { id: 'tr-8', label: 'EQ-008 – Mini Excavator 1.5T',   status: 'Occupied',    renter: 'LandForm Ltd.',    ratePerMonth: 1650, endDate: '2026-10-01', assetCategory: 'Heavy Machinery', condition: 'Good',      lastMaintenance: '2026-06-15', nextMaintenance: '2026-09-15' },
  ] as EquipmentAsset[],
  tenants: [
    { id: 't1', name: 'BuildRight Co.',    email: 'ops@buildright.com',   phone: '+1 555 3001', unit: 'EQ-001 – Excavator CAT 320',      monthlyRent: 4200, lastPayment: '2026-08-01', paymentStatus: 'Paid' },
    { id: 't2', name: 'FrameUp Builders',  email: 'billing@frameup.com',  phone: '+1 555 3002', unit: 'EQ-002 – Telescopic Forklift',    monthlyRent: 2800, lastPayment: '2026-08-01', paymentStatus: 'Paid' },
    { id: 't3', name: 'SkyTech Installs',  email: 'acct@skytech.com',     phone: '+1 555 3003', unit: 'EQ-004 – Boom Lift 60ft',         monthlyRent: 3100, lastPayment: '2026-07-18', paymentStatus: 'Overdue' },
    { id: 't4', name: 'CoreDrill Inc.',    email: 'finance@coredrill.com', phone: '+1 555 3004', unit: 'EQ-006 – Rotary Drill Rig',       monthlyRent: 5800, lastPayment: '2026-08-02', paymentStatus: 'Paid' },
    { id: 't5', name: 'LandForm Ltd.',     email: 'info@landform.com',    phone: '+1 555 3005', unit: 'EQ-008 – Mini Excavator 1.5T',    monthlyRent: 1650, lastPayment: '2026-08-01', paymentStatus: 'Paid' },
  ],
  revenue: [
    { month: "Sep '25", revenue: 29800 }, { month: "Oct '25", revenue: 31200 },
    { month: "Nov '25", revenue: 32100 }, { month: "Dec '25", revenue: 33500 },
    { month: "Jan '26", revenue: 34200 }, { month: "Feb '26", revenue: 35100 },
    { month: "Mar '26", revenue: 35800 }, { month: "Apr '26", revenue: 36400 },
    { month: "May '26", revenue: 36900 }, { month: "Jun '26", revenue: 37400 },
    { month: "Jul '26", revenue: 37900 }, { month: "Aug '26", revenue: 38400 },
  ],
  activity: [
    { id: 'a1', type: 'payment',     description: 'CoreDrill Inc. paid ₹5,800 for EQ-006',           timestamp: '2026-08-02T11:00:00Z', actor: 'System' },
    { id: 'a2', type: 'maintenance', description: 'EQ-005 Diesel Generator under full service',       timestamp: '2026-08-01T07:00:00Z', actor: 'Tech Team' },
    { id: 'a3', type: 'payment',     description: 'SkyTech Installs payment 14 days overdue',        timestamp: '2026-08-01T09:00:00Z', actor: 'System' },
    { id: 'a4', type: 'move_in',     description: 'LandForm Ltd. collected Mini Excavator EQ-008',   timestamp: '2026-07-20T09:00:00Z', actor: 'Yard Staff' },
    { id: 'a5', type: 'renewal',     description: 'CoreDrill Inc. extended Drill Rig rental 6 mo',   timestamp: '2026-07-15T10:30:00Z', actor: 'Admin' },
    { id: 'a6', type: 'move_out',    description: 'Summit Constructions returned EQ-003 mixer',      timestamp: '2026-07-08T16:00:00Z', actor: 'Yard Staff' },
    { id: 'a7', type: 'move_in',     description: 'FrameUp Builders collected Telescopic Forklift',  timestamp: '2026-07-01T08:30:00Z', actor: 'Yard Staff' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 6. VaultBox Urban — Self Storage
// ═══════════════════════════════════════════════════════════════════════════════
const vaultBox: MockCompany = {
  slug: 'vaultbox-urban',
  name: 'VaultBox Urban',
  category: 'self_storage',
  accent: 'amber',
  tagline: 'Urban micro-storage network',
  totalInventory: 180,
  activeTenantsCount: 151,
  occupancyRate: 84,
  monthlyRevenue: 42300,
  inventory: [
    { id: 'vb-1', label: 'Vault U-01', status: 'Occupied',    renter: 'Hannah Green',     ratePerMonth: 195, endDate: '2026-10-31', size: '4×4 ft',   climateControl: false, floor: 'Ground',  accessType: 'Walk-in' },
    { id: 'vb-2', label: 'Vault U-02', status: 'Occupied',    renter: 'Oscar Liu',        ratePerMonth: 195, endDate: '2026-09-30', size: '4×4 ft',   climateControl: false, floor: 'Ground',  accessType: 'Walk-in' },
    { id: 'vb-3', label: 'Vault U-03', status: 'Available',   renter: null,               ratePerMonth: 320, endDate: null,         size: '8×8 ft',   climateControl: true,  floor: 'Level 1', accessType: 'Elevator' },
    { id: 'vb-4', label: 'Vault U-04', status: 'Occupied',    renter: 'Mei Suzuki',       ratePerMonth: 320, endDate: '2026-12-31', size: '8×8 ft',   climateControl: true,  floor: 'Level 1', accessType: 'Elevator' },
    { id: 'vb-5', label: 'Vault U-05', status: 'Maintenance', renter: null,               ratePerMonth: 195, endDate: null,         size: '4×4 ft',   climateControl: false, floor: 'Ground',  accessType: 'Walk-in' },
    { id: 'vb-6', label: 'Vault U-06', status: 'Occupied',    renter: 'Ethan Brooks',     ratePerMonth: 450, endDate: '2026-11-15', size: '10×10 ft', climateControl: true,  floor: 'Level 2', accessType: 'Elevator' },
    { id: 'vb-7', label: 'Vault U-07', status: 'Occupied',    renter: 'Isabelle Martin',  ratePerMonth: 195, endDate: '2026-10-01', size: '4×4 ft',   climateControl: false, floor: 'Ground',  accessType: 'Walk-in' },
    { id: 'vb-8', label: 'Vault U-08', status: 'Occupied',    renter: 'Kwame Asante',     ratePerMonth: 450, endDate: '2027-02-28', size: '10×10 ft', climateControl: true,  floor: 'Level 2', accessType: 'Elevator' },
  ] as StorageUnit[],
  tenants: [
    { id: 't1', name: 'Hannah Green',    email: 'h.green@email.com',    phone: '+1 555 4001', unit: 'Vault U-01', monthlyRent: 195, lastPayment: '2026-08-01', paymentStatus: 'Paid' },
    { id: 't2', name: 'Oscar Liu',       email: 'oscar.l@email.com',    phone: '+1 555 4002', unit: 'Vault U-02', monthlyRent: 195, lastPayment: '2026-07-20', paymentStatus: 'Overdue' },
    { id: 't3', name: 'Mei Suzuki',      email: 'mei.s@email.com',      phone: '+1 555 4003', unit: 'Vault U-04', monthlyRent: 320, lastPayment: '2026-08-02', paymentStatus: 'Paid' },
    { id: 't4', name: 'Ethan Brooks',    email: 'ethan.b@email.com',    phone: '+1 555 4004', unit: 'Vault U-06', monthlyRent: 450, lastPayment: '2026-08-01', paymentStatus: 'Paid' },
    { id: 't5', name: 'Isabelle Martin', email: 'isabelle.m@email.com', phone: '+1 555 4005', unit: 'Vault U-07', monthlyRent: 195, lastPayment: '2026-08-01', paymentStatus: 'Paid' },
    { id: 't6', name: 'Kwame Asante',    email: 'kwame.a@email.com',    phone: '+1 555 4006', unit: 'Vault U-08', monthlyRent: 450, lastPayment: '2026-08-01', paymentStatus: 'Paid' },
  ],
  revenue: [
    { month: "Sep '25", revenue: 33400 }, { month: "Oct '25", revenue: 35100 },
    { month: "Nov '25", revenue: 36200 }, { month: "Dec '25", revenue: 37400 },
    { month: "Jan '26", revenue: 38200 }, { month: "Feb '26", revenue: 39100 },
    { month: "Mar '26", revenue: 39800 }, { month: "Apr '26", revenue: 40400 },
    { month: "May '26", revenue: 40900 }, { month: "Jun '26", revenue: 41300 },
    { month: "Jul '26", revenue: 41900 }, { month: "Aug '26", revenue: 42300 },
  ],
  activity: [
    { id: 'a1', type: 'payment',     description: 'Mei Suzuki paid ₹320 for Vault U-04',             timestamp: '2026-08-02T09:10:00Z', actor: 'System' },
    { id: 'a2', type: 'maintenance', description: 'Vault U-05 lock mechanism being replaced',         timestamp: '2026-07-31T11:00:00Z', actor: 'Maintenance' },
    { id: 'a3', type: 'move_in',     description: 'Kwame Asante moved into Vault U-08',              timestamp: '2026-07-25T10:00:00Z', actor: 'Staff' },
    { id: 'a4', type: 'payment',     description: 'Oscar Liu payment 12 days overdue',               timestamp: '2026-08-01T09:00:00Z', actor: 'System' },
    { id: 'a5', type: 'renewal',     description: 'Ethan Brooks renewed Vault U-06 – 6 months',      timestamp: '2026-07-15T14:20:00Z', actor: 'Staff' },
    { id: 'a6', type: 'move_out',    description: 'Diana Chen vacated Vault U-03',                   timestamp: '2026-07-10T17:00:00Z', actor: 'Staff' },
    { id: 'a7', type: 'move_in',     description: 'Isabelle Martin moved into Vault U-07',           timestamp: '2026-07-01T09:30:00Z', actor: 'Staff' },
  ],
};

// ── Exported lookup ───────────────────────────────────────────────────────────
export const MOCK_COMPANIES: MockCompany[] = [
  storeSafe,
  metroWare,
  coLive,
  parkEase,
  techRig,
  vaultBox,
];

export function getCompanyBySlug(slug: string): MockCompany | undefined {
  return MOCK_COMPANIES.find((c) => c.slug === slug);
}
