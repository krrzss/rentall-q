'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Home,
  CreditCard,
  Building2,
  BarChart3,
  Settings,
  Crown,
  Briefcase,
  Wrench,
  BrainCircuit,
} from 'lucide-react';
import { createClient } from '@/server/lib/supabaseClient';

export function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<'BUSINESS_OWNER' | 'MANAGER' | 'STAFF' | null>(null);

  useEffect(() => {
    async function loadRole() {
      const supabase = createClient();
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          // No session — middleware should have redirected; show nothing
          setUserRole(null);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        setUserRole((profile?.role as any) ?? 'BUSINESS_OWNER');
      } catch (err) {
        console.error('Sidebar: failed to load role', err);
        setUserRole(null);
      }
    }

    loadRole();
  }, []);

  const allNavItems = [
    { label: 'Dashboard', href: '/business/dashboard', altHref: '/dashboard', icon: LayoutDashboard, roles: ['BUSINESS_OWNER', 'MANAGER', 'STAFF'] },
    { label: 'AI Business Advisor', href: '/business/ai-recommendations', altHref: '/ai-agents', icon: BrainCircuit, roles: ['BUSINESS_OWNER', 'MANAGER'] },
    { label: 'Bookings', href: '/business/bookings', altHref: '/bookings', icon: Calendar, roles: ['BUSINESS_OWNER', 'MANAGER', 'STAFF'] },
    { label: 'Clients', href: '/business/customers', altHref: '/customers', icon: Users, roles: ['BUSINESS_OWNER', 'MANAGER', 'STAFF'] },
    { label: 'Rental Units', href: '/business/rental-units', altHref: '/rental-units', icon: Home, roles: ['BUSINESS_OWNER', 'MANAGER', 'STAFF'] },
    { label: 'Payments', href: '/business/payments', altHref: '/payments', icon: CreditCard, roles: ['BUSINESS_OWNER', 'MANAGER', 'STAFF'] },
    { label: 'Companies', href: '/business/company-associated', altHref: '/company-associated', icon: Building2, roles: ['BUSINESS_OWNER'] },
    { label: 'Reports', href: '/business/reports', altHref: '/reports', icon: BarChart3, roles: ['BUSINESS_OWNER', 'MANAGER'] },
    { label: 'Settings & Billing', href: '/business/settings', altHref: '/settings', icon: Settings, roles: ['BUSINESS_OWNER'] },
  ];

  const visibleNavItems = allNavItems.filter((item) =>
    !userRole ? true : item.roles.includes(userRole)
  );

  const getRoleBadge = () => {
    switch (userRole) {
      case 'BUSINESS_OWNER':
        return { label: 'Business Owner', icon: Crown, color: 'text-amber-700 bg-amber-50 border-amber-200' };
      case 'MANAGER':
        return { label: 'Manager', icon: Briefcase, color: 'text-sky-700 bg-sky-50 border-sky-200' };
      case 'STAFF':
        return { label: 'Staff Member', icon: Wrench, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      default:
        return { label: 'Business Owner', icon: Crown, color: 'text-amber-700 bg-amber-50 border-amber-200' };
    }
  };

  const badge = getRoleBadge();
  const BadgeIcon = badge.icon;

  return (
    <aside className="w-64 flex-shrink-0 border-r border-stone-200 bg-white p-5 text-navy-900 flex flex-col justify-between min-h-screen font-sans">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 font-bold text-white shadow-md shadow-navy-200">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-navy-900 leading-tight font-serif">
                RentallQ
              </h1>
              <span className="text-[11px] font-medium text-stone-500">
                Business Portal
              </span>
            </div>
          </div>

          {/* User Role Badge */}
          <div className="px-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${badge.color}`}>
              <BadgeIcon className="h-3 w-3" />
              <span>{badge.label}</span>
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              pathname === item.altHref ||
              (item.href !== '/business/dashboard' && pathname?.startsWith(`${item.href}`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-800 font-semibold shadow-2xs border border-amber-200/50'
                    : 'text-stone-600 hover:bg-cream-100 hover:text-navy-900'
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive ? 'text-amber-600' : 'text-stone-400 group-hover:text-stone-600'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="border-t border-stone-100 pt-4 px-2 text-xs text-stone-400 font-medium space-y-1">
        <div>RentallQ Business &bull; 2026</div>
        <div className="text-[10px] text-stone-400 font-mono">RBAC: {userRole ?? '—'}</div>
      </div>
    </aside>
  );
}
