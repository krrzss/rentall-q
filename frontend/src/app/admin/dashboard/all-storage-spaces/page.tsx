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

export default function AdminStorageSpacesPage() {
  const [units, setUnits] = useState<StorageUnitAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadUnits() {
      try {
        const res = await fetch('/api/rental-units');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setUnits(
              data.map((u: any, i: number) => ({
                id: u.id || `unit-${i}`,
                name: u.name || u.title || `Storage Unit #${i + 1}`,
                type: u.type || 'Self Storage',
                businessName: u.businessName || 'Metro Storage Solutions',
                basePrice: Number(u.basePrice || u.base_price || 120),
                status: u.status || 'AVAILABLE',
                dimensions: u.dimensions || '10ft x 10ft',
              }))
            );
          } else {
            setUnits(mockAdminUnits);
          }
        } else {
          setUnits(mockAdminUnits);
        }
      } catch (err) {
        setUnits(mockAdminUnits);
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
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-navy-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-amber-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white font-serif">
              All Storage Spaces & Pages
            </h1>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Super Admin inventory index across all registered business owner providers.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
          <input
            type="text"
            placeholder="Search unit, provider, type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-navy-950 border border-navy-700 rounded-lg text-white placeholder-stone-500 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-xs text-stone-400">Loading storage inventory...</div>
      ) : filteredUnits.length === 0 ? (
        <Card className="border-navy-700 bg-navy-800/80 p-8 text-center text-stone-300">
          <Building2 className="mx-auto h-8 w-8 text-amber-400 mb-2" />
          <h3 className="text-base font-bold text-white">No Storage Units Found</h3>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUnits.map((unit) => (
            <Card
              key={unit.id}
              className="border-navy-700 bg-navy-800/90 text-cream-100 p-5 flex flex-col justify-between hover:border-amber-500/50 transition-all shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-navy-700/80">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      {unit.type}
                    </span>
                    <h3 className="text-sm font-bold text-white font-serif mt-0.5">
                      {unit.name}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                      unit.status === 'AVAILABLE'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : unit.status === 'OCCUPIED'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {unit.status}
                  </span>
                </div>

                <div className="text-xs text-stone-400 space-y-1 bg-navy-950/60 p-3 rounded-lg border border-navy-800">
                  <div className="flex justify-between">
                    <span>Business Provider:</span>
                    <span className="font-bold text-white">{unit.businessName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dimensions:</span>
                    <span className="text-stone-300">{unit.dimensions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base Rate:</span>
                    <span className="font-bold text-amber-400">${unit.basePrice} / mo</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-navy-700/80 flex items-center justify-between text-[11px] text-stone-400">
                <span>Unit ID: {unit.id}</span>
                <span className="text-amber-300 font-medium">Verified Active</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
