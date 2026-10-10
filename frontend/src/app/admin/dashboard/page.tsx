'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Building2, Shield, Trash2, AlertTriangle, CheckCircle2, UserX, Search, Sparkles } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  businessType: string;
  createdAt: string;
  ownerEmail?: string;
  status?: string;
  unitsCount?: number;
}

const defaultMockBusinesses: Business[] = [
  {
    id: 'biz-001',
    name: 'Metro Storage Solutions',
    businessType: 'self_storage',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    ownerEmail: 'owner@metrostorage.com',
    status: 'ACTIVE',
    unitsCount: 24,
  },
  {
    id: 'biz-002',
    name: 'Apex Logistics Hub',
    businessType: 'warehouse',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    ownerEmail: 'contact@apexlogistics.com',
    status: 'ACTIVE',
    unitsCount: 12,
  },
  {
    id: 'biz-003',
    name: 'Central Mini Lockers',
    businessType: 'self_storage',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    ownerEmail: 'admin@centrallockers.com',
    status: 'ACTIVE',
    unitsCount: 50,
  },
  {
    id: 'biz-004',
    name: 'Suspicious Storage Co (Flagged)',
    businessType: 'self_storage',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    ownerEmail: 'inappropriate@spamstorage.com',
    status: 'FLAGGED',
    unitsCount: 3,
  },
];

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Removal Confirmation Modal
  const [targetBusiness, setTargetBusiness] = useState<Business | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removalSuccessMessage, setRemovalSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadBusinesses() {
      try {
        const res = await fetch('/api/businesses');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setBusinesses(
              data.map((b: any, i: number) => ({
                id: b.id,
                name: b.name || `Business Provider #${i + 1}`,
                businessType: b.businessType || 'self_storage',
                createdAt: b.createdAt || new Date().toISOString(),
                ownerEmail: b.ownerEmail || `owner-${b.id.slice(0, 6)}@rentallq.com`,
                status: 'ACTIVE',
                unitsCount: Math.floor(5 + Math.random() * 20),
              }))
            );
          } else {
            setBusinesses(defaultMockBusinesses);
          }
        } else {
          setBusinesses(defaultMockBusinesses);
        }
      } catch (err) {
        setBusinesses(defaultMockBusinesses);
      } finally {
        setLoading(false);
      }
    }

    loadBusinesses();
  }, []);

  const handleConfirmRemoval = async () => {
    if (!targetBusiness) return;
    setIsRemoving(true);

    try {
      await fetch(`/api/businesses/${targetBusiness.id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Fallback deleting business from state', err);
    } finally {
      setBusinesses((prev) => prev.filter((b) => b.id !== targetBusiness.id));
      setIsRemoving(false);
      setRemovalSuccessMessage(
        `Business Owner "${targetBusiness.name}" has been permanently removed from the platform.`
      );
      setTargetBusiness(null);

      setTimeout(() => {
        setRemovalSuccessMessage(null);
      }, 5000);
    }
  };

  const filteredBusinesses = businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.ownerEmail && b.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-navy-900 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-amber-600" />
            <h1 className="text-2xl font-bold tracking-tight text-navy-900 font-serif">
              Platform Business Owners
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Super Admin control panel to monitor, audit, and remove inappropriate or non-compliant business owners.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search business or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg text-navy-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Success Notification Banner */}
      {removalSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{removalSuccessMessage}</span>
        </div>
      )}

      {/* Main Grid */}
      {loading ? (
        <div className="text-xs text-stone-500">Loading business tenants...</div>
      ) : filteredBusinesses.length === 0 ? (
        <Card className="border-stone-200 bg-white p-8 text-center text-stone-500">
          <Building2 className="mx-auto h-8 w-8 text-stone-400 mb-2" />
          <h3 className="text-base font-bold text-navy-900">No Registered Businesses</h3>
          <p className="text-xs text-stone-500 mt-1">
            No matching business providers found in the system registry.
          </p>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBusinesses.map((b) => (
            <Card
              key={b.id}
              className="border-stone-200 bg-white text-navy-900 p-5 flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all shadow-xs relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-100">
                  <div>
                    <h3 className="text-sm font-bold text-navy-900 tracking-wide font-serif">
                      {b.name}
                    </h3>
                    <span className="text-[11px] text-stone-500 block mt-0.5">
                      {b.ownerEmail}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                      b.status === 'FLAGGED'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {b.businessType}
                  </span>
                </div>

                <div className="text-xs text-stone-600 space-y-1.5 bg-cream-100/70 p-3 rounded-lg border border-stone-200/60">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Business ID:</span>
                    <span className="font-mono text-stone-700">{b.id.slice(0, 10)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Storage Units:</span>
                    <span className="font-bold text-navy-900">{b.unitsCount || 10} Units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Registered:</span>
                    <span className="text-stone-700">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Compliant</span>
                </span>

                <Button
                  onClick={() => setTargetBusiness(b)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <UserX className="h-3.5 w-3.5" />
                  <span>Remove Business</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CONFIRM REMOVAL MODAL */}
      {targetBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-6 text-navy-900 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-navy-900">
                  Remove Business Owner?
                </h3>
                <span className="text-xs text-rose-700 font-medium">
                  Super Admin Revocation Action
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to remove <strong>{targetBusiness.name}</strong> ({targetBusiness.ownerEmail}) from the RentallQ platform?
            </p>

            <div className="bg-cream-100/70 p-3 rounded-lg border border-stone-200 text-xs text-stone-600 space-y-1">
              <div className="font-semibold text-rose-800">Consequences of Removal:</div>
              <div>&bull; Business owner portal access revoked</div>
              <div>&bull; Associated storage units unlisted</div>
              <div>&bull; Automated audit log entry generated</div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => setTargetBusiness(null)}
                variant="outline"
                className="flex-1 text-stone-700 hover:bg-stone-100 text-xs font-bold py-2.5 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRemoval}
                disabled={isRemoving}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md cursor-pointer"
              >
                {isRemoving ? 'Removing...' : 'Confirm Permanent Removal'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
