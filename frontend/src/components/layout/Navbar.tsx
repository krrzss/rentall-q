'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/server/lib/supabaseClient';
import { LogOut } from 'lucide-react';

interface UserProfile {
  name: string;
  role: string;
  email?: string;
}

export function Navbar() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserProfile() {
      const supabase = createClient();
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          const demoRole = document.cookie
            .split('; ')
            .find((row) => row.startsWith('rentallq_demo_session='))
            ?.split('=')[1];

          if (demoRole) {
            setProfile({
              name: demoRole === 'BUSINESS_OWNER' ? 'Business Owner' : demoRole === 'MANAGER' ? 'Manager' : 'Staff',
              role: demoRole.replace('_', ' '),
              email: `${demoRole.toLowerCase()}@rentallq.com`,
            });
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
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    document.cookie = 'rentallq_demo_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error', err);
    }
    window.location.href = '/login';
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-stone-200 bg-white px-6 text-navy-900 shadow-xs">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          Management Portal
        </span>
      </div>

      <div className="flex items-center gap-4">
        {loading ? (
          <div className="h-8 w-32 animate-pulse rounded-lg bg-cream-200" />
        ) : profile ? (
          <div className="flex items-center gap-3">
            {/* Avatar Circle */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900/10 font-bold text-navy-900 text-xs shadow-xs border border-navy-200/60">
              {getInitials(profile.name)}
            </div>

            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-navy-900 leading-tight">
                {profile.name}
              </div>
              <div className="text-[10px] font-medium text-stone-500">
                {profile.role} &bull; {profile.email}
              </div>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleSignOut}
          title="Sign out"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-500 transition hover:bg-cream-100 hover:text-navy-900 focus:outline-none focus:ring-2 focus:ring-stone-200"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
