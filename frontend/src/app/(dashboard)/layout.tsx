'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ClientSidebar } from '@/components/layout/ClientSidebar';
import { Navbar } from '@/components/layout/Navbar';
import { createClient } from '@/server/lib/supabaseClient';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function checkRole() {
      const supabase = createClient();
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setRole(null);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        setRole(profile?.role ?? null);
      } catch (err) {
        console.error('DashboardLayout: failed to load role', err);
        setRole(null);
      }
    }

    checkRole();
  }, []);

  const isBusinessRole = role && role !== 'CLIENT';

  return (
    <div className="flex min-h-screen bg-cream-100 text-navy-900 font-sans antialiased">
      {isBusinessRole ? <Sidebar /> : <ClientSidebar />}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
