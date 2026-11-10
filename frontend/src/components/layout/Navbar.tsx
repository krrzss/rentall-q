'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/server/lib/supabaseClient';
import {
  LogOut,
  Bell,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Building2,
  Calendar,
  X,
  ExternalLink,
  ShieldCheck,
  Wrench,
  LogOut as MoveOutIcon,
} from 'lucide-react';
import {
  PortalNotification,
  getBusinessNotifications,
  getPortalNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToPortalEvents,
} from '@/lib/realtimeSync';

interface UserProfile {
  name: string;
  role: string;
  email?: string;
  businessId?: string;
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Notification state
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [openNotifs, setOpenNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const isBusiness = pathname?.startsWith('/business');
  const isAdmin = pathname?.startsWith('/admin');
  const isClient = !isBusiness && !isAdmin;

  // Load user profile
  useEffect(() => {
    async function loadUserProfile() {
      // 1. If currently in the Business Portal, check for active warehouse session first
      if (pathname?.startsWith('/business')) {
        try {
          const sessionRes = await fetch('/api/auth/business-session');
          const sessionJson = await sessionRes.json();
          if (sessionJson.success && sessionJson.warehouse) {
            setProfile({
              name: sessionJson.warehouse.name || 'Warehouse Operations',
              role: sessionJson.warehouse.role || 'BUSINESS_OWNER',
              email: sessionJson.warehouse.email || 'operator@rentallq.com',
              businessId: sessionJson.warehouse.id,
            });
            setLoading(false);
            return;
          }
        } catch {
          // fallback
        }
      }

      const supabase = createClient();
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          // Check for active warehouse cookie session (Quick-login / Business session)
          try {
            const sessionRes = await fetch('/api/auth/business-session');
            const sessionJson = await sessionRes.json();
            if (sessionJson.success && sessionJson.warehouse) {
              setProfile({
                name: sessionJson.warehouse.name || 'Warehouse Operations',
                role: sessionJson.warehouse.role || 'BUSINESS_OWNER',
                email: sessionJson.warehouse.email || 'operator@rentallq.com',
                businessId: sessionJson.warehouse.id,
              });
              setLoading(false);
              return;
            }
          } catch {
            // fallback
          }

          if (typeof document !== 'undefined' && document.cookie.includes('rentallq_demo_session=CLIENT')) {
            setProfile({
              name: 'Tanisha Sharma',
              role: 'CLIENT',
              email: 'tanisha@rentallq.com',
            });
            setLoading(false);
            return;
          }

          setLoading(false);
          return;
        }

        // Fetch profile from public.profiles
        const { data } = await supabase
          .from('profiles')
          .select('name, role')
          .eq('id', user.id)
          .maybeSingle();

        if (data) {
          setProfile({
            name: data.name || user.user_metadata?.name || 'User',
            role: data.role || 'OWNER',
            email: user.email,
          });
        } else {
          setProfile({
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            role: 'OWNER',
            email: user.email,
          });
        }
      } catch (err) {
        console.error('Failed to load user profile', err);
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, [pathname]);

  // Load and subscribe to real-time notifications
  useEffect(() => {
    const refreshNotifications = () => {
      if (isBusiness) {
        setNotifications(getBusinessNotifications(profile?.businessId));
      } else {
        setNotifications(getPortalNotifications());
      }
    };

    refreshNotifications();

    // Subscribe to cross-tab & real-time events
    const unsubscribe = subscribeToPortalEvents(() => {
      refreshNotifications();
    });

    return () => {
      unsubscribe();
    };
  }, [isBusiness, profile?.businessId]);

  // Click outside listener for notification panel
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setOpenNotifs(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead(profile?.businessId);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notif: PortalNotification) => {
    markNotificationAsRead(notif.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setOpenNotifs(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error', err);
    }

    try {
      await fetch('/api/auth/business-session', { method: 'DELETE' });
    } catch (err) {
      console.warn('Business session clear error', err);
    }

    if (typeof document !== 'undefined') {
      document.cookie = 'rentallq_demo_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      document.cookie = 'rentallq_active_warehouse=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    }

    if (pathname?.startsWith('/admin')) {
      window.location.href = '/admin/login';
    } else if (pathname?.startsWith('/business')) {
      window.location.href = '/business/login';
    } else {
      window.location.href = '/login';
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const renderNotifIcon = (type: PortalNotification['type']) => {
    switch (type) {
      case 'NEW_BOOKING':
        return <Calendar className="h-4 w-4 text-emerald-600" />;
      case 'PAYMENT_RECEIVED':
        return <CreditCard className="h-4 w-4 text-amber-600" />;
      case 'MAINTENANCE_TICKET':
        return <Wrench className="h-4 w-4 text-rose-500" />;
      case 'MOVE_OUT_NOTICE':
        return <MoveOutIcon className="h-4 w-4 text-orange-500" />;
      default:
        return <Building2 className="h-4 w-4 text-sky-600" />;
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-stone-200 bg-white px-6 text-navy-900 shadow-xs relative z-30">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          {pathname?.startsWith('/admin')
            ? 'Super Admin Portal'
            : pathname?.startsWith('/business')
            ? 'Business Operational Command Center'
            : 'Client Tenant Portal'}
        </span>
        {isBusiness && profile?.name && (
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
            <Building2 className="h-3 w-3 text-amber-600" />
            <span className="truncate max-w-[220px]">{profile.name}</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* ── NOTIFICATION BELL (Business & Client) ── */}
        {!isAdmin && (
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setOpenNotifs((prev) => !prev)}
              aria-label="View notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 hover:text-navy-900 hover:bg-cream-100 transition cursor-pointer"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {openNotifs && (
              <div className="absolute right-0 top-11 w-80 sm:w-96 rounded-2xl border border-stone-200 bg-white shadow-2xl z-50 overflow-hidden">
                <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3 bg-stone-50/80">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy-900 text-sm">
                      {isBusiness ? 'Facility Live Alerts' : 'My Notifications'}
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-semibold text-sky-700 hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-[360px] overflow-y-auto divide-y divide-stone-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-stone-400">
                      No notifications right now.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3.5 flex items-start gap-3 transition cursor-pointer hover:bg-amber-50/40 ${
                          !notif.read ? 'bg-amber-50/20' : 'bg-white'
                        }`}
                      >
                        <div className="h-8 w-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                          {renderNotifIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-navy-900 truncate">
                              {notif.title}
                            </h4>
                            <span className="text-[10px] text-stone-400 shrink-0">
                              {notif.time}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 line-clamp-2 mt-0.5">
                            {notif.message}
                          </p>
                          {notif.amount && (
                            <span className="inline-block mt-1 text-[11px] font-bold text-emerald-700">
                              ₹{notif.amount.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        {!notif.read && (
                          <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 bg-stone-50 border-t border-stone-100 text-center">
                  <Link
                    href={isBusiness ? '/business/bookings' : '/my-bookings'}
                    onClick={() => setOpenNotifs(false)}
                    className="text-xs font-bold text-amber-800 hover:text-amber-900 inline-flex items-center gap-1"
                  >
                    <span>{isBusiness ? 'Open Bookings Command Center' : 'Manage My Active Bookings'}</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Profile */}
        {loading ? (
          <div className="h-8 w-32 animate-pulse rounded-lg bg-cream-200" />
        ) : profile ? (
          <div className="flex items-center gap-2.5">
            {/* Avatar Circle */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900/10 font-bold text-navy-900 text-xs shadow-xs border border-navy-200/60">
              {getInitials(profile.name)}
            </div>

            <div className="text-left hidden sm:block max-w-[180px]">
              <div className="text-xs font-bold text-navy-900 leading-tight truncate">
                {profile.name}
              </div>
              <div className="text-[10px] font-medium text-stone-500 truncate">
                {profile.role} &bull; {profile.email}
              </div>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleSignOut}
          title="Sign out"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-500 transition hover:bg-cream-100 hover:text-navy-900 focus:outline-none focus:ring-2 focus:ring-stone-200 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
