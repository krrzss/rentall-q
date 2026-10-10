import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business Portal Sign In | RentallQ',
  description: 'Sign in to the RentallQ Business Portal to manage your storage operations, bookings, and reports.',
};

export default function BusinessLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
