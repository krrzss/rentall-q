'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface NavbarProps {
  onOpenTrialModal: () => void;
}

export function Navbar({ onOpenTrialModal }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'AI Agents', href: '#ai-agents' },
    { label: 'Companies', href: '#companies' },
    { label: 'About', href: '#about' },
    { label: 'Blog', href: '#blog' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-xs border-b border-stone-200/80 h-14'
          : 'bg-cream-100/90 backdrop-blur-sm border-b border-transparent h-20'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 font-bold text-white transition-transform group-hover:scale-105 shadow-sm">
            <Building2 className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-navy-900 leading-none font-serif">
            RentallQ
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-stone-600 hover:text-navy-900 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="font-semibold text-navy-700">
              Client Sign In
            </Button>
          </Link>
          <Link href="/business/login">
            <Button variant="outline" size="sm" className="font-semibold text-navy-800 border-stone-300">
              Business Portal
            </Button>
          </Link>
          <Button
            onClick={onOpenTrialModal}
            variant="primary"
            size="sm"
            className="font-semibold bg-navy-900 text-white hover:bg-navy-800 shadow-sm"
          >
            Start free trial
          </Button>
        </div>

        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-stone-600 hover:text-navy-900 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-stone-200 bg-white px-4 pt-2 pb-6 space-y-4">
          <div className="flex flex-col space-y-3 pt-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-navy-700 hover:text-amber-600 py-1"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-4 border-t border-stone-100 flex flex-col gap-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" size="md" className="w-full justify-center font-semibold text-navy-700">
                Client Sign In
              </Button>
            </Link>
            <Link href="/business/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" size="md" className="w-full justify-center font-semibold text-navy-800 border-stone-300">
                Business Portal
              </Button>
            </Link>
            <Button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTrialModal();
              }}
              variant="primary"
              size="md"
              className="w-full justify-center bg-navy-900 text-white"
            >
              Start free trial
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
