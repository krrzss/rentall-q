// Real-Time Cross-Portal Sync & Notification Bus for RentAll-Q
// Connects Client Portal, Business Portal, and Admin Portal

export type PortalEventType =
  | 'NEW_BOOKING'
  | 'PAYMENT_RECEIVED'
  | 'MAINTENANCE_TICKET'
  | 'MOVE_OUT_NOTICE'
  | 'GATE_ACCESS_LOG'
  | 'UNIT_STATUS_CHANGED';

export interface PortalNotification {
  id: string;
  type: PortalEventType;
  title: string;
  message: string;
  time: string;
  timestamp: number;
  read: boolean;
  link: string;
  businessId?: string;
  businessName?: string;
  clientName?: string;
  unitCode?: string;
  amount?: number;
}

const STORAGE_KEY = 'rentallq_cross_portal_notifications';
const CHANNEL_NAME = 'rentallq_sync_bus';

// Initial seed notifications so business portal starts with realistic state
const DEFAULT_BUSINESS_NOTIFICATIONS: PortalNotification[] = [
  {
    id: 'n-biz-01',
    type: 'NEW_BOOKING',
    title: 'New Unit Booking Confirmed',
    message: 'Amit Sharma booked Unit #MUM-A101 (10x10 Climate) for ₹8,500/mo.',
    time: '5 min ago',
    timestamp: Date.now() - 5 * 60 * 1000,
    read: false,
    link: '/business/bookings',
    businessId: 'b1000000-0000-0000-0000-000000000001',
    businessName: 'Hindustan Cold Storage & Logistics',
    clientName: 'Amit Sharma',
    unitCode: 'MUM-A101',
    amount: 8500,
  },
  {
    id: 'n-biz-02',
    type: 'PAYMENT_RECEIVED',
    title: 'Rent Payment Cleared',
    message: '₹25,000 received via UPI for Unit #MUM-B201 (Kabir Khan).',
    time: '28 min ago',
    timestamp: Date.now() - 28 * 60 * 1000,
    read: false,
    link: '/business/payments',
    businessId: 'b1000000-0000-0000-0000-000000000001',
    businessName: 'Hindustan Cold Storage & Logistics',
    clientName: 'Kabir Khan',
    unitCode: 'MUM-B201',
    amount: 25000,
  },
  {
    id: 'n-biz-03',
    type: 'MAINTENANCE_TICKET',
    title: 'Unit Maintenance Ticket',
    message: 'Unit #BLR-D88: Priya Verma reported rolling shutter stiff on entry.',
    time: '1 hr ago',
    timestamp: Date.now() - 60 * 60 * 1000,
    read: true,
    link: '/business/rental-units',
    businessId: 'b2000000-0000-0000-0000-000000000002',
    businessName: 'Urban Attic Self-Storage',
    clientName: 'Priya Verma',
    unitCode: 'BLR-D88',
  },
];

// Get all notifications from localStorage
export function getPortalNotifications(): PortalNotification[] {
  if (typeof window === 'undefined') return DEFAULT_BUSINESS_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BUSINESS_NOTIFICATIONS));
      return DEFAULT_BUSINESS_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_BUSINESS_NOTIFICATIONS;
  }
}

// Get notifications filtered for a specific business warehouse
export function getBusinessNotifications(businessId?: string): PortalNotification[] {
  const all = getPortalNotifications();
  if (!businessId) return all;
  // Match direct ID or legacy alias mapping
  return all.filter(
    (n) => !n.businessId || n.businessId === businessId || n.businessId.slice(-4) === businessId.slice(-4)
  );
}

// Add a new notification and broadcast to all tabs
export function addPortalNotification(
  notif: Omit<PortalNotification, 'id' | 'timestamp' | 'read' | 'time'>
): PortalNotification {
  const newNotif: PortalNotification = {
    ...notif,
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: Date.now(),
    time: 'Just now',
    read: false,
  };

  if (typeof window !== 'undefined') {
    try {
      const all = getPortalNotifications();
      all.unshift(newNotif);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all.slice(0, 50))); // Keep latest 50

      // Broadcast to other open browser tabs
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel(CHANNEL_NAME);
        bc.postMessage({ type: 'NEW_NOTIFICATION', notification: newNotif });
        bc.close();
      }
    } catch (e) {
      console.warn('Notification save error', e);
    }
  }

  return newNotif;
}

// Mark a single notification as read
export function markNotificationAsRead(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getPortalNotifications();
    const updated = all.map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Mark read error', e);
  }
}

// Mark all as read
export function markAllNotificationsAsRead(businessId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getPortalNotifications();
    const updated = all.map((n) => {
      if (!businessId || n.businessId === businessId || n.businessId?.slice(-4) === businessId?.slice(-4)) {
        return { ...n, read: true };
      }
      return n;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Mark all read error', e);
  }
}

// Subscribe to real-time events across windows/tabs
export function subscribeToPortalEvents(
  callback: (notif: PortalNotification) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  let bc: BroadcastChannel | null = null;

  if ('BroadcastChannel' in window) {
    bc = new BroadcastChannel(CHANNEL_NAME);
    bc.onmessage = (event) => {
      if (event.data?.type === 'NEW_NOTIFICATION' && event.data.notification) {
        callback(event.data.notification);
      }
    };
  }

  // Also listen for storage event for cross-tab sync
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed) && parsed.length > 0) {
          callback(parsed[0]);
        }
      } catch {
        // ignore
      }
    }
  };

  window.addEventListener('storage', handleStorage);

  return () => {
    if (bc) bc.close();
    window.removeEventListener('storage', handleStorage);
  };
}

