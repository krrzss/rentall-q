'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Calendar, CreditCard, Settings, Shield, Users, Layers } from 'lucide-react';

const adminNavItems = [
  { label: 'Business Owners', href: '/admin/dashboard', icon: Building2 },
  { label: 'Storage Spaces', href: '/admin/dashboard/all-storage-spaces', icon: Layers },
  { label: 'Clients', href: '/admin/dashboard/all-clients', icon: Users },
  { label: 'All Bookings', href: '/admin/dashboard/all-bookings', icon: Calendar },
  { label: 'All Payments', href: '/admin/dashboard/all-payments', icon: CreditCard },
  { label: 'Platform Settings', href: '/admin/dashboard/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-stone-200 bg-white p-5 text-navy-900 flex flex-col justify-between min-h-screen">
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 font-bold text-amber-400 shadow-sm">
            <Shield className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-navy-900 leading-tight font-serif">
              Admin Portal
            </h1>
            <span className="text-[11px] font-semibold text-amber-600">
              RentAll-Q Super Admin
            </span>
          </div>
        </div>

        <nav className="space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin/dashboard' && pathname?.startsWith(`${item.href}`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-700 font-semibold shadow-xs'
                    : 'text-stone-600 hover:bg-cream-200 hover:text-navy-900'
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

      <div className="border-t border-stone-100 pt-4 px-2 text-xs text-stone-400 font-medium">
        RentallQ Super Admin &bull; v1.0
      </div>
    </aside>
  );
}
