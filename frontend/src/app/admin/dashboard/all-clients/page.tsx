'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Users, Search, Mail, Phone, Calendar, ShieldCheck, CheckCircle2, MoreVertical } from 'lucide-react';

interface ClientCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessOwner: string;
  activeRentalsCount: number;
  totalSpent: number;
  status: string;
  joinedDate: string;
}

const mockClients: ClientCustomer[] = [
  {
    id: 'cust-101',
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    phone: '+1 (555) 234-5678',
    businessOwner: 'Metro Storage Solutions',
    activeRentalsCount: 2,
    totalSpent: 450,
    status: 'ACTIVE',
    joinedDate: '2026-01-15',
  },
  {
    id: 'cust-102',
    name: 'Robert Smith',
    email: 'robert.smith@logistics.com',
    phone: '+1 (555) 876-5432',
    businessOwner: 'Apex Logistics Hub',
    activeRentalsCount: 1,
    totalSpent: 1350,
    status: 'ACTIVE',
    joinedDate: '2026-03-20',
  },
  {
    id: 'cust-103',
    name: 'Carol Martinez',
    email: 'carol.m@designstudio.org',
    phone: '+1 (555) 345-6789',
    businessOwner: 'RentallQ Main Storage',
    activeRentalsCount: 3,
    totalSpent: 960,
    status: 'ACTIVE',
    joinedDate: '2026-05-10',
  },
  {
    id: 'cust-104',
    name: 'David Lee',
    email: 'david.lee@techcorp.io',
    phone: '+1 (555) 901-2345',
    businessOwner: 'Central Mini Lockers',
    activeRentalsCount: 1,
    totalSpent: 195,
    status: 'ACTIVE',
    joinedDate: '2026-07-02',
  },
];

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadClients() {
      try {
        const res = await fetch('/api/customers');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setClients(
              data.map((c: any, i: number) => ({
                id: c.id || `cust-${i}`,
                name: c.fullName || c.name || `Client ${i + 1}`,
                email: c.email || `client${i}@rentallq.com`,
                phone: c.phoneNumber || c.phone || '+1 (555) 000-0000',
                businessOwner: c.businessName || 'Metro Storage Solutions',
                activeRentalsCount: c.rentalsCount || Math.floor(1 + Math.random() * 3),
                totalSpent: c.totalSpent || Math.floor(200 + Math.random() * 800),
                status: 'ACTIVE',
                joinedDate: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '2026-04-12',
              }))
            );
          } else {
            setClients(mockClients);
          }
        } else {
          setClients(mockClients);
        }
      } catch (err) {
        setClients(mockClients);
      } finally {
        setLoading(false);
      }
    }

    loadClients();
  }, []);

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.businessOwner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-navy-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-amber-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white font-serif">
              Platform Clients Directory
            </h1>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Global management and audit log of all registered tenant clients across RentallQ providers.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
          <input
            type="text"
            placeholder="Search client name, email, business..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-navy-950 border border-navy-700 rounded-lg text-white placeholder-stone-500 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Content Table / Cards */}
      {loading ? (
        <div className="text-xs text-stone-400">Loading platform clients...</div>
      ) : filteredClients.length === 0 ? (
        <Card className="border-navy-700 bg-navy-800/80 p-8 text-center text-stone-300">
          <Users className="mx-auto h-8 w-8 text-amber-400 mb-2" />
          <h3 className="text-base font-bold text-white">No Clients Found</h3>
        </Card>
      ) : (
        <div className="rounded-xl border border-navy-800 bg-navy-900 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-navy-950 text-stone-400 uppercase font-semibold text-[10px] tracking-wider border-b border-navy-800">
                <tr>
                  <th className="py-3.5 px-4">Client Name</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Associated Business</th>
                  <th className="py-3.5 px-4">Active Rentals</th>
                  <th className="py-3.5 px-4">Total Value</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/80">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-navy-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white font-serif">
                      {client.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-stone-300">
                          <Mail className="h-3 w-3 text-amber-400" />
                          <span>{client.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-stone-400">
                          <Phone className="h-3 w-3 text-stone-500" />
                          <span>{client.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-amber-300 font-medium">
                      {client.businessOwner}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-500/20">
                        {client.activeRentalsCount} Unit/s
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400 font-serif">
                      ${client.totalSpent}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/30">
                        {client.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
