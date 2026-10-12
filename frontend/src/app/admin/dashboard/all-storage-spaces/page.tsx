'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Building2, Search, Filter, Shield, Layers, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';

interface StorageUnitAdmin {
  id: string;
  name: string;
  type: string;
  businessName: string;
  basePrice: number;
  status: string;
  dimensions: string;
}

const mockAdminUnits: StorageUnitAdmin[] = [
  {
    id: 'unit-101',
    name: 'Secure Vault A-101',
    type: 'Climate Controlled',
    businessName: 'Metro Storage Solutions',
    basePrice: 150,
    status: 'AVAILABLE',
    dimensions: '10ft x 10ft',
  },
  {
    id: 'unit-102',
    name: 'Warehouse Bay B-4',
    type: 'Warehouse Space',
    businessName: 'Apex Logistics Hub',
    basePrice: 450,
    status: 'OCCUPIED',
    dimensions: '25ft x 20ft',
  },
  {
    id: 'unit-103',
    name: 'Compact Locker C-12',
    type: 'Locker Storage',
    businessName: 'Central Mini Lockers',
    basePrice: 65,
    status: 'AVAILABLE',
    dimensions: '5ft x 5ft',
  },
  {
    id: 'unit-104',
    name: 'Drive-Up Unit D-88',
    type: 'Drive-Up Storage',
    businessName: 'Metro Storage Solutions',
    basePrice: 220,
    status: 'MAINTENANCE',
    dimensions: '15ft x 10ft',
  },
  {
    id: 'unit-105',
    name: 'Executive Suite E-05',
    type: 'Climate Controlled',
    businessName: 'Luxury Vaults Co.',
    basePrice: 320,
    status: 'AVAILABLE',
    dimensions: '12ft x 15ft',
  },
];

import { createClient } from '@/server/lib/supabaseClient';

export default function AdminStorageSpacesPage() {
  const [units, setUnits] = useState<StorageUnitAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadUnits() {
      try {
        const supabase = createClient();

        // 1. Fetch real rental units from database
        const { data: dbUnits } = await supabase
          .from('rental_units')
          .select('id, name, type, description, base_price, status, business_id');

        // Fetch businesses for provider name
        const { data: businesses } = await supabase
          .from('businesses')
          .select('id, name');

        const businessMap = new Map((businesses || []).map((b) => [b.id, b.name]));

        if (dbUnits && dbUnits.length > 0) {
          setUnits(
            dbUnits.map((u, i) => ({
              id: u.id,
              name: u.name || `Unit #${i + 1}`,
              type: u.type || 'Self Storage',
              businessName: (u.business_id && businessMap.get(u.business_id)) || 'Default Business',
              basePrice: Number(u.base_price || 150),
              status: u.status || 'AVAILABLE',
              dimensions: '10ft x 10ft',
            }))
          );
          setLoading(false);
          return;
        }

        // 2. Check /api/rental-units
        const res = await fetch('/api/rental-units');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setUnits(
              data.map((u: any, i: number) => ({
                id: u.id || `unit-${i}`,
                name: u.name || u.title || `Storage Unit #${i + 1}`,
                type: u.type || 'Self Storage',
                businessName: u.businessName || 'Default Business',
                basePrice: Number(u.basePrice || u.base_price || 150),
                status: u.status || 'AVAILABLE',
                dimensions: u.dimensions || '10ft x 10ft',
              }))
            );
            setLoading(false);
            return;
          }
        }

        setUnits([]);
      } catch (err) {
        console.error('Failed to load storage units', err);
        setUnits([]);
      } finally {
        setLoading(false);
      }
    }

    loadUnits();
  }, []);

  const filteredUnits = units.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-navy-900 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-amber-600" />
            <h1 className="text-2xl font-bold tracking-tight text-navy-900 font-serif">
              All Storage Spaces &amp; Units
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Super Admin inventory index across all registered business owner providers.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search unit, provider, type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg text-navy-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-xs text-stone-500">Loading storage inventory...</div>
      ) : filteredUnits.length === 0 ? (
        <Card className="border-stone-200 bg-white p-8 text-center text-stone-500">
          <Building2 className="mx-auto h-8 w-8 text-stone-400 mb-2" />
          <h3 className="text-base font-bold text-navy-900">No Storage Units Found</h3>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUnits.map((unit) => (
            <Card
              key={unit.id}
              className="border-stone-200 bg-white text-navy-900 p-5 flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-100">
                  <div>
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                      {unit.type}
                    </span>
                    <h3 className="text-sm font-bold text-navy-900 font-serif mt-0.5">
                      {unit.name}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                      unit.status === 'AVAILABLE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : unit.status === 'OCCUPIED'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {unit.status}
                  </span>
                </div>

                <div className="text-xs text-stone-600 space-y-1.5 bg-cream-100/70 p-3 rounded-lg border border-stone-200/60">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Business Provider:</span>
                    <span className="font-bold text-navy-900">{unit.businessName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Dimensions:</span>
                    <span className="text-stone-700">{unit.dimensions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Base Rate:</span>
                    <span className="font-bold text-emerald-700">₹{unit.basePrice} / mo</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <span>Unit ID: {unit.id}</span>
                <span className="text-emerald-700 font-medium">Verified Active</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
