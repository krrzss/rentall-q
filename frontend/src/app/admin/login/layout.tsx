import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Console | RentallQ',
  description: 'RentallQ platform administration.',
  robots: 'noindex, nofollow',
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
