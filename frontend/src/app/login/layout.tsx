import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | RentallQ',
  description: 'Sign in to your RentallQ account to manage your storage rentals and bookings.',
};

export default function ClientLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
