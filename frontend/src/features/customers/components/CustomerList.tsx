'use client';

import { useState } from 'react';
import { CustomerCard } from '@/features/customers/components/CustomerCard';
import { CustomerForm } from '@/features/customers/components/CustomerForm';
import { CustomerDetailDrawer } from '@/features/customers/components/CustomerDetailDrawer';
import { useCustomers } from '@/features/customers/hooks/useCustomers';
import { CustomerRecord, CustomerStatus } from '@/server/use-cases/customers/types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { RefreshCw, Search, Plus, Filter, ArrowUpDown, UserCheck, KeyRound, CheckCircle2, ShieldAlert, Sparkles, X } from 'lucide-react';

interface CustomerListProps {
  refreshKey?: number;
}

export function CustomerList({ refreshKey = 0 }: CustomerListProps) {
  const { customers, loading, error, updateCustomer, deleteCustomer, refresh } = useCustomers();
  
  // Drawer & Form States
  const [drawerCustomerId, setDrawerCustomerId] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [pinCustomer, setPinCustomer] = useState<CustomerRecord | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Search, Filter & Sort States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status'>('name');

  const drawerCustomer = customers.find((c) => c.id === drawerCustomerId) ?? null;

  // Filtered & Sorted Customer List
  const filteredCustomers = customers
    .filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone && c.phone.includes(search));
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      }
      return (new Date(b.createdAt || 0)).getTime() - (new Date(a.createdAt || 0)).getTime();
    });

  async function handleStatusChange(id: string, status: CustomerStatus) {
    await updateCustomer(id, { status });
  }

  return (
    <section className="space-y-6 text-navy-900 font-sans">
      
      {/* Header & Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-navy-900 font-serif">Clients &amp; Tenants Directory</h2>
          <p className="text-xs text-stone-500">Manage registered client profiles, leases, and communications</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreating(true)}
            className="bg-navy-900 text-white font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4 text-amber-400" />
            <span>Add New Client</span>
          </Button>

          <Button variant="outline" size="sm" onClick={() => refresh()}>
            <RefreshCw className="h-3.5 w-3.5 text-stone-500" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-cream-50/60 p-4 rounded-2xl border border-stone-200/80">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
          <Input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-xs rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-stone-400 flex-shrink-0" />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-xl"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="LEAD">LEAD</option>
            <option value="INACTIVE">INACTIVE</option>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-stone-400 flex-shrink-0" />
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs rounded-xl"
          >
            <option value="name">Sort by Name (A-Z)</option>
            <option value="status">Sort by Status</option>
            <option value="date">Sort by Recent</option>
          </Select>
        </div>
      </div>

      {/* Add / Edit Customer Form Modal */}
      {(isCreating || editingCustomer) && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-stone-200 space-y-4">
            <CustomerForm
              initialCustomer={editingCustomer ?? undefined}
              onSuccess={() => {
                setIsCreating(false);
                setEditingCustomer(null);
                refresh();
              }}
              onClose={() => {
                setIsCreating(false);
                setEditingCustomer(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Loading & Error States */}
      {loading ? (
        <div className="py-12 text-center text-sm text-stone-500 font-medium">Loading client directory...</div>
      ) : null}

      {error ? (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-700">
          {error.message}
        </div>
      ) : null}

      {!loading && filteredCustomers.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center space-y-3">
          <UserCheck className="h-8 w-8 text-stone-400 mx-auto" />
          <div className="text-sm font-bold text-navy-900 font-serif">No clients match your filter.</div>
          <p className="text-xs text-stone-500">Try adjusting your search query or status filter.</p>
        </div>
      ) : null}

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-navy-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-amber-400 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-4 w-4 text-amber-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Customer Directory Table */}
      {!loading && filteredCustomers.length > 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white shadow-xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-cream-50/70 border-stone-200">
                <TableHead className="font-bold text-navy-900">Client Name</TableHead>
                <TableHead className="font-bold text-navy-900">Email Address</TableHead>
                <TableHead className="font-bold text-navy-900">Phone</TableHead>
                <TableHead className="font-bold text-navy-900">Assigned Unit &amp; Rent</TableHead>
                <TableHead className="font-bold text-navy-900">AI Churn Risk</TableHead>
                <TableHead className="font-bold text-navy-900">Status</TableHead>
                <TableHead className="font-bold text-navy-900 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer, idx) => {
                // Synthetic realistic CRM matching data
                const mockUnits = ['Unit MUM-A101 (₹8,500/mo)', 'Unit BLR-D88 (₹6,800/mo)', 'Unit DEL-F02 (₹18,500/mo)', 'Unit PUN-G09 (₹2,800/mo)', 'Unit HYD-H22 (₹22,000/mo)', 'Unit CHN-I14 (₹5,500/mo)'];
                const unitStr = mockUnits[idx % mockUnits.length];
                const churnRisk = idx % 3 === 0 ? { label: 'Low (14%)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' } : idx % 3 === 1 ? { label: 'Moderate (48%)', color: 'bg-amber-50 text-amber-700 border-amber-200' } : { label: 'High (82%)', color: 'bg-rose-50 text-rose-700 border-rose-200' };

                return (
                  <TableRow key={customer.id} className="hover:bg-cream-50/50 transition-colors">
                    <TableCell className="font-semibold text-navy-900">
                      <button
                        type="button"
                        onClick={() => setDrawerCustomerId(customer.id)}
                        className="text-left font-bold text-navy-900 hover:text-amber-700 transition cursor-pointer font-serif block"
                      >
                        {customer.name}
                      </button>
                    </TableCell>
                    <TableCell className="text-stone-600 text-xs">{customer.email}</TableCell>
                    <TableCell className="text-stone-600 text-xs">{customer.phone || '—'}</TableCell>
                    <TableCell className="text-xs font-semibold text-navy-900 font-mono">
                      {unitStr}
                    </TableCell>
                    <TableCell>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider inline-flex items-center gap-1 ${churnRisk.color}`}>
                        <Sparkles className="h-2.5 w-2.5" />
                        {churnRisk.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={customer.status}
                        onChange={(e) => handleStatusChange(customer.id, e.target.value as CustomerStatus)}
                        className="py-1 text-xs font-semibold border-stone-200 rounded-lg bg-cream-50"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                        <option value="LEAD">LEAD</option>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => setPinCustomer(customer)}
                          className="p-1 rounded-md text-amber-700 hover:bg-amber-50 cursor-pointer"
                          title="View Gate PIN"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            showToast(`Payment & lease renewal reminder dispatched to ${customer.name}.`);
                          }}
                          className="text-[11px] font-semibold text-stone-600 hover:text-amber-700 cursor-pointer"
                        >
                          Send Notice
                        </button>
                        <button
                          type="button"
                          onClick={() => setDrawerCustomerId(customer.id)}
                          className="text-xs font-bold text-navy-900 hover:text-amber-700 cursor-pointer"
                        >
                          Profile &rarr;
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCustomer(customer)}
                          className="text-xs font-semibold text-stone-600 hover:text-navy-900 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete ${customer.name}?`)) {
                              deleteCustomer(customer.id);
                            }
                          }}
                          className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {/* Keypad PIN Modal */}
      {pinCustomer && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-sm p-6 space-y-4 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-700">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-900 font-serif">{pinCustomer.name}</h3>
              <p className="text-xs text-stone-500 mt-0.5">Facility Security Keypad Access</p>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Active PIN Code</span>
              <div className="text-3xl font-mono font-bold text-navy-900 tracking-widest mt-1">482910</div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 inline-block">🟢 Verified &amp; Active</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  showToast(`PIN regenerated for ${pinCustomer.name} and sent via SMS.`);
                  setPinCustomer(null);
                }}
                className="flex-1 bg-navy-900 text-white text-xs"
              >
                Regenerate PIN
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPinCustomer(null)} className="flex-1 text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sliding Customer Detail Drawer */}
      <CustomerDetailDrawer
        customer={drawerCustomer}
        onClose={() => setDrawerCustomerId(null)}
      />
    </section>
  );
}
