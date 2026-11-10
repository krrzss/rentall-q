'use client';

import { useEffect, useState, useRef } from 'react';
import { Bell, Shield, ExternalLink, X, CheckCircle2, AlertTriangle, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface AdminNotification {
  id: string;
  type: 'business_request' | 'complaint' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  link: string;
}

// Realistic seed notifications (augmented by dynamic fetch in future)
const SEED_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'n1',
    type: 'business_request',
    title: 'New Business Application',
    message: 'Hindustan Cold Storage & Logistics has applied for onboarding.',
    time: '2 min ago',
    read: false,
    link: '/admin/dashboard/onboarding-requests',
  },
  {
    id: 'n2',
    type: 'complaint',
    title: 'Client Complaint Filed',
    message: 'Ravi Kumar filed a complaint against Metro Storage Solutions — gate access issue.',
    time: '18 min ago',
    read: false,
    link: '/admin/dashboard/client-complaints',
  },
  {
    id: 'n3',
    type: 'business_request',
    title: 'New Business Application',
    message: 'Urban Attic Self-Storage (Pune) submitted onboarding application.',
    time: '1 hr ago',
    read: false,
    link: '/admin/dashboard/onboarding-requests',
  },
  {
    id: 'n4',
    type: 'complaint',
    title: 'Business Complaint',
    message: 'Apex Logistics Hub reported duplicate booking conflict on Unit B-4.',
    time: '3 hr ago',
    read: true,
    link: '/admin/dashboard/business-complaints',
  },
  {
    id: 'n5',
    type: 'system',
    title: 'Platform Fee Updated',
    message: 'Platform commission rate was updated to 8.5% by admin@rentallq.com.',
    time: 'Yesterday',
    read: true,
    link: '/admin/dashboard/settings',
  },
];

const typeIcon = (type: AdminNotification['type']) => {
  switch (type) {
    case 'business_request': return <Shield className="h-3.5 w-3.5 text-amber-600" />;
    case 'complaint': return <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />;
    default: return <CheckCircle2 className="h-3.5 w-3.5 text-sky-500" />;
  }
};

export function AdminNavbar() {
  const [notifications, setNotifications] = useState<AdminNotification[]>(SEED_NOTIFICATIONS);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const dismiss = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-stone-200 bg-white px-6">
      {/* Left: breadcrumb hint */}
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-amber-600" />
        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
          Super Admin Console
        </span>
      </div>

      {/* Right: Bell + Admin badge */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white hover:bg-stone-50 transition-all shadow-xs"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-stone-600" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white leading-none">
                {unread}
              </span>
            )}
          </button>

          {/* Dropdown Panel */}
          {open && (
            <div className="absolute right-0 top-11 w-96 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-bold text-navy-900">Notifications</span>
                  {unread > 0 && (
                    <span className="text-[10px] font-bold bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full">
                      {unread} new
                    </span>
                  )}
                </div>
                <button
                  onClick={markAllRead}
                  className="text-[11px] text-amber-600 font-semibold hover:underline"
                >
                  Mark all read
                </button>
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-stone-50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-400">
                    <MessageSquare className="h-6 w-6 mx-auto mb-2 text-stone-300" />
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-stone-50 transition-all ${
                        !n.read ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0 h-6 w-6 rounded-full bg-stone-100 flex items-center justify-center">
                        {typeIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold text-navy-900 ${!n.read ? 'font-bold' : ''}`}>
                          {n.title}
                        </p>
                        <p className="text-[11px] text-stone-500 leading-relaxed mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-stone-400 mt-1">{n.time}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        <Link
                          href={n.link}
                          onClick={() => { markRead(n.id); setOpen(false); }}
                          className="p-1 rounded hover:bg-amber-100 text-amber-600 transition-all"
                          title="Open"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => dismiss(n.id)}
                          className="p-1 rounded hover:bg-rose-50 text-stone-400 hover:text-rose-500 transition-all"
                          title="Dismiss"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-stone-100 px-4 py-2.5">
                <Link
                  href="/admin/dashboard/client-complaints"
                  onClick={() => setOpen(false)}
                  className="text-[11px] font-semibold text-amber-600 hover:underline"
                >
                  View all complaints →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Admin Identity */}
        <div className="flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5">
          <div className="h-5 w-5 rounded-full bg-navy-900 flex items-center justify-center">
            <Shield className="h-3 w-3 text-amber-400" />
          </div>
          <span className="text-xs font-semibold text-navy-900">Super Admin</span>
        </div>
      </div>
    </header>
  );
}

