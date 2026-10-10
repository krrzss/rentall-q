'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, MessageCircle } from 'lucide-react';

interface FooterProps {
  onOpenTrialModal: () => void;
}

export function Footer({ onOpenTrialModal }: FooterProps) {
  return (
    <footer className="bg-navy-950 border-t border-navy-800 text-stone-400 py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-800 font-bold text-white shadow-sm">
              <Building2 className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tracking-tight font-serif">
                RentallQ
              </span>
              <span className="text-xs text-stone-500">
                Smart operations &amp; decision support for modern rental businesses.
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-stone-400">
            <button onClick={onOpenTrialModal} className="hover:text-amber-400 transition-colors cursor-pointer">
              Start Free Trial
            </button>
            <Link href="/login" className="hover:text-amber-400 transition-colors">
              Client Sign In
            </Link>
            <Link href="/business/login" className="hover:text-amber-400 transition-colors">
              Business Portal
            </Link>
          </div>
        </div>

        <div className="pt-6 text-center text-xs text-stone-500 font-medium">
          &copy; 2026 RentallQ. All rights reserved. Built for Self-Storage, Warehouses, Hostels, Parking &amp; Equipment Rentals.
        </div>
      </div>

      {/* Floating WhatsApp Action Button (Pulsing) */}
      <a
        href="https://wa.me/15551234567?text=Hi%20RentallQ,%20I'm%20interested%20in%20a%20demo%20or%20free%20trial!"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center h-12 w-12 rounded-full bg-emerald-600 text-white shadow-md hover:bg-emerald-700 hover:scale-105 transition-all group"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </footer>
  );
}
