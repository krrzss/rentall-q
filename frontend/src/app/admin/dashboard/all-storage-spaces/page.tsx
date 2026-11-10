'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Layers, Search, Building2, CheckCircle2, AlertCircle,
  Clock, Eye, Edit3, X, Save, IndianRupee, MapPin, Ruler,
} from 'lucide-react';

interface StorageUnit {
  id: string;
  unitCode: string;
  name: string;
  type: string;
  businessName: string;
  city: string;
  baseRateInr: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  dimensions: string;
  floor: string;
  climate: boolean;
  features: string[];
}

const SEED_UNITS: StorageUnit[] = [
  { id: 'u-01', unitCode: 'MUM-A101', name: 'Secure Vault A-101', type: 'Climate-Controlled', businessName: 'Hindustan Cold Storage & Logistics', city: 'Mumbai', baseRateInr: 8500, status: 'OCCUPIED', dimensions: '10ft × 10ft', floor: 'Ground', climate: true, features: ['24/7 CCTV', 'Digital Lock', 'Fire Suppression'] },
  { id: 'u-02', unitCode: 'MUM-B201', name: 'Warehouse Bay B-201', type: 'Heavy Warehouse Bay', businessName: 'Hindustan Cold Storage & Logistics', city: 'Mumbai', baseRateInr: 25000, status: 'AVAILABLE', dimensions: '25ft × 20ft', floor: 'Ground', climate: false, features: ['Forklift Access', 'Loading Bay', '3-Phase Power'] },
  { id: 'u-03', unitCode: 'BLR-C12', name: 'Compact Locker C-12', type: 'Micro-Locker', businessName: 'Urban Attic Self-Storage', city: 'Bengaluru', baseRateInr: 3200, status: 'AVAILABLE', dimensions: '5ft × 5ft', floor: 'First', climate: false, features: ['PIN Access', 'CCTV'] },
  { id: 'u-04', unitCode: 'BLR-D88', name: 'Drive-Up Unit D-88', type: 'Drive-Up Storage', businessName: 'Urban Attic Self-Storage', city: 'Bengaluru', baseRateInr: 6800, status: 'OCCUPIED', dimensions: '10ft × 20ft', floor: 'Ground', climate: false, features: ['Drive-Up', 'Wide Door', 'CCTV'] },
  { id: 'u-05', unitCode: 'DEL-E55', name: 'Premium Climate Suite E-55', type: 'Climate-Controlled', businessName: 'Capital Vault Warehousing', city: 'Delhi NCR', baseRateInr: 12000, status: 'AVAILABLE', dimensions: '15ft × 15ft', floor: 'First', climate: true, features: ['Temperature Control', 'Humidity Monitor', '24/7 Security'] },
  { id: 'u-06', unitCode: 'DEL-F02', name: 'Cold Chain Unit F-02', type: 'Cold Storage', businessName: 'Capital Vault Warehousing', city: 'Delhi NCR', baseRateInr: 18500, status: 'OCCUPIED', dimensions: '20ft × 20ft', floor: 'Ground', climate: true, features: ['Refrigeration', 'Temp Log', 'Dedicated Power'] },
  { id: 'u-07', unitCode: 'PUN-G09', name: 'City Locker G-09', type: 'Micro-Locker', businessName: 'SafeKeep Pune Storage', city: 'Pune', baseRateInr: 2800, status: 'AVAILABLE', dimensions: '4ft × 4ft', floor: 'Ground', climate: false, features: ['PIN Lock', 'Ground Floor'] },
  { id: 'u-08', unitCode: 'HYD-H22', name: 'Warehouse Suite H-22', type: 'Heavy Warehouse Bay', businessName: 'Metro Box Hyderabad', city: 'Hyderabad', baseRateInr: 22000, status: 'MAINTENANCE', dimensions: '30ft × 20ft', floor: 'Ground', climate: false, features: ['Heavy Racking', 'Loading Dock'] },
  { id: 'u-09', unitCode: 'CHN-I14', name: 'Business Archive I-14', type: 'Document Storage', businessName: 'SecureHub Chennai', city: 'Chennai', baseRateInr: 5500, status: 'AVAILABLE', dimensions: '8ft × 10ft', floor: 'Second', climate: true, features: ['Dust-Free', 'Fire Resistant', 'CCTV'] },
  { id: 'u-10', unitCode: 'CHN-J07', name: 'Vehicle Bay J-07', type: 'Vehicle Parking', businessName: 'SecureHub Chennai', city: 'Chennai', baseRateInr: 9000, status: 'OCCUPIED', dimensions: '12ft × 25ft', floor: 'Ground', climate: false, features: ['Covered Parking', 'CCTV', 'Night Security'] },
  { id: 'u-11', unitCode: 'MUM-K33', name: 'Mini Vault K-33', type: 'Micro-Locker', businessName: 'Hindustan Cold Storage & Logistics', city: 'Mumbai', baseRateInr: 4200, status: 'AVAILABLE', dimensions: '6ft × 6ft', floor: 'First', climate: false, features: ['Biometric Lock', 'Fire Extinguisher'] },
  { id: 'u-12', unitCode: 'BLR-L99', name: 'Logistics Hub L-99', type: 'Heavy Warehouse Bay', businessName: 'Urban Attic Self-Storage', city: 'Bengaluru', baseRateInr: 32000, status: 'OCCUPIED', dimensions: '40ft × 30ft', floor: 'Ground', climate: false, features: ['18-Wheeler Access', '3-Phase Power', 'Weighbridge'] },
];

const UNIT_TYPES = ['All Types', 'Climate-Controlled', 'Micro-Locker', 'Heavy Warehouse Bay', 'Drive-Up Storage', 'Cold Storage', 'Document Storage', 'Vehicle Parking'];
const CITIES = ['All Cities', 'Mumbai', 'Bengaluru', 'Delhi NCR', 'Pune', 'Hyderabad', 'Chennai', 'Ahmedabad', 'Kolkata'];

const statusConfig = {
  AVAILABLE: { label: 'Available', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, iconColor: 'text-emerald-500' },
  OCCUPIED: { label: 'Occupied', color: 'bg-sky-50 text-sky-700 border-sky-200', icon: Building2, iconColor: 'text-sky-500' },
  MAINTENANCE: { label: 'Maintenance', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock, iconColor: 'text-amber-500' },
};

function formatInr(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export default function AdminStorageSpacesPage() {
  const [units, setUnits] = useState<StorageUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [viewUnit, setViewUnit] = useState<StorageUnit | null>(null);
  const [editUnit, setEditUnit] = useState<StorageUnit | null>(null);
  const [editRate, setEditRate] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/rental-units');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped: StorageUnit[] = data.map((u: any, i: number) => ({
              id: u.id,
              unitCode: SEED_UNITS[i % SEED_UNITS.length].unitCode,
              name: u.name || SEED_UNITS[i % SEED_UNITS.length].name,
              type: u.type || SEED_UNITS[i % SEED_UNITS.length].type,
              businessName: u.businessName || SEED_UNITS[i % SEED_UNITS.length].businessName,
              city: SEED_UNITS[i % SEED_UNITS.length].city,
              baseRateInr: u.basePrice ? Math.round(u.basePrice * 83) : SEED_UNITS[i % SEED_UNITS.length].baseRateInr,
              status: (u.status as any) || SEED_UNITS[i % SEED_UNITS.length].status,
              dimensions: u.dimensions || SEED_UNITS[i % SEED_UNITS.length].dimensions,
              floor: SEED_UNITS[i % SEED_UNITS.length].floor,
              climate: SEED_UNITS[i % SEED_UNITS.length].climate,
              features: SEED_UNITS[i % SEED_UNITS.length].features,
            }));
            setUnits(mapped);
          } else {
            setUnits(SEED_UNITS);
          }
        } else {
          setUnits(SEED_UNITS);
        }
      } catch {
        setUnits(SEED_UNITS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSaveEdit = () => {
    if (!editUnit) return;
    setUnits((prev) =>
      prev.map((u) =>
        u.id === editUnit.id
          ? { ...u, baseRateInr: parseInt(editRate) || u.baseRateInr, status: (editStatus as any) || u.status }
          : u
      )
    );
    showToast(`Unit "${editUnit.unitCode}" updated successfully.`);
    setEditUnit(null);
  };

  const filtered = units.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.name.toLowerCase().includes(q) || u.businessName.toLowerCase().includes(q) || u.unitCode.toLowerCase().includes(q) || u.city.toLowerCase().includes(q)) &&
      (statusFilter === 'ALL' || u.status === statusFilter) &&
      (typeFilter === 'All Types' || u.type === typeFilter) &&
      (cityFilter === 'All Cities' || u.city === cityFilter)
    );
  });

  const totalRevPotential = filtered.filter((u) => u.status === 'OCCUPIED').reduce((s, u) => s + u.baseRateInr, 0);

  return (
    <div className="space-y-6 text-navy-900 font-sans">
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium bg-emerald-50 border-emerald-200 text-emerald-800">
          <CheckCircle2 className="h-4 w-4" /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="h-5 w-5 text-amber-600" />
            <h1 className="text-2xl font-bold tracking-tight text-navy-900 font-serif">Storage Inventory</h1>
          </div>
          <p className="text-xs text-stone-500">Master catalog of all storage units across all registered facilities.</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-center">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Monthly Revenue Potential</p>
            <p className="text-base font-bold text-emerald-700 font-serif">{formatInr(totalRevPotential)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <input type="text" placeholder="Search unit, facility, city..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
          {UNIT_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <div className="flex gap-1.5">
          {(['ALL', 'AVAILABLE', 'OCCUPIED', 'MAINTENANCE'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${statusFilter === s ? 'bg-amber-500 text-navy-900 border-amber-500' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'}`}>
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <span className="text-xs text-stone-400 font-medium self-center">{filtered.length} units</span>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-xs text-stone-500 py-8 text-center">Loading inventory...</p>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50 text-left">
                  {['Unit Code', 'Name', 'Facility', 'City', 'Type', 'Dimensions', 'Rate / Month ₹', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold text-stone-500 uppercase tracking-wider text-[10px] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filtered.map((u) => {
                  const sc = statusConfig[u.status];
                  const StatusIcon = sc.icon;
                  return (
                    <tr key={u.id} className="hover:bg-cream-100/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-navy-900 text-[11px]">{u.unitCode}</td>
                      <td className="px-4 py-3 font-semibold text-navy-900 max-w-[160px] truncate">{u.name}</td>
                      <td className="px-4 py-3 text-stone-600 max-w-[160px] truncate">{u.businessName}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-stone-600"><MapPin className="h-3 w-3 text-stone-400" />{u.city}</div>
                      </td>
                      <td className="px-4 py-3 text-stone-600 whitespace-nowrap">{u.type}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-stone-600"><Ruler className="h-3 w-3 text-stone-400" />{u.dimensions}</div>
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-700 whitespace-nowrap">
                        <div className="flex items-center gap-0.5"><IndianRupee className="h-3 w-3" />{u.baseRateInr.toLocaleString('en-IN')}/mo</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${sc.color}`}>
                          <StatusIcon className={`h-3 w-3 ${sc.iconColor}`} />{sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setViewUnit(u)} title="View" className="p-1.5 rounded-lg hover:bg-sky-50 text-sky-600 transition-all"><Eye className="h-3.5 w-3.5" /></button>
                          <button onClick={() => { setEditUnit(u); setEditRate(String(u.baseRateInr)); setEditStatus(u.status); }} title="Edit Rate" className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-all"><Edit3 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Unit Modal */}
      {viewUnit && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-navy-900 font-serif">{viewUnit.name}</h2>
                <p className="text-xs text-stone-500 font-mono mt-0.5">{viewUnit.unitCode}</p>
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${statusConfig[viewUnit.status].color}`}>
                {statusConfig[viewUnit.status].label}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Facility', value: viewUnit.businessName },
                { label: 'City', value: viewUnit.city },
                { label: 'Unit Type', value: viewUnit.type },
                { label: 'Dimensions', value: viewUnit.dimensions },
                { label: 'Floor', value: viewUnit.floor },
                { label: 'Climate Control', value: viewUnit.climate ? 'Yes' : 'No' },
                { label: 'Monthly Rate', value: formatInr(viewUnit.baseRateInr) },
                { label: 'Annual Revenue', value: formatInr(viewUnit.baseRateInr * 12) },
              ].map((row) => (
                <div key={row.label} className="bg-stone-50 rounded-xl p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">{row.label}</p>
                  <p className="text-sm font-bold text-navy-900 mt-0.5">{row.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">Features</p>
              <div className="flex flex-wrap gap-2">
                {viewUnit.features.map((f) => (
                  <span key={f} className="text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">{f}</span>
                ))}
              </div>
            </div>
            <Button onClick={() => setViewUnit(null)} variant="outline" className="w-full">Close</Button>
          </div>
        </div>
      )}

      {/* Edit Rate Modal */}
      {editUnit && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-navy-900 font-serif">Edit Unit: {editUnit.unitCode}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Monthly Rate (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                  <input type="number" value={editRate} onChange={(e) => setEditRate(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Status</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                  <option value="AVAILABLE">Available</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSaveEdit} variant="primary" className="flex-1 bg-amber-500 text-navy-900 hover:bg-amber-400 border-amber-500">
                <Save className="h-3.5 w-3.5 mr-1.5" /> Save Changes
              </Button>
              <Button onClick={() => setEditUnit(null)} variant="outline" className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
