'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  Calendar,
  CreditCard,
  Settings,
  Shield,
  Users,
  Layers,
  ClipboardList,
  MessageSquareWarning,
  HeadphonesIcon,
  LogOut,
} from 'lucide-react';
import { createClient } from '@/server/lib/supabaseClient';

const adminNavItems = [
  {
    section: 'Main',
    items: [
      { label: 'Overview & Businesses', href: '/admin/dashboard', icon: Shield },
      { label: 'Onboarding Requests', href: '/admin/dashboard/onboarding-requests', icon: ClipboardList, badge: 'new' },
    ],
  },
  {
    section: 'Platform Data',
    items: [
      { label: 'Storage Inventory', href: '/admin/dashboard/all-storage-spaces', icon: Layers },
      { label: 'Platform Bookings', href: '/admin/dashboard/all-bookings', icon: Calendar },
      { label: 'Platform Clients', href: '/admin/dashboard/all-clients', icon: Users },
      { label: 'Financials & Payouts ₹', href: '/admin/dashboard/all-payments', icon: CreditCard },
    ],
  },
  {
    section: 'Support',
    items: [
      { label: 'Business Complaints', href: '/admin/dashboard/business-complaints', icon: MessageSquareWarning },
      { label: 'Client Complaints', href: '/admin/dashboard/client-complaints', icon: HeadphonesIcon },
    ],
  },
  {
    section: 'System',
    items: [
      { label: 'Platform Settings', href: '/admin/dashboard/settings', icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  const isActive = (href: string) =>
    href === '/admin/dashboard'
      ? pathname === '/admin/dashboard'
      : pathname?.startsWith(href);

  return (
    <aside className="w-64 flex-shrink-0 border-r border-stone-200 bg-white text-navy-900 flex flex-col justify-between min-h-screen font-sans">
      {/* Brand */}
      <div>
        <div className="p-5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 shadow-sm">
              <Shield className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-navy-900 leading-tight font-serif">
                RentAll-Q
              </h1>
              <span className="text-[11px] font-semibold text-amber-600">
                Super Admin Portal
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-5">
          {adminNavItems.map((section) => (
            <div key={section.section}>
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                {section.section}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                        active
                          ? 'bg-amber-500/10 text-amber-700 font-semibold'
                          : 'text-stone-600 hover:bg-stone-50 hover:text-navy-900'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon
                          className={`h-4 w-4 ${active ? 'text-amber-600' : 'text-stone-400'}`}
                        />
                        <span>{item.label}</span>
                      </span>
                      {(item as any).badge === 'new' && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500 text-white">
                          NEW
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-stone-100">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
        <p className="mt-3 px-3 text-[10px] text-stone-400 font-medium">
          RentAll-Q Super Admin · v2.0
        </p>
      </div>
    </aside>
  );
}
