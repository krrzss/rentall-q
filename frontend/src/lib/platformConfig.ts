/**
 * RentAll-Q Super Admin Platform Configuration
 * Single source of truth for financial rates, platform fees, and enterprise metadata.
 */

export const PLATFORM_CONFIG = {
  name: 'RentAll-Q Enterprise',
  currency: 'INR',
  currencySymbol: '₹',
  defaultCommissionRate: 0.085, // 8.5% platform commission
  gstRate: 0.18, // 18% GST standard in India
  invoicePrefix: 'RQ-INV-2026-',
  supportEmail: 'admin@rentallq.com',
  emergencyPhone: '+91 1800 200 4499',
  headquarters: 'Bandra-Kurla Complex (BKC), Mumbai, Maharashtra 400051',
  citiesSupported: ['Mumbai', 'Bengaluru', 'Delhi NCR', 'Pune', 'Hyderabad', 'Chennai'],
} as const;

export function formatInr(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

