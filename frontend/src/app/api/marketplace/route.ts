import { NextResponse } from 'next/server';
import { createClient } from '@/server/lib/supabaseServer';

// Seeded marketplace companies with their storage units (matching business portal warehouses)
const MARKETPLACE_COMPANIES = [
  {
    id: 'b1000000-0000-0000-0000-000000000001',
    name: 'Austin SafeStore & Central Depot',
    businessType: 'self_storage',
    location: 'Sector 42, Austin, TX',
    rating: 4.9,
    units: [
      {
        id: 'unit-b1-001',
        name: 'Secure Climate Locker A-101',
        type: 'Climate Controlled',
        description: '10x10 ft temp-controlled self-storage vault with 24/7 HD CCTV & keycard access.',
        basePrice: 150,
        status: 'AVAILABLE',
        dimensions: '10ft x 10ft (100 sq ft)',
        location: 'Sector 42, Austin, TX',
        businessId: 'b1000000-0000-0000-0000-000000000001',
        businessName: 'Austin SafeStore & Central Depot',
      },
      {
        id: 'unit-b1-002',
        name: 'Drive-Up Unit A-104',
        type: 'Drive-Up Storage',
        description: 'Ground-floor roll-up door drive-up unit for vehicles and commercial bulk stock.',
        basePrice: 210,
        status: 'AVAILABLE',
        dimensions: '12ft x 10ft (120 sq ft)',
        location: 'Sector 42, Austin, TX',
        businessId: 'b1000000-0000-0000-0000-000000000001',
        businessName: 'Austin SafeStore & Central Depot',
      },
      {
        id: 'unit-b1-003',
        name: 'Compact Locker C-12',
        type: 'Locker Storage',
        description: '5x5 ft secure mini locker perfect for documents, valuables, and small personal items.',
        basePrice: 65,
        status: 'AVAILABLE',
        dimensions: '5ft x 5ft (25 sq ft)',
        location: 'Sector 42, Austin, TX',
        businessId: 'b1000000-0000-0000-0000-000000000001',
        businessName: 'Austin SafeStore & Central Depot',
      },
    ],
  },
  {
    id: 'b2000000-0000-0000-0000-000000000002',
    name: 'Chicago MetroHub Micro-Warehousing',
    businessType: 'warehouse',
    location: '1200 W Fulton Market, Chicago, IL',
    rating: 4.8,
    units: [
      {
        id: 'unit-b2-001',
        name: 'Distribution Bay B-201',
        type: 'Warehouse Space',
        description: 'High-ceiling 30x25 ft distribution bay with loading dock and forklift access.',
        basePrice: 680,
        status: 'AVAILABLE',
        dimensions: '30ft x 25ft (750 sq ft)',
        location: '1200 W Fulton Market, Chicago, IL',
        businessId: 'b2000000-0000-0000-0000-000000000002',
        businessName: 'Chicago MetroHub Micro-Warehousing',
      },
      {
        id: 'unit-b2-002',
        name: 'Bulk Staging Area B-203',
        type: 'Warehouse Space',
        description: 'Large pallet rack staging area with 24/7 security guard and sprinkler systems.',
        basePrice: 950,
        status: 'AVAILABLE',
        dimensions: '40ft x 30ft (1200 sq ft)',
        location: '1200 W Fulton Market, Chicago, IL',
        businessId: 'b2000000-0000-0000-0000-000000000002',
        businessName: 'Chicago MetroHub Micro-Warehousing',
      },
      {
        id: 'unit-b2-003',
        name: 'Cold Storage Pod B-204',
        type: 'Climate Controlled',
        description: 'Precision temperature & humidity controlled pod for pharmaceuticals & perishables.',
        basePrice: 520,
        status: 'AVAILABLE',
        dimensions: '15ft x 15ft (225 sq ft)',
        location: '1200 W Fulton Market, Chicago, IL',
        businessId: 'b2000000-0000-0000-0000-000000000002',
        businessName: 'Chicago MetroHub Micro-Warehousing',
      },
    ],
  },
  {
    id: 'b3000000-0000-0000-0000-000000000003',
    name: 'Seattle Pacific Port & Fleet Terminal',
    businessType: 'warehouse',
    location: 'Westside Terminal, Seattle, WA',
    rating: 4.7,
    units: [
      {
        id: 'unit-b3-001',
        name: 'Commercial Fleet Bay C-301',
        type: 'Drive-Up Storage',
        description: 'Reinforced concrete bay for fleet vehicles, cargo vans, and maintenance tools.',
        basePrice: 280,
        status: 'AVAILABLE',
        dimensions: '25ft x 15ft (375 sq ft)',
        location: 'Westside Terminal, Seattle, WA',
        businessId: 'b3000000-0000-0000-0000-000000000003',
        businessName: 'Seattle Pacific Port & Fleet Terminal',
      },
      {
        id: 'unit-b3-002',
        name: 'Container Staging Yard C-303',
        type: 'Warehouse Space',
        description: 'Intermodal shipping container storage yard with direct freight rail access.',
        basePrice: 380,
        status: 'AVAILABLE',
        dimensions: '40ft x 12ft (480 sq ft)',
        location: 'Westside Terminal, Seattle, WA',
        businessId: 'b3000000-0000-0000-0000-000000000003',
        businessName: 'Seattle Pacific Port & Fleet Terminal',
      },
      {
        id: 'unit-b3-003',
        name: 'Covered RV & Boat Bay C-304',
        type: 'Drive-Up Storage',
        description: 'Covered 40x20 ft weather-protected bay ideal for boats, campers, and RVs.',
        basePrice: 310,
        status: 'AVAILABLE',
        dimensions: '40ft x 20ft (800 sq ft)',
        location: 'Westside Terminal, Seattle, WA',
        businessId: 'b3000000-0000-0000-0000-000000000003',
        businessName: 'Seattle Pacific Port & Fleet Terminal',
      },
    ],
  },
  {
    id: 'b4000000-0000-0000-0000-000000000004',
    name: 'New York Empire Urban Storage & Depot',
    businessType: 'self_storage',
    location: 'Midtown Financial Dist., New York, NY',
    rating: 4.9,
    units: [
      {
        id: 'unit-b4-001',
        name: 'Manhattan High-Ceiling Vault D-101',
        type: 'Climate Controlled',
        description: 'Museum-grade humidity & fireproof vault for artwork, antiques, and fine wines.',
        basePrice: 320,
        status: 'AVAILABLE',
        dimensions: '15ft x 12ft (180 sq ft)',
        location: 'Midtown Financial Dist., New York, NY',
        businessId: 'b4000000-0000-0000-0000-000000000004',
        businessName: 'New York Empire Urban Storage & Depot',
      },
      {
        id: 'unit-b4-002',
        name: 'Wall Street Document Storage D-102',
        type: 'Locker Storage',
        description: 'Biometric biometric-secured archival vault for legal and corporate records.',
        basePrice: 180,
        status: 'AVAILABLE',
        dimensions: '8ft x 8ft (64 sq ft)',
        location: 'Midtown Financial Dist., New York, NY',
        businessId: 'b4000000-0000-0000-0000-000000000004',
        businessName: 'New York Empire Urban Storage & Depot',
      },
      {
        id: 'unit-b4-003',
        name: 'Midtown Logistics Cage D-104',
        type: 'Self Storage',
        description: 'Secure heavy-mesh lockbox with 24/7 key fob entry and freight elevator.',
        basePrice: 650,
        status: 'AVAILABLE',
        dimensions: '20ft x 15ft (300 sq ft)',
        location: 'Midtown Financial Dist., New York, NY',
        businessId: 'b4000000-0000-0000-0000-000000000004',
        businessName: 'New York Empire Urban Storage & Depot',
      },
    ],
  },
];

export async function GET() {
  try {
    // Attempt to load from Supabase and merge
    const supabase = createClient();
    const { data: businesses, error: bizError } = await supabase
      .from('businesses')
      .select('id, name, business_type')
      .order('name', { ascending: true });

    if (!bizError && businesses && businesses.length > 0) {
      const { data: units, error: unitError } = await supabase
        .from('rental_units')
        .select('id, name, type, description, base_price, status, business_id')
        .eq('status', 'AVAILABLE');

      const dbCompanies = businesses.map((biz: any) => ({
        id: biz.id,
        name: biz.name,
        businessType: biz.business_type || 'self_storage',
        location: 'Platform Registered Facility',
        rating: 4.8,
        units: (units || [])
          .filter((u: any) => u.business_id === biz.id)
          .map((u: any) => ({
            id: u.id,
            name: u.name,
            type: u.type,
            description: u.description || 'Verified storage space',
            basePrice: Number(u.base_price) || 150,
            status: u.status,
            dimensions: 'Standard Size',
            location: 'Platform Registered Facility',
            businessId: biz.id,
            businessName: biz.name,
          })),
      }));

      // Combine with seeded companies, deduplicating by ID
      const companyMap = new Map<string, any>();
      for (const seeded of MARKETPLACE_COMPANIES) {
        companyMap.set(seeded.id, seeded);
      }
      for (const db of dbCompanies) {
        if (companyMap.has(db.id)) {
          // Merge units
          const existing = companyMap.get(db.id);
          existing.units = [...existing.units, ...db.units.filter((u: any) => !existing.units.some((eu: any) => eu.id === u.id))];
        } else {
          companyMap.set(db.id, db);
        }
      }

      return NextResponse.json(Array.from(companyMap.values()));
    }
  } catch {
    // Fall through to seeded data
  }

  return NextResponse.json(MARKETPLACE_COMPANIES);
}
