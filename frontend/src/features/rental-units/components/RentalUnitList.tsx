'use client';

import { useState } from 'react';
import { RentalUnitCard } from '@/features/rental-units/components/RentalUnitCard';
import { RentalUnitForm } from '@/features/rental-units/components/RentalUnitForm';
import { RentalUnitDetailDrawer } from '@/features/rental-units/components/RentalUnitDetailDrawer';
import { useRentalUnits } from '@/features/rental-units/hooks/useRentalUnits';
import { RentalUnitRecord, RentalUnitStatus } from '@/server/use-cases/rental-units/types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { RefreshCw, Search, Plus, LayoutGrid, List, Calendar as CalendarIcon, CheckSquare, Check } from 'lucide-react';

interface RentalUnitListProps {
  refreshKey?: number;
}

type ViewMode = 'grid' | 'table' | 'calendar';

export function RentalUnitList({ refreshKey = 0 }: RentalUnitListProps) {
  const { rentalUnits, loading, error, updateRentalUnit, deleteRentalUnit, refresh } = useRentalUnits();
  
  // Drawer & Form States
  const [drawerUnitId, setDrawerUnitId] = useState<string | null>(null);
  const [editingUnit, setEditingUnit] = useState<RentalUnitRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // View Mode & Bulk Selection States
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [bulkActionSuccess, setBulkActionSuccess] = useState<string | null>(null);

  const drawerUnit = rentalUnits.find((u) => u.id === drawerUnitId) ?? null;

  const filteredUnits = rentalUnits.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.type.toLowerCase().includes(search.toLowerCase()) ||
      (u.description && u.description.toLowerCase().includes(search.toLowerCase()))
  );

  async function handleStatusChange(id: string, status: RentalUnitStatus) {
    await updateRentalUnit(id, { status });
  }

  // Bulk Selection Handlers
  const toggleSelectUnit = (id: string) => {
    setSelectedUnitIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUnitIds.length === filteredUnits.length) {
      setSelectedUnitIds([]);
    } else {
      setSelectedUnitIds(filteredUnits.map((u) => u.id));
    }
  };

  const handleBulkStatusChange = async (status: RentalUnitStatus) => {
    for (const id of selectedUnitIds) {
      await updateRentalUnit(id, { status });
    }
    setBulkActionSuccess(`Updated ${selectedUnitIds.length} units to ${status}.`);
    setSelectedUnitIds([]);
    setTimeout(() => setBulkActionSuccess(null), 3000);
    refresh();
  };

  return (
    <section className="space-y-6 text-navy-900 font-sans">
      
      {/* Header & Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-navy-900 font-serif">Rental Inventory Portfolio</h2>
          <p className="text-xs text-stone-500">Manage self-storage lockers, warehouse bays, hostel rooms &amp; equipment</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Switcher */}
          <div className="inline-flex rounded-xl border border-stone-200 bg-cream-50 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-navy-900 shadow-xs font-bold' : 'text-stone-500 hover:text-navy-900'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-navy-900 shadow-xs font-bold' : 'text-stone-500 hover:text-navy-900'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                viewMode === 'calendar' ? 'bg-white text-navy-900 shadow-xs font-bold' : 'text-stone-500 hover:text-navy-900'
              }`}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Calendar</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreating(true)}
            className="bg-navy-900 text-white font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4 text-amber-400" />
            <span>Add Rental Unit</span>
          </Button>
        </div>
      </div>

      {/* Bulk Action Bar (Visible when units selected) */}
      {selectedUnitIds.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <CheckSquare className="h-4 w-4 text-amber-700" />
            <span>{selectedUnitIds.length} Rental Units Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatusChange('AVAILABLE')}
              className="rounded-xl bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition cursor-pointer"
            >
              Mark Available
            </button>
            <button
              onClick={() => handleBulkStatusChange('MAINTENANCE')}
              className="rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition cursor-pointer"
            >
              Mark Maintenance
            </button>
            <button
              onClick={() => setSelectedUnitIds([])}
              className="text-xs font-semibold text-stone-600 hover:underline cursor-pointer px-2"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {bulkActionSuccess && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{bulkActionSuccess}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
        <Input
          type="text"
          placeholder="Search by unit name, type, or specs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 text-xs rounded-xl"
        />
      </div>

      {/* Modal Form */}
      {(isCreating || editingUnit) && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-stone-200 space-y-4">
            <RentalUnitForm
              initialUnit={editingUnit ?? undefined}
              onSuccess={() => {
                setIsCreating(false);
                setEditingUnit(null);
                refresh();
              }}
              onClose={() => {
                setIsCreating(false);
                setEditingUnit(null);
              }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-sm text-stone-500 font-medium">Loading rental units...</div>
      ) : null}

      {/* VIEW MODE 1: GRID VIEW */}
      {!loading && viewMode === 'grid' && filteredUnits.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUnits.map((unit) => (
            <div key={unit.id} className="relative">
              <div className="absolute top-4 right-4 z-10">
                <input
                  type="checkbox"
                  checked={selectedUnitIds.includes(unit.id)}
                  onChange={() => toggleSelectUnit(unit.id)}
                  className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
              </div>
              <RentalUnitCard
                unit={unit}
                onEdit={(u) => setEditingUnit(u)}
                onDelete={async (id) => {
                  await deleteRentalUnit(id);
                }}
                onStatusChange={handleStatusChange}
              />
            </div>
          ))}
        </div>
      )}

      {/* VIEW MODE 2: TABLE LIST VIEW */}
      {!loading && viewMode === 'table' && filteredUnits.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white shadow-xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-cream-50/70 border-stone-200">
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={selectedUnitIds.length === filteredUnits.length}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                </TableHead>
                <TableHead className="font-bold text-navy-900">Unit Name</TableHead>
                <TableHead className="font-bold text-navy-900">Type / Category</TableHead>
                <TableHead className="font-bold text-navy-900">Daily Rate</TableHead>
                <TableHead className="font-bold text-navy-900">Status</TableHead>
                <TableHead className="font-bold text-navy-900 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUnits.map((unit) => (
                <TableRow key={unit.id} className="hover:bg-cream-50/50 transition-colors">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedUnitIds.includes(unit.id)}
                      onChange={() => toggleSelectUnit(unit.id)}
                      className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                    />
                  </TableCell>
                  <TableCell className="font-semibold text-navy-900">
                    <button
                      type="button"
                      onClick={() => setDrawerUnitId(unit.id)}
                      className="text-left font-bold text-navy-900 hover:text-amber-700 transition cursor-pointer font-serif"
                    >
                      {unit.name}
                    </button>
                  </TableCell>
                  <TableCell className="text-stone-600 text-xs">{unit.type}</TableCell>
                  <TableCell className="font-bold text-emerald-700 text-xs">₹{unit.basePrice} / day</TableCell>
                  <TableCell>
                    <Select
                      value={unit.status}
                      onChange={(e) => handleStatusChange(unit.id, e.target.value as RentalUnitStatus)}
                      className="py-1 text-xs font-semibold border-stone-200 rounded-lg bg-cream-50"
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="OCCUPIED">OCCUPIED</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                      <option value="UNAVAILABLE">UNAVAILABLE</option>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setDrawerUnitId(unit.id)}
                        className="text-xs font-bold text-navy-900 hover:text-amber-700 cursor-pointer"
                      >
                        Specs &rarr;
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingUnit(unit)}
                        className="text-xs font-semibold text-stone-600 hover:text-navy-900 cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* VIEW MODE 3: AVAILABILITY CALENDAR VIEW */}
      {!loading && viewMode === 'calendar' && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-base font-bold text-navy-900 font-serif">August 2026 Availability Grid</h3>
            <span className="text-xs text-stone-500 font-semibold">Green: Open • Dark Navy: Occupied</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-stone-400 pb-2">
            <div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div><div>SUN</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 31 }).map((_, i) => {
              const day = i + 1;
              const isOccupiedDay = day % 3 !== 0;

              return (
                <div
                  key={day}
                  className={`rounded-xl p-3 text-center border font-bold text-xs flex flex-col justify-between h-16 ${
                    isOccupiedDay
                      ? 'bg-navy-900 text-white border-navy-900'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  <span className="text-left font-serif text-[11px]">{day}</span>
                  <span className="text-[10px] font-semibold">{isOccupiedDay ? 'Leased' : 'Open'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Unit Detail Drawer */}
      <RentalUnitDetailDrawer
        unit={drawerUnit}
        onClose={() => setDrawerUnitId(null)}
      />
    </section>
  );
}
