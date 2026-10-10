'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/server/lib/supabaseClient';
import {
  Building2,
  Calendar,
  CreditCard,
  Send,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function SmartDashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Client');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRole() {
      const supabase = createClient();
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, role')
            .eq('id', user.id)
            .maybeSingle();

          const resolvedRole = profile?.role || 'CLIENT';
          setRole(resolvedRole);
          setUserName(profile?.name || user.email?.split('@')[0] || 'Client');

          // If a business user lands on client dashboard, redirect to business portal
          if (resolvedRole === 'BUSINESS_OWNER' || resolvedRole === 'MANAGER' || resolvedRole === 'STAFF') {
            router.replace('/business/dashboard');
            return;
          }
        } else {
          setRole('CLIENT');
        }
      } catch (err) {
        setRole('CLIENT');
      } finally {
        setLoading(false);
      }
    }

    checkRole();
  }, [router]);

  if (loading) {
    return (
      <div className="space-y-6 text-navy-900 font-sans max-w-6xl animate-pulse">
        <div className="h-8 w-64 bg-stone-200 rounded-lg" />
        <div className="h-24 bg-stone-200 rounded-2xl" />
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="h-28 bg-stone-200 rounded-xl" />
          <div className="h-28 bg-stone-200 rounded-xl" />
          <div className="h-28 bg-stone-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-navy-900 font-sans max-w-6xl">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-amber-950 p-7 text-white shadow-xl border border-navy-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Client Self-Service Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif text-white">
            Welcome back, {userName}!
          </h1>
          <p className="text-xs sm:text-sm text-stone-300">
            Manage your storage subscriptions, review upcoming rent, or find and rent new spaces instantly.
          </p>
        </div>

        <Link href="/storage-spaces">
          <Button className="bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition flex items-center gap-2 shrink-0">
            <Building2 className="h-4 w-4" />
            <span>Browse Storage Spaces</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-5 border-stone-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Active Rentals
              </p>
              <p className="text-2xl font-bold text-navy-900 font-serif mt-1">1 Unit</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-3 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Unit 102 (Storage Locker)</span>
          </p>
        </Card>

        <Card className="p-5 border-stone-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Next Invoice Due
              </p>
              <p className="text-2xl font-bold text-navy-900 font-serif mt-1">₹2,500.00</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-3 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span>Due on Nov 01, 2026</span>
          </p>
        </Card>

        <Card className="p-5 border-stone-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Support &amp; Requests
              </p>
              <p className="text-2xl font-bold text-navy-900 font-serif mt-1">0 Pending</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
              <Send className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-3 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>All inquiries resolved</span>
          </p>
        </Card>
      </div>

      {/* Active Bookings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-navy-900 font-serif">
              My Active Bookings &amp; Leases
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Current storage units allocated to your client account.
            </p>
          </div>
          <Link href="/storage-spaces">
            <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5">
              <span>Add Another Space</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-stone-200 bg-white hover:border-amber-400 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Unit 102 — Storage Locker
              </span>
              <Badge variant="success" className="text-[10px] uppercase font-bold">
                ACTIVE
              </Badge>
            </div>
            <div className="space-y-2.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span className="text-stone-500">Facility Location:</span>
                <span className="font-semibold text-navy-900">Sector 42, Metro Hub</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Dimensions:</span>
                <span className="font-semibold text-navy-900">10ft x 10ft (100 sq ft)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Lease Period:</span>
                <span className="font-semibold text-navy-900">Jan 01, 2026 – Dec 31, 2026</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-stone-100">
                <span className="text-stone-500">Monthly Rate:</span>
                <span className="font-bold text-emerald-700 text-sm">₹2,500.00 / mo</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex gap-2">
              <Link href="/my-payments" className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                  Payment History
                </Button>
              </Link>
              <Link href="/request" className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                  Get Support
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
